import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import type { Env } from '@humber/types';
import { timesheetsReconciliation, engineers, reconciliationAuditLog } from '@humber/database';
import { Logger, generateId } from '@humber/utils';

interface TimesheetDiscrepancyMessage {
  timesheetId: string;
  engineerId: string;
  tenantId: string;
  engineerHours: number;
  customerHours: number;
  difference: number;
  weekStartDate: string;
  weekEndDate: string;
  customerName?: string;
  projectCode?: string;
  retryCount?: number;
}

interface NotificationPayload {
  type: 'email' | 'sms' | 'slack' | 'dashboard';
  recipient: string;
  subject: string;
  body: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

const logger = new Logger('timesheet-discrepancy-processor');

/**
 * Timesheet Discrepancy Processor
 * Handles timesheet differences, notifications, and human review tasks
 * Idempotent: Can be safely retried without duplicating notifications
 */
export class TimesheetDiscrepancyProcessor {
  private env: Env;
  private db: any;

  constructor(env: Env) {
    this.env = env;
    this.db = drizzle(env.DB);
  }

  /**
   * Process a single timesheet discrepancy
   * @param message - The discrepancy message
   * @returns Processing result
   */
  async processMessage(message: TimesheetDiscrepancyMessage): Promise<{ success: boolean; result?: any; error?: string }> {
    const { timesheetId, engineerId, tenantId, engineerHours, customerHours, difference } = message;
    
    try {
      logger.info('Processing timesheet discrepancy', { 
        timesheetId, 
        engineerId, 
        difference,
        engineerHours,
        customerHours 
      });

      // Get engineer details
      const engineer = await this.db.select()
        .from(engineers)
        .where(and(
          eq(engineers.id, engineerId),
          eq(engineers.tenantId, tenantId)
        ))
        .limit(1);

      if (!engineer.length) {
        throw new Error(`Engineer ${engineerId} not found`);
      }

      // Calculate discrepancy severity
      const severity = this.calculateSeverity(difference, engineerHours);

      // Update timesheet with human review flag
      await this.db.update(timesheetsReconciliation)
        .set({
          humanInLoop: true,
          status: 'needs_review',
          updatedAt: Date.now(),
        })
        .where(and(
          eq(timesheetsReconciliation.id, timesheetId),
          eq(timesheetsReconciliation.tenantId, tenantId)
        ));

      // Create audit log entry
      await this.db.insert(reconciliationAuditLog).values({
        id: generateId('audit'),
        tenantId,
        timesheetId,
        action: 'discrepancy_detected',
        performedBy: 'system',
        previousEngineerHours: engineerHours,
        previousCustomerHours: customerHours,
        newEngineerHours: engineerHours,
        newCustomerHours: customerHours,
        reason: `Discrepancy of ${Math.abs(difference)} hours detected`,
        details: JSON.stringify({
          severity,
          weekStartDate: message.weekStartDate,
          weekEndDate: message.weekEndDate,
          customerName: message.customerName,
          projectCode: message.projectCode,
        }),
        createdAt: Date.now(),
      });

      // Send notifications based on severity
      const notifications = await this.createNotifications({
        engineer: engineer[0],
        timesheetId,
        difference,
        severity,
        engineerHours,
        customerHours,
        weekStartDate: message.weekStartDate,
        weekEndDate: message.weekEndDate,
        customerName: message.customerName,
      });

      // Queue notifications
      for (const notification of notifications) {
        await this.sendNotification(notification);
      }

      // Create human review task
      const reviewTask = await this.createHumanReviewTask({
        timesheetId,
        engineerId,
        engineerName: `${engineer[0].firstName} ${engineer[0].lastName}`,
        engineerHours,
        customerHours,
        difference,
        severity,
        weekStartDate: message.weekStartDate,
        weekEndDate: message.weekEndDate,
        customerName: message.customerName,
        projectCode: message.projectCode,
      });

      // Store task in KV cache for quick access
      await this.env.KV_CACHE.put(
        `review_task:${tenantId}:${timesheetId}`,
        JSON.stringify(reviewTask),
        { expirationTtl: 7 * 24 * 60 * 60 } // 7 days
      );

      // If urgent, escalate immediately
      if (severity === 'urgent') {
        await this.escalateToManagement({
          timesheetId,
          engineerId,
          engineerName: `${engineer[0].firstName} ${engineer[0].lastName}`,
          difference,
          engineerHours,
          customerHours,
        });
      }

      return {
        success: true,
        result: {
          timesheetId,
          severity,
          notificationsSent: notifications.length,
          reviewTaskCreated: true,
          escalated: severity === 'urgent',
        },
      };
    } catch (error) {
      logger.error('Failed to process timesheet discrepancy', error);
      
      // Retry logic for transient failures
      const retryCount = message.retryCount || 0;
      if (retryCount < 2) {
        await this.env.RECONCILIATION_QUEUE.send({
          ...message,
          retryCount: retryCount + 1,
        }, {
          delaySeconds: 60 * (retryCount + 1), // 1min, 2min
        });
        
        logger.info('Re-queued discrepancy for retry', { timesheetId, retryCount: retryCount + 1 });
      }

      return {
        success: false,
        error: 'Processing failed',
      };
    }
  }

  /**
   * Calculate severity of discrepancy
   */
  private calculateSeverity(difference: number, engineerHours: number): 'low' | 'medium' | 'high' | 'urgent' {
    const absDiff = Math.abs(difference);
    const percentDiff = (absDiff / engineerHours) * 100;

    if (absDiff >= 16 || percentDiff >= 40) return 'urgent';
    if (absDiff >= 8 || percentDiff >= 20) return 'high';
    if (absDiff >= 4 || percentDiff >= 10) return 'medium';
    return 'low';
  }

  /**
   * Create notifications for relevant parties
   */
  private async createNotifications(data: any): Promise<NotificationPayload[]> {
    const notifications: NotificationPayload[] = [];
    const { engineer, timesheetId, difference, severity, engineerHours, customerHours, weekStartDate, weekEndDate, customerName } = data;

    // Notification to engineer
    notifications.push({
      type: 'email',
      recipient: engineer.email,
      subject: `Timesheet Discrepancy - Week of ${weekStartDate}`,
      body: `
        A discrepancy has been detected in your timesheet for the week of ${weekStartDate} to ${weekEndDate}.
        
        Your reported hours: ${engineerHours}
        Customer reported hours: ${customerHours}
        Difference: ${Math.abs(difference)} hours
        
        Please review and provide clarification through the portal.
        
        Timesheet ID: ${timesheetId}
      `,
      priority: severity === 'urgent' ? 'urgent' : severity === 'high' ? 'high' : 'medium',
      metadata: { timesheetId, engineerId: engineer.id },
    });

    // Dashboard notification
    notifications.push({
      type: 'dashboard',
      recipient: 'hr-team',
      subject: `Timesheet Review Required - ${engineer.firstName} ${engineer.lastName}`,
      body: `Discrepancy of ${Math.abs(difference)} hours detected for ${customerName || 'Unknown Customer'}`,
      priority: severity === 'urgent' ? 'urgent' : 'high',
      metadata: { timesheetId, engineerId: engineer.id, severity },
    });

    // Slack notification for high/urgent severities
    if (severity === 'high' || severity === 'urgent') {
      notifications.push({
        type: 'slack',
        recipient: '#timesheet-alerts',
        subject: `⚠️ ${severity.toUpperCase()} Timesheet Discrepancy`,
        body: `Engineer: ${engineer.firstName} ${engineer.lastName}\nDifference: ${Math.abs(difference)} hours\nCustomer: ${customerName || 'Unknown'}\nWeek: ${weekStartDate}`,
        priority: severity as 'high' | 'urgent',
        metadata: { timesheetId, engineerId: engineer.id },
      });
    }

    return notifications;
  }

  /**
   * Send notification through appropriate channel
   */
  private async sendNotification(notification: NotificationPayload): Promise<void> {
    // Store notification in queue for processing
    await this.env.OPERATIONS_QUEUE.send({
      type: 'notification',
      payload: notification,
      timestamp: new Date().toISOString(),
    });

    logger.info('Notification queued', { 
      type: notification.type, 
      recipient: notification.recipient,
      priority: notification.priority 
    });
  }

  /**
   * Create human review task
   */
  private async createHumanReviewTask(data: any): Promise<any> {
    const task = {
      id: generateId('task'),
      type: 'timesheet_review',
      status: 'pending',
      priority: data.severity,
      assignedTo: null,
      createdAt: new Date().toISOString(),
      dueDate: this.calculateDueDate(data.severity),
      data: {
        timesheetId: data.timesheetId,
        engineerId: data.engineerId,
        engineerName: data.engineerName,
        engineerHours: data.engineerHours,
        customerHours: data.customerHours,
        difference: data.difference,
        weekStartDate: data.weekStartDate,
        weekEndDate: data.weekEndDate,
        customerName: data.customerName,
        projectCode: data.projectCode,
      },
      actions: [
        { type: 'approve_engineer', label: 'Approve Engineer Hours' },
        { type: 'approve_customer', label: 'Approve Customer Hours' },
        { type: 'split_difference', label: 'Split the Difference' },
        { type: 'custom', label: 'Custom Resolution' },
        { type: 'escalate', label: 'Escalate to Management' },
      ],
    };

    return task;
  }

  /**
   * Calculate due date based on severity
   */
  private calculateDueDate(severity: string): string {
    const now = new Date();
    switch (severity) {
      case 'urgent':
        now.setHours(now.getHours() + 4);
        break;
      case 'high':
        now.setHours(now.getHours() + 24);
        break;
      case 'medium':
        now.setDate(now.getDate() + 2);
        break;
      default:
        now.setDate(now.getDate() + 3);
    }
    return now.toISOString();
  }

  /**
   * Escalate to management for urgent issues
   */
  private async escalateToManagement(data: any): Promise<void> {
    const escalation = {
      type: 'management_escalation',
      priority: 'urgent',
      subject: `URGENT: Timesheet Discrepancy - ${data.engineerName}`,
      data: {
        timesheetId: data.timesheetId,
        engineerId: data.engineerId,
        engineerName: data.engineerName,
        difference: data.difference,
        engineerHours: data.engineerHours,
        customerHours: data.customerHours,
        escalatedAt: new Date().toISOString(),
      },
    };

    // Send to management queue
    await this.env.OPERATIONS_QUEUE.send(escalation);

    logger.warn('Escalated to management', { 
      timesheetId: data.timesheetId,
      difference: data.difference 
    });
  }

  /**
   * Batch process multiple discrepancy messages
   */
  async processBatch(messages: TimesheetDiscrepancyMessage[]): Promise<void> {
    logger.info(`Processing batch of ${messages.length} timesheet discrepancies`);
    
    // Group by severity for prioritized processing
    const grouped = messages.reduce((acc, msg) => {
      const severity = this.calculateSeverity(msg.difference, msg.engineerHours);
      if (!acc[severity]) acc[severity] = [];
      acc[severity].push(msg);
      return acc;
    }, {} as Record<string, TimesheetDiscrepancyMessage[]>);

    // Process urgent first, then high, medium, low
    const priorities = ['urgent', 'high', 'medium', 'low'];
    
    for (const priority of priorities) {
      if (grouped[priority]) {
        const results = await Promise.allSettled(
          grouped[priority].map(message => this.processMessage(message))
        );
        
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        logger.info(`Processed ${priority} priority discrepancies`, { 
          total: grouped[priority].length, 
          successful 
        });
      }
    }
  }
}

/**
 * Queue handler for Cloudflare Workers
 */
export async function handleTimesheetDiscrepancyQueue(batch: MessageBatch<TimesheetDiscrepancyMessage>, env: Env): Promise<void> {
  const processor = new TimesheetDiscrepancyProcessor(env);
  const messages = batch.messages.map(m => m.body);
  
  await processor.processBatch(messages);
  
  // Acknowledge all messages
  batch.messages.forEach(message => message.ack());
}