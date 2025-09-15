import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

// Engineers table with categories and status tracking
export const engineers = sqliteTable('engineers', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  idNumber: text('id_number').unique(),
  
  // Category ENUM: Controls, Mechanical, Electrical, Piping, Robotics
  category: text('category', { 
    enum: ['Controls', 'Mechanical', 'Electrical', 'Piping', 'Robotics'] 
  }).notNull(),
  
  // Status: Available, Processing, Buffered, Deployed
  status: text('status', {
    enum: ['Available', 'Processing', 'Buffered', 'Deployed']
  }).notNull().default('Available'),
  
  location: text('location'),
  visaStatus: text('visa_status'),
  notActive: integer('not_active', { mode: 'boolean' }).notNull().default(false),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(Date.now()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(Date.now()),
}, (table) => ({
  tenantIdx: index('idx_engineers_tenant').on(table.tenantId),
  categoryIdx: index('idx_engineers_category').on(table.category),
  statusIdx: index('idx_engineers_status').on(table.status),
  emailIdx: index('idx_engineers_email').on(table.email),
}));

// Recruiting Step 1 - Initial screening and resume collection
export const recruitingStep1 = sqliteTable('recruiting_step_1', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  engineerId: text('engineer_id').notNull().references(() => engineers.id),
  
  hiredScreenedBy: text('hired_screened_by').notNull(),
  resumeUpload: text('resume_upload'), // URL or file reference
  availability: text('availability'), // JSON string with availability details
  specialtyKeywords: text('specialty_keywords'), // Comma-separated keywords
  
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(Date.now()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(Date.now()),
}, (table) => ({
  engineerIdx: index('idx_recruiting_step1_engineer').on(table.engineerId),
  tenantIdx: index('idx_recruiting_step1_tenant').on(table.tenantId),
}));

// Hiring Step 2 - Background checks and verifications
export const hiringStep2 = sqliteTable('hiring_step_2', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  engineerId: text('engineer_id').notNull().references(() => engineers.id),
  
  drugTest: integer('drug_test', { mode: 'boolean' }).notNull().default(false),
  drugTestDate: integer('drug_test_date', { mode: 'timestamp' }),
  drugTestResult: text('drug_test_result'),
  
  backgroundCheck: integer('background_check', { mode: 'boolean' }).notNull().default(false),
  backgroundCheckDate: integer('background_check_date', { mode: 'timestamp' }),
  backgroundCheckResult: text('background_check_result'),
  
  certification: integer('certification', { mode: 'boolean' }).notNull().default(false),
  certificationDate: integer('certification_date', { mode: 'timestamp' }),
  certificationDetails: text('certification_details'),
  
  ssnTin: integer('ssn_tin', { mode: 'boolean' }).notNull().default(false),
  ssnTinDate: integer('ssn_tin_date', { mode: 'timestamp' }),
  ssnTinStatus: text('ssn_tin_status'),
  
  allChecksPassed: integer('all_checks_passed', { mode: 'boolean' }).notNull().default(false),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(Date.now()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(Date.now()),
}, (table) => ({
  engineerIdx: index('idx_hiring_step2_engineer').on(table.engineerId),
  tenantIdx: index('idx_hiring_step2_tenant').on(table.tenantId),
}));

// Enhanced Timesheets table for reconciliation problem
export const timesheetsReconciliation = sqliteTable('timesheets_reconciliation', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  engineerId: text('engineer_id').notNull().references(() => engineers.id),
  
  weekStartDate: integer('week_start_date', { mode: 'timestamp' }).notNull(),
  weekEndDate: integer('week_end_date', { mode: 'timestamp' }).notNull(),
  
  // Core reconciliation fields
  engineerHours: real('engineer_hours').notNull(), // Hours reported by engineer
  customerHours: real('customer_hours'), // Hours reported by customer
  difference: real('difference'), // Calculated difference
  reconciledHours: real('reconciled_hours'), // Final reconciled amount
  
  // Human review flags
  humanInLoop: integer('human_in_loop', { mode: 'boolean' }).notNull().default(false),
  humanReviewedBy: text('human_reviewed_by'),
  humanReviewedAt: integer('human_reviewed_at', { mode: 'timestamp' }),
  humanReviewNotes: text('human_review_notes'),
  
  // Customer data
  customerSpreadsheet: text('customer_spreadsheet'), // JSON with parsed spreadsheet data
  customerSpreadsheetUrl: text('customer_spreadsheet_url'),
  customerName: text('customer_name'),
  projectCode: text('project_code'),
  
  // Status tracking
  status: text('status', {
    enum: ['pending', 'auto_reconciled', 'needs_review', 'human_approved', 'disputed', 'resolved']
  }).notNull().default('pending'),
  
  // Rates and amounts
  hourlyRate: real('hourly_rate'),
  totalAmount: real('total_amount'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(Date.now()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(Date.now()),
}, (table) => ({
  engineerIdx: index('idx_timesheets_recon_engineer').on(table.engineerId),
  tenantIdx: index('idx_timesheets_recon_tenant').on(table.tenantId),
  dateIdx: index('idx_timesheets_recon_dates').on(table.weekStartDate, table.weekEndDate),
  statusIdx: index('idx_timesheets_recon_status').on(table.status),
  humanReviewIdx: index('idx_timesheets_recon_human').on(table.humanInLoop),
}));

// Deployments tracking table
export const deployments = sqliteTable('deployments', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  engineerId: text('engineer_id').notNull().references(() => engineers.id),
  
  clientName: text('client_name').notNull(),
  projectName: text('project_name').notNull(),
  location: text('location').notNull(),
  
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }),
  
  jobsCount: integer('jobs_count').notNull().default(0),
  passed: integer('passed').notNull().default(0),
  failed: integer('failed').notNull().default(0),
  
  status: text('status', {
    enum: ['active', 'completed', 'terminated', 'on_hold']
  }).notNull().default('active'),
  
  performanceRating: real('performance_rating'),
  clientFeedback: text('client_feedback'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(Date.now()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(Date.now()),
}, (table) => ({
  engineerIdx: index('idx_deployments_engineer').on(table.engineerId),
  tenantIdx: index('idx_deployments_tenant').on(table.tenantId),
  statusIdx: index('idx_deployments_status').on(table.status),
  clientIdx: index('idx_deployments_client').on(table.clientName),
}));

// Reconciliation audit log for tracking all changes
export const reconciliationAuditLog = sqliteTable('reconciliation_audit_log', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  timesheetId: text('timesheet_id').notNull().references(() => timesheetsReconciliation.id),
  
  action: text('action').notNull(), // 'auto_reconciled', 'human_review', 'disputed', etc.
  performedBy: text('performed_by'), // System or user ID
  
  previousEngineerHours: real('previous_engineer_hours'),
  previousCustomerHours: real('previous_customer_hours'),
  newEngineerHours: real('new_engineer_hours'),
  newCustomerHours: real('new_customer_hours'),
  
  reason: text('reason'),
  details: text('details'), // JSON with additional context
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(Date.now()),
}, (table) => ({
  timesheetIdx: index('idx_audit_timesheet').on(table.timesheetId),
  tenantIdx: index('idx_audit_tenant').on(table.tenantId),
}));