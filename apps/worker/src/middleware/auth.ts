import { Context, Next } from 'hono';
import { JWTManager } from '../lib/jwt';
import { sanitizeError, auditLog } from './security';
import { z } from 'zod';

// Environment with enhanced auth configuration
interface AuthEnv {
  JWT_SECRET: string;
  REFRESH_SECRET: string;
  API_KEY?: string;
  ENVIRONMENT?: string;
  KV_SESSIONS: KVNamespace;
  DB_MASTER: D1Database;
  AUDIT_QUEUE?: Queue;
}

// Context variables for type safety
interface AuthVariables {
  requestId: string;
  authType: string;
  authenticated: boolean;
  tenantId: string;
  permissions: string[];
  userId: string;
  sessionId?: string; // Optional as it might not exist
  userRole: string;
  engineerId?: string; // Add missing variable
  role?: string; // Add missing variable
}

// Rate limiting with enhanced tracking
const rateLimitStore = new Map<string, { count: number; resetTime: number; violations: number }>();

/**
 * Enhanced authentication middleware with comprehensive security
 */
export async function authMiddleware(c: Context<{ Bindings: AuthEnv; Variables: AuthVariables }>, next: Next) {
  try {
    const requestId = crypto.randomUUID();
    c.set('requestId', requestId);
    
    // SECURITY: Only truly public endpoints - NO SENSITIVE DATA
    const publicEndpoints = [
      '/health',
      '/docs'
      // REMOVED: All sensitive endpoints now require authentication
      // /api-test - SECURITY RISK: Exposes internal architecture
      // /bull-pen/* - SECURITY RISK: Contains sensitive engineer data
      // /documents/* - SECURITY RISK: Contains confidential documents
      // /time-tracking/* - SECURITY RISK: Contains biometric/location data
      // /financial/* - SECURITY RISK: Contains financial information
    ];
    
    // SECURITY: Only allow truly public endpoints - NO EXCEPTIONS
    if (publicEndpoints.includes(c.req.path)) {
      return next();
    }

    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    const userAgent = c.req.header('User-Agent') || 'unknown';

    // Get authorization header
    const authHeader = c.req.header('Authorization');
    
    // Check for API key authentication (for service-to-service)
    const apiKey = c.req.header('X-API-Key');
    if (apiKey) {
      const apiKeyValid = await validateApiKey(c.env.DB_MASTER, apiKey);
      if (apiKeyValid) {
        c.set('authType', 'api-key');
        c.set('authenticated', true);
        c.set('tenantId', apiKeyValid.tenantId);
        c.set('permissions', apiKeyValid.permissions);
        
        // Update last used timestamp
        await updateApiKeyUsage(c.env.DB_MASTER, apiKeyValid.id, ip);
        
        return next();
      } else {
        await auditLog(c.env, {
          type: 'AUTH_API_KEY_INVALID',
          action: 'Invalid API key used',
          result: 'failure',
          ip,
          userAgent,
          metadata: { keyPrefix: apiKey.substring(0, 8) }
        });
      }
    }

    // Require Bearer token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await auditLog(c.env, {
        type: 'AUTH_NO_TOKEN',
        action: 'Request without authentication token',
        result: 'failure',
        ip,
        userAgent,
        metadata: { path: c.req.path }
      });
      
      return c.json({ 
        error: 'Authentication required',
        message: 'Please provide a valid Bearer token or API key',
        requestId
      }, 401);
    }

    // Extract and verify JWT with enhanced validation
    const token = authHeader.substring(7);
    const jwtManager = new JWTManager(c.env.JWT_SECRET);
    
    const payload = await jwtManager.verifyToken(token, {
      checkBlacklist: true,
      expectedTokenType: 'access',
      kvStore: c.env.KV_SESSIONS
    });

    if (!payload) {
      await auditLog(c.env, {
        type: 'AUTH_TOKEN_INVALID',
        action: 'Invalid JWT token',
        result: 'failure',
        ip,
        userAgent,
        metadata: { tokenPrefix: token.substring(0, 20) }
      });
      
      return c.json({ 
        error: 'Invalid token',
        message: 'Token verification failed',
        requestId
      }, 401);
    }

    // Enhanced security checks
    
    // 1. Check if user is still active
    const userStatus = await getUserStatus(c.env.DB_MASTER, payload.userId!);
    if (!userStatus || userStatus.status !== 'active') {
      await auditLog(c.env, {
        type: 'AUTH_USER_INACTIVE',
        userId: payload.userId,
        tenantId: payload.tenantId,
        action: 'Inactive user attempted access',
        result: 'failure',
        ip,
        userAgent
      });
      
      return c.json({ 
        error: 'Account inactive',
        message: 'Your account has been deactivated',
        requestId
      }, 403);
    }

    // 2. Verify tenant access
    const tenantAccess = await verifyTenantAccess(c.env.DB_MASTER, payload.userId!, payload.tenantId);
    if (!tenantAccess) {
      await auditLog(c.env, {
        type: 'AUTH_TENANT_ACCESS_DENIED',
        userId: payload.userId,
        tenantId: payload.tenantId,
        action: 'User attempted access to unauthorized tenant',
        result: 'failure',
        ip,
        userAgent
      });
      
      return c.json({ 
        error: 'Access denied',
        message: 'You do not have access to this tenant',
        requestId
      }, 403);
    }

    // 3. IP binding check (if enabled)
    if (payload.ipAddress && payload.ipAddress !== ip) {
      await auditLog(c.env, {
        type: 'AUTH_IP_MISMATCH',
        userId: payload.userId,
        tenantId: payload.tenantId,
        action: 'Token used from different IP',
        result: 'failure',
        ip,
        userAgent,
        metadata: { tokenIp: payload.ipAddress, requestIp: ip }
      });
      
      return c.json({ 
        error: 'Security violation',
        message: 'Token IP mismatch detected',
        requestId
      }, 403);
    }
    // Set authenticated context with enhanced data
    c.set('tenantId' as any, payload.tenantId);
    c.set('userId' as any, payload.userId);
    c.set('engineerId' as any, payload.engineerId);
    c.set('role' as any, payload.role || 'viewer');
    c.set('permissions' as any, payload.permissions || []);
    if (payload.sessionId) {
      c.set('sessionId', payload.sessionId);
    }
    c.set('authType', 'jwt');
    c.set('authenticated', true);

    // Update last activity
    await updateUserActivity(c.env.DB_MASTER, payload.userId!, ip, userAgent);

    await next();
  } catch (error) {
    // SECURITY: Removed console.error('Auth middleware error:', error);
    const sanitized = sanitizeError(error, 'authentication middleware');
    return c.json({ 
      ...sanitized,
      requestId: c.get('requestId') || crypto.randomUUID()
    }, 500);
  }
}

/**
 * Rate limiting middleware to prevent abuse
 */
/**
 * Enhanced rate limiting with database persistence and KV storage
 */
export async function rateLimitMiddleware(c: Context, next: Next) {
  const identifier = c.req.header('CF-Connecting-IP') || 
                    c.req.header('X-Forwarded-For') || 
                    c.req.header('X-Real-IP') ||
                    'unknown';
  
  const tenantId = c.get('tenantId') || 'anonymous';
  const key = `rate_limit:${identifier}:${tenantId}`;
  const now = Date.now();
  const windowMs = 60000; // 1 minute window
  const maxRequests = 100; // 100 requests per minute per tenant

  try {
    // Try to use KV for rate limiting if available
    if (c.env.KV_SESSIONS) {
      const currentCount = await c.env.KV_SESSIONS.get(key);
      const count = currentCount ? parseInt(currentCount) + 1 : 1;
      
      // Set with 1 minute TTL
      await c.env.KV_SESSIONS.put(key, count.toString(), { expirationTtl: 60 });
      
      if (count > maxRequests) {
        c.header('Retry-After', '60');
        c.header('X-RateLimit-Limit', maxRequests.toString());
        c.header('X-RateLimit-Remaining', '0');
        c.header('X-RateLimit-Reset', (now + windowMs).toString());
        
        return c.json({ 
          error: 'Rate limit exceeded',
          message: `Too many requests. Please retry after 60 seconds`,
          retryAfter: 60,
          requestId: c.get('requestId')
        }, 429);
      }
      
      // Add rate limit headers
      c.header('X-RateLimit-Limit', maxRequests.toString());
      c.header('X-RateLimit-Remaining', (maxRequests - count).toString());
      c.header('X-RateLimit-Reset', (now + windowMs).toString());
    } else {
      // Fallback to in-memory rate limiting
      let entry = rateLimitStore.get(key);
      
      if (!entry || entry.resetTime < now) {
        entry = { count: 0, resetTime: now + windowMs, violations: 0 };
        rateLimitStore.set(key, entry);
      }

      entry.count++;

      // Check if rate limit exceeded
      if (entry.count > maxRequests) {
        entry.violations++;
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        c.header('Retry-After', retryAfter.toString());
        
        return c.json({ 
          error: 'Rate limit exceeded',
          message: `Too many requests. Please retry after ${retryAfter} seconds`,
          retryAfter,
          requestId: c.get('requestId')
        }, 429);
      }

      // Add rate limit headers
      c.header('X-RateLimit-Limit', maxRequests.toString());
      c.header('X-RateLimit-Remaining', (maxRequests - entry.count).toString());
      c.header('X-RateLimit-Reset', entry.resetTime.toString());
    }
  } catch (error) {
    // SECURITY: Removed console.error('Rate limiting error:', error);
    // Continue without rate limiting if there's an error
  }

  return await next();
}

// Helper functions for enhanced authentication

/**
 * Validate API key against database
 */
async function validateApiKey(db: D1Database, apiKey: string): Promise<{ id: string; tenantId: string; permissions: string[] } | null> {
  try {
    const result = await db.prepare(`
      SELECT id, tenant_id, permissions, status, expires_at
      FROM api_keys 
      WHERE key_hash = ? AND status = 'active'
      LIMIT 1
    `).bind(`hashed_${apiKey}`).first(); // Implement proper hashing
    
    if (!result) return null;
    
    // Check expiration
    if (result.expires_at && new Date(result.expires_at) < new Date()) {
      return null;
    }
    
    return {
      id: result.id,
      tenantId: result.tenant_id,
      permissions: result.permissions ? JSON.parse(result.permissions) : []
    };
  } catch (error) {
    // SECURITY: Removed console.error('API key validation error:', error);
    return null;
  }
}

/**
 * Update API key last used timestamp
 */
async function updateApiKeyUsage(db: D1Database, keyId: string, ip: string): Promise<void> {
  try {
    await db.prepare(`
      UPDATE api_keys 
      SET last_used_at = ?, last_used_ip = ?
      WHERE id = ?
    `).bind(new Date().toISOString(), ip, keyId).run();
  } catch (error) {
    // SECURITY: Removed console.error('Failed to update API key usage:', error);
  }
}

/**
 * Get user status from database
 */
async function getUserStatus(db: D1Database, userId: string) {
  try {
    const result = await db.prepare(`
      SELECT status, locked_until
      FROM users 
      WHERE id = ?
      LIMIT 1
    `).bind(userId).first();
    
    if (result?.locked_until && new Date(result.locked_until) > new Date()) {
      return { status: 'locked' };
    }
    
    return result;
  } catch (error) {
    // SECURITY: Removed console.error('User status lookup error:', error);
    return null;
  }
}

/**
 * Verify user has access to tenant
 */
async function verifyTenantAccess(db: D1Database, userId: string, tenantId: string) {
  try {
    const result = await db.prepare(`
      SELECT role, expires_at
      FROM user_tenant_roles 
      WHERE user_id = ? AND tenant_id = ?
      LIMIT 1
    `).bind(userId, tenantId).first();
    
    if (!result) return false;
    
    // Check if role has expired
    if (result.expires_at && new Date(result.expires_at) < new Date()) {
      return false;
    }
    
    return true;
  } catch (error) {
    // SECURITY: Removed console.error('Tenant access verification error:', error);
    return false;
  }
}

/**
 * Update user last activity
 */
async function updateUserActivity(db: D1Database, userId: string, ip: string, userAgent: string): Promise<void> {
  try {
    await db.prepare(`
      UPDATE users 
      SET last_login_at = ?, last_login_ip = ?, last_user_agent = ?
      WHERE id = ?
    `).bind(new Date().toISOString(), ip, userAgent, userId).run();
  } catch (error) {
    // SECURITY: Removed console.error('Failed to update user activity:', error);
  }
}

/**
 * Enhanced role-based access control middleware
 */
export function requireRole(...allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    const userRole = c.get('role') as string;
    const userId = c.get('userId') as string;
    const tenantId = c.get('tenantId') as string;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      await auditLog(c.env, {
        type: 'AUTH_INSUFFICIENT_ROLE',
        userId,
        tenantId,
        action: `Attempted access requiring roles: ${allowedRoles.join(', ')}`,
        result: 'failure',
        ip: c.req.header('CF-Connecting-IP'),
        userAgent: c.req.header('User-Agent'),
        metadata: { userRole, requiredRoles: allowedRoles, path: c.req.path }
      });
      
      return c.json({ 
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
        requestId: c.get('requestId')
      }, 403);
    }
    
    return await next();
  };
}

/**
 * Permission-based access control middleware
 */
export function requirePermission(...requiredPermissions: string[]) {
  return async (c: Context, next: Next) => {
    const userPermissions = (c.get('permissions') as string[]) || [];
    const userId = c.get('userId') as string;
    const tenantId = c.get('tenantId') as string;
    
    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission) || userPermissions.includes('admin')
    );
    
    if (!hasPermission) {
      await auditLog(c.env, {
        type: 'AUTH_INSUFFICIENT_PERMISSION',
        userId,
        tenantId,
        action: `Attempted access requiring permissions: ${requiredPermissions.join(', ')}`,
        result: 'failure',
        ip: c.req.header('CF-Connecting-IP'),
        userAgent: c.req.header('User-Agent'),
        metadata: { userPermissions, requiredPermissions, path: c.req.path }
      });
      
      return c.json({ 
        error: 'Insufficient permissions',
        message: `This action requires one of the following permissions: ${requiredPermissions.join(', ')}`,
        requestId: c.get('requestId')
      }, 403);
    }
    
    return await next();
  };
}

/**
 * Resource ownership middleware (for user-specific resources)
 */
export function requireOwnership(resourceUserIdPath: string) {
  return async (c: Context, next: Next) => {
    const currentUserId = c.get('userId') as string;
    const currentRole = c.get('role') as string;
    const resourceUserId = c.req.param(resourceUserIdPath);
    
    // Admins and managers can access any resource
    if (['admin', 'manager'].includes(currentRole)) {
      await next();
      return;
    }
    
    // Users can only access their own resources
    if (currentUserId !== resourceUserId) {
      await auditLog(c.env, {
        type: 'AUTH_OWNERSHIP_VIOLATION',
        userId: currentUserId,
        tenantId: c.get('tenantId'),
        action: `Attempted access to resource owned by ${resourceUserId}`,
        result: 'failure',
        ip: c.req.header('CF-Connecting-IP'),
        userAgent: c.req.header('User-Agent'),
        metadata: { path: c.req.path, resourceUserId }
      });
      
      return c.json({ 
        error: 'Access denied',
        message: 'You can only access your own resources',
        requestId: c.get('requestId')
      }, 403);
    }
    
    return await next();
  };
}

/**
 * Enhanced input validation with security logging
 */
export function validateInput<T extends z.ZodType>(schema: T) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const validated = schema.parse(body);
      c.set('validatedInput', validated);
      await next();
    } catch (error) {
      const userId = c.get('userId') as string;
      const tenantId = c.get('tenantId') as string;
      
      if (error instanceof z.ZodError) {
        await auditLog(c.env, {
          type: 'VALIDATION_FAILED',
          userId,
          tenantId,
          action: 'Input validation failed',
          result: 'failure',
          ip: c.req.header('CF-Connecting-IP'),
          userAgent: c.req.header('User-Agent'),
          metadata: { 
            path: c.req.path,
            errorCount: error.errors.length,
            fields: error.errors.map(e => e.path.join('.'))
          }
        });
        
        return c.json({ 
          error: 'Validation failed',
          message: 'Please check your input and try again',
          requestId: c.get('requestId')
        }, 400);
      }
      
      const sanitized = sanitizeError(error, 'input validation');
      return c.json({ 
        ...sanitized,
        requestId: c.get('requestId')
      }, 400);
    }
  };
}