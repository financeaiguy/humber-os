-- Authentication and User Management Tables
-- These tables go in the MASTER database for centralized auth

-- Users table - centralized user authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'deactivated')),
  mfa_enabled BOOLEAN DEFAULT 0,
  mfa_secret TEXT,
  default_tenant_id TEXT,
  engineer_id TEXT,
  last_login_at TEXT,
  password_changed_at TEXT,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_engineer_id ON users(engineer_id);

-- User roles per tenant
CREATE TABLE IF NOT EXISTS user_tenant_roles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'manager', 'engineer', 'viewer')),
  granted_by TEXT,
  granted_at TEXT NOT NULL,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (tenant_id) REFERENCES tenant_mappings(tenant_id),
  UNIQUE(user_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_tenant_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant ON user_tenant_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_tenant_roles(role);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_hash ON password_reset_tokens(token_hash);

-- API keys for service-to-service authentication
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key_hash TEXT UNIQUE NOT NULL,
  tenant_id TEXT,
  permissions TEXT, -- JSON array of permissions
  created_by TEXT,
  last_used_at TEXT,
  expires_at TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'revoked')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenant_mappings(tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status);

-- Security events log
CREATE TABLE IF NOT EXISTS security_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id TEXT,
  tenant_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  details TEXT, -- JSON with event-specific details
  severity TEXT CHECK(severity IN ('low', 'medium', 'high', 'critical')),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_tenant ON security_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);

-- Session blacklist for logout/revoked tokens
CREATE TABLE IF NOT EXISTS token_blacklist (
  id TEXT PRIMARY KEY,
  token_jti TEXT UNIQUE NOT NULL, -- JWT ID claim
  user_id TEXT,
  expires_at TEXT NOT NULL,
  revoked_at TEXT NOT NULL,
  reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_blacklist_jti ON token_blacklist(token_jti);
CREATE INDEX IF NOT EXISTS idx_blacklist_user ON token_blacklist(user_id);
CREATE INDEX IF NOT EXISTS idx_blacklist_expires ON token_blacklist(expires_at);

-- Rate limiting records
CREATE TABLE IF NOT EXISTS rate_limits (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP, user_id, etc.
  endpoint TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TEXT NOT NULL,
  window_end TEXT NOT NULL,
  blocked_until TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(identifier, endpoint, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_endpoint ON rate_limits(endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_end);

-- Insert default admin user (change password immediately in production)
INSERT OR IGNORE INTO users (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  status,
  mfa_enabled,
  created_at,
  updated_at
) VALUES (
  'user_admin_001',
  'admin@humber-operations.com',
  'hashed_admin123', -- Change this immediately in production
  'System',
  'Administrator',
  'active',
  1,
  datetime('now'),
  datetime('now')
);

-- Create a basic tenant mapping first
INSERT OR IGNORE INTO tenant_mappings (
  tenant_id,
  engineer_id,
  db_binding,
  created_at,
  status
) VALUES (
  'tenant_humber_001',
  'engineer_admin_001',
  'DB_ENGINEER_001',
  datetime('now'),
  'active'
);

-- Grant admin role to default user for tenant 001
INSERT OR IGNORE INTO user_tenant_roles (
  id,
  user_id,
  tenant_id,
  role,
  granted_by,
  granted_at,
  created_at
) VALUES (
  'role_admin_001',
  'user_admin_001',
  'tenant_humber_001',
  'admin',
  'system',
  datetime('now'),
  datetime('now')
);

-- Create service API key for system operations
INSERT OR IGNORE INTO api_keys (
  id,
  name,
  key_hash,
  permissions,
  created_by,
  expires_at,
  status,
  created_at
) VALUES (
  'api_system_001',
  'System Operations Key',
  'hashed_system_key_change_in_production',
  '["admin", "system"]',
  'system',
  datetime('now', '+1 year'),
  'active',
  datetime('now')
);