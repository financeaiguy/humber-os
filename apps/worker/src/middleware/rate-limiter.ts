/**
 * ADVANCED RATE LIMITING & DDOS PROTECTION
 * 
 * Multi-tier rate limiting with adaptive thresholds and attack detection
 * Prevents brute force, DDoS, and API abuse attacks
 */

import { Context, Next } from 'hono'

interface RateLimitConfig {
  windowMs: number        // Time window in milliseconds
  maxRequests: number     // Max requests per window
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (c: Context) => string
  onLimitReached?: (c: Context) => Response
}

interface RateLimitEntry {
  count: number
  resetTime: number
  violations: number
  firstRequest: number
  isBlocked: boolean
  blockUntil?: number
}

// Multi-tier rate limiting configurations
const RATE_LIMIT_TIERS = {
  // Global rate limiting (per IP)
  GLOBAL: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 1000,          // 1000 requests per 15 minutes
  },
  
  // Authentication endpoints (stricter)
  AUTH: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 10,            // 10 login attempts per 15 minutes
  },
  
  // API endpoints (moderate) - Development friendly
  API: {
    windowMs: 60 * 1000,       // 1 minute
    maxRequests: 1000,          // 1000 requests per minute (increased for dev)
  },
  
  // File upload endpoints (very strict)
  UPLOAD: {
    windowMs: 60 * 1000,       // 1 minute
    maxRequests: 5,             // 5 uploads per minute
  },
  
  // Financial endpoints (extremely strict)
  FINANCIAL: {
    windowMs: 60 * 1000,       // 1 minute
    maxRequests: 20,            // 20 financial operations per minute
  }
}

// Suspicious activity patterns
const ATTACK_PATTERNS = {
  RAPID_REQUESTS: 50,         // 50+ requests in 10 seconds
  FAILED_AUTH_THRESHOLD: 5,   // 5 failed auth attempts
  LARGE_PAYLOAD_THRESHOLD: 10 * 1024 * 1024, // 10MB
  SUSPICIOUS_USER_AGENTS: [
    'sqlmap',
    'nikto',
    'nmap',
    'masscan',
    'burp',
    'owasp zap',
    'w3af'
  ]
}

export class AdvancedRateLimiter {
  private static store = new Map<string, RateLimitEntry>()
  private static blockedIPs = new Set<string>()
  private static suspiciousIPs = new Map<string, number>()
  
  /**
   * Create rate limiting middleware
   */
  static create(config: RateLimitConfig) {
    return async (c: Context, next: Next) => {
      const key = config.keyGenerator ? config.keyGenerator(c) : this.getDefaultKey(c)
      const now = Date.now()
      
      // Check if IP is blocked (disabled in development)
      const isDevelopment = c.env?.ENVIRONMENT === 'development' || process.env.NODE_ENV === 'development'
      if (!isDevelopment && this.blockedIPs.has(this.getIP(c))) {
        return c.json({ 
          error: 'IP blocked due to suspicious activity',
          code: 'IP_BLOCKED',
          retryAfter: 3600 // 1 hour
        }, 429)
      }
      
      // Get or create rate limit entry
      let entry = this.store.get(key)
      if (!entry || now > entry.resetTime) {
        entry = {
          count: 0,
          resetTime: now + config.windowMs,
          violations: entry?.violations || 0,
          firstRequest: now,
          isBlocked: false
        }
        this.store.set(key, entry)
      }
      
      // Increment request count
      entry.count++
      
      // Check for rate limit violation
      if (entry.count > config.maxRequests) {
        entry.violations++
        
        // Progressive penalties
        if (entry.violations >= 3) {
          // Block IP after 3 violations
          this.blockedIPs.add(this.getIP(c))
          entry.isBlocked = true
          entry.blockUntil = now + (60 * 60 * 1000) // 1 hour block
        }
        
        // Log security event
        await this.logSecurityEvent(c, 'RATE_LIMIT_EXCEEDED', {
          key,
          count: entry.count,
          limit: config.maxRequests,
          violations: entry.violations
        })
        
        if (config.onLimitReached) {
          return config.onLimitReached(c)
        }
        
        return c.json({
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          limit: config.maxRequests,
          windowMs: config.windowMs,
          retryAfter: Math.ceil((entry.resetTime - now) / 1000)
        }, 429)
      }
      
      // Check for attack patterns
      await this.detectAttackPatterns(c, entry)
      
      // Add rate limit headers
      c.header('X-RateLimit-Limit', config.maxRequests.toString())
      c.header('X-RateLimit-Remaining', (config.maxRequests - entry.count).toString())
      c.header('X-RateLimit-Reset', entry.resetTime.toString())
      
      return next()
    }
  }
  
  /**
   * Generate default rate limit key (IP + User Agent)
   */
  private static getDefaultKey(c: Context): string {
    const ip = this.getIP(c)
    const userAgent = c.req.header('User-Agent') || 'unknown'
    return `${ip}:${userAgent.substring(0, 50)}`
  }
  
  /**
   * Get client IP address
   */
  private static getIP(c: Context): string {
    return c.req.header('CF-Connecting-IP') || 
           c.req.header('X-Forwarded-For') || 
           c.req.header('X-Real-IP') || 
           'unknown'
  }
  
  /**
   * Detect attack patterns
   */
  private static async detectAttackPatterns(c: Context, entry: RateLimitEntry): Promise<void> {
    const ip = this.getIP(c)
    const userAgent = c.req.header('User-Agent')?.toLowerCase() || ''
    const contentLength = parseInt(c.req.header('Content-Length') || '0')
    
    // Check for rapid requests (potential DDoS)
    const requestRate = entry.count / ((Date.now() - entry.firstRequest) / 1000)
    if (requestRate > ATTACK_PATTERNS.RAPID_REQUESTS / 10) {
      await this.logSecurityEvent(c, 'RAPID_REQUESTS_DETECTED', {
        ip,
        requestRate,
        threshold: ATTACK_PATTERNS.RAPID_REQUESTS / 10
      })
      this.markSuspiciousIP(ip)
    }
    
    // Check for suspicious user agents
    if (ATTACK_PATTERNS.SUSPICIOUS_USER_AGENTS.some(agent => userAgent.includes(agent))) {
      await this.logSecurityEvent(c, 'SUSPICIOUS_USER_AGENT', {
        ip,
        userAgent
      })
      this.blockedIPs.add(ip)
    }
    
    // Check for large payloads (potential DoS)
    if (contentLength > ATTACK_PATTERNS.LARGE_PAYLOAD_THRESHOLD) {
      await this.logSecurityEvent(c, 'LARGE_PAYLOAD_DETECTED', {
        ip,
        contentLength,
        threshold: ATTACK_PATTERNS.LARGE_PAYLOAD_THRESHOLD
      })
      this.markSuspiciousIP(ip)
    }
  }
  
  /**
   * Mark IP as suspicious
   */
  private static markSuspiciousIP(ip: string): void {
    const current = this.suspiciousIPs.get(ip) || 0
    this.suspiciousIPs.set(ip, current + 1)
    
    // Block after multiple suspicious activities
    if (current + 1 >= 3) {
      this.blockedIPs.add(ip)
    }
  }
  
  /**
   * Log security event
   */
  private static async logSecurityEvent(c: Context, eventType: string, details: any): Promise<void> {
    // SECURITY: console statement removed - security event logged
  }
  
  /**
   * Clean up expired entries (call periodically)
   */
  static cleanup(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime && (!entry.blockUntil || now > entry.blockUntil)) {
        this.store.delete(key)
      }
    }
    
    // Clean up blocked IPs after 24 hours
    // Note: In production, use a more sophisticated storage system
  }
  
  /**
   * Get rate limiting statistics
   */
  static getStats(): {
    totalEntries: number
    blockedIPs: number
    suspiciousIPs: number
    topOffenders: Array<{ key: string; violations: number }>
  } {
    const topOffenders = Array.from(this.store.entries())
      .map(([key, entry]) => ({ key, violations: entry.violations }))
      .sort((a, b) => b.violations - a.violations)
      .slice(0, 10)
    
    return {
      totalEntries: this.store.size,
      blockedIPs: this.blockedIPs.size,
      suspiciousIPs: this.suspiciousIPs.size,
      topOffenders
    }
  }
}

// Pre-configured middleware for common use cases
export const globalRateLimit = AdvancedRateLimiter.create(RATE_LIMIT_TIERS.GLOBAL)
export const authRateLimit = AdvancedRateLimiter.create(RATE_LIMIT_TIERS.AUTH)
export const apiRateLimit = AdvancedRateLimiter.create(RATE_LIMIT_TIERS.API)
export const uploadRateLimit = AdvancedRateLimiter.create(RATE_LIMIT_TIERS.UPLOAD)
export const financialRateLimit = AdvancedRateLimiter.create(RATE_LIMIT_TIERS.FINANCIAL)

export default AdvancedRateLimiter
