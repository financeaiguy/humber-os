import { z } from 'zod';

// Document Types for RAG Knowledge Base
export const DocumentType = z.enum([
  'PDF',
  'DOC', 
  'DOCX',
  'CSV',
  'XLSX',
  'XLS',
  'TXT',
  'MD'
]);

export type DocumentType = z.infer<typeof DocumentType>;

// Document Categories
export const DocumentCategory = z.enum([
  'SAFETY',
  'TECHNICAL', 
  'PROCESS',
  'COMMUNICATION',
  'QUALITY',
  'COMPLIANCE',
  'TRAINING',
  'REFERENCE'
]);

export type DocumentCategory = z.infer<typeof DocumentCategory>;

// Document Status
export const DocumentStatus = z.enum([
  'UPLOADING',
  'PROCESSING',
  'INDEXED',
  'FAILED',
  'ARCHIVED'
]);

export type DocumentStatus = z.infer<typeof DocumentStatus>;

// Document Schema
export const DocumentSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  
  // File information
  fileName: z.string(),
  originalName: z.string(),
  fileType: DocumentType,
  fileSize: z.number().positive(),
  mimeType: z.string(),
  
  // Document metadata
  title: z.string(),
  description: z.string().optional(),
  category: DocumentCategory,
  tags: z.array(z.string()).default([]),
  
  // Content and indexing
  extractedText: z.string().optional(),
  summary: z.string().optional(),
  keyTopics: z.array(z.string()).default([]),
  
  // RAG/Vector information
  isVectorized: z.boolean().default(false),
  vectorId: z.string().optional(),
  chunkCount: z.number().default(0),
  
  // Storage information
  storageKey: z.string(), // R2 storage key
  storageUrl: z.string().optional(),
  
  // Processing status
  status: DocumentStatus,
  processingError: z.string().optional(),
  processingProgress: z.number().min(0).max(100).default(0),
  
  // Access control
  isPublic: z.boolean().default(false),
  allowedRoles: z.array(z.string()).default([]),
  
  // Analytics
  downloadCount: z.number().default(0),
  lastAccessedAt: z.number().optional(),
  
  // Audit trail
  uploadedBy: z.string(),
  uploadedAt: z.number(),
  updatedAt: z.number(),
  archivedAt: z.number().optional()
});

export type Document = z.infer<typeof DocumentSchema>;

// Document Upload Input
export const DocumentUploadSchema = z.object({
  tenantId: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: DocumentCategory,
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
  allowedRoles: z.array(z.string()).default([]),
  
  // File will be handled separately in multipart upload
  file: z.any().optional() // File object from form data
});

export type DocumentUploadInput = z.infer<typeof DocumentUploadSchema>;

// Document Search Schema
export const DocumentSearchSchema = z.object({
  tenantId: z.string(),
  query: z.string().optional(),
  category: DocumentCategory.optional(),
  tags: z.array(z.string()).optional(),
  fileType: DocumentType.optional(),
  status: DocumentStatus.optional(),
  uploadedBy: z.string().optional(),
  uploadedAfter: z.number().optional(),
  uploadedBefore: z.number().optional(),
  sortBy: z.enum(['title', 'uploadedAt', 'downloadCount', 'relevance']).default('uploadedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
});

export type DocumentSearchInput = z.infer<typeof DocumentSearchSchema>;

// Document Chunk for RAG
export const DocumentChunkSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  tenantId: z.string(),
  
  // Chunk content
  content: z.string(),
  summary: z.string().optional(),
  chunkIndex: z.number(),
  startOffset: z.number(),
  endOffset: z.number(),
  
  // Vector information
  vectorId: z.string().optional(),
  embedding: z.array(z.number()).optional(), // Vector embedding
  
  // Metadata
  pageNumber: z.number().optional(),
  section: z.string().optional(),
  headings: z.array(z.string()).default([]),
  
  // Timestamps
  createdAt: z.number(),
  updatedAt: z.number()
});

export type DocumentChunk = z.infer<typeof DocumentChunkSchema>;

// Chat Message Schema
export const ChatMessageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  tenantId: z.string(),
  
  // Message content
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  
  // RAG context
  sourceDocuments: z.array(z.object({
    documentId: z.string(),
    documentTitle: z.string(),
    chunkId: z.string(),
    relevanceScore: z.number(),
    snippet: z.string()
  })).default([]),
  
  // Metadata
  userId: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  
  // Timestamps
  createdAt: z.number(),
  updatedAt: z.number()
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Chat Session Schema
export const ChatSessionSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  userId: z.string().optional(),
  
  // Session metadata
  title: z.string().optional(),
  description: z.string().optional(),
  
  // Context and settings
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().positive().default(4000),
  
  // RAG settings
  useRAG: z.boolean().default(true),
  maxDocuments: z.number().min(1).max(20).default(5),
  relevanceThreshold: z.number().min(0).max(1).default(0.7),
  
  // Session state
  messageCount: z.number().default(0),
  isActive: z.boolean().default(true),
  
  // Timestamps
  createdAt: z.number(),
  updatedAt: z.number(),
  lastMessageAt: z.number().optional()
});

export type ChatSession = z.infer<typeof ChatSessionSchema>;

// Document Processing Job
export const DocumentProcessingJobSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  tenantId: z.string(),
  
  // Processing details
  jobType: z.enum(['TEXT_EXTRACTION', 'VECTORIZATION', 'SUMMARIZATION', 'TOPIC_EXTRACTION']),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
  progress: z.number().min(0).max(100).default(0),
  
  // Results
  result: z.record(z.string(), z.any()).optional(),
  error: z.string().optional(),
  
  // Processing metadata
  startedAt: z.number().optional(),
  completedAt: z.number().optional(),
  processingTime: z.number().optional(), // milliseconds
  
  // Timestamps
  createdAt: z.number(),
  updatedAt: z.number()
});

export type DocumentProcessingJob = z.infer<typeof DocumentProcessingJobSchema>;

// Vector Search Result
export const VectorSearchResultSchema = z.object({
  documentId: z.string(),
  chunkId: z.string(),
  score: z.number(),
  content: z.string(),
  metadata: z.object({
    documentTitle: z.string(),
    category: DocumentCategory,
    pageNumber: z.number().optional(),
    section: z.string().optional()
  })
});

export type VectorSearchResult = z.infer<typeof VectorSearchResultSchema>;

// Chat Request Schema
export const ChatRequestSchema = z.object({
  sessionId: z.string().optional(),
  tenantId: z.string(),
  message: z.string().min(1, 'Message cannot be empty'),
  
  // RAG settings (optional overrides)
  useRAG: z.boolean().optional(),
  maxDocuments: z.number().min(1).max(20).optional(),
  relevanceThreshold: z.number().min(0).max(1).optional(),
  
  // Context
  userId: z.string().optional(),
  userAgent: z.string().optional()
});

export type ChatRequestInput = z.infer<typeof ChatRequestSchema>;

// Chat Response Schema
export const ChatResponseSchema = z.object({
  sessionId: z.string(),
  messageId: z.string(),
  content: z.string(),
  
  // RAG context used
  sourceDocuments: z.array(VectorSearchResultSchema),
  
  // Metadata
  model: z.string(),
  tokensUsed: z.number().optional(),
  processingTime: z.number().optional(),
  
  // Timestamps
  createdAt: z.number()
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;
