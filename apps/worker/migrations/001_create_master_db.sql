-- Master Database Schema for Tenant Management
-- This database tracks all tenant assignments and system configuration

-- Tenant mappings table - maps engineers to their isolated databases
CREATE TABLE IF NOT EXISTS tenant_mappings (
  tenant_id TEXT PRIMARY KEY,
  engineer_id TEXT NOT NULL UNIQUE,
  db_binding TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'pending')),
  suspension_reason TEXT,
  suspended_at TEXT,
  last_accessed_at TEXT,
  metadata TEXT -- JSON field for additional configuration
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tenant_engineer ON tenant_mappings(engineer_id);
CREATE INDEX IF NOT EXISTS idx_tenant_status ON tenant_mappings(status);
CREATE INDEX IF NOT EXISTS idx_tenant_db_binding ON tenant_mappings(db_binding);

-- Database allocation tracking
CREATE TABLE IF NOT EXISTS database_allocations (
  db_binding TEXT PRIMARY KEY,
  tenant_count INTEGER DEFAULT 0,
  max_capacity INTEGER DEFAULT 100,
  created_at TEXT NOT NULL,
  last_allocated_at TEXT
);

-- Initialize database allocations
INSERT OR IGNORE INTO database_allocations (db_binding, created_at, max_capacity) VALUES
  ('DB_ENGINEER_001', datetime('now'), 100),
  ('DB_ENGINEER_002', datetime('now'), 100),
  ('DB_ENGINEER_003', datetime('now'), 100),
  ('DB_ENGINEER_004', datetime('now'), 100),
  ('DB_ENGINEER_005', datetime('now'), 100),
  ('DB_ENGINEER_006', datetime('now'), 100),
  ('DB_ENGINEER_007', datetime('now'), 100),
  ('DB_ENGINEER_008', datetime('now'), 100),
  ('DB_ENGINEER_009', datetime('now'), 100),
  ('DB_ENGINEER_010', datetime('now'), 100);

-- System audit log for tracking all tenant operations
CREATE TABLE IF NOT EXISTS system_audit_log (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  engineer_id TEXT,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenant_mappings(tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant ON system_audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON system_audit_log(created_at);

-- Tenant access metrics for monitoring
CREATE TABLE IF NOT EXISTS tenant_metrics (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  date TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  avg_response_time_ms REAL,
  peak_requests_per_minute INTEGER,
  data_transfer_bytes INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenant_mappings(tenant_id),
  UNIQUE(tenant_id, date)
);

CREATE INDEX IF NOT EXISTS idx_metrics_tenant_date ON tenant_metrics(tenant_id, date);

-- System configuration for global settings
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Default system configuration
INSERT OR IGNORE INTO system_config (key, value, description, created_at, updated_at) VALUES
  ('max_tenants_per_db', '100', 'Maximum number of tenants per database', datetime('now'), datetime('now')),
  ('cache_ttl_seconds', '3600', 'Cache TTL for tenant configuration', datetime('now'), datetime('now')),
  ('audit_retention_days', '90', 'Number of days to retain audit logs', datetime('now'), datetime('now')),
  ('metrics_retention_days', '30', 'Number of days to retain metrics', datetime('now'), datetime('now')),
  ('maintenance_mode', 'false', 'System maintenance mode flag', datetime('now'), datetime('now'));