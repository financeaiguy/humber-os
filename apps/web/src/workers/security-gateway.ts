/**
 * Cloudflare Workers Security Gateway
 * Advanced WAF integration with custom security logic
 */

interface Env {
  // Cloudflare bindings
  WAF_KV: KVNamespace;
  SECURITY_DB: D1Database;
  AI: any; // Workers AI binding
  
  // Environment variables
  WAF_SECRET_KEY: string;
  ALLOWED_ORIGINS: string;
  SECURITY_WEBHOOK_URL: string;
}

interface SecurityEvent {
  timestamp: number;
  clientIP: string;
  userAgent: string;
  country: string;
  uri: string;
  method: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  action: 'allow' | 'challenge' | 'block' | 'log';
  ruleId: string;
  details: Record<string, any>;
}

interface ThreatIntelligence {
  ip: string;
  reputation: number; // 0-100, higher = more suspicious
  lastSeen: number;
  threatTypes: string[];
  source: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const startTime = Date.now();
    
    try {
      // Initialize security context
      const securityContext = await initializeSecurityContext(request, env);
      
      // Pre-flight security checks
      const preflightResult = await performPreflightChecks(request, env, securityContext);
      if (preflightResult.action !== 'allow') {
        return handleSecurityAction(preflightResult, request, env);
      }
      
      // Enhanced threat detection using Workers AI
      const threatAnalysis = await analyzeThreatWithAI(request, env, securityContext);
      if (threatAnalysis.threatLevel === 'critical' || threatAnalysis.threatLevel === 'high') {
        return handleThreatDetection(threatAnalysis, request, env);
      }
      
      // Apply dynamic rate limiting
      const rateLimitResult = await applyDynamicRateLimit(request, env, securityContext);
      if (rateLimitResult.limited) {
        return handleRateLimit(rateLimitResult, request, env);
      }
      
      // Forward request with security headers
      const response = await forwardRequestWithSecurity(request, env, securityContext);
      
      // Post-processing and logging
      await logSecurityEvent(request, response, env, securityContext, Date.now() - startTime);
      
      return response;
      
    } catch (error) {
      console.error('Security Gateway Error:', error);
      await logSecurityEvent(request, new Response('Security Error', { status: 500 }), env, null, Date.now() - startTime);
      return new Response('Security processing error', { status: 500 });
    }
  }
};

async function initializeSecurityContext(request: Request, env: Env) {
  const url = new URL(request.url);
  const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
  const userAgent = request.headers.get('User-Agent') || '';
  const country = request.cf?.country || 'unknown';
  const asn = request.cf?.asn || 0;
  
  // Get threat intelligence for this IP
  const threatIntel = await getThreatIntelligence(clientIP, env);
  
  return {
    clientIP,
    userAgent,
    country,
    asn,
    url,
    method: request.method,
    threatIntel,
    requestId: crypto.randomUUID()
  };
}

async function performPreflightChecks(request: Request, env: Env, context: any): Promise<{ action: string; reason?: string; ruleId?: string }> {
  const { url, userAgent, clientIP, country, threatIntel } = context;
  
  // 1. Check blocked IPs from threat intelligence
  if (threatIntel && threatIntel.reputation > 80) {
    return { action: 'block', reason: 'High-risk IP detected', ruleId: 'threat_intel_block' };
  }
  
  // 2. Check for malicious user agents
  const maliciousUAPatterns = [
    /sqlmap/i, /nikto/i, /nessus/i, /burpsuite/i, /acunetix/i,
    /masscan/i, /zap/i, /w3af/i, /skipfish/i
  ];
  
  if (maliciousUAPatterns.some(pattern => pattern.test(userAgent))) {
    return { action: 'block', reason: 'Malicious user agent detected', ruleId: 'malicious_ua_block' };
  }
  
  // 3. Check for suspicious file access
  const sensitiveFiles = [
    '.env', '.git', '.ssh', 'config.json', 'package.json', 
    '.htaccess', 'web.config', 'wp-config.php'
  ];
  
  if (sensitiveFiles.some(file => url.pathname.includes(file))) {
    return { action: 'block', reason: 'Sensitive file access attempt', ruleId: 'sensitive_file_block' };
  }
  
  // 4. Check for SQL injection patterns
  const sqlInjectionPatterns = [
    /union\s+select/i, /drop\s+table/i, /insert\s+into/i, /delete\s+from/i,
    /'\s*or\s*1\s*=\s*1/i, /;\s*--/i, /\/\*.*\*\//i
  ];
  
  const queryString = url.search;
  if (sqlInjectionPatterns.some(pattern => pattern.test(queryString))) {
    return { action: 'block', reason: 'SQL injection attempt detected', ruleId: 'sql_injection_block' };
  }
  
  // 5. Check for XSS patterns
  const xssPatterns = [
    /<script/i, /javascript:/i, /onload\s*=/i, /onerror\s*=/i,
    /vbscript:/i, /data:text\/html/i
  ];
  
  if (xssPatterns.some(pattern => pattern.test(queryString))) {
    return { action: 'challenge', reason: 'XSS attempt detected', ruleId: 'xss_challenge' };
  }
  
  // 6. Geo-blocking for high-risk countries (customizable)
  const blockedCountries = ['CN', 'RU', 'KP', 'IR']; // Customize as needed
  if (blockedCountries.includes(country)) {
    return { action: 'challenge', reason: 'Geo-location security check', ruleId: 'geo_challenge' };
  }
  
  return { action: 'allow' };
}

async function analyzeThreatWithAI(request: Request, env: Env, context: any): Promise<SecurityEvent> {
  try {
    // Prepare request data for AI analysis
    const requestData = {
      method: request.method,
      url: context.url.href,
      headers: Object.fromEntries(request.headers.entries()),
      userAgent: context.userAgent,
      clientIP: context.clientIP,
      country: context.country
    };
    
    // Use Workers AI for threat detection
    const aiResponse = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
      prompt: `Analyze this HTTP request for security threats:
        Method: ${requestData.method}
        URL: ${requestData.url}
        User-Agent: ${requestData.userAgent}
        Country: ${requestData.country}
        
        Identify potential threats like SQL injection, XSS, bot activity, or reconnaissance.
        Respond with a threat level (low/medium/high/critical) and brief explanation.`,
      max_tokens: 100
    });
    
    // Parse AI response to determine threat level
    const aiResult = aiResponse.response || '';
    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    if (aiResult.toLowerCase().includes('critical')) threatLevel = 'critical';
    else if (aiResult.toLowerCase().includes('high')) threatLevel = 'high';
    else if (aiResult.toLowerCase().includes('medium')) threatLevel = 'medium';
    
    return {
      timestamp: Date.now(),
      clientIP: context.clientIP,
      userAgent: context.userAgent,
      country: context.country,
      uri: context.url.pathname,
      method: context.method,
      threatLevel,
      action: threatLevel === 'critical' ? 'block' : threatLevel === 'high' ? 'challenge' : 'allow',
      ruleId: 'ai_threat_analysis',
      details: { aiAnalysis: aiResult }
    };
    
  } catch (error) {
    console.error('AI threat analysis failed:', error);
    return {
      timestamp: Date.now(),
      clientIP: context.clientIP,
      userAgent: context.userAgent,
      country: context.country,
      uri: context.url.pathname,
      method: context.method,
      threatLevel: 'low',
      action: 'allow',
      ruleId: 'ai_analysis_fallback',
      details: { error: 'AI analysis unavailable' }
    };
  }
}

async function applyDynamicRateLimit(request: Request, env: Env, context: any): Promise<{ limited: boolean; reason?: string }> {
  const { clientIP, url, threatIntel } = context;
  
  // Different rate limits based on endpoint and risk level
  const rateLimits = {
    '/api/auth/': { requests: 10, window: 300 },  // 10 per 5 minutes
    '/api/': { requests: 100, window: 60 },       // 100 per minute
    '/customer-portal': { requests: 50, window: 60 }, // 50 per minute
    'default': { requests: 200, window: 60 }      // 200 per minute
  };
  
  // Determine applicable rate limit
  let rateLimit = rateLimits.default;
  for (const [path, limit] of Object.entries(rateLimits)) {
    if (path !== 'default' && url.pathname.startsWith(path)) {
      rateLimit = limit;
      break;
    }
  }
  
  // Adjust limits based on threat intelligence
  if (threatIntel && threatIntel.reputation > 50) {
    rateLimit.requests = Math.floor(rateLimit.requests * 0.5); // Reduce by 50%
  }
  
  // Check current usage
  const key = `rate_limit:${clientIP}:${url.pathname}`;
  const current = await env.WAF_KV.get(key);
  const count = current ? parseInt(current) : 0;
  
  if (count >= rateLimit.requests) {
    return { limited: true, reason: 'Rate limit exceeded' };
  }
  
  // Increment counter
  await env.WAF_KV.put(key, (count + 1).toString(), { expirationTtl: rateLimit.window });
  
  return { limited: false };
}

async function getThreatIntelligence(ip: string, env: Env): Promise<ThreatIntelligence | null> {
  try {
    // Check local cache first
    const cached = await env.WAF_KV.get(`threat_intel:${ip}`);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Query threat intelligence database
    const result = await env.SECURITY_DB.prepare(
      'SELECT * FROM threat_intelligence WHERE ip = ? AND last_updated > ?'
    ).bind(ip, Date.now() - 86400000).first(); // 24 hours
    
    if (result) {
      const threatIntel: ThreatIntelligence = {
        ip: result.ip,
        reputation: result.reputation,
        lastSeen: result.last_seen,
        threatTypes: JSON.parse(result.threat_types),
        source: result.source
      };
      
      // Cache for 1 hour
      await env.WAF_KV.put(`threat_intel:${ip}`, JSON.stringify(threatIntel), { expirationTtl: 3600 });
      
      return threatIntel;
    }
    
    return null;
  } catch (error) {
    console.error('Threat intelligence lookup failed:', error);
    return null;
  }
}

async function handleSecurityAction(result: { action: string; reason?: string; ruleId?: string }, request: Request, env: Env): Promise<Response> {
  const { action, reason, ruleId } = result;
  
  switch (action) {
    case 'block':
      await logSecurityEvent(request, null, env, { action, reason, ruleId }, 0);
      return new Response('Access Denied', { 
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
          'X-Security-Rule': ruleId || 'unknown'
        }
      });
      
    case 'challenge':
      // Return Cloudflare challenge page
      await logSecurityEvent(request, null, env, { action, reason, ruleId }, 0);
      return new Response('Security Check Required', {
        status: 403,
        headers: {
          'Content-Type': 'text/html',
          'X-Security-Rule': ruleId || 'unknown'
        },
        // Cloudflare will automatically show challenge page
      });
      
    default:
      return new Response('Unknown security action', { status: 500 });
  }
}

async function handleThreatDetection(threat: SecurityEvent, request: Request, env: Env): Promise<Response> {
  // Log the threat
  await logSecurityEvent(request, null, env, threat, 0);
  
  // Send security alert if critical
  if (threat.threatLevel === 'critical') {
    await sendSecurityAlert(threat, env);
  }
  
  return handleSecurityAction({ action: threat.action, reason: `AI detected ${threat.threatLevel} threat`, ruleId: threat.ruleId }, request, env);
}

async function handleRateLimit(rateLimitResult: { limited: boolean; reason?: string }, request: Request, env: Env): Promise<Response> {
  await logSecurityEvent(request, null, env, { action: 'rate_limit', reason: rateLimitResult.reason }, 0);
  
  return new Response('Rate Limit Exceeded', {
    status: 429,
    headers: {
      'Content-Type': 'text/plain',
      'Retry-After': '60',
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': '0'
    }
  });
}

async function forwardRequestWithSecurity(request: Request, env: Env, context: any): Promise<Response> {
  // Clone the request to modify headers
  const modifiedRequest = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null
  });
  
  // Add security headers
  modifiedRequest.headers.set('X-Security-Gateway', 'cloudflare-workers');
  modifiedRequest.headers.set('X-Request-ID', context.requestId);
  modifiedRequest.headers.set('X-Client-IP', context.clientIP);
  modifiedRequest.headers.set('X-Country', context.country);
  
  // Forward to origin
  const response = await fetch(modifiedRequest);
  
  // Add security response headers
  const secureResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
  
  // Security headers
  secureResponse.headers.set('X-Content-Type-Options', 'nosniff');
  secureResponse.headers.set('X-Frame-Options', 'DENY');
  secureResponse.headers.set('X-XSS-Protection', '1; mode=block');
  secureResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  secureResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return secureResponse;
}

async function logSecurityEvent(request: Request, response: Response | null, env: Env, eventData: any, responseTime: number): Promise<void> {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      request_id: eventData?.requestId || crypto.randomUUID(),
      client_ip: request.headers.get('CF-Connecting-IP'),
      user_agent: request.headers.get('User-Agent'),
      method: request.method,
      url: request.url,
      status: response?.status || null,
      response_time: responseTime,
      action: eventData?.action || 'allow',
      rule_id: eventData?.ruleId || null,
      reason: eventData?.reason || null,
      threat_level: eventData?.threatLevel || 'low',
      country: request.cf?.country || 'unknown',
      asn: request.cf?.asn || null
    };
    
    // Store in KV for immediate access
    await env.WAF_KV.put(`security_log:${logEntry.request_id}`, JSON.stringify(logEntry), { expirationTtl: 86400 });
    
    // Store in D1 for long-term analysis
    await env.SECURITY_DB.prepare(`
      INSERT INTO security_logs 
      (timestamp, request_id, client_ip, user_agent, method, url, status, response_time, action, rule_id, reason, threat_level, country, asn)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      logEntry.timestamp, logEntry.request_id, logEntry.client_ip, logEntry.user_agent,
      logEntry.method, logEntry.url, logEntry.status, logEntry.response_time,
      logEntry.action, logEntry.rule_id, logEntry.reason, logEntry.threat_level,
      logEntry.country, logEntry.asn
    ).run();
    
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

async function sendSecurityAlert(threat: SecurityEvent, env: Env): Promise<void> {
  try {
    if (env.SECURITY_WEBHOOK_URL) {
      await fetch(env.SECURITY_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_type: 'critical_threat_detected',
          timestamp: threat.timestamp,
          client_ip: threat.clientIP,
          threat_level: threat.threatLevel,
          details: threat.details,
          action_taken: threat.action
        })
      });
    }
  } catch (error) {
    console.error('Failed to send security alert:', error);
  }
}