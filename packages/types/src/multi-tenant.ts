import { z } from 'zod';
import { EngineerCategory } from './engineer';

// Tenant Configuration Types
export const TenantTier = z.enum([
  'STARTER',     // Basic features, up to 10 engineers
  'PROFESSIONAL', // Advanced features, up to 50 engineers  
  'ENTERPRISE',   // Full features, unlimited engineers
  'CUSTOM'       // Custom pricing and features
]);

export type TenantTier = z.infer<typeof TenantTier>;

export const TenantStatus = z.enum([
  'ACTIVE',      // Fully operational
  'TRIAL',       // In trial period
  'SUSPENDED',   // Temporarily disabled
  'CANCELLED',   // Account cancelled
  'PENDING'      // Setup in progress
]);

export type TenantStatus = z.infer<typeof TenantStatus>;

// Multi-Tenant Configuration Schema
export const TenantConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Tenant name is required'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  
  // Subscription details
  tier: TenantTier,
  status: TenantStatus,
  
  // Limits based on tier
  limits: z.object({
    maxEngineers: z.number().min(1),
    maxProjects: z.number().min(1),
    maxStorageGB: z.number().min(1),
    maxAPICallsPerMonth: z.number().min(1000),
    canUseAdvancedAnalytics: z.boolean().default(false),
    canUseBulkOperations: z.boolean().default(false),
    canUseCustomIntegrations: z.boolean().default(false)
  }),
  
  // Business information
  company: z.object({
    legalName: z.string(),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      country: z.string().default('US')
    }),
    taxId: z.string().optional(),
    industry: z.string().optional(),
    website: z.string().url().optional()
  }),
  
  // Primary contact
  primaryContact: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    title: z.string().optional()
  }),
  
  // Billing information
  billing: z.object({
    currency: z.string().default('USD'),
    billingCycle: z.enum(['monthly', 'quarterly', 'annually']).default('monthly'),
    paymentMethod: z.enum(['credit_card', 'ach', 'wire', 'invoice']).default('credit_card'),
    billingEmail: z.string().email(),
    taxRate: z.number().min(0).max(100).default(0)
  }),
  
  // Feature flags
  features: z.object({
    enableTimeTracking: z.boolean().default(true),
    enableReconciliation: z.boolean().default(true),
    enableBullPen: z.boolean().default(true),
    enableAnalytics: z.boolean().default(false),
    enableAPIAccess: z.boolean().default(false),
    enableCustomBranding: z.boolean().default(false),
    enableSSOIntegration: z.boolean().default(false)
  }),
  
  // Database configuration
  database: z.object({
    primaryRegion: z.string().default('auto'),
    backupRegions: z.array(z.string()).default([]),
    retentionDays: z.number().min(30).max(2555).default(365), // 7 years max
    encryptionEnabled: z.boolean().default(true)
  }),
  
  // Integration settings
  integrations: z.object({
    allowedDomains: z.array(z.string()).default([]),
    webhookEndpoints: z.array(z.object({
      url: z.string().url(),
      events: z.array(z.string()),
      secret: z.string(),
      isActive: z.boolean().default(true)
    })).default([]),
    apiKeys: z.array(z.object({
      id: z.string(),
      name: z.string(),
      permissions: z.array(z.string()),
      expiresAt: z.number().optional(),
      lastUsedAt: z.number().optional(),
      isActive: z.boolean().default(true)
    })).default([])
  }),
  
  // Timestamps
  createdAt: z.number(),
  updatedAt: z.number(),
  trialEndsAt: z.number().optional(),
  lastLoginAt: z.number().optional()
});

export type TenantConfig = z.infer<typeof TenantConfigSchema>;

// Tenant Creation Input
export const CreateTenantSchema = TenantConfigSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true
});

export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;

// Tenant Update Input
export const UpdateTenantSchema = TenantConfigSchema.partial().omit({
  id: true,
  createdAt: true
});

export type UpdateTenantInput = z.infer<typeof UpdateTenantSchema>;

// Tenant Usage Metrics
export const TenantUsageSchema = z.object({
  tenantId: z.string(),
  period: z.object({
    startDate: z.string(),
    endDate: z.string()
  }),
  
  // Usage statistics
  engineers: z.object({
    total: z.number(),
    active: z.number(),
    deployed: z.number(),
    byCategory: z.record(z.string(), z.number())
  }),
  
  projects: z.object({
    total: z.number(),
    active: z.number(),
    completed: z.number(),
    totalValue: z.number()
  }),
  
  timesheets: z.object({
    submitted: z.number(),
    reconciled: z.number(),
    disputed: z.number(),
    totalHours: z.number(),
    totalAmount: z.number()
  }),
  
  api: z.object({
    totalCalls: z.number(),
    successRate: z.number(),
    averageResponseTime: z.number(),
    errorsByType: z.record(z.string(), z.number())
  }),
  
  storage: z.object({
    documentsCount: z.number(),
    totalSizeGB: z.number(),
    bandwidthUsedGB: z.number()
  }),
  
  generatedAt: z.number()
});

export type TenantUsage = z.infer<typeof TenantUsageSchema>;

// Tenant Audit Log
export const TenantAuditLogSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  userId: z.string(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
  details: z.record(z.string(), z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  createdAt: z.number()
});

export type TenantAuditLog = z.infer<typeof TenantAuditLogSchema>;
