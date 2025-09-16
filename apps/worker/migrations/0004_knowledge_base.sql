-- Knowledge Base Schema
-- Stores full documents with metadata for vector search

-- Drop existing table if it exists
DROP TABLE IF EXISTS knowledge_base;

-- Create knowledge base table
CREATE TABLE knowledge_base (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('engineering', 'hr', 'compliance', 'operations', 'safety')),
  tags TEXT DEFAULT '[]', -- JSON array of tags
  metadata TEXT DEFAULT '{}', -- JSON object for additional metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  is_active BOOLEAN DEFAULT 1
);

-- Create indexes for efficient querying
CREATE INDEX idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX idx_knowledge_base_created_at ON knowledge_base(created_at);
CREATE INDEX idx_knowledge_base_is_active ON knowledge_base(is_active);
CREATE INDEX idx_knowledge_base_title ON knowledge_base(title);

-- Create full-text search virtual table
CREATE VIRTUAL TABLE knowledge_base_fts USING fts5(
  title, 
  content,
  category,
  tags,
  content=knowledge_base,
  content_rowid=rowid
);

-- Create triggers to keep FTS table in sync
CREATE TRIGGER knowledge_base_ai AFTER INSERT ON knowledge_base BEGIN
  INSERT INTO knowledge_base_fts(rowid, title, content, category, tags)
  VALUES (new.rowid, new.title, new.content, new.category, new.tags);
END;

CREATE TRIGGER knowledge_base_ad AFTER DELETE ON knowledge_base BEGIN
  DELETE FROM knowledge_base_fts WHERE rowid = old.rowid;
END;

CREATE TRIGGER knowledge_base_au AFTER UPDATE ON knowledge_base BEGIN
  DELETE FROM knowledge_base_fts WHERE rowid = old.rowid;
  INSERT INTO knowledge_base_fts(rowid, title, content, category, tags)
  VALUES (new.rowid, new.title, new.content, new.category, new.tags);
END;

-- Insert sample knowledge base entries
INSERT INTO knowledge_base (id, title, content, category, tags) VALUES
  (
    'kb_001',
    'Safety Protocols for Assembly Line Operations',
    'Comprehensive safety guidelines for automotive assembly line operations. All personnel must wear appropriate PPE including safety glasses, steel-toed boots, and high-visibility vests. Lock-out/tag-out procedures must be followed for all equipment maintenance. Emergency stop buttons are located every 50 feet along the production line. Regular safety audits are conducted weekly.',
    'safety',
    '["ppe", "assembly", "emergency", "lockout-tagout"]'
  ),
  (
    'kb_002',
    'PLC Programming Standards',
    'Standard procedures for programming Programmable Logic Controllers (PLCs) in our automation systems. Use ladder logic for simple control sequences. Implement structured text for complex algorithms. All programs must include comprehensive documentation and version control. Testing protocols require simulation before deployment to production systems.',
    'engineering',
    '["plc", "automation", "programming", "controls"]'
  ),
  (
    'kb_003',
    'Employee Onboarding Process',
    'Complete onboarding workflow for new engineering hires. Day 1: HR orientation and documentation. Day 2-3: Safety training and certification. Week 1: Department introduction and tool access. Week 2-4: Shadow experienced engineers on active projects. Month 2: Begin independent work with mentor supervision. All new hires must complete background checks and drug screening.',
    'hr',
    '["onboarding", "training", "new-hire", "orientation"]'
  ),
  (
    'kb_004',
    'ITAR Compliance Requirements',
    'International Traffic in Arms Regulations (ITAR) compliance for defense-related projects. All technical data must be secured and access restricted to US persons only. Export licenses required for any international collaboration. Regular compliance audits conducted quarterly. Violations can result in severe penalties including criminal prosecution.',
    'compliance',
    '["itar", "export-control", "defense", "regulations"]'
  ),
  (
    'kb_005',
    'Robotic Cell Integration Best Practices',
    'Guidelines for integrating robotic cells into existing production lines. Conduct thorough risk assessment before installation. Implement safety barriers and light curtains. Program collaborative zones for human-robot interaction. Optimize cycle times through simulation. Regular maintenance schedules must be established for all robotic equipment.',
    'engineering',
    '["robotics", "automation", "integration", "safety"]'
  ),
  (
    'kb_006',
    'Time Tracking and Billing Procedures',
    'Accurate time tracking is essential for client billing and project management. All engineers must log hours daily using the approved time tracking system. Project codes must be used for proper allocation. Overtime requires prior approval from project manager. Weekly timesheets must be submitted by Friday 5 PM.',
    'operations',
    '["timesheet", "billing", "project-management", "hours"]'
  ),
  (
    'kb_007',
    'ISO 9001 Quality Management System',
    'Our quality management system follows ISO 9001:2015 standards. Document control procedures ensure latest revisions are used. Non-conformance reports must be filed for any quality issues. Corrective and preventive actions tracked through resolution. Annual management reviews assess system effectiveness.',
    'compliance',
    '["iso9001", "quality", "qms", "certification"]'
  ),
  (
    'kb_008',
    'Emergency Response Procedures',
    'Emergency response protocols for various scenarios. Fire: Evacuate via nearest exit to designated assembly points. Medical: Contact on-site medical team immediately. Chemical spill: Isolate area and contact HAZMAT team. Severe weather: Move to designated shelter areas. All incidents must be reported within 24 hours.',
    'safety',
    '["emergency", "evacuation", "incident-response", "safety"]'
  );

-- Create view for active knowledge base entries
CREATE VIEW active_knowledge_base AS
SELECT 
  id,
  title,
  content,
  category,
  json_extract(tags, '$') as tags_array,
  json_extract(metadata, '$') as metadata_object,
  created_at,
  updated_at,
  created_by
FROM knowledge_base
WHERE is_active = 1
ORDER BY created_at DESC;