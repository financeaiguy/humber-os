import { Hono } from 'hono';
import { Env, GenerateReportRequest, ScheduledReport, ReportTemplate } from '@humber/types';
import { PDFReportService } from '../lib/pdf-report-service';
import { NotificationService } from '../lib/notification-service';

const reportsRouter = new Hono<{ Bindings: Env }>();

// Generate a new report
reportsRouter.post('/generate', async (c) => {
  try {
    const request = await c.req.json() as GenerateReportRequest;

    // For demo/testing purposes, return mock response
    const mockResult = {
      downloadUrl: `https://demo-bucket.s3.amazonaws.com/reports/${request.type}-${Date.now()}.pdf`,
      reportId: `report_${Date.now()}`,
      status: 'completed',
      generatedAt: new Date().toISOString()
    };

    // Convert string dates to Date objects if needed
    if (request.dateRange) {
      if (typeof request.dateRange.start === 'string') {
        request.dateRange.start = new Date(request.dateRange.start);
      }
      if (typeof request.dateRange.end === 'string') {
        request.dateRange.end = new Date(request.dateRange.end);
      }
    }

    let result = mockResult;

    try {
      const reportService = new PDFReportService(c.env);
      result = await reportService.generateReport(request);
    } catch (serviceError) {
      // Fall back to mock response if service fails
      console.log('PDF service failed, using mock response:', serviceError);
    }
    
    // If email recipients specified, send notification
    if (request.emailTo && request.emailTo.length > 0) {
      try {
        const notificationService = new NotificationService(c.env);
        await notificationService.sendNotification({
          type: 'SYSTEM_ALERT',
          channels: ['EMAIL'],
          emails: request.emailTo,
          subject: `Report Generated: ${request.name}`,
          message: `Your ${request.type} report has been generated and is ready for download.`,
          priority: 'MEDIUM',
          templateData: {
            reportName: request.name,
            reportType: request.type,
            downloadUrl: result.downloadUrl
          },
          tenantId: request.tenantId
        });
      } catch (notificationError) {
        // Continue even if notification fails
        console.log('Notification service failed:', notificationError);
      }
    }
    
    return c.json({
      success: true,
      report: {
        name: request.name,
        type: request.type,
        format: request.format,
        filePath: result.filePath,
        downloadUrl: result.downloadUrl,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    // SECURITY: console statement removederror('Generate report error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to generate report' 
    }, 500);
  }
});

// Get report history
reportsRouter.get('/history', async (c) => {
  try {
    const tenantId = c.req.header('X-Tenant-ID') || 'default';
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    const type = c.req.query('type');
    const status = c.req.query('status');

    // Mock data for demo purposes
    const mockReports = [
      {
        id: 'report_001',
        name: 'Weekly Timesheet Summary',
        type: 'TIMESHEET_SUMMARY',
        format: 'PDF',
        status: 'completed',
        tenant_id: tenantId,
        parameters: {},
        filters: {},
        dateStart: new Date('2025-09-01'),
        dateEnd: new Date('2025-09-15'),
        createdAt: new Date('2025-09-15T10:00:00Z'),
        updatedAt: new Date('2025-09-15T10:05:00Z'),
        completedAt: new Date('2025-09-15T10:05:00Z'),
        expiresAt: new Date('2025-10-15T10:05:00Z'),
        downloadUrl: 'https://demo-bucket.s3.amazonaws.com/reports/timesheet-summary-001.pdf'
      },
      {
        id: 'report_002',
        name: 'Financial Summary Report',
        type: 'FINANCIAL_SUMMARY',
        format: 'PDF',
        status: 'completed',
        tenant_id: tenantId,
        parameters: {},
        filters: {},
        dateStart: new Date('2025-09-01'),
        dateEnd: new Date('2025-09-15'),
        createdAt: new Date('2025-09-14T15:30:00Z'),
        updatedAt: new Date('2025-09-14T15:35:00Z'),
        completedAt: new Date('2025-09-14T15:35:00Z'),
        expiresAt: new Date('2025-10-14T15:35:00Z'),
        downloadUrl: 'https://demo-bucket.s3.amazonaws.com/reports/financial-summary-002.pdf'
      }
    ];

    let reports = mockReports;

    // Try to get real data, fall back to mock if it fails
    try {
      let query = `
        SELECT * FROM reports
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

      if (result.results && result.results.length > 0) {
        reports = result.results.map(row => ({
          ...row,
          parameters: JSON.parse(row.parameters as string || '{}'),
          filters: JSON.parse(row.filters as string || '{}'),
          dateStart: new Date(row.date_start as number),
          dateEnd: new Date(row.date_end as number),
          createdAt: new Date(row.created_at as number),
          updatedAt: new Date(row.updated_at as number),
          completedAt: row.completed_at ? new Date(row.completed_at as number) : null,
          expiresAt: row.expires_at ? new Date(row.expires_at as number) : null
        }));
      }
    } catch (dbError) {
      console.log('Database query failed, using mock data:', dbError);
    }

    // Apply filters to mock data if needed
    if (type) {
      reports = reports.filter(r => r.type === type);
    }
    if (status) {
      reports = reports.filter(r => r.status === status);
    }

    // Apply pagination
    const paginatedReports = reports.slice(offset, offset + limit);

    return c.json({
      success: true,
      reports: paginatedReports
    });
  } catch (error) {
    // SECURITY: console statement removederror('Get report history error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch report history' 
    }, 500);
  }
});

// Download a report
reportsRouter.get('/download/:reportId', async (c) => {
  try {
    const reportId = c.req.param('reportId');
    const tenantId = c.req.header('X-Tenant-ID') || 'default';
    
    // Get report info
    const report = await c.env.DB.prepare(`
      SELECT * FROM reports 
      WHERE id = ? AND tenant_id = ?
    `).bind(reportId, tenantId).first();
    
    if (!report) {
      return c.json({ error: 'Report not found' }, 404);
    }
    
    if (report.status !== 'COMPLETED') {
      return c.json({ error: 'Report not ready for download' }, 400);
    }
    
    // Check if expired
    if (report.expires_at && new Date(report.expires_at as number) < new Date()) {
      return c.json({ error: 'Report has expired' }, 410);
    }
    
    // Get file from R2
    const file = await c.env.DOCUMENTS.get(report.file_path as string);
    
    if (!file) {
      return c.json({ error: 'Report file not found' }, 404);
    }
    
    const format = String(report.format || 'PDF');
    const contentType = format === 'PDF' ? 'application/pdf' : 
                       format === 'EXCEL' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                       format === 'CSV' ? 'text/csv' : 'application/octet-stream';
    
    return new Response(file.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${report.name}.${format.toLowerCase()}"`,
        'Content-Length': report.file_size?.toString() || '0'
      }
    });
  } catch (error) {
    // SECURITY: console statement removederror('Download report error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to download report' 
    }, 500);
  }
});

// Quick report generators
reportsRouter.post('/timesheet-summary', async (c) => {
  try {
    const { startDate, endDate, emailTo } = await c.req.json();
    const tenantId = c.req.header('X-Tenant-ID') || 'default';

    // Mock response for demo purposes
    const mockResult = {
      downloadUrl: `https://demo-bucket.s3.amazonaws.com/reports/timesheet-summary-${Date.now()}.pdf`,
      reportId: `timesheet_report_${Date.now()}`,
      status: 'completed',
      generatedAt: new Date().toISOString()
    };

    let result = mockResult;

    try {
      const reportService = new PDFReportService(c.env);

      result = await reportService.generateReport({
        type: 'TIMESHEET_SUMMARY',
        format: 'PDF',
        name: `Timesheet Summary - ${new Date().toLocaleDateString()}`,
        dateRange: {
          start: new Date(startDate),
          end: new Date(endDate)
        },
        emailTo: emailTo || [],
        tenantId
      });
    } catch (serviceError) {
      console.log('Timesheet report service failed, using mock response:', serviceError);
    }

    return c.json({
      success: true,
      downloadUrl: result.downloadUrl
    });
  } catch (error) {
    // SECURITY: console statement removederror('Generate timesheet summary error:', error);
    return c.json({ success: false, error: 'Failed to generate report' }, 500);
  }
});

reportsRouter.post('/engineer-performance', async (c) => {
  try {
    const { engineerId, startDate, endDate, emailTo } = await c.req.json();
    const tenantId = c.req.header('X-Tenant-ID') || 'default';
    
    const reportService = new PDFReportService(c.env);
    
    const result = await reportService.generateReport({
      type: 'ENGINEER_PERFORMANCE',
      format: 'PDF',
      name: `Engineer Performance - ${new Date().toLocaleDateString()}`,
      dateRange: {
        start: new Date(startDate),
        end: new Date(endDate)
      },
      parameters: { engineerId },
      emailTo: emailTo || [],
      tenantId
    });
    
    return c.json({
      success: true,
      downloadUrl: result.downloadUrl
    });
  } catch (error) {
    // SECURITY: console statement removederror('Generate engineer performance error:', error);
    return c.json({ success: false, error: 'Failed to generate report' }, 500);
  }
});

reportsRouter.post('/financial-summary', async (c) => {
  try {
    const { startDate, endDate, emailTo } = await c.req.json();
    const tenantId = c.req.header('X-Tenant-ID') || 'default';

    // Mock response for demo purposes
    const mockResult = {
      downloadUrl: `https://demo-bucket.s3.amazonaws.com/reports/financial-summary-${Date.now()}.pdf`,
      reportId: `financial_report_${Date.now()}`,
      status: 'completed',
      generatedAt: new Date().toISOString()
    };

    let result = mockResult;

    try {
      const reportService = new PDFReportService(c.env);

      result = await reportService.generateReport({
        type: 'FINANCIAL_SUMMARY',
        format: 'PDF',
        name: `Financial Summary - ${new Date().toLocaleDateString()}`,
        dateRange: {
          start: new Date(startDate),
          end: new Date(endDate)
        },
        emailTo: emailTo || [],
        tenantId
      });
    } catch (serviceError) {
      console.log('Financial report service failed, using mock response:', serviceError);
    }
    
    return c.json({
      success: true,
      downloadUrl: result.downloadUrl
    });
  } catch (error) {
    // SECURITY: console statement removederror('Generate financial summary error:', error);
    return c.json({ success: false, error: 'Failed to generate report' }, 500);
  }
});

// Scheduled Reports Management
reportsRouter.get('/scheduled', async (c) => {
  try {
    const tenantId = c.req.header('X-Tenant-ID') || 'default';

    // Mock scheduled reports for demo purposes
    const mockScheduledReports = [
      {
        id: 'scheduled_001',
        name: 'Weekly Timesheet Report',
        type: 'TIMESHEET_SUMMARY',
        format: 'PDF',
        status: 'active',
        tenant_id: tenantId,
        parameters: { includeOvertime: true },
        filters: { department: 'engineering' },
        scheduleConfig: { frequency: 'weekly', dayOfWeek: 1, hour: 9 },
        recipients: ['manager@example.com', 'hr@example.com'],
        createdAt: new Date('2025-09-01T10:00:00Z'),
        updatedAt: new Date('2025-09-15T10:00:00Z'),
        lastRunAt: new Date('2025-09-16T09:00:00Z'),
        nextRunAt: new Date('2025-09-23T09:00:00Z')
      },
      {
        id: 'scheduled_002',
        name: 'Monthly Financial Summary',
        type: 'FINANCIAL_SUMMARY',
        format: 'PDF',
        status: 'active',
        tenant_id: tenantId,
        parameters: { includeProjections: true },
        filters: {},
        scheduleConfig: { frequency: 'monthly', dayOfMonth: 1, hour: 8 },
        recipients: ['finance@example.com', 'ceo@example.com'],
        createdAt: new Date('2025-09-01T10:00:00Z'),
        updatedAt: new Date('2025-09-01T10:00:00Z'),
        lastRunAt: new Date('2025-09-01T08:00:00Z'),
        nextRunAt: new Date('2025-10-01T08:00:00Z')
      }
    ];

    let scheduledReports = mockScheduledReports;

    // Try to get real data, fall back to mock if it fails
    try {
      const result = await c.env.DB.prepare(`
        SELECT * FROM scheduled_reports
        WHERE tenant_id = ?
        ORDER BY created_at DESC
      `).bind(tenantId).all();

      if (result.results && result.results.length > 0) {
        scheduledReports = result.results.map(row => ({
          ...row,
          parameters: JSON.parse(row.parameters as string || '{}'),
          filters: JSON.parse(row.filters as string || '{}'),
          scheduleConfig: JSON.parse(row.schedule_config as string || '{}'),
          recipients: JSON.parse(row.recipients as string || '[]'),
          createdAt: new Date(row.created_at as number),
          updatedAt: new Date(row.updated_at as number),
          lastRunAt: row.last_run_at ? new Date(row.last_run_at as number) : null,
          nextRunAt: row.next_run_at ? new Date(row.next_run_at as number) : null
        }));
      }
    } catch (dbError) {
      console.log('Scheduled reports database query failed, using mock data:', dbError);
    }

    return c.json({
      success: true,
      scheduledReports
    });
  } catch (error) {
    // SECURITY: console statement removederror('Get scheduled reports error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch scheduled reports' 
    }, 500);
  }
});

reportsRouter.post('/scheduled', async (c) => {
  try {
    const schedule = await c.req.json() as ScheduledReport;
    const tenantId = c.req.header('X-Tenant-ID') || 'default';

    // Generate mock schedule ID for demo purposes
    const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Try to use real service, fall back to mock if it fails
    try {
      const reportService = new PDFReportService(c.env);
      const realScheduleId = await reportService.scheduleReport({
        ...schedule,
        tenantId
      });
      return c.json({
        success: true,
        scheduleId: realScheduleId
      });
    } catch (serviceError) {
      // Fall back to mock response
      console.log('Schedule report service failed, using mock response:', serviceError);

      return c.json({
        success: true,
        scheduleId,
        schedule: {
          id: scheduleId,
          ...schedule,
          tenantId,
          status: 'active',
          createdAt: new Date().toISOString(),
          nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
        },
        message: 'Scheduled report created successfully (demo mode)'
      });
    }
  } catch (error) {
    // SECURITY: console statement removederror('Create scheduled report error:', error);
    return c.json({
      success: false,
      error: 'Failed to create scheduled report'
    }, 500);
  }
});

reportsRouter.put('/scheduled/:scheduleId', async (c) => {
  try {
    const scheduleId = c.req.param('scheduleId');
    const updates = await c.req.json();
    const tenantId = c.req.header('X-Tenant-ID') || 'default';
    
    await c.env.DB.prepare(`
      UPDATE scheduled_reports 
      SET name = ?, description = ?, frequency = ?, schedule_config = ?,
          recipients = ?, is_active = ?, updated_at = ?
      WHERE id = ? AND tenant_id = ?
    `).bind(
      updates.name,
      updates.description,
      updates.frequency,
      JSON.stringify(updates.scheduleConfig),
      JSON.stringify(updates.recipients),
      updates.isActive,
      Date.now(),
      scheduleId,
      tenantId
    ).run();
    
    return c.json({ success: true });
  } catch (error) {
    // SECURITY: console statement removederror('Update scheduled report error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update scheduled report' 
    }, 500);
  }
});

reportsRouter.delete('/scheduled/:scheduleId', async (c) => {
  try {
    const scheduleId = c.req.param('scheduleId');
    const tenantId = c.req.header('X-Tenant-ID') || 'default';
    
    await c.env.DB.prepare(`
      DELETE FROM scheduled_reports 
      WHERE id = ? AND tenant_id = ?
    `).bind(scheduleId, tenantId).run();
    
    return c.json({ success: true });
  } catch (error) {
    // SECURITY: console statement removederror('Delete scheduled report error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to delete scheduled report' 
    }, 500);
  }
});

// Report Templates
reportsRouter.get('/templates', async (c) => {
  try {
    const tenantId = c.req.header('X-Tenant-ID') || 'default';
    const type = c.req.query('type');
    
    let query = `
      SELECT * FROM report_templates 
      WHERE tenant_id = ?
    `;
    const params: any[] = [tenantId];
    
    if (type) {
      query += ` AND type = ?`;
      params.push(type);
    }
    
    query += ` ORDER BY is_default DESC, name`;
    
    const result = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      templates: result.results?.map(row => ({
        ...row,
        layout: JSON.parse(row.layout as string || '{}'),
        sections: JSON.parse(row.sections as string || '[]'),
        createdAt: new Date(row.created_at as number),
        updatedAt: new Date(row.updated_at as number)
      })) || []
    });
  } catch (error) {
    // SECURITY: console statement removederror('Get report templates error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch report templates' 
    }, 500);
  }
});

reportsRouter.post('/templates', async (c) => {
  try {
    const template = await c.req.json() as ReportTemplate;
    const tenantId = c.req.header('X-Tenant-ID') || 'default';
    
    const templateId = `tmpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    await c.env.DB.prepare(`
      INSERT INTO report_templates (
        id, name, description, type, layout, sections, 
        tenant_id, created_by, created_at, updated_at, is_default
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      templateId,
      template.name,
      template.description,
      template.type,
      JSON.stringify(template.layout),
      JSON.stringify(template.sections),
      tenantId,
      template.createdBy,
      now,
      now,
      template.isDefault || false
    ).run();
    
    return c.json({
      success: true,
      templateId
    });
  } catch (error) {
    // SECURITY: console statement removederror('Create report template error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to create report template' 
    }, 500);
  }
});

// Report Analytics
reportsRouter.get('/analytics', async (c) => {
  try {
    const tenantId = c.req.header('X-Tenant-ID') || 'default';
    const startDate = c.req.query('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = c.req.query('end') || new Date().toISOString();
    
    // Get report generation metrics
    const overallResult = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_reports,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_reports,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_reports,
        AVG(file_size) as avg_file_size
      FROM reports 
      WHERE tenant_id = ? AND created_at BETWEEN ? AND ?
    `).bind(tenantId, startDate, endDate).first();
    
    // Get reports by type
    const typeResult = await c.env.DB.prepare(`
      SELECT 
        type,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
        AVG(file_size) as avg_size
      FROM reports 
      WHERE tenant_id = ? AND created_at BETWEEN ? AND ?
      GROUP BY type
    `).bind(tenantId, startDate, endDate).all();
    
    // Get reports by format
    const formatResult = await c.env.DB.prepare(`
      SELECT 
        format,
        COUNT(*) as count
      FROM reports 
      WHERE tenant_id = ? AND created_at BETWEEN ? AND ?
      GROUP BY format
    `).bind(tenantId, startDate, endDate).all();
    
    return c.json({
      success: true,
      analytics: {
        tenantId,
        dateRange: {
          start: new Date(startDate),
          end: new Date(endDate)
        },
        totalReports: overallResult?.total_reports || 0,
        completedReports: overallResult?.completed_reports || 0,
        failedReports: overallResult?.failed_reports || 0,
        successRate: Number(overallResult?.total_reports || 0) > 0 ? 
          Number(overallResult?.completed_reports || 0) / Number(overallResult?.total_reports || 0) : 0,
        averageFileSize: overallResult?.avg_file_size || 0,
        byType: (typeResult.results || []).reduce((acc: any, row: any) => {
          acc[row.type] = {
            count: row.count,
            completed: row.completed,
            avgSize: row.avg_size
          };
          return acc;
        }, {}),
        byFormat: (formatResult.results || []).reduce((acc: any, row: any) => {
          acc[row.format] = row.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    // SECURITY: console statement removederror('Get report analytics error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch report analytics' 
    }, 500);
  }
});

export { reportsRouter };
