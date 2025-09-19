import { Context, Next } from 'hono';
import { z } from 'zod';

/**
 * Security headers middleware
 */
export async function securityHeaders(c: Context, next: Next) {
  // Set comprehensive security headers
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy - Allow connections to localhost for API testing
  c.header('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' http://localhost:3000 http://localhost:3001 http://127.0.0.1:3000 http://127.0.0.1:3001; " +
    "frame-ancestors 'none';"
  );
  
  // HSTS for production
  if (c.env.ENVIRONMENT === 'production') {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  return await next();
}

/**
 * Sanitize error responses to prevent information leakage
 */
export function sanitizeError(error: any, context: string): { error: string; message: string } {
  // Log full error internally
  // SECURITY: console statement removederror(`Error in ${context}:`, error);
  
  // Return sanitized error to client
  if (error instanceof z.ZodError) {
    return {
      error: 'Validation failed',
      message: 'Please check your input and try again'
    };
  }
  
  if (error.name === 'DuplicateError' || error.name === 'UniqueConstraintError') {
    return {
      error: 'Conflict',
      message: 'This resource already exists'
    };
  }
  
  if (error.name === 'NotFoundError') {
    return {
      error: 'Not found',
      message: 'The requested resource was not found'
    };
  }
  
  // Generic error for all other cases
  return {
    error: 'Internal error',
    message: 'An error occurred processing your request'
  };
}

/**
 * Input sanitization for tenant IDs and other identifiers
 */
export function sanitizeTenantId(tenantId: string): string | null {
  // Strict validation: alphanumeric, underscore, hyphen only
  // Length between 3 and 64 characters
  const pattern = /^[a-zA-Z0-9][a-zA-Z0-9_-]{2,63}$/;
  
  if (!pattern.test(tenantId)) {
    return null;
  }
  
  // Additional checks for common injection patterns
  const blacklistPatterns = [
    /\.\./,           // Path traversal
    /<script/i,       // XSS
    /javascript:/i,   // XSS
    /on\w+=/i,        // Event handlers
    /union.*select/i, // SQL injection
    /drop.*table/i,   // SQL injection
    /insert.*into/i,  // SQL injection
    /delete.*from/i,  // SQL injection
  ];
  
  for (const pattern of blacklistPatterns) {
    if (pattern.test(tenantId)) {
      return null;
    }
  }
  
  return tenantId;
}

/**
 * Request size limiting middleware
 */
export async function requestSizeLimit(c: Context, next: Next) {
  const contentLength = c.req.header('Content-Length');
  const maxSize = 53687091200; // 50 GB limit (50 * 1024 * 1024 * 1024)
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    return c.json({ 
      error: 'Payload too large',
      message: `Request body exceeds maximum allowed size of 50 GB`
    }, 413);
  }
  
  return await next();
}

/**
 * Enhanced CORS configuration for production
 */
export async function corsMiddleware(c: Context, next: Next) {
  const origin = c.req.header('Origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', // Next.js app port
    'https://localhost:3000', 
    'https://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://humber-operations.com',
    'https://*.humber-operations.com',
    'https://humber-operations-worker-dev.evafiai.workers.dev',
    'https://7c496b42.humber-web.pages.dev',
    'https://d4db1e6a.humber-web.pages.dev',
    'https://development.humber-web.pages.dev',
    'https://humber-web-frontend-prod.evafiai.workers.dev',
    'https://*.humber-web.pages.dev',
    'https://*.evafiai.workers.dev'
  ];
  
  // Always set CORS headers for better compatibility
  if (origin) {
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const domain = allowed.replace('https://*.', '');
        return origin.endsWith(domain);
      }
      return origin === allowed;
    });
    
    if (isAllowed) {
      c.header('Access-Control-Allow-Origin', origin);
    } else {
      c.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    }
  } else {
    c.header('Access-Control-Allow-Origin', 'http://localhost:3001');
  }
  
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-ID, X-API-Key, X-Requested-With, Accept, Origin');
  c.header('Access-Control-Max-Age', '86400');
  c.header('Vary', 'Origin');
  
  if (c.req.method === 'OPTIONS') {
    return new Response('', { status: 204 });
  }
  
  return await next();
}

/**
 * Audit logging for security events
 */
export async function auditLog(
  env: any,
  event: {
    type: string;
    tenantId?: string;
    userId?: string;
    action: string;
    resource?: string;
    result: 'success' | 'failure';
    metadata?: Record<string, any>;
    ip?: string;
    userAgent?: string;
  }
) {
  try {
    const logEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...event
    };
    
    // Send to audit queue
    if (env.AUDIT_QUEUE) {
      await env.AUDIT_QUEUE.send(logEntry);
    }
    
    // Also log to console in development
    if (env.ENVIRONMENT === 'development') {
      // SECURITY: console statement removedlog('AUDIT:', logEntry);
    }
  } catch (error) {
    // SECURITY: console statement removederror('Failed to write audit log:', error);
  }
}