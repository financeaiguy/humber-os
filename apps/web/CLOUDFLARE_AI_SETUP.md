# Cloudflare Workers AI Setup Guide

## Quick Setup Steps

### 1. Get Your Cloudflare Account ID
1. Log into your Cloudflare dashboard
2. Look at the right sidebar - your Account ID is displayed there
3. Copy the Account ID (format: `1234567890abcdef1234567890abcdef`)

### 2. Create an API Token
1. Go to [Cloudflare Dashboard → My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Custom token" template
4. Set the following:
   - **Token name**: `Humber AI Analysis`
   - **Permissions**: `Account:Cloudflare Workers AI:Edit`
   - **Account Resources**: Include your account
   - **Zone Resources**: Not needed
   - **Client IP Address Filtering**: Not needed (leave blank)
   - **TTL**: Not needed (leave blank)
5. Click "Continue to summary" then "Create Token"
6. Copy the token (format: `abcdef1234567890_1234567890abcdef1234567890`)

### 3. Update Your Environment Variables
Edit `/apps/web/.env.local` and replace:
- `NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id-here`
- `CLOUDFLARE_API_TOKEN=your-cloudflare-api-token-here`

With your actual values.

### 4. Restart Your Development Server
```bash
# Stop the current dev server (Ctrl+C)
cd /Users/justinmeyers/Documents/Cursor/humber-os-ai/apps/web
PORT=3000 npm run dev
```

## Testing the Setup
1. Go to http://localhost:3000/time
2. Click "Clock In"
3. Take a photo
4. The AI analysis should now work without the "credentials not configured" error

## Troubleshooting
- Make sure the Account ID and API Token are copied exactly (no extra spaces)
- The API Token should have `Account:Cloudflare Workers AI:Edit` permission
- Restart your development server after updating environment variables