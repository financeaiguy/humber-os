interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  message: string
}

interface RateLimitResult {
  allowed: boolean
  retryAfter?: number
  remaining?: number
}

// Simple in-memory rate limiting (in production, use Redis or KV)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export async function rateLimitCheck(
  key: string, 
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now()
  const windowStart = now - config.windowMs
  
  // Clean up old entries
  for (const [storeKey, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(storeKey)
    }
  }
  
  // Get or create entry
  let entry = rateLimitStore.get(key)
  if (!entry || entry.resetTime < now) {
    entry = { count: 0, resetTime: now + config.windowMs }
    rateLimitStore.set(key, entry)
  }
  
  entry.count++
  
  const allowed = entry.count <= config.maxRequests
  const retryAfter = allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000)
  const remaining = Math.max(0, config.maxRequests - entry.count)
  
  return {
    allowed,
    retryAfter,
    remaining
  }
}
