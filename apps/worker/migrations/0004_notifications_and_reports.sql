-- Migration: Add notifications and reports tables
-- Created: 2025-09-15

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  channel TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  status TEXT NOT NULL DEFAULT 'PENDING',
  
  -- Recipients
  user_id TEXT,
  email TEXT,
  phone_number TEXT,
  
  -- Content
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  html_content TEXT,
  template_id TEXT,
  
  -- Metadata
  data TEXT, -- JSON blob
  scheduled_at INTEGER,
  sent_at INTEGER,
  delivered_at INTEGER,
  
  -- Tracking
  tenant_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  channel TEXT NOT NULL,
  
  -- Template content
  subject TEXT NOT NULL,
  body_template TEXT NOT NULL,
  html_template TEXT,
  
  -- Variables
  variables TEXT, -- JSON array
  
  -- Settings
  is_active BOOLEAN DEFAULT 1,
  tenant_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Notification settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  
  -- Channel preferences
  email_enabled BOOLEAN DEFAULT 1,
  sms_enabled BOOLEAN DEFAULT 1,
  push_enabled BOOLEAN DEFAULT 1,
  in_app_enabled BOOLEAN DEFAULT 1,
  
  -- Type preferences (JSON)
  preferences TEXT,
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT 0,
  quiet_hours_start TEXT,
  quiet_hours_end TEXT,
  quiet_hours_timezone TEXT,
  
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  format TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  
  -- Configuration
  parameters TEXT, -- JSON blob
  filters TEXT, -- JSON blob
  
  -- Date range
  date_start INTEGER NOT NULL,
  date_end INTEGER NOT NULL,
  
  -- Output
  file_path TEXT,
  file_size INTEGER,
  download_url TEXT,
  expires_at INTEGER,
  
  -- Metadata
  tenant_id TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  completed_at INTEGER,
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0
);

-- Scheduled reports table
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Report configuration
  type TEXT NOT NULL,
  format TEXT NOT NULL,
  parameters TEXT, -- JSON blob
  filters TEXT, -- JSON blob
  
  -- Scheduling
  frequency TEXT NOT NULL,
  schedule_config TEXT, -- JSON blob
  
  -- Recipients
  recipients TEXT, -- JSON array
  
  -- Status
  is_active BOOLEAN DEFAULT 1,
  last_run_at INTEGER,
  next_run_at INTEGER,
  
  -- Metadata
  tenant_id TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Report templates table
CREATE TABLE IF NOT EXISTS report_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  
  -- Template configuration
  layout TEXT, -- JSON blob
  sections TEXT, -- JSON array
  
  -- Metadata
  tenant_id TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_type ON notifications(tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_notifications_status_created ON notifications(status, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_templates_tenant_type ON notification_templates(tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_notification_settings_user_tenant ON notification_settings(user_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_reports_tenant_type ON reports(tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_reports_status_created ON reports(status, created_at);
CREATE INDEX IF NOT EXISTS idx_reports_created_by ON reports(created_by);

CREATE INDEX IF NOT EXISTS idx_scheduled_reports_tenant_active ON scheduled_reports(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run ON scheduled_reports(next_run_at);

CREATE INDEX IF NOT EXISTS idx_report_templates_tenant_type ON report_templates(tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_report_templates_default ON report_templates(is_default);

-- Insert default notification templates
INSERT OR IGNORE INTO notification_templates (
  id, name, type, channel, subject, body_template, html_template, variables, tenant_id, created_at, updated_at
) VALUES
(
  'tmpl_timesheet_submitted_email',
  'Timesheet Submitted - Email',
  'TIMESHEET_SUBMITTED',
  'EMAIL',
  '⏰ Timesheet Submitted - {{engineerName}}',
  '{{engineerName}} has submitted their timesheet for {{totalHours}} hours.',
  '<div style="font-family: Arial, sans-serif;"><h2>Timesheet Submitted</h2><p><strong>{{engineerName}}</strong> has submitted their timesheet for <strong>{{totalHours}}</strong> hours.</p></div>',
  '["engineerName", "totalHours", "startDate", "endDate"]',
  'default',
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
),
(
  'tmpl_timesheet_submitted_sms',
  'Timesheet Submitted - SMS',
  'TIMESHEET_SUBMITTED',
  'SMS',
  'Timesheet Submitted',
  'Humber Operations: {{engineerName}} submitted timesheet ({{totalHours}}h). Review needed.',
  NULL,
  '["engineerName", "totalHours"]',
  'default',
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
),
(
  'tmpl_discrepancy_detected_email',
  'Discrepancy Detected - Email',
  'DISCREPANCY_DETECTED',
  'EMAIL',
  '⚠️ Timesheet Discrepancy Alert - {{engineerName}}',
  'A timesheet discrepancy has been detected for {{engineerName}}. Difference: {{difference}} hours.',
  '<div style="font-family: Arial, sans-serif;"><h2 style="color: #dc3545;">⚠️ Discrepancy Alert</h2><p>A timesheet discrepancy has been detected for <strong>{{engineerName}}</strong>.</p><p><strong>Difference:</strong> <span style="color: #dc3545;">{{difference}} hours</span></p></div>',
  '["engineerName", "difference", "date", "humberHours", "clientHours"]',
  'default',
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
),
(
  'tmpl_discrepancy_detected_sms',
  'Discrepancy Detected - SMS',
  'DISCREPANCY_DETECTED',
  'SMS',
  'Discrepancy Alert',
  'ALERT: Timesheet discrepancy for {{engineerName}} - {{difference}}h difference. Action required.',
  NULL,
  '["engineerName", "difference"]',
  'default',
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
);

-- Insert default report templates
INSERT OR IGNORE INTO report_templates (
  id, name, description, type, layout, sections, tenant_id, created_by, created_at, updated_at, is_default
) VALUES
(
  'tmpl_timesheet_summary',
  'Default Timesheet Summary',
  'Standard timesheet summary report template',
  'TIMESHEET_SUMMARY',
  '{"header": {"showLogo": true, "showTitle": true, "showDate": true}, "footer": {"showPageNumbers": true, "showGeneratedDate": true}, "styling": {"primaryColor": "#667eea", "secondaryColor": "#764ba2", "fontFamily": "Arial", "fontSize": 12}}',
  '[{"id": "summary", "type": "TABLE", "title": "Summary Metrics", "order": 1}, {"id": "engineers", "type": "TABLE", "title": "Engineer Details", "order": 2}, {"id": "discrepancies", "type": "TABLE", "title": "Discrepancies", "order": 3}]',
  'default',
  'system',
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000,
  1
),
(
  'tmpl_financial_summary',
  'Default Financial Summary',
  'Standard financial summary report template',
  'FINANCIAL_SUMMARY',
  '{"header": {"showLogo": true, "showTitle": true, "showDate": true}, "footer": {"showPageNumbers": true, "showGeneratedDate": true}, "styling": {"primaryColor": "#28a745", "secondaryColor": "#20c997", "fontFamily": "Arial", "fontSize": 12}}',
  '[{"id": "overview", "type": "TABLE", "title": "Financial Overview", "order": 1}, {"id": "clients", "type": "TABLE", "title": "Revenue by Client", "order": 2}, {"id": "categories", "type": "TABLE", "title": "Revenue by Category", "order": 3}]',
  'default',
  'system',
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000,
  1
);
