import { z } from 'zod';

// Notification Types
export const NotificationTypeSchema = z.enum([
  'TIMESHEET_SUBMITTED',
  'TIMESHEET_APPROVED',
  'TIMESHEET_REJECTED',
  'DISCREPANCY_DETECTED',
  'COMPLIANCE_VIOLATION',
  'ENGINEER_DEPLOYED',
  'BACKGROUND_CHECK_COMPLETE',
  'DOCUMENT_UPLOADED',
  'SYSTEM_ALERT',
  'PAYMENT_PROCESSED',
  'SHIFT_REMINDER',
  'OVERTIME_ALERT'
]);

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

// Notification Channels
export const NotificationChannelSchema = z.enum([
  'EMAIL',
  'SMS',
  'PUSH',
  'IN_APP',
  'SLACK',
  'TEAMS'
]);

export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;

// Notification Priority
export const NotificationPrioritySchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
]);

export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;

// Notification Status
export const NotificationStatusSchema = z.enum([
  'PENDING',
  'SENT',
  'DELIVERED',
  'FAILED',
  'CANCELLED'
]);

export type NotificationStatus = z.infer<typeof NotificationStatusSchema>;

// Base Notification Schema
export const NotificationSchema = z.object({
  id: z.string(),
  type: NotificationTypeSchema,
  channel: NotificationChannelSchema,
  priority: NotificationPrioritySchema,
  status: NotificationStatusSchema,
  
  // Recipients
  userId: z.string(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  
  // Content
  subject: z.string(),
  message: z.string(),
  htmlContent: z.string().optional(),
  templateId: z.string().optional(),
  
  // Metadata
  data: z.record(z.any()).optional(),
  scheduledAt: z.date().optional(),
  sentAt: z.date().optional(),
  deliveredAt: z.date().optional(),
  
  // Tracking
  tenantId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Notification = z.infer<typeof NotificationSchema>;

// Notification Template Schema
export const NotificationTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: NotificationTypeSchema,
  channel: NotificationChannelSchema,
  
  // Template Content
  subject: z.string(),
  bodyTemplate: z.string(),
  htmlTemplate: z.string().optional(),
  
  // Variables
  variables: z.array(z.string()),
  
  // Settings
  isActive: z.boolean(),
  tenantId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type NotificationTemplate = z.infer<typeof NotificationTemplateSchema>;

// Notification Settings Schema
export const NotificationSettingsSchema = z.object({
  userId: z.string(),
  tenantId: z.string(),
  
  // Channel Preferences
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
  
  // Type Preferences
  preferences: z.record(NotificationTypeSchema, z.object({
    enabled: z.boolean(),
    channels: z.array(NotificationChannelSchema),
    priority: NotificationPrioritySchema
  })),
  
  // Quiet Hours
  quietHoursEnabled: z.boolean(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  quietHoursTimezone: z.string().optional(),
  
  createdAt: z.date(),
  updatedAt: z.date()
});

export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;

// Send Notification Request Schema
export const SendNotificationRequestSchema = z.object({
  type: NotificationTypeSchema,
  channels: z.array(NotificationChannelSchema),
  priority: NotificationPrioritySchema.optional().default('MEDIUM'),
  
  // Recipients
  userIds: z.array(z.string()).optional(),
  emails: z.array(z.string().email()).optional(),
  phoneNumbers: z.array(z.string()).optional(),
  
  // Content
  subject: z.string(),
  message: z.string(),
  templateId: z.string().optional(),
  templateData: z.record(z.any()).optional(),
  
  // Scheduling
  scheduledAt: z.date().optional(),
  
  // Metadata
  tenantId: z.string()
});

export type SendNotificationRequest = z.infer<typeof SendNotificationRequestSchema>;

// Bulk Notification Request Schema
export const BulkNotificationRequestSchema = z.object({
  notifications: z.array(SendNotificationRequestSchema),
  tenantId: z.string()
});

export type BulkNotificationRequest = z.infer<typeof BulkNotificationRequestSchema>;

// Notification Analytics Schema
export const NotificationAnalyticsSchema = z.object({
  tenantId: z.string(),
  dateRange: z.object({
    start: z.date(),
    end: z.date()
  }),
  
  // Metrics
  totalSent: z.number(),
  totalDelivered: z.number(),
  totalFailed: z.number(),
  deliveryRate: z.number(),
  
  // By Channel
  byChannel: z.record(NotificationChannelSchema, z.object({
    sent: z.number(),
    delivered: z.number(),
    failed: z.number(),
    deliveryRate: z.number()
  })),
  
  // By Type
  byType: z.record(NotificationTypeSchema, z.object({
    sent: z.number(),
    delivered: z.number(),
    failed: z.number()
  })),
  
  // By Priority
  byPriority: z.record(NotificationPrioritySchema, z.object({
    sent: z.number(),
    delivered: z.number(),
    failed: z.number()
  }))
});

export type NotificationAnalytics = z.infer<typeof NotificationAnalyticsSchema>;
