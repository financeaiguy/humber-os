# Humber Operations Setup Guide

## Prerequisites
- Node.js 20+ installed
- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)

## Step 1: Install Dependencies

First, ensure pnpm is installed:
```bash
npm install -g pnpm
```

Then install all dependencies:
```bash
pnpm install
```

If you encounter timeout issues, try:
```bash
pnpm install --fetch-timeout 300000
```

## Step 2: Create Cloudflare Resources

### 2.1 Login to Cloudflare
```bash
wrangler login
```

### 2.2 Create D1 Database
```bash
cd apps/worker
wrangler d1 create humber-operations-db
```

Copy the database_id from the output and update it in `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "humber-operations-db"
database_id = "YOUR_DATABASE_ID_HERE"  # <-- Update this
```

### 2.3 Initialize Database Schema
```bash
wrangler d1 execute humber-operations-db --local --file=./schema.sql
wrangler d1 execute humber-operations-db --remote --file=./schema.sql
```

### 2.4 Create KV Namespace
```bash
wrangler kv namespace create "KV_CACHE"
wrangler kv namespace create "KV_CACHE" --preview
```

Update the KV namespace ID in `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "KV_CACHE"
id = "YOUR_KV_NAMESPACE_ID"  # <-- Update this
```

### 2.5 Create Queue
```bash
wrangler queues create operations-queue
```

### 2.6 Create R2 Bucket
```bash
wrangler r2 bucket create humber-documents
```

## Step 3: Environment Configuration

Create a `.dev.vars` file in `apps/worker` for local development:
```env
ENVIRONMENT=development
```

## Step 4: Local Development

Start the worker in development mode:
```bash
cd apps/worker
pnpm dev
```

The API will be available at `http://localhost:8787`

## Step 5: Deploy to Production

### 5.1 Deploy to Staging First
```bash
cd apps/worker
wrangler deploy --env staging
```

### 5.2 Deploy to Production
```bash
wrangler deploy --env production
```

## API Documentation

### 📖 Complete API Documentation
Access the full interactive API documentation at: `http://localhost:8787/docs`

### 🔧 Core Endpoints

#### Health & Status
```bash
# Service information
curl http://localhost:8787/

# Health check
curl http://localhost:8787/health

# API documentation
curl http://localhost:8787/docs
```

### ⚙️ Operations Workflow

#### 1. Recruiting Step 1
```bash
curl -X POST http://localhost:8787/operations/recruiting-step-1 \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: test-tenant" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890"
  }'
```

#### 2. Hiring & Vetting Step 2
```bash
curl -X POST http://localhost:8787/operations/hiring-vetting-step-2 \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: test-tenant" \
  -d '{
    "candidateId": "cand_xxx",
    "interviewScore": 85,
    "technicalScore": 90,
    "culturalFitScore": 88,
    "decision": "proceed",
    "notes": "Strong technical skills"
  }'
```

#### 3. Background Checks
```bash
curl -X POST http://localhost:8787/operations/background-checks \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: test-tenant" \
  -d '{
    "candidateId": "cand_xxx",
    "drugTestCompleted": true,
    "drugTestResult": "pass",
    "backgroundCheckCompleted": true,
    "backgroundCheckResult": "clear",
    "certificationVerified": true,
    "ssnVerified": true
  }'
```

#### 4. Offer Letter & Visa
```bash
curl -X POST http://localhost:8787/operations/offer-letter-visa \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: test-tenant" \
  -d '{
    "candidateId": "cand_xxx",
    "offerAmount": 85000,
    "startDate": "2025-10-01",
    "position": "Senior Developer",
    "location": "Remote",
    "visaRequired": false
  }'
```

#### 5. Deployment
```bash
curl -X POST http://localhost:8787/operations/deployment \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: test-tenant" \
  -d '{
    "candidateId": "cand_xxx",
    "deploymentDate": "2025-10-01",
    "clientName": "Tech Corp",
    "projectName": "System Integration",
    "location": "Remote"
  }'
```

### 📊 Timesheet Management

#### Submit Individual Timesheet
```bash
curl -X POST http://localhost:8787/timesheets/reconcile \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: test-tenant" \
  -d '{
    "candidateId": "cand_xxx",
    "weekStartDate": "2025-01-06",
    "weekEndDate": "2025-01-12",
    "hoursWorked": 40.0,
    "status": "submitted"
  }'
```

#### Get Candidate Timesheets
```bash
curl -X GET http://localhost:8787/timesheets/candidate/cand_xxx \
  -H "X-Tenant-ID: test-tenant"
```

#### Get Timesheets by Period
```bash
curl -X GET "http://localhost:8787/timesheets/period?startDate=2025-01-01&endDate=2025-01-31" \
  -H "X-Tenant-ID: test-tenant"
```

### 🔄 Reconciliation System

#### Submit Reconciliation Data
```bash
curl -X POST http://localhost:8787/reconciliation/submit \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: test-tenant" \
  -d '{
    "candidateId": "cand_xxx",
    "weekStartDate": "2025-01-06",
    "weekEndDate": "2025-01-12",
    "hoursWorked": 40.0,
    "clientName": "Tech Corp"
  }'
```

#### Get Items Needing Review
```bash
curl -X GET http://localhost:8787/reconciliation/needs-review \
  -H "X-Tenant-ID: test-tenant"
```

#### Get Reconciliation Statistics
```bash
curl -X GET "http://localhost:8787/reconciliation/stats?startDate=2025-01-01&endDate=2025-01-31" \
  -H "X-Tenant-ID: test-tenant"
```

### 📋 Required Headers
All operations and timesheet endpoints require:
- `Content-Type: application/json`
- `X-Tenant-ID: your-tenant-id`

### 📝 Response Format
All endpoints return JSON responses with consistent structure:
```json
{
  "success": true,
  "candidateId": "cand_xxx",
  "message": "Operation completed successfully",
  "nextStep": "next-operation-name"
}
```

### ❌ Error Responses
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Troubleshooting

### If pnpm install fails:
1. Clear pnpm cache: `pnpm store prune`
2. Delete node_modules: `rm -rf node_modules apps/*/node_modules packages/*/node_modules`
3. Delete lock file: `rm pnpm-lock.yaml`
4. Try again: `pnpm install`

### If wrangler commands fail:
1. Ensure you're logged in: `wrangler whoami`
2. Check your account ID: `wrangler config`
3. Verify permissions in Cloudflare dashboard

## Next Steps

1. Configure production environment variables in Cloudflare dashboard
2. Set up custom domain (optional)
3. Configure monitoring and alerts
4. Implement authentication/authorization
5. Set up CI/CD pipeline

## Useful Commands

```bash
# View logs
wrangler tail

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format code
pnpm format
```