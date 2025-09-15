-- Bull Pen System D1 Database Schema

-- Engineers table with categories and status
CREATE TABLE IF NOT EXISTS engineers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  id_number TEXT UNIQUE,
  category TEXT CHECK(category IN ('Controls', 'Mechanical', 'Electrical', 'Piping', 'Robotics')) NOT NULL,
  status TEXT CHECK(status IN ('Available', 'Processing', 'Buffered', 'Deployed')) NOT NULL DEFAULT 'Available',
  location TEXT,
  visa_status TEXT,
  not_active INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_engineers_tenant ON engineers(tenant_id);
CREATE INDEX idx_engineers_category ON engineers(category);
CREATE INDEX idx_engineers_status ON engineers(status);
CREATE INDEX idx_engineers_email ON engineers(email);

-- Recruiting Step 1
CREATE TABLE IF NOT EXISTS recruiting_step_1 (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  engineer_id TEXT NOT NULL,
  hired_screened_by TEXT NOT NULL,
  resume_upload TEXT,
  availability TEXT,
  specialty_keywords TEXT,
  completed_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (engineer_id) REFERENCES engineers(id)
);

CREATE INDEX idx_recruiting_step1_engineer ON recruiting_step_1(engineer_id);
CREATE INDEX idx_recruiting_step1_tenant ON recruiting_step_1(tenant_id);

-- Hiring Step 2 - Background checks
CREATE TABLE IF NOT EXISTS hiring_step_2 (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  engineer_id TEXT NOT NULL,
  drug_test INTEGER DEFAULT 0,
  drug_test_date INTEGER,
  drug_test_result TEXT,
  background_check INTEGER DEFAULT 0,
  background_check_date INTEGER,
  background_check_result TEXT,
  certification INTEGER DEFAULT 0,
  certification_date INTEGER,
  certification_details TEXT,
  ssn_tin INTEGER DEFAULT 0,
  ssn_tin_date INTEGER,
  ssn_tin_status TEXT,
  all_checks_passed INTEGER DEFAULT 0,
  completed_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (engineer_id) REFERENCES engineers(id)
);

CREATE INDEX idx_hiring_step2_engineer ON hiring_step_2(engineer_id);
CREATE INDEX idx_hiring_step2_tenant ON hiring_step_2(tenant_id);

-- Enhanced Timesheets for reconciliation problem
CREATE TABLE IF NOT EXISTS timesheets_reconciliation (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  engineer_id TEXT NOT NULL,
  week_start_date INTEGER NOT NULL,
  week_end_date INTEGER NOT NULL,
  engineer_hours REAL NOT NULL,
  customer_hours REAL,
  difference REAL,
  reconciled_hours REAL,
  human_in_loop INTEGER DEFAULT 0,
  human_reviewed_by TEXT,
  human_reviewed_at INTEGER,
  human_review_notes TEXT,
  customer_spreadsheet TEXT,
  customer_spreadsheet_url TEXT,
  customer_name TEXT,
  project_code TEXT,
  status TEXT CHECK(status IN ('pending', 'auto_reconciled', 'needs_review', 'human_approved', 'disputed', 'resolved')) DEFAULT 'pending',
  hourly_rate REAL,
  total_amount REAL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (engineer_id) REFERENCES engineers(id)
);

CREATE INDEX idx_timesheets_recon_engineer ON timesheets_reconciliation(engineer_id);
CREATE INDEX idx_timesheets_recon_tenant ON timesheets_reconciliation(tenant_id);
CREATE INDEX idx_timesheets_recon_dates ON timesheets_reconciliation(week_start_date, week_end_date);
CREATE INDEX idx_timesheets_recon_status ON timesheets_reconciliation(status);
CREATE INDEX idx_timesheets_recon_human ON timesheets_reconciliation(human_in_loop);

-- Deployments tracking
CREATE TABLE IF NOT EXISTS deployments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  engineer_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date INTEGER NOT NULL,
  end_date INTEGER,
  jobs_count INTEGER DEFAULT 0,
  passed INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('active', 'completed', 'terminated', 'on_hold')) DEFAULT 'active',
  performance_rating REAL,
  client_feedback TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (engineer_id) REFERENCES engineers(id)
);

CREATE INDEX idx_deployments_engineer ON deployments(engineer_id);
CREATE INDEX idx_deployments_tenant ON deployments(tenant_id);
CREATE INDEX idx_deployments_status ON deployments(status);
CREATE INDEX idx_deployments_client ON deployments(client_name);

-- Reconciliation audit log
CREATE TABLE IF NOT EXISTS reconciliation_audit_log (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  timesheet_id TEXT NOT NULL,
  action TEXT NOT NULL,
  performed_by TEXT,
  previous_engineer_hours REAL,
  previous_customer_hours REAL,
  new_engineer_hours REAL,
  new_customer_hours REAL,
  reason TEXT,
  details TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (timesheet_id) REFERENCES timesheets_reconciliation(id)
);

CREATE INDEX idx_audit_timesheet ON reconciliation_audit_log(timesheet_id);
CREATE INDEX idx_audit_tenant ON reconciliation_audit_log(tenant_id);