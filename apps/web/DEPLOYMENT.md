# Humber OS - Deployment Guide

## Environment Configuration

### Local Development
- Copy `.env.example` to `.env.local`
- Update values for local development
- Server runs on `http://localhost:3000`

### Environment Files Structure
```
.env.example          # Template with all available variables
.env.local            # Local development (gitignored)
.env.production       # Production values (used by CI/CD)
```

## Deployment Commands

### Development Deployment
```bash
npm run deploy:dev
```
Deploys to: `humber-nextjs-app-dev.pages.dev`

### Production Deployment
```bash
npm run deploy:prod
```
Deploys to: `humber-nextjs-app.pages.dev`

### Local Preview
```bash
npm run preview:local
```
Preview built pages locally using Wrangler

## Wrangler Configuration

### Environment Structure
- `development`: Development environment with local URLs
- `production`: Production environment with live URLs

### Commands
```bash
# Check wrangler status
npx wrangler whoami

# List pages projects
npx wrangler pages project list

# Deploy manually
npx wrangler pages deploy .vercel/output/static --env production
```

## Build Process

1. **Build**: `npm run build` - Next.js builds the application
2. **Pages Build**: `npm run build:pages` - Converts to Cloudflare Pages format
3. **Deploy**: Wrangler uploads to Cloudflare Pages

## Environment Variables

### Required for Production
- `AUTH_SECRET`: NextAuth encryption key
- `NEXTAUTH_SECRET`: NextAuth session secret
- `NEXTAUTH_URL`: Full URL of deployed app
- `NEXT_PUBLIC_API_URL`: Worker API endpoint
- `NEXT_PUBLIC_TENANT_ID`: Tenant identifier

### Optional
- `ENVIRONMENT`: production/development
- `API_VERSION`: API version number

## Security Notes

- All `.env*` files are gitignored except `.env.example`
- Production secrets are managed via Wrangler environment variables
- Never commit actual API keys or secrets to git