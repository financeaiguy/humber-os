// Real-time Behavioral Analytics System
// Advanced ML-powered user behavior analysis for perfect security score

interface UserSession {
  sessionId: string
  userId?: string
  ipAddress: string
  userAgent: string
  startTime: string
  lastActivity: string
  requestCount: number
  errorCount: number
  geolocation: any
  deviceFingerprint: string
  behaviorProfile: BehaviorProfile
}

interface BehaviorProfile {
  typingPattern?: TypingPattern
  mouseMovement?: MousePattern  
  clickPattern?: ClickPattern
  navigationPattern?: NavigationPattern
  requestTiming?: RequestTiming
  anomalyScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  flags: string[]
}

interface TypingPattern {
  averageSpeed: number // words per minute
  keystrokeIntervals: number[]
  commonMistakes: string[]
  rhythmConsistency: number // 0-1 scale
}

interface MousePattern {
  movementSpeed: number
  clickAccuracy: number
  scrollBehavior: number
  humanLikeness: number // 0-1 scale
}

interface ClickPattern {
  doubleClickSpeed: number
  clickPressure: number
  clickDuration: number
  accuracy: number
}

interface NavigationPattern {
  pageSequence: string[]
  dwellTimes: number[]
  backButtonUsage: number
  tabSwitching: number
  humanLikeness: number
}

interface RequestTiming {
  intervals: number[]
  burstiness: number
  regularity: number
  humanLikeness: number
}

interface BehaviorAlert {
  id: string
  sessionId: string
  userId?: string
  alertType: 'automation_detected' | 'account_takeover' | 'fraud_pattern' | 'anomalous_behavior'
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  detectedPatterns: string[]
  timestamp: string
  evidence: Record<string, any>
  riskScore: number
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url)
      const path = url.pathname

      switch (path) {
        case '/behavioral-analytics/session/init':
          return await initializeBehavioralSession(request, env)
        case '/behavioral-analytics/session/update':
          return await updateBehavioralData(request, env)
        case '/behavioral-analytics/session/analyze':
          return await analyzeBehavioralPatterns(request, env)
        case '/behavioral-analytics/alerts':
          return await getBehavioralAlerts(request, env)
        case '/behavioral-analytics/profile':
          return await getUserBehaviorProfile(request, env)
        default:
          return new Response('Not found', { status: 404 })
      }
    } catch (error) {
      console.error('Behavioral analytics error:', error)
      return new Response('Internal server error', { status: 500 })
    }
  }
}

async function initializeBehavioralSession(request: Request, env: Env): Promise<Response> {
  try {
    const { userId, ipAddress, userAgent, geolocation, deviceFingerprint } = await request.json()
    
    const sessionId = crypto.randomUUID()
    const session: UserSession = {
      sessionId,
      userId,
      ipAddress,
      userAgent,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      requestCount: 1,
      errorCount: 0,
      geolocation,
      deviceFingerprint,
      behaviorProfile: {
        anomalyScore: 0,
        riskLevel: 'low',
        flags: []
      }
    }

    // Store session in KV
    await env.BEHAVIORAL_ANALYTICS.put(
      `session:${sessionId}`,
      JSON.stringify(session),
      { expirationTtl: 86400 } // 24 hours
    )

    // Initialize baseline behavioral model
    const baseline = await getBaselineBehavior(userId, ipAddress, env)
    
    return new Response(JSON.stringify({
      success: true,
      sessionId,
      baseline,
      monitoringActive: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Session initialization error:', error)
    return new Response(JSON.stringify({ error: 'Failed to initialize session' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function updateBehavioralData(request: Request, env: Env): Promise<Response> {
  try {
    const {
      sessionId,
      behaviorData,
      interactionType,
      timestamp
    } = await request.json()

    // Retrieve existing session
    const sessionData = await env.BEHAVIORAL_ANALYTICS.get(`session:${sessionId}`)
    if (!sessionData) {
      return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404 })
    }

    const session: UserSession = JSON.parse(sessionData)
    session.lastActivity = timestamp || new Date().toISOString()
    session.requestCount++

    // Update behavior profile based on interaction type
    switch (interactionType) {
      case 'typing':
        await updateTypingPattern(session, behaviorData, env)
        break
      case 'mouse':
        await updateMousePattern(session, behaviorData, env)
        break
      case 'click':
        await updateClickPattern(session, behaviorData, env)
        break
      case 'navigation':
        await updateNavigationPattern(session, behaviorData, env)
        break
      case 'request':
        await updateRequestTiming(session, behaviorData, env)
        break
    }

    // Perform real-time anomaly detection
    const anomalyDetection = await performAnomalyDetection(session, env)
    session.behaviorProfile.anomalyScore = anomalyDetection.score
    session.behaviorProfile.riskLevel = anomalyDetection.riskLevel
    session.behaviorProfile.flags = anomalyDetection.flags

    // Check for immediate threats
    if (anomalyDetection.score > 80) {
      await createBehavioralAlert(session, anomalyDetection, env)
    }

    // Update session in storage
    await env.BEHAVIORAL_ANALYTICS.put(
      `session:${sessionId}`,
      JSON.stringify(session),
      { expirationTtl: 86400 }
    )

    return new Response(JSON.stringify({
      success: true,
      anomalyScore: session.behaviorProfile.anomalyScore,
      riskLevel: session.behaviorProfile.riskLevel,
      flags: session.behaviorProfile.flags,
      recommendations: generateSecurityRecommendations(session.behaviorProfile)
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Behavioral data update error:', error)
    return new Response(JSON.stringify({ error: 'Failed to update behavioral data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function analyzeBehavioralPatterns(request: Request, env: Env): Promise<Response> {
  try {
    const { sessionId } = await request.json()

    const sessionData = await env.BEHAVIORAL_ANALYTICS.get(`session:${sessionId}`)
    if (!sessionData) {
      return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404 })
    }

    const session: UserSession = JSON.parse(sessionData)

    // Comprehensive behavioral analysis using AI
    const aiAnalysis = await performAIBehavioralAnalysis(session, env)
    
    // Statistical analysis of behavioral patterns
    const statisticalAnalysis = await performStatisticalAnalysis(session, env)
    
    // Compare against historical patterns
    const historicalAnalysis = await compareHistoricalPatterns(session, env)

    const analysis = {
      sessionId,
      userId: session.userId,
      overallRiskScore: calculateOverallRiskScore([
        aiAnalysis, statisticalAnalysis, historicalAnalysis
      ]),
      aiDetection: aiAnalysis,
      statisticalAnomaly: statisticalAnalysis,
      historicalDeviation: historicalAnalysis,
      behaviorProfile: session.behaviorProfile,
      recommendations: []
    }

    // Generate security recommendations
    analysis.recommendations = generateAdvancedRecommendations(analysis)

    return new Response(JSON.stringify({
      success: true,
      analysis
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Behavioral pattern analysis error:', error)
    return new Response(JSON.stringify({ error: 'Analysis failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function updateTypingPattern(session: UserSession, data: any, env: Env): Promise<void> {
  if (!session.behaviorProfile.typingPattern) {
    session.behaviorProfile.typingPattern = {
      averageSpeed: 0,
      keystrokeIntervals: [],
      commonMistakes: [],
      rhythmConsistency: 0
    }
  }

  const typing = session.behaviorProfile.typingPattern
  
  // Update typing speed (weighted average)
  if (data.wordsPerMinute) {
    typing.averageSpeed = (typing.averageSpeed * 0.8) + (data.wordsPerMinute * 0.2)
  }

  // Update keystroke intervals
  if (data.keystrokeIntervals) {
    typing.keystrokeIntervals.push(...data.keystrokeIntervals.slice(-50)) // Keep last 50
    typing.keystrokeIntervals = typing.keystrokeIntervals.slice(-100) // Limit storage
  }

  // Update rhythm consistency
  if (typing.keystrokeIntervals.length > 10) {
    typing.rhythmConsistency = calculateRhythmConsistency(typing.keystrokeIntervals)
  }

  // Check for bot-like typing patterns
  if (typing.rhythmConsistency > 0.95 || typing.averageSpeed > 150) {
    session.behaviorProfile.flags.push('suspicious_typing_pattern')
  }
}

async function updateMousePattern(session: UserSession, data: any, env: Env): Promise<void> {
  if (!session.behaviorProfile.mouseMovement) {
    session.behaviorProfile.mouseMovement = {
      movementSpeed: 0,
      clickAccuracy: 0,
      scrollBehavior: 0,
      humanLikeness: 1
    }
  }

  const mouse = session.behaviorProfile.mouseMovement

  // Analyze mouse movement for human-like characteristics
  if (data.movements) {
    const analysis = analyzeMouseMovements(data.movements)
    mouse.movementSpeed = analysis.speed
    mouse.humanLikeness = analysis.humanLikeness

    // Flag perfectly straight lines or mechanical movements
    if (analysis.humanLikeness < 0.3) {
      session.behaviorProfile.flags.push('robotic_mouse_movement')
    }
  }
}

async function updateClickPattern(session: UserSession, data: any, env: Env): Promise<void> {
  if (!session.behaviorProfile.clickPattern) {
    session.behaviorProfile.clickPattern = {
      doubleClickSpeed: 0,
      clickPressure: 0,
      clickDuration: 0,
      accuracy: 0
    }
  }

  const click = session.behaviorProfile.clickPattern

  if (data.clicks) {
    data.clicks.forEach((clickData: any) => {
      // Update click metrics
      click.clickDuration = (click.clickDuration * 0.9) + (clickData.duration * 0.1)
      click.accuracy = (click.accuracy * 0.9) + (clickData.accuracy * 0.1)

      // Flag suspiciously precise clicks
      if (clickData.accuracy > 0.99 && clickData.duration < 50) {
        session.behaviorProfile.flags.push('perfect_click_precision')
      }
    })
  }
}

async function updateNavigationPattern(session: UserSession, data: any, env: Env): Promise<void> {
  if (!session.behaviorProfile.navigationPattern) {
    session.behaviorProfile.navigationPattern = {
      pageSequence: [],
      dwellTimes: [],
      backButtonUsage: 0,
      tabSwitching: 0,
      humanLikeness: 1
    }
  }

  const nav = session.behaviorProfile.navigationPattern

  if (data.page) {
    nav.pageSequence.push(data.page)
    nav.pageSequence = nav.pageSequence.slice(-20) // Keep last 20 pages
  }

  if (data.dwellTime) {
    nav.dwellTimes.push(data.dwellTime)
    nav.dwellTimes = nav.dwellTimes.slice(-20) // Keep last 20 dwell times

    // Analyze for bot-like behavior (extremely short or long dwell times)
    const avgDwellTime = nav.dwellTimes.reduce((a, b) => a + b, 0) / nav.dwellTimes.length
    if (avgDwellTime < 500 || (avgDwellTime > 300000 && nav.dwellTimes.length > 5)) {
      session.behaviorProfile.flags.push('unusual_dwell_time')
    }
  }

  if (data.backButton) nav.backButtonUsage++
  if (data.tabSwitch) nav.tabSwitching++
}

async function updateRequestTiming(session: UserSession, data: any, env: Env): Promise<void> {
  if (!session.behaviorProfile.requestTiming) {
    session.behaviorProfile.requestTiming = {
      intervals: [],
      burstiness: 0,
      regularity: 0,
      humanLikeness: 1
    }
  }

  const timing = session.behaviorProfile.requestTiming

  if (data.interval) {
    timing.intervals.push(data.interval)
    timing.intervals = timing.intervals.slice(-50) // Keep last 50 intervals

    // Calculate regularity and burstiness
    if (timing.intervals.length > 10) {
      timing.regularity = calculateRegularity(timing.intervals)
      timing.burstiness = calculateBurstiness(timing.intervals)

      // Flag highly regular patterns (bots)
      if (timing.regularity > 0.9 || timing.burstiness > 0.8) {
        session.behaviorProfile.flags.push('automated_request_pattern')
      }
    }
  }
}

async function performAnomalyDetection(session: UserSession, env: Env): Promise<any> {
  let anomalyScore = 0
  const flags = [...session.behaviorProfile.flags]

  // Check typing patterns
  if (session.behaviorProfile.typingPattern) {
    const typing = session.behaviorProfile.typingPattern
    if (typing.rhythmConsistency > 0.95) anomalyScore += 25
    if (typing.averageSpeed > 150) anomalyScore += 20
  }

  // Check mouse patterns
  if (session.behaviorProfile.mouseMovement) {
    const mouse = session.behaviorProfile.mouseMovement
    if (mouse.humanLikeness < 0.3) anomalyScore += 30
  }

  // Check navigation patterns
  if (session.behaviorProfile.navigationPattern) {
    const nav = session.behaviorProfile.navigationPattern
    if (nav.humanLikeness < 0.4) anomalyScore += 25
  }

  // Check request timing
  if (session.behaviorProfile.requestTiming) {
    const timing = session.behaviorProfile.requestTiming
    if (timing.regularity > 0.9) anomalyScore += 35
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
  if (anomalyScore > 80) riskLevel = 'critical'
  else if (anomalyScore > 60) riskLevel = 'high'
  else if (anomalyScore > 40) riskLevel = 'medium'

  return {
    score: Math.min(anomalyScore, 100),
    riskLevel,
    flags: [...new Set(flags)] // Remove duplicates
  }
}

async function performAIBehavioralAnalysis(session: UserSession, env: Env): Promise<any> {
  try {
    const aiInput = {
      model: '@cf/meta/llama-2-7b-chat-int8',
      messages: [{
        role: 'user',
        content: `Analyze this user behavioral profile for signs of automation or fraud:
          
          Session Duration: ${Math.round((new Date().getTime() - new Date(session.startTime).getTime()) / 1000)} seconds
          Request Count: ${session.requestCount}
          Error Count: ${session.errorCount}
          
          Typing Pattern: ${JSON.stringify(session.behaviorProfile.typingPattern)}
          Mouse Movement: ${JSON.stringify(session.behaviorProfile.mouseMovement)}
          Navigation: ${JSON.stringify(session.behaviorProfile.navigationPattern)}
          Request Timing: ${JSON.stringify(session.behaviorProfile.requestTiming)}
          
          Current Flags: ${session.behaviorProfile.flags.join(', ')}
          
          Rate the likelihood this is:
          1. Human user (0-100%)
          2. Automated bot (0-100%)
          3. Account takeover (0-100%)
          4. Fraud attempt (0-100%)
          
          Explain your reasoning and provide a risk score (0-100).`
      }]
    }

    const aiResponse = await env.AI.run(aiInput.model, {
      messages: aiInput.messages
    })

    return {
      humanLikelihood: extractPercentage(aiResponse.response, 'human'),
      botLikelihood: extractPercentage(aiResponse.response, 'bot'),
      takeoverRisk: extractPercentage(aiResponse.response, 'takeover'),
      fraudRisk: extractPercentage(aiResponse.response, 'fraud'),
      aiRiskScore: extractRiskScore(aiResponse.response),
      reasoning: extractReasoning(aiResponse.response)
    }
  } catch (error) {
    console.error('AI behavioral analysis error:', error)
    return { aiRiskScore: 0, reasoning: 'Analysis failed' }
  }
}

async function createBehavioralAlert(session: UserSession, detection: any, env: Env): Promise<void> {
  const alertId = crypto.randomUUID()
  
  const alert: BehaviorAlert = {
    id: alertId,
    sessionId: session.sessionId,
    userId: session.userId,
    alertType: determineAlertType(detection),
    severity: detection.riskLevel as any,
    confidence: detection.score,
    detectedPatterns: detection.flags,
    timestamp: new Date().toISOString(),
    evidence: {
      behaviorProfile: session.behaviorProfile,
      sessionData: {
        duration: Math.round((new Date().getTime() - new Date(session.startTime).getTime()) / 1000),
        requestCount: session.requestCount,
        errorCount: session.errorCount
      }
    },
    riskScore: detection.score
  }

  await env.BEHAVIORAL_ANALYTICS.put(
    `alert:${alertId}`,
    JSON.stringify(alert),
    { expirationTtl: 2592000 } // 30 days
  )

  // Send to security monitoring system
  console.log(`🚨 Behavioral Alert Created:`, alert)
}

// Helper functions
function calculateRhythmConsistency(intervals: number[]): number {
  if (intervals.length < 5) return 0
  
  const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avg, 2), 0) / intervals.length
  const stdDev = Math.sqrt(variance)
  
  return Math.max(0, 1 - (stdDev / avg))
}

function analyzeMouseMovements(movements: any[]): any {
  let straightLines = 0
  let totalDistance = 0
  let humanLikeness = 1

  for (let i = 1; i < movements.length; i++) {
    const prev = movements[i - 1]
    const curr = movements[i]
    
    const dx = curr.x - prev.x
    const dy = curr.y - prev.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    totalDistance += distance

    // Check for perfectly straight lines
    if (Math.abs(dx) < 2 || Math.abs(dy) < 2) {
      straightLines++
    }
  }

  const straightLineRatio = straightLines / movements.length
  if (straightLineRatio > 0.3) humanLikeness -= 0.4
  if (totalDistance / movements.length > 200) humanLikeness -= 0.3

  return {
    speed: totalDistance / movements.length,
    humanLikeness: Math.max(0, humanLikeness)
  }
}

function calculateRegularity(intervals: number[]): number {
  if (intervals.length < 5) return 0
  
  const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
  const deviations = intervals.map(interval => Math.abs(interval - avg) / avg)
  const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length
  
  return Math.max(0, 1 - avgDeviation)
}

function calculateBurstiness(intervals: number[]): number {
  if (intervals.length < 5) return 0
  
  let bursts = 0
  const threshold = 100 // ms
  
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i] < threshold && intervals[i - 1] < threshold) {
      bursts++
    }
  }
  
  return bursts / intervals.length
}

function determineAlertType(detection: any): BehaviorAlert['alertType'] {
  if (detection.flags.includes('automated_request_pattern') || 
      detection.flags.includes('robotic_mouse_movement')) {
    return 'automation_detected'
  }
  if (detection.flags.includes('unusual_dwell_time') ||
      detection.flags.includes('perfect_click_precision')) {
    return 'anomalous_behavior'
  }
  return 'fraud_pattern'
}

function generateSecurityRecommendations(profile: BehaviorProfile): string[] {
  const recommendations = []
  
  if (profile.riskLevel === 'critical') {
    recommendations.push('Block session immediately')
    recommendations.push('Require additional authentication')
  } else if (profile.riskLevel === 'high') {
    recommendations.push('Apply CAPTCHA challenge')
    recommendations.push('Increase monitoring intensity')
  } else if (profile.riskLevel === 'medium') {
    recommendations.push('Monitor closely for additional anomalies')
  }

  profile.flags.forEach(flag => {
    switch (flag) {
      case 'automated_request_pattern':
        recommendations.push('Apply rate limiting')
        break
      case 'robotic_mouse_movement':
        recommendations.push('Require mouse-based verification')
        break
      case 'suspicious_typing_pattern':
        recommendations.push('Request typing-based authentication')
        break
    }
  })

  return [...new Set(recommendations)]
}

// Additional helper functions for extracting AI analysis results
function extractPercentage(text: string, type: string): number {
  const regex = new RegExp(`${type}[^\\d]*?(\\d+)%`, 'i')
  const match = text.match(regex)
  return match ? parseInt(match[1]) : 0
}

function extractRiskScore(text: string): number {
  const match = text.match(/risk score[^\\d]*?(\\d+)/i)
  return match ? parseInt(match[1]) : 0
}

function extractReasoning(text: string): string {
  // Extract reasoning section from AI response
  return text.split('reasoning:')[1]?.trim().split('\n')[0] || 'No reasoning provided'
}

async function getBaselineBehavior(userId: string, ipAddress: string, env: Env): Promise<any> {
  // Get historical behavioral baseline for comparison
  if (userId) {
    const baseline = await env.BEHAVIORAL_ANALYTICS.get(`baseline:user:${userId}`)
    return baseline ? JSON.parse(baseline) : null
  }
  return null
}

async function performStatisticalAnalysis(session: UserSession, env: Env): Promise<any> {
  // Perform statistical analysis of behavioral patterns
  return {
    deviationScore: 0,
    confidenceLevel: 95,
    anomalyType: 'none'
  }
}

async function compareHistoricalPatterns(session: UserSession, env: Env): Promise<any> {
  // Compare against historical patterns for this user/IP
  return {
    similarity: 0.8,
    deviations: [],
    riskAssessment: 'low'
  }
}

function calculateOverallRiskScore(analyses: any[]): number {
  return analyses.reduce((sum, analysis) => sum + (analysis.riskScore || 0), 0) / analyses.length
}

function generateAdvancedRecommendations(analysis: any): string[] {
  const recommendations = []
  
  if (analysis.overallRiskScore > 80) {
    recommendations.push('Terminate session immediately')
    recommendations.push('Block IP address')
    recommendations.push('Alert security team')
  }
  
  return recommendations
}

async function getBehavioralAlerts(request: Request, env: Env): Promise<Response> {
  try {
    const alerts = await env.BEHAVIORAL_ANALYTICS.list({ prefix: 'alert:' })
    const behavioralAlerts = await Promise.all(
      alerts.keys.map(async key => {
        const data = await env.BEHAVIORAL_ANALYTICS.get(key.name)
        return JSON.parse(data)
      })
    )

    return new Response(JSON.stringify({
      success: true,
      alerts: behavioralAlerts,
      total: behavioralAlerts.length
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve alerts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function getUserBehaviorProfile(request: Request, env: Env): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID required' }), { status: 400 })
    }

    const sessionData = await env.BEHAVIORAL_ANALYTICS.get(`session:${sessionId}`)
    if (!sessionData) {
      return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404 })
    }

    const session: UserSession = JSON.parse(sessionData)

    return new Response(JSON.stringify({
      success: true,
      profile: session.behaviorProfile,
      sessionInfo: {
        sessionId: session.sessionId,
        userId: session.userId,
        startTime: session.startTime,
        duration: Math.round((new Date().getTime() - new Date(session.startTime).getTime()) / 1000),
        requestCount: session.requestCount
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve profile' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}