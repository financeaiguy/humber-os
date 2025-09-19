/**
 * Local Vectorize Mock Implementation
 * Provides in-memory vector storage for local development
 */

export interface VectorizeVector {
  id: string
  values: number[]
  metadata?: Record<string, any>
}

export interface QueryResult {
  matches: Array<{
    id: string
    score: number
    metadata?: Record<string, any>
  }>
}

class LocalVectorizeIndex {
  private vectors: Map<string, VectorizeVector> = new Map()
  
  async insert(vectors: VectorizeVector[]): Promise<void> {
    for (const vector of vectors) {
      this.vectors.set(vector.id, vector)
    }
  }
  
  async query(
    queryVector: number[], 
    options?: {
      topK?: number
      filter?: Record<string, any>
    }
  ): Promise<QueryResult> {
    const results: Array<{ id: string; score: number; metadata?: any }> = []
    
    // Calculate cosine similarity with all vectors
    for (const [id, vector] of this.vectors.entries()) {
      // Apply filters if provided
      if (options?.filter) {
        let match = true
        for (const [key, value] of Object.entries(options.filter)) {
          if (vector.metadata?.[key] !== value) {
            match = false
            break
          }
        }
        if (!match) continue
      }
      
      // Calculate cosine similarity
      const score = this.cosineSimilarity(queryVector, vector.values)
      results.push({
        id,
        score,
        metadata: vector.metadata
      })
    }
    
    // Sort by score and return top K
    results.sort((a, b) => b.score - a.score)
    const topK = options?.topK || 10
    
    return {
      matches: results.slice(0, topK)
    }
  }
  
  async getByIds(ids: string[]): Promise<VectorizeVector[]> {
    const results: VectorizeVector[] = []
    for (const id of ids) {
      const vector = this.vectors.get(id)
      if (vector) {
        results.push(vector)
      }
    }
    return results
  }
  
  async deleteByIds(ids: string[]): Promise<void> {
    for (const id of ids) {
      this.vectors.delete(id)
    }
  }
  
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += (a[i] ?? 0) * (b[i] ?? 0)
      normA += (a[i] ?? 0) * (a[i] ?? 0)
      normB += (b[i] ?? 0) * (b[i] ?? 0)
    }
    
    normA = Math.sqrt(normA)
    normB = Math.sqrt(normB)
    
    if (normA === 0 || normB === 0) return 0
    
    return dotProduct / (normA * normB)
  }
  
  // Get current stats
  getStats(): { vectorCount: number; memoryUsage: string } {
    const vectorCount = this.vectors.size
    const estimatedMemory = vectorCount * 384 * 8 // 384 dimensions * 8 bytes per float
    
    return {
      vectorCount,
      memoryUsage: `${(estimatedMemory / 1024 / 1024).toFixed(2)} MB`
    }
  }
}

// Global instance for persistence during dev session
let localIndex: LocalVectorizeIndex | null = null

export function getLocalVectorizeIndex(): LocalVectorizeIndex {
  if (!localIndex) {
    localIndex = new LocalVectorizeIndex()
    // SECURITY: console statement removedlog('🎯 Local Vectorize Index initialized (in-memory)')
  }
  return localIndex
}

// Mock AI embedding generator for local development
export async function generateMockEmbedding(text: string): Promise<number[]> {
  // Create a deterministic embedding based on text content
  // This is just for testing - real embeddings would come from AI model
  const embedding = new Array(384).fill(0)
  
  // Simple hash-based embedding generation
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i)
    const index = (charCode * 7 + i * 13) % 384
    embedding[index] = Math.sin(charCode + i) * 0.5 + 0.5
  }
  
  // Normalize the vector
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return embedding.map(val => val / (norm || 1))
}