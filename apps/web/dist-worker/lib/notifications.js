import { logger } from './monitoring';
export class NotificationService {
    constructor() {
        this.notificationQueue = [];
        this.isProcessing = false;
        this.initializeServices();
    }
    static getInstance() {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }
    initializeServices() {
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            this.twilioConfig = {
                accountSid: process.env.TWILIO_ACCOUNT_SID,
                authToken: process.env.TWILIO_AUTH_TOKEN,
                fromNumber: process.env.TWILIO_FROM_NUMBER || '',
                messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
            };
        }
        if (process.env.SENDGRID_API_KEY) {
            this.sendGridConfig = {
                apiKey: process.env.SENDGRID_API_KEY,
                fromEmail: process.env.SENDGRID_FROM_EMAIL || 'notifications@humber.com',
                fromName: process.env.SENDGRID_FROM_NAME || 'Humber OS',
                templateIds: {
                    clockIn: process.env.SENDGRID_TEMPLATE_CLOCK_IN,
                    clockOut: process.env.SENDGRID_TEMPLATE_CLOCK_OUT,
                    anomalyAlert: process.env.SENDGRID_TEMPLATE_ANOMALY,
                    dailySummary: process.env.SENDGRID_TEMPLATE_DAILY,
                    weeklyReport: process.env.SENDGRID_TEMPLATE_WEEKLY,
                },
            };
        }
    }
    async sendSMS(notification) {
        if (!this.twilioConfig) {
            logger.warn('Twilio not configured, skipping SMS', { notification });
            return;
        }
        try {
            const twilioClient = require('twilio')(this.twilioConfig.accountSid, this.twilioConfig.authToken);
            const messageOptions = {
                body: notification.message,
                to: notification.to,
                from: this.twilioConfig.messagingServiceSid || this.twilioConfig.fromNumber,
            };
            const message = await twilioClient.messages.create(messageOptions);
            await logger.info('SMS sent successfully', {
                action: 'send_sms',
                messageId: message.sid,
                to: notification.to,
                metadata: notification.metadata,
            });
        }
        catch (error) {
            await logger.error('Failed to send SMS', error, {
                action: 'send_sms_error',
                to: notification.to,
                metadata: notification.metadata,
            });
            throw error;
        }
    }
    async sendEmail(notification) {
        if (!this.sendGridConfig) {
            logger.warn('SendGrid not configured, skipping email', { notification });
            return;
        }
        try {
            const sgMail = require('@sendgrid/mail');
            sgMail.setApiKey(this.sendGridConfig.apiKey);
            const recipients = Array.isArray(notification.to) ? notification.to : [notification.to];
            const msg = {
                to: recipients,
                from: {
                    email: this.sendGridConfig.fromEmail,
                    name: this.sendGridConfig.fromName,
                },
                subject: notification.subject,
                text: notification.text,
                html: notification.html,
                templateId: notification.templateId,
                dynamicTemplateData: notification.templateData,
                attachments: notification.attachments,
            };
            await sgMail.send(msg);
            await logger.info('Email sent successfully', {
                action: 'send_email',
                to: recipients,
                subject: notification.subject,
                templateId: notification.templateId,
            });
        }
        catch (error) {
            await logger.error('Failed to send email', error, {
                action: 'send_email_error',
                to: notification.to,
                subject: notification.subject,
            });
            throw error;
        }
    }
    async sendPushNotification(notification) {
        try {
            await logger.info('Push notification queued', {
                action: 'send_push',
                userId: notification.userId,
                title: notification.title,
                data: notification.data,
            });
        }
        catch (error) {
            await logger.error('Failed to send push notification', error, {
                action: 'send_push_error',
                userId: notification.userId,
            });
            throw error;
        }
    }
    async processTimeTrackingEvent(event) {
        const notifications = [];
        const recipients = this.getRecipientsForEvent(event);
        if (recipients.sms.length > 0) {
            const smsMessage = this.formatSMSMessage(event);
            recipients.sms.forEach(number => {
                notifications.push(this.sendSMS({
                    to: number,
                    message: smsMessage,
                    priority: event.type === 'anomaly' ? 'high' : 'normal',
                    metadata: {
                        eventType: event.type,
                        employeeId: event.employeeId,
                        timestamp: event.timestamp,
                    },
                }));
            });
        }
        if (recipients.email.length > 0) {
            const emailContent = this.formatEmailContent(event);
            notifications.push(this.sendEmail({
                to: recipients.email,
                subject: emailContent.subject,
                html: emailContent.html,
                templateId: this.getTemplateId(event.type),
                templateData: {
                    employeeName: event.employeeName,
                    timestamp: event.timestamp.toISOString(),
                    location: event.location?.address || 'Unknown',
                    trustScore: event.trustScore,
                    anomalies: event.anomalies,
                    ...event.metadata,
                },
            }));
        }
        if (recipients.push.length > 0) {
            const pushContent = this.formatPushContent(event);
            recipients.push.forEach(userId => {
                notifications.push(this.sendPushNotification({
                    userId,
                    title: pushContent.title,
                    body: pushContent.body,
                    data: {
                        eventType: event.type,
                        employeeId: event.employeeId,
                        timestamp: event.timestamp.toISOString(),
                    },
                }));
            });
        }
        await Promise.allSettled(notifications);
    }
    getRecipientsForEvent(event) {
        const recipients = {
            sms: [],
            email: [],
            push: [],
        };
        switch (event.type) {
            case 'anomaly':
            case 'geofence_violation':
                recipients.sms = ['+1-555-0100', '+1-555-0101'];
                recipients.email = ['manager@humber.com', 'hr@humber.com'];
                recipients.push = ['manager-001', 'hr-001'];
                break;
            case 'overtime':
                recipients.email = ['hr@humber.com', 'payroll@humber.com'];
                recipients.push = ['hr-001'];
                break;
            case 'clock_in':
            case 'clock_out':
                recipients.sms = ['+1-555-0100'];
                recipients.email = ['timesheet@humber.com'];
                break;
        }
        return recipients;
    }
    formatSMSMessage(event) {
        const time = event.timestamp.toLocaleTimeString();
        const location = event.location?.address?.split(',')[0] || 'Unknown';
        switch (event.type) {
            case 'clock_in':
                return `${event.employeeName} clocked in at ${time} from ${location}. Trust: ${event.trustScore}%`;
            case 'clock_out':
                return `${event.employeeName} clocked out at ${time} from ${location}. Trust: ${event.trustScore}%`;
            case 'anomaly':
                return `⚠️ ANOMALY: ${event.employeeName} - ${event.anomalies?.join(', ')} at ${time}. Review required.`;
            case 'geofence_violation':
                return `📍 LOCATION: ${event.employeeName} outside approved zone at ${time}. Location: ${location}`;
            case 'overtime':
                return `⏰ OVERTIME: ${event.employeeName} exceeded regular hours at ${time}. Approval needed.`;
            default:
                return `Time tracking event: ${event.type} for ${event.employeeName} at ${time}`;
        }
    }
    formatEmailContent(event) {
        const subject = this.getEmailSubject(event);
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="color: white; margin: 0;">Humber OS - Time Tracking Alert</h2>
        </div>
        <div style="background: #f7f7f7; padding: 20px;">
          <h3 style="color: #333;">${event.type.replace('_', ' ').toUpperCase()}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Employee:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${event.employeeName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Time:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${event.timestamp.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Location:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${event.location?.address || 'Not available'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Trust Score:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                <span style="color: ${event.trustScore && event.trustScore >= 90 ? '#10b981' : event.trustScore && event.trustScore >= 75 ? '#f59e0b' : '#ef4444'};">
                  ${event.trustScore || 'N/A'}%
                </span>
              </td>
            </tr>
            ${event.anomalies && event.anomalies.length > 0 ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Anomalies:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #ef4444;">
                ${event.anomalies.join(', ')}
              </td>
            </tr>
            ` : ''}
          </table>
          ${event.type === 'anomaly' || event.type === 'geofence_violation' ? `
          <div style="margin-top: 20px; padding: 15px; background: #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px;">
            <strong style="color: #ef4444;">Action Required:</strong>
            <p style="margin: 5px 0; color: #7f1d1d;">Please review this event in the Humber OS dashboard and take appropriate action.</p>
          </div>
          ` : ''}
        </div>
        <div style="background: #333; color: #999; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="margin: 0; font-size: 12px;">
            This is an automated notification from Humber OS Time Tracking System.<br>
            © 2025 Humber Operations. All rights reserved.
          </p>
        </div>
      </div>
    `;
        return { subject, html };
    }
    getEmailSubject(event) {
        switch (event.type) {
            case 'clock_in':
                return `✅ Clock In: ${event.employeeName} - ${event.timestamp.toLocaleTimeString()}`;
            case 'clock_out':
                return `🏁 Clock Out: ${event.employeeName} - ${event.timestamp.toLocaleTimeString()}`;
            case 'anomaly':
                return `⚠️ ANOMALY DETECTED: ${event.employeeName} - Review Required`;
            case 'geofence_violation':
                return `📍 LOCATION ALERT: ${event.employeeName} Outside Approved Zone`;
            case 'overtime':
                return `⏰ OVERTIME ALERT: ${event.employeeName} - Approval Needed`;
            default:
                return `Time Tracking Event: ${event.type} - ${event.employeeName}`;
        }
    }
    formatPushContent(event) {
        const title = event.type.replace('_', ' ').toUpperCase();
        let body = '';
        switch (event.type) {
            case 'clock_in':
            case 'clock_out':
                body = `${event.employeeName} at ${event.timestamp.toLocaleTimeString()}`;
                break;
            case 'anomaly':
                body = `Anomaly detected for ${event.employeeName}. Review required.`;
                break;
            case 'geofence_violation':
                body = `${event.employeeName} is outside the approved zone.`;
                break;
            case 'overtime':
                body = `${event.employeeName} has exceeded regular hours.`;
                break;
        }
        return { title, body };
    }
    getTemplateId(eventType) {
        if (!this.sendGridConfig?.templateIds)
            return undefined;
        switch (eventType) {
            case 'clock_in':
                return this.sendGridConfig.templateIds.clockIn;
            case 'clock_out':
                return this.sendGridConfig.templateIds.clockOut;
            case 'anomaly':
            case 'geofence_violation':
                return this.sendGridConfig.templateIds.anomalyAlert;
            default:
                return undefined;
        }
    }
    async processNotificationQueue() {
        if (this.isProcessing || this.notificationQueue.length === 0) {
            return;
        }
        this.isProcessing = true;
        const batch = this.notificationQueue.splice(0, 10);
        try {
            await Promise.allSettled(batch.map(notification => {
                if ('message' in notification) {
                    return this.sendSMS(notification);
                }
                else if ('subject' in notification) {
                    return this.sendEmail(notification);
                }
                else {
                    return this.sendPushNotification(notification);
                }
            }));
        }
        finally {
            this.isProcessing = false;
            if (this.notificationQueue.length > 0) {
                setTimeout(() => this.processNotificationQueue(), 1000);
            }
        }
    }
}
export const notificationService = NotificationService.getInstance();
//# sourceMappingURL=notifications.js.map