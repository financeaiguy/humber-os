import { z } from 'zod';

// Report Types
export const ReportTypeSchema = z.enum([
  'TIMESHEET_SUMMARY',
  'ENGINEER_PERFORMANCE',
  'COMPLIANCE_AUDIT',
  'FINANCIAL_SUMMARY',
  'DEPLOYMENT_METRICS',
  'DISCREPANCY_ANALYSIS',
  'UTILIZATION_REPORT',
  'COST_ANALYSIS',
  'REVENUE_BREAKDOWN',
  'CUSTOM_REPORT'
]);

export type ReportType = z.infer<typeof ReportTypeSchema>;

// Report Format
export const ReportFormatSchema = z.enum([
  'PDF',
  'EXCEL',
  'CSV',
  'JSON',
  'HTML'
]);

export type ReportFormat = z.infer<typeof ReportFormatSchema>;

// Report Status
export const ReportStatusSchema = z.enum([
  'PENDING',
  'GENERATING',
  'COMPLETED',
  'FAILED',
  'CANCELLED'
]);

export type ReportStatus = z.infer<typeof ReportStatusSchema>;

// Report Frequency
export const ReportFrequencySchema = z.enum([
  'ONCE',
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'ANNUALLY'
]);

export type ReportFrequency = z.infer<typeof ReportFrequencySchema>;

// Base Report Schema
export const ReportSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: ReportTypeSchema,
  format: ReportFormatSchema,
  status: ReportStatusSchema,
  
  // Configuration
  parameters: z.record(z.any()).optional(),
  filters: z.record(z.any()).optional(),
  
  // Date Range
  dateRange: z.object({
    start: z.date(),
    end: z.date()
  }),
  
  // Output
  filePath: z.string().optional(),
  fileSize: z.number().optional(),
  downloadUrl: z.string().optional(),
  expiresAt: z.date().optional(),
  
  // Metadata
  tenantId: z.string(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
  
  // Error handling
  errorMessage: z.string().optional(),
  retryCount: z.number().default(0)
});

export type Report = z.infer<typeof ReportSchema>;

// Scheduled Report Schema
export const ScheduledReportSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  
  // Report Configuration
  type: ReportTypeSchema,
  format: ReportFormatSchema,
  parameters: z.record(z.any()).optional(),
  filters: z.record(z.any()).optional(),
  
  // Scheduling
  frequency: ReportFrequencySchema,
  scheduleConfig: z.object({
    dayOfWeek: z.number().optional(), // 0-6 (Sunday-Saturday)
    dayOfMonth: z.number().optional(), // 1-31
    hour: z.number().min(0).max(23),
    minute: z.number().min(0).max(59),
    timezone: z.string().optional()
  }),
  
  // Recipients
  recipients: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional()
  })),
  
  // Status
  isActive: z.boolean(),
  lastRunAt: z.date().optional(),
  nextRunAt: z.date().optional(),
  
  // Metadata
  tenantId: z.string(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type ScheduledReport = z.infer<typeof ScheduledReportSchema>;

// Report Template Schema
export const ReportTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: ReportTypeSchema,
  
  // Template Configuration
  layout: z.object({
    header: z.object({
      showLogo: z.boolean(),
      showTitle: z.boolean(),
      showDate: z.boolean(),
      customText: z.string().optional()
    }),
    footer: z.object({
      showPageNumbers: z.boolean(),
      showGeneratedDate: z.boolean(),
      customText: z.string().optional()
    }),
    styling: z.object({
      primaryColor: z.string(),
      secondaryColor: z.string(),
      fontFamily: z.string(),
      fontSize: z.number()
    })
  }),
  
  // Sections
  sections: z.array(z.object({
    id: z.string(),
    type: z.enum(['TEXT', 'TABLE', 'CHART', 'IMAGE', 'SPACER']),
    title: z.string().optional(),
    config: z.record(z.any()),
    order: z.number()
  })),
  
  // Metadata
  tenantId: z.string(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isDefault: z.boolean().default(false)
});

export type ReportTemplate = z.infer<typeof ReportTemplateSchema>;

// Generate Report Request Schema
export const GenerateReportRequestSchema = z.object({
  type: ReportTypeSchema,
  format: ReportFormatSchema,
  name: z.string(),
  description: z.string().optional(),
  
  // Date Range
  dateRange: z.object({
    start: z.date(),
    end: z.date()
  }),
  
  // Configuration
  parameters: z.record(z.any()).optional(),
  filters: z.record(z.any()).optional(),
  templateId: z.string().optional(),
  
  // Delivery
  emailTo: z.array(z.string().email()).optional(),
  
  tenantId: z.string()
});

export type GenerateReportRequest = z.infer<typeof GenerateReportRequestSchema>;

// Report Data Schemas for different report types

// Timesheet Summary Report Data
export const TimesheetSummaryDataSchema = z.object({
  summary: z.object({
    totalHours: z.number(),
    totalEngineers: z.number(),
    averageHoursPerEngineer: z.number(),
    totalDiscrepancies: z.number(),
    discrepancyRate: z.number()
  }),
  engineers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    totalHours: z.number(),
    regularHours: z.number(),
    overtimeHours: z.number(),
    discrepancies: z.number(),
    status: z.string()
  })),
  discrepancies: z.array(z.object({
    engineerId: z.string(),
    engineerName: z.string(),
    date: z.date(),
    humberHours: z.number(),
    clientHours: z.number(),
    difference: z.number(),
    status: z.string()
  }))
});

export type TimesheetSummaryData = z.infer<typeof TimesheetSummaryDataSchema>;

// Engineer Performance Report Data
export const EngineerPerformanceDataSchema = z.object({
  engineer: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    category: z.string(),
    hireDate: z.date(),
    status: z.string()
  }),
  metrics: z.object({
    totalHours: z.number(),
    utilizationRate: z.number(),
    averageRating: z.number(),
    completedProjects: z.number(),
    onTimeDelivery: z.number(),
    clientSatisfaction: z.number()
  }),
  recentProjects: z.array(z.object({
    name: z.string(),
    client: z.string(),
    startDate: z.date(),
    endDate: z.date().optional(),
    status: z.string(),
    rating: z.number().optional()
  })),
  timeTracking: z.array(z.object({
    date: z.date(),
    hours: z.number(),
    project: z.string(),
    client: z.string()
  }))
});

export type EngineerPerformanceData = z.infer<typeof EngineerPerformanceDataSchema>;

// Financial Summary Report Data
export const FinancialSummaryDataSchema = z.object({
  summary: z.object({
    totalRevenue: z.number(),
    totalCosts: z.number(),
    grossProfit: z.number(),
    profitMargin: z.number(),
    billableHours: z.number(),
    averageHourlyRate: z.number()
  }),
  revenueByClient: z.array(z.object({
    clientName: z.string(),
    revenue: z.number(),
    hours: z.number(),
    averageRate: z.number(),
    percentage: z.number()
  })),
  revenueByCategory: z.array(z.object({
    category: z.string(),
    revenue: z.number(),
    hours: z.number(),
    engineers: z.number(),
    percentage: z.number()
  })),
  monthlyTrends: z.array(z.object({
    month: z.string(),
    revenue: z.number(),
    costs: z.number(),
    profit: z.number(),
    hours: z.number()
  }))
});

export type FinancialSummaryData = z.infer<typeof FinancialSummaryDataSchema>;
