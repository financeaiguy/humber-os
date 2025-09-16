/**
 * Knowledge Base with Vector Search
 * Using Cloudflare Vectorize for semantic search capabilities
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { VectorizeIndex, VectorizeVector } from '@cloudflare/workers-types'

interface Env {
  VECTORIZE_INDEX: VectorizeIndex
  AI: any
  DB: D1Database
}

// Schema for knowledge base entries
const KnowledgeEntrySchema = z.object({
  title: z.string(),
  content: z.string(),
  category: z.enum(['engineering', 'hr', 'compliance', 'operations', 'safety']),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
})

// Schema for search queries
const SearchQuerySchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(50).default(10),
  filter: z.object({
    category: z.enum(['engineering', 'hr', 'compliance', 'operations', 'safety']).optional(),
    tags: z.array(z.string()).optional()
  }).optional()
})

const app = new Hono<{ Bindings: Env }>()

// Enable CORS
app.use('*', cors())

/**
 * Initialize vector index (for local development)
 * In production, this would be done through Cloudflare dashboard
 */
app.post('/initialize', async (c) => {
  try {
    const { VECTORIZE_INDEX } = c.env

    // Check if we're in local development
    const isLocal = c.req.header('host')?.includes('localhost') || 
                   c.req.header('host')?.includes('127.0.0.1')

    if (isLocal) {
      // Local initialization message
      return c.json({
        success: true,
        message: 'Local Vectorize initialized. Note: In local mode, vectors are stored in memory and will reset on restart.',
        capabilities: {
          dimensions: 1536, // OpenAI embedding dimensions
          metric: 'cosine',
          maxVectors: 100000
        }
      })
    }

    return c.json({
      success: true,
      message: 'Vectorize index ready for production use'
    })
  } catch (error) {
    console.error('Initialization error:', error)
    return c.json({
      success: false,
      error: 'Failed to initialize vector index'
    }, 500)
  }
})

/**
 * Add a document to the knowledge base
 */
app.post('/documents', async (c) => {
  try {
    const body = await c.req.json()
    const validation = KnowledgeEntrySchema.safeParse(body)

    if (!validation.success) {
      return c.json({
        success: false,
        errors: validation.error.errors
      }, 400)
    }

    const { title, content, category, tags, metadata } = validation.data
    const { VECTORIZE_INDEX, AI } = c.env

    // Generate unique ID for the document
    const docId = crypto.randomUUID()

    // Generate embedding using Workers AI
    const embeddingResponse = await AI.run(
      '@cf/baai/bge-base-en-v1.5',
      {
        text: `${title}\n\n${content}`
      }
    )

    // Extract the embedding vector
    const vector = embeddingResponse.data[0]

    // Prepare vector with metadata
    const vectorData: VectorizeVector = {
      id: docId,
      values: vector,
      metadata: {
        title,
        content: content.substring(0, 500), // Store truncated content in metadata
        category,
        tags: tags || [],
        ...metadata,
        createdAt: new Date().toISOString()
      }
    }

    // Insert into Vectorize
    await VECTORIZE_INDEX.insert([vectorData])

    // Also store in D1 for full-text retrieval
    if (c.env.DB) {
      await c.env.DB.prepare(`
        INSERT INTO knowledge_base (id, title, content, category, tags, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        docId,
        title,
        content,
        category,
        JSON.stringify(tags || []),
        JSON.stringify(metadata || {}),
        new Date().toISOString()
      ).run()
    }

    return c.json({
      success: true,
      id: docId,
      message: 'Document added to knowledge base'
    })
  } catch (error) {
    console.error('Error adding document:', error)
    return c.json({
      success: false,
      error: 'Failed to add document to knowledge base'
    }, 500)
  }
})

/**
 * Search the knowledge base using semantic search
 */
app.post('/search', async (c) => {
  try {
    const body = await c.req.json()
    const validation = SearchQuerySchema.safeParse(body)

    if (!validation.success) {
      return c.json({
        success: false,
        errors: validation.error.errors
      }, 400)
    }

    const { query, limit, filter } = validation.data
    const { VECTORIZE_INDEX, AI } = c.env

    // Generate embedding for the search query
    const embeddingResponse = await AI.run(
      '@cf/baai/bge-base-en-v1.5',
      {
        text: query
      }
    )

    const queryVector = embeddingResponse.data[0]

    // Build filter conditions
    const filterConditions: any = {}
    if (filter?.category) {
      filterConditions.category = filter.category
    }
    if (filter?.tags && filter.tags.length > 0) {
      filterConditions.tags = { $in: filter.tags }
    }

    // Perform vector search
    const results = await VECTORIZE_INDEX.query(queryVector, {
      topK: limit,
      filter: Object.keys(filterConditions).length > 0 ? filterConditions : undefined
    })

    // Format results
    const formattedResults = results.matches.map(match => ({
      id: match.id,
      score: match.score,
      title: match.metadata?.title || 'Untitled',
      content: match.metadata?.content || '',
      category: match.metadata?.category || 'uncategorized',
      tags: match.metadata?.tags || [],
      metadata: match.metadata || {}
    }))

    return c.json({
      success: true,
      query,
      results: formattedResults,
      count: formattedResults.length
    })
  } catch (error) {
    console.error('Search error:', error)
    return c.json({
      success: false,
      error: 'Failed to search knowledge base'
    }, 500)
  }
})

/**
 * Get similar documents to a given document
 */
app.get('/documents/:id/similar', async (c) => {
  try {
    const docId = c.req.param('id')
    const limit = parseInt(c.req.query('limit') || '5')
    const { VECTORIZE_INDEX, DB } = c.env

    // First, get the original document from D1
    let originalDoc = null
    if (DB) {
      const result = await DB.prepare(`
        SELECT * FROM knowledge_base WHERE id = ?
      `).bind(docId).first()
      originalDoc = result
    }

    if (!originalDoc) {
      return c.json({
        success: false,
        error: 'Document not found'
      }, 404)
    }

    // Get the vector for this document
    const vector = await VECTORIZE_INDEX.getByIds([docId])
    
    if (!vector || vector.length === 0) {
      return c.json({
        success: false,
        error: 'Vector not found for document'
      }, 404)
    }

    // Find similar documents
    const results = await VECTORIZE_INDEX.query(vector[0].values, {
      topK: limit + 1, // +1 because it will include itself
      filter: {
        id: { $ne: docId } // Exclude the original document
      }
    })

    const formattedResults = results.matches.map(match => ({
      id: match.id,
      score: match.score,
      title: match.metadata?.title || 'Untitled',
      content: match.metadata?.content || '',
      category: match.metadata?.category || 'uncategorized',
      tags: match.metadata?.tags || []
    }))

    return c.json({
      success: true,
      originalDocument: {
        id: docId,
        title: originalDoc.title
      },
      similarDocuments: formattedResults,
      count: formattedResults.length
    })
  } catch (error) {
    console.error('Error finding similar documents:', error)
    return c.json({
      success: false,
      error: 'Failed to find similar documents'
    }, 500)
  }
})

/**
 * Delete a document from the knowledge base
 */
app.delete('/documents/:id', async (c) => {
  try {
    const docId = c.req.param('id')
    const { VECTORIZE_INDEX, DB } = c.env

    // Delete from Vectorize
    await VECTORIZE_INDEX.deleteByIds([docId])

    // Delete from D1
    if (DB) {
      await DB.prepare(`
        DELETE FROM knowledge_base WHERE id = ?
      `).bind(docId).run()
    }

    return c.json({
      success: true,
      message: 'Document deleted from knowledge base'
    })
  } catch (error) {
    console.error('Error deleting document:', error)
    return c.json({
      success: false,
      error: 'Failed to delete document'
    }, 500)
  }
})

/**
 * Bulk import documents (useful for initial setup)
 */
app.post('/bulk-import', async (c) => {
  try {
    const { documents } = await c.req.json()
    const { VECTORIZE_INDEX, AI, DB } = c.env

    if (!Array.isArray(documents)) {
      return c.json({
        success: false,
        error: 'Documents must be an array'
      }, 400)
    }

    const vectors: VectorizeVector[] = []
    const dbInserts = []

    for (const doc of documents) {
      const validation = KnowledgeEntrySchema.safeParse(doc)
      if (!validation.success) continue

      const { title, content, category, tags, metadata } = validation.data
      const docId = crypto.randomUUID()

      // Generate embedding
      const embeddingResponse = await AI.run(
        '@cf/baai/bge-base-en-v1.5',
        {
          text: `${title}\n\n${content}`
        }
      )

      vectors.push({
        id: docId,
        values: embeddingResponse.data[0],
        metadata: {
          title,
          content: content.substring(0, 500),
          category,
          tags: tags || [],
          ...metadata,
          createdAt: new Date().toISOString()
        }
      })

      if (DB) {
        dbInserts.push({
          id: docId,
          title,
          content,
          category,
          tags: JSON.stringify(tags || []),
          metadata: JSON.stringify(metadata || {}),
          createdAt: new Date().toISOString()
        })
      }
    }

    // Bulk insert into Vectorize
    await VECTORIZE_INDEX.insert(vectors)

    // Bulk insert into D1
    if (DB && dbInserts.length > 0) {
      const stmt = DB.prepare(`
        INSERT INTO knowledge_base (id, title, content, category, tags, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      
      await DB.batch(
        dbInserts.map(doc => 
          stmt.bind(doc.id, doc.title, doc.content, doc.category, doc.tags, doc.metadata, doc.createdAt)
        )
      )
    }

    return c.json({
      success: true,
      message: `Imported ${vectors.length} documents`,
      documentIds: vectors.map(v => v.id)
    })
  } catch (error) {
    console.error('Bulk import error:', error)
    return c.json({
      success: false,
      error: 'Failed to bulk import documents'
    }, 500)
  }
})

export default app