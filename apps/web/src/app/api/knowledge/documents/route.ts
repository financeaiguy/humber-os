import { NextRequest, NextResponse } from 'next/server'
import { knowledgeNervousSystem, addDocument } from '@/lib/knowledge-nervous-system'

export const runtime = 'edge'

// GET: Search and retrieve documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const context = {
      sessionId: request.headers.get('x-session-id') || 'anonymous',
      currentPage: 'knowledge',
      currentFeature: 'document-search',
      userRole: request.headers.get('x-user-role') || 'user',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV as any || 'development'
    }

    let results = []

    if (query) {
      results = await knowledgeNervousSystem.searchKnowledge(query, context)
    } else {
      // Return all documents with filtering
      results = await knowledgeNervousSystem.searchKnowledge('', context)
    }

    // Apply additional filters
    if (category && category !== 'All') {
      results = results.filter(doc => doc.category === category)
    }
    if (type && type !== 'All') {
      results = results.filter(doc => doc.type === type)
    }

    // Pagination
    const total = results.length
    const paginatedResults = results.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      documents: paginatedResults,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      metadata: {
        queryTime: new Date().toISOString(),
        searchTerms: query.split(' ').filter(Boolean),
        filters: { category, type }
      }
    })

  } catch (error) {
    console.error('Document search error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search documents',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST: Upload new document
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const metadataStr = formData.get('metadata') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    const metadata = metadataStr ? JSON.parse(metadataStr) : {}

    // Basic file validation
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/quicktime'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type' },
        { status: 400 }
      )
    }

    // Extract text content (mock implementation)
    let extractedText = ''
    if (file.type.startsWith('text/')) {
      extractedText = await file.text()
    }

    // Create document object
    const documentData = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
      type: getDocumentType(file.type),
      size: file.size,
      url: `/uploads/${file.name}`, // Would be actual storage URL
      content: extractedText,
      metadata: {
        author: metadata.author || request.headers.get('x-user-name') || 'Anonymous',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: metadata.tags || [],
        category: metadata.category || 'Uncategorized',
        description: metadata.description || `Uploaded file: ${file.name}`,
        version: 1,
        status: 'draft' as const,
        accessLevel: metadata.accessLevel || 'internal' as const,
        downloadCount: 0,
        viewCount: 0,
        rating: 0,
        comments: 0,
        originalFilename: file.name,
        mimeType: file.type
      }
    }

    // Add to knowledge nervous system
    const context = {
      sessionId: request.headers.get('x-session-id') || 'anonymous',
      currentPage: 'knowledge',
      currentFeature: 'document-upload',
      userRole: request.headers.get('x-user-role') || 'user',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV as any || 'development'
    }

    await addDocument(documentData, context)

    // In a real implementation, you would:
    // 1. Store the file in cloud storage (S3, Cloudflare R2, etc.)
    // 2. Extract text using OCR/parsers for various file types
    // 3. Generate embeddings for semantic search
    // 4. Store metadata in database
    // 5. Trigger async processing for AI analysis

    return NextResponse.json({
      success: true,
      document: {
        id: documentData.id,
        title: documentData.title,
        type: documentData.type,
        size: documentData.size,
        url: documentData.url,
        metadata: documentData.metadata
      },
      message: 'Document uploaded successfully'
    })

  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload document',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function getDocumentType(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType === 'application/msword' || 
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx'
  if (mimeType === 'application/vnd.ms-excel' || 
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'xlsx'
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('text/')) return 'txt'
  return 'other'
}