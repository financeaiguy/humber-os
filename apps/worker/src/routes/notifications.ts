import { Hono } from 'hono';
import { Env, SendNotificationRequest, BulkNotificationRequest, NotificationSettings } from '@humber/types';
import { NotificationService } from '../lib/notification-service';

const notificationsRouter = new Hono<{ Bindings: Env }>();

// Send single notification
notificationsRouter.post('/send', async (c) => {
  try {
    const request = await c.req.json() as SendNotificationRequest;
    const notificationService = new NotificationService(c.env);
    
    const success = await notificationService.sendNotification(request);
    
    return c.json({
      success,
      message: success ? 'Notification sent successfully' : 'Failed to send notification'
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to send notification' 
    }, 500);
  }
});

// Send bulk notifications
notificationsRouter.post('/send-bulk', async (c) => {
  try {
    const request = await c.req.json() as BulkNotificationRequest;
    const notificationService = new NotificationService(c.env);
    
    const results = await Promise.allSettled(
      request.notifications.map(notification => 
        notificationService.sendNotification(notification)
      )
    );
    
    const successCount = results.filter(result => 
      result.status === 'fulfilled' && result.value
    ).length;
    
    return c.json({
      success: successCount > 0,
      totalSent: request.notifications.length,
      successCount,
      failedCount: request.notifications.length - successCount
    });
  } catch (error) {
    console.error('Send bulk notifications error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to send bulk notifications' 
    }, 500);
  }
});

// Quick notification helpers
notificationsRouter.post('/timesheet-submitted', async (c) => {
  try {
    const { engineerName, totalHours, emails, phones } = await c.req.json();
    const notificationService = new NotificationService(c.env);
    
    const success = await notificationService.notifyTimesheetSubmitted(
      engineerName,
      totalHours,
      emails || [],
      phones || []
    );
    
    return c.json({ success });
  } catch (error) {
    console.error('Timesheet notification error:', error);
    return c.json({ success: false, error: 'Failed to send notification' }, 500);
  }
});

notificationsRouter.post('/discrepancy-detected', async (c) => {
  try {
    const { engineerName, difference, emails, phones } = await c.req.json();
    const notificationService = new NotificationService(c.env);
    
    const success = await notificationService.notifyDiscrepancyDetected(
      engineerName,
      difference,
      emails || [],
      phones || []
    );
    
    return c.json({ success });
  } catch (error) {
    console.error('Discrepancy notification error:', error);
    return c.json({ success: false, error: 'Failed to send notification' }, 500);
  }
});

notificationsRouter.post('/compliance-violation', async (c) => {
  try {
    const { violationType, description, emails, phones } = await c.req.json();
    const notificationService = new NotificationService(c.env);
    
    const success = await notificationService.notifyComplianceViolation(
      violationType,
      description,
      emails || [],
      phones || []
    );
    
    return c.json({ success });
  } catch (error) {
    console.error('Compliance notification error:', error);
    return c.json({ success: false, error: 'Failed to send notification' }, 500);
  }
});

// Get notification history
notificationsRouter.get('/history', async (c) => {
  try {
    const tenantId = c.req.header('X-Tenant-ID') || 'default';
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    const type = c.req.query('type');
    const status = c.req.query('status');
    
    let query = `
      SELECT * FROM notifications 
      WHERE tenant_id = ?
    `;
    const params: any[] = [tenantId];
    
    if (type) {
      query += ` AND type = ?`;
      params.push(type);
    }
    
    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const result = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      notifications: result.results?.map(row => ({
        ...row,
        createdAt: new Date(row.created_at as number),
        updatedAt: new Date(row.updated_at as number),
        sentAt: row.sent_at ? new Date(row.sent_at as number) : null,
        deliveredAt: row.delivered_at ? new Date(row.delivered_at as number) : null
      })) || []
    });
  } catch (error) {
    console.error('Get notification history error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch notification history' 
    }, 500);
  }
});

// Get notification analytics
notificationsRouter.get('/analytics', async (c) => {
  try {
    const tenantId = c.req.header('X-Tenant-ID') || 'default';
    const startDate = c.req.query('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = c.req.query('end') || new Date().toISOString();
    
    // Get overall metrics
    const overallResult = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_sent,
        COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as total_delivered,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as total_failed
      FROM notifications 
      WHERE tenant_id = ? AND created_at BETWEEN ? AND ?
    `).bind(tenantId, startDate, endDate).first();
    
    // Get metrics by channel
    const channelResult = await c.env.DB.prepare(`
      SELECT 
        channel,
        COUNT(*) as sent,
        COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as delivered,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed
      FROM notifications 
      WHERE tenant_id = ? AND created_at BETWEEN ? AND ?
      GROUP BY channel
    `).bind(tenantId, startDate, endDate).all();
    
    // Get metrics by type
    const typeResult = await c.env.DB.prepare(`
      SELECT 
        type,
        COUNT(*) as sent,
        COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as delivered,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed
      FROM notifications 
      WHERE tenant_id = ? AND created_at BETWEEN ? AND ?
      GROUP BY type
    `).bind(tenantId, startDate, endDate).all();
    
    const totalSent = (overallResult?.total_sent as number) || 0;
    const totalDelivered = (overallResult?.total_delivered as number) || 0;
    const totalFailed = (overallResult?.total_failed as number) || 0;
    
    return c.json({
      success: true,
      analytics: {
        tenantId,
        dateRange: {
          start: new Date(startDate),
          end: new Date(endDate)
        },
        totalSent,
        totalDelivered,
        totalFailed,
        deliveryRate: totalSent > 0 ? totalDelivered / totalSent : 0,
        byChannel: (channelResult.results || []).reduce((acc: any, row: any) => {
          acc[row.channel] = {
            sent: row.sent,
            delivered: row.delivered,
            failed: row.failed,
            deliveryRate: row.sent > 0 ? row.delivered / row.sent : 0
          };
          return acc;
        }, {}),
        byType: (typeResult.results || []).reduce((acc: any, row: any) => {
          acc[row.type] = {
            sent: row.sent,
            delivered: row.delivered,
            failed: row.failed
          };
          return acc;
        }, {}),
        byPriority: {} // Could add priority-based analytics
      }
    });
  } catch (error) {
    console.error('Get notification analytics error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch notification analytics' 
    }, 500);
  }
});

// Get notification templates
notificationsRouter.get('/templates', async (c) => {
  try {
    const tenantId = c.req.header('X-Tenant-ID') || 'default';
    const type = c.req.query('type');
    const channel = c.req.query('channel');
    
    let query = `
      SELECT * FROM notification_templates 
      WHERE tenant_id = ? AND is_active = 1
    `;
    const params: any[] = [tenantId];
    
    if (type) {
      query += ` AND type = ?`;
      params.push(type);
    }
    
    if (channel) {
      query += ` AND channel = ?`;
      params.push(channel);
    }
    
    query += ` ORDER BY name`;
    
    const result = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      templates: result.results?.map(row => ({
        ...row,
        variables: JSON.parse(row.variables as string || '[]'),
        createdAt: new Date(row.created_at as number),
        updatedAt: new Date(row.updated_at as number)
      })) || []
    });
  } catch (error) {
    console.error('Get notification templates error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch notification templates' 
    }, 500);
  }
});

// Get/Update notification settings for a user
notificationsRouter.get('/settings/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const tenantId = c.req.header('X-Tenant-ID') || 'default';
    
    const result = await c.env.DB.prepare(`
      SELECT * FROM notification_settings 
      WHERE user_id = ? AND tenant_id = ?
    `).bind(userId, tenantId).first();
    
    if (!result) {
      // Return default settings
      return c.json({
        success: true,
        settings: {
          userId,
          tenantId,
          emailEnabled: true,
          smsEnabled: true,
          pushEnabled: true,
          inAppEnabled: true,
          preferences: {},
          quietHoursEnabled: false
        }
      });
    }
    
    return c.json({
      success: true,
      settings: {
        ...result,
        preferences: JSON.parse(result.preferences as string || '{}'),
        createdAt: new Date(result.created_at as number),
        updatedAt: new Date(result.updated_at as number)
      }
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch notification settings' 
    }, 500);
  }
});

notificationsRouter.put('/settings/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const tenantId = c.req.header('X-Tenant-ID') || 'default';
    const settings = await c.req.json() as NotificationSettings;
    
    const now = Date.now();
    
    // Upsert settings
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO notification_settings (
        id, user_id, tenant_id, email_enabled, sms_enabled, push_enabled, 
        in_app_enabled, preferences, quiet_hours_enabled, quiet_hours_start, 
        quiet_hours_end, quiet_hours_timezone, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      `settings_${userId}_${tenantId}`,
      userId,
      tenantId,
      settings.emailEnabled,
      settings.smsEnabled,
      settings.pushEnabled,
      settings.inAppEnabled,
      JSON.stringify(settings.preferences),
      settings.quietHoursEnabled,
      settings.quietHoursStart,
      settings.quietHoursEnd,
      settings.quietHoursTimezone,
      now,
      now
    ).run();
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Update notification settings error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update notification settings' 
    }, 500);
  }
});

export { notificationsRouter };
