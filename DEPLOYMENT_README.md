# Humber Operations - Cloudflare Deployment Guide

## System Architecture

This is a multi-tenant staffing automation system deployed on Cloudflare's edge infrastructure:

- **Frontend**: Next.js 15 app deployed as Cloudflare Workers (static site)
- **Backend**: Cloudflare Workers with TypeScript
- **Database**: Multiple Cloudflare D1 databases (multi-tenant)
- **Storage**: R2 buckets for documents and assets
- **AI**: Cloudflare Workers AI + Vectorize for knowledge base
- **Cache**: KV namespaces for sessions and caching
- **Queues**: Background processing for operations

## Project Structure

```
humber-os-ai/
├── apps/
│   ├── web/                 # Next.js frontend (Cloudflare Workers)
│   └── worker/              # Cloudflare Worker backend
├── packages/
│   ├── types/               # Shared TypeScript types
│   └── utils/               # Shared utilities
└── turbo.json              # Turborepo configuration
```

## Prerequisites

- Node.js 20+ with pnpm 9+
- Cloudflare account with Workers Paid plan
- Wrangler CLI v4.37+

## Environment Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Authenticate with Cloudflare

```bash
npx wrangler login
```

### 3. Environment Configuration

The project uses multiple environments configured in `wrangler.toml` files:

- **Development**: Local development with remote Cloudflare resources
- **Staging**: Pre-production environment
- **Production**: Live production environment

## Database Setup

### D1 Databases (Multi-tenant Architecture)

The system uses multiple D1 databases for tenant isolation:

1. **Master Database**: Tracks tenant assignments and system configuration
2. **Tenant Databases**: Individual databases per engineer/tenant (001-010)

#### Create Databases

```bash
# Master database
npx wrangler d1 create humber_os_master

# Tenant databases (repeat for each tenant 001-010)
npx wrangler d1 create humber-tenant-001
npx wrangler d1 create humber-tenant-002
# ... up to humber-tenant-010
```

#### Apply Schema Migrations

```bash
# Apply to master database
npx wrangler d1 execute humber_os_master --file=./schema/master.sql --env production

# Apply to each tenant database
npx wrangler d1 execute humber-tenant-001 --file=./schema/tenant.sql --env production
```

## Storage Setup

### R2 Buckets

```bash
# Create document storage
npx wrangler r2 bucket create humber-documents

# Create asset storage
npx wrangler r2 bucket create humber-web-assets
```

### KV Namespaces

```bash
# Create cache namespace
npx wrangler kv:namespace create "KV_CACHE"

# Create sessions namespace
npx wrangler kv:namespace create "KV_SESSIONS"

# Create tenant cache namespace
npx wrangler kv:namespace create "KV_TENANT_CACHE"
```

### Vectorize Index

```bash
# Create AI knowledge base index
npx wrangler vectorize create humber-knowledge-base --dimensions=1536 --metric=cosine
```

### Queue Setup

```bash
# Create processing queues
npx wrangler queues create humber-operations-queue
npx wrangler queues create humber-reconciliation-queue
npx wrangler queues create humber-tenant-audit-logs
npx wrangler queues create humber-background-checks
npx wrangler queues create humber-visa-processing
```

## Secrets Management

Set production secrets using Wrangler:

```bash
# Backend Worker secrets
npx wrangler secret put JWT_SECRET --env production
npx wrangler secret put REFRESH_SECRET --env production
npx wrangler secret put API_KEY --env production

# Additional secrets as needed
npx wrangler secret put SENDGRID_API_KEY --env production
npx wrangler secret put TWILIO_AUTH_TOKEN --env production
```

## Deployment Commands

### Backend Worker Deployment

```bash
# Deploy to development
cd apps/worker
npx wrangler deploy --env development

# Deploy to production
cd apps/worker
npx wrangler deploy --env production
```

### Frontend Deployment

The frontend deploys as a Cloudflare Worker with static site support using `@cloudflare/next-on-pages`:

```bash
# Build and deploy frontend as Worker
cd apps/web
npm run build:cf
npx wrangler deploy --env production
```

Or use the combined command:

```bash
cd apps/web
npm run deploy:worker
```

The `wrangler.toml` is configured with:
- `main = ".vercel/output/static/_worker.js/index.js"`
- `[site] bucket = ".vercel/output/static"`

## Environment Variables

### Frontend (Next.js)

Set in `wrangler.toml` under `[env.production.vars]`:

```toml
NEXT_PUBLIC_API_URL = "https://humber-operations-worker-prod.evafiai.workers.dev"
NEXT_PUBLIC_TENANT_ID = "tenant-001"
ENVIRONMENT = "production"
```

### Backend (Worker)

Configure in `apps/worker/wrangler.toml`:

```toml
[env.production.vars]
ENVIRONMENT = "production"
API_VERSION = "1.0.0"
LOG_LEVEL = "warn"
```

## Development Workflow

### Local Development

```bash
# Start all services
pnpm dev

# Or start individually
cd apps/web && pnpm dev          # Frontend on localhost:3000
cd apps/worker && npx wrangler dev # Worker on localhost:8787
```

### Testing

```bash
# Run type checks
pnpm typecheck

# Run linting
pnpm lint

# Run build to verify
pnpm build
```

### Database Migrations

```bash
# Apply migrations to development
npx wrangler d1 execute DB_NAME --file=./migrations/001_init.sql --env development

# Apply to production
npx wrangler d1 execute DB_NAME --file=./migrations/001_init.sql --env production
```

## Monitoring & Debugging

### Worker Logs

```bash
# View real-time logs
npx wrangler tail --env production

# View specific worker logs
npx wrangler tail humber-operations-worker-prod
```

### Database Queries

```bash
# Query development database
npx wrangler d1 execute humber_os_master --command="SELECT * FROM tenants;" --env development

# Query production database
npx wrangler d1 execute humber_os_master --command="SELECT * FROM tenants;" --env production
```

### Analytics

Monitor performance in Cloudflare Dashboard:
- Workers Analytics (both frontend and backend)
- R2 Usage
- D1 Metrics
- Site Analytics

## Troubleshooting

### Common Issues

1. **Build Failures**: Check TypeScript errors with `pnpm typecheck`
2. **Database Connection**: Verify database IDs in `wrangler.toml`
3. **Authentication**: Ensure secrets are properly set
4. **CORS Issues**: Check API endpoint configuration

### Resource Limits

- **Workers**: 10ms CPU time per request (paid plan)
- **D1**: 25 million row reads per day
- **R2**: Unlimited storage with usage-based pricing
- **KV**: 100 namespace limit

## Production Checklist

- [ ] All databases created and migrated
- [ ] R2 buckets configured
- [ ] KV namespaces created
- [ ] Vectorize index initialized
- [ ] Production secrets set
- [ ] Custom domain configured (if needed)
- [ ] Analytics enabled
- [ ] Backup strategy implemented

## Security Considerations

- JWT secrets are environment-specific
- Database isolation per tenant
- API key authentication
- CORS properly configured
- No sensitive data in logs

## Support

For deployment issues:
1. Check Cloudflare Dashboard for error details
2. Review Wrangler logs: `npx wrangler tail`
3. Verify resource quotas and limits
4. Check billing status for paid features