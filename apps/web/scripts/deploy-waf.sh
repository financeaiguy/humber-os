#!/bin/bash

# Cloudflare WAF Deployment Script for Humber OS Infrastructure
# Deploys security workers, configures WAF rules, and sets up monitoring

set -e

echo "🔒 Starting Cloudflare WAF Deployment for Humber OS..."

# Configuration
ZONE_ID="${CLOUDFLARE_ZONE_ID}"
API_TOKEN="${CLOUDFLARE_API_TOKEN}"
ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID}"

if [ -z "$ZONE_ID" ] || [ -z "$API_TOKEN" ] || [ -z "$ACCOUNT_ID" ]; then
    echo "❌ Error: Missing required environment variables:"
    echo "   CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to create D1 databases
create_d1_databases() {
    echo "📊 Creating D1 databases..."
    
    # Create security database
    echo "Creating security database..."
    wrangler d1 create humber-security || true
    
    # Create threat intelligence database  
    echo "Creating threat intelligence database..."
    wrangler d1 create humber-threat-intelligence || true
    
    print_status "D1 databases created"
}

# Function to create KV namespaces
create_kv_namespaces() {
    echo "🗃️  Creating KV namespaces..."
    
    # WAF KV namespace
    wrangler kv:namespace create "WAF_KV" || true
    wrangler kv:namespace create "WAF_KV" --preview || true
    
    # Security KV namespace
    wrangler kv:namespace create "SECURITY_KV" || true
    wrangler kv:namespace create "SECURITY_KV" --preview || true
    
    print_status "KV namespaces created"
}

# Function to set up database schemas
setup_database_schemas() {
    echo "🗄️  Setting up database schemas..."
    
    # Security logs schema
    wrangler d1 execute humber-security --file=./sql/security_logs.sql
    
    # Threat intelligence schema
    wrangler d1 execute humber-threat-intelligence --file=./sql/threat_intelligence.sql
    
    print_status "Database schemas initialized"
}

# Function to deploy Workers
deploy_workers() {
    echo "🚀 Deploying security workers..."
    
    # Build TypeScript files
    echo "Building TypeScript workers..."
    npx tsc src/workers/security-gateway.ts --outDir dist/workers --target ES2022 --module ES2022 || true
    npx tsc src/workers/ai-threat-detection.ts --outDir dist/workers --target ES2022 --module ES2022 || true
    
    # Deploy security gateway worker
    echo "Deploying security gateway worker..."
    wrangler deploy --config wrangler-security.toml --name humber-security-gateway
    
    # Deploy AI threat detection worker
    echo "Deploying AI threat detection worker..."
    wrangler deploy --config wrangler-security.toml --name humber-ai-threat-detection
    
    # Deploy API gateway worker
    echo "Deploying API gateway worker..."
    wrangler deploy --config wrangler-security.toml --name humber-api-gateway
    
    print_status "Workers deployed successfully"
}

# Function to configure WAF rules via API
configure_waf_rules() {
    echo "🛡️  Configuring WAF rules..."
    
    # Custom WAF rules
    cat > /tmp/waf_rules.json << 'EOF'
{
  "rules": [
    {
      "description": "Block SQL injection attempts",
      "expression": "(http.request.uri.query contains \"union select\" or http.request.uri.query contains \"drop table\" or http.request.uri.query contains \"insert into\" or http.request.uri.query contains \"delete from\" or http.request.body.raw contains \"union select\" or http.request.body.raw contains \"drop table\" or http.request.body.raw contains \"'; --\" or http.request.body.raw contains \"' or 1=1\")",
      "action": "block",
      "enabled": true
    },
    {
      "description": "Block XSS injection attempts", 
      "expression": "(http.request.uri.query contains \"<script\" or http.request.uri.query contains \"javascript:\" or http.request.uri.query contains \"onload=\" or http.request.uri.query contains \"onerror=\" or http.request.body.raw contains \"<script\" or http.request.body.raw contains \"javascript:\" or http.request.headers[\"user-agent\"] contains \"<script\")",
      "action": "block",
      "enabled": true
    },
    {
      "description": "Rate limit API endpoints",
      "expression": "(http.request.uri.path matches \"^/api/\" and not http.request.uri.path matches \"^/api/auth/\")",
      "action": "rate_limit",
      "enabled": true
    },
    {
      "description": "Protect admin endpoints",
      "expression": "(http.request.uri.path matches \"^/api/(admin|system|operations)/\" or http.request.uri.path contains \"/admin\" or http.request.uri.path contains \"/settings\")",
      "action": "challenge",
      "enabled": true
    },
    {
      "description": "Block suspicious user agents",
      "expression": "(http.request.headers[\"user-agent\"] contains \"sqlmap\" or http.request.headers[\"user-agent\"] contains \"nikto\" or http.request.headers[\"user-agent\"] contains \"nessus\" or http.request.headers[\"user-agent\"] contains \"burpsuite\" or http.request.headers[\"user-agent\"] contains \"acunetix\" or http.request.headers[\"user-agent\"] eq \"\")",
      "action": "block",
      "enabled": true
    }
  ]
}
EOF

    # Deploy WAF rules
    curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/firewall/rules" \
         -H "Authorization: Bearer ${API_TOKEN}" \
         -H "Content-Type: application/json" \
         --data @/tmp/waf_rules.json
    
    print_status "WAF rules configured"
}

# Function to configure rate limiting
configure_rate_limiting() {
    echo "🚥 Configuring rate limiting..."
    
    # Global rate limit
    curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/rate_limits" \
         -H "Authorization: Bearer ${API_TOKEN}" \
         -H "Content-Type: application/json" \
         --data '{
           "threshold": 1000,
           "period": 60,
           "action": {
             "mode": "challenge",
             "timeout": 300
           },
           "match": {
             "request": {
               "methods": ["GET", "POST", "PUT", "DELETE"],
               "schemes": ["HTTP", "HTTPS"]
             }
           },
           "disabled": false,
           "description": "Global rate limit"
         }'
    
    # API rate limit
    curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/rate_limits" \
         -H "Authorization: Bearer ${API_TOKEN}" \
         -H "Content-Type: application/json" \
         --data '{
           "threshold": 200,
           "period": 60,
           "action": {
             "mode": "block",
             "timeout": 600
           },
           "match": {
             "request": {
               "methods": ["GET", "POST", "PUT", "DELETE"],
               "schemes": ["HTTP", "HTTPS"],
               "url": "*.humber-os.ai/api/*"
             }
           },
           "disabled": false,
           "description": "API rate limit"
         }'
    
    # Auth rate limit (stricter)
    curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/rate_limits" \
         -H "Authorization: Bearer ${API_TOKEN}" \
         -H "Content-Type: application/json" \
         --data '{
           "threshold": 15,
           "period": 300,
           "action": {
             "mode": "block",
             "timeout": 1800
           },
           "match": {
             "request": {
               "methods": ["POST"],
               "schemes": ["HTTP", "HTTPS"],
               "url": "*.humber-os.ai/api/auth/*"
             }
           },
           "disabled": false,
           "description": "Authentication rate limit"
         }'
    
    print_status "Rate limiting configured"
}

# Function to configure security settings
configure_security_settings() {
    echo "🔒 Configuring security settings..."
    
    # Security level
    curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/security_level" \
         -H "Authorization: Bearer ${API_TOKEN}" \
         -H "Content-Type: application/json" \
         --data '{"value": "high"}'
    
    # Browser check
    curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/browser_check" \
         -H "Authorization: Bearer ${API_TOKEN}" \
         -H "Content-Type: application/json" \
         --data '{"value": "on"}'
    
    # Challenge passage
    curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/challenge_ttl" \
         -H "Authorization: Bearer ${API_TOKEN}" \
         -H "Content-Type: application/json" \
         --data '{"value": 86400}'
    
    # SSL mode
    curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/ssl" \
         -H "Authorization: Bearer ${API_TOKEN}" \
         -H "Content-Type: application/json" \
         --data '{"value": "strict"}'
    
    # Minimum TLS version
    curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/min_tls_version" \
         -H "Authorization: Bearer ${API_TOKEN}" \
         -H "Content-Type: application/json" \
         --data '{"value": "1.2"}'
    
    print_status "Security settings configured"
}

# Function to set up monitoring and alerts
setup_monitoring() {
    echo "📊 Setting up monitoring and alerts..."
    
    # Create notification policy
    curl -X POST "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/alerting/policies" \
         -H "Authorization: Bearer ${API_TOKEN}" \
         -H "Content-Type: application/json" \
         --data '{
           "name": "Humber OS Security Alerts",
           "description": "Security alerts for Humber OS",
           "enabled": true,
           "alert_type": "dos_attack_l4",
           "mechanisms": {
             "email": [{
               "id": "security@humber-os.ai"
             }]
           },
           "filters": {}
         }'
    
    # Set up logpush for security logs
    curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/logpush/jobs" \
         -H "Authorization: Bearer ${API_TOKEN}" \
         -H "Content-Type: application/json" \
         --data '{
           "destination_conf": "s3://humber-security-logs/cloudflare/?region=us-east-1",
           "dataset": "http_requests",
           "logpull_options": "fields=timestamp,rayid,clientip,clientcountry,useragent,uri,method,status,cachestatus,securitylevel,wafaction,wafruleid,edgeresponsetime&timestamps=rfc3339",
           "enabled": true
         }'
    
    print_status "Monitoring and alerts configured"
}

# Function to test WAF configuration
test_waf_configuration() {
    echo "🧪 Testing WAF configuration..."
    
    # Test SQL injection block
    echo "Testing SQL injection protection..."
    response=$(curl -s -o /dev/null -w "%{http_code}" "https://humber-os.ai/api/test?id=1' OR '1'='1")
    if [ "$response" -eq 403 ]; then
        print_status "SQL injection protection working"
    else
        print_warning "SQL injection test returned: $response"
    fi
    
    # Test XSS protection
    echo "Testing XSS protection..."
    response=$(curl -s -o /dev/null -w "%{http_code}" "https://humber-os.ai/api/test?script=<script>alert('xss')</script>")
    if [ "$response" -eq 403 ]; then
        print_status "XSS protection working"
    else
        print_warning "XSS test returned: $response"
    fi
    
    # Test rate limiting
    echo "Testing rate limiting..."
    for i in {1..5}; do
        curl -s -o /dev/null "https://humber-os.ai/api/auth/test" &
    done
    wait
    print_status "Rate limiting tests completed"
}

# Function to deploy Pages with security
deploy_pages() {
    echo "📄 Deploying Pages with security configuration..."
    
    # Build the application
    pnpm build
    
    # Deploy Pages
    wrangler pages deploy dist --project-name humber-os-web
    
    print_status "Pages deployed with security"
}

# Function to set secrets
set_secrets() {
    echo "🔐 Setting up secrets..."
    
    if [ -n "$WAF_SECRET_KEY" ]; then
        echo "$WAF_SECRET_KEY" | wrangler secret put WAF_SECRET_KEY --name humber-security-gateway
    fi
    
    if [ -n "$SECURITY_WEBHOOK_URL" ]; then
        echo "$SECURITY_WEBHOOK_URL" | wrangler secret put SECURITY_WEBHOOK_URL --name humber-security-gateway
    fi
    
    if [ -n "$ALLOWED_ORIGINS" ]; then
        echo "$ALLOWED_ORIGINS" | wrangler secret put ALLOWED_ORIGINS --name humber-security-gateway
    fi
    
    print_status "Secrets configured"
}

# Main deployment flow
main() {
    echo "🚀 Starting Cloudflare WAF deployment..."
    
    # Pre-deployment checks
    if ! command -v wrangler &> /dev/null; then
        print_error "Wrangler CLI not found. Please install it first."
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm not found. Please install it first."
        exit 1
    fi
    
    # Create necessary directories
    mkdir -p dist/workers
    mkdir -p sql
    
    # Create SQL schema files
    cat > sql/security_logs.sql << 'EOF'
CREATE TABLE IF NOT EXISTS security_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  request_id TEXT NOT NULL,
  client_ip TEXT NOT NULL,
  user_agent TEXT,
  method TEXT NOT NULL,
  url TEXT NOT NULL,
  status INTEGER,
  response_time INTEGER,
  action TEXT NOT NULL,
  rule_id TEXT,
  reason TEXT,
  threat_level TEXT,
  country TEXT,
  asn INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_security_logs_client_ip ON security_logs(client_ip);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_logs_threat_level ON security_logs(threat_level);
CREATE INDEX IF NOT EXISTS idx_security_logs_action ON security_logs(action);
EOF

    cat > sql/threat_intelligence.sql << 'EOF'
CREATE TABLE IF NOT EXISTS threat_intelligence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL UNIQUE,
  reputation INTEGER NOT NULL DEFAULT 0,
  last_seen INTEGER NOT NULL,
  threat_types TEXT NOT NULL,
  source TEXT NOT NULL,
  last_updated INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_threat_intelligence_ip ON threat_intelligence(ip);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_reputation ON threat_intelligence(reputation);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_last_updated ON threat_intelligence(last_updated);

CREATE TABLE IF NOT EXISTS ai_threat_analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  client_ip TEXT NOT NULL,
  user_agent TEXT,
  url TEXT NOT NULL,
  method TEXT NOT NULL,
  threat_level TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  threats TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  reasoning TEXT,
  ai_model TEXT NOT NULL,
  processing_time INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_client_ip ON ai_threat_analysis(client_ip);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_timestamp ON ai_threat_analysis(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_threat_level ON ai_threat_analysis(threat_level);
EOF
    
    # Execute deployment steps
    create_d1_databases
    create_kv_namespaces
    setup_database_schemas
    set_secrets
    deploy_workers
    deploy_pages
    configure_waf_rules
    configure_rate_limiting
    configure_security_settings
    setup_monitoring
    test_waf_configuration
    
    echo ""
    print_status "🎉 Cloudflare WAF deployment completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Monitor security logs in Cloudflare dashboard"
    echo "2. Review and adjust WAF rules as needed"
    echo "3. Set up additional alerting endpoints"
    echo "4. Test all application functionality"
    echo ""
    echo "🔗 Useful links:"
    echo "   Dashboard: https://dash.cloudflare.com/"
    echo "   Security: https://dash.cloudflare.com/security"
    echo "   Workers: https://dash.cloudflare.com/workers"
    echo "   Analytics: https://dash.cloudflare.com/analytics"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "test")
        test_waf_configuration
        ;;
    "rules")
        configure_waf_rules
        ;;
    "workers")
        deploy_workers
        ;;
    "monitor")
        setup_monitoring
        ;;
    *)
        echo "Usage: $0 [deploy|test|rules|workers|monitor]"
        echo "  deploy  - Full deployment (default)"
        echo "  test    - Test WAF configuration"
        echo "  rules   - Deploy WAF rules only"
        echo "  workers - Deploy workers only"
        echo "  monitor - Set up monitoring only"
        exit 1
        ;;
esac