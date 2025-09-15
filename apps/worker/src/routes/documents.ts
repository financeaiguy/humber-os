import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, like, inArray } from 'drizzle-orm';
import type { Env, DocumentUploadInput, DocumentSearchInput } from '@humber/types';
import { Logger, generateDocumentId } from '@humber/utils';

const documentsRouter = new Hono<{ Bindings: Env }>();

// Document database schema (simplified for now)
const documents = {
  id: 'TEXT PRIMARY KEY',
  tenantId: 'TEXT NOT NULL',
  fileName: 'TEXT NOT NULL',
  originalName: 'TEXT NOT NULL', 
  fileType: 'TEXT NOT NULL',
  fileSize: 'INTEGER NOT NULL',
  title: 'TEXT NOT NULL',
  description: 'TEXT',
  category: 'TEXT NOT NULL',
  tags: 'TEXT', // JSON array
  extractedText: 'TEXT',
  summary: 'TEXT',
  isVectorized: 'BOOLEAN DEFAULT FALSE',
  vectorId: 'TEXT',
  chunkCount: 'INTEGER DEFAULT 0',
  storageKey: 'TEXT NOT NULL',
  status: 'TEXT NOT NULL DEFAULT "UPLOADING"',
  processingError: 'TEXT',
  processingProgress: 'INTEGER DEFAULT 0',
  isPublic: 'BOOLEAN DEFAULT FALSE',
  downloadCount: 'INTEGER DEFAULT 0',
  uploadedBy: 'TEXT NOT NULL',
  uploadedAt: 'INTEGER NOT NULL',
  updatedAt: 'INTEGER NOT NULL'
};

// Upload Document
documentsRouter.post('/upload', async (c) => {
  const logger = new Logger('document-upload');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    // Parse multipart form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const metadata = JSON.parse(formData.get('metadata') as string || '{}');
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'];
    
    if (!allowedTypes.includes(file.type)) {
      return c.json({ 
        error: 'Unsupported file type', 
        supportedTypes: ['PDF', 'DOC', 'DOCX', 'CSV', 'XLS', 'XLSX', 'TXT']
      }, 400);
    }
    
    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return c.json({ error: 'File too large. Maximum size is 50MB.' }, 400);
    }
    
    const documentId = generateDocumentId();
    const storageKey = `${tenantId}/documents/${documentId}/${file.name}`;
    
    // Upload to R2
    await c.env.DOCUMENTS.put(storageKey, file.stream(), {
      httpMetadata: {
        contentType: file.type,
        contentDisposition: `attachment; filename="${file.name}"`
      }
    });
    
    // Create document record (would use actual database table)
    const documentRecord = {
      id: documentId,
      tenantId,
      fileName: file.name,
      originalName: file.name,
      fileType: getFileTypeFromMime(file.type),
      fileSize: file.size,
      title: metadata.title || file.name,
      description: metadata.description || '',
      category: metadata.category || 'REFERENCE',
      tags: JSON.stringify(metadata.tags || []),
      storageKey,
      status: 'PROCESSING',
      uploadedBy: metadata.uploadedBy || 'system',
      uploadedAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Queue document for processing
    await c.env.OPERATIONS_QUEUE.send({
      type: 'document_processing',
      documentId,
      tenantId,
      storageKey,
      fileType: file.type
    });
    
    logger.info('Document uploaded successfully', { 
      documentId, 
      fileName: file.name, 
      fileSize: file.size,
      tenantId 
    });
    
    return c.json({
      success: true,
      documentId,
      message: 'Document uploaded and queued for processing',
      document: {
        id: documentId,
        title: documentRecord.title,
        fileName: file.name,
        fileSize: file.size,
        status: 'PROCESSING'
      }
    });
    
  } catch (error) {
    logger.error('Error uploading document', error);
    return c.json({ 
      error: 'Upload failed',
      message: 'Failed to upload document. Please try again.'
    }, 500);
  }
});

// Get Documents (with search and filtering)
documentsRouter.get('/', async (c) => {
  const logger = new Logger('documents-list');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    // Get query parameters
    const query = c.req.query('query');
    const category = c.req.query('category');
    const fileType = c.req.query('fileType');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    
    // Mock data for now (would query actual database)
    const mockDocuments = [
      {
        id: 'doc_001',
        title: 'Electrical Safety Protocols for Automotive Plants',
        fileName: 'electrical-safety-protocols.pdf',
        fileType: 'PDF',
        fileSize: 2457600,
        category: 'SAFETY',
        tags: ['electrical', 'safety', 'automotive'],
        status: 'INDEXED',
        isVectorized: true,
        downloadCount: 45,
        uploadedBy: 'Sarah Johnson',
        uploadedAt: Date.now() - 86400000 * 5,
        updatedAt: Date.now() - 86400000 * 5
      },
      {
        id: 'doc_002',
        title: 'PLC Programming Standards',
        fileName: 'plc-programming-standards.docx',
        fileType: 'DOCX',
        fileSize: 1234567,
        category: 'TECHNICAL',
        tags: ['plc', 'programming', 'standards'],
        status: 'INDEXED',
        isVectorized: true,
        downloadCount: 32,
        uploadedBy: 'Michael Chen',
        uploadedAt: Date.now() - 86400000 * 3,
        updatedAt: Date.now() - 86400000 * 3
      },
      {
        id: 'doc_003',
        title: 'Project Timeline Template',
        fileName: 'project-timeline-template.xlsx',
        fileType: 'XLSX',
        fileSize: 567890,
        category: 'PROCESS',
        tags: ['project', 'timeline', 'template'],
        status: 'INDEXED',
        isVectorized: false,
        downloadCount: 18,
        uploadedBy: 'Lisa Thompson',
        uploadedAt: Date.now() - 86400000 * 1,
        updatedAt: Date.now() - 86400000 * 1
      }
    ];
    
    // Apply filters
    let filteredDocs = mockDocuments.filter(doc => {
      if (category && doc.category !== category) return false;
      if (fileType && doc.fileType !== fileType) return false;
      if (query) {
        const searchText = `${doc.title} ${doc.fileName} ${doc.tags.join(' ')}`.toLowerCase();
        if (!searchText.includes(query.toLowerCase())) return false;
      }
      return true;
    });
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedDocs = filteredDocs.slice(startIndex, startIndex + limit);
    
    return c.json({
      success: true,
      documents: paginatedDocs,
      pagination: {
        page,
        limit,
        total: filteredDocs.length,
        totalPages: Math.ceil(filteredDocs.length / limit)
      }
    });
    
  } catch (error) {
    logger.error('Error getting documents', error);
    return c.json({ error: 'Failed to load documents' }, 500);
  }
});

// Get Document by ID
documentsRouter.get('/:id', async (c) => {
  const logger = new Logger('document-detail');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  const documentId = c.req.param('id');
  
  try {
    // Mock document detail (would query actual database)
    const mockDocument = {
      id: documentId,
      title: 'Electrical Safety Protocols for Automotive Plants',
      fileName: 'electrical-safety-protocols.pdf',
      originalName: 'Electrical Safety Protocols for Automotive Plants.pdf',
      fileType: 'PDF',
      fileSize: 2457600,
      mimeType: 'application/pdf',
      category: 'SAFETY',
      tags: ['electrical', 'safety', 'automotive'],
      description: 'Comprehensive guide to electrical safety protocols in automotive manufacturing environments.',
      extractedText: 'This document outlines the essential electrical safety protocols...',
      summary: 'Key safety protocols for electrical work in automotive plants including lockout/tagout procedures, PPE requirements, and emergency response.',
      keyTopics: ['Lockout/Tagout', 'Personal Protective Equipment', 'Emergency Response', 'Hazard Identification'],
      isVectorized: true,
      vectorId: 'vec_001',
      chunkCount: 15,
      storageKey: `${tenantId}/documents/${documentId}/electrical-safety-protocols.pdf`,
      status: 'INDEXED',
      isPublic: false,
      downloadCount: 45,
      uploadedBy: 'Sarah Johnson',
      uploadedAt: Date.now() - 86400000 * 5,
      updatedAt: Date.now() - 86400000 * 5
    };
    
    return c.json({
      success: true,
      document: mockDocument
    });
    
  } catch (error) {
    logger.error('Error getting document detail', error);
    return c.json({ error: 'Failed to load document' }, 500);
  }
});

// Download Document
documentsRouter.get('/:id/download', async (c) => {
  const logger = new Logger('document-download');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  const documentId = c.req.param('id');
  
  try {
    // Get document info (would query actual database)
    const storageKey = `${tenantId}/documents/${documentId}/example.pdf`;
    
    // Get file from R2
    const file = await c.env.DOCUMENTS.get(storageKey);
    
    if (!file) {
      return c.json({ error: 'Document not found' }, 404);
    }
    
    // Update download count (would update database)
    logger.info('Document downloaded', { documentId, tenantId });
    
    return new Response(file.body, {
      headers: {
        'Content-Type': file.httpMetadata?.contentType || 'application/octet-stream',
        'Content-Disposition': file.httpMetadata?.contentDisposition || 'attachment',
        'Content-Length': file.size.toString()
      }
    });
    
  } catch (error) {
    logger.error('Error downloading document', error);
    return c.json({ error: 'Download failed' }, 500);
  }
});

// Delete Document
documentsRouter.delete('/:id', async (c) => {
  const logger = new Logger('document-delete');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  const documentId = c.req.param('id');
  
  try {
    // Get document info (would query actual database)
    const storageKey = `${tenantId}/documents/${documentId}/example.pdf`;
    
    // Delete from R2
    await c.env.DOCUMENTS.delete(storageKey);
    
    // Delete from Vectorize if vectorized
    // await c.env.VECTORIZE_INDEX.deleteByIds([vectorId]);
    
    // Delete from database (would delete actual record)
    
    logger.info('Document deleted', { documentId, tenantId });
    
    return c.json({
      success: true,
      message: 'Document deleted successfully'
    });
    
  } catch (error) {
    logger.error('Error deleting document', error);
    return c.json({ error: 'Delete failed' }, 500);
  }
});

// Search Documents using Vector Search
documentsRouter.post('/search', async (c) => {
  const logger = new Logger('document-search');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    const body = await c.req.json();
    const { query, maxResults = 10, threshold = 0.7 } = body;
    
    if (!query) {
      return c.json({ error: 'Search query is required' }, 400);
    }
    
    // For now, return mock search results
    // In production, this would use Vectorize for semantic search
    const mockResults = [
      {
        documentId: 'doc_001',
        chunkId: 'chunk_001_01',
        score: 0.89,
        content: 'Electrical safety protocols require proper lockout/tagout procedures before any maintenance work...',
        metadata: {
          documentTitle: 'Electrical Safety Protocols for Automotive Plants',
          category: 'SAFETY',
          pageNumber: 1,
          section: 'Introduction'
        }
      },
      {
        documentId: 'doc_002',
        chunkId: 'chunk_002_03',
        score: 0.82,
        content: 'PLC programming standards dictate that all safety interlocks must be thoroughly tested...',
        metadata: {
          documentTitle: 'PLC Programming Standards',
          category: 'TECHNICAL',
          pageNumber: 3,
          section: 'Safety Requirements'
        }
      }
    ];
    
    logger.info('Document search performed', { 
      query, 
      resultsCount: mockResults.length,
      tenantId 
    });
    
    return c.json({
      success: true,
      query,
      results: mockResults,
      totalResults: mockResults.length
    });
    
  } catch (error) {
    logger.error('Error searching documents', error);
    return c.json({ error: 'Search failed' }, 500);
  }
});

// Helper function to determine file type from MIME type
function getFileTypeFromMime(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'text/csv': 'CSV',
    'application/vnd.ms-excel': 'XLS',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    'text/plain': 'TXT',
    'text/markdown': 'MD'
  };
  
  return mimeMap[mimeType] || 'UNKNOWN';
}

export { documentsRouter };
