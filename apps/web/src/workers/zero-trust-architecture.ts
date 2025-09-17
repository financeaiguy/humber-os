// Zero Trust Architecture Implementation
// "Never trust, always verify" - Comprehensive zero trust security model

interface ZeroTrustPolicy {
  id: string
  name: string
  resource: string
  conditions: ZeroTrustCondition[]
  actions: ZeroTrustAction[]
  priority: number
  enabled: boolean
  createdDate: string
  lastModified: string
}

interface ZeroTrustCondition {
  type: 'user' | 'device' | 'location' | 'network' | 'behavior' | 'time' | 'risk_score'
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in_range'
  value: string | number | string[]
  description: string
}

interface ZeroTrustAction {
  type: 'allow' | 'deny' | 'challenge' | 'log' | 'limit' | 'redirect' | 'quarantine'
  parameters?: Record<string, any>
  description: string
}

interface DeviceTrust {
  deviceId: string
  deviceFingerprint: string
  trustLevel: 'unknown' | 'low' | 'medium' | 'high' | 'verified'
  attributes: {
    os: string
    browser: string
    version: string
    mobile: boolean
    managed: boolean
    compliant: boolean
    encrypted: boolean
    lastSeen: string
  }
  riskFactors: string[]
  complianceChecks: ComplianceCheck[]
}

interface ComplianceCheck {
  checkType: 'antivirus' | 'firewall' | 'encryption' | 'updates' | 'configuration'
  status: 'pass' | 'fail' | 'unknown'
  lastChecked: string
  details: string
}

interface NetworkContext {
  ipAddress: string
  networkType: 'corporate' | 'public' | 'home' | 'mobile' | 'unknown'
  geolocation: {
    country: string
    region: string
    city: string
    coordinates?: { lat: number; lon: number }
  }
  isp: string
  threatIntel: {
    reputation: 'good' | 'suspicious' | 'malicious' | 'unknown'
    sources: string[]
    lastChecked: string
  }
  vpnDetected: boolean
  torDetected: boolean
  proxyDetected: boolean
}

interface UserContext {
  userId: string
  roles: string[]
  permissions: string[]
  riskScore: number // 0-100
  attributes: {
    department: string
    jobTitle: string
    clearanceLevel: string
    contractorStatus: boolean
    lastPasswordChange: string
    mfaEnabled: boolean
    mfaDevice: string
  }
  behaviorProfile: {
    typicalLocations: string[]
    typicalDevices: string[]
    typicalHours: { start: number; end: number }
    usagePatterns: Record<string, number>
    anomalyScore: number
  }
}

interface AccessDecision {
  requestId: string
  timestamp: string
  decision: 'allow' | 'deny' | 'challenge'
  confidence: number // 0-100
  riskScore: number // 0-100
  reasons: string[]
  appliedPolicies: string[]
  requiredActions: ZeroTrustAction[]
  contextEvaluated: {
    user: UserContext
    device: DeviceTrust
    network: NetworkContext
    resource: string
    requestedAction: string
  }
  validUntil?: string
  continualMonitoring: boolean
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url)
      const path = url.pathname

      switch (path) {
        case '/zero-trust/evaluate':
          return await evaluateZeroTrustAccess(request, env)
        case '/zero-trust/policies':
          return await manageZeroTrustPolicies(request, env)
        case '/zero-trust/device/register':
          return await registerDevice(request, env)
        case '/zero-trust/device/verify':
          return await verifyDevice(request, env)
        case '/zero-trust/context/analyze':
          return await analyzeRequestContext(request, env)
        case '/zero-trust/decisions/audit':
          return await auditAccessDecisions(request, env)
        default:
          return new Response('Not found', { status: 404 })
      }
    } catch (error) {
      console.error('Zero Trust Architecture error:', error)
      return new Response('Internal server error', { status: 500 })
    }
  }
}

async function evaluateZeroTrustAccess(request: Request, env: Env): Promise<Response> {
  try {
    const {
      userId,
      deviceFingerprint,
      requestedResource,
      requestedAction,
      ipAddress,
      userAgent,
      contextData
    } = await request.json()

    const requestId = crypto.randomUUID()
    
    // 1. Gather comprehensive context
    const userContext = await buildUserContext(userId, env)
    const deviceTrust = await evaluateDeviceTrust(deviceFingerprint, userAgent, env)
    const networkContext = await analyzeNetworkContext(ipAddress, env)
    
    // 2. Calculate initial risk score
    let riskScore = 0
    const riskFactors = []

    // User risk factors
    if (!userContext.attributes.mfaEnabled) {
      riskScore += 30
      riskFactors.push('MFA not enabled')
    }
    if (userContext.riskScore > 50) {
      riskScore += userContext.riskScore * 0.4
      riskFactors.push('High user risk score')
    }

    // Device risk factors
    if (deviceTrust.trustLevel === 'unknown' || deviceTrust.trustLevel === 'low') {
      riskScore += 40
      riskFactors.push('Untrusted device')
    }
    if (!deviceTrust.attributes.managed) {
      riskScore += 20
      riskFactors.push('Unmanaged device')
    }
    if (!deviceTrust.attributes.compliant) {
      riskScore += 25
      riskFactors.push('Non-compliant device')
    }

    // Network risk factors
    if (networkContext.threatIntel.reputation === 'suspicious') {
      riskScore += 30
      riskFactors.push('Suspicious network reputation')
    }
    if (networkContext.threatIntel.reputation === 'malicious') {
      riskScore += 60
      riskFactors.push('Malicious network detected')
    }
    if (networkContext.vpnDetected || networkContext.torDetected) {
      riskScore += 15
      riskFactors.push('VPN/Tor usage detected')
    }

    // 3. Apply zero trust policies
    const applicablePolicies = await findApplicablePolicies(
      userContext,
      deviceTrust,
      networkContext,
      requestedResource,
      requestedAction,
      env
    )

    // 4. Evaluate behavioral anomalies
    const behaviorAnomaly = await detectBehavioralAnomalies(
      userContext,
      deviceTrust,
      networkContext,
      contextData,
      env
    )
    
    if (behaviorAnomaly.score > 70) {
      riskScore += behaviorAnomaly.score * 0.3
      riskFactors.push(`Behavioral anomaly detected: ${behaviorAnomaly.reason}`)
    }

    // 5. Make access decision
    const decision = makeAccessDecision(riskScore, applicablePolicies, userContext, deviceTrust)
    
    const accessDecision: AccessDecision = {
      requestId,
      timestamp: new Date().toISOString(),
      decision: decision.outcome,
      confidence: decision.confidence,
      riskScore: Math.min(riskScore, 100),
      reasons: riskFactors,
      appliedPolicies: applicablePolicies.map(p => p.name),
      requiredActions: decision.actions,
      contextEvaluated: {
        user: userContext,
        device: deviceTrust,
        network: networkContext,
        resource: requestedResource,
        requestedAction
      },
      validUntil: decision.outcome === 'allow' ? calculateValidUntil(riskScore) : undefined,
      continualMonitoring: true
    }

    // 6. Store decision for audit
    await env.ZERO_TRUST.put(
      `decision:${requestId}`,
      JSON.stringify(accessDecision),
      { expirationTtl: 2592000 } // 30 days
    )

    // 7. Start continual monitoring if access granted
    if (decision.outcome === 'allow') {
      await initiateContinualMonitoring(requestId, userContext, deviceTrust, networkContext, env)
    }

    return new Response(JSON.stringify({
      success: true,
      requestId,
      decision: accessDecision.decision,
      confidence: accessDecision.confidence,
      riskScore: accessDecision.riskScore,
      requiredActions: accessDecision.requiredActions,
      validUntil: accessDecision.validUntil,
      reasons: accessDecision.reasons
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Zero trust evaluation error:', error)
    return new Response(JSON.stringify({ 
      error: 'Access evaluation failed',
      decision: 'deny'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function buildUserContext(userId: string, env: Env): Promise<UserContext> {
  // Build comprehensive user context from multiple sources
  const userProfile = await getUserProfile(userId, env)
  const riskScore = await calculateUserRiskScore(userId, env)
  const behaviorProfile = await getUserBehaviorProfile(userId, env)

  return {
    userId,
    roles: userProfile.roles || [],
    permissions: userProfile.permissions || [],
    riskScore,
    attributes: {
      department: userProfile.department || 'unknown',
      jobTitle: userProfile.jobTitle || 'unknown',
      clearanceLevel: userProfile.clearanceLevel || 'standard',
      contractorStatus: userProfile.contractorStatus || false,
      lastPasswordChange: userProfile.lastPasswordChange || new Date().toISOString(),
      mfaEnabled: userProfile.mfaEnabled || false,
      mfaDevice: userProfile.mfaDevice || 'none'
    },
    behaviorProfile: behaviorProfile || {
      typicalLocations: [],
      typicalDevices: [],
      typicalHours: { start: 9, end: 17 },
      usagePatterns: {},
      anomalyScore: 0
    }
  }
}

async function evaluateDeviceTrust(fingerprint: string, userAgent: string, env: Env): Promise<DeviceTrust> {
  // Evaluate device trust level based on multiple factors
  const existingDevice = await env.ZERO_TRUST.get(`device:${fingerprint}`)
  
  if (existingDevice) {
    const device: DeviceTrust = JSON.parse(existingDevice)
    device.attributes.lastSeen = new Date().toISOString()
    
    // Update device info
    await env.ZERO_TRUST.put(`device:${fingerprint}`, JSON.stringify(device))
    return device
  }

  // New device - perform initial trust assessment
  const deviceInfo = parseUserAgent(userAgent)
  const complianceChecks = await performDeviceComplianceChecks(fingerprint, deviceInfo, env)
  
  const newDevice: DeviceTrust = {
    deviceId: crypto.randomUUID(),
    deviceFingerprint: fingerprint,
    trustLevel: 'unknown',
    attributes: {
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      version: deviceInfo.version,
      mobile: deviceInfo.mobile,
      managed: false, // Requires device management enrollment
      compliant: complianceChecks.every(check => check.status === 'pass'),
      encrypted: false, // Requires device attestation
      lastSeen: new Date().toISOString()
    },
    riskFactors: [],
    complianceChecks
  }

  // Calculate initial trust level
  newDevice.trustLevel = calculateDeviceTrustLevel(newDevice)
  
  // Store new device
  await env.ZERO_TRUST.put(`device:${fingerprint}`, JSON.stringify(newDevice))
  
  return newDevice
}

async function analyzeNetworkContext(ipAddress: string, env: Env): Promise<NetworkContext> {
  // Analyze network context and threat intelligence
  const geoData = await getGeolocationData(ipAddress, env)
  const threatIntel = await getIPThreatIntelligence(ipAddress, env)
  const networkType = await detectNetworkType(ipAddress, env)
  
  return {
    ipAddress,
    networkType,
    geolocation: geoData,
    isp: geoData.isp || 'unknown',
    threatIntel,
    vpnDetected: await detectVPN(ipAddress, env),
    torDetected: await detectTor(ipAddress, env),
    proxyDetected: await detectProxy(ipAddress, env)
  }
}

async function findApplicablePolicies(
  user: UserContext,
  device: DeviceTrust,
  network: NetworkContext,
  resource: string,
  action: string,
  env: Env
): Promise<ZeroTrustPolicy[]> {
  // Find all policies that apply to this access request
  const allPolicies = await env.ZERO_TRUST.list({ prefix: 'policy:' })
  const applicablePolicies: ZeroTrustPolicy[] = []

  for (const policyKey of allPolicies.keys) {
    const policyData = await env.ZERO_TRUST.get(policyKey.name)
    const policy: ZeroTrustPolicy = JSON.parse(policyData)

    if (!policy.enabled) continue

    // Check if policy applies to this resource
    if (policy.resource !== '*' && !resource.match(new RegExp(policy.resource))) continue

    // Evaluate all conditions
    const conditionsMet = await evaluatePolicyConditions(policy.conditions, {
      user,
      device,
      network,
      resource,
      action
    })

    if (conditionsMet) {
      applicablePolicies.push(policy)
    }
  }

  // Sort by priority (higher priority first)
  return applicablePolicies.sort((a, b) => b.priority - a.priority)
}

async function detectBehavioralAnomalies(
  user: UserContext,
  device: DeviceTrust,
  network: NetworkContext,
  contextData: any,
  env: Env
): Promise<{ score: number; reason: string }> {
  let anomalyScore = 0
  const anomalies = []

  // Check location anomaly
  if (!user.behaviorProfile.typicalLocations.includes(network.geolocation.country)) {
    anomalyScore += 40
    anomalies.push(`Unusual location: ${network.geolocation.country}`)
  }

  // Check device anomaly
  if (!user.behaviorProfile.typicalDevices.includes(device.deviceFingerprint)) {
    anomalyScore += 30
    anomalies.push('Unknown device')
  }

  // Check time anomaly
  const currentHour = new Date().getHours()
  if (currentHour < user.behaviorProfile.typicalHours.start || 
      currentHour > user.behaviorProfile.typicalHours.end) {
    anomalyScore += 20
    anomalies.push('Unusual access time')
  }

  return {
    score: Math.min(anomalyScore, 100),
    reason: anomalies.join(', ')
  }
}

function makeAccessDecision(
  riskScore: number,
  policies: ZeroTrustPolicy[],
  user: UserContext,
  device: DeviceTrust
): { outcome: 'allow' | 'deny' | 'challenge'; confidence: number; actions: ZeroTrustAction[] } {
  
  // Apply policy actions in priority order
  for (const policy of policies) {
    for (const action of policy.actions) {
      if (action.type === 'deny') {
        return {
          outcome: 'deny',
          confidence: 95,
          actions: [action]
        }
      }
    }
  }

  // Risk-based decision
  if (riskScore > 80) {
    return {
      outcome: 'deny',
      confidence: Math.min(riskScore, 95),
      actions: [{
        type: 'deny',
        description: 'High risk score detected'
      }]
    }
  }

  if (riskScore > 50 || !user.attributes.mfaEnabled || device.trustLevel === 'unknown') {
    return {
      outcome: 'challenge',
      confidence: 85,
      actions: [{
        type: 'challenge',
        parameters: {
          challengeType: 'mfa',
          methods: ['totp', 'sms', 'push']
        },
        description: 'Additional verification required'
      }]
    }
  }

  return {
    outcome: 'allow',
    confidence: Math.max(100 - riskScore, 70),
    actions: [{
      type: 'log',
      description: 'Access granted with continual monitoring'
    }]
  }
}

async function initiateContinualMonitoring(
  requestId: string,
  user: UserContext,
  device: DeviceTrust,
  network: NetworkContext,
  env: Env
): Promise<void> {
  // Set up continual monitoring for this access session
  const monitoringConfig = {
    requestId,
    userId: user.userId,
    deviceId: device.deviceId,
    startTime: new Date().toISOString(),
    checkInterval: 300, // 5 minutes
    riskThreshold: 60,
    behaviorBaseline: {
      typicalActivity: user.behaviorProfile.usagePatterns,
      expectedLocation: network.geolocation.country,
      expectedDevice: device.deviceFingerprint
    }
  }

  await env.ZERO_TRUST.put(
    `monitoring:${requestId}`,
    JSON.stringify(monitoringConfig),
    { expirationTtl: 86400 } // 24 hours
  )

  console.log(`🔍 Continual monitoring initiated for request ${requestId}`)
}

function calculateValidUntil(riskScore: number): string {
  const now = new Date()
  let validityHours = 8 // Default 8 hours

  // Reduce validity period based on risk
  if (riskScore > 40) validityHours = 4
  if (riskScore > 60) validityHours = 2
  if (riskScore > 80) validityHours = 1

  now.setHours(now.getHours() + validityHours)
  return now.toISOString()
}

// Helper functions
function parseUserAgent(userAgent: string): any {
  // Parse user agent string to extract device/browser info
  return {
    os: extractOS(userAgent),
    browser: extractBrowser(userAgent),
    version: extractVersion(userAgent),
    mobile: userAgent.toLowerCase().includes('mobile')
  }
}

function extractOS(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows'
  if (userAgent.includes('Mac OS')) return 'macOS'
  if (userAgent.includes('Linux')) return 'Linux'
  if (userAgent.includes('Android')) return 'Android'
  if (userAgent.includes('iOS')) return 'iOS'
  return 'Unknown'
}

function extractBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  return 'Unknown'
}

function extractVersion(userAgent: string): string {
  const match = userAgent.match(/(?:Chrome|Firefox|Safari|Edge)\/([0-9.]+)/)
  return match ? match[1] : 'Unknown'
}

function calculateDeviceTrustLevel(device: DeviceTrust): DeviceTrust['trustLevel'] {
  let score = 0
  
  if (device.attributes.managed) score += 30
  if (device.attributes.compliant) score += 25
  if (device.attributes.encrypted) score += 20
  if (device.complianceChecks.every(check => check.status === 'pass')) score += 25

  if (score >= 80) return 'verified'
  if (score >= 60) return 'high'
  if (score >= 40) return 'medium'
  if (score >= 20) return 'low'
  return 'unknown'
}

async function evaluatePolicyConditions(
  conditions: ZeroTrustCondition[],
  context: any
): Promise<boolean> {
  for (const condition of conditions) {
    const result = await evaluateCondition(condition, context)
    if (!result) return false
  }
  return true
}

async function evaluateCondition(condition: ZeroTrustCondition, context: any): Promise<boolean> {
  const { type, operator, value } = condition
  let actualValue: any

  switch (type) {
    case 'user':
      actualValue = context.user.userId
      break
    case 'device':
      actualValue = context.device.trustLevel
      break
    case 'location':
      actualValue = context.network.geolocation.country
      break
    case 'risk_score':
      actualValue = context.user.riskScore
      break
    default:
      return true
  }

  return evaluateOperator(actualValue, operator, value)
}

function evaluateOperator(actual: any, operator: string, expected: any): boolean {
  switch (operator) {
    case 'equals': return actual === expected
    case 'not_equals': return actual !== expected
    case 'contains': return String(actual).includes(String(expected))
    case 'not_contains': return !String(actual).includes(String(expected))
    case 'greater_than': return Number(actual) > Number(expected)
    case 'less_than': return Number(actual) < Number(expected)
    case 'in_range':
      const [min, max] = Array.isArray(expected) ? expected : [0, 100]
      return Number(actual) >= min && Number(actual) <= max
    default:
      return false
  }
}

// Mock functions for external integrations (replace with actual implementations)
async function getUserProfile(userId: string, env: Env): Promise<any> {
  return {
    roles: ['ENGINEER_EMPLOYEE'],
    permissions: ['read_projects', 'update_timesheets'],
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    mfaEnabled: true,
    mfaDevice: 'authenticator_app'
  }
}

async function calculateUserRiskScore(userId: string, env: Env): Promise<number> {
  // Calculate user risk based on recent activities, violations, etc.
  return 25
}

async function getUserBehaviorProfile(userId: string, env: Env): Promise<any> {
  return {
    typicalLocations: ['US', 'Canada'],
    typicalDevices: [],
    typicalHours: { start: 9, end: 17 },
    usagePatterns: {},
    anomalyScore: 15
  }
}

async function performDeviceComplianceChecks(fingerprint: string, deviceInfo: any, env: Env): Promise<ComplianceCheck[]> {
  return [
    {
      checkType: 'antivirus',
      status: 'unknown',
      lastChecked: new Date().toISOString(),
      details: 'Antivirus status unknown - requires device agent'
    },
    {
      checkType: 'firewall',
      status: 'unknown',
      lastChecked: new Date().toISOString(),
      details: 'Firewall status unknown - requires device agent'
    },
    {
      checkType: 'updates',
      status: 'unknown',
      lastChecked: new Date().toISOString(),
      details: 'Update status unknown - requires device agent'
    }
  ]
}

async function getGeolocationData(ip: string, env: Env): Promise<any> {
  return {
    country: 'US',
    region: 'California',
    city: 'San Francisco',
    isp: 'CloudFlare Inc.'
  }
}

async function getIPThreatIntelligence(ip: string, env: Env): Promise<any> {
  return {
    reputation: 'good',
    sources: ['cloudflare_radar'],
    lastChecked: new Date().toISOString()
  }
}

async function detectNetworkType(ip: string, env: Env): Promise<NetworkContext['networkType']> {
  return 'public'
}

async function detectVPN(ip: string, env: Env): Promise<boolean> { return false }
async function detectTor(ip: string, env: Env): Promise<boolean> { return false }
async function detectProxy(ip: string, env: Env): Promise<boolean> { return false }

// Additional endpoint implementations
async function manageZeroTrustPolicies(request: Request, env: Env): Promise<Response> {
  const method = request.method
  
  switch (method) {
    case 'GET':
      // List policies
      const policies = await env.ZERO_TRUST.list({ prefix: 'policy:' })
      const policyList = await Promise.all(
        policies.keys.map(async key => {
          const data = await env.ZERO_TRUST.get(key.name)
          return JSON.parse(data)
        })
      )
      return new Response(JSON.stringify({ success: true, policies: policyList }))

    case 'POST':
      // Create policy
      const policyData = await request.json()
      const policyId = crypto.randomUUID()
      const newPolicy: ZeroTrustPolicy = {
        id: policyId,
        ...policyData,
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
      await env.ZERO_TRUST.put(`policy:${policyId}`, JSON.stringify(newPolicy))
      return new Response(JSON.stringify({ success: true, policyId }))

    default:
      return new Response('Method not allowed', { status: 405 })
  }
}

async function registerDevice(request: Request, env: Env): Promise<Response> {
  const { deviceFingerprint, userAgent, userId, deviceInfo } = await request.json()
  
  // Create managed device registration
  const device: DeviceTrust = {
    deviceId: crypto.randomUUID(),
    deviceFingerprint,
    trustLevel: 'medium', // Starts higher for registered devices
    attributes: {
      ...parseUserAgent(userAgent),
      managed: true,
      compliant: true,
      encrypted: deviceInfo.encrypted || false,
      lastSeen: new Date().toISOString()
    },
    riskFactors: [],
    complianceChecks: []
  }

  await env.ZERO_TRUST.put(`device:${deviceFingerprint}`, JSON.stringify(device))
  
  return new Response(JSON.stringify({
    success: true,
    deviceId: device.deviceId,
    trustLevel: device.trustLevel
  }))
}

async function verifyDevice(request: Request, env: Env): Promise<Response> {
  const { deviceFingerprint, attestationData } = await request.json()
  
  const deviceData = await env.ZERO_TRUST.get(`device:${deviceFingerprint}`)
  if (!deviceData) {
    return new Response(JSON.stringify({ error: 'Device not found' }), { status: 404 })
  }

  const device: DeviceTrust = JSON.parse(deviceData)
  
  // Verify attestation and update trust level
  if (attestationData.verified) {
    device.trustLevel = 'verified'
    device.attributes.compliant = true
    device.attributes.encrypted = true
  }

  await env.ZERO_TRUST.put(`device:${deviceFingerprint}`, JSON.stringify(device))
  
  return new Response(JSON.stringify({
    success: true,
    trustLevel: device.trustLevel
  }))
}

async function analyzeRequestContext(request: Request, env: Env): Promise<Response> {
  const contextData = await request.json()
  
  // Analyze request context for anomalies
  const analysis = {
    riskScore: 25,
    anomalies: [],
    recommendations: ['Continue monitoring', 'No immediate action required'],
    trustLevel: 'medium'
  }

  return new Response(JSON.stringify({
    success: true,
    analysis
  }))
}

async function auditAccessDecisions(request: Request, env: Env): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const userId = searchParams.get('userId')
  
  // Get access decision audit trail
  const decisions = await env.ZERO_TRUST.list({ prefix: 'decision:' })
  const auditTrail = await Promise.all(
    decisions.keys.slice(0, 100).map(async key => { // Limit to 100 for performance
      const data = await env.ZERO_TRUST.get(key.name)
      return JSON.parse(data)
    })
  )

  return new Response(JSON.stringify({
    success: true,
    decisions: auditTrail,
    total: auditTrail.length
  }))
}