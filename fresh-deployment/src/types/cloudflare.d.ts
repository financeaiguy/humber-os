// Cloudflare KV namespace types
interface KVNamespace {
  put(key: string, value: string, options?: { metadata?: any }): Promise<void>
  get(key: string): Promise<string | null>
  delete(key: string): Promise<void>
  list(options?: { prefix?: string; limit?: number }): Promise<{ keys: Array<{ name: string }> }>
}

// Extend globalThis for Cloudflare Worker environment
declare global {
  interface GlobalThis {
    TIME_TRACKING_KV?: KVNamespace
    AUDIT_LOGS_KV?: KVNamespace
  }
}

export {}