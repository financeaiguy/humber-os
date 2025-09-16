import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Documents table for real storage
export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  
  // File information
  fileName: text('file_name').notNull(),
  originalName: text('original_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  
  // Document metadata
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  tags: text('tags'), // JSON array
  
  // Content and indexing
  extractedText: text('extracted_text'),
  summary: text('summary'),
  keyTopics: text('key_topics'), // JSON array
  
  // RAG/Vector information
  isVectorized: integer('is_vectorized', { mode: 'boolean' }).default(false),
  vectorId: text('vector_id'),
  chunkCount: integer('chunk_count').default(0),
  
  // Storage information
  storageKey: text('storage_key').notNull(),
  storageUrl: text('storage_url'),
  
  // Processing status
  status: text('status').notNull().default('UPLOADING'),
  processingError: text('processing_error'),
  processingProgress: integer('processing_progress').default(0),
  
  // Access control
  isPublic: integer('is_public', { mode: 'boolean' }).default(false),
  allowedRoles: text('allowed_roles'), // JSON array
  
  // Analytics
  downloadCount: integer('download_count').default(0),
  lastAccessedAt: integer('last_accessed_at'),
  
  // Audit trail
  uploadedBy: text('uploaded_by').notNull(),
  uploadedAt: integer('uploaded_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  archivedAt: integer('archived_at')
});

// Document chunks for RAG
export const documentChunks = sqliteTable('document_chunks', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull().references(() => documents.id),
  tenantId: text('tenant_id').notNull(),
  
  // Chunk content
  content: text('content').notNull(),
  summary: text('summary'),
  chunkIndex: integer('chunk_index').notNull(),
  startOffset: integer('start_offset').notNull(),
  endOffset: integer('end_offset').notNull(),
  
  // Vector information
  vectorId: text('vector_id'),
  embedding: text('embedding'), // JSON array of numbers
  
  // Metadata
  pageNumber: integer('page_number'),
  section: text('section'),
  headings: text('headings'), // JSON array
  
  // Timestamps
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
});

// Chat sessions
export const chatSessions = sqliteTable('chat_sessions', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  userId: text('user_id'),
  
  // Session metadata
  title: text('title'),
  description: text('description'),
  
  // Context and settings
  systemPrompt: text('system_prompt'),
  temperature: real('temperature').default(0.7),
  maxTokens: integer('max_tokens').default(4000),
  
  // RAG settings
  useRAG: integer('use_rag', { mode: 'boolean' }).default(true),
  maxDocuments: integer('max_documents').default(5),
  relevanceThreshold: real('relevance_threshold').default(0.7),
  
  // Session state
  messageCount: integer('message_count').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  
  // Timestamps
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  lastMessageAt: integer('last_message_at')
});

// Chat messages
export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => chatSessions.id),
  tenantId: text('tenant_id').notNull(),
  
  // Message content
  role: text('role').notNull(), // 'user' | 'assistant' | 'system'
  content: text('content').notNull(),
  
  // RAG context
  sourceDocuments: text('source_documents'), // JSON array
  
  // Metadata
  userId: text('user_id'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  
  // Timestamps
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
});

// Document processing jobs
export const documentProcessingJobs = sqliteTable('document_processing_jobs', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull().references(() => documents.id),
  tenantId: text('tenant_id').notNull(),
  
  // Processing details
  jobType: text('job_type').notNull(), // 'TEXT_EXTRACTION' | 'VECTORIZATION' | 'SUMMARIZATION' | 'TOPIC_EXTRACTION'
  status: text('status').notNull().default('PENDING'), // 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  progress: integer('progress').default(0),
  
  // Results
  result: text('result'), // JSON object
  error: text('error'),
  
  // Processing metadata
  startedAt: integer('started_at'),
  completedAt: integer('completed_at'),
  processingTime: integer('processing_time'), // milliseconds
  
  // Timestamps
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
});
