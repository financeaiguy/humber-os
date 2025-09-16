# Humber Operations - Production Deployment Guide

## Prerequisites

- Node.js 20.x
- pnpm 9.x
- Vercel account
- Cloudflare account with Workers plan
- GitHub repository

## Initial Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Build and Test Locally

```bash
# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint

# Build all packages
pnpm build
```

## Cloudflare Workers Setup

### 1. Login to Cloudflare

```bash
wrangler login
```

### 2. Create Production Resources

```bash
cd apps/worker
./scripts/setup-production-db.sh
```

### 3. Update Configuration

After running the setup script, update `wrangler.production.toml` with the generated IDs:

```bash
# Get D1 database IDs
wrangler d1 list

# Get KV namespace IDs
wrangler kv:namespace list
```

### 4. Set Production Secrets

```bash
# Set all required secrets
wrangler secret put JWT_SECRET --env production
wrangler secret put DATABASE_URL --env production
wrangler secret put ENCRYPTION_KEY --env production
```

### 5. Deploy Worker

```bash
wrangler deploy --env production
```

## Vercel Deployment

### 1. Link Project

```bash
cd apps/web
npx vercel link
```

### 2. Set Environment Variables

Go to [Vercel Dashboard](https://vercel.com) and set:

- `AUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your production URL
- `NEXT_PUBLIC_API_URL` - Your Cloudflare Worker URL
- `DATABASE_URL` - Production database connection

### 3. Deploy

```bash
npx vercel --prod
```

## GitHub Actions Setup

### 1. Add Repository Secrets

Go to Settings → Secrets → Actions and add:

**Vercel:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

**Cloudflare:**
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### 2. Enable Actions

Push to main branch to trigger deployment:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

## Post-Deployment Checklist

### Verification

- [ ] Health check endpoint responding: `https://your-domain.vercel.app/api/health`
- [ ] Worker API responding: `https://api.your-domain.workers.dev/health`
- [ ] Authentication working
- [ ] Database queries functioning
- [ ] File uploads to R2 working

### Monitoring

1. **Application Monitoring**
   - Check Vercel Analytics dashboard
   - Monitor error rates in logs
   - Set up uptime monitoring

2. **Database Monitoring**
   - Check D1 metrics in Cloudflare dashboard
   - Monitor query performance
   - Set up backup schedule

3. **Security**
   - Verify CORS settings
   - Check rate limiting
   - Review authentication logs
   - Enable Cloudflare DDoS protection

### Performance

1. **Optimize Images**
   ```bash
   # Verify Next.js image optimization
   npm run analyze
   ```

2. **Enable Caching**
   - Configure Cloudflare caching rules
   - Set appropriate Cache-Control headers
   - Enable Vercel Edge caching

3. **Database Optimization**
   - Create necessary indexes
   - Enable query result caching
   - Monitor slow queries

## Rollback Procedure

### Quick Rollback

1. **Vercel:**
   ```bash
   vercel rollback
   ```

2. **Cloudflare Workers:**
   ```bash
   wrangler rollback --env production
   ```

### Database Rollback

```bash
# List migrations
wrangler d1 migrations list humber-operations --env production

# Create rollback migration
wrangler d1 migrations create humber-operations rollback_description
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (must be 20.x)
   - Clear cache: `pnpm store prune`
   - Rebuild: `pnpm rebuild`

2. **Authentication Issues**
   - Verify AUTH_SECRET is set correctly
   - Check NEXTAUTH_URL matches production URL
   - Ensure cookies are configured for production domain

3. **API Connection Issues**
   - Verify CORS settings in worker
   - Check API URL in environment variables
   - Ensure worker is deployed and running

4. **Database Issues**
   - Verify D1 database is created
   - Check migrations are applied
   - Ensure connection string is correct

### Debug Commands

```bash
# Check worker logs
wrangler tail --env production

# Check deployment status
vercel inspect

# Test API endpoint
curl https://api.your-domain.workers.dev/health

# Check DNS propagation
dig api.your-domain.workers.dev
```

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check health endpoints
- Review performance metrics

**Weekly:**
- Review security alerts
- Update dependencies (security patches)
- Backup database

**Monthly:**
- Full dependency update
- Performance audit
- Security audit
- Cost review

### Update Procedure

1. **Test Updates Locally**
   ```bash
   pnpm update --interactive
   pnpm test
   pnpm build
   ```

2. **Deploy to Staging**
   ```bash
   git checkout staging
   git merge feature-branch
   git push origin staging
   ```

3. **Deploy to Production**
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

## Support

For issues or questions:
1. Check logs in Vercel and Cloudflare dashboards
2. Review error tracking in monitoring tools
3. Contact team lead for infrastructure access
4. File issues in GitHub repository