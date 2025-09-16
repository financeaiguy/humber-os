import { Context, Next } from 'hono';
import type { Env } from '@humber/types';

// Context variables for multi-tenant middleware
interface MultiTenantVariables {
  tenantId: string;
}

export async function multiTenantMiddleware(c: Context<{ Bindings: Env; Variables: MultiTenantVariables }>, next: Next) {
  const tenantId = c.req.header('X-Tenant-ID');
  
  if (!tenantId) {
    return c.json({ error: 'Missing X-Tenant-ID header' }, 400);
  }
  
  const tenantPattern = /^[a-zA-Z0-9_-]+$/;
  if (!tenantPattern.test(tenantId)) {
    return c.json({ error: 'Invalid tenant ID format' }, 400);
  }
  
  c.set('tenantId', tenantId);
  
  await next();
}