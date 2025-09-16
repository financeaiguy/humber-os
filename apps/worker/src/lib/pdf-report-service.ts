import { Env, ReportType, GenerateReportRequest, TimesheetSummaryData, EngineerPerformanceData, FinancialSummaryData } from '@humber/types';

// PDF Generation using jsPDF (we'll use a CDN version for Cloudflare Workers)
class PDFGenerator {
  async generateHTML(reportType: ReportType, data: any): Promise<string> {
    const baseStyles = `
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; margin: -20px -20px 30px -20px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
        .header .subtitle { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
        .section { margin: 30px 0; }
        .section h2 { color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-bottom: 20px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #667eea; }
        .metric-value { font-size: 32px; font-weight: bold; color: #667eea; margin-bottom: 5px; }
        .metric-label { font-size: 14px; color: #6c757d; text-transform: uppercase; letter-spacing: 1px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
        th { background: #f8f9fa; font-weight: 600; color: #495057; }
        tr:hover { background: #f8f9fa; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .status-active { background: #d4edda; color: #155724; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-failed { background: #f8d7da; color: #721c24; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 12px; }
        .chart-placeholder { background: #f8f9fa; padding: 40px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px dashed #dee2e6; }
      </style>
    `;

    switch (reportType) {
      case 'TIMESHEET_SUMMARY':
        return this.generateTimesheetSummaryHTML(data as TimesheetSummaryData, baseStyles);
      case 'ENGINEER_PERFORMANCE':
        return this.generateEngineerPerformanceHTML(data as EngineerPerformanceData, baseStyles);
      case 'FINANCIAL_SUMMARY':
        return this.generateFinancialSummaryHTML(data as FinancialSummaryData, baseStyles);
      default:
        return this.generateGenericReportHTML(reportType, data, baseStyles);
    }
  }

  private generateTimesheetSummaryHTML(data: TimesheetSummaryData, styles: string): string {
    const engineerRows = data.engineers.map(eng => `
      <tr>
        <td>${eng.name}</td>
        <td>${eng.category}</td>
        <td>${eng.totalHours}h</td>
        <td>${eng.regularHours}h</td>
        <td>${eng.overtimeHours}h</td>
        <td>${eng.discrepancies}</td>
        <td><span class="status-badge status-${eng.status.toLowerCase()}">${eng.status}</span></td>
      </tr>
    `).join('');

    const discrepancyRows = data.discrepancies.map(disc => `
      <tr>
        <td>${disc.engineerName}</td>
        <td>${disc.date.toLocaleDateString()}</td>
        <td>${disc.humberHours}h</td>
        <td>${disc.clientHours}h</td>
        <td style="color: ${disc.difference > 0 ? '#dc3545' : '#28a745'};">${disc.difference > 0 ? '+' : ''}${disc.difference}h</td>
        <td><span class="status-badge status-${disc.status.toLowerCase()}">${disc.status}</span></td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Timesheet Summary Report</title>
        ${styles}
      </head>
      <body>
        <div class="header">
          <h1>Timesheet Summary Report</h1>
          <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
        </div>

        <div class="section">
          <h2>📊 Summary Metrics</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">${data.summary.totalHours}</div>
              <div class="metric-label">Total Hours</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${data.summary.totalEngineers}</div>
              <div class="metric-label">Total Engineers</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${data.summary.averageHoursPerEngineer.toFixed(1)}</div>
              <div class="metric-label">Avg Hours/Engineer</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${data.summary.totalDiscrepancies}</div>
              <div class="metric-label">Total Discrepancies</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${(data.summary.discrepancyRate * 100).toFixed(1)}%</div>
              <div class="metric-label">Discrepancy Rate</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>👥 Engineer Details</h2>
          <table>
            <thead>
              <tr>
                <th>Engineer</th>
                <th>Category</th>
                <th>Total Hours</th>
                <th>Regular Hours</th>
                <th>Overtime</th>
                <th>Discrepancies</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${engineerRows}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>⚠️ Discrepancies</h2>
          <table>
            <thead>
              <tr>
                <th>Engineer</th>
                <th>Date</th>
                <th>Humber Hours</th>
                <th>Client Hours</th>
                <th>Difference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${discrepancyRows}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Generated by Humber Operations AI • ${new Date().toLocaleString()}</p>
          <p>This report contains confidential information. Please handle accordingly.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateEngineerPerformanceHTML(data: EngineerPerformanceData, styles: string): string {
    const projectRows = data.recentProjects.map(project => `
      <tr>
        <td>${project.name}</td>
        <td>${project.client}</td>
        <td>${project.startDate.toLocaleDateString()}</td>
        <td>${project.endDate ? project.endDate.toLocaleDateString() : 'Ongoing'}</td>
        <td><span class="status-badge status-${project.status.toLowerCase()}">${project.status}</span></td>
        <td>${project.rating ? '⭐'.repeat(Math.floor(project.rating)) + ` ${project.rating}/5` : 'N/A'}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Engineer Performance Report</title>
        ${styles}
      </head>
      <body>
        <div class="header">
          <h1>Engineer Performance Report</h1>
          <div class="subtitle">${data.engineer.name} • ${data.engineer.category}</div>
        </div>

        <div class="section">
          <h2>👤 Engineer Information</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> ${data.engineer.name}</p>
            <p><strong>Email:</strong> ${data.engineer.email}</p>
            <p><strong>Category:</strong> ${data.engineer.category}</p>
            <p><strong>Hire Date:</strong> ${data.engineer.hireDate.toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${data.engineer.status.toLowerCase()}">${data.engineer.status}</span></p>
          </div>
        </div>

        <div class="section">
          <h2>📈 Performance Metrics</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">${data.metrics.totalHours}</div>
              <div class="metric-label">Total Hours</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${(data.metrics.utilizationRate * 100).toFixed(1)}%</div>
              <div class="metric-label">Utilization Rate</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${data.metrics.averageRating.toFixed(1)}</div>
              <div class="metric-label">Average Rating</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${data.metrics.completedProjects}</div>
              <div class="metric-label">Completed Projects</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${(data.metrics.onTimeDelivery * 100).toFixed(1)}%</div>
              <div class="metric-label">On-Time Delivery</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${(data.metrics.clientSatisfaction * 100).toFixed(1)}%</div>
              <div class="metric-label">Client Satisfaction</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>🚀 Recent Projects</h2>
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              ${projectRows}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Generated by Humber Operations AI • ${new Date().toLocaleString()}</p>
          <p>This report contains confidential information. Please handle accordingly.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateFinancialSummaryHTML(data: FinancialSummaryData, styles: string): string {
    const clientRows = data.revenueByClient.map(client => `
      <tr>
        <td>${client.clientName}</td>
        <td>$${client.revenue.toLocaleString()}</td>
        <td>${client.hours}h</td>
        <td>$${client.averageRate.toFixed(2)}</td>
        <td>${client.percentage.toFixed(1)}%</td>
      </tr>
    `).join('');

    const categoryRows = data.revenueByCategory.map(category => `
      <tr>
        <td>${category.category}</td>
        <td>$${category.revenue.toLocaleString()}</td>
        <td>${category.hours}h</td>
        <td>${category.engineers}</td>
        <td>${category.percentage.toFixed(1)}%</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Financial Summary Report</title>
        ${styles}
      </head>
      <body>
        <div class="header">
          <h1>Financial Summary Report</h1>
          <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
        </div>

        <div class="section">
          <h2>💰 Financial Overview</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">$${data.summary.totalRevenue.toLocaleString()}</div>
              <div class="metric-label">Total Revenue</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">$${data.summary.totalCosts.toLocaleString()}</div>
              <div class="metric-label">Total Costs</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">$${data.summary.grossProfit.toLocaleString()}</div>
              <div class="metric-label">Gross Profit</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${(data.summary.profitMargin * 100).toFixed(1)}%</div>
              <div class="metric-label">Profit Margin</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${data.summary.billableHours}</div>
              <div class="metric-label">Billable Hours</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">$${data.summary.averageHourlyRate.toFixed(2)}</div>
              <div class="metric-label">Avg Hourly Rate</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>🏢 Revenue by Client</h2>
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Revenue</th>
                <th>Hours</th>
                <th>Avg Rate</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              ${clientRows}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>⚙️ Revenue by Category</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Revenue</th>
                <th>Hours</th>
                <th>Engineers</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              ${categoryRows}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Generated by Humber Operations AI • ${new Date().toLocaleString()}</p>
          <p>This report contains confidential information. Please handle accordingly.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateGenericReportHTML(reportType: ReportType, data: any, styles: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${reportType.replace('_', ' ')} Report</title>
        ${styles}
      </head>
      <body>
        <div class="header">
          <h1>${reportType.replace('_', ' ')} Report</h1>
          <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
        </div>

        <div class="section">
          <h2>📊 Report Data</h2>
          <pre style="background: #f8f9fa; padding: 20px; border-radius: 8px; overflow-x: auto;">
${JSON.stringify(data, null, 2)}
          </pre>
        </div>

        <div class="footer">
          <p>Generated by Humber Operations AI • ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
  }

  async generatePDF(htmlContent: string): Promise<Uint8Array> {
    // For Cloudflare Workers, we'll use Puppeteer via a service like htmlcsstoimage.com
    // or implement a simpler PDF generation solution
    
    // For now, we'll return the HTML as a simple PDF-like format
    // In production, you'd integrate with a PDF service like:
    // - Puppeteer via Docker
    // - htmlcsstoimage.com API
    // - PDFShift API
    // - jsPDF for client-side generation
    
    const encoder = new TextEncoder();
    return encoder.encode(htmlContent);
  }
}

// Report Data Service - fetches data for different report types
class ReportDataService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async getTimesheetSummaryData(dateRange: { start: Date; end: Date }, tenantId: string): Promise<TimesheetSummaryData> {
    // Fetch data from database
    const timesheets = await this.env.DB.prepare(`
      SELECT 
        c.id,
        (c.first_name || ' ' || c.last_name) as name,
        'ENGINEER' as category,
        SUM(t.hours_worked) as total_hours,
        COUNT(t.id) as timesheet_count,
        c.status
      FROM candidates c
      LEFT JOIN timesheets t ON c.id = t.candidate_id
      WHERE t.created_at BETWEEN ? AND ? AND c.tenant_id = ?
      GROUP BY c.id
    `).bind(
      typeof dateRange.start === 'string' ? new Date(dateRange.start).getTime() : dateRange.start.getTime(), 
      typeof dateRange.end === 'string' ? new Date(dateRange.end).getTime() : dateRange.end.getTime(),
      tenantId
    ).all();

    const discrepancies = await this.env.DB.prepare(`
      SELECT 
        (c.first_name || ' ' || c.last_name) as engineer_name,
        t.week_start_date as date,
        t.hours_worked as humber_hours,
        40.0 as client_hours,
        (t.hours_worked - 40.0) as difference,
        t.status
      FROM timesheets t
      JOIN candidates c ON t.candidate_id = c.id
      WHERE t.week_start_date >= ? AND t.week_start_date <= ? AND c.tenant_id = ?
      AND ABS(t.hours_worked - 40.0) > 0
    `).bind(
      typeof dateRange.start === 'string' ? new Date(dateRange.start).getTime() : dateRange.start.getTime(), 
      typeof dateRange.end === 'string' ? new Date(dateRange.end).getTime() : dateRange.end.getTime(),
      tenantId
    ).all();

    const totalHours = (timesheets.results || []).reduce((sum: number, row: any) => sum + (row.total_hours || 0), 0);
    const totalEngineers = (timesheets.results || []).length;
    const totalDiscrepancies = (discrepancies.results || []).length;

    return {
      summary: {
        totalHours,
        totalEngineers,
        averageHoursPerEngineer: totalEngineers > 0 ? totalHours / totalEngineers : 0,
        totalDiscrepancies,
        discrepancyRate: totalHours > 0 ? totalDiscrepancies / totalHours : 0
      },
      engineers: (timesheets.results || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        totalHours: row.total_hours || 0,
        regularHours: Math.min(row.total_hours || 0, 40),
        overtimeHours: Math.max((row.total_hours || 0) - 40, 0),
        discrepancies: 0, // Calculate from discrepancies array
        status: row.status
      })),
      discrepancies: (discrepancies.results || []).map((row: any) => ({
        engineerId: 'unknown',
        engineerName: row.engineer_name,
        date: new Date(row.date),
        humberHours: row.humber_hours,
        clientHours: row.client_hours,
        difference: row.difference,
        status: row.status
      }))
    };
  }

  async getEngineerPerformanceData(engineerId: string, _dateRange: { start: Date; end: Date }): Promise<EngineerPerformanceData> {
    // Mock data for now - replace with real database queries
    return {
      engineer: {
        id: engineerId,
        name: 'John Smith',
        email: 'john.smith@humber.com',
        category: 'Controls',
        hireDate: new Date('2023-01-15'),
        status: 'Active'
      },
      metrics: {
        totalHours: 320,
        utilizationRate: 0.95,
        averageRating: 4.7,
        completedProjects: 8,
        onTimeDelivery: 0.92,
        clientSatisfaction: 0.89
      },
      recentProjects: [
        {
          name: 'Factory Automation',
          client: 'Ford Motor Co',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-02-15'),
          status: 'Completed',
          rating: 5
        }
      ],
      timeTracking: []
    };
  }

  async getFinancialSummaryData(_dateRange: { start: Date; end: Date }, _tenantId: string): Promise<FinancialSummaryData> {
    // Mock data for now - replace with real database queries
    return {
      summary: {
        totalRevenue: 450000,
        totalCosts: 320000,
        grossProfit: 130000,
        profitMargin: 0.29,
        billableHours: 2800,
        averageHourlyRate: 160.71
      },
      revenueByClient: [
        {
          clientName: 'Ford Motor Co',
          revenue: 180000,
          hours: 1200,
          averageRate: 150,
          percentage: 40
        },
        {
          clientName: 'General Motors',
          revenue: 135000,
          hours: 900,
          averageRate: 150,
          percentage: 30
        }
      ],
      revenueByCategory: [
        {
          category: 'Controls',
          revenue: 200000,
          hours: 1300,
          engineers: 5,
          percentage: 44.4
        },
        {
          category: 'Mechanical',
          revenue: 150000,
          hours: 1000,
          engineers: 4,
          percentage: 33.3
        }
      ],
      monthlyTrends: []
    };
  }
}

// Main PDF Report Service
export class PDFReportService {
  private pdfGenerator: PDFGenerator;
  private dataService: ReportDataService;
  private env: Env;

  constructor(env: Env) {
    this.env = env;
    this.pdfGenerator = new PDFGenerator();
    this.dataService = new ReportDataService(env);
  }

  async generateReport(request: GenerateReportRequest): Promise<{ filePath: string; downloadUrl: string }> {
    // Generate unique report ID
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Fetch data based on report type
      let data: any;
      
      switch (request.type) {
        case 'TIMESHEET_SUMMARY':
          data = await this.dataService.getTimesheetSummaryData(request.dateRange, request.tenantId);
          break;
        case 'ENGINEER_PERFORMANCE':
          data = await this.dataService.getEngineerPerformanceData(
            request.parameters?.engineerId || 'default',
            request.dateRange
          );
          break;
        case 'FINANCIAL_SUMMARY':
          data = await this.dataService.getFinancialSummaryData(request.dateRange, request.tenantId);
          break;
        default:
          throw new Error(`Unsupported report type: ${request.type}`);
      }

      // Generate HTML content
      const htmlContent = await this.pdfGenerator.generateHTML(request.type, data);
      
      // Generate PDF (for now, we'll store HTML - in production, convert to actual PDF)
      const pdfContent = await this.pdfGenerator.generatePDF(htmlContent);
      
      // Store in R2
      const fileName = `${request.type.toLowerCase()}_${reportId}.${request.format.toLowerCase()}`;
      const filePath = `reports/${request.tenantId}/${fileName}`;
      
      await this.env.DOCUMENTS.put(filePath, pdfContent);
      
      // Store report record in database
      await this.env.DB.prepare(`
        INSERT INTO reports (
          id, name, type, format, status, file_path, file_size,
          date_start, date_end, tenant_id, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        reportId,
        request.name,
        request.type,
        request.format,
        'COMPLETED',
        filePath,
        pdfContent.length,
        typeof request.dateRange.start === 'string' ? request.dateRange.start : request.dateRange.start.toISOString(),
        typeof request.dateRange.end === 'string' ? request.dateRange.end : request.dateRange.end.toISOString(),
        request.tenantId,
        'system',
        new Date().toISOString(),
        new Date().toISOString()
      ).run();
      
      // Generate download URL (valid for 24 hours)
      const downloadUrl = `https://api.humber-operations.com/reports/${reportId}/download`;
      
      return {
        filePath,
        downloadUrl
      };
      
    } catch (error) {
      console.error('Report generation failed:', error);
      throw error;
    }
  }

  async scheduleReport(schedule: any): Promise<string> {
    // Implementation for scheduled reports
    // This would integrate with Cloudflare Cron Triggers
    const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store schedule in database
    await this.env.DB.prepare(`
      INSERT INTO scheduled_reports (
        id, name, type, format, frequency, recipients, 
        is_active, tenant_id, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      scheduleId,
      schedule.name,
      schedule.type,
      schedule.format,
      schedule.frequency,
      JSON.stringify(schedule.recipients),
      true,
      schedule.tenantId,
      'system',
      new Date().toISOString()
    ).run();
    
    return scheduleId;
  }
}
