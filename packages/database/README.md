# 🗄️ @humber/database

**Drizzle ORM database schemas and migrations for the Humber Operations monorepo**

## 📋 Overview

This package contains all database schemas, migrations, and database configuration for the Humber Operations system. Built with Drizzle ORM for type-safe database operations across SQLite/D1 databases.

## ✨ Features

### 🎯 **Schema Management**
- **Engineer Lifecycle Schemas** - Complete candidate and engineer data models
- **Timesheet Management** - Timesheet submission and reconciliation tables
- **Operations Logging** - Comprehensive audit trail and operation tracking
- **Bull Pen Metrics** - Real-time dashboard data structures
- **Multi-Tenant Support** - Tenant-isolated database architecture

### 🔄 **Migration System**
- **Version Control** - Database schema versioning and migrations
- **Multi-Environment** - Development, staging, and production environments
- **Rollback Support** - Safe schema rollback capabilities
- **Data Integrity** - Foreign key constraints and data validation

### 🛡️ **Type Safety**
- **Drizzle ORM Integration** - Fully typed database operations
- **Schema Validation** - Runtime schema validation
- **IntelliSense Support** - Full IDE type support
- **Type Inference** - Automatic type inference from schemas

## 🏗️ Technical Stack

- **ORM**: Drizzle ORM 0.38 with SQLite/D1 adapter
- **Database**: Cloudflare D1 (SQLite-based)
- **Migrations**: Drizzle Kit for schema management
- **TypeScript**: Full type safety and IntelliSense

## 📁 Schema Structure

### **Core Tables**

#### **Candidates Table** (`candidates`)
```typescript
export const candidates = sqliteTable('candidates', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  status: text('status').notNull().default('recruiting'),
  
  // Lifecycle tracking
  recruitingCompletedAt: integer('recruiting_completed_at'),
  vettingCompletedAt: integer('vetting_completed_at'),
  deployedAt: integer('deployed_at'),
  
  // Verification statuses
  drugTestStatus: text('drug_test_status'),
  backgroundCheckStatus: text('background_check_status'),
  certificationStatus: text('certification_status'),
  ssnVerificationStatus: text('ssn_verification_status'),
  visaStatus: text('visa_status'),
  
  // Workflow tracking
  offerLetterSentAt: integer('offer_letter_sent_at'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
```

#### **Timesheets Table** (`timesheets`)
```typescript
export const timesheets = sqliteTable('timesheets', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  candidateId: text('candidate_id').notNull().references(() => candidates.id),
  weekStartDate: integer('week_start_date').notNull(),
  weekEndDate: integer('week_end_date').notNull(),
  hoursWorked: real('hours_worked').notNull(),
  status: text('status').notNull().default('pending'),
  reconciledAt: integer('reconciled_at'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
```

#### **Operation Logs Table** (`operation_logs`)
```typescript
export const operationLogs = sqliteTable('operation_logs', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  candidateId: text('candidate_id').references(() => candidates.id),
  operationType: text('operation_type').notNull(),
  status: text('status').notNull(),
  details: text('details'),
  createdAt: integer('created_at').notNull(),
});
```

### **Bull Pen Schema** (`bull-pen-schema.ts`)
```typescript
// Real-time metrics and dashboard data
export const bullPenMetrics = sqliteTable('bull_pen_metrics', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  category: text('category').notNull(), // Controls, Mechanical, etc.
  totalEngineers: integer('total_engineers').notNull().default(0),
  availableEngineers: integer('available_engineers').notNull().default(0),
  processingEngineers: integer('processing_engineers').notNull().default(0),
  bufferedEngineers: integer('buffered_engineers').notNull().default(0),
  deployedEngineers: integer('deployed_engineers').notNull().default(0),
  utilizationRate: real('utilization_rate').notNull().default(0),
  lastUpdated: integer('last_updated').notNull(),
});

// Engineer category and status tracking
export const engineerStatus = sqliteTable('engineer_status', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  engineerId: text('engineer_id').notNull(),
  category: text('category').notNull(),
  status: text('status').notNull(), // Available, Processing, Buffered, Deployed
  statusChangedAt: integer('status_changed_at').notNull(),
  previousStatus: text('previous_status'),
  assignedProjectId: text('assigned_project_id'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
```

## 🔄 Database Operations

### **Type-Safe Queries**
```typescript
import { db } from '@humber/database';
import { candidates, timesheets, eq, and } from '@humber/database';

// Select with type safety
const activeEngineers = await db
  .select()
  .from(candidates)
  .where(and(
    eq(candidates.tenantId, tenantId),
    eq(candidates.status, 'deployed')
  ));

// Insert with validation
const newCandidate = await db
  .insert(candidates)
  .values({
    id: generateId(),
    tenantId,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    status: 'recruiting',
    createdAt: Date.now(),
    updatedAt: Date.now()
  })
  .returning();
```

### **Complex Joins**
```typescript
// Join candidates with timesheets
const candidatesWithTimesheets = await db
  .select({
    candidate: candidates,
    timesheet: timesheets
  })
  .from(candidates)
  .leftJoin(timesheets, eq(candidates.id, timesheets.candidateId))
  .where(eq(candidates.tenantId, tenantId));
```

### **Aggregations**
```typescript
// Calculate metrics
const metrics = await db
  .select({
    totalCandidates: count(candidates.id),
    deployedCount: count(candidates.id).where(eq(candidates.status, 'deployed')),
    averageHours: avg(timesheets.hoursWorked)
  })
  .from(candidates)
  .leftJoin(timesheets, eq(candidates.id, timesheets.candidateId))
  .where(eq(candidates.tenantId, tenantId));
```

## 🔧 Migration System

### **Migration Configuration**
```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema.ts',
  out: './migrations',
  driver: 'd1',
  dbCredentials: {
    wranglerConfigPath: '../../apps/worker/wrangler.toml',
    dbName: 'humber-operations'
  }
} satisfies Config;
```

### **Running Migrations**
```bash
# Generate migration files
npx drizzle-kit generate:sqlite

# Apply migrations locally
npx drizzle-kit push:sqlite --config=drizzle.config.ts

# Apply migrations to production
wrangler d1 migrations apply humber-operations --remote
```

### **Migration Scripts**
```typescript
// Migration example: Add new column
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Before
export const candidates = sqliteTable('candidates', {
  id: text('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
});

// After - adding new column
export const candidates = sqliteTable('candidates', {
  id: text('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  middleName: text('middle_name'), // New column
});
```

## 🎯 Multi-Tenant Architecture

### **Tenant Isolation**
```typescript
// All queries include tenant isolation
const getTenantCandidates = async (tenantId: string) => {
  return await db
    .select()
    .from(candidates)
    .where(eq(candidates.tenantId, tenantId));
};

// Middleware ensures tenant context
export const withTenantContext = (tenantId: string) => {
  return {
    candidates: {
      findMany: () => db.select().from(candidates).where(eq(candidates.tenantId, tenantId)),
      create: (data: any) => db.insert(candidates).values({ ...data, tenantId }),
      // ... other operations
    }
  };
};
```

### **Database Sharding**
```typescript
// Multiple tenant databases
export interface TenantDatabases {
  master: D1Database;
  engineer_001: D1Database;
  engineer_002: D1Database;
  engineer_003: D1Database;
  // ... additional shards
}

// Database routing logic
export const getDatabase = (tenantId: string): D1Database => {
  const shard = calculateShard(tenantId);
  return env[`DB_ENGINEER_${shard.toString().padStart(3, '0')}`];
};
```

## 📊 Performance Optimization

### **Indexing Strategy**
```sql
-- Critical indexes for performance
CREATE INDEX idx_candidates_tenant_status ON candidates(tenant_id, status);
CREATE INDEX idx_timesheets_candidate_week ON timesheets(candidate_id, week_start_date);
CREATE INDEX idx_operation_logs_tenant_type ON operation_logs(tenant_id, operation_type);
CREATE INDEX idx_engineer_status_tenant_category ON engineer_status(tenant_id, category, status);
```

### **Query Optimization**
```typescript
// Efficient bulk operations
const bulkUpdateStatus = async (candidateIds: string[], status: string) => {
  return await db
    .update(candidates)
    .set({ 
      status, 
      updatedAt: Date.now() 
    })
    .where(inArray(candidates.id, candidateIds));
};

// Pagination with cursors
const getPaginatedCandidates = async (cursor?: string, limit = 50) => {
  return await db
    .select()
    .from(candidates)
    .where(cursor ? gt(candidates.id, cursor) : undefined)
    .orderBy(candidates.id)
    .limit(limit);
};
```

## 🔒 Data Integrity

### **Foreign Key Constraints**
```typescript
// Enforce referential integrity
export const timesheets = sqliteTable('timesheets', {
  id: text('id').primaryKey(),
  candidateId: text('candidate_id')
    .notNull()
    .references(() => candidates.id, { onDelete: 'cascade' }),
  // ... other fields
});
```

### **Validation Rules**
```typescript
// Schema-level validation
export const candidates = sqliteTable('candidates', {
  email: text('email').notNull().unique(),
  status: text('status').notNull().default('recruiting'),
  // Custom check constraints
  hoursWorked: real('hours_worked').notNull().check(sql`hours_worked >= 0 AND hours_worked <= 80`),
});
```

## 🧪 Testing

### **Database Testing**
```typescript
import { describe, it, beforeEach, afterEach } from 'vitest';
import { db, candidates } from '@humber/database';

describe('Candidates Schema', () => {
  beforeEach(async () => {
    // Setup test database
    await db.delete(candidates);
  });

  it('should create candidate with required fields', async () => {
    const candidate = await db
      .insert(candidates)
      .values({
        id: 'test-1',
        tenantId: 'tenant-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
      .returning();

    expect(candidate[0].status).toBe('recruiting');
  });
});
```

## 📦 Export Structure

```typescript
// Main exports from index.ts
export * from './schema';          // Core database schemas
export * from './bull-pen-schema'; // Bull pen specific schemas

// Re-export Drizzle utilities
export { eq, and, or, desc, asc, count, avg, sum } from 'drizzle-orm';
export { drizzle } from 'drizzle-orm/d1';

// Database connection helpers
export const createDbConnection = (database: D1Database) => {
  return drizzle(database, { schema: { candidates, timesheets, operationLogs } });
};
```

## 🔧 Development

### **Schema Development**
```bash
# Type checking
pnpm typecheck

# Generate migrations
npx drizzle-kit generate:sqlite

# Apply migrations locally
npx drizzle-kit push:sqlite

# Introspect existing database
npx drizzle-kit introspect:sqlite
```

### **Local Development**
```bash
# Start local D1 database
wrangler d1 execute humber-operations --local --command="SELECT 1"

# Run migrations against local DB
wrangler d1 migrations apply humber-operations --local
```

## 📈 Monitoring

### **Query Performance**
```typescript
// Query timing middleware
const timedQuery = async (query: () => Promise<any>) => {
  const start = performance.now();
  const result = await query();
  const duration = performance.now() - start;
  
  console.log(`Query executed in ${duration}ms`);
  return result;
};
```

### **Connection Health**
```typescript
// Database health check
export const healthCheck = async (db: DrizzleD1Database) => {
  try {
    await db.select({ count: count() }).from(candidates).limit(1);
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};
```

## 🤝 Contributing

1. Follow Drizzle ORM best practices
2. Include proper foreign key relationships
3. Add indexes for frequently queried columns
4. Include migration scripts for schema changes
5. Test schema changes in development environment

---

**Part of the Humber Operations monorepo** 🚀