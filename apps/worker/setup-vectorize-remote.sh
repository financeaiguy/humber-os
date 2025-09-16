#!/bin/bash

echo "🚀 Setting up Cloudflare Vectorize for Remote Development"
echo "=========================================================="
echo ""

# Check if logged in to Cloudflare
echo "1. Checking Cloudflare authentication..."
npx wrangler whoami

echo ""
echo "2. Creating Vectorize index (if not exists)..."
echo "   Note: This creates a real Vectorize index in your Cloudflare account"

# Create the Vectorize index with proper dimensions for BGE embeddings
npx wrangler vectorize create humber-knowledge-base \
  --dimensions 384 \
  --metric cosine \
  --description "Knowledge base for Humber Operations"

echo ""
echo "3. Listing your Vectorize indexes..."
npx wrangler vectorize list

echo ""
echo "✅ Setup complete!"
echo ""
echo "Your Vectorize index is now available for remote development."
echo "The 'remote = true' flag in wrangler.toml will connect to this real index."
echo ""
echo "To test the connection, restart your worker:"
echo "  pnpm dev"
echo ""
echo "Note: Using remote bindings may incur costs on your Cloudflare account."