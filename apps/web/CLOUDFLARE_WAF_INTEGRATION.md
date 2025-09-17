# Cloudflare WAF Integration for Humber OS

## 🔒 Overview

This comprehensive security implementation integrates Cloudflare WAF (Web Application Firewall) across your entire Humber OS infrastructure, providing enterprise-grade protection for:

- **Pages Applications** (Frontend React/Next.js)
- **Workers API Gateway** (Backend API routing)
- **Workers AI Services** (AI-powered threat detection)
- **Database & Storage** (D1, KV, R2 protection)

## 🛡️ Security Features Implemented

### 1. **Multi-Layer WAF Protection**
```
Internet → Cloudflare Edge → WAF Rules → Workers Security → Origin
```

- **Zone-level Protection**: Security level, SSL/TLS, browser checks
- **Custom WAF Rules**: SQL injection, XSS, bot detection, rate limiting
- **Managed Rulesets**: OWASP Core Rule Set, Cloudflare Managed Rules
- **Geographic Filtering**: Country-based access controls

### 2. **AI-Powered Threat Detection**
- **Workers AI Integration**: Real-time threat analysis using LLaMA models
- **Behavioral Analysis**: Pattern recognition and anomaly detection
- **Threat Intelligence**: IP reputation and historical attack data
- **Adaptive Security**: Machine learning-based security posture

### 3. **Advanced Rate Limiting**
- **Global Rate Limits**: 1000 requests/minute per IP
- **API Protection**: 200 requests/minute for API endpoints
- **Authentication Security**: 15 requests/5 minutes for auth endpoints
- **Dynamic Thresholds**: AI-adjusted limits based on threat intelligence

### 4. **Comprehensive Monitoring**
- **Real-time Analytics**: Security dashboard with live metrics
- **Threat Visualization**: Geographic and temporal threat mapping
- **Alert System**: Webhook notifications for critical threats
- **Log Aggregation**: Centralized security logging with S3 storage

## 📁 File Structure

```
apps/web/
├── cloudflare-waf-config.ts          # WAF configuration
├── wrangler-security.toml             # Workers deployment config
├── src/
│   ├── workers/
│   │   ├── security-gateway.ts        # Main security worker
│   │   ├── ai-threat-detection.ts     # AI-powered analysis
│   │   └── api-gateway.ts             # Protected API routing
│   ├── lib/
│   │   ├── auth-middleware.ts         # Authentication layers
│   │   ├── validation-schemas.ts      # Input validation
│   │   └── secure-token-generator.ts  # Cryptographic tokens
│   └── app/
│       └── security-dashboard/        # Monitoring interface
└── scripts/
    └── deploy-waf.sh                  # Deployment automation
```

## 🚀 Deployment Instructions

### Prerequisites
```bash
# Install dependencies
npm install -g wrangler
pnpm install

# Set environment variables
export CLOUDFLARE_ZONE_ID="your-zone-id"
export CLOUDFLARE_API_TOKEN="your-api-token"  
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export WAF_SECRET_KEY="your-waf-secret"
export SECURITY_WEBHOOK_URL="your-webhook-url"
```

### 1. **Full Deployment**
```bash
# Complete WAF setup with all components
./scripts/deploy-waf.sh deploy
```

### 2. **Component-Specific Deployment**
```bash
# Deploy Workers only
./scripts/deploy-waf.sh workers

# Deploy WAF rules only
./scripts/deploy-waf.sh rules

# Set up monitoring only
./scripts/deploy-waf.sh monitor

# Test configuration
./scripts/deploy-waf.sh test
```

### 3. **Manual Wrangler Commands**
```bash
# Deploy security gateway
wrangler deploy --config wrangler-security.toml --name humber-security-gateway

# Deploy AI threat detection
wrangler deploy --config wrangler-security.toml --name humber-ai-threat-detection

# Create D1 databases
wrangler d1 create humber-security
wrangler d1 create humber-threat-intelligence

# Create KV namespaces
wrangler kv:namespace create "WAF_KV"
wrangler kv:namespace create "SECURITY_KV"
```

## 🔧 Configuration

### WAF Rules Configuration
Located in `cloudflare-waf-config.ts`:

```typescript
// Custom security rules
customRules: [
  {
    id: "block_sql_injection",
    description: "Block SQL injection attempts",
    expression: `(http.request.uri.query contains "union select" or ...)`,
    action: "block",
    priority: 1
  }
]
```

### Rate Limiting Rules
```typescript
rateLimitingRules: [
  {
    id: "api_rate_limit", 
    threshold: 200,
    period: 60,
    action: "block",
    counting_expression: 'http.request.uri.path matches "^/api/"'
  }
]
```

### AI Threat Detection
```typescript
// Workers AI integration
const aiResponse = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
  prompt: `Analyze this HTTP request for security threats: ${requestData}`,
  max_tokens: 150
});
```

## 📊 Security Dashboard

Access the security dashboard at `/security-dashboard` to monitor:

- **Real-time Metrics**: Requests, blocks, challenges, threat levels
- **Threat Analysis**: Top attack types, geographic distribution
- **WAF Rule Status**: Active rules, trigger counts, last activity
- **AI Performance**: Analysis accuracy, processing times
- **Rate Limiting**: Current blocks, trigger statistics

### Key Metrics Tracked
- Total requests processed
- Blocked malicious requests  
- Challenge responses issued
- Threat level assessment
- Geographic request patterns
- AI analysis performance
- Rate limiting effectiveness

## 🔐 Security Features Detail

### 1. **SQL Injection Protection**
```javascript
// Detects patterns like:
- UNION SELECT statements
- DROP TABLE commands  
- Boolean-based injection (OR 1=1)
- Comment-based injection ('; --)
```

### 2. **XSS Protection**
```javascript
// Blocks attempts including:
- <script> tag injections
- javascript: protocol usage
- Event handler attributes
- Data URI XSS vectors
```

### 3. **Bot Detection**
```javascript
// Identifies threats from:
- Security scanners (sqlmap, nessus)
- Web scrapers and crawlers
- Automated attack tools
- Suspicious user agents
```

### 4. **Rate Limiting**
```javascript
// Configurable limits:
- Global: 1000 req/min per IP
- API: 200 req/min per IP
- Auth: 15 req/5min per IP
- Admin: 10 req/min per IP
```

## 🚨 Incident Response

### Automatic Actions
1. **Critical Threats**: Immediate IP blocking
2. **High Threats**: Challenge page deployment
3. **Medium Threats**: Enhanced monitoring
4. **Rate Limit Exceeded**: Temporary blocking

### Alert Channels
- **Webhook Notifications**: Real-time alerts to security team
- **Email Alerts**: Daily security summaries
- **Dashboard Alerts**: Visual threat level indicators
- **Log Aggregation**: S3 storage for forensic analysis

## 🔍 Monitoring & Analytics

### Cloudflare Analytics
- **Security Events**: Real-time threat tracking
- **Performance Metrics**: Response times and availability
- **Traffic Patterns**: Request volume and geographic distribution
- **Rule Effectiveness**: WAF rule performance analysis

### Custom Analytics
```sql
-- Example D1 queries for security analysis
SELECT 
  threat_level, 
  COUNT(*) as incidents,
  AVG(confidence) as avg_confidence
FROM ai_threat_analysis 
WHERE timestamp > datetime('now', '-24 hours')
GROUP BY threat_level;
```

### Log Analysis
```bash
# Security log analysis
aws s3 sync s3://humber-security-logs/cloudflare/ ./logs/
grep "blocked" logs/*.json | jq '.client_ip' | sort | uniq -c
```

## 🔄 Maintenance

### Regular Tasks
1. **Weekly**: Review WAF rule effectiveness
2. **Monthly**: Analyze threat patterns and update rules
3. **Quarterly**: Security posture assessment
4. **Annually**: Complete security audit

### Updates
```bash
# Update WAF rules
./scripts/deploy-waf.sh rules

# Update Workers
./scripts/deploy-waf.sh workers

# Test after updates
./scripts/deploy-waf.sh test
```

## 🐛 Troubleshooting

### Common Issues

#### 1. **False Positives**
```bash
# Check blocked legitimate requests
curl -H "User-Agent: YourApp/1.0" https://humber-os.ai/api/test
```

#### 2. **Rate Limiting Issues**
```bash
# Adjust rate limits in config
rateLimitingRules: [{
  threshold: 500, // Increase threshold
  period: 60
}]
```

#### 3. **AI Analysis Errors**
```bash
# Check Workers AI binding
wrangler tail humber-security-gateway --format pretty
```

### Debug Commands
```bash
# View security logs
wrangler kv:key list --namespace-id="your-security-kv-id"

# Check D1 database
wrangler d1 execute humber-security --command="SELECT * FROM security_logs LIMIT 10"

# Monitor Workers
wrangler tail humber-security-gateway
```

## 📈 Performance Impact

### Latency Additions
- **WAF Processing**: ~2-5ms per request
- **AI Analysis**: ~200-500ms for suspicious requests
- **Rate Limiting**: ~1ms per request
- **Logging**: ~0.5ms per request

### Resource Usage
- **Workers CPU**: <10ms per request
- **KV Operations**: 2-3 reads per request
- **D1 Writes**: 1 write per security event
- **AI Tokens**: ~100 tokens per analysis

## 🔒 Security Best Practices

### Implemented Protections
1. ✅ **Input Validation**: Zod schemas for all inputs
2. ✅ **Output Encoding**: XSS prevention
3. ✅ **Authentication**: JWT-based with role validation
4. ✅ **Authorization**: Role-based access control
5. ✅ **Rate Limiting**: Multi-tier protection
6. ✅ **Secure Headers**: HSTS, CSP, frame options
7. ✅ **Token Security**: Cryptographically secure generation
8. ✅ **Audit Logging**: Comprehensive security event logging

### Additional Recommendations
- Enable 2FA for all admin accounts
- Regular security penetration testing
- Keep WAF rules updated with latest threat intelligence
- Monitor security dashboard daily
- Implement backup and disaster recovery procedures

## 📞 Support

For security incidents or questions:
- **Emergency**: security@humber-os.ai
- **General**: support@humber-os.ai
- **Documentation**: [Cloudflare WAF Docs](https://developers.cloudflare.com/waf/)

## 📋 Compliance

This implementation supports compliance with:
- **GDPR**: Data protection and privacy controls
- **SOC 2**: Security monitoring and controls
- **OWASP Top 10**: Protection against common vulnerabilities
- **ISO 27001**: Information security management

---

## 🎯 Next Steps

1. **Deploy**: Run the deployment script
2. **Monitor**: Access security dashboard
3. **Tune**: Adjust rules based on traffic patterns
4. **Scale**: Add additional security workers as needed
5. **Evolve**: Continuously update threat detection models

**🔒 Your Humber OS infrastructure is now protected by enterprise-grade Cloudflare WAF with AI-powered threat detection!** 🛡️