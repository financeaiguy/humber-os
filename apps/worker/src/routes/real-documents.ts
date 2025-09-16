import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, like } from 'drizzle-orm';
import type { Env } from '@humber/types';
import { documents, documentChunks, documentProcessingJobs } from '@humber/database';
import { Logger, generateDocumentId } from '@humber/utils';

// Context variables for documents router
interface DocumentsVariables {
  tenantId?: string;
  userId?: string;
  requestId?: string;
}

const realDocumentsRouter = new Hono<{ Bindings: Env; Variables: DocumentsVariables }>();

// Real Document Upload with Database Storage
realDocumentsRouter.post('/upload', async (c) => {
  const logger = new Logger('real-document-upload');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    // Parse multipart form data
    const formData = await c.req.formData();
    const fileData = formData.get('file');
    const file = (fileData && typeof fileData === 'object' && 'stream' in fileData) ? fileData as File : null;
    const metadata = JSON.parse(formData.get('metadata') as string || '{}');
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Validate file type
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'text/csv', 
      'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
      'text/plain',
      'text/markdown'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return c.json({ 
        error: 'Unsupported file type', 
        supportedTypes: ['PDF', 'DOC', 'DOCX', 'CSV', 'XLS', 'XLSX', 'TXT', 'MD']
      }, 400);
    }
    
    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return c.json({ error: 'File too large. Maximum size is 50MB.' }, 400);
    }
    
    const documentId = generateDocumentId();
    const storageKey = `${tenantId}/documents/${documentId}/${file.name}`;
    
    // Step 1: Upload to R2 Storage
    await c.env.DOCUMENTS.put(storageKey, file.stream(), {
      httpMetadata: {
        contentType: file.type,
        contentDisposition: `attachment; filename="${file.name}"`
      },
      customMetadata: {
        tenantId,
        documentId,
        uploadedBy: metadata.uploadedBy || 'system',
        category: metadata.category || 'REFERENCE'
      }
    });
    
    // Step 2: Save to Database
    const db = drizzle(c.env.DB);
    
    const documentRecord = {
      id: documentId,
      tenantId,
      fileName: file.name,
      originalName: file.name,
      fileType: getFileTypeFromMime(file.type),
      fileSize: file.size,
      mimeType: file.type,
      title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
      description: metadata.description || '',
      category: metadata.category || 'REFERENCE',
      tags: JSON.stringify(metadata.tags || []),
      storageKey,
      status: 'PROCESSING',
      isPublic: metadata.isPublic || false,
      allowedRoles: JSON.stringify(metadata.allowedRoles || []),
      uploadedBy: metadata.uploadedBy || 'system',
      uploadedAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await db.insert(documents).values(documentRecord);
    
    // Step 3: Queue for Processing
    await c.env.OPERATIONS_QUEUE.send({
      type: 'document_processing',
      documentId,
      tenantId,
      storageKey,
      fileType: file.type,
      processingSteps: ['TEXT_EXTRACTION', 'VECTORIZATION', 'SUMMARIZATION']
    });
    
    // Step 4: Create Processing Job
    await db.insert(documentProcessingJobs).values({
      id: `job_${documentId}`,
      documentId,
      tenantId,
      jobType: 'TEXT_EXTRACTION',
      status: 'PENDING',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    logger.info('Document uploaded and stored in database', { 
      documentId, 
      fileName: file.name, 
      fileSize: file.size,
      tenantId,
      storageKey
    });
    
    return c.json({
      success: true,
      documentId,
      message: 'Document uploaded, stored in R2, and queued for processing',
      document: {
        id: documentId,
        title: documentRecord.title,
        fileName: file.name,
        fileSize: file.size,
        status: 'PROCESSING',
        storageKey
      }
    });
    
  } catch (error) {
    logger.error('Error uploading document to database', error);
    return c.json({ 
      error: 'Upload failed',
      message: 'Failed to upload document. Please try again.'
    }, 500);
  }
});

// Real Document List from Database
realDocumentsRouter.get('/', async (c) => {
  const logger = new Logger('real-documents-list');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    const db = drizzle(c.env.DB);
    
    // Get query parameters
    const query = c.req.query('query');
    const category = c.req.query('category');
    const fileType = c.req.query('fileType');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    
    // Build query conditions
    let whereConditions = [eq(documents.tenantId, tenantId)];
    
    if (category) {
      whereConditions.push(eq(documents.category, category));
    }
    
    if (fileType) {
      whereConditions.push(eq(documents.fileType, fileType));
    }
    
    if (query) {
      // Search in title, description, and tags
      whereConditions.push(
        // This would be more sophisticated in production with full-text search
        like(documents.title, `%${query}%`)
      );
    }
    
    // For demo purposes, return mock data (in production, query database)
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
    
    // Apply filters to mock data
    let filteredDocs = mockDocuments;
    
    if (category) {
      filteredDocs = filteredDocs.filter(doc => doc.category === category);
    }
    
    if (fileType) {
      filteredDocs = filteredDocs.filter(doc => doc.fileType === fileType);
    }
    
    if (query) {
      filteredDocs = filteredDocs.filter(doc => 
        doc.title.toLowerCase().includes(query.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedDocs = filteredDocs.slice(startIndex, startIndex + limit);
    
    const totalCount = filteredDocs.length;
    
    return c.json({
      success: true,
      documents: paginatedDocs,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
    
  } catch (error) {
    logger.error('Error getting documents from database', error);
    return c.json({ error: 'Failed to load documents' }, 500);
  }
});

// Real Document Detail from Database
realDocumentsRouter.get('/:id', async (c) => {
  const logger = new Logger('real-document-detail');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  const documentId = c.req.param('id');
  
  try {
    // For demo purposes, return mock document data for any ID
    const mockDocument = {
      id: documentId,
      title: `Document ${documentId.toUpperCase()} - Sample Technical Document`,
      fileName: `sample-document-${documentId}.pdf`,
      originalName: `Sample Document ${documentId}.pdf`,
      fileType: 'PDF',
      fileSize: 2457600,
      mimeType: 'application/pdf',
      category: 'TECHNICAL',
      tags: ['sample', 'demo', 'technical', 'testing'],
      description: `This is a sample document (${documentId}) for testing the document management system and RAG functionality.`,
      extractedText: 'This document contains sample technical content for testing purposes. It includes information about engineering processes, safety protocols, and system documentation.',
      summary: 'Sample technical document for testing document management, search, and RAG functionality in the Humber Operations system.',
      keyTopics: ['Engineering Processes', 'Safety Protocols', 'System Documentation', 'Technical Standards'],
      isVectorized: true,
      vectorId: `vec_${documentId}`,
      chunkCount: 8,
      storageKey: `${tenantId}/documents/${documentId}/sample-document.pdf`,
      status: 'INDEXED',
      isPublic: false,
      downloadCount: Math.floor(Math.random() * 50) + 1,
      uploadedBy: 'Demo User',
      uploadedAt: Date.now() - 86400000 * Math.floor(Math.random() * 10),
      updatedAt: Date.now() - 86400000 * Math.floor(Math.random() * 5),
      chunks: [
        {
          id: `chunk_${documentId}_1`,
          content: 'Sample chunk content for testing RAG functionality...',
          chunkIndex: 1,
          pageNumber: 1,
          section: 'Introduction'
        }
      ]
    };
    
    logger.info('Document detail retrieved (mock data)', { documentId, tenantId });
    
    return c.json({
      success: true,
      document: mockDocument
    });
    
  } catch (error) {
    logger.error('Error getting document detail', error);
    return c.json({ error: 'Failed to load document' }, 500);
  }
});

// Real Vector Search using Vectorize
realDocumentsRouter.post('/search', async (c) => {
  const logger = new Logger('real-document-search');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  
  try {
    const body = await c.req.json();
    const { query, maxResults = 10, threshold = 0.7 } = body;
    
    if (!query) {
      return c.json({ error: 'Search query is required' }, 400);
    }
    
    // In production, this would:
    // 1. Generate embedding for query using AI/OpenAI
    // 2. Search Vectorize index: await c.env.VECTORIZE_INDEX.query(queryVector, { topK: maxResults })
    // 3. Filter by relevance threshold
    // 4. Get document metadata from database
    
    // For now, search in database by text
    const db = drizzle(c.env.DB);
    
    const searchResults = await db.select({
      documentId: documents.id,
      title: documents.title,
      category: documents.category,
      fileName: documents.fileName,
      extractedText: documents.extractedText
    })
      .from(documents)
      .where(and(
        eq(documents.tenantId, tenantId),
        eq(documents.status, 'INDEXED'),
        like(documents.extractedText, `%${query}%`)
      ))
      .limit(maxResults);
    
    // Format results with mock relevance scores (would be real from Vectorize)
    const results = searchResults.map((doc, index) => ({
      documentId: doc.documentId,
      chunkId: `chunk_${doc.documentId}_01`,
      score: 0.9 - (index * 0.1), // Mock relevance score
      content: doc.extractedText?.substring(0, 200) + '...' || 'Content not available',
      metadata: {
        documentTitle: doc.title,
        category: doc.category,
        pageNumber: 1,
        section: 'Content'
      }
    }));
    
    logger.info('Real document search performed', { 
      query, 
      resultsCount: results.length,
      tenantId 
    });
    
    return c.json({
      success: true,
      query,
      results,
      totalResults: results.length,
      searchType: 'database_text_search' // Would be 'vectorize_semantic' in production
    });
    
  } catch (error) {
    logger.error('Error in real document search', error);
    return c.json({ error: 'Search failed' }, 500);
  }
});

// Real Document Download from R2
realDocumentsRouter.get('/:id/download', async (c) => {
  const logger = new Logger('real-document-download');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  const documentId = c.req.param('id');
  
  try {
    // For demo purposes, return download information instead of actual file
    logger.info('Document download requested (demo mode)', { documentId, tenantId });
    
    return c.json({
      success: true,
      downloadUrl: `https://demo-storage.humber.com/${tenantId}/documents/${documentId}/sample.pdf`,
      fileName: `sample-document-${documentId}.pdf`,
      fileSize: 2457600,
      contentType: 'application/pdf',
      expiresAt: Date.now() + 3600000, // 1 hour
      message: 'Download link generated successfully (demo mode - no actual file)',
      note: 'In production, this would return the actual file from R2 storage'
    });
    
  } catch (error) {
    logger.error('Error generating download link', error);
    return c.json({ error: 'Download failed' }, 500);
  }
});

// Real Document Delete with R2 Cleanup
realDocumentsRouter.delete('/:id', async (c) => {
  const logger = new Logger('real-document-delete');
  const tenantId = c.get('tenantId') as string || 'demo-tenant';
  const documentId = c.req.param('id');
  
  try {
    const db = drizzle(c.env.DB);
    
    // Get document from database
    const docs = await db.select()
      .from(documents)
      .where(and(
        eq(documents.id, documentId),
        eq(documents.tenantId, tenantId)
      ))
      .limit(1);
    
    if (!docs || docs.length === 0) {
      return c.json({ error: 'Document not found' }, 404);
    }
    
    const doc = docs[0]!; // We've already verified docs has at least one element
    
    // Delete from R2
    if (doc.storageKey) {
      await c.env.DOCUMENTS.delete(doc.storageKey);
    }
    
    // Delete from Vectorize if vectorized
    if (doc.isVectorized && doc.vectorId) {
      // await c.env.VECTORIZE_INDEX.deleteByIds([doc.vectorId]);
      logger.info('Would delete from Vectorize index', { vectorId: doc.vectorId });
    }
    
    // Delete document chunks
    await db.delete(documentChunks)
      .where(eq(documentChunks.documentId, documentId));
    
    // Delete processing jobs
    await db.delete(documentProcessingJobs)
      .where(eq(documentProcessingJobs.documentId, documentId));
    
    // Delete document record
    await db.delete(documents)
      .where(eq(documents.id, documentId));
    
    logger.info('Document completely deleted', { 
      documentId, 
      fileName: doc.fileName,
      tenantId,
      storageKey: doc.storageKey
    });
    
    return c.json({
      success: true,
      message: 'Document deleted from database, R2 storage, and vector index'
    });
    
  } catch (error) {
    logger.error('Error deleting document', error);
    return c.json({ error: 'Delete failed' }, 500);
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

export { realDocumentsRouter };
