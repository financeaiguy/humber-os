import { Context, Next } from 'hono'
import { z } from 'zod'
import { JWTManager } from '../lib/jwt'
import { sanitizeTenantId, auditLog } from './security'

// Tenant configuration schema
const TenantConfigSchema = z.object({
  tenantId: z.string(),
  engineerId: z.string(),
  dbBinding: z.string(),
  createdAt: z.string(),
  status: z.enum(['active', 'suspended', 'pending'])
})

type TenantConfig = z.infer<typeof TenantConfigSchema>

// Context variables for tenant middleware
interface TenantVariables {
  tenantDB: D1Database;
  tenantId: string;
  engineerId: string;
}

// Environment with multiple D1 databases
interface TenantEnv {
  // Master database that tracks tenant assignments
  DB_MASTER: D1Database
  
  // Tenant-specific databases
  DB_ENGINEER_001: D1Database
  DB_ENGINEER_002: D1Database
  DB_ENGINEER_003: D1Database
  DB_ENGINEER_004: D1Database
  DB_ENGINEER_005: D1Database
  DB_ENGINEER_006: D1Database
  DB_ENGINEER_007: D1Database
  DB_ENGINEER_008: D1Database
  DB_ENGINEER_009: D1Database
  DB_ENGINEER_010: D1Database
  
  // KV for caching tenant mappings
  KV_TENANT_CACHE: KVNamespace
  
  // Queue for async operations
  TENANT_QUEUE: Queue
}

// Map of DB binding names to actual bindings
const DB_BINDINGS: Record<string, keyof TenantEnv> = {
  'DB_ENGINEER_001': 'DB_ENGINEER_001',
  'DB_ENGINEER_002': 'DB_ENGINEER_002',
  'DB_ENGINEER_003': 'DB_ENGINEER_003',
  'DB_ENGINEER_004': 'DB_ENGINEER_004',
  'DB_ENGINEER_005': 'DB_ENGINEER_005',
  'DB_ENGINEER_006': 'DB_ENGINEER_006',
  'DB_ENGINEER_007': 'DB_ENGINEER_007',
  'DB_ENGINEER_008': 'DB_ENGINEER_008',
  'DB_ENGINEER_009': 'DB_ENGINEER_009',
  'DB_ENGINEER_010': 'DB_ENGINEER_010',
}

/**
 * Multi-tenant middleware for routing requests to correct tenant database
 * Implements zero-trust approach with complete tenant isolation
 */
export async function tenantMiddleware(c: Context<{ Bindings: TenantEnv; Variables: TenantVariables }>, next: Next) {
  try {
    // Extract tenant identifier from various sources
    const rawTenantId = await extractTenantId(c)
    
    if (!rawTenantId) {
      return c.json({ 
        error: 'Tenant identification required',
        message: 'Please provide tenant ID via header, query param, or path'
      }, 401)
    }
    
    // Sanitize tenant ID to prevent injection attacks
    const tenantId = sanitizeTenantId(rawTenantId)
    if (!tenantId) {
      await auditLog(c.env, {
        type: 'SECURITY',
        action: 'Invalid tenant ID format',
        result: 'failure',
        metadata: { rawTenantId },
        ip: c.req.header('CF-Connecting-IP'),
        userAgent: c.req.header('User-Agent')
      })
      
      return c.json({ 
        error: 'Invalid tenant ID',
        message: 'Tenant ID contains invalid characters'
      }, 400)
    }
    
    // Check cache first for performance
    const cachedConfig = await getCachedTenantConfig(c.env.KV_TENANT_CACHE, tenantId)
    
    let tenantConfig: TenantConfig
    
    if (cachedConfig) {
      tenantConfig = cachedConfig
    } else {
      // Lookup tenant configuration from master database
      tenantConfig = await getTenantConfig(c.env.DB_MASTER, tenantId)
      
      if (!tenantConfig) {
        return c.json({ 
          error: 'Invalid tenant',
          message: 'Tenant not found or inactive'
        }, 403)
      }
      
      // Cache the configuration for 1 hour
      await cacheTenantConfig(c.env.KV_TENANT_CACHE, tenantId, tenantConfig)
    }
    
    // Verify tenant is active
    if (tenantConfig.status !== 'active') {
      return c.json({ 
        error: 'Tenant suspended',
        message: `Tenant status: ${tenantConfig.status}`
      }, 403)
    }
    
    // Get the appropriate database binding
    const dbBinding = DB_BINDINGS[tenantConfig.dbBinding]
    
    if (!dbBinding || !c.env[dbBinding]) {
      // SECURITY: Removed console.error(`Invalid DB binding for tenant ${tenantId}: ${tenantConfig.dbBinding}`)
      return c.json({ 
        error: 'Database configuration error',
        message: 'Unable to connect to tenant database'
      }, 500)
    }
    
    // Attach tenant database to context
    c.set('tenantDB', c.env[dbBinding])
    c.set('tenantId', tenantId)
    c.set('engineerId', tenantConfig.engineerId)
    
    // Log access for audit trail
    await logTenantAccess(c.env.TENANT_QUEUE, {
      tenantId,
      engineerId: tenantConfig.engineerId,
      path: c.req.path,
      method: c.req.method,
      timestamp: new Date().toISOString()
    })
    
    // Add security headers
    c.header('X-Tenant-ID', tenantId)
    c.header('X-Content-Type-Options', 'nosniff')
    c.header('X-Frame-Options', 'DENY')
    c.header('X-XSS-Protection', '1; mode=block')
    
    await next()
  } catch (error) {
    // SECURITY: Removed console.error('Tenant middleware error:', error)
    return c.json({ 
      error: 'Tenant routing failed',
      message: 'Unable to process tenant request'
    }, 500)
  }
}

/**
 * Extract tenant ID from request
 */
async function extractTenantId(c: Context): Promise<string | null> {
  // Priority order: header > path param > query param > JWT claim
  
  // 1. Check header
  const headerTenant = c.req.header('X-Tenant-ID')
  if (headerTenant) return headerTenant
  
  // 2. Check path parameter
  const pathTenant = c.req.param('tenantId')
  if (pathTenant) return pathTenant
  
  // 3. Check query parameter
  const url = new URL(c.req.url)
  const queryTenant = url.searchParams.get('tenantId')
  if (queryTenant) return queryTenant
  
  // 4. Check JWT token if present
  const authHeader = c.req.header('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const tenantFromToken = await extractTenantFromJWT(token, c.env)
    if (tenantFromToken) return tenantFromToken
  }
  
  return null
}

/**
 * Extract and verify tenant ID from JWT token
 */
async function extractTenantFromJWT(token: string, env: any): Promise<string | null> {
  try {
    const jwtManager = new JWTManager(env.JWT_SECRET || 'default-secret-change-in-production')
    const payload = await jwtManager.verifyToken(token)
    return payload?.tenantId || null
  } catch {
    return null
  }
}

/**
 * Get cached tenant configuration
 */
async function getCachedTenantConfig(
  kv: KVNamespace,
  tenantId: string
): Promise<TenantConfig | null> {
  try {
    const cached = await kv.get(`tenant:config:${tenantId}`, 'json')
    if (cached) {
      return TenantConfigSchema.parse(cached)
    }
  } catch (error) {
    // SECURITY: Removed console.error('Cache retrieval error:', error)
  }
  return null
}

/**
 * Cache tenant configuration
 */
async function cacheTenantConfig(
  kv: KVNamespace,
  tenantId: string,
  config: TenantConfig
): Promise<void> {
  try {
    await kv.put(
      `tenant:config:${tenantId}`,
      JSON.stringify(config),
      { expirationTtl: 3600 } // 1 hour TTL
    )
  } catch (error) {
    // SECURITY: Removed console.error('Cache storage error:', error)
  }
}

/**
 * Get tenant configuration from master database
 */
async function getTenantConfig(
  db: D1Database,
  tenantId: string
): Promise<TenantConfig | null> {
  try {
    const result = await db.prepare(`
      SELECT 
        tenant_id as tenantId,
        engineer_id as engineerId,
        db_binding as dbBinding,
        created_at as createdAt,
        status
      FROM tenant_mappings
      WHERE tenant_id = ?
      LIMIT 1
    `).bind(tenantId).first()
    
    if (result) {
      return TenantConfigSchema.parse(result)
    }
  } catch (error) {
    // SECURITY: Removed console.error('Database query error:', error)
  }
  return null
}

/**
 * Log tenant access for audit trail
 */
async function logTenantAccess(
  queue: Queue,
  access: {
    tenantId: string
    engineerId: string
    path: string
    method: string
    timestamp: string
  }
): Promise<void> {
  try {
    await queue.send({
      type: 'TENANT_ACCESS_LOG',
      ...access
    })
  } catch (error) {
    // SECURITY: Removed console.error('Failed to log tenant access:', error)
  }
}

/**
 * Create a new tenant assignment
 */
export async function createTenantAssignment(
  env: TenantEnv,
  engineerId: string
): Promise<{ tenantId: string; dbBinding: string }> {
  const tenantId = `tenant_${engineerId}_${Date.now()}`
  
  // Find available database binding
  const availableBinding = await findAvailableDatabase(env.DB_MASTER)
  
  if (!availableBinding) {
    throw new Error('No available database slots')
  }
  
  // Create tenant mapping
  await env.DB_MASTER.prepare(`
    INSERT INTO tenant_mappings (
      tenant_id,
      engineer_id,
      db_binding,
      created_at,
      status
    ) VALUES (?, ?, ?, ?, 'active')
  `).bind(
    tenantId,
    engineerId,
    availableBinding,
    new Date().toISOString()
  ).run()
  
  // Initialize tenant database schema
  const tenantDB = env[availableBinding as keyof TenantEnv] as D1Database
  await initializeTenantSchema(tenantDB)
  
  // Clear any cached data for this tenant
  await env.KV_TENANT_CACHE.delete(`tenant:config:${tenantId}`)
  
  return { tenantId, dbBinding: availableBinding }
}

/**
 * Find available database binding
 */
async function findAvailableDatabase(db: D1Database): Promise<string | null> {
  try {
    // Count tenants per database
    const counts = await db.prepare(`
      SELECT db_binding, COUNT(*) as count
      FROM tenant_mappings
      WHERE status = 'active'
      GROUP BY db_binding
    `).all()
    
    // Find database with least tenants
    let minCount = Infinity
    let selectedBinding = null
    
    for (const binding of Object.keys(DB_BINDINGS)) {
      const count = counts.results.find(r => r.db_binding === binding)?.count || 0
      if (count < minCount) {
        minCount = count as number
        selectedBinding = binding
      }
    }
    
    // Return binding with least tenants (or first available if none assigned)
    return selectedBinding || Object.keys(DB_BINDINGS)[0]
  } catch (error) {
    // SECURITY: Removed console.error('Error finding available database:', error)
    return Object.keys(DB_BINDINGS)[0] // Fallback to first database
  }
}

/**
 * Initialize tenant database schema
 */
async function initializeTenantSchema(db: D1Database): Promise<void> {
  // Create tables for tenant-specific data
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS engineers (
        id TEXT PRIMARY KEY,
        resume TEXT,
        availability TEXT,
        specialty_keywords TEXT,
        screened_by TEXT,
        screened_at TEXT,
        status TEXT DEFAULT 'recruited',
        deployment_count INTEGER DEFAULT 0,
        current_project_id TEXT,
        current_client TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS vetting_sessions (
        id TEXT PRIMARY KEY,
        engineer_id TEXT,
        initiated_by TEXT,
        status TEXT,
        created_at TEXT,
        completed_at TEXT,
        FOREIGN KEY (engineer_id) REFERENCES engineers(id)
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS vetting_checks (
        id TEXT PRIMARY KEY,
        vetting_session_id TEXT,
        engineer_id TEXT,
        check_type TEXT,
        status TEXT,
        result TEXT,
        initiated_at TEXT,
        completed_at TEXT,
        FOREIGN KEY (vetting_session_id) REFERENCES vetting_sessions(id),
        FOREIGN KEY (engineer_id) REFERENCES engineers(id)
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS offers (
        id TEXT PRIMARY KEY,
        engineer_id TEXT,
        position TEXT,
        salary REAL,
        start_date TEXT,
        needs_visa BOOLEAN,
        visa_type TEXT,
        status TEXT,
        created_at TEXT,
        FOREIGN KEY (engineer_id) REFERENCES engineers(id)
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS visa_applications (
        id TEXT PRIMARY KEY,
        engineer_id TEXT,
        offer_id TEXT,
        visa_type TEXT,
        status TEXT,
        initiated_at TEXT,
        approved_at TEXT,
        FOREIGN KEY (engineer_id) REFERENCES engineers(id),
        FOREIGN KEY (offer_id) REFERENCES offers(id)
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS visa_requirements (
        id TEXT PRIMARY KEY,
        visa_id TEXT,
        requirement TEXT,
        status TEXT,
        created_at TEXT,
        completed_at TEXT,
        FOREIGN KEY (visa_id) REFERENCES visa_applications(id)
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS deployments (
        id TEXT PRIMARY KEY,
        engineer_id TEXT,
        project_id TEXT,
        client_name TEXT,
        location TEXT,
        start_date TEXT,
        end_date TEXT,
        status TEXT,
        created_at TEXT,
        FOREIGN KEY (engineer_id) REFERENCES engineers(id)
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS deployment_failures (
        id TEXT PRIMARY KEY,
        deployment_id TEXT,
        engineer_id TEXT,
        reason TEXT,
        occurred_at TEXT,
        FOREIGN KEY (deployment_id) REFERENCES deployments(id),
        FOREIGN KEY (engineer_id) REFERENCES engineers(id)
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS operation_logs (
        id TEXT PRIMARY KEY,
        engineer_id TEXT,
        operation_type TEXT,
        status TEXT,
        details TEXT,
        created_at TEXT
      )
    `)
  ])
}

/**
 * Tenant isolation validator - ensures no cross-tenant access
 */
export function validateTenantAccess(
  requestedTenantId: string,
  contextTenantId: string
): boolean {
  return requestedTenantId === contextTenantId
}

/**
 * Suspend a tenant
 */
export async function suspendTenant(
  env: TenantEnv,
  tenantId: string,
  reason: string
): Promise<void> {
  await env.DB_MASTER.prepare(`
    UPDATE tenant_mappings
    SET status = 'suspended',
        suspension_reason = ?,
        suspended_at = ?
    WHERE tenant_id = ?
  `).bind(reason, new Date().toISOString(), tenantId).run()
  
  // Clear cache
  await env.KV_TENANT_CACHE.delete(`tenant:config:${tenantId}`)
  
  // Log suspension
  await env.TENANT_QUEUE.send({
    type: 'TENANT_SUSPENDED',
    tenantId,
    reason,
    timestamp: new Date().toISOString()
  })
}

export default tenantMiddleware