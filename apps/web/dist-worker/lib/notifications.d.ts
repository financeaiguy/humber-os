export interface SMSNotification {
    to: string;
    message: string;
    priority?: 'high' | 'normal' | 'low';
    metadata?: Record<string, any>;
}
export interface EmailNotification {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    templateId?: string;
    templateData?: Record<string, any>;
    attachments?: Array<{
        filename: string;
        content: string;
        type: string;
    }>;
}
export interface PushNotification {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    badge?: number;
    sound?: string;
}
export interface TimeTrackingEvent {
    type: 'clock_in' | 'clock_out' | 'anomaly' | 'overtime' | 'geofence_violation';
    employeeId: string;
    employeeName: string;
    timestamp: Date;
    location?: {
        lat: number;
        lng: number;
        address?: string;
    };
    trustScore?: number;
    anomalies?: string[];
    metadata?: Record<string, any>;
}
export declare class NotificationService {
    private static instance;
    private twilioConfig?;
    private sendGridConfig?;
    private notificationQueue;
    private isProcessing;
    private constructor();
    static getInstance(): NotificationService;
    private initializeServices;
    sendSMS(notification: SMSNotification): Promise<void>;
    sendEmail(notification: EmailNotification): Promise<void>;
    sendPushNotification(notification: PushNotification): Promise<void>;
    processTimeTrackingEvent(event: TimeTrackingEvent): Promise<void>;
    private getRecipientsForEvent;
    private formatSMSMessage;
    private formatEmailContent;
    private getEmailSubject;
    private formatPushContent;
    private getTemplateId;
    processNotificationQueue(): Promise<void>;
}
export declare const notificationService: NotificationService;
//# sourceMappingURL=notifications.d.ts.map