-- Humber OS D1 Database Schema
-- Multi-tenant architecture with row-level security

-- Tenants table (organizations/companies)
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  plan TEXT DEFAULT 'standard' CHECK (plan IN ('starter', 'standard', 'enterprise')),
  settings JSON DEFAULT '{}',
  metadata JSON DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Users table with tenant isolation
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'operator', 'partner')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  metadata JSON DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE(tenant_id, email)
);

-- Knowledge nodes for the nervous system
CREATE TABLE IF NOT EXISTS knowledge_nodes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('document', 'interaction', 'process', 'insight', 'pattern', 'prediction')),
  content JSON NOT NULL,
  embeddings BLOB, -- Vector embeddings for semantic search
  metadata JSON DEFAULT '{}',
  confidence REAL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  importance TEXT DEFAULT 'medium' CHECK (importance IN ('low', 'medium', 'high', 'critical')),
  access_count INTEGER DEFAULT 0,
  last_accessed TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Knowledge relationships
CREATE TABLE IF NOT EXISTS knowledge_relationships (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  source_node_id TEXT NOT NULL,
  target_node_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('references', 'triggers', 'depends_on', 'enhances', 'conflicts', 'validates')),
  strength REAL DEFAULT 0.5 CHECK (strength >= 0 AND strength <= 1),
  context TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (source_node_id) REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (target_node_id) REFERENCES knowledge_nodes(id) ON DELETE CASCADE
);

-- AI model configurations per tenant
CREATE TABLE IF NOT EXISTS ai_models (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('language', 'vision', 'audio', 'multimodal', 'specialized')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'training', 'idle', 'maintenance')),
  capabilities JSON DEFAULT '[]',
  endpoints JSON DEFAULT '{}',
  performance JSON DEFAULT '{}',
  cost_metrics JSON DEFAULT '{}',
  usage_stats JSON DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE(tenant_id, model_id)
);

-- Learning queue for async processing
CREATE TABLE IF NOT EXISTS learning_queue (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  data JSON NOT NULL,
  context JSON NOT NULL,
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER DEFAULT 0,
  error TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  processed_at TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Documents metadata (actual files in R2)
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  r2_key TEXT NOT NULL, -- R2 storage key
  r2_bucket TEXT NOT NULL,
  content_hash TEXT, -- For deduplication
  extracted_text TEXT, -- Indexed text for search
  metadata JSON DEFAULT '{}',
  ai_analysis JSON DEFAULT '{}',
  access_level TEXT DEFAULT 'internal' CHECK (access_level IN ('public', 'internal', 'restricted', 'confidential')),
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Recruits with tenant isolation
CREATE TABLE IF NOT EXISTS recruits (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'screening', 'interviewing', 'hired', 'rejected', 'withdrawn')),
  position TEXT,
  department TEXT,
  metadata JSON DEFAULT '{}',
  documents JSON DEFAULT '[]', -- References to document IDs
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE(tenant_id, email)
);

-- Projects with tenant isolation  
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  client_id TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'approved', 'in_progress', 'completed', 'cancelled')),
  budget REAL,
  start_date TEXT,
  end_date TEXT,
  metadata JSON DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Audit logs for compliance
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSON DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_knowledge_nodes_tenant ON knowledge_nodes(tenant_id);
CREATE INDEX idx_knowledge_nodes_type ON knowledge_nodes(tenant_id, type);
CREATE INDEX idx_knowledge_relationships_source ON knowledge_relationships(source_node_id);
CREATE INDEX idx_knowledge_relationships_target ON knowledge_relationships(target_node_id);
CREATE INDEX idx_documents_tenant ON documents(tenant_id);
CREATE INDEX idx_documents_hash ON documents(tenant_id, content_hash);
CREATE INDEX idx_recruits_tenant ON recruits(tenant_id);
CREATE INDEX idx_projects_tenant ON projects(tenant_id);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id, created_at);
CREATE INDEX idx_learning_queue_status ON learning_queue(tenant_id, status, priority);

-- Full-text search indexes
CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
  title, 
  extracted_text,
  content=documents,
  content_rowid=rowid
);

-- Triggers for updated_at
CREATE TRIGGER update_tenants_timestamp 
AFTER UPDATE ON tenants 
BEGIN
  UPDATE tenants SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users 
BEGIN
  UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_knowledge_nodes_timestamp 
AFTER UPDATE ON knowledge_nodes 
BEGIN
  UPDATE knowledge_nodes SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_documents_timestamp 
AFTER UPDATE ON documents 
BEGIN
  UPDATE documents SET updated_at = datetime('now') WHERE id = NEW.id;
END;