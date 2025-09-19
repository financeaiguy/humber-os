/**
 * Knowledge Base with Vector Search
 * Using Cloudflare Vectorize for semantic search capabilities
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { VectorizeIndex, VectorizeVector } from '@cloudflare/workers-types'
import { getLocalVectorizeIndex, generateMockEmbedding } from '../lib/local-vectorize'

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
    // SECURITY: console statement removederror('Initialization error:', error)
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

    // Check if we're in local development
    const isLocal = c.req.header('host')?.includes('localhost') ||
                   c.req.header('host')?.includes('127.0.0.1') ||
                   c.req.header('host')?.includes('8787')

    let vector: number[]

    if (isLocal) {
      // Use mock embedding for local development
      vector = await generateMockEmbedding(`${title}\n\n${content}`)
    } else {
      // Generate embedding using Workers AI
      const embeddingResponse = await AI.run(
        '@cf/baai/bge-small-en-v1.5',
        {
          text: `${title}\n\n${content}`
        }
      )
      vector = embeddingResponse.data[0]
    }

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

    // Insert into Vectorize or local storage
    if (isLocal) {
      const localIndex = getLocalVectorizeIndex()
      await localIndex.insert([vectorData])
    } else {
      await VECTORIZE_INDEX.insert([vectorData])
    }

    // Also store in D1 for full-text retrieval
    if (c.env.DB) {
      try {
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
      } catch (dbError) {
        // Log error but don't fail if DB insert fails in local dev
        console.error('DB insert error (non-fatal in local dev):', dbError)
      }
    }

    return c.json({
      success: true,
      id: docId,
      message: 'Document added to knowledge base'
    })
  } catch (error) {
    // SECURITY: console statement removederror('Error adding document:', error)
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

    // Check if we're in local development
    const isLocal = c.req.header('host')?.includes('localhost') ||
                   c.req.header('host')?.includes('127.0.0.1') ||
                   c.req.header('host')?.includes('8787')

    let queryVector: number[]

    if (isLocal) {
      // Use mock embedding for local development
      queryVector = await generateMockEmbedding(query)
    } else {
      // Generate embedding for the search query
      const embeddingResponse = await AI.run(
        '@cf/baai/bge-small-en-v1.5',
        {
          text: query
        }
      )
      queryVector = embeddingResponse.data[0]
    }

    // Build filter conditions
    const filterConditions: any = {}
    if (filter?.category) {
      filterConditions.category = filter.category
    }
    if (filter?.tags && filter.tags.length > 0) {
      filterConditions.tags = { $in: filter.tags }
    }

    // Perform vector search
    let results
    if (isLocal) {
      const localIndex = getLocalVectorizeIndex()
      results = await localIndex.query(queryVector, {
        topK: limit,
        filter: Object.keys(filterConditions).length > 0 ? filterConditions : undefined
      })
    } else {
      results = await VECTORIZE_INDEX.query(queryVector, {
        topK: limit,
        filter: Object.keys(filterConditions).length > 0 ? filterConditions : undefined
      })
    }

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
    // SECURITY: console statement removederror('Search error:', error)
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
      try {
        const result = await DB.prepare(`
          SELECT * FROM knowledge_base WHERE id = ?
        `).bind(docId).first()
        originalDoc = result
      } catch (dbError) {
        console.error('DB query error:', dbError)
      }
    }

    // In local dev, we can proceed without the DB record
    if (!originalDoc && !isLocal) {
      return c.json({
        success: false,
        error: 'Document not found'
      }, 404)
    }

    // Check if we're in local development
    const isLocal = c.req.header('host')?.includes('localhost') ||
                   c.req.header('host')?.includes('127.0.0.1') ||
                   c.req.header('host')?.includes('8787')

    let vector
    let results

    if (isLocal) {
      const localIndex = getLocalVectorizeIndex()
      vector = await localIndex.getByIds([docId])

      if (!vector || vector.length === 0) {
        return c.json({
          success: false,
          error: 'Vector not found for document'
        }, 404)
      }

      // Find similar documents
      results = await localIndex.query(vector[0].values, {
        topK: limit + 1, // +1 because it will include itself
        filter: {
          id: { $ne: docId } // Exclude the original document
        }
      })
    } else {
      // Get the vector for this document
      vector = await VECTORIZE_INDEX.getByIds([docId])

      if (!vector || vector.length === 0) {
        return c.json({
          success: false,
          error: 'Vector not found for document'
        }, 404)
      }

      // Find similar documents
      results = await VECTORIZE_INDEX.query(vector[0].values, {
        topK: limit + 1, // +1 because it will include itself
        filter: {
          id: { $ne: docId } // Exclude the original document
        }
      })
    }

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
    // SECURITY: console statement removederror('Error finding similar documents:', error)
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

    // Check if we're in local development
    const isLocal = c.req.header('host')?.includes('localhost') ||
                   c.req.header('host')?.includes('127.0.0.1') ||
                   c.req.header('host')?.includes('8787')

    // Delete from Vectorize or local storage
    if (isLocal) {
      const localIndex = getLocalVectorizeIndex()
      await localIndex.deleteByIds([docId])
    } else {
      await VECTORIZE_INDEX.deleteByIds([docId])
    }

    // Delete from D1
    if (DB) {
      try {
        await DB.prepare(`
          DELETE FROM knowledge_base WHERE id = ?
        `).bind(docId).run()
      } catch (dbError) {
        console.error('DB delete error (non-fatal in local dev):', dbError)
      }
    }

    return c.json({
      success: true,
      message: 'Document deleted from knowledge base'
    })
  } catch (error) {
    // SECURITY: console statement removederror('Error deleting document:', error)
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

      // Check if we're in local development
      const isLocal = c.req.header('host')?.includes('localhost') ||
                     c.req.header('host')?.includes('127.0.0.1') ||
                     c.req.header('host')?.includes('8787')

      let embeddingVector: number[]

      if (isLocal) {
        // Use mock embedding for local development
        embeddingVector = await generateMockEmbedding(`${title}\n\n${content}`)
      } else {
        // Generate embedding
        const embeddingResponse = await AI.run(
          '@cf/baai/bge-small-en-v1.5',
          {
            text: `${title}\n\n${content}`
          }
        )
        embeddingVector = embeddingResponse.data[0]
      }

      vectors.push({
        id: docId,
        values: embeddingVector,
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

    // Check if we're in local development
    const isLocal = c.req.header('host')?.includes('localhost') ||
                   c.req.header('host')?.includes('127.0.0.1') ||
                   c.req.header('host')?.includes('8787')

    // Bulk insert into Vectorize or local storage
    if (isLocal) {
      const localIndex = getLocalVectorizeIndex()
      await localIndex.insert(vectors)
    } else {
      await VECTORIZE_INDEX.insert(vectors)
    }

    // Bulk insert into D1
    if (DB && dbInserts.length > 0) {
      try {
        const stmt = DB.prepare(`
          INSERT INTO knowledge_base (id, title, content, category, tags, metadata, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)

        await DB.batch(
          dbInserts.map(doc =>
            stmt.bind(doc.id, doc.title, doc.content, doc.category, doc.tags, doc.metadata, doc.createdAt)
          )
        )
      } catch (dbError) {
        console.error('DB bulk insert error (non-fatal in local dev):', dbError)
      }
    }

    return c.json({
      success: true,
      message: `Imported ${vectors.length} documents`,
      documentIds: vectors.map(v => v.id)
    })
  } catch (error) {
    // SECURITY: console statement removederror('Bulk import error:', error)
    return c.json({
      success: false,
      error: 'Failed to bulk import documents'
    }, 500)
  }
})

export default app