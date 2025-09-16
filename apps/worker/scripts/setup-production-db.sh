#!/bin/bash

# Humber Operations - Production Database Setup Script
# This script sets up Cloudflare D1 databases for production

set -e

echo "🚀 Setting up Humber Operations production databases..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare. Please run:"
    echo "wrangler login"
    exit 1
fi

echo "📦 Creating D1 databases..."

# Create main operations database
echo "Creating main operations database..."
wrangler d1 create humber-operations-production --experimental-backend || echo "Database may already exist"

# Create master tenant database
echo "Creating master tenant database..."
wrangler d1 create humber-operations-master-production --experimental-backend || echo "Database may already exist"

echo "🔄 Running migrations..."

# Apply migrations to main database
echo "Applying migrations to main database..."
wrangler d1 migrations apply humber-operations-production --local=false

# Apply migrations to master database
echo "Applying migrations to master database..."
wrangler d1 migrations apply humber-operations-master-production --local=false

echo "🔑 Creating KV namespaces..."

# Create KV namespaces
wrangler kv:namespace create "cache_production" || echo "Namespace may already exist"
wrangler kv:namespace create "tenant_cache_production" || echo "Namespace may already exist"
wrangler kv:namespace create "sessions_production" || echo "Namespace may already exist"

echo "🪣 Creating R2 buckets..."

# Create R2 bucket for documents
wrangler r2 bucket create humber-documents-production || echo "Bucket may already exist"

echo "📨 Creating Queues..."

# Create production queues
wrangler queues create operations-production || echo "Queue may already exist"
wrangler queues create reconciliation-production || echo "Queue may already exist"

echo "🔍 Creating Vectorize index..."

# Create Vectorize index for document embeddings
wrangler vectorize create humber-documents-embeddings \
  --dimensions=1536 \
  --metric=cosine \
  --preset=openai-text-embedding-3-small || echo "Index may already exist"

echo "✅ Production database setup complete!"
echo ""
echo "Next steps:"
echo "1. Update wrangler.production.toml with the IDs from the created resources"
echo "2. Run 'wrangler d1 info <database-name>' to get database IDs"
echo "3. Run 'wrangler kv:namespace list' to get KV namespace IDs"
echo "4. Set production secrets using 'wrangler secret put <SECRET_NAME> --env production'"