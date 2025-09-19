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
    // SECURITY: console statement removederror('Send notification error:', error);
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
    // SECURITY: console statement removederror('Send bulk notifications error:', error);
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
    // SECURITY: console statement removederror('Timesheet notification error:', error);
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
    // SECURITY: console statement removederror('Discrepancy notification error:', error);
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
    // SECURITY: console statement removederror('Compliance notification error:', error);
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
    
    // Mock notification history data
    const mockNotifications = [
      {
        id: 'notif_001',
        tenantId,
        type: 'timesheet_submitted',
        channel: 'email',
        recipient: 'manager@example.com',
        subject: 'Timesheet Submitted',
        body: 'John Doe has submitted their timesheet for review',
        status: 'delivered',
        priority: 'normal',
        createdAt: new Date('2025-01-15T10:00:00Z'),
        updatedAt: new Date('2025-01-15T10:00:00Z'),
        sentAt: new Date('2025-01-15T10:00:01Z'),
        deliveredAt: new Date('2025-01-15T10:00:03Z')
      },
      {
        id: 'notif_002',
        tenantId,
        type: 'discrepancy_detected',
        channel: 'sms',
        recipient: '+1234567890',
        subject: 'Discrepancy Alert',
        body: 'A timesheet discrepancy of 5 hours was detected',
        status: 'delivered',
        priority: 'high',
        createdAt: new Date('2025-01-14T15:30:00Z'),
        updatedAt: new Date('2025-01-14T15:30:00Z'),
        sentAt: new Date('2025-01-14T15:30:01Z'),
        deliveredAt: new Date('2025-01-14T15:30:02Z')
      },
      {
        id: 'notif_003',
        tenantId,
        type: 'compliance_violation',
        channel: 'email',
        recipient: 'compliance@example.com',
        subject: 'Compliance Alert',
        body: 'Missing timesheet entries detected for the last week',
        status: 'failed',
        priority: 'critical',
        error: 'Invalid email address',
        createdAt: new Date('2025-01-13T09:00:00Z'),
        updatedAt: new Date('2025-01-13T09:00:10Z'),
        sentAt: new Date('2025-01-13T09:00:01Z'),
        deliveredAt: null
      }
    ];
    
    // Apply filters
    let filtered = mockNotifications;
    if (type) {
      filtered = filtered.filter(n => n.type === type);
    }
    if (status) {
      filtered = filtered.filter(n => n.status === status);
    }
    
    // Apply pagination
    const paginated = filtered.slice(offset, offset + limit);
    
    return c.json({
      success: true,
      notifications: paginated,
      total: filtered.length,
      limit,
      offset
    });
  } catch (error) {
    // SECURITY: console statement removederror('Get notification history error:', error);
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
    
    // Mock analytics data
    const mockAnalytics = {
      tenantId,
      dateRange: {
        start: new Date(startDate),
        end: new Date(endDate)
      },
      totalSent: 1567,
      totalDelivered: 1423,
      totalFailed: 144,
      deliveryRate: 0.908,
      byChannel: {
        email: {
          sent: 850,
          delivered: 798,
          failed: 52,
          deliveryRate: 0.939
        },
        sms: {
          sent: 425,
          delivered: 380,
          failed: 45,
          deliveryRate: 0.894
        },
        push: {
          sent: 292,
          delivered: 245,
          failed: 47,
          deliveryRate: 0.839
        }
      },
      byType: {
        timesheet_submitted: {
          sent: 623,
          delivered: 598,
          failed: 25
        },
        discrepancy_detected: {
          sent: 245,
          delivered: 210,
          failed: 35
        },
        compliance_violation: {
          sent: 89,
          delivered: 78,
          failed: 11
        },
        payment_completed: {
          sent: 412,
          delivered: 397,
          failed: 15
        },
        vetting_completed: {
          sent: 198,
          delivered: 140,
          failed: 58
        }
      },
      byPriority: {
        critical: {
          sent: 89,
          delivered: 88,
          failed: 1,
          deliveryRate: 0.989
        },
        high: {
          sent: 312,
          delivered: 290,
          failed: 22,
          deliveryRate: 0.929
        },
        normal: {
          sent: 1166,
          delivered: 1045,
          failed: 121,
          deliveryRate: 0.896
        }
      },
      trends: {
        daily: [
          { date: '2025-01-10', sent: 52, delivered: 48 },
          { date: '2025-01-11', sent: 48, delivered: 45 },
          { date: '2025-01-12', sent: 45, delivered: 42 },
          { date: '2025-01-13', sent: 55, delivered: 51 },
          { date: '2025-01-14', sent: 58, delivered: 54 },
          { date: '2025-01-15', sent: 61, delivered: 57 },
          { date: '2025-01-16', sent: 49, delivered: 46 }
        ]
      }
    };
    
    return c.json({
      success: true,
      analytics: mockAnalytics
    });
  } catch (error) {
    // SECURITY: console statement removederror('Get notification analytics error:', error);
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
    // SECURITY: console statement removederror('Get notification templates error:', error);
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
    // SECURITY: console statement removederror('Get notification settings error:', error);
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
    // SECURITY: console statement removederror('Update notification settings error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update notification settings' 
    }, 500);
  }
});

export { notificationsRouter };
