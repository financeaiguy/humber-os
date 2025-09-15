-- Tenant Database Schema
-- Each tenant/engineer gets their own isolated instance of this schema

-- Engineers table - core engineer data
CREATE TABLE IF NOT EXISTS engineers (
  id TEXT PRIMARY KEY,
  resume TEXT,
  availability TEXT,
  specialty_keywords TEXT,
  screened_by TEXT,
  screened_at TEXT,
  status TEXT DEFAULT 'recruited' CHECK(status IN (
    'recruited', 'screening', 'vetting', 'background_check', 
    'offer_sent', 'offer_accepted', 'visa_processing', 
    'ready_to_deploy', 'deployed', 'on_project', 'available',
    'suspended', 'terminated', 'rejected'
  )),
  deployment_count INTEGER DEFAULT 0,
  current_project_id TEXT,
  current_client TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_engineers_status ON engineers(status);
CREATE INDEX IF NOT EXISTS idx_engineers_availability ON engineers(availability);

-- Vetting sessions for tracking the vetting process
CREATE TABLE IF NOT EXISTS vetting_sessions (
  id TEXT PRIMARY KEY,
  engineer_id TEXT NOT NULL,
  initiated_by TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'failed')),
  notes TEXT,
  decision TEXT CHECK(decision IN ('approved', 'rejected', 'hold', 'more_info_needed')),
  created_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (engineer_id) REFERENCES engineers(id)
);

CREATE INDEX IF NOT EXISTS idx_vetting_engineer ON vetting_sessions(engineer_id);
CREATE INDEX IF NOT EXISTS idx_vetting_status ON vetting_sessions(status);

-- Individual vetting checks
CREATE TABLE IF NOT EXISTS vetting_checks (
  id TEXT PRIMARY KEY,
  vetting_session_id TEXT NOT NULL,
  engineer_id TEXT NOT NULL,
  check_type TEXT NOT NULL CHECK(check_type IN (
    'identity_verification', 'education_verification', 'employment_history',
    'criminal_background', 'drug_test', 'credit_check', 'reference_check',
    'skill_assessment', 'certification_verification', 'security_clearance'
  )),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'passed', 'failed', 'inconclusive')),
  result TEXT,
  notes TEXT,
  verified_by TEXT,
  initiated_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (vetting_session_id) REFERENCES vetting_sessions(id),
  FOREIGN KEY (engineer_id) REFERENCES engineers(id)
);

CREATE INDEX IF NOT EXISTS idx_checks_session ON vetting_checks(vetting_session_id);
CREATE INDEX IF NOT EXISTS idx_checks_engineer ON vetting_checks(engineer_id);
CREATE INDEX IF NOT EXISTS idx_checks_type_status ON vetting_checks(check_type, status);

-- Offers table for tracking offer letters
CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  engineer_id TEXT NOT NULL,
  position TEXT NOT NULL,
  salary REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  start_date TEXT,
  end_date TEXT, -- For contract positions
  employment_type TEXT CHECK(employment_type IN ('full_time', 'contract', 'contract_to_hire')),
  location TEXT,
  remote_option TEXT CHECK(remote_option IN ('onsite', 'remote', 'hybrid')),
  needs_visa BOOLEAN DEFAULT 0,
  visa_type TEXT,
  status TEXT DEFAULT 'draft' CHECK(status IN (
    'draft', 'sent', 'negotiating', 'accepted', 'rejected', 'expired', 'withdrawn'
  )),
  sent_at TEXT,
  response_deadline TEXT,
  accepted_at TEXT,
  rejected_at TEXT,
  rejection_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (engineer_id) REFERENCES engineers(id)
);

CREATE INDEX IF NOT EXISTS idx_offers_engineer ON offers(engineer_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);

-- Visa applications tracking
CREATE TABLE IF NOT EXISTS visa_applications (
  id TEXT PRIMARY KEY,
  engineer_id TEXT NOT NULL,
  offer_id TEXT,
  visa_type TEXT NOT NULL,
  sponsor_company TEXT,
  application_number TEXT,
  status TEXT DEFAULT 'not_started' CHECK(status IN (
    'not_started', 'documents_gathering', 'application_submitted',
    'under_review', 'additional_info_requested', 'interview_scheduled',
    'approved', 'denied', 'withdrawn'
  )),
  priority TEXT CHECK(priority IN ('normal', 'expedited', 'premium')),
  estimated_completion_date TEXT,
  actual_completion_date TEXT,
  denial_reason TEXT,
  initiated_at TEXT,
  submitted_at TEXT,
  approved_at TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (engineer_id) REFERENCES engineers(id),
  FOREIGN KEY (offer_id) REFERENCES offers(id)
);

CREATE INDEX IF NOT EXISTS idx_visa_engineer ON visa_applications(engineer_id);
CREATE INDEX IF NOT EXISTS idx_visa_status ON visa_applications(status);

-- Visa requirements checklist
CREATE TABLE IF NOT EXISTS visa_requirements (
  id TEXT PRIMARY KEY,
  visa_id TEXT NOT NULL,
  requirement TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'not_applicable')),
  completed_by TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (visa_id) REFERENCES visa_applications(id)
);

CREATE INDEX IF NOT EXISTS idx_visa_req_visa ON visa_requirements(visa_id);

-- Deployments table for tracking engineer assignments
CREATE TABLE IF NOT EXISTS deployments (
  id TEXT PRIMARY KEY,
  engineer_id TEXT NOT NULL,
  project_id TEXT,
  client_name TEXT NOT NULL,
  project_name TEXT,
  location TEXT,
  remote_status TEXT CHECK(remote_status IN ('onsite', 'remote', 'hybrid')),
  rate_type TEXT CHECK(rate_type IN ('hourly', 'daily', 'monthly', 'project')),
  rate_amount REAL,
  currency TEXT DEFAULT 'USD',
  start_date TEXT NOT NULL,
  end_date TEXT,
  actual_end_date TEXT,
  status TEXT DEFAULT 'scheduled' CHECK(status IN (
    'scheduled', 'active', 'completed', 'extended', 'terminated_early', 'failed'
  )),
  termination_reason TEXT,
  client_feedback TEXT,
  client_rating INTEGER CHECK(client_rating >= 1 AND client_rating <= 5),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (engineer_id) REFERENCES engineers(id)
);

CREATE INDEX IF NOT EXISTS idx_deployments_engineer ON deployments(engineer_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_dates ON deployments(start_date, end_date);

-- Deployment failures tracking
CREATE TABLE IF NOT EXISTS deployment_failures (
  id TEXT PRIMARY KEY,
  deployment_id TEXT,
  engineer_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  category TEXT CHECK(category IN (
    'performance', 'attendance', 'skill_mismatch', 'client_dissatisfaction',
    'personal_emergency', 'visa_issue', 'background_check_fail', 'other'
  )),
  severity TEXT CHECK(severity IN ('minor', 'moderate', 'severe')),
  preventable BOOLEAN DEFAULT 1,
  lessons_learned TEXT,
  occurred_at TEXT NOT NULL,
  reported_by TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (deployment_id) REFERENCES deployments(id),
  FOREIGN KEY (engineer_id) REFERENCES engineers(id)
);

CREATE INDEX IF NOT EXISTS idx_failures_deployment ON deployment_failures(deployment_id);
CREATE INDEX IF NOT EXISTS idx_failures_engineer ON deployment_failures(engineer_id);

-- Operation logs for tracking all operations
CREATE TABLE IF NOT EXISTS operation_logs (
  id TEXT PRIMARY KEY,
  engineer_id TEXT,
  operation_type TEXT NOT NULL,
  status TEXT NOT NULL,
  details TEXT,
  error_message TEXT,
  initiated_by TEXT,
  duration_ms INTEGER,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_oplogs_engineer ON operation_logs(engineer_id);
CREATE INDEX IF NOT EXISTS idx_oplogs_type ON operation_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_oplogs_created ON operation_logs(created_at);

-- Documents tracking for engineer documentation
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  engineer_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size_bytes INTEGER,
  mime_type TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'archived', 'deleted')),
  uploaded_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (engineer_id) REFERENCES engineers(id)
);

CREATE INDEX IF NOT EXISTS idx_docs_engineer ON documents(engineer_id);
CREATE INDEX IF NOT EXISTS idx_docs_type ON documents(document_type);

-- Skills and certifications
CREATE TABLE IF NOT EXISTS engineer_skills (
  id TEXT PRIMARY KEY,
  engineer_id TEXT NOT NULL,
  skill_category TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  proficiency_level TEXT CHECK(proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience REAL,
  last_used_date TEXT,
  verified BOOLEAN DEFAULT 0,
  verified_by TEXT,
  verified_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (engineer_id) REFERENCES engineers(id)
);

CREATE INDEX IF NOT EXISTS idx_skills_engineer ON engineer_skills(engineer_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON engineer_skills(skill_category);

-- Time tracking for deployed engineers
CREATE TABLE IF NOT EXISTS time_entries (
  id TEXT PRIMARY KEY,
  engineer_id TEXT NOT NULL,
  deployment_id TEXT,
  date TEXT NOT NULL,
  hours_worked REAL NOT NULL,
  overtime_hours REAL DEFAULT 0,
  break_minutes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'invoiced')),
  approved_by TEXT,
  approved_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (engineer_id) REFERENCES engineers(id),
  FOREIGN KEY (deployment_id) REFERENCES deployments(id),
  UNIQUE(engineer_id, deployment_id, date)
);

CREATE INDEX IF NOT EXISTS idx_time_engineer_date ON time_entries(engineer_id, date);
CREATE INDEX IF NOT EXISTS idx_time_deployment ON time_entries(deployment_id);
CREATE INDEX IF NOT EXISTS idx_time_status ON time_entries(status);