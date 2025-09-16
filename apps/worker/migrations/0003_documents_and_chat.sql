-- Migration 0003: Documents and Chat Tables for RAG System
-- Created: 2025-09-15
-- Description: Creates tables for document management, chat sessions, and RAG functionality

-- ================================
-- DOCUMENTS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  
  -- File information
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  
  -- Document metadata
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('SAFETY', 'TECHNICAL', 'PROCESS', 'COMMUNICATION', 'QUALITY', 'COMPLIANCE', 'TRAINING', 'REFERENCE')),
  tags TEXT, -- JSON array
  
  -- Content and indexing
  extracted_text TEXT,
  summary TEXT,
  key_topics TEXT, -- JSON array
  
  -- RAG/Vector information
  is_vectorized BOOLEAN DEFAULT FALSE,
  vector_id TEXT,
  chunk_count INTEGER DEFAULT 0,
  
  -- Storage information
  storage_key TEXT NOT NULL,
  storage_url TEXT,
  
  -- Processing status
  status TEXT NOT NULL DEFAULT 'UPLOADING' CHECK (status IN ('UPLOADING', 'PROCESSING', 'INDEXED', 'FAILED', 'ARCHIVED')),
  processing_error TEXT,
  processing_progress INTEGER DEFAULT 0,
  
  -- Access control
  is_public BOOLEAN DEFAULT FALSE,
  allowed_roles TEXT, -- JSON array
  
  -- Analytics
  download_count INTEGER DEFAULT 0,
  last_accessed_at INTEGER,
  
  -- Audit trail
  uploaded_by TEXT NOT NULL,
  uploaded_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  archived_at INTEGER
);

-- ================================
-- DOCUMENT CHUNKS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS document_chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  
  -- Chunk content
  content TEXT NOT NULL,
  summary TEXT,
  chunk_index INTEGER NOT NULL,
  start_offset INTEGER NOT NULL,
  end_offset INTEGER NOT NULL,
  
  -- Vector information
  vector_id TEXT,
  embedding TEXT, -- JSON array of numbers
  
  -- Metadata
  page_number INTEGER,
  section TEXT,
  headings TEXT, -- JSON array
  
  -- Timestamps
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- ================================
-- CHAT SESSIONS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  
  -- Session metadata
  title TEXT,
  description TEXT,
  
  -- Context and settings
  system_prompt TEXT,
  temperature REAL DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4000,
  
  -- RAG settings
  use_rag BOOLEAN DEFAULT TRUE,
  max_documents INTEGER DEFAULT 5,
  relevance_threshold REAL DEFAULT 0.7,
  
  -- Session state
  message_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  last_message_at INTEGER
);

-- ================================
-- CHAT MESSAGES TABLE
-- ================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  
  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- RAG context
  source_documents TEXT, -- JSON array
  
  -- Metadata
  user_id TEXT,
  user_agent TEXT,
  ip_address TEXT,
  
  -- Timestamps
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- ================================
-- DOCUMENT PROCESSING JOBS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS document_processing_jobs (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  
  -- Processing details
  job_type TEXT NOT NULL CHECK (job_type IN ('TEXT_EXTRACTION', 'VECTORIZATION', 'SUMMARIZATION', 'TOPIC_EXTRACTION')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  progress INTEGER DEFAULT 0,
  
  -- Results
  result TEXT, -- JSON object
  error TEXT,
  
  -- Processing metadata
  started_at INTEGER,
  completed_at INTEGER,
  processing_time INTEGER, -- milliseconds
  
  -- Timestamps
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_tenant ON documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_vectorized ON documents(is_vectorized);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded ON documents(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_documents_title ON documents(title);

-- Document chunks indexes
CREATE INDEX IF NOT EXISTS idx_chunks_document ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_tenant ON document_chunks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chunks_vector ON document_chunks(vector_id);
CREATE INDEX IF NOT EXISTS idx_chunks_index ON document_chunks(chunk_index);

-- Chat sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_tenant ON chat_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON chat_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_last_message ON chat_sessions(last_message_at);

-- Chat messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_tenant ON chat_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_messages_role ON chat_messages(role);
CREATE INDEX IF NOT EXISTS idx_messages_created ON chat_messages(created_at);

-- Processing jobs indexes
CREATE INDEX IF NOT EXISTS idx_jobs_document ON document_processing_jobs(document_id);
CREATE INDEX IF NOT EXISTS idx_jobs_tenant ON document_processing_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON document_processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON document_processing_jobs(job_type);
