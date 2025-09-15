-- D1 Database Schema for Humber Operations

CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'recruiting',
  recruiting_completed_at INTEGER,
  vetting_completed_at INTEGER,
  drug_test_status TEXT,
  background_check_status TEXT,
  certification_status TEXT,
  ssn_verification_status TEXT,
  offer_letter_sent_at INTEGER,
  visa_status TEXT,
  deployed_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_candidates_tenant ON candidates(tenant_id);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_email ON candidates(email);

CREATE TABLE IF NOT EXISTS timesheets (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  candidate_id TEXT NOT NULL,
  week_start_date INTEGER NOT NULL,
  week_end_date INTEGER NOT NULL,
  hours_worked REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reconciled_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);

CREATE INDEX idx_timesheets_tenant ON timesheets(tenant_id);
CREATE INDEX idx_timesheets_candidate ON timesheets(candidate_id);
CREATE INDEX idx_timesheets_dates ON timesheets(week_start_date, week_end_date);

CREATE TABLE IF NOT EXISTS operation_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  candidate_id TEXT,
  operation_type TEXT NOT NULL,
  status TEXT NOT NULL,
  details TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);

CREATE INDEX idx_logs_tenant ON operation_logs(tenant_id);
CREATE INDEX idx_logs_candidate ON operation_logs(candidate_id);
CREATE INDEX idx_logs_type ON operation_logs(operation_type);