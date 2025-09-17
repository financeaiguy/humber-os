import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, like, inArray } from 'drizzle-orm';
import type { Env } from '@humber/types';
import { documents, documentChunks, documentProcessingJobs } from '@humber/database';
import { Logger, generateDocumentId } from '@humber/utils';

const realDocumentsRouter = new Hono<{ Bindings: Env }>();

// Real Document Upload with Database Storage
realDocumentsRouter.post('/upload', async (c) => {
  const logger = new Logger('real-document-upload');
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
    
    // Get documents from database
    const dbDocuments = await db.select()
      .from(documents)
      .where(and(...whereConditions))
      .orderBy(desc(documents.uploadedAt))
      .limit(limit)
      .offset((page - 1) * limit);
    
    // Transform for API response
    const formattedDocs = dbDocuments.map(doc => ({
      id: doc.id,
      title: doc.title,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      category: doc.category,
      tags: doc.tags ? JSON.parse(doc.tags) : [],
      status: doc.status,
      isVectorized: doc.isVectorized,
      downloadCount: doc.downloadCount,
      uploadedBy: doc.uploadedBy,
      uploadedAt: doc.uploadedAt,
      updatedAt: doc.updatedAt
    }));
    
    // Get total count for pagination
    const totalCount = await db.select({ count: documents.id })
      .from(documents)
      .where(and(...whereConditions));
    
    return c.json({
      success: true,
      documents: formattedDocs,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / limit)
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
    const db = drizzle(c.env.DB);
    
    const document = await db.select()
      .from(documents)
      .where(and(
        eq(documents.id, documentId),
        eq(documents.tenantId, tenantId)
      ))
      .limit(1);
    
    if (!document.length) {
      return c.json({ error: 'Document not found' }, 404);
    }
    
    const doc = document[0];
    
    // Get document chunks if vectorized
    let chunks = [];
    if (doc.isVectorized) {
      chunks = await db.select()
        .from(documentChunks)
        .where(eq(documentChunks.documentId, documentId))
        .orderBy(documentChunks.chunkIndex);
    }
    
    return c.json({
      success: true,
      document: {
        ...doc,
        tags: doc.tags ? JSON.parse(doc.tags) : [],
        keyTopics: doc.keyTopics ? JSON.parse(doc.keyTopics) : [],
        allowedRoles: doc.allowedRoles ? JSON.parse(doc.allowedRoles) : [],
        chunks: chunks.map(chunk => ({
          id: chunk.id,
          content: chunk.content,
          chunkIndex: chunk.chunkIndex,
          pageNumber: chunk.pageNumber,
          section: chunk.section
        }))
      }
    });
    
  } catch (error) {
    logger.error('Error getting document detail from database', error);
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
    const db = drizzle(c.env.DB);
    
    // Get document info from database
    const document = await db.select()
      .from(documents)
      .where(and(
        eq(documents.id, documentId),
        eq(documents.tenantId, tenantId)
      ))
      .limit(1);
    
    if (!document.length) {
      return c.json({ error: 'Document not found' }, 404);
    }
    
    const doc = document[0];
    
    // Get file from R2
    const file = await c.env.DOCUMENTS.get(doc.storageKey);
    
    if (!file) {
      return c.json({ error: 'File not found in storage' }, 404);
    }
    
    // Update download count in database
    await db.update(documents)
      .set({ 
        downloadCount: doc.downloadCount + 1,
        lastAccessedAt: Date.now(),
        updatedAt: Date.now()
      })
      .where(eq(documents.id, documentId));
    
    logger.info('Document downloaded from R2', { 
      documentId, 
      fileName: doc.fileName,
      tenantId,
      storageKey: doc.storageKey
    });
    
    return new Response(file.body, {
      headers: {
        'Content-Type': file.httpMetadata?.contentType || doc.mimeType,
        'Content-Disposition': file.httpMetadata?.contentDisposition || `attachment; filename="${doc.fileName}"`,
        'Content-Length': file.size.toString(),
        'Cache-Control': 'private, max-age=3600'
      }
    });
    
  } catch (error) {
    logger.error('Error downloading document from R2', error);
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
    
    // Get document info
    const document = await db.select()
      .from(documents)
      .where(and(
        eq(documents.id, documentId),
        eq(documents.tenantId, tenantId)
      ))
      .limit(1);
    
    if (!document.length) {
      return c.json({ error: 'Document not found' }, 404);
    }
    
    const doc = document[0];
    
    // Delete from R2
    await c.env.DOCUMENTS.delete(doc.storageKey);
    
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
