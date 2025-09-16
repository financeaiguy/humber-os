import { Env, SendNotificationRequest, NotificationType, NotificationChannel } from '@humber/types';

// SendGrid Email Service
class EmailService {
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string = 'noreply@humber-operations.com') {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
  }

  async sendEmail(to: string, subject: string, htmlContent: string, textContent?: string): Promise<boolean> {
    // Demo mode - simulate email sending
    if (this.apiKey === 'demo_key' || this.apiKey.startsWith('SG.dummy')) {
      console.log(`📧 DEMO EMAIL SENT:
        To: ${to}
        Subject: ${subject}
        Content: ${textContent || htmlContent.substring(0, 100)}...`);
      return true;
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: to }],
            subject: subject
          }],
          from: { email: this.fromEmail, name: 'Humber Operations' },
          content: [
            {
              type: 'text/html',
              value: htmlContent
            },
            ...(textContent ? [{
              type: 'text/plain',
              value: textContent
            }] : [])
          ]
        })
      });

      return response.ok;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }

  async sendBulkEmail(emails: Array<{ to: string; subject: string; htmlContent: string; textContent?: string }>): Promise<boolean[]> {
    const results = await Promise.allSettled(
      emails.map(email => this.sendEmail(email.to, email.subject, email.htmlContent, email.textContent))
    );

    return results.map(result => result.status === 'fulfilled' ? result.value : false);
  }
}

// Twilio SMS Service
class SMSService {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    // Demo mode - simulate SMS sending
    if (this.accountSid === 'demo_sid' || this.accountSid.startsWith('ACdummy')) {
      console.log(`📱 DEMO SMS SENT:
        To: ${to}
        From: ${this.fromNumber}
        Message: ${message}`);
      return true;
    }

    try {
      const auth = btoa(`${this.accountSid}:${this.authToken}`);
      
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: this.fromNumber,
          To: to,
          Body: message
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Twilio SMS error:', error);
      return false;
    }
  }

  async sendBulkSMS(messages: Array<{ to: string; message: string }>): Promise<boolean[]> {
    const results = await Promise.allSettled(
      messages.map(msg => this.sendSMS(msg.to, msg.message))
    );

    return results.map(result => result.status === 'fulfilled' ? result.value : false);
  }
}

// Notification Templates
const EMAIL_TEMPLATES = {
  TIMESHEET_SUBMITTED: {
    subject: '⏰ Timesheet Submitted - {{engineerName}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Timesheet Submitted</h1>
        </div>
        <div style="padding: 20px; background: #f8f9fa;">
          <p>Hello,</p>
          <p><strong>{{engineerName}}</strong> has submitted their timesheet for the period:</p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Period:</strong> {{startDate}} - {{endDate}}</p>
            <p><strong>Total Hours:</strong> {{totalHours}}</p>
            <p><strong>Status:</strong> <span style="color: #28a745;">Pending Review</span></p>
          </div>
          <p>Please review and approve the timesheet in the Humber Operations dashboard.</p>
          <a href="{{dashboardUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0;">Review Timesheet</a>
          <p style="color: #6c757d; font-size: 12px; margin-top: 20px;">
            This is an automated message from Humber Operations. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
    text: 'Timesheet submitted by {{engineerName}} for {{startDate}} - {{endDate}}. Total hours: {{totalHours}}. Please review in the dashboard.'
  },
  DISCREPANCY_DETECTED: {
    subject: '⚠️ Timesheet Discrepancy Alert - {{engineerName}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #fd7e14 0%, #dc3545 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">⚠️ Discrepancy Alert</h1>
        </div>
        <div style="padding: 20px; background: #f8f9fa;">
          <p>Hello,</p>
          <p>A timesheet discrepancy has been detected for <strong>{{engineerName}}</strong>:</p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc3545;">
            <p><strong>Date:</strong> {{date}}</p>
            <p><strong>Humber Hours:</strong> {{humberHours}}</p>
            <p><strong>Client Hours:</strong> {{clientHours}}</p>
            <p><strong>Difference:</strong> <span style="color: #dc3545;">{{difference}} hours</span></p>
          </div>
          <p>This discrepancy requires immediate attention and resolution.</p>
          <a href="{{dashboardUrl}}" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0;">Resolve Discrepancy</a>
        </div>
      </div>
    `,
    text: 'Timesheet discrepancy detected for {{engineerName}} on {{date}}. Humber: {{humberHours}}h, Client: {{clientHours}}h, Difference: {{difference}}h. Please resolve immediately.'
  },
  COMPLIANCE_VIOLATION: {
    subject: '🚨 URGENT: Compliance Violation Detected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #6f1616 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🚨 COMPLIANCE VIOLATION</h1>
        </div>
        <div style="padding: 20px; background: #f8f9fa;">
          <p><strong>URGENT ATTENTION REQUIRED</strong></p>
          <p>A compliance violation has been detected in the system:</p>
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107;">
            <p><strong>Violation Type:</strong> {{violationType}}</p>
            <p><strong>Description:</strong> {{description}}</p>
            <p><strong>Detected At:</strong> {{timestamp}}</p>
            <p><strong>Affected User:</strong> {{affectedUser}}</p>
          </div>
          <p style="color: #dc3545;"><strong>Immediate action is required to maintain compliance.</strong></p>
          <a href="{{dashboardUrl}}" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0;">Take Action</a>
        </div>
      </div>
    `,
    text: 'URGENT: Compliance violation detected. Type: {{violationType}}. Description: {{description}}. Immediate action required.'
  }
};

const SMS_TEMPLATES = {
  TIMESHEET_SUBMITTED: 'Humber Operations: {{engineerName}} submitted timesheet ({{totalHours}}h). Review needed.',
  DISCREPANCY_DETECTED: 'ALERT: Timesheet discrepancy for {{engineerName}} - {{difference}}h difference. Action required.',
  COMPLIANCE_VIOLATION: 'URGENT: Compliance violation detected - {{violationType}}. Immediate action required.',
  SHIFT_REMINDER: 'Reminder: Your shift starts in 30 minutes at {{location}}. Clock in using biometric verification.',
  OVERTIME_ALERT: 'Notice: {{engineerName}} approaching overtime ({{hours}}h today). Consider break or end shift.'
};

// Main Notification Service
export class NotificationService {
  private emailService: EmailService;
  private smsService: SMSService;
  private env: Env;

  constructor(env: Env) {
    this.env = env;
    this.emailService = new EmailService(env.SENDGRID_API_KEY || 'demo_key');
    this.smsService = new SMSService(
      env.TWILIO_ACCOUNT_SID || 'demo_sid',
      env.TWILIO_AUTH_TOKEN || 'demo_token',
      env.TWILIO_FROM_NUMBER || '+15551234567'
    );
  }

  // Template rendering helper
  private renderTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  // Send single notification
  async sendNotification(request: SendNotificationRequest): Promise<boolean> {
    const results: boolean[] = [];

    for (const channel of request.channels) {
      switch (channel) {
        case 'EMAIL':
          if (request.emails && request.emails.length > 0) {
            const template = EMAIL_TEMPLATES[request.type as keyof typeof EMAIL_TEMPLATES];
            if (template) {
              const subject = this.renderTemplate(template.subject, request.templateData || {});
              const htmlContent = this.renderTemplate(template.html, request.templateData || {});
              const textContent = this.renderTemplate(template.text, request.templateData || {});

              for (const email of request.emails) {
                const success = await this.emailService.sendEmail(email, subject, htmlContent, textContent);
                results.push(success);
                
                // Store notification in database
                await this.storeNotification({
                  type: request.type,
                  channel: 'EMAIL',
                  email,
                  subject,
                  message: textContent,
                  htmlContent,
                  status: success ? 'SENT' : 'FAILED',
                  tenantId: request.tenantId
                });
              }
            }
          }
          break;

        case 'SMS':
          if (request.phoneNumbers && request.phoneNumbers.length > 0) {
            const template = SMS_TEMPLATES[request.type as keyof typeof SMS_TEMPLATES];
            if (template) {
              const message = this.renderTemplate(template, request.templateData || {});

              for (const phoneNumber of request.phoneNumbers) {
                const success = await this.smsService.sendSMS(phoneNumber, message);
                results.push(success);
                
                // Store notification in database
                await this.storeNotification({
                  type: request.type,
                  channel: 'SMS',
                  phoneNumber,
                  subject: `SMS: ${request.type}`,
                  message,
                  status: success ? 'SENT' : 'FAILED',
                  tenantId: request.tenantId
                });
              }
            }
          }
          break;
      }
    }

    return results.every(result => result);
  }

  // Store notification in database
  private async storeNotification(data: {
    type: NotificationType;
    channel: NotificationChannel;
    email?: string;
    phoneNumber?: string;
    subject: string;
    message: string;
    htmlContent?: string;
    status: 'SENT' | 'FAILED';
    tenantId: string;
  }): Promise<void> {
    try {
      const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: data.type,
        channel: data.channel,
        priority: 'MEDIUM' as const,
        status: data.status,
        userId: 'system',
        email: data.email,
        phoneNumber: data.phoneNumber,
        subject: data.subject,
        message: data.message,
        htmlContent: data.htmlContent,
        tenantId: data.tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
        sentAt: new Date()
      };

      // Insert into database (we'll create the table in migrations)
      await this.env.DB.prepare(`
        INSERT INTO notifications (
          id, type, channel, priority, status, user_id, email, phone_number,
          subject, message, html_content, tenant_id, created_at, updated_at, sent_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        notification.id,
        notification.type,
        notification.channel,
        notification.priority,
        notification.status,
        notification.userId,
        notification.email,
        notification.phoneNumber,
        notification.subject,
        notification.message,
        notification.htmlContent,
        notification.tenantId,
        notification.createdAt.toISOString(),
        notification.updatedAt.toISOString(),
        notification.sentAt.toISOString()
      ).run();
    } catch (error) {
      console.error('Failed to store notification:', error);
    }
  }

  // Quick notification helpers
  async notifyTimesheetSubmitted(engineerName: string, totalHours: number, emails: string[], phones: string[] = []): Promise<boolean> {
    return this.sendNotification({
      type: 'TIMESHEET_SUBMITTED',
      channels: ['EMAIL', ...(phones.length > 0 ? ['SMS' as const] : [])],
      emails,
      phoneNumbers: phones,
      subject: `Timesheet Submitted - ${engineerName}`,
      message: `${engineerName} submitted timesheet (${totalHours}h)`,
      templateData: {
        engineerName,
        totalHours,
        startDate: new Date().toLocaleDateString(),
        endDate: new Date().toLocaleDateString(),
        dashboardUrl: 'https://app.humber-operations.com/timesheets'
      },
      tenantId: 'default',
      priority: 'MEDIUM'
    });
  }

  async notifyDiscrepancyDetected(engineerName: string, difference: number, emails: string[], phones: string[] = []): Promise<boolean> {
    return this.sendNotification({
      type: 'DISCREPANCY_DETECTED',
      channels: ['EMAIL', 'SMS'],
      emails,
      phoneNumbers: phones,
      subject: `Timesheet Discrepancy - ${engineerName}`,
      message: `Discrepancy detected for ${engineerName}`,
      templateData: {
        engineerName,
        difference,
        date: new Date().toLocaleDateString(),
        humberHours: 8,
        clientHours: 8 - difference,
        dashboardUrl: 'https://app.humber-operations.com/discrepancies'
      },
      tenantId: 'default',
      priority: 'MEDIUM'
    });
  }

  async notifyComplianceViolation(violationType: string, description: string, emails: string[], phones: string[] = []): Promise<boolean> {
    return this.sendNotification({
      type: 'COMPLIANCE_VIOLATION',
      channels: ['EMAIL', 'SMS'],
      priority: 'CRITICAL',
      emails,
      phoneNumbers: phones,
      subject: 'URGENT: Compliance Violation Detected',
      message: `Compliance violation: ${violationType}`,
      templateData: {
        violationType,
        description,
        timestamp: new Date().toLocaleString(),
        affectedUser: 'System',
        dashboardUrl: 'https://app.humber-operations.com/compliance'
      },
      tenantId: 'default'
    });
  }
}
