/**
 * KV (Key-Value) Cache Client
 * Provides distributed caching using Cloudflare KV with multi-tenant support
 */

import { logger } from '../logger'

export interface KVNamespace {
  get(key: string, options?: KVGetOptions): Promise<string | null>
  getWithMetadata<Metadata = unknown>(key: string, options?: KVGetOptions): Promise<KVGetWithMetadataResult<Metadata>>
  put(key: string, value: string | ArrayBuffer | ArrayBufferView | ReadableStream, options?: KVPutOptions): Promise<void>
  delete(key: string): Promise<void>
  list(options?: KVListOptions): Promise<KVListResult>
}

export interface KVGetOptions {
  type?: 'text' | 'json' | 'arrayBuffer' | 'stream'
  cacheTtl?: number
}

export interface KVGetWithMetadataResult<Metadata> {
  value: string | null
  metadata: Metadata | null
  cacheStatus: 'hit' | 'miss' | null
}

export interface KVPutOptions {
  expiration?: number
  expirationTtl?: number
  metadata?: any
}

export interface KVListOptions {
  prefix?: string
  limit?: number
  cursor?: string
}

export interface KVListResult {
  keys: Array<{
    name: string
    expiration?: number
    metadata?: any
  }>
  list_complete: boolean
  cursor?: string
  cacheStatus: 'hit' | 'miss' | null
}

export class KVCacheClient {
  private namespace: KVNamespace | null = null
  private tenantId: string | null = null
  private defaultTTL: number = 3600 // 1 hour default

  constructor(namespace?: KVNamespace) {
    this.namespace = namespace || null
  }

  // Initialize with KV namespace
  initialize(namespace: KVNamespace) {
    this.namespace = namespace
    logger.info('KV cache client initialized', { component: 'kv-client' })
  }

  // Set tenant context
  setTenant(tenantId: string) {
    this.tenantId = tenantId
  }

  // Get tenant-specific cache key
  private getTenantKey(key: string): string {
    if (!this.tenantId) {
      throw new Error('No tenant context set')
    }
    return `tenant:${this.tenantId}:${key}`
  }

  // Set cache value
  async set(
    key: string, 
    value: any, 
    options?: {
      ttl?: number
      metadata?: any
    }
  ): Promise<void> {
    if (!this.namespace) throw new Error('KV namespace not initialized')

    const tenantKey = this.getTenantKey(key)
    const serialized = typeof value === 'string' ? value : JSON.stringify(value)

    try {
      await this.namespace.put(tenantKey, serialized, {
        expirationTtl: options?.ttl || this.defaultTTL,
        metadata: {
          ...options?.metadata,
          tenantId: this.tenantId,
          createdAt: Date.now(),
          type: typeof value
        }
      })

      logger.debug('Cache value set', {
        key: tenantKey,
        ttl: options?.ttl || this.defaultTTL,
        component: 'kv-client'
      })
    } catch (error) {
      logger.error('Failed to set cache value', error as Error, {
        key: tenantKey,
        component: 'kv-client'
      })
      throw error
    }
  }

  // Get cache value
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.namespace) throw new Error('KV namespace not initialized')

    const tenantKey = this.getTenantKey(key)

    try {
      const result = await this.namespace.getWithMetadata(tenantKey, {
        type: 'text',
        cacheTtl: 60 // Cache in edge for 1 minute
      })

      if (!result.value) {
        return null
      }

      // Try to parse JSON if applicable
      try {
        return JSON.parse(result.value) as T
      } catch {
        return result.value as unknown as T
      }
    } catch (error) {
      logger.error('Failed to get cache value', error as Error, {
        key: tenantKey,
        component: 'kv-client'
      })
      return null
    }
  }

  // Get with metadata
  async getWithMetadata<T = any, M = any>(
    key: string
  ): Promise<{ value: T | null; metadata: M | null }> {
    if (!this.namespace) throw new Error('KV namespace not initialized')

    const tenantKey = this.getTenantKey(key)

    try {
      const result = await this.namespace.getWithMetadata<M>(tenantKey)

      if (!result.value) {
        return { value: null, metadata: null }
      }

      // Try to parse JSON if applicable
      let value: T
      try {
        value = JSON.parse(result.value) as T
      } catch {
        value = result.value as unknown as T
      }

      return { value, metadata: result.metadata }
    } catch (error) {
      logger.error('Failed to get cache value with metadata', error as Error, {
        key: tenantKey,
        component: 'kv-client'
      })
      return { value: null, metadata: null }
    }
  }

  // Delete cache value
  async delete(key: string): Promise<void> {
    if (!this.namespace) throw new Error('KV namespace not initialized')

    const tenantKey = this.getTenantKey(key)

    try {
      await this.namespace.delete(tenantKey)
      
      logger.debug('Cache value deleted', {
        key: tenantKey,
        component: 'kv-client'
      })
    } catch (error) {
      logger.error('Failed to delete cache value', error as Error, {
        key: tenantKey,
        component: 'kv-client'
      })
      throw error
    }
  }

  // List cache keys
  async list(options?: {
    prefix?: string
    limit?: number
    cursor?: string
  }): Promise<KVListResult> {
    if (!this.namespace) throw new Error('KV namespace not initialized')

    const tenantPrefix = this.getTenantKey(options?.prefix || '')

    try {
      return await this.namespace.list({
        prefix: tenantPrefix,
        limit: options?.limit || 100,
        cursor: options?.cursor
      })
    } catch (error) {
      logger.error('Failed to list cache keys', error as Error, {
        prefix: tenantPrefix,
        component: 'kv-client'
      })
      throw error
    }
  }

  // Cache-aside pattern helper
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key)
    if (cached !== null) {
      logger.debug('Cache hit', { key, component: 'kv-client' })
      return cached
    }

    logger.debug('Cache miss, fetching', { key, component: 'kv-client' })

    // Fetch and cache
    try {
      const value = await fetcher()
      await this.set(key, value, { ttl })
      return value
    } catch (error) {
      logger.error('Failed to fetch and cache', error as Error, {
        key,
        component: 'kv-client'
      })
      throw error
    }
  }

  // Batch get
  async batchGet<T = any>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>()

    // KV doesn't support batch get natively, so we use Promise.all
    const promises = keys.map(async key => {
      const value = await this.get<T>(key)
      results.set(key, value)
    })

    await Promise.all(promises)
    return results
  }

  // Batch set
  async batchSet(
    items: Array<{ key: string; value: any; ttl?: number }>
  ): Promise<void> {
    const promises = items.map(item =>
      this.set(item.key, item.value, { ttl: item.ttl })
    )

    await Promise.all(promises)
  }

  // Clear all tenant cache (use with caution)
  async clearTenantCache(): Promise<number> {
    if (!this.namespace) throw new Error('KV namespace not initialized')
    if (!this.tenantId) throw new Error('No tenant context set')

    let deletedCount = 0
    let cursor: string | undefined

    do {
      const result = await this.list({ cursor })
      
      for (const key of result.keys) {
        await this.namespace.delete(key.name)
        deletedCount++
      }

      cursor = result.cursor
    } while (cursor)

    logger.info('Tenant cache cleared', {
      tenantId: this.tenantId,
      deletedCount,
      component: 'kv-client'
    })

    return deletedCount
  }

  // Cache invalidation patterns
  async invalidatePattern(pattern: string): Promise<number> {
    const result = await this.list({ prefix: pattern })
    let invalidatedCount = 0

    for (const key of result.keys) {
      await this.delete(key.name.replace(this.getTenantKey(''), ''))
      invalidatedCount++
    }

    logger.info('Cache pattern invalidated', {
      pattern,
      invalidatedCount,
      component: 'kv-client'
    })

    return invalidatedCount
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const testKey = 'health-check'
      const testValue = Date.now().toString()
      
      await this.set(testKey, testValue, { ttl: 10 })
      const retrieved = await this.get(testKey)
      await this.delete(testKey)

      return retrieved === testValue
    } catch {
      return false
    }
  }
}

// Specialized cache clients
export class SessionCache extends KVCacheClient {
  async setSession(sessionId: string, data: any, ttl: number = 3600) {
    await this.set(`session:${sessionId}`, data, { ttl })
  }

  async getSession<T = any>(sessionId: string): Promise<T | null> {
    return await this.get<T>(`session:${sessionId}`)
  }

  async deleteSession(sessionId: string) {
    await this.delete(`session:${sessionId}`)
  }
}

export class ModelResponseCache extends KVCacheClient {
  async cacheModelResponse(
    modelId: string,
    prompt: string,
    response: any,
    ttl: number = 300 // 5 minutes
  ) {
    const key = this.generateCacheKey(modelId, prompt)
    await this.set(key, response, { 
      ttl,
      metadata: { modelId, promptLength: prompt.length }
    })
  }

  async getCachedResponse(modelId: string, prompt: string): Promise<any | null> {
    const key = this.generateCacheKey(modelId, prompt)
    return await this.get(key)
  }

  private generateCacheKey(modelId: string, prompt: string): string {
    // Create a hash of the prompt for the key
    const hash = this.simpleHash(prompt)
    return `model:${modelId}:${hash}`
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }
}

// Export singleton instances
export const kvCache = new KVCacheClient()
export const sessionCache = new SessionCache()
export const modelCache = new ModelResponseCache()

// Helper function to initialize with Cloudflare bindings
export function initializeKV(env: any) {
  if (env.KV_CACHE) {
    kvCache.initialize(env.KV_CACHE)
    sessionCache.initialize(env.KV_CACHE)
    modelCache.initialize(env.KV_CACHE)
  }
}