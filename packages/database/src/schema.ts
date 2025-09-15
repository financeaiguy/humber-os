import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const candidates = sqliteTable('candidates', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  status: text('status').notNull().default('recruiting'),
  recruitingCompletedAt: integer('recruiting_completed_at'),
  vettingCompletedAt: integer('vetting_completed_at'),
  drugTestStatus: text('drug_test_status'),
  backgroundCheckStatus: text('background_check_status'),
  certificationStatus: text('certification_status'),
  ssnVerificationStatus: text('ssn_verification_status'),
  offerLetterSentAt: integer('offer_letter_sent_at'),
  visaStatus: text('visa_status'),
  deployedAt: integer('deployed_at'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const timesheets = sqliteTable('timesheets', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  candidateId: text('candidate_id').notNull().references(() => candidates.id),
  weekStartDate: integer('week_start_date').notNull(),
  weekEndDate: integer('week_end_date').notNull(),
  hoursWorked: real('hours_worked').notNull(),
  status: text('status').notNull().default('pending'),
  reconciledAt: integer('reconciled_at'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const operationLogs = sqliteTable('operation_logs', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  candidateId: text('candidate_id').references(() => candidates.id),
  operationType: text('operation_type').notNull(),
  status: text('status').notNull(),
  details: text('details'),
  createdAt: integer('created_at').notNull(),
});