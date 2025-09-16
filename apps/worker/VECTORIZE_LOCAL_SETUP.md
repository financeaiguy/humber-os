# Local Vectorize Setup Guide

## Overview
Cloudflare Vectorize now supports local development with experimental features enabled. This allows you to test vector search functionality locally before deploying to production.

## Setup Instructions

### 1. Enable Experimental Local Support
Already configured in `wrangler.toml`:
```toml
[dev]
experimental_local = true
```

### 2. Start the Worker with Vectorize
```bash
cd apps/worker
pnpm dev
```

You should see in the output:
- `env.VECTORIZE_INDEX (humber-knowledge-base)` with status `local`

### 3. Initialize the Knowledge Base
Run the migration to create D1 tables:
```bash
pnpm migrate:local
```

### 4. Test Vector Operations
Use the provided test script:
```bash
./test-vectorize.sh
```

## API Endpoints

### Initialize Vector Index
```bash
POST /knowledge-base/initialize
```

### Add Document
```bash
POST /knowledge-base/documents
{
  "title": "Document Title",
  "content": "Document content for vector embedding",
  "category": "engineering",
  "tags": ["tag1", "tag2"]
}
```

### Semantic Search
```bash
POST /knowledge-base/search
{
  "query": "Your search query",
  "limit": 10,
  "filter": {
    "category": "engineering"
  }
}
```

### Find Similar Documents
```bash
GET /knowledge-base/documents/:id/similar?limit=5
```

### Bulk Import
```bash
POST /knowledge-base/bulk-import
{
  "documents": [...]
}
```

## Important Notes

### Local Development Limitations
1. **Memory Storage**: Vectors are stored in memory and will reset when the worker restarts
2. **No Persistence**: Use D1 database for persistent document storage
3. **Limited Scale**: Local mode is for testing only, not suitable for large datasets

### Production Deployment
1. Create a Vectorize index in Cloudflare dashboard:
   ```bash
   npx wrangler vectorize create humber-knowledge-base --dimensions 384 --metric cosine
   ```

2. Deploy the worker:
   ```bash
   pnpm deploy
   ```

### Embedding Model
We use `@cf/baai/bge-base-en-v1.5` which produces 384-dimension vectors optimized for semantic search.

## Troubleshooting

### "Vectorize not supported" Error
- Ensure you're using the latest version of Wrangler (4.0+)
- Check that `experimental_local = true` is set in wrangler.toml
- Restart the dev server

### Vectors Not Persisting
- This is expected in local mode
- Use the bulk import endpoint to re-seed data after restart
- In production, vectors persist in Cloudflare's infrastructure

### Search Not Returning Results
- Verify documents were added successfully
- Check that AI binding is available for embedding generation
- Ensure query text is meaningful and related to indexed content

## Example Use Cases

1. **Engineering Documentation**: Store and search technical specifications, procedures, and standards
2. **Safety Protocols**: Quick access to safety procedures based on context
3. **HR Policies**: Semantic search for policy documents
4. **Compliance Requirements**: Find relevant compliance information quickly
5. **Operational Procedures**: Context-aware retrieval of operational guidelines

## Testing Semantic Search

The vector search uses cosine similarity to find semantically related documents. For example:
- Query: "How to program controllers?" → Returns PLC programming documents
- Query: "Safety procedures" → Returns lockout/tagout and emergency protocols
- Query: "Remote work" → Returns HR policies and work-from-home guidelines

## Next Steps

1. Add more domain-specific documents to the knowledge base
2. Fine-tune search relevance with metadata filtering
3. Implement feedback loops to improve search quality
4. Add authentication and access control for production
5. Set up regular content updates and maintenance