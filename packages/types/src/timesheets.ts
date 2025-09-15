import { z } from 'zod';

// Timesheet Status with clear reconciliation flow
export const TimesheetStatus = z.enum([
  'draft',           // Being created/edited
  'submitted',       // Submitted by engineer
  'client_review',   // Under client review
  'approved',        // Approved by client
  'rejected',        // Rejected by client
  'reconciling',     // In reconciliation process
  'reconciled',      // Reconciliation complete
  'paid',           // Payment processed
  'disputed'        // Under dispute resolution
]);

export type TimesheetStatus = z.infer<typeof TimesheetStatus>;

// Import shared ReconciliationStatus from bull-pen to maintain consistency
import { ReconciliationStatus } from './bull-pen';
export { ReconciliationStatus };

// Timesheet Reconciliation Data Structure
export const TimesheetReconciliationSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  timesheetId: z.string(),
  candidateId: z.string(),
  weekStartDate: z.string(),
  weekEndDate: z.string(),
  
  // Engineer reported data
  engineerReported: z.object({
    hoursWorked: z.number().min(0).max(168), // Max hours in a week
    overtimeHours: z.number().min(0).default(0),
    description: z.string().optional(),
    submittedAt: z.number(),
    submittedBy: z.string()
  }),
  
  // Client reported data
  clientReported: z.object({
    hoursWorked: z.number().min(0).max(168),
    overtimeHours: z.number().min(0).default(0),
    description: z.string().optional(),
    approvedAt: z.number().optional(),
    approvedBy: z.string().optional()
  }).optional(),
  
  // Reconciliation results
  reconciliation: z.object({
    status: ReconciliationStatus,
    hoursDifference: z.number().default(0),
    overtimeDifference: z.number().default(0),
    finalHours: z.number().optional(),
    finalOvertime: z.number().optional(),
    notes: z.string().optional(),
    reconciledAt: z.number().optional(),
    reconciledBy: z.string().optional(),
    requiresReview: z.boolean().default(false),
    reviewReason: z.string().optional()
  }),
  
  // Financial data
  billing: z.object({
    hourlyRate: z.number().positive(),
    overtimeRate: z.number().positive(),
    regularAmount: z.number().optional(),
    overtimeAmount: z.number().optional(),
    totalAmount: z.number().optional(),
    currency: z.string().default('USD')
  }),
  
  // Metadata
  status: TimesheetStatus,
  createdAt: z.number(),
  updatedAt: z.number()
});

export type TimesheetReconciliation = z.infer<typeof TimesheetReconciliationSchema>;

export const TimesheetReconcileSchema = z.object({
  tenantId: z.string(),
  timesheetId: z.string().optional(),
  candidateId: z.string(),
  weekStartDate: z.string(),
  weekEndDate: z.string(),
  hoursWorked: z.number().positive(),
  hourlyRate: z.number().positive().optional(),
  notes: z.string().optional(),
});

export type TimesheetReconcileInput = z.infer<typeof TimesheetReconcileSchema>;

export const TimesheetBatchReconcileSchema = z.object({
  tenantId: z.string(),
  timesheets: z.array(TimesheetReconcileSchema),
});

export type TimesheetBatchReconcileInput = z.infer<typeof TimesheetBatchReconcileSchema>;