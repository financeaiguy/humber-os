# 📦 @humber/types

**Shared TypeScript types and interfaces for the Humber Operations monorepo**

## 📋 Overview

This package provides a comprehensive set of TypeScript types, interfaces, and Zod schemas that ensure type safety and consistency across all applications in the Humber Operations ecosystem.

## ✨ Features

### 🎯 **Core Type Definitions**
- **Engineer Types** - Complete engineer lifecycle and status management
- **Bull Pen Types** - Real-time dashboard metrics and categories
- **Timesheet Types** - Timesheet submission and reconciliation
- **Operations Types** - Project and deployment management
- **Multi-Tenant Types** - Tenant isolation and context management

### 🛡️ **Schema Validation**
- **Zod Schemas** - Runtime validation for all data structures
- **Type Guards** - TypeScript type narrowing utilities
- **Validation Helpers** - Common validation patterns
- **Error Types** - Standardized error handling

### 🔄 **Status Management**
- **Engineer Status Flow** - Available → Processing → Buffered → Deployed
- **Timesheet States** - Draft → Submitted → Approved → Reconciling → Paid
- **Reconciliation Status** - Auto-approve, requires review, failed

## 🏗️ Technical Stack

- **TypeScript 5.7** - Latest TypeScript with strict mode
- **Zod 3.24** - Schema validation and type inference
- **ESM Modules** - Modern module system

## 📁 Type Modules

### **Engineer Types** (`engineer.ts`)
```typescript
// Engineer categories and specializations
export enum EngineerCategory {
  Controls = 'Controls',
  Mechanical = 'Mechanical', 
  Electrical = 'Electrical',
  Piping = 'Piping',
  Robotics = 'Robotics'
}

// Engineer lifecycle status
export enum EngineerStatus {
  Available = 'Available',
  Processing = 'Processing',
  Buffered = 'Buffered',
  Deployed = 'Deployed'
}

// Complete engineer profile interface
export interface Engineer {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  category: EngineerCategory;
  status: EngineerStatus;
  yearsExperience: number;
  skills: string[];
  certifications: string[];
  availability: Date;
  hourlyRate: number;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Bull Pen Types** (`bull-pen.ts`)
```typescript
// Real-time metrics for dashboard
export interface BullPenMetrics {
  totalEngineers: number;
  availableEngineers: number;
  deployedEngineers: number;
  utilizationRate: number;
  categoryBreakdown: CategoryMetrics[];
  deploymentRate: number;
  averageTimeToDeployment: number;
}

// Category-specific metrics
export interface CategoryMetrics {
  category: EngineerCategory;
  total: number;
  available: number;
  deployed: number;
  utilizationRate: number;
}

// Reconciliation status for timesheets
export enum ReconciliationStatus {
  AutoApproved = 'auto_approved',
  RequiresReview = 'requires_review', 
  Failed = 'failed',
  Resolved = 'resolved'
}
```

### **Timesheet Types** (`timesheets.ts`)
```typescript
// Timesheet submission interface
export interface Timesheet {
  id: string;
  tenantId: string;
  engineerId: string;
  projectId: string;
  weekEnding: Date;
  regularHours: number;
  overtimeHours: number;
  doubleTimeHours: number;
  totalHours: number;
  status: TimesheetStatus;
  reconciliationStatus?: ReconciliationStatus;
  submittedAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Timesheet workflow status
export enum TimesheetStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  Approved = 'approved',
  Reconciling = 'reconciling',
  Paid = 'paid'
}

// Timesheet reconciliation thresholds
export interface ReconciliationThresholds {
  autoApprovePercentage: number;   // 5% variance
  autoApproveHours: number;        // 2 hour variance
  requiresReviewPercentage: number; // 10% variance
  requiresReviewHours: number;     // 8 hour variance
}
```

### **Operations Types** (`operations.ts`)
```typescript
// Project management interface
export interface Project {
  id: string;
  tenantId: string;
  name: string;
  clientId: string;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;
  budget: number;
  spent: number;
  assignedEngineers: string[];
  requirements: ProjectRequirement[];
  createdAt: Date;
  updatedAt: Date;
}

// Project lifecycle status
export enum ProjectStatus {
  Planning = 'planning',
  Active = 'active',
  OnHold = 'on_hold',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

// Engineer deployment tracking
export interface Deployment {
  id: string;
  engineerId: string;
  projectId: string;
  status: DeploymentStatus;
  startDate: Date;
  endDate?: Date;
  success: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Multi-Tenant Types** (`multi-tenant.ts`)
```typescript
// Tenant context interface
export interface TenantContext {
  tenantId: string;
  name: string;
  domain: string;
  settings: TenantSettings;
  subscription: TenantSubscription;
  createdAt: Date;
  updatedAt: Date;
}

// Tenant-specific configuration
export interface TenantSettings {
  reconciliationThresholds: ReconciliationThresholds;
  workflowSettings: WorkflowSettings;
  integrationSettings: IntegrationSettings;
  securitySettings: SecuritySettings;
}

// Database routing for multi-tenancy
export interface DatabaseRouting {
  masterDb: string;
  tenantDbs: Record<string, string>;
  shardingStrategy: 'tenant_id' | 'geography' | 'size';
}
```

## 🛡️ Validation Schemas

### **Zod Schema Examples**
```typescript
// Engineer validation schema
export const createEngineerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  category: z.nativeEnum(EngineerCategory),
  status: z.nativeEnum(EngineerStatus),
  yearsExperience: z.number().min(0).max(50),
  skills: z.array(z.string()).min(1),
  hourlyRate: z.number().min(0),
  location: z.string().min(1)
});

// Timesheet validation schema
export const submitTimesheetSchema = z.object({
  engineerId: z.string().uuid(),
  projectId: z.string().uuid(),
  weekEnding: z.string().datetime(),
  regularHours: z.number().min(0).max(40),
  overtimeHours: z.number().min(0).max(20),
  doubleTimeHours: z.number().min(0).max(10)
}).refine(data => {
  const total = data.regularHours + data.overtimeHours + data.doubleTimeHours;
  return total <= 70; // Maximum 70 hours per week
}, {
  message: "Total hours cannot exceed 70 per week"
});
```

## 🎯 Usage Examples

### **Type-Safe API Responses**
```typescript
import { Engineer, BullPenMetrics, Timesheet } from '@humber/types';

// Type-safe API handler
async function getEngineers(): Promise<Engineer[]> {
  const response = await fetch('/api/engineers');
  return response.json() as Engineer[];
}

// Type-safe metrics calculation
function calculateUtilization(metrics: BullPenMetrics): number {
  return (metrics.deployedEngineers / metrics.totalEngineers) * 100;
}
```

### **Schema Validation**
```typescript
import { createEngineerSchema } from '@humber/types';

// Validate incoming data
export async function createEngineer(data: unknown) {
  const validatedData = createEngineerSchema.parse(data);
  // validatedData is now type-safe and validated
  return await saveEngineer(validatedData);
}
```

### **Type Guards**
```typescript
import { isEngineerAvailable, isTimesheetApproved } from '@humber/types';

// Type-safe status checking
if (isEngineerAvailable(engineer)) {
  // engineer.status is narrowed to 'Available'
  await assignToProject(engineer);
}

if (isTimesheetApproved(timesheet)) {
  // timesheet.status is narrowed to 'approved'
  await processPayment(timesheet);
}
```

## 🔄 Status Flow Validation

### **Engineer Status Transitions**
```typescript
// Valid status transitions
const validTransitions: Record<EngineerStatus, EngineerStatus[]> = {
  Available: [EngineerStatus.Processing],
  Processing: [EngineerStatus.Buffered, EngineerStatus.Available],
  Buffered: [EngineerStatus.Deployed, EngineerStatus.Available],
  Deployed: [EngineerStatus.Available]
};

// Validation helper
export function canTransitionStatus(
  from: EngineerStatus, 
  to: EngineerStatus
): boolean {
  return validTransitions[from].includes(to);
}
```

### **Timesheet Reconciliation Logic**
```typescript
// Automated reconciliation rules
export function determineReconciliationStatus(
  submittedHours: number,
  expectedHours: number,
  thresholds: ReconciliationThresholds
): ReconciliationStatus {
  const variance = Math.abs(submittedHours - expectedHours);
  const percentageVariance = variance / expectedHours;
  
  if (percentageVariance <= thresholds.autoApprovePercentage || 
      variance <= thresholds.autoApproveHours) {
    return ReconciliationStatus.AutoApproved;
  }
  
  if (percentageVariance <= thresholds.requiresReviewPercentage || 
      variance <= thresholds.requiresReviewHours) {
    return ReconciliationStatus.RequiresReview;
  }
  
  return ReconciliationStatus.Failed;
}
```

## 🧪 Testing

### **Type Testing**
```typescript
import { expectType } from 'tsd';
import { Engineer, EngineerCategory } from '@humber/types';

// Compile-time type testing
expectType<Engineer['category']>(EngineerCategory.Controls);
expectType<number>(engineer.yearsExperience);
expectType<string[]>(engineer.skills);
```

### **Schema Testing**
```typescript
import { createEngineerSchema } from '@humber/types';

describe('Engineer Schema Validation', () => {
  it('should validate correct engineer data', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      category: 'Controls',
      status: 'Available',
      yearsExperience: 5,
      skills: ['PLC Programming'],
      hourlyRate: 75,
      location: 'Houston, TX'
    };
    
    expect(() => createEngineerSchema.parse(validData)).not.toThrow();
  });
});
```

## 📦 Export Structure

```typescript
// Main exports from index.ts
export * from './engineer';      // Engineer types and schemas
export * from './bull-pen';      // Dashboard metrics and categories
export * from './timesheets';    // Timesheet management types
export * from './operations';    // Project and deployment types
export * from './multi-tenant';  // Multi-tenancy support

// Environment interface for Cloudflare Workers
export interface Env {
  DB: D1Database;
  KV_CACHE: KVNamespace;
  OPERATIONS_QUEUE: Queue;
  DOCUMENTS: R2Bucket;
  // ... additional bindings
}
```

## 🔧 Development

### **Type Generation**
```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Formatting
pnpm format
```

### **Integration**
```typescript
// Import in applications
import { Engineer, Timesheet, BullPenMetrics } from '@humber/types';

// Use in API responses
export type ApiResponse<T> = {
  data: T;
  error?: string;
  timestamp: string;
};

export type EngineersResponse = ApiResponse<Engineer[]>;
export type MetricsResponse = ApiResponse<BullPenMetrics>;
```

## 🤝 Contributing

1. Follow TypeScript strict mode guidelines
2. Include Zod schemas for all new types
3. Add JSDoc comments for complex interfaces
4. Include type tests for new functionality
5. Maintain backward compatibility

---

**Part of the Humber Operations monorepo** 🚀