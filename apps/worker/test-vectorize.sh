#!/bin/bash

# Test script for local Vectorize functionality
# Run this after starting wrangler dev

API_URL="http://localhost:8787"

echo "🚀 Testing Local Vectorize Support for Knowledge Base"
echo "=================================================="
echo ""

# 1. Initialize the knowledge base
echo "1. Initializing Knowledge Base..."
curl -X POST "$API_URL/knowledge-base/initialize" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "2. Adding test documents to knowledge base..."

# Add engineering document
curl -X POST "$API_URL/knowledge-base/documents" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "PLC Programming Best Practices",
    "content": "When programming PLCs for automotive assembly lines, always use structured programming techniques. Implement proper error handling and recovery sequences. Document all logic clearly and use consistent naming conventions.",
    "category": "engineering",
    "tags": ["plc", "automation", "programming"]
  }' | jq '.'

# Add safety document  
curl -X POST "$API_URL/knowledge-base/documents" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lockout/Tagout Procedures",
    "content": "Before performing maintenance on any equipment, ensure proper lockout/tagout procedures are followed. Verify zero energy state before beginning work. Each worker must use their own lock and tag.",
    "category": "safety",
    "tags": ["safety", "lockout", "maintenance"]
  }' | jq '.'

# Add HR document
curl -X POST "$API_URL/knowledge-base/documents" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Remote Work Policy",
    "content": "Engineers may work remotely up to 2 days per week with manager approval. Core hours are 10 AM to 3 PM for collaboration. All remote work must comply with security policies.",
    "category": "hr",
    "tags": ["remote", "policy", "work-from-home"]
  }' | jq '.'

echo ""
echo "3. Testing semantic search..."
echo "   Query: 'How to program industrial controllers?'"

curl -X POST "$API_URL/knowledge-base/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How to program industrial controllers?",
    "limit": 5
  }' | jq '.'

echo ""
echo "4. Testing filtered search..."
echo "   Query: 'safety procedures' (category: safety)"

curl -X POST "$API_URL/knowledge-base/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "safety procedures",
    "limit": 5,
    "filter": {
      "category": "safety"
    }
  }' | jq '.'

echo ""
echo "5. Testing bulk import..."

curl -X POST "$API_URL/knowledge-base/bulk-import" \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "title": "ISO 9001 Compliance",
        "content": "Quality management system requirements for ISO 9001 certification.",
        "category": "compliance",
        "tags": ["iso", "quality", "certification"]
      },
      {
        "title": "Project Time Tracking",
        "content": "All billable hours must be logged daily with appropriate project codes.",
        "category": "operations",
        "tags": ["timesheet", "billing", "tracking"]
      }
    ]
  }' | jq '.'

echo ""
echo "✅ Vectorize local testing complete!"
echo ""
echo "Note: In local mode, vectors are stored in memory and will reset on restart."
echo "For production, deploy to Cloudflare Workers with: wrangler deploy"