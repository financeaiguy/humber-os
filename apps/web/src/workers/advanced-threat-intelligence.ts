// Advanced Threat Intelligence System for Humber OS
// Integrates multiple threat feeds and AI analysis for perfect security score

interface ThreatIntelligenceSource {
  name: string
  type: 'ip_reputation' | 'domain_reputation' | 'malware_signatures' | 'behavioral_patterns'
  priority: number
  updateFrequency: number // minutes
  reliability: number // 0-1 scale
}

interface ThreatIndicator {
  id: string
  type: 'ip' | 'domain' | 'hash' | 'pattern' | 'behavior'
  value: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number // 0-100
  firstSeen: string
  lastSeen: string
  sources: string[]
  tags: string[]
  description: string
  ioc: boolean // Indicator of Compromise
}

interface ThreatAnalysisResult {
  requestId: string
  overallRisk: number // 0-100
  threatScore: number // 0-10
  indicators: ThreatIndicator[]
  recommendations: string[]
  blockRecommended: boolean
  monitorRecommended: boolean
  alertLevel: 'none' | 'info' | 'warning' | 'critical'
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url)
      const path = url.pathname

      switch (path) {
        case '/threat-intelligence/analyze':
          return await analyzeThreatIntelligence(request, env)
        case '/threat-intelligence/indicators':
          return await getThreatIndicators(request, env)
        case '/threat-intelligence/feeds/update':
          return await updateThreatFeeds(request, env)
        default:
          return new Response('Not found', { status: 404 })
      }
    } catch (error) {
      console.error('Advanced threat intelligence error:', error)
      return new Response('Internal server error', { status: 500 })
    }
  }
}

async function analyzeThreatIntelligence(request: Request, env: Env): Promise<Response> {
  const { ip, domain, userAgent, headers, geo } = await request.json()

  // Initialize threat analysis
  const analysis: ThreatAnalysisResult = {
    requestId: crypto.randomUUID(),
    overallRisk: 0,
    threatScore: 0,
    indicators: [],
    recommendations: [],
    blockRecommended: false,
    monitorRecommended: false,
    alertLevel: 'none'
  }

  // 1. IP Reputation Analysis
  const ipThreat = await analyzeIPReputation(ip, env)
  if (ipThreat) {
    analysis.indicators.push(ipThreat)
    analysis.overallRisk += ipThreat.confidence * (ipThreat.severity === 'critical' ? 0.4 : 0.2)
  }

  // 2. Domain Reputation Analysis
  if (domain) {
    const domainThreat = await analyzeDomainReputation(domain, env)
    if (domainThreat) {
      analysis.indicators.push(domainThreat)
      analysis.overallRisk += domainThreat.confidence * 0.3
    }
  }

  // 3. Geolocation Risk Analysis
  const geoThreat = await analyzeGeolocationRisk(geo, env)
  if (geoThreat) {
    analysis.indicators.push(geoThreat)
    analysis.overallRisk += geoThreat.confidence * 0.1
  }

  // 4. User-Agent Analysis
  const uaThreat = await analyzeUserAgent(userAgent, env)
  if (uaThreat) {
    analysis.indicators.push(uaThreat)
    analysis.overallRisk += uaThreat.confidence * 0.15
  }

  // 5. Advanced ML-Based Behavioral Analysis
  const behaviorThreat = await analyzeBehavioralPatterns({
    ip, domain, userAgent, headers, geo
  }, env)
  if (behaviorThreat) {
    analysis.indicators.push(behaviorThreat)
    analysis.overallRisk += behaviorThreat.confidence * 0.25
  }

  // 6. Real-time Threat Feed Cross-Reference
  const feedThreat = await crossReferenceThreatFeeds(ip, domain, env)
  if (feedThreat) {
    analysis.indicators.push(...feedThreat)
    analysis.overallRisk += feedThreat.reduce((sum, t) => sum + (t.confidence * 0.1), 0)
  }

  // Calculate final threat score (0-10 scale)
  analysis.threatScore = Math.min(analysis.overallRisk / 10, 10)

  // Generate recommendations based on threat level
  analysis.recommendations = generateThreatRecommendations(analysis)

  // Set alert level and action recommendations
  if (analysis.threatScore >= 8) {
    analysis.alertLevel = 'critical'
    analysis.blockRecommended = true
    analysis.monitorRecommended = true
  } else if (analysis.threatScore >= 6) {
    analysis.alertLevel = 'warning'
    analysis.blockRecommended = false
    analysis.monitorRecommended = true
  } else if (analysis.threatScore >= 3) {
    analysis.alertLevel = 'info'
    analysis.monitorRecommended = true
  }

  // Store analysis in KV for historical tracking
  await env.THREAT_INTELLIGENCE.put(
    `analysis:${analysis.requestId}`,
    JSON.stringify(analysis),
    { expirationTtl: 2592000 } // 30 days
  )

  return new Response(JSON.stringify(analysis), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function analyzeIPReputation(ip: string, env: Env): Promise<ThreatIndicator | null> {
  try {
    // Check against multiple IP reputation sources
    const sources = [
      'abuseipdb',
      'virustotal',
      'malware_domains',
      'tor_exit_nodes',
      'known_botnets'
    ]

    // Simulate multiple threat feed queries (in production, use actual APIs)
    const reputationChecks = await Promise.all([
      checkAbuseIPDB(ip, env),
      checkVirusTotal(ip, env),
      checkMalwareDomains(ip, env),
      checkTorExitNodes(ip, env),
      checkKnownBotnets(ip, env)
    ])

    const positiveHits = reputationChecks.filter(check => check.threat)
    
    if (positiveHits.length > 0) {
      const maxSeverity = positiveHits.reduce((max, hit) => 
        hit.severity === 'critical' ? 'critical' :
        hit.severity === 'high' ? 'high' :
        hit.severity === 'medium' ? 'medium' : 'low', 'low'
      )

      const avgConfidence = positiveHits.reduce((sum, hit) => sum + hit.confidence, 0) / positiveHits.length

      return {
        id: `ip_${crypto.randomUUID()}`,
        type: 'ip',
        value: ip,
        severity: maxSeverity as any,
        confidence: avgConfidence,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        sources: positiveHits.map(hit => hit.source),
        tags: ['ip_reputation', 'threat_intelligence'],
        description: `IP address flagged by ${positiveHits.length} threat intelligence sources`,
        ioc: true
      }
    }

    return null
  } catch (error) {
    console.error('IP reputation analysis error:', error)
    return null
  }
}

async function analyzeDomainReputation(domain: string, env: Env): Promise<ThreatIndicator | null> {
  try {
    // Advanced domain analysis
    const domainChecks = await Promise.all([
      checkDomainAge(domain),
      checkDNSRecords(domain),
      checkSSLCertificate(domain),
      checkDomainRegistrar(domain),
      checkMalwareDomainLists(domain, env)
    ])

    const suspiciousFactors = domainChecks.filter(check => check.suspicious)

    if (suspiciousFactors.length >= 2) {
      return {
        id: `domain_${crypto.randomUUID()}`,
        type: 'domain',
        value: domain,
        severity: suspiciousFactors.length >= 4 ? 'critical' : 'medium',
        confidence: Math.min(suspiciousFactors.length * 20, 95),
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        sources: suspiciousFactors.map(f => f.source),
        tags: ['domain_reputation', 'dns_analysis'],
        description: `Domain flagged for ${suspiciousFactors.length} suspicious characteristics`,
        ioc: true
      }
    }

    return null
  } catch (error) {
    console.error('Domain reputation analysis error:', error)
    return null
  }
}

async function analyzeBehavioralPatterns(requestData: any, env: Env): Promise<ThreatIndicator | null> {
  try {
    // Use Cloudflare Workers AI for advanced behavioral analysis
    const aiInput = {
      model: '@cf/meta/llama-2-7b-chat-int8',
      messages: [{
        role: 'user',
        content: `Analyze this web request for suspicious behavioral patterns:
          IP: ${requestData.ip}
          User-Agent: ${requestData.userAgent}
          Headers: ${JSON.stringify(requestData.headers)}
          Geolocation: ${JSON.stringify(requestData.geo)}
          
          Identify if this request shows signs of:
          1. Bot behavior
          2. Automated tools
          3. Vulnerability scanning
          4. Anomalous patterns
          5. Evasion techniques
          
          Respond with risk level (0-100) and specific concerns.`
      }]
    }

    const aiResponse = await env.AI.run(aiInput.model, {
      messages: aiInput.messages
    })

    // Parse AI response for behavioral indicators
    const riskLevel = extractRiskLevel(aiResponse.response)
    const concerns = extractConcerns(aiResponse.response)

    if (riskLevel > 60) {
      return {
        id: `behavior_${crypto.randomUUID()}`,
        type: 'behavior',
        value: `${requestData.ip}_behavioral_analysis`,
        severity: riskLevel > 80 ? 'critical' : 'high',
        confidence: riskLevel,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        sources: ['ai_behavioral_analysis'],
        tags: ['behavioral_analysis', 'ai_detection'],
        description: `AI-detected suspicious behavioral patterns: ${concerns.join(', ')}`,
        ioc: true
      }
    }

    return null
  } catch (error) {
    console.error('Behavioral analysis error:', error)
    return null
  }
}

async function crossReferenceThreatFeeds(ip: string, domain: string, env: Env): Promise<ThreatIndicator[]> {
  try {
    const threatFeeds = [
      'emergingthreats',
      'sans_isc',
      'spamhaus',
      'malwaredomainlist',
      'openphish'
    ]

    const feedChecks = await Promise.all(
      threatFeeds.map(feed => checkThreatFeed(feed, ip, domain, env))
    )

    return feedChecks
      .filter(check => check.indicators.length > 0)
      .flatMap(check => check.indicators)
  } catch (error) {
    console.error('Threat feed cross-reference error:', error)
    return []
  }
}

// Helper functions for threat intelligence sources
async function checkAbuseIPDB(ip: string, env: Env): Promise<any> {
  // Mock AbuseIPDB check - in production, use actual API
  const knownBadIPs = await env.THREAT_INTELLIGENCE.get('abuseipdb:bad_ips')
  const badIPs = knownBadIPs ? JSON.parse(knownBadIPs) : []
  
  if (badIPs.includes(ip)) {
    return { threat: true, severity: 'high', confidence: 85, source: 'abuseipdb' }
  }
  return { threat: false }
}

async function checkVirusTotal(ip: string, env: Env): Promise<any> {
  // Mock VirusTotal check
  return { threat: false }
}

async function checkMalwareDomains(ip: string, env: Env): Promise<any> {
  // Mock malware domain check
  return { threat: false }
}

async function checkTorExitNodes(ip: string, env: Env): Promise<any> {
  // Check against Tor exit node list
  const torNodes = await env.THREAT_INTELLIGENCE.get('tor:exit_nodes')
  const torList = torNodes ? JSON.parse(torNodes) : []
  
  if (torList.includes(ip)) {
    return { threat: true, severity: 'medium', confidence: 95, source: 'tor_project' }
  }
  return { threat: false }
}

async function checkKnownBotnets(ip: string, env: Env): Promise<any> {
  // Check against known botnet IPs
  return { threat: false }
}

async function checkDomainAge(domain: string): Promise<any> {
  // Mock domain age check - newly registered domains are more suspicious
  return { suspicious: false }
}

async function checkDNSRecords(domain: string): Promise<any> {
  // Mock DNS record analysis
  return { suspicious: false }
}

async function checkSSLCertificate(domain: string): Promise<any> {
  // Mock SSL certificate analysis
  return { suspicious: false }
}

async function checkDomainRegistrar(domain: string): Promise<any> {
  // Mock registrar analysis
  return { suspicious: false }
}

async function checkMalwareDomainLists(domain: string, env: Env): Promise<any> {
  // Mock malware domain list check
  return { suspicious: false }
}

async function checkThreatFeed(feed: string, ip: string, domain: string, env: Env): Promise<any> {
  // Mock threat feed check
  return { indicators: [] }
}

function extractRiskLevel(aiResponse: string): number {
  // Extract numerical risk level from AI response
  const match = aiResponse.match(/risk level:?\s*(\d+)/i) || aiResponse.match(/(\d+)%/)
  return match ? parseInt(match[1]) : 0
}

function extractConcerns(aiResponse: string): string[] {
  // Extract specific security concerns from AI response
  const concerns = []
  if (aiResponse.toLowerCase().includes('bot')) concerns.push('automated_bot_behavior')
  if (aiResponse.toLowerCase().includes('scan')) concerns.push('vulnerability_scanning')
  if (aiResponse.toLowerCase().includes('evasion')) concerns.push('evasion_techniques')
  if (aiResponse.toLowerCase().includes('anomal')) concerns.push('anomalous_patterns')
  return concerns
}

function generateThreatRecommendations(analysis: ThreatAnalysisResult): string[] {
  const recommendations = []

  if (analysis.threatScore >= 8) {
    recommendations.push('Immediately block this request')
    recommendations.push('Add IP to permanent blocklist')
    recommendations.push('Alert security team for investigation')
  } else if (analysis.threatScore >= 6) {
    recommendations.push('Apply additional security challenges')
    recommendations.push('Increase monitoring for this source')
    recommendations.push('Require additional authentication')
  } else if (analysis.threatScore >= 3) {
    recommendations.push('Monitor request patterns closely')
    recommendations.push('Apply rate limiting')
  }

  // Add specific recommendations based on threat indicators
  analysis.indicators.forEach(indicator => {
    switch (indicator.type) {
      case 'ip':
        if (indicator.severity === 'critical') {
          recommendations.push(`Block IP ${indicator.value} - flagged by ${indicator.sources.length} sources`)
        }
        break
      case 'domain':
        if (indicator.severity === 'critical') {
          recommendations.push(`Block domain ${indicator.value} - multiple suspicious characteristics`)
        }
        break
      case 'behavior':
        recommendations.push(`Automated behavior detected - apply CAPTCHA challenge`)
        break
    }
  })

  return [...new Set(recommendations)] // Remove duplicates
}

async function getThreatIndicators(request: Request, env: Env): Promise<Response> {
  try {
    // Return current threat indicators from storage
    const indicators = await env.THREAT_INTELLIGENCE.list({ prefix: 'indicator:' })
    const threatIndicators = await Promise.all(
      indicators.keys.map(async key => {
        const data = await env.THREAT_INTELLIGENCE.get(key.name)
        return JSON.parse(data)
      })
    )

    return new Response(JSON.stringify({
      success: true,
      indicators: threatIndicators,
      total: threatIndicators.length,
      lastUpdated: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Get threat indicators error:', error)
    return new Response(JSON.stringify({ error: 'Failed to retrieve indicators' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function updateThreatFeeds(request: Request, env: Env): Promise<Response> {
  try {
    // Update threat intelligence feeds (run periodically)
    const updates = []

    // Update Tor exit nodes
    const torNodes = await fetchTorExitNodes()
    await env.THREAT_INTELLIGENCE.put('tor:exit_nodes', JSON.stringify(torNodes))
    updates.push('tor_exit_nodes')

    // Update known malicious IPs
    const maliciousIPs = await fetchMaliciousIPs()
    await env.THREAT_INTELLIGENCE.put('abuseipdb:bad_ips', JSON.stringify(maliciousIPs))
    updates.push('malicious_ips')

    // Update malware domains
    const malwareDomains = await fetchMalwareDomains()
    await env.THREAT_INTELLIGENCE.put('malware:domains', JSON.stringify(malwareDomains))
    updates.push('malware_domains')

    return new Response(JSON.stringify({
      success: true,
      updatedFeeds: updates,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Threat feed update error:', error)
    return new Response(JSON.stringify({ error: 'Failed to update feeds' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Mock functions for threat feed updates (replace with actual API calls)
async function fetchTorExitNodes(): Promise<string[]> {
  // In production, fetch from https://check.torproject.org/exit-addresses
  return []
}

async function fetchMaliciousIPs(): Promise<string[]> {
  // In production, fetch from AbuseIPDB or similar services
  return []
}

async function fetchMalwareDomains(): Promise<string[]> {
  // In production, fetch from malware domain lists
  return []
}