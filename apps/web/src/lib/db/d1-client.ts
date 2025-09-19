/**
 * D1 Database Client with Multi-tenant Isolation
 * Provides secure, tenant-scoped database operations
 */

import { logger } from '../logger'
import { getConfig } from '../secure-config'

export interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>
  exec(query: string): Promise<D1ExecResult>
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = unknown>(columnName?: string): Promise<T | null>
  run<T = unknown>(): Promise<D1Result<T>>
  all<T = unknown>(): Promise<D1Result<T>>
  raw<T = unknown>(): Promise<T[]>
}

export interface D1Result<T = unknown> {
  results?: T[]
  success: boolean
  error?: string
  meta?: any
}

export interface D1ExecResult {
  count: number
  duration: number
}

export interface TenantContext {
  tenantId: string
  userId?: string
  role?: string
}

export class D1Client {
  private db: D1Database | null = null
  private tenantContext: TenantContext | null = null

  constructor(database?: D1Database) {
    this.db = database || null
  }

  // Set the current tenant context for all queries
  setTenantContext(context: TenantContext) {
    this.tenantContext = context
    logger.debug('Tenant context set', {
      tenantId: context.tenantId,
      userId: context.userId,
      component: 'd1-client'
    })
  }

  // Get current tenant ID
  getTenantId(): string {
    if (!this.tenantContext?.tenantId) {
      throw new Error('No tenant context set')
    }
    return this.tenantContext.tenantId
  }

  // Initialize database with schema
  async initialize(database: D1Database) {
    this.db = database
    logger.info('D1 database initialized', { component: 'd1-client' })
  }

  // Execute schema migration
  async migrate(schema: string) {
    if (!this.db) throw new Error('Database not initialized')
    
    try {
      await this.db.exec(schema)
      logger.info('Database migration completed', { component: 'd1-client' })
    } catch (error) {
      logger.error('Database migration failed', error as Error, { component: 'd1-client' })
      throw error
    }
  }

  // --- Tenant Management ---

  async createTenant(tenant: {
    id: string
    name: string
    slug: string
    plan?: string
    settings?: any
  }) {
    if (!this.db) throw new Error('Database not initialized')

    const stmt = this.db.prepare(`
      INSERT INTO tenants (id, name, slug, plan, settings)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      tenant.id,
      tenant.name,
      tenant.slug,
      tenant.plan || 'standard',
      JSON.stringify(tenant.settings || {})
    )

    const result = await stmt.run()
    
    logger.audit('Tenant created', {
      tenantId: tenant.id,
      name: tenant.name,
      plan: tenant.plan
    })

    return result
  }

  async getTenant(tenantId: string) {
    if (!this.db) throw new Error('Database not initialized')

    const result = await this.db.prepare(`
      SELECT * FROM tenants WHERE id = ?
    `).bind(tenantId).first()

    return result
  }

  // --- Knowledge Node Operations (Tenant-scoped) ---

  async addKnowledgeNode(node: {
    id: string
    type: string
    content: any
    metadata?: any
    confidence?: number
    importance?: string
  }) {
    if (!this.db) throw new Error('Database not initialized')
    const tenantId = this.getTenantId()

    const stmt = this.db.prepare(`
      INSERT INTO knowledge_nodes (
        id, tenant_id, type, content, metadata, confidence, importance
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      node.id,
      tenantId,
      node.type,
      JSON.stringify(node.content),
      JSON.stringify(node.metadata || {}),
      node.confidence || 0.5,
      node.importance || 'medium'
    )

    const result = await stmt.run()

    logger.info('Knowledge node added', {
      nodeId: node.id,
      type: node.type,
      tenantId,
      component: 'd1-client'
    })

    return result
  }

  async getKnowledgeNode(nodeId: string) {
    if (!this.db) throw new Error('Database not initialized')
    const tenantId = this.getTenantId()

    const result = await this.db.prepare(`
      SELECT * FROM knowledge_nodes 
      WHERE id = ? AND tenant_id = ?
    `).bind(nodeId, tenantId).first()

    if (result) {
      // Update access count
      await this.db.prepare(`
        UPDATE knowledge_nodes 
        SET access_count = access_count + 1,
            last_accessed = datetime('now')
        WHERE id = ? AND tenant_id = ?
      `).bind(nodeId, tenantId).run()
    }

    return result
  }

  async searchKnowledgeNodes(params: {
    type?: string
    query?: string
    limit?: number
    offset?: number
  }) {
    if (!this.db) throw new Error('Database not initialized')
    const tenantId = this.getTenantId()

    let sql = `
      SELECT * FROM knowledge_nodes 
      WHERE tenant_id = ?
    `
    const bindings: any[] = [tenantId]

    if (params.type) {
      sql += ` AND type = ?`
      bindings.push(params.type)
    }

    if (params.query) {
      sql += ` AND (content LIKE ? OR json_extract(metadata, '$.tags') LIKE ?)`
      bindings.push(`%${params.query}%`, `%${params.query}%`)
    }

    sql += ` ORDER BY importance DESC, confidence DESC`
    sql += ` LIMIT ? OFFSET ?`
    bindings.push(params.limit || 100, params.offset || 0)

    const result = await this.db.prepare(sql).bind(...bindings).all()

    return result.results || []
  }

  async addKnowledgeRelationship(rel: {
    sourceNodeId: string
    targetNodeId: string
    relationshipType: string
    strength?: number
    context?: string
  }) {
    if (!this.db) throw new Error('Database not initialized')
    const tenantId = this.getTenantId()

    const stmt = this.db.prepare(`
      INSERT INTO knowledge_relationships (
        id, tenant_id, source_node_id, target_node_id, 
        relationship_type, strength, context
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      `rel_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      tenantId,
      rel.sourceNodeId,
      rel.targetNodeId,
      rel.relationshipType,
      rel.strength || 0.5,
      rel.context || null
    )

    return await stmt.run()
  }

  // --- Document Operations (Tenant-scoped) ---

  async saveDocumentMetadata(doc: {
    id: string
    title: string
    type: string
    size: number
    r2Key: string
    r2Bucket: string
    contentHash?: string
    extractedText?: string
    metadata?: any
    aiAnalysis?: any
  }) {
    if (!this.db) throw new Error('Database not initialized')
    const tenantId = this.getTenantId()

    const stmt = this.db.prepare(`
      INSERT INTO documents (
        id, tenant_id, title, type, size, r2_key, r2_bucket,
        content_hash, extracted_text, metadata, ai_analysis
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      doc.id,
      tenantId,
      doc.title,
      doc.type,
      doc.size,
      doc.r2Key,
      doc.r2Bucket,
      doc.contentHash || null,
      doc.extractedText || null,
      JSON.stringify(doc.metadata || {}),
      JSON.stringify(doc.aiAnalysis || {})
    )

    const result = await stmt.run()

    // Update FTS index if text was extracted
    if (doc.extractedText) {
      await this.db.prepare(`
        INSERT INTO documents_fts (title, extracted_text)
        VALUES (?, ?)
      `).bind(doc.title, doc.extractedText).run()
    }

    logger.info('Document metadata saved', {
      documentId: doc.id,
      title: doc.title,
      tenantId,
      component: 'd1-client'
    })

    return result
  }

  async searchDocuments(query: string, limit: number = 20) {
    if (!this.db) throw new Error('Database not initialized')
    const tenantId = this.getTenantId()

    const results = await this.db.prepare(`
      SELECT d.* FROM documents d
      JOIN documents_fts ON d.rowid = documents_fts.rowid
      WHERE d.tenant_id = ? 
        AND documents_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `).bind(tenantId, query, limit).all()

    return results.results || []
  }

  // --- Learning Queue Operations ---

  async addToLearningQueue(item: {
    data: any
    context: any
    priority?: number
  }) {
    if (!this.db) throw new Error('Database not initialized')
    const tenantId = this.getTenantId()

    const stmt = this.db.prepare(`
      INSERT INTO learning_queue (
        id, tenant_id, data, context, priority
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(
      `lq_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      tenantId,
      JSON.stringify(item.data),
      JSON.stringify(item.context),
      item.priority || 5
    )

    return await stmt.run()
  }

  async getNextLearningItem() {
    if (!this.db) throw new Error('Database not initialized')
    const tenantId = this.getTenantId()

    const item = await this.db.prepare(`
      SELECT * FROM learning_queue
      WHERE tenant_id = ? AND status = 'pending'
      ORDER BY priority DESC, created_at ASC
      LIMIT 1
    `).bind(tenantId).first()

    if (item) {
      // Mark as processing
      await this.db.prepare(`
        UPDATE learning_queue 
        SET status = 'processing', attempts = attempts + 1
        WHERE id = ?
      `).bind(item.id).run()
    }

    return item
  }

  async completeLearningItem(id: string, success: boolean, error?: string) {
    if (!this.db) throw new Error('Database not initialized')

    await this.db.prepare(`
      UPDATE learning_queue 
      SET status = ?, error = ?, processed_at = datetime('now')
      WHERE id = ?
    `).bind(
      success ? 'completed' : 'failed',
      error || null,
      id
    ).run()
  }

  // --- Audit Logging ---

  async logAudit(audit: {
    action: string
    resourceType?: string
    resourceId?: string
    details?: any
    ipAddress?: string
    userAgent?: string
  }) {
    if (!this.db) throw new Error('Database not initialized')
    const tenantId = this.getTenantId()
    const userId = this.tenantContext?.userId

    const stmt = this.db.prepare(`
      INSERT INTO audit_logs (
        id, tenant_id, user_id, action, resource_type,
        resource_id, details, ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      `audit_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      tenantId,
      userId || null,
      audit.action,
      audit.resourceType || null,
      audit.resourceId || null,
      JSON.stringify(audit.details || {}),
      audit.ipAddress || null,
      audit.userAgent || null
    )

    await stmt.run()
  }

  // --- Batch Operations ---

  async batchInsertKnowledgeNodes(nodes: any[]) {
    if (!this.db) throw new Error('Database not initialized')
    const tenantId = this.getTenantId()

    const statements = nodes.map(node => 
      this.db!.prepare(`
        INSERT INTO knowledge_nodes (
          id, tenant_id, type, content, metadata, confidence, importance
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        node.id,
        tenantId,
        node.type,
        JSON.stringify(node.content),
        JSON.stringify(node.metadata || {}),
        node.confidence || 0.5,
        node.importance || 'medium'
      )
    )

    const results = await this.db.batch(statements)
    
    logger.info('Batch insert knowledge nodes', {
      count: nodes.length,
      tenantId,
      component: 'd1-client'
    })

    return results
  }

  // --- Analytics Queries ---

  async getKnowledgeStats() {
    if (!this.db) throw new Error('Database not initialized')
    const tenantId = this.getTenantId()

    const stats = await this.db.prepare(`
      SELECT 
        COUNT(*) as total_nodes,
        COUNT(DISTINCT type) as node_types,
        AVG(confidence) as avg_confidence,
        SUM(access_count) as total_accesses,
        MAX(created_at) as latest_node
      FROM knowledge_nodes
      WHERE tenant_id = ?
    `).bind(tenantId).first()

    const typeBreakdown = await this.db.prepare(`
      SELECT type, COUNT(*) as count
      FROM knowledge_nodes
      WHERE tenant_id = ?
      GROUP BY type
    `).bind(tenantId).all()

    return {
      ...stats,
      typeBreakdown: typeBreakdown.results
    }
  }

  // --- Health Check ---

  async healthCheck(): Promise<boolean> {
    if (!this.db) return false

    try {
      const result = await this.db.prepare('SELECT 1').first()
      return !!result
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const d1Client = new D1Client()

// Helper function to initialize with Cloudflare bindings
export function initializeD1(env: any) {
  if (env.DB) {
    d1Client.initialize(env.DB)
  }
}