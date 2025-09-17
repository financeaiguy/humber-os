/**
 * Cloudflare WAF Configuration for Humber OS Infrastructure
 * Comprehensive protection for Pages, Workers, Workers AI, and API Gateway
 */

export const CLOUDFLARE_WAF_CONFIG = {
  // Zone-level WAF Settings
  zoneSettings: {
    // Security Level: High
    securityLevel: "high",
    
    // Challenge Passage
    challengePassage: 86400, // 24 hours
    
    // Browser Integrity Check
    browserCheck: "on",
    
    // Bot Fight Mode
    botFightMode: "on",
    
    // DDoS Protection
    ddosProtection: "on",
    
    // SSL/TLS Settings
    ssl: "strict",
    minTlsVersion: "1.2",
    
    // WAF Mode
    wafMode: "on"
  },

  // Custom WAF Rules for API Protection
  customRules: [
    {
      id: "block_sql_injection",
      description: "Block SQL injection attempts",
      expression: `(
        http.request.uri.query contains "union select" or
        http.request.uri.query contains "drop table" or
        http.request.uri.query contains "insert into" or
        http.request.uri.query contains "delete from" or
        http.request.body.raw contains "union select" or
        http.request.body.raw contains "drop table" or
        http.request.body.raw contains "'; --" or
        http.request.body.raw contains "' or 1=1"
      )`,
      action: "block",
      priority: 1,
      enabled: true
    },
    {
      id: "block_xss_attempts",
      description: "Block XSS injection attempts",
      expression: `(
        http.request.uri.query contains "<script" or
        http.request.uri.query contains "javascript:" or
        http.request.uri.query contains "onload=" or
        http.request.uri.query contains "onerror=" or
        http.request.body.raw contains "<script" or
        http.request.body.raw contains "javascript:" or
        http.request.headers["user-agent"] contains "<script"
      )`,
      action: "block",
      priority: 2,
      enabled: true
    },
    {
      id: "rate_limit_api_endpoints",
      description: "Rate limit API endpoints",
      expression: `(
        http.request.uri.path matches "^/api/" and
        not http.request.uri.path matches "^/api/auth/"
      )`,
      action: "rate_limit",
      rateLimit: {
        requests: 100,
        period: 60, // per minute
        mitigation_timeout: 300 // 5 minutes
      },
      priority: 3,
      enabled: true
    },
    {
      id: "protect_admin_endpoints",
      description: "Extra protection for admin endpoints",
      expression: `(
        http.request.uri.path matches "^/api/(admin|system|operations)/" or
        http.request.uri.path contains "/admin" or
        http.request.uri.path contains "/settings"
      )`,
      action: "challenge",
      priority: 4,
      enabled: true
    },
    {
      id: "block_suspicious_user_agents",
      description: "Block known malicious user agents",
      expression: `(
        http.request.headers["user-agent"] contains "sqlmap" or
        http.request.headers["user-agent"] contains "nikto" or
        http.request.headers["user-agent"] contains "nessus" or
        http.request.headers["user-agent"] contains "burpsuite" or
        http.request.headers["user-agent"] contains "acunetix" or
        http.request.headers["user-agent"] eq ""
      )`,
      action: "block",
      priority: 5,
      enabled: true
    },
    {
      id: "protect_sensitive_files",
      description: "Protect sensitive file access",
      expression: `(
        http.request.uri.path contains ".env" or
        http.request.uri.path contains ".git" or
        http.request.uri.path contains ".ssh" or
        http.request.uri.path contains "config.json" or
        http.request.uri.path contains "package.json" or
        http.request.uri.path ends_with ".log"
      )`,
      action: "block",
      priority: 6,
      enabled: true
    },
    {
      id: "challenge_customer_portal",
      description: "Enhanced security for customer portal",
      expression: `(
        http.request.uri.path matches "^/customer-portal" or
        http.request.uri.path matches "^/api/customer-portal/"
      )`,
      action: "managed_challenge",
      priority: 7,
      enabled: true
    },
    {
      id: "rate_limit_auth_endpoints",
      description: "Strict rate limiting for authentication",
      expression: `(
        http.request.uri.path matches "^/api/auth/" or
        http.request.uri.path matches "^/auth/"
      )`,
      action: "rate_limit",
      rateLimit: {
        requests: 10,
        period: 60, // per minute
        mitigation_timeout: 600 // 10 minutes
      },
      priority: 8,
      enabled: true
    },
    {
      id: "block_file_upload_exploits",
      description: "Block malicious file upload attempts",
      expression: `(
        http.request.method eq "POST" and
        (
          http.request.headers["content-type"] contains "multipart/form-data" and
          (
            http.request.body.raw contains ".php" or
            http.request.body.raw contains ".asp" or
            http.request.body.raw contains ".jsp" or
            http.request.body.raw contains "<?php" or
            http.request.body.raw contains "<script"
          )
        )
      )`,
      action: "block",
      priority: 9,
      enabled: true
    },
    {
      id: "geo_block_high_risk_countries",
      description: "Block traffic from high-risk countries (customize as needed)",
      expression: `(
        ip.geoip.country in {"CN" "RU" "KP" "IR"}
      )`,
      action: "challenge", // or "block" for stricter security
      priority: 10,
      enabled: false // Disabled by default - enable based on your needs
    }
  ],

  // Managed Rulesets (OWASP Core Rule Set)
  managedRulesets: [
    {
      id: "4814384a9e5d4991b9815dcfc25d2f1f", // OWASP Core Rule Set
      enabled: true,
      action: "block",
      rules: [
        // Enable specific OWASP rules
        { id: "100001", enabled: true, action: "block" }, // SQL Injection
        { id: "100002", enabled: true, action: "block" }, // XSS
        { id: "100003", enabled: true, action: "log" },   // File Inclusion
        { id: "100004", enabled: true, action: "block" }, // Code Injection
        { id: "100005", enabled: true, action: "challenge" }, // Command Injection
      ]
    },
    {
      id: "c2e184081120413c86c3ab7e14069605", // Cloudflare Managed Rules
      enabled: true,
      action: "block"
    }
  ],

  // Rate Limiting Rules
  rateLimitingRules: [
    {
      id: "global_rate_limit",
      threshold: 1000,
      period: 60,
      action: "challenge",
      match: "ip.src",
      disabled: false,
      description: "Global rate limit per IP"
    },
    {
      id: "api_rate_limit",
      threshold: 200,
      period: 60,
      action: "block",
      match: "ip.src",
      characteristics: ["ip.src"],
      counting_expression: 'http.request.uri.path matches "^/api/"',
      disabled: false,
      description: "API endpoint rate limit"
    },
    {
      id: "auth_rate_limit",
      threshold: 15,
      period: 300, // 5 minutes
      action: "block",
      match: "ip.src",
      characteristics: ["ip.src"],
      counting_expression: 'http.request.uri.path matches "^/api/auth/"',
      mitigation_timeout: 1800, // 30 minutes
      disabled: false,
      description: "Authentication endpoint rate limit"
    }
  ],

  // Bot Management Settings
  botManagement: {
    enabled: true,
    fightMode: true,
    staticResourceProtection: false, // Allow bots to access static resources
    verifiedBots: true, // Allow verified search engine bots
    jsDetection: true,
    
    // Bot Score thresholds (1-99, lower = more likely to be a bot)
    scoreThresholds: {
      block: 1,      // Block obvious bots
      challenge: 30, // Challenge suspicious traffic
      allow: 50      // Allow likely human traffic
    }
  },

  // Page Rules for specific protection
  pageRules: [
    {
      targets: [
        { target: "url", constraint: { operator: "matches", value: "humber-os.ai/api/*" }}
      ],
      actions: [
        { id: "security_level", value: "high" },
        { id: "cache_level", value: "bypass" },
        { id: "browser_check", value: "on" }
      ],
      priority: 1,
      status: "active"
    },
    {
      targets: [
        { target: "url", constraint: { operator: "matches", value: "humber-os.ai/admin*" }}
      ],
      actions: [
        { id: "security_level", value: "high" },
        { id: "browser_check", value: "on" },
        { id: "waf", value: "on" }
      ],
      priority: 2,
      status: "active"
    }
  ],

  // Workers-specific WAF integration
  workersWAF: {
    enabled: true,
    routes: [
      { pattern: "humber-os.ai/api/*", script_name: "api-gateway-worker" },
      { pattern: "humber-os.ai/ai/*", script_name: "workers-ai-gateway" }
    ],
    
    // Security headers to add
    securityHeaders: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-ancestors 'none';"
    }
  },

  // Logging and Analytics
  logging: {
    enabled: true,
    logLevel: "info", // error, warn, info, debug
    
    // Fields to log
    logFields: [
      "timestamp",
      "ray_id",
      "client_ip",
      "client_country",
      "client_asn",
      "user_agent",
      "uri",
      "method",
      "status",
      "cache_status",
      "security_level",
      "waf_action",
      "waf_rule_id",
      "edge_response_time"
    ],
    
    // Log destinations
    destinations: [
      {
        type: "logpush",
        enabled: true,
        destination: "s3://humber-security-logs/waf/",
        format: "json"
      }
    ]
  }
}

// WAF Rule Templates for different environments
export const WAF_ENVIRONMENTS = {
  production: {
    ...CLOUDFLARE_WAF_CONFIG,
    zoneSettings: {
      ...CLOUDFLARE_WAF_CONFIG.zoneSettings,
      securityLevel: "high",
      challengePassage: 86400
    }
  },
  
  staging: {
    ...CLOUDFLARE_WAF_CONFIG,
    zoneSettings: {
      ...CLOUDFLARE_WAF_CONFIG.zoneSettings,
      securityLevel: "medium",
      challengePassage: 3600
    },
    customRules: CLOUDFLARE_WAF_CONFIG.customRules.map(rule => ({
      ...rule,
      action: rule.action === "block" ? "log" : rule.action
    }))
  },
  
  development: {
    ...CLOUDFLARE_WAF_CONFIG,
    zoneSettings: {
      ...CLOUDFLARE_WAF_CONFIG.zoneSettings,
      securityLevel: "low",
      challengePassage: 300
    },
    customRules: CLOUDFLARE_WAF_CONFIG.customRules.map(rule => ({
      ...rule,
      enabled: false
    }))
  }
}