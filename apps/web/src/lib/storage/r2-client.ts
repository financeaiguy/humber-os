/**
 * R2 Storage Client with Multi-tenant Isolation
 * Handles document storage and retrieval with tenant-based buckets
 */

import { logger } from '../logger'
import { d1Client } from '../db/d1-client'

// Cross-platform crypto utilities
const getCrypto = () => {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto
  }
  // For Node.js environments, try webcrypto first
  if (typeof require !== 'undefined') {
    try {
      const crypto = require('crypto')
      return crypto.webcrypto || crypto
    } catch {
      // Fallback for environments without crypto
      throw new Error('Crypto API not available')
    }
  }
  throw new Error('Crypto API not available')
}

const createHash = async (data: string): Promise<string> => {
  const crypto = getCrypto()
  if (crypto.subtle) {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  // Fallback for Node.js
  const nodeCrypto = require('crypto')
  return nodeCrypto.createHash('sha256').update(data).digest('hex')
}

const randomBytes = (length: number): Uint8Array => {
  const crypto = getCrypto()
  if (crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint8Array(length))
  }
  // Fallback for Node.js
  const nodeCrypto = require('crypto')
  return new Uint8Array(nodeCrypto.randomBytes(length))
}

export interface R2Bucket {
  put(key: string, value: ArrayBuffer | ArrayBufferView | string | ReadableStream, options?: R2PutOptions): Promise<R2Object | null>
  get(key: string, options?: R2GetOptions): Promise<R2ObjectBody | null>
  delete(key: string): Promise<void>
  head(key: string): Promise<R2Object | null>
  list(options?: R2ListOptions): Promise<R2Objects>
}

export interface R2Object {
  key: string
  version: string
  size: number
  etag: string
  httpEtag: string
  checksums: R2Checksums
  uploaded: Date
  httpMetadata?: R2HTTPMetadata
  customMetadata?: Record<string, string>
  range?: R2Range
  storageClass?: string
}

export interface R2ObjectBody extends R2Object {
  body: ReadableStream
  bodyUsed: boolean
  arrayBuffer(): Promise<ArrayBuffer>
  text(): Promise<string>
  json<T = unknown>(): Promise<T>
  blob(): Promise<Blob>
}

export interface R2PutOptions {
  httpMetadata?: R2HTTPMetadata
  customMetadata?: Record<string, string>
  md5?: string
  sha1?: string
  sha256?: string
  sha384?: string
  sha512?: string
}

export interface R2GetOptions {
  onlyIf?: R2Conditional
}

export interface R2ListOptions {
  limit?: number
  prefix?: string
  cursor?: string
  delimiter?: string
  startAfter?: string
  include?: Array<'httpMetadata' | 'customMetadata'>
}

export interface R2Objects {
  objects: R2Object[]
  truncated: boolean
  cursor?: string
  delimitedPrefixes?: string[]
}

export interface R2HTTPMetadata {
  contentType?: string
  contentLanguage?: string
  contentDisposition?: string
  contentEncoding?: string
  cacheControl?: string
  cacheExpiry?: Date
}

export interface R2Conditional {
  etagMatches?: string
  etagDoesNotMatch?: string
  uploadedBefore?: Date
  uploadedAfter?: Date
}

export interface R2Checksums {
  md5?: string
  sha1?: string
  sha256?: string
  sha384?: string
  sha512?: string
}

export interface R2Range {
  offset: number
  length?: number
  suffix?: number
}

export class R2StorageClient {
  private bucket: R2Bucket | null = null
  private tenantId: string | null = null

  constructor(bucket?: R2Bucket) {
    this.bucket = bucket || null
  }

  // Initialize with R2 bucket
  initialize(bucket: R2Bucket) {
    this.bucket = bucket
    logger.info('R2 storage client initialized', { component: 'r2-client' })
  }

  // Set tenant context
  setTenant(tenantId: string) {
    this.tenantId = tenantId
    d1Client.setTenantContext({ tenantId })
  }

  // Get tenant-specific storage path
  private getTenantPath(key: string): string {
    if (!this.tenantId) {
      throw new Error('No tenant context set')
    }
    return `tenants/${this.tenantId}/${key}`
  }

  // Generate content hash for deduplication
  private async generateContentHash(content: ArrayBuffer | string): Promise<string> {
    if (typeof content === 'string') {
      return await createHash(content)
    } else {
      const decoder = new TextDecoder()
      const textContent = decoder.decode(content)
      return await createHash(textContent)
    }
  }

  // Upload document to R2
  async uploadDocument(params: {
    id: string
    filename: string
    content: ArrayBuffer | string | ReadableStream
    contentType?: string
    metadata?: Record<string, string>
    extractedText?: string
    aiAnalysis?: any
  }): Promise<{ success: boolean; r2Key: string; url: string }> {
    if (!this.bucket) throw new Error('R2 bucket not initialized')

    const tenantPath = this.getTenantPath(`documents/${params.id}/${params.filename}`)
    
    // Calculate content hash for deduplication (if possible)
    let contentHash: string | undefined
    if (params.content instanceof ArrayBuffer || typeof params.content === 'string') {
      contentHash = await this.generateContentHash(params.content)
      
      // Check if document already exists with same hash
      const existing = await d1Client.searchDocuments(contentHash, 1)
      if (existing.length > 0) {
        logger.info('Document already exists (duplicate detected)', {
          hash: contentHash,
          existingId: existing[0].id,
          component: 'r2-client'
        })
      }
    }

    try {
      // Upload to R2
      const r2Object = await this.bucket.put(tenantPath, params.content, {
        httpMetadata: {
          contentType: params.contentType || 'application/octet-stream',
          cacheControl: 'max-age=31536000' // 1 year cache
        },
        customMetadata: {
          ...params.metadata,
          tenantId: this.tenantId!,
          uploadedAt: new Date().toISOString()
        }
      })

      if (!r2Object) {
        throw new Error('Failed to upload to R2')
      }

      // Save metadata to D1
      await d1Client.saveDocumentMetadata({
        id: params.id,
        title: params.filename,
        type: this.getDocumentType(params.contentType || ''),
        size: r2Object.size,
        r2Key: tenantPath,
        r2Bucket: 'humber-documents', // Configure based on environment
        contentHash,
        extractedText: params.extractedText,
        metadata: params.metadata,
        aiAnalysis: params.aiAnalysis
      })

      const url = this.getPublicUrl(tenantPath)

      logger.info('Document uploaded successfully', {
        documentId: params.id,
        filename: params.filename,
        size: r2Object.size,
        tenantId: this.tenantId,
        component: 'r2-client'
      })

      return {
        success: true,
        r2Key: tenantPath,
        url
      }
    } catch (error) {
      logger.error('Document upload failed', error as Error, {
        documentId: params.id,
        filename: params.filename,
        tenantId: this.tenantId,
        component: 'r2-client'
      })
      throw error
    }
  }

  // Get document from R2
  async getDocument(documentId: string): Promise<R2ObjectBody | null> {
    if (!this.bucket) throw new Error('R2 bucket not initialized')

    // Get metadata from D1
    const metadata = await d1Client.getKnowledgeNode(documentId)
    if (!metadata) {
      logger.warn('Document not found in database', {
        documentId,
        tenantId: this.tenantId,
        component: 'r2-client'
      })
      return null
    }

    try {
      const object = await this.bucket.get(metadata.r2_key)
      
      if (object) {
        // Update view count
        await d1Client.db?.prepare(`
          UPDATE documents 
          SET view_count = view_count + 1 
          WHERE id = ? AND tenant_id = ?
        `).bind(documentId, this.tenantId).run()
      }

      return object
    } catch (error) {
      logger.error('Failed to retrieve document', error as Error, {
        documentId,
        tenantId: this.tenantId,
        component: 'r2-client'
      })
      throw error
    }
  }

  // Delete document from R2
  async deleteDocument(documentId: string): Promise<boolean> {
    if (!this.bucket) throw new Error('R2 bucket not initialized')

    // Get metadata from D1
    const metadata = await d1Client.getKnowledgeNode(documentId)
    if (!metadata) {
      return false
    }

    try {
      // Delete from R2
      await this.bucket.delete(metadata.r2_key)
      
      // Delete metadata from D1
      await d1Client.db?.prepare(`
        DELETE FROM documents 
        WHERE id = ? AND tenant_id = ?
      `).bind(documentId, this.tenantId).run()

      logger.info('Document deleted', {
        documentId,
        tenantId: this.tenantId,
        component: 'r2-client'
      })

      return true
    } catch (error) {
      logger.error('Failed to delete document', error as Error, {
        documentId,
        tenantId: this.tenantId,
        component: 'r2-client'
      })
      throw error
    }
  }

  // List documents for tenant
  async listDocuments(options?: {
    prefix?: string
    limit?: number
    cursor?: string
  }): Promise<R2Objects> {
    if (!this.bucket) throw new Error('R2 bucket not initialized')

    const tenantPrefix = this.getTenantPath(options?.prefix || 'documents/')

    return await this.bucket.list({
      prefix: tenantPrefix,
      limit: options?.limit || 100,
      cursor: options?.cursor,
      include: ['customMetadata', 'httpMetadata']
    })
  }

  // Generate signed URL for temporary access
  async generateSignedUrl(documentId: string, expiresIn: number = 3600): Promise<string> {
    // In production, implement signed URL generation
    // For now, return a public URL
    const metadata = await d1Client.getKnowledgeNode(documentId)
    if (!metadata) {
      throw new Error('Document not found')
    }

    return this.getPublicUrl(metadata.r2_key)
  }

  // Get public URL for a document
  private getPublicUrl(key: string): string {
    // Configure based on your R2 public bucket settings
    const baseUrl = process.env.R2_PUBLIC_URL || 'https://r2.humber.io'
    return `${baseUrl}/${key}`
  }

  // Determine document type from content type
  private getDocumentType(contentType: string): string {
    if (contentType.includes('pdf')) return 'pdf'
    if (contentType.includes('word') || contentType.includes('document')) return 'docx'
    if (contentType.includes('sheet') || contentType.includes('excel')) return 'xlsx'
    if (contentType.includes('image')) return 'image'
    if (contentType.includes('video')) return 'video'
    if (contentType.includes('text')) return 'txt'
    return 'other'
  }

  // Bulk upload documents
  async bulkUploadDocuments(documents: Array<{
    id: string
    filename: string
    content: ArrayBuffer | string
    contentType?: string
    metadata?: Record<string, string>
  }>): Promise<Array<{ id: string; success: boolean; error?: string }>> {
    const results = []

    for (const doc of documents) {
      try {
        await this.uploadDocument(doc)
        results.push({ id: doc.id, success: true })
      } catch (error) {
        results.push({
          id: doc.id,
          success: false,
          error: 'Upload failed'
        })
      }
    }

    return results
  }

  // Get storage usage for tenant
  async getStorageUsage(): Promise<{
    totalSize: number
    documentCount: number
    largestDocument: { id: string; size: number } | null
  }> {
    if (!this.tenantId) throw new Error('No tenant context set')

    const stats = await d1Client.db?.prepare(`
      SELECT 
        SUM(size) as total_size,
        COUNT(*) as document_count,
        MAX(size) as max_size
      FROM documents
      WHERE tenant_id = ?
    `).bind(this.tenantId).first()

    const largest = await d1Client.db?.prepare(`
      SELECT id, size 
      FROM documents
      WHERE tenant_id = ?
      ORDER BY size DESC
      LIMIT 1
    `).bind(this.tenantId).first()

    return {
      totalSize: stats?.total_size || 0,
      documentCount: stats?.document_count || 0,
      largestDocument: largest ? { id: largest.id, size: largest.size } : null
    }
  }

  // Clean up old documents
  async cleanupOldDocuments(daysOld: number = 90): Promise<number> {
    if (!this.tenantId) throw new Error('No tenant context set')

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    // Get old documents
    const oldDocs = await d1Client.db?.prepare(`
      SELECT id, r2_key 
      FROM documents
      WHERE tenant_id = ? 
        AND created_at < ?
        AND access_level = 'public'
    `).bind(this.tenantId, cutoffDate.toISOString()).all()

    if (!oldDocs?.results) return 0

    let deletedCount = 0
    for (const doc of oldDocs.results) {
      try {
        await this.deleteDocument(doc.id)
        deletedCount++
      } catch (error) {
        logger.error('Failed to delete old document', error as Error, {
          documentId: doc.id,
          component: 'r2-client'
        })
      }
    }

    logger.info('Old documents cleaned up', {
      count: deletedCount,
      tenantId: this.tenantId,
      component: 'r2-client'
    })

    return deletedCount
  }
}

// Export singleton instance
export const r2Client = new R2StorageClient()

// Helper function to initialize with Cloudflare bindings
export function initializeR2(env: any) {
  if (env.R2_BUCKET) {
    r2Client.initialize(env.R2_BUCKET)
  }
}