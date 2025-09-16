-- Recruiting System Database Schema
-- Compliant with GDPR, BIPA, and CCPA requirements

-- Recruits table with encrypted PII fields
CREATE TABLE IF NOT EXISTS recruits (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  
  -- Personal Information (ENCRYPTED for GDPR/BIPA compliance)
  first_name_encrypted TEXT NOT NULL,
  last_name_encrypted TEXT NOT NULL,
  email_encrypted TEXT NOT NULL,
  phone_encrypted TEXT,
  current_location_encrypted TEXT,
  
  -- Searchable hashes (for duplicate detection without exposing PII)
  email_hash TEXT NOT NULL UNIQUE,
  phone_hash TEXT,
  
  -- Professional Information (Non-PII)
  job_title TEXT NOT NULL,
  years_experience INTEGER NOT NULL DEFAULT 0,
  current_company TEXT,
  desired_salary TEXT,
  
  -- Skills & Education (JSON, sanitized)
  skills TEXT, -- JSON array of sanitized skills
  education TEXT,
  certifications TEXT, -- JSON array of sanitized certifications
  
  -- Availability & Preferences
  available_start_date TEXT NOT NULL,
  work_authorization TEXT NOT NULL,
  willing_to_relocate INTEGER DEFAULT 0,
  travel_willingness TEXT,
  
  -- Recruiting Source & Attribution
  source TEXT NOT NULL,
  recruiter_name TEXT,
  recruiter_agency TEXT,
  notes TEXT, -- Sanitized notes
  
  -- Status & Workflow
  status TEXT NOT NULL DEFAULT 'sourced' 
    CHECK(status IN ('sourced', 'screened', 'interviewed', 'offer_extended', 'accepted', 'rejected', 'onboarding')),
  onboarding_id TEXT,
  
  -- Consent & Privacy (GDPR/BIPA compliance)
  privacy_consent_given INTEGER NOT NULL DEFAULT 0,
  privacy_consent_date INTEGER,
  privacy_consent_version TEXT,
  data_processing_consent INTEGER NOT NULL DEFAULT 0,
  marketing_consent INTEGER DEFAULT 0,
  biometric_consent INTEGER DEFAULT 0,
  
  -- Data Retention (GDPR Article 17 - Right to be forgotten)
  retention_period INTEGER, -- Days to retain data
  deletion_scheduled_date INTEGER, -- When data should be deleted
  anonymized INTEGER DEFAULT 0, -- If PII has been anonymized
  
  -- Audit Fields
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_by TEXT,
  updated_at INTEGER NOT NULL,
  
  -- Constraints
  FOREIGN KEY (onboarding_id) REFERENCES onboarding_processes(id)
);

-- Indexes for performance and compliance
CREATE INDEX idx_recruits_tenant ON recruits(tenant_id);
CREATE INDEX idx_recruits_status ON recruits(status);
CREATE INDEX idx_recruits_email_hash ON recruits(email_hash);
CREATE INDEX idx_recruits_phone_hash ON recruits(phone_hash);
CREATE INDEX idx_recruits_created_at ON recruits(created_at);
CREATE INDEX idx_recruits_updated_at ON recruits(updated_at);
CREATE INDEX idx_recruits_deletion_scheduled ON recruits(deletion_scheduled_date);
CREATE INDEX idx_recruits_consent ON recruits(privacy_consent_given, data_processing_consent);

-- Recruiting audit log for GDPR/CCPA compliance
CREATE TABLE IF NOT EXISTS recruiting_audit_log (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  recruit_id TEXT,
  
  -- Audit Event Details
  event_type TEXT NOT NULL, -- CREATE, UPDATE, VIEW, DELETE, EXPORT, ANONYMIZE
  action_description TEXT NOT NULL,
  
  -- User & Context
  user_id TEXT NOT NULL,
  user_role TEXT,
  ip_address TEXT,
  user_agent TEXT,
  
  -- Data Impact (for GDPR compliance)
  affected_fields TEXT, -- JSON array of fields modified
  sensitive_data_accessed INTEGER DEFAULT 0,
  pii_fields_accessed TEXT, -- JSON array of PII fields accessed
  
  -- Legal Basis (GDPR Article 6)
  legal_basis TEXT, -- 'consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests'
  processing_purpose TEXT,
  
  -- Results & Status
  result TEXT NOT NULL, -- 'success', 'failure', 'partial'
  error_code TEXT,
  error_message TEXT,
  
  -- Retention & Compliance
  retention_category TEXT, -- 'operational', 'legal_hold', 'investigation'
  
  -- Timestamps
  event_timestamp INTEGER NOT NULL,
  
  FOREIGN KEY (recruit_id) REFERENCES recruits(id)
);

-- Indexes for audit log queries and compliance reporting
CREATE INDEX idx_recruiting_audit_tenant ON recruiting_audit_log(tenant_id);
CREATE INDEX idx_recruiting_audit_recruit ON recruiting_audit_log(recruit_id);
CREATE INDEX idx_recruiting_audit_user ON recruiting_audit_log(user_id);
CREATE INDEX idx_recruiting_audit_timestamp ON recruiting_audit_log(event_timestamp);
CREATE INDEX idx_recruiting_audit_event_type ON recruiting_audit_log(event_type);
CREATE INDEX idx_recruiting_audit_sensitive ON recruiting_audit_log(sensitive_data_accessed);
CREATE INDEX idx_recruiting_audit_pii ON recruiting_audit_log(pii_fields_accessed);

-- Data processing consent records (GDPR Article 7)
CREATE TABLE IF NOT EXISTS recruiting_consent_records (
  id TEXT PRIMARY KEY,
  recruit_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  
  -- Consent Details
  consent_type TEXT NOT NULL, -- 'privacy', 'data_processing', 'marketing', 'biometric'
  consent_given INTEGER NOT NULL,
  consent_version TEXT NOT NULL,
  consent_text TEXT NOT NULL, -- Full text of consent at time of agreement
  
  -- Legal Requirements
  purpose_specification TEXT NOT NULL,
  data_categories TEXT NOT NULL, -- JSON array of data types
  processing_activities TEXT NOT NULL, -- JSON array of processing activities
  retention_period INTEGER, -- Days
  
  -- Consent Management
  opt_in_method TEXT, -- 'web_form', 'email', 'phone', 'in_person'
  ip_address TEXT,
  user_agent TEXT,
  withdrawal_date INTEGER, -- When consent was withdrawn
  withdrawal_method TEXT,
  
  -- Timestamps
  consent_date INTEGER NOT NULL,
  expiry_date INTEGER, -- When consent expires (if applicable)
  
  FOREIGN KEY (recruit_id) REFERENCES recruits(id)
);

-- Indexes for consent management and compliance queries
CREATE INDEX idx_recruiting_consent_recruit ON recruiting_consent_records(recruit_id);
CREATE INDEX idx_recruiting_consent_tenant ON recruiting_consent_records(tenant_id);
CREATE INDEX idx_recruiting_consent_type ON recruiting_consent_records(consent_type);
CREATE INDEX idx_recruiting_consent_date ON recruiting_consent_records(consent_date);
CREATE INDEX idx_recruiting_consent_expiry ON recruiting_consent_records(expiry_date);
CREATE INDEX idx_recruiting_consent_withdrawal ON recruiting_consent_records(withdrawal_date);

-- Data retention and deletion tracking (GDPR Article 17)
CREATE TABLE IF NOT EXISTS recruiting_data_retention (
  id TEXT PRIMARY KEY,
  recruit_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  
  -- Retention Policy
  retention_category TEXT NOT NULL, -- 'active_recruitment', 'completed_hire', 'rejected_candidate', 'legal_hold'
  retention_period_days INTEGER NOT NULL,
  legal_basis TEXT NOT NULL,
  
  -- Deletion Management
  scheduled_deletion_date INTEGER NOT NULL,
  deletion_requested_date INTEGER,
  deletion_requested_by TEXT,
  deletion_reason TEXT,
  deletion_completed_date INTEGER,
  deletion_method TEXT, -- 'full_delete', 'anonymize', 'archive'
  
  -- Compliance
  legal_hold INTEGER DEFAULT 0,
  legal_hold_reason TEXT,
  legal_hold_expiry INTEGER,
  
  -- Audit
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  
  FOREIGN KEY (recruit_id) REFERENCES recruits(id)
);

-- Indexes for data retention management
CREATE INDEX idx_recruiting_retention_recruit ON recruiting_data_retention(recruit_id);
CREATE INDEX idx_recruiting_retention_tenant ON recruiting_data_retention(tenant_id);
CREATE INDEX idx_recruiting_retention_category ON recruiting_data_retention(retention_category);
CREATE INDEX idx_recruiting_retention_scheduled ON recruiting_data_retention(scheduled_deletion_date);
CREATE INDEX idx_recruiting_retention_legal_hold ON recruiting_data_retention(legal_hold);

-- Encryption key management (for PII encryption rotation)
CREATE TABLE IF NOT EXISTS recruiting_encryption_keys (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  
  -- Key Management
  key_version INTEGER NOT NULL,
  key_purpose TEXT NOT NULL, -- 'pii_encryption', 'hash_generation'
  encryption_algorithm TEXT NOT NULL, -- 'AES-256-GCM'
  key_status TEXT NOT NULL DEFAULT 'active', -- 'active', 'deprecated', 'revoked'
  
  -- Key Rotation
  created_at INTEGER NOT NULL,
  activated_at INTEGER,
  deprecated_at INTEGER,
  revoked_at INTEGER,
  
  -- Usage Tracking
  records_encrypted INTEGER DEFAULT 0,
  last_used_at INTEGER,
  
  UNIQUE(tenant_id, key_version, key_purpose)
);

-- Indexes for key management
CREATE INDEX idx_recruiting_keys_tenant ON recruiting_encryption_keys(tenant_id);
CREATE INDEX idx_recruiting_keys_version ON recruiting_encryption_keys(key_version);
CREATE INDEX idx_recruiting_keys_status ON recruiting_encryption_keys(key_status);
CREATE INDEX idx_recruiting_keys_purpose ON recruiting_encryption_keys(key_purpose);

-- Security events log for threat detection
CREATE TABLE IF NOT EXISTS recruiting_security_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  
  -- Event Details
  event_type TEXT NOT NULL, -- 'rate_limit_exceeded', 'invalid_input', 'unauthorized_access', 'data_breach_attempt'
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  
  -- Source Information
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT,
  endpoint TEXT,
  
  -- Attack Details
  attack_vector TEXT, -- 'sql_injection', 'xss', 'csrf', 'brute_force'
  blocked INTEGER DEFAULT 0,
  
  -- Impact Assessment
  data_accessed INTEGER DEFAULT 0,
  pii_exposed INTEGER DEFAULT 0,
  records_affected INTEGER DEFAULT 0,
  
  -- Response
  mitigation_action TEXT,
  incident_id TEXT, -- Link to incident response system
  
  -- Timestamps
  detected_at INTEGER NOT NULL,
  resolved_at INTEGER,
  
  -- Additional Context
  metadata TEXT -- JSON with additional context
);

-- Indexes for security monitoring
CREATE INDEX idx_recruiting_security_tenant ON recruiting_security_events(tenant_id);
CREATE INDEX idx_recruiting_security_type ON recruiting_security_events(event_type);
CREATE INDEX idx_recruiting_security_severity ON recruiting_security_events(severity);
CREATE INDEX idx_recruiting_security_detected ON recruiting_security_events(detected_at);
CREATE INDEX idx_recruiting_security_ip ON recruiting_security_events(ip_address);
CREATE INDEX idx_recruiting_security_user ON recruiting_security_events(user_id);

-- Views for common compliance queries

-- GDPR Article 15 - Right of Access
CREATE VIEW recruiting_data_subject_view AS
SELECT 
  r.id,
  r.tenant_id,
  'Personal Data Collected' as data_category,
  r.created_at as collection_date,
  r.privacy_consent_given,
  r.data_processing_consent,
  r.status,
  CASE WHEN r.anonymized = 1 THEN 'Anonymized' ELSE 'Active' END as data_status
FROM recruits r;

-- GDPR Article 30 - Records of Processing Activities
CREATE VIEW recruiting_processing_records AS
SELECT 
  al.tenant_id,
  al.event_type,
  COUNT(*) as event_count,
  al.processing_purpose,
  al.legal_basis,
  MIN(al.event_timestamp) as first_processing,
  MAX(al.event_timestamp) as last_processing
FROM recruiting_audit_log al
WHERE al.sensitive_data_accessed = 1
GROUP BY al.tenant_id, al.event_type, al.processing_purpose, al.legal_basis;

-- Data retention compliance view
CREATE VIEW recruiting_retention_compliance AS
SELECT 
  r.tenant_id,
  COUNT(*) as total_records,
  COUNT(CASE WHEN rdr.scheduled_deletion_date < (strftime('%s', 'now') * 1000) THEN 1 END) as overdue_deletions,
  COUNT(CASE WHEN r.privacy_consent_given = 0 THEN 1 END) as no_consent,
  COUNT(CASE WHEN r.anonymized = 1 THEN 1 END) as anonymized_records
FROM recruits r
LEFT JOIN recruiting_data_retention rdr ON r.id = rdr.recruit_id
GROUP BY r.tenant_id;
