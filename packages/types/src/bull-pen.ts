import { z } from 'zod';
import { EngineerCategory, EngineerStatus, RequiredChecks } from './engineer';

// Re-export for backward compatibility
export { EngineerCategory, EngineerStatus } from './engineer';

export const ReconciliationStatus = z.enum([
  'pending',
  'auto_reconciled',
  'needs_review',
  'human_approved',
  'disputed',
  'resolved'
]);
export type ReconciliationStatus = z.infer<typeof ReconciliationStatus>;

// Engineer profile schema
export const EngineerProfileSchema = z.object({
  tenantId: z.string(),
  engineerId: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  idNumber: z.string().optional(),
  category: EngineerCategory,
  status: EngineerStatus.optional().default('AVAILABLE'),
  location: z.string().optional(),
  visaStatus: z.string().optional(),
  notActive: z.boolean().optional().default(false),
});
export type EngineerProfile = z.infer<typeof EngineerProfileSchema>;

// Recruiting Step 1 schema
export const RecruitingStep1BullPenSchema = z.object({
  tenantId: z.string(),
  engineerId: z.string(),
  hiredScreenedBy: z.string().min(1),
  resumeUpload: z.string().optional(),
  availability: z.object({
    startDate: z.string(),
    endDate: z.string().optional(),
    hoursPerWeek: z.number().optional(),
    timezone: z.string().optional(),
  }).optional(),
  specialtyKeywords: z.array(z.string()).optional(),
});
export type RecruitingStep1BullPen = z.infer<typeof RecruitingStep1BullPenSchema>;

// Hiring Step 2 schema
export const HiringStep2BullPenSchema = z.object({
  tenantId: z.string(),
  engineerId: z.string(),
  drugTest: z.boolean(),
  drugTestDate: z.string().optional(),
  drugTestResult: z.enum(['pass', 'fail', 'pending']).optional(),
  backgroundCheck: z.boolean(),
  backgroundCheckDate: z.string().optional(),
  backgroundCheckResult: z.enum(['clear', 'flagged', 'pending']).optional(),
  certification: z.boolean(),
  certificationDate: z.string().optional(),
  certificationDetails: z.string().optional(),
  ssnTin: z.boolean(),
  ssnTinDate: z.string().optional(),
  ssnTinStatus: z.enum(['verified', 'pending', 'failed']).optional(),
});
export type HiringStep2BullPen = z.infer<typeof HiringStep2BullPenSchema>;

// Timesheet reconciliation schemas
export const TimesheetSubmissionSchema = z.object({
  tenantId: z.string(),
  engineerId: z.string(),
  weekStartDate: z.string(),
  weekEndDate: z.string(),
  engineerHours: z.number().positive(),
  projectCode: z.string().optional(),
  notes: z.string().optional(),
});
export type TimesheetSubmission = z.infer<typeof TimesheetSubmissionSchema>;

export const CustomerTimesheetSchema = z.object({
  tenantId: z.string(),
  engineerId: z.string().optional(),
  engineerEmail: z.string().optional(),
  weekStartDate: z.string(),
  weekEndDate: z.string(),
  customerHours: z.number().nonnegative(),
  customerName: z.string(),
  projectCode: z.string().optional(),
  approvedBy: z.string().optional(),
});
export type CustomerTimesheet = z.infer<typeof CustomerTimesheetSchema>;

export const TimesheetReconciliationSchema = z.object({
  tenantId: z.string(),
  timesheetId: z.string().optional(),
  engineerId: z.string(),
  weekStartDate: z.string(),
  weekEndDate: z.string(),
  engineerHours: z.number().positive(),
  customerHours: z.number().nonnegative(),
  customerName: z.string(),
  projectCode: z.string().optional(),
  hourlyRate: z.number().positive().optional(),
  forceReconcile: z.boolean().optional().default(false),
});
export type TimesheetReconciliation = z.infer<typeof TimesheetReconciliationSchema>;

export const SpreadsheetUploadSchema = z.object({
  tenantId: z.string(),
  customerName: z.string(),
  weekStartDate: z.string(),
  weekEndDate: z.string(),
  spreadsheetData: z.array(z.object({
    engineerId: z.string().optional(),
    engineerEmail: z.string().optional(),
    engineerName: z.string().optional(),
    hoursWorked: z.number(),
    projectCode: z.string().optional(),
    rate: z.number().optional(),
  })),
  format: z.enum(['csv', 'xlsx', 'json']).optional(),
});
export type SpreadsheetUpload = z.infer<typeof SpreadsheetUploadSchema>;

export const HumanReviewSchema = z.object({
  tenantId: z.string(),
  timesheetId: z.string(),
  reviewedBy: z.string(),
  approvedHours: z.number().positive(),
  reviewNotes: z.string(),
  resolution: z.enum(['approve_engineer', 'approve_customer', 'split_difference', 'custom']),
});
export type HumanReview = z.infer<typeof HumanReviewSchema>;

// Deployment schema
export const DeploymentBullPenSchema = z.object({
  tenantId: z.string(),
  engineerId: z.string(),
  clientName: z.string(),
  projectName: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  jobsCount: z.number().int().nonnegative().optional(),
  status: z.enum(['active', 'completed', 'terminated', 'on_hold']).optional(),
});
export type DeploymentBullPen = z.infer<typeof DeploymentBullPenSchema>;

// Reconciliation thresholds and rules
export const ReconciliationRules = {
  // Automatic approval if difference is within this percentage
  AUTO_APPROVE_THRESHOLD_PERCENT: 5,
  // Automatic approval if difference is within this many hours
  AUTO_APPROVE_THRESHOLD_HOURS: 2,
  // Flag for review if difference exceeds this many hours
  REVIEW_REQUIRED_HOURS: 8,
  // Flag for review if difference exceeds this percentage
  REVIEW_REQUIRED_PERCENT: 10,
};

// Bull Pen Dashboard Data Structure
export const BullPenDashboardSchema = z.object({
  tenantId: z.string(),
  
  // Overview metrics
  overview: z.object({
    totalEngineers: z.number(),
    availableEngineers: z.number(),
    deployedEngineers: z.number(),
    engineersInProcess: z.number(),
    utilizationRate: z.number().min(0).max(100),
    averageHourlyRate: z.number(),
    totalRevenue: z.number(),
    monthlyRevenue: z.number()
  }),
  
  // Engineers by category breakdown (5 categories)
  engineersByCategory: z.object({
    Controls: z.object({
      total: z.number(),
      available: z.number(),
      deployed: z.number(),
      processing: z.number(),
      averageRate: z.number()
    }),
    Mechanical: z.object({
      total: z.number(),
      available: z.number(),
      deployed: z.number(),
      processing: z.number(),
      averageRate: z.number()
    }),
    Electrical: z.object({
      total: z.number(),
      available: z.number(),
      deployed: z.number(),
      processing: z.number(),
      averageRate: z.number()
    }),
    Piping: z.object({
      total: z.number(),
      available: z.number(),
      deployed: z.number(),
      processing: z.number(),
      averageRate: z.number()
    }),
    Robotics: z.object({
      total: z.number(),
      available: z.number(),
      deployed: z.number(),
      processing: z.number(),
      averageRate: z.number()
    })
  }),
  
  // 4 Status States
  engineersByStatus: z.object({
    Available: z.number(),
    Processing: z.number(),
    Buffered: z.number(),
    Deployed: z.number()
  }),
  
  // Current deployments
  activeDeployments: z.array(z.object({
    deploymentId: z.string(),
    engineerId: z.string(),
    engineerName: z.string(),
    engineerCategory: EngineerCategory,
    clientName: z.string(),
    projectName: z.string(),
    startDate: z.string(),
    plannedEndDate: z.string(),
    location: z.string(),
    hourlyRate: z.number(),
    hoursWorkedThisWeek: z.number(),
    status: z.enum(['active', 'ending_soon', 'overdue', 'at_risk'])
  })),
  
  // Available engineers ready for deployment
  availableEngineers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: EngineerCategory,
    location: z.string(),
    hourlyRate: z.number(),
    availableFrom: z.string(),
    lastDeploymentEnd: z.string().optional(),
    isDeploymentReady: z.boolean(),
    
    // Required checks status (all 4 required)
    requiredChecks: z.object({
      drug_test: z.enum(['pending', 'pass', 'fail']),
      background: z.enum(['pending', 'pass', 'fail']),
      certification: z.enum(['pending', 'pass', 'fail']),
      ssn_tin: z.enum(['pending', 'pass', 'fail'])
    })
  })),
  
  // Pipeline metrics
  pipeline: z.object({
    recruiting: z.number(),
    vetting: z.number(),
    backgroundChecks: z.number(),
    offerStage: z.number(),
    visaProcessing: z.number(),
    readyForDeployment: z.number()
  }),
  
  // Performance tracking with pass/fail
  performance: z.object({
    totalDeployments: z.number(),
    successfulDeployments: z.number(), // pass
    failedDeployments: z.number(),     // fail
    successRate: z.number().min(0).max(100),
    averageDeploymentDuration: z.number(),
    clientSatisfactionScore: z.number().min(0).max(5),
    revenuePerEngineer: z.number()
  }),
  
  // Recent activity
  recentActivity: z.array(z.object({
    id: z.string(),
    type: z.enum(['deployment_started', 'deployment_ended', 'engineer_added', 'timesheet_submitted', 'reconciliation_completed']),
    engineerId: z.string().optional(),
    engineerName: z.string().optional(),
    description: z.string(),
    timestamp: z.number()
  })),
  
  // Alerts requiring attention
  alerts: z.array(z.object({
    id: z.string(),
    type: z.enum(['deployment_ending', 'engineer_available', 'timesheet_overdue', 'reconciliation_needed', 'compliance_issue']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    title: z.string(),
    message: z.string(),
    actionRequired: z.boolean(),
    createdAt: z.number()
  })),
  
  // Generated timestamp
  generatedAt: z.number(),
  lastUpdatedAt: z.number()
});

export type BullPenDashboard = z.infer<typeof BullPenDashboardSchema>;