-- Migration 0002: Seed Data for Testing
-- Created: 2025-09-15
-- Description: Inserts sample data for testing and development

-- ================================
-- SAMPLE TENANT CONFIGURATIONS
-- ================================
INSERT OR IGNORE INTO tenant_configs (
  id, name, slug, tier, status, max_engineers, max_projects, max_storage_gb, max_api_calls_per_month,
  can_use_advanced_analytics, can_use_bulk_operations, can_use_custom_integrations,
  company_info, primary_contact, billing_info, assigned_database,
  created_at, updated_at
) VALUES 
-- Demo tenant for testing
(
  'tenant_demo_001',
  'Demo Engineering Corp',
  'demo-engineering',
  'PROFESSIONAL',
  'ACTIVE',
  50, 25, 100, 50000,
  true, true, false,
  '{"legalName":"Demo Engineering Corp","address":{"street":"123 Demo St","city":"Detroit","state":"MI","zipCode":"48201","country":"US"},"industry":"Automotive Engineering"}',
  '{"firstName":"Demo","lastName":"Admin","email":"admin@demo-engineering.com","phone":"+1234567890","title":"Operations Manager"}',
  '{"currency":"USD","billingCycle":"monthly","paymentMethod":"credit_card","billingEmail":"billing@demo-engineering.com","taxRate":6.0}',
  'DB_ENGINEER_001',
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
),
-- Test tenant for development
(
  'tenant_test_002', 
  'Test Automation LLC',
  'test-automation',
  'STARTER',
  'TRIAL',
  10, 5, 25, 10000,
  false, false, false,
  '{"legalName":"Test Automation LLC","address":{"street":"456 Test Ave","city":"Grand Rapids","state":"MI","zipCode":"49503","country":"US"},"industry":"Manufacturing Automation"}',
  '{"firstName":"Test","lastName":"User","email":"test@test-automation.com","phone":"+1987654321","title":"Engineering Director"}',
  '{"currency":"USD","billingCycle":"monthly","paymentMethod":"invoice","billingEmail":"accounting@test-automation.com","taxRate":6.0}',
  'DB_ENGINEER_002',
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
);

-- ================================
-- SAMPLE CANDIDATES (Engineers)
-- ================================
INSERT OR IGNORE INTO candidates (
  id, tenant_id, first_name, last_name, email, phone, category, status,
  drug_test_status, background_check_status, certification_status, ssn_verification_status,
  hourly_rate, currency, created_at, updated_at
) VALUES 
-- Available engineers ready for deployment
(
  'eng_electrical_001',
  'tenant_demo_001',
  'Sarah',
  'Johnson',
  'sarah.johnson@demo-engineering.com',
  '+1234567001',
  'ELECTRICAL_ENGINEER',
  'ready_for_deployment',
  'pass', 'pass', 'pass', 'pass',
  85.00, 'USD',
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
),
(
  'eng_mechanical_001',
  'tenant_demo_001',
  'Michael',
  'Chen',
  'michael.chen@demo-engineering.com',
  '+1234567002',
  'MECHANICAL_ENGINEER',
  'ready_for_deployment',
  'pass', 'pass', 'pass', 'pass',
  80.00, 'USD',
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
),
(
  'eng_software_001',
  'tenant_demo_001',
  'Emily',
  'Rodriguez',
  'emily.rodriguez@demo-engineering.com',
  '+1234567003',
  'SOFTWARE_ENGINEER',
  'deployed',
  'pass', 'pass', 'pass', 'pass',
  95.00, 'USD',
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
),
-- Engineers in various pipeline stages
(
  'eng_systems_001',
  'tenant_demo_001',
  'David',
  'Kim',
  'david.kim@demo-engineering.com',
  '+1234567004',
  'SYSTEMS_ENGINEER',
  'background_check',
  'pass', 'pending', 'pass', 'pass',
  88.00, 'USD',
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
),
(
  'eng_project_001',
  'tenant_demo_001',
  'Lisa',
  'Thompson',
  'lisa.thompson@demo-engineering.com',
  '+1234567005',
  'PROJECT_ENGINEER',
  'vetting',
  'pending', 'pending', 'pending', 'pending',
  75.00, 'USD',
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
);

-- ================================
-- SAMPLE DEPLOYMENTS
-- ================================
INSERT OR IGNORE INTO deployments (
  id, tenant_id, candidate_id, client_name, project_name, location,
  start_date, planned_end_date, outcome, performance_rating,
  hourly_rate, total_hours_worked, total_revenue, is_active,
  created_at, updated_at
) VALUES 
-- Active deployment
(
  'deploy_001',
  'tenant_demo_001',
  'eng_software_001',
  'General Motors',
  'Assembly Line Automation',
  'Detroit, MI',
  strftime('%s', '2025-01-15') * 1000,
  strftime('%s', '2025-07-15') * 1000,
  NULL, -- Still active
  NULL, -- Not rated yet
  95.00,
  480.0, -- 12 weeks * 40 hours
  45600.00, -- 480 * $95
  TRUE,
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
),
-- Completed successful deployment
(
  'deploy_002',
  'tenant_demo_001',
  'eng_electrical_001',
  'Ford Motor Company',
  'Paint Shop Upgrade',
  'Dearborn, MI',
  strftime('%s', '2024-08-01') * 1000,
  strftime('%s', '2024-12-31') * 1000,
  strftime('%s', '2024-12-20') * 1000,
  'pass',
  5, -- Excellent rating
  85.00,
  880.0, -- 22 weeks * 40 hours
  74800.00, -- 880 * $85
  FALSE,
  strftime('%s', '2024-08-01') * 1000,
  strftime('%s', '2024-12-20') * 1000
);

-- ================================
-- SAMPLE TIMESHEETS
-- ================================
INSERT OR IGNORE INTO timesheets (
  id, tenant_id, candidate_id, week_start_date, week_end_date,
  hours_worked, overtime_hours, status, client_reported_hours,
  reconciliation_status, hourly_rate, overtime_rate,
  regular_amount, total_amount, created_at, updated_at
) VALUES 
-- Current week timesheet
(
  'timesheet_001',
  'tenant_demo_001',
  'eng_software_001',
  strftime('%s', '2025-01-13') * 1000, -- Monday
  strftime('%s', '2025-01-19') * 1000, -- Sunday
  40.0, 0.0,
  'submitted',
  40.0, -- Client confirmed same hours
  'matched',
  95.00, 142.50, -- 1.5x overtime rate
  3800.00, 3800.00,
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
),
-- Previous week with overtime
(
  'timesheet_002',
  'tenant_demo_001',
  'eng_software_001',
  strftime('%s', '2025-01-06') * 1000,
  strftime('%s', '2025-01-12') * 1000,
  45.0, 5.0,
  'reconciled',
  42.0, -- Client reported less hours
  'resolved',
  95.00, 142.50,
  4275.00, 4275.00, -- 40 regular + 5 overtime
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
);

-- ================================
-- SAMPLE OPERATION LOGS
-- ================================
INSERT OR IGNORE INTO operation_logs (
  id, tenant_id, candidate_id, operation_type, operation_stage, status,
  details, performed_by, created_at
) VALUES 
(
  'log_001',
  'tenant_demo_001',
  'eng_software_001',
  'recruiting_step_1',
  'RECRUITING',
  'completed',
  '{"source":"referral","recruiterNotes":"Excellent React/TypeScript skills"}',
  'system',
  strftime('%s', '2024-12-01') * 1000
),
(
  'log_002',
  'tenant_demo_001',
  'eng_software_001',
  'deployment',
  'DEPLOYMENT',
  'deployed',
  '{"clientName":"General Motors","projectName":"Assembly Line Automation","location":"Detroit, MI"}',
  'admin@demo-engineering.com',
  strftime('%s', '2025-01-15') * 1000
),
(
  'log_003',
  'tenant_demo_001',
  'eng_electrical_001',
  'deployment',
  'DEPLOYMENT',
  'completed_successfully',
  '{"clientName":"Ford Motor Company","projectName":"Paint Shop Upgrade","outcome":"pass","rating":5}',
  'admin@demo-engineering.com',
  strftime('%s', '2024-12-20') * 1000
);
