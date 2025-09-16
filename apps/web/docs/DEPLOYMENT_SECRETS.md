# Production Deployment Secrets Configuration

## Required Environment Variables

### GitHub Actions Secrets

Add these secrets to your GitHub repository settings under Settings → Secrets → Actions:

#### Vercel Deployment
- `VERCEL_TOKEN`: Your Vercel API token (get from https://vercel.com/account/tokens)
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

To get Vercel IDs:
```bash
npx vercel link
cat .vercel/project.json
```

#### Cloudflare Workers Deployment
- `CLOUDFLARE_API_TOKEN`: Create at https://dash.cloudflare.com/profile/api-tokens
  - Required permissions: Workers Scripts:Edit, D1:Edit, KV Storage:Edit, R2:Edit
- `CLOUDFLARE_ACCOUNT_ID`: Found in Cloudflare dashboard right sidebar

### Vercel Environment Variables

Set these in your Vercel project settings:

#### Authentication
- `AUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Your production URL (e.g., https://your-domain.vercel.app)

#### Database
- `DATABASE_URL`: Your production database connection string

#### Monitoring (Optional)
- `NEXT_PUBLIC_SENTRY_DSN`: Sentry error tracking DSN
- `VERCEL_ANALYTICS_ID`: Vercel Analytics ID

### Cloudflare Workers Secrets

Set using wrangler CLI:

```bash
# Set JWT secret for API authentication
wrangler secret put JWT_SECRET --env production

# Set database connection
wrangler secret put DATABASE_URL --env production

# Set encryption key for sensitive data
wrangler secret put ENCRYPTION_KEY --env production

# Set OAuth client secret if using OAuth
wrangler secret put OAUTH_CLIENT_SECRET --env production
```

### Local Development Secrets

Create `.env.local` files in each app:

#### apps/web/.env.local
```env
AUTH_SECRET=your-dev-secret-here
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=your-dev-database-url
NEXT_PUBLIC_API_URL=http://localhost:8787
```

#### apps/worker/.dev.vars
```env
JWT_SECRET=your-dev-jwt-secret
DATABASE_URL=your-dev-database-url
ENCRYPTION_KEY=your-dev-encryption-key
```

## Security Best Practices

1. **Never commit secrets to version control**
   - Add `.env.local` and `.dev.vars` to `.gitignore`
   - Use environment-specific secret management

2. **Rotate secrets regularly**
   - Set up automated rotation for critical secrets
   - Monitor for exposed secrets using GitHub secret scanning

3. **Use least privilege principle**
   - Create API tokens with minimal required permissions
   - Use separate credentials for different environments

4. **Enable audit logging**
   - Track secret access in production
   - Monitor for unauthorized access attempts

## Deployment Checklist

Before deploying to production:

- [ ] All GitHub Actions secrets configured
- [ ] Vercel environment variables set
- [ ] Cloudflare Workers secrets deployed
- [ ] Database migrations tested
- [ ] SSL certificates configured
- [ ] CORS origins updated
- [ ] Rate limiting configured
- [ ] Monitoring dashboards set up
- [ ] Backup strategy in place
- [ ] Rollback procedure documented