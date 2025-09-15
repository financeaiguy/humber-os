-- Migration 0001: Initial Schema for Humber Operations
-- Created: 2025-09-15
-- Description: Creates core tables for candidates, timesheets, operations logs, and multi-tenant support

-- ================================
-- CANDIDATES TABLE
-- ================================
CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Engineer classification (5 categories as per requirements)
  category TEXT CHECK (category IN ('ELECTRICAL_ENGINEER', 'MECHANICAL_ENGINEER', 'SOFTWARE_ENGINEER', 'SYSTEMS_ENGINEER', 'PROJECT_ENGINEER')),
  
  -- Status progression (4 main states)
  status TEXT NOT NULL DEFAULT 'recruiting' CHECK (status IN (
    'recruiting', 'recruiting_completed', 'vetting', 'interviewing', 'hiring_decision',
    'drug_test', 'background_check', 'certification_check', 'ssn_verification',
    'offer_sent', 'offer_accepted', 'visa_processing', 'visa_approved',
    'ready_for_deployment', 'deployed', 'rejected', 'withdrawn', 'terminated'
  )),
  
  -- Required checks (all 4 required as per business requirements)
  drug_test_status TEXT DEFAULT 'pending' CHECK (drug_test_status IN ('pending', 'pass', 'fail')),
  background_check_status TEXT DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'pass', 'fail')),
  certification_status TEXT DEFAULT 'pending' CHECK (certification_status IN ('pending', 'pass', 'fail')),
  ssn_verification_status TEXT DEFAULT 'pending' CHECK (ssn_verification_status IN ('pending', 'pass', 'fail')),
  
  -- Timeline tracking
  recruiting_completed_at INTEGER,
  vetting_completed_at INTEGER,
  offer_letter_sent_at INTEGER,
  visa_status TEXT,
  deployed_at INTEGER,
  
  -- Financial information
  hourly_rate REAL,
  currency TEXT DEFAULT 'USD',
  
  -- Current deployment
  current_deployment_id TEXT,
  current_client_name TEXT,
  current_project_name TEXT,
  
  -- Timestamps
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- ================================
-- TIMESHEETS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS timesheets (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  candidate_id TEXT NOT NULL,
  
  -- Time period
  week_start_date INTEGER NOT NULL,
  week_end_date INTEGER NOT NULL,
  
  -- Hours tracking
  hours_worked REAL NOT NULL,
  overtime_hours REAL DEFAULT 0,
  
  -- Status with reconciliation flow
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'submitted', 'client_review', 'approved', 'rejected',
    'reconciling', 'reconciled', 'paid', 'disputed'
  )),
  
  -- Reconciliation data
  client_reported_hours REAL,
  client_reported_overtime REAL DEFAULT 0,
  reconciliation_status TEXT DEFAULT 'pending' CHECK (reconciliation_status IN (
    'pending', 'in_progress', 'matched', 'discrepancy', 'resolved', 'escalated'
  )),
  hours_difference REAL DEFAULT 0,
  final_hours REAL,
  final_overtime REAL,
  
  -- Financial calculations
  hourly_rate REAL NOT NULL,
  overtime_rate REAL,
  regular_amount REAL,
  overtime_amount REAL,
  total_amount REAL,
  
  -- Metadata
  description TEXT,
  reconciled_at INTEGER,
  reconciled_by TEXT,
  client_approved_at INTEGER,
  client_approved_by TEXT,
  requires_review BOOLEAN DEFAULT FALSE,
  review_reason TEXT,
  
  -- Timestamps
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);

-- ================================
-- DEPLOYMENTS TABLE (Pass/Fail Tracking)
-- ================================
CREATE TABLE IF NOT EXISTS deployments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  candidate_id TEXT NOT NULL,
  
  -- Deployment details
  client_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date INTEGER NOT NULL,
  planned_end_date INTEGER,
  actual_end_date INTEGER,
  
  -- Pass/Fail tracking as per requirements
  outcome TEXT CHECK (outcome IN ('pass', 'fail')),
  failure_reason TEXT,
  performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
  client_feedback TEXT,
  
  -- Financial tracking
  hourly_rate REAL NOT NULL,
  total_hours_worked REAL DEFAULT 0,
  total_revenue REAL DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);

-- ================================
-- OPERATION LOGS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS operation_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  candidate_id TEXT,
  deployment_id TEXT,
  
  -- Operation details
  operation_type TEXT NOT NULL,
  operation_stage TEXT CHECK (operation_stage IN ('RECRUITING', 'HIRING', 'VISA', 'DEPLOYMENT')),
  status TEXT NOT NULL,
  details TEXT, -- JSON data
  
  -- User tracking
  performed_by TEXT,
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamps
  created_at INTEGER NOT NULL,
  
  FOREIGN KEY (candidate_id) REFERENCES candidates(id),
  FOREIGN KEY (deployment_id) REFERENCES deployments(id)
);

-- ================================
-- TENANT CONFIGURATION TABLE
-- ================================
CREATE TABLE IF NOT EXISTS tenant_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  
  -- Subscription details
  tier TEXT NOT NULL CHECK (tier IN ('STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM')),
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'TRIAL', 'SUSPENDED', 'CANCELLED', 'PENDING')),
  
  -- Limits
  max_engineers INTEGER NOT NULL DEFAULT 10,
  max_projects INTEGER NOT NULL DEFAULT 5,
  max_storage_gb INTEGER NOT NULL DEFAULT 10,
  max_api_calls_per_month INTEGER NOT NULL DEFAULT 10000,
  
  -- Features
  can_use_advanced_analytics BOOLEAN DEFAULT FALSE,
  can_use_bulk_operations BOOLEAN DEFAULT FALSE,
  can_use_custom_integrations BOOLEAN DEFAULT FALSE,
  
  -- Business info (JSON)
  company_info TEXT, -- JSON object
  primary_contact TEXT, -- JSON object
  billing_info TEXT, -- JSON object
  
  -- Database assignment
  assigned_database TEXT, -- Which DB_ENGINEER_XXX this tenant uses
  
  -- Timestamps
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  trial_ends_at INTEGER,
  last_login_at INTEGER
);

-- ================================
-- TENANT AUDIT LOGS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS tenant_audit_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  
  -- Action details
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details TEXT, -- JSON data
  
  -- Request metadata
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamps
  created_at INTEGER NOT NULL,
  
  FOREIGN KEY (tenant_id) REFERENCES tenant_configs(id)
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Candidates indexes
CREATE INDEX IF NOT EXISTS idx_candidates_tenant ON candidates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_category ON candidates(category);
CREATE INDEX IF NOT EXISTS idx_candidates_deployed_at ON candidates(deployed_at);

-- Timesheets indexes
CREATE INDEX IF NOT EXISTS idx_timesheets_tenant ON timesheets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_candidate ON timesheets(candidate_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_dates ON timesheets(week_start_date, week_end_date);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status);
CREATE INDEX IF NOT EXISTS idx_timesheets_reconciliation ON timesheets(reconciliation_status);

-- Deployments indexes
CREATE INDEX IF NOT EXISTS idx_deployments_tenant ON deployments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deployments_candidate ON deployments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_deployments_active ON deployments(is_active);
CREATE INDEX IF NOT EXISTS idx_deployments_outcome ON deployments(outcome);
CREATE INDEX IF NOT EXISTS idx_deployments_dates ON deployments(start_date, actual_end_date);

-- Operation logs indexes
CREATE INDEX IF NOT EXISTS idx_logs_tenant ON operation_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_logs_candidate ON operation_logs(candidate_id);
CREATE INDEX IF NOT EXISTS idx_logs_type ON operation_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_logs_stage ON operation_logs(operation_stage);
CREATE INDEX IF NOT EXISTS idx_logs_created ON operation_logs(created_at);

-- Tenant configs indexes
CREATE INDEX IF NOT EXISTS idx_tenant_slug ON tenant_configs(slug);
CREATE INDEX IF NOT EXISTS idx_tenant_status ON tenant_configs(status);
CREATE INDEX IF NOT EXISTS idx_tenant_tier ON tenant_configs(tier);
CREATE INDEX IF NOT EXISTS idx_tenant_database ON tenant_configs(assigned_database);

-- Tenant audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON tenant_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON tenant_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON tenant_audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_created ON tenant_audit_logs(created_at);
