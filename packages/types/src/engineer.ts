import { z } from 'zod';

// Engineer Categories - Exactly 5 as per requirements
export const EngineerCategory = z.enum([
  'ELECTRICAL_ENGINEER',
  'MECHANICAL_ENGINEER', 
  'SOFTWARE_ENGINEER',
  'SYSTEMS_ENGINEER',
  'PROJECT_ENGINEER'
]);

export type EngineerCategory = z.infer<typeof EngineerCategory>;

// Engineer Status - Exactly 4 states as per requirements
export const EngineerStatus = z.enum([
  'AVAILABLE',      // Ready for deployment
  'DEPLOYED',       // Currently on project
  'ON_LEAVE',       // Temporarily unavailable
  'TERMINATED'      // No longer with company
]);

export type EngineerStatus = z.infer<typeof EngineerStatus>;

// Required Checks - All 4 required as per business requirements
export const RequiredCheckStatus = z.enum(['pending', 'pass', 'fail']);

export const RequiredChecksSchema = z.object({
  drug_test: RequiredCheckStatus,
  background: RequiredCheckStatus,
  certification: RequiredCheckStatus,
  ssn_tin: RequiredCheckStatus,
});

export type RequiredChecks = z.infer<typeof RequiredChecksSchema>;

// Engineer Profile
export const EngineerSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  category: EngineerCategory,
  status: EngineerStatus,
  
  // Required checks for deployment eligibility
  requiredChecks: RequiredChecksSchema,
  
  // Deployment tracking
  currentDeployment: z.object({
    clientName: z.string(),
    projectName: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    location: z.string(),
    hourlyRate: z.number().positive(),
    isActive: z.boolean()
  }).optional(),
  
  // Performance metrics
  metrics: z.object({
    totalDeployments: z.number().default(0),
    successfulDeployments: z.number().default(0),
    averageRating: z.number().min(0).max(5).default(0),
    totalHoursWorked: z.number().default(0),
    onTimeCompletionRate: z.number().min(0).max(100).default(0)
  }).optional(),
  
  // Timestamps
  createdAt: z.number(),
  updatedAt: z.number(),
  lastDeployedAt: z.number().optional(),
});

export type Engineer = z.infer<typeof EngineerSchema>;

// Engineer Creation Input
export const CreateEngineerSchema = EngineerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  metrics: true
});

export type CreateEngineerInput = z.infer<typeof CreateEngineerSchema>;

// Engineer Update Input
export const UpdateEngineerSchema = EngineerSchema.partial().omit({
  id: true,
  tenantId: true,
  createdAt: true
});

export type UpdateEngineerInput = z.infer<typeof UpdateEngineerSchema>;

// Engineer Deployment Eligibility Check
export const DeploymentEligibilitySchema = z.object({
  engineerId: z.string(),
  tenantId: z.string(),
  isEligible: z.boolean(),
  blockers: z.array(z.object({
    type: z.enum(['drug_test', 'background', 'certification', 'ssn_tin', 'status', 'availability']),
    message: z.string(),
    severity: z.enum(['error', 'warning', 'info'])
  })).default([]),
  eligibilityScore: z.number().min(0).max(100),
  lastCheckedAt: z.number()
});

export type DeploymentEligibility = z.infer<typeof DeploymentEligibilitySchema>;

// Engineer Search and Filtering
export const EngineerSearchSchema = z.object({
  tenantId: z.string(),
  category: EngineerCategory.optional(),
  status: EngineerStatus.optional(),
  location: z.string().optional(),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  skills: z.array(z.string()).optional(),
  sortBy: z.enum(['name', 'category', 'rating', 'lastDeployed', 'availability']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
});

export type EngineerSearchInput = z.infer<typeof EngineerSearchSchema>;

// Engineer Statistics
export const EngineerStatsSchema = z.object({
  tenantId: z.string(),
  totalEngineers: z.number(),
  byCategory: z.record(EngineerCategory, z.number()),
  byStatus: z.record(EngineerStatus, z.number()),
  deploymentEligible: z.number(),
  currentlyDeployed: z.number(),
  averageRating: z.number(),
  topPerformers: z.array(z.object({
    engineerId: z.string(),
    name: z.string(),
    category: EngineerCategory,
    rating: z.number(),
    deploymentsCompleted: z.number()
  })),
  generatedAt: z.number()
});

export type EngineerStats = z.infer<typeof EngineerStatsSchema>;
