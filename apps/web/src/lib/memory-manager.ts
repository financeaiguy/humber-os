/**
 * Memory Management System
 * Provides LRU caching and memory optimization for the nervous system
 */

import { logger } from './logger'

export interface CacheEntry<T> {
  value: T
  timestamp: number
  accessCount: number
  size: number
  lastAccessed: number
}

export interface MemoryStats {
  totalSize: number
  itemCount: number
  hitRate: number
  evictionCount: number
  oldestItem: number
  newestItem: number
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map()
  private maxSize: number
  private maxItems: number
  private currentSize: number = 0
  private hits: number = 0
  private misses: number = 0
  private evictions: number = 0

  constructor(
    maxSizeMB: number = 100,
    maxItems: number = 10000
  ) {
    this.maxSize = maxSizeMB * 1024 * 1024 // Convert to bytes
    this.maxItems = maxItems
    
    // Start cleanup interval
    this.startCleanupInterval()
  }

  private startCleanupInterval() {
    setInterval(() => {
      this.cleanup()
    }, 60000) // Every minute
  }

  private getItemSize(item: any): number {
    // Rough estimation of object size in memory
    const str = JSON.stringify(item)
    return new Blob([str]).size
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.misses++
      return undefined
    }

    // Update access time and count
    entry.lastAccessed = Date.now()
    entry.accessCount++
    
    // Move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, entry)
    
    this.hits++
    return entry.value
  }

  set(key: string, value: T, ttlMs?: number): void {
    const size = this.getItemSize(value)
    
    // Check if item is too large
    if (size > this.maxSize * 0.1) {
      logger.warn('Cache item too large, skipping', {
        key,
        size,
        maxAllowed: this.maxSize * 0.1
      })
      return
    }

    // Remove existing entry if present
    if (this.cache.has(key)) {
      const existing = this.cache.get(key)!
      this.currentSize -= existing.size
      this.cache.delete(key)
    }

    // Evict items if necessary
    while (
      (this.currentSize + size > this.maxSize || this.cache.size >= this.maxItems) &&
      this.cache.size > 0
    ) {
      this.evictOldest()
    }

    // Add new entry
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      accessCount: 1,
      size,
      lastAccessed: Date.now()
    }

    this.cache.set(key, entry)
    this.currentSize += size

    // Set TTL if provided
    if (ttlMs) {
      setTimeout(() => {
        this.delete(key)
      }, ttlMs)
    }
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    this.currentSize -= entry.size
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.currentSize = 0
    this.hits = 0
    this.misses = 0
    this.evictions = 0
  }

  private evictOldest(): void {
    const [oldestKey] = this.cache.keys()
    if (oldestKey) {
      const entry = this.cache.get(oldestKey)!
      this.currentSize -= entry.size
      this.cache.delete(oldestKey)
      this.evictions++
      
      logger.debug('Evicted cache entry', {
        key: oldestKey,
        age: Date.now() - entry.timestamp,
        accessCount: entry.accessCount
      })
    }
  }

  private cleanup(): void {
    const now = Date.now()
    const maxAge = 3600000 // 1 hour
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.lastAccessed > maxAge) {
        this.delete(key)
      }
    }
  }

  getStats(): MemoryStats {
    const entries = Array.from(this.cache.values())
    const timestamps = entries.map(e => e.timestamp)
    
    return {
      totalSize: this.currentSize,
      itemCount: this.cache.size,
      hitRate: this.hits / (this.hits + this.misses) || 0,
      evictionCount: this.evictions,
      oldestItem: Math.min(...timestamps) || 0,
      newestItem: Math.max(...timestamps) || 0
    }
  }

  // Get items by pattern
  getByPattern(pattern: RegExp): Map<string, T> {
    const results = new Map<string, T>()
    
    for (const [key, entry] of this.cache.entries()) {
      if (pattern.test(key)) {
        results.set(key, entry.value)
      }
    }
    
    return results
  }
}

// Specialized cache for different data types
export class KnowledgeGraphCache extends LRUCache<any> {
  constructor() {
    super(200, 50000) // 200MB, 50k items for knowledge graph
  }

  // Add method to get related nodes efficiently
  getRelatedNodes(nodeId: string, depth: number = 1): any[] {
    const related: any[] = []
    const visited = new Set<string>()
    
    const traverse = (id: string, currentDepth: number) => {
      if (currentDepth > depth || visited.has(id)) return
      visited.add(id)
      
      const node = this.get(`node:${id}`)
      if (node) {
        related.push(node)
        
        if (node.relationships && currentDepth < depth) {
          for (const rel of node.relationships) {
            traverse(rel.nodeId, currentDepth + 1)
          }
        }
      }
    }
    
    traverse(nodeId, 0)
    return related
  }
}

// Cache for AI model responses
export class ModelResponseCache extends LRUCache<any> {
  constructor() {
    super(50, 1000) // 50MB, 1000 responses
  }

  // Generate cache key for model queries
  generateKey(
    modelId: string,
    prompt: string,
    context?: any
  ): string {
    const contextStr = context ? JSON.stringify(context) : ''
    const hash = this.simpleHash(`${modelId}:${prompt}:${contextStr}`)
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

// Memory pressure monitor
export class MemoryMonitor {
  private static instance: MemoryMonitor
  private warningThreshold = 0.8 // 80% memory usage
  private criticalThreshold = 0.9 // 90% memory usage
  
  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor()
    }
    return MemoryMonitor.instance
  }

  constructor() {
    // Only start monitoring on server side
    if (typeof window === 'undefined') {
      this.startMonitoring()
    }
  }

  private startMonitoring() {
    // Double check we're on server
    if (typeof window !== 'undefined' || typeof process === 'undefined' || typeof process.memoryUsage !== 'function') return
    
    setInterval(() => {
      this.checkMemoryPressure()
    }, 30000) // Every 30 seconds
  }

  private checkMemoryPressure() {
    // Double check we're on server
    if (typeof window !== 'undefined' || typeof process === 'undefined' || typeof process.memoryUsage !== 'function') return

    const usage = process.memoryUsage()
    const heapUsed = usage.heapUsed
    const heapTotal = usage.heapTotal
    const ratio = heapUsed / heapTotal

    if (ratio > this.criticalThreshold) {
      logger.error('Critical memory pressure', undefined, {
        heapUsed,
        heapTotal,
        ratio,
        component: 'memory-monitor'
      })
      
      // Trigger aggressive cleanup
      this.performCleanup('critical')
    } else if (ratio > this.warningThreshold) {
      logger.warn('High memory pressure', {
        heapUsed,
        heapTotal,
        ratio,
        component: 'memory-monitor'
      })
      
      // Trigger moderate cleanup
      this.performCleanup('warning')
    }
  }

  private performCleanup(level: 'warning' | 'critical') {
    // Trigger garbage collection if available
    if (global.gc) {
      global.gc()
    }

    // Notify caches to perform cleanup
    logger.info('Performing memory cleanup', {
      level,
      component: 'memory-monitor'
    })
  }

  getMemoryStats() {
    if (typeof process === 'undefined') {
      return null
    }

    const usage = process.memoryUsage()
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
      arrayBuffers: usage.arrayBuffers,
      usagePercent: (usage.heapUsed / usage.heapTotal) * 100
    }
  }
}

// Export singleton instances
export const knowledgeCache = new KnowledgeGraphCache()
export const modelCache = new ModelResponseCache()
export const memoryMonitor = MemoryMonitor.getInstance()