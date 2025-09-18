import { EventEmitter } from 'events'
import { continuousLearning } from './continuous-learning'

export interface UserProfile {
  id: string
  type: 'recruit' | 'engineer' | 'operator' | 'admin'
  tenantId: string
  onboardingData?: OnboardingData
  recruitmentData?: RecruitmentData
  bullpenData?: BullpenData
  metadata: {
    createdAt: Date
    lastActive: Date
    dataPoints: number
    learningContributions: number
  }
}

export interface OnboardingData {
  startedAt: Date
  completedAt?: Date
  steps: OnboardingStep[]
  documents: Document[]
  verifications: Verification[]
  preferences: UserPreferences
  interactions: Interaction[]
}

export interface OnboardingStep {
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  duration: number
  attempts: number
  data: any
  feedback?: string
}

export interface RecruitmentData {
  source: string
  pipeline: PipelineStage[]
  assessments: Assessment[]
  interviews: Interview[]
  skills: Skill[]
  experience: Experience[]
  decisions: Decision[]
  communications: Communication[]
}

export interface PipelineStage {
  stage: string
  enteredAt: Date
  exitedAt?: Date
  status: 'active' | 'passed' | 'failed' | 'withdrawn'
  notes: string[]
  scores: Record<string, number>
}

export interface BullpenData {
  assignments: Assignment[]
  performance: PerformanceMetric[]
  availability: AvailabilityWindow[]
  skills: SkillUtilization[]
  feedback: Feedback[]
  timeTracking: TimeEntry[]
  trustVerification: TrustScore[]
}

export interface Assignment {
  id: string
  projectId: string
  role: string
  startDate: Date
  endDate?: Date
  performance: number
  deliverables: Deliverable[]
  clientFeedback?: string
}

export interface PerformanceMetric {
  metric: string
  value: number
  timestamp: Date
  context: Record<string, any>
}

export interface Document {
  type: string
  uploadedAt: Date
  verificationStatus: 'pending' | 'verified' | 'rejected'
  extractedData?: Record<string, any>
}

export interface Verification {
  type: 'identity' | 'background' | 'skills' | 'reference'
  status: 'pending' | 'passed' | 'failed'
  provider: string
  completedAt?: Date
  score?: number
}

export interface UserPreferences {
  workLocation: string[]
  jobTypes: string[]
  industries: string[]
  salary: { min: number; max: number }
  benefits: string[]
  schedule: string
}

export interface Interaction {
  timestamp: Date
  type: string
  component: string
  action: string
  data: any
  duration: number
  outcome?: string
}

export interface Assessment {
  type: string
  score: number
  completedAt: Date
  details: Record<string, any>
}

export interface Interview {
  type: 'phone' | 'video' | 'onsite'
  interviewer: string
  date: Date
  duration: number
  rating: number
  notes: string
  decision: 'pass' | 'fail' | 'maybe'
}

export interface Skill {
  name: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  verified: boolean
  endorsements: number
  lastUsed?: Date
}

export interface Experience {
  company: string
  role: string
  startDate: Date
  endDate?: Date
  description: string
  achievements: string[]
  technologies: string[]
}

export interface Decision {
  type: string
  madeBy: string
  madeAt: Date
  outcome: string
  reasoning: string
  confidence: number
}

export interface Communication {
  type: 'email' | 'phone' | 'sms' | 'in_app'
  direction: 'inbound' | 'outbound'
  timestamp: Date
  subject?: string
  sentiment?: number
  responseTime?: number
}

export interface AvailabilityWindow {
  startDate: Date
  endDate: Date
  type: 'available' | 'tentative' | 'unavailable'
  reason?: string
}

export interface SkillUtilization {
  skill: string
  projectId: string
  hoursUsed: number
  efficiency: number
  improvement: number
}

export interface Feedback {
  source: 'client' | 'peer' | 'manager' | 'self'
  rating: number
  comment: string
  date: Date
  actionItems?: string[]
}

export interface TimeEntry {
  date: Date
  projectId: string
  hours: number
  verificationMethod: 'biometric' | 'gps' | 'manual' | 'automated'
  trustScore: number
  anomalies?: string[]
}

export interface TrustScore {
  timestamp: Date
  score: number
  factors: {
    biometric: number
    location: number
    pattern: number
    consistency: number
  }
  alerts?: string[]
}

export interface Deliverable {
  name: string
  completedAt: Date
  quality: number
  onTime: boolean
  feedback?: string
}

class UnifiedDataCollector extends EventEmitter {
  private static instance: UnifiedDataCollector
  private userProfiles: Map<string, UserProfile> = new Map()
  private dataStreams: Map<string, DataStream> = new Map()
  private aggregationQueue: AggregationTask[] = []
  private processingInterval?: NodeJS.Timeout

  private constructor() {
    super()
    this.startProcessing()
  }

  static getInstance(): UnifiedDataCollector {
    if (!UnifiedDataCollector.instance) {
      UnifiedDataCollector.instance = new UnifiedDataCollector()
    }
    return UnifiedDataCollector.instance
  }

  private startProcessing() {
    this.processingInterval = setInterval(() => {
      this.processAggregationQueue()
    }, 5000)
  }

  async collectOnboardingData(
    userId: string,
    step: OnboardingStep,
    context?: any
  ): Promise<void> {
    const profile = this.getOrCreateProfile(userId, 'recruit')
    
    if (!profile.onboardingData) {
      profile.onboardingData = {
        startedAt: new Date(),
        steps: [],
        documents: [],
        verifications: [],
        preferences: {} as UserPreferences,
        interactions: []
      }
    }

    profile.onboardingData.steps.push(step)

    await continuousLearning.learn({
      userId,
      type: 'onboarding',
      step: step.name,
      status: step.status,
      data: step.data,
      duration: step.duration,
      context
    }, 'user_activity')

    this.analyzeOnboardingPattern(userId, step)
    this.updateProfile(profile)
  }

  async collectRecruitmentData(
    userId: string,
    dataType: keyof RecruitmentData,
    data: any
  ): Promise<void> {
    const profile = this.getOrCreateProfile(userId, 'recruit')
    
    if (!profile.recruitmentData) {
      profile.recruitmentData = {
        source: '',
        pipeline: [],
        assessments: [],
        interviews: [],
        skills: [],
        experience: [],
        decisions: [],
        communications: []
      }
    }

    if (Array.isArray(profile.recruitmentData[dataType])) {
      (profile.recruitmentData[dataType] as any[]).push(data)
    } else {
      (profile.recruitmentData as any)[dataType] = data
    }

    await continuousLearning.learn({
      userId,
      type: 'recruitment',
      dataType,
      data,
      timestamp: new Date()
    }, 'recruitment')

    this.analyzeRecruitmentProgress(userId, dataType, data)
    this.updateProfile(profile)
  }

  async collectBullpenData(
    userId: string,
    dataType: keyof BullpenData,
    data: any
  ): Promise<void> {
    const profile = this.getOrCreateProfile(userId, 'engineer')
    
    if (!profile.bullpenData) {
      profile.bullpenData = {
        assignments: [],
        performance: [],
        availability: [],
        skills: [],
        feedback: [],
        timeTracking: [],
        trustVerification: []
      }
    }

    if (Array.isArray(profile.bullpenData[dataType])) {
      (profile.bullpenData[dataType] as any[]).push(data)
    }

    await continuousLearning.learn({
      userId,
      type: 'bullpen',
      dataType,
      data,
      timestamp: new Date()
    }, 'performance')

    this.analyzeBullpenPerformance(userId, dataType, data)
    this.updateProfile(profile)
  }

  async collectTimeTracking(
    userId: string,
    entry: TimeEntry
  ): Promise<void> {
    const profile = this.getOrCreateProfile(userId, 'engineer')
    
    if (!profile.bullpenData) {
      profile.bullpenData = {
        assignments: [],
        performance: [],
        availability: [],
        skills: [],
        feedback: [],
        timeTracking: [],
        trustVerification: []
      }
    }

    profile.bullpenData.timeTracking.push(entry)

    await continuousLearning.learn({
      userId,
      type: 'time_tracking',
      entry,
      trustScore: entry.trustScore,
      verificationMethod: entry.verificationMethod,
      anomalies: entry.anomalies
    }, 'trust_verification')

    this.analyzeTrustPattern(userId, entry)
    this.updateProfile(profile)
  }

  async aggregateUserData(userId: string): Promise<AggregatedData> {
    const profile = this.userProfiles.get(userId)
    if (!profile) {
      throw new Error(`No profile found for user ${userId}`)
    }

    const aggregated: AggregatedData = {
      userId,
      userType: profile.type,
      tenantId: profile.tenantId,
      totalDataPoints: this.countDataPoints(profile),
      learningContributions: profile.metadata.learningContributions,
      insights: await this.generateInsights(profile),
      patterns: await this.identifyPatterns(profile),
      recommendations: await this.generateRecommendations(profile),
      riskFactors: await this.assessRiskFactors(profile),
      growthMetrics: await this.calculateGrowthMetrics(profile)
    }

    await continuousLearning.learn({
      userId,
      type: 'aggregation',
      aggregated,
      timestamp: new Date()
    }, 'analytics')

    return aggregated
  }

  async crossReferenceData(
    userIds: string[],
    correlationType: 'skills' | 'performance' | 'availability' | 'trust'
  ): Promise<CrossReferenceResult> {
    const profiles = userIds
      .map(id => this.userProfiles.get(id))
      .filter(p => p) as UserProfile[]

    const result: CrossReferenceResult = {
      type: correlationType,
      userCount: profiles.length,
      correlations: [],
      insights: [],
      recommendations: []
    }

    switch (correlationType) {
      case 'skills':
        result.correlations = await this.correlateSkills(profiles)
        break
      case 'performance':
        result.correlations = await this.correlatePerformance(profiles)
        break
      case 'availability':
        result.correlations = await this.correlateAvailability(profiles)
        break
      case 'trust':
        result.correlations = await this.correlateTrust(profiles)
        break
    }

    await continuousLearning.learn({
      type: 'cross_reference',
      correlationType,
      userIds,
      result,
      timestamp: new Date()
    }, 'pattern_recognition')

    return result
  }

  private analyzeOnboardingPattern(userId: string, step: OnboardingStep) {
    const patterns = {
      completionRate: this.calculateCompletionRate(userId),
      averageDuration: this.calculateAverageDuration(userId),
      dropoffPoints: this.identifyDropoffPoints(userId),
      successFactors: this.identifySuccessFactors(userId)
    }

    this.emit('onboardingPattern', { userId, step, patterns })
  }

  private analyzeRecruitmentProgress(
    userId: string,
    dataType: string,
    data: any
  ) {
    const progress = {
      stage: this.getCurrentStage(userId),
      velocity: this.calculateVelocity(userId),
      qualityScore: this.calculateQualityScore(userId),
      predictedOutcome: this.predictOutcome(userId)
    }

    this.emit('recruitmentProgress', { userId, dataType, data, progress })
  }

  private analyzeBullpenPerformance(
    userId: string,
    dataType: string,
    data: any
  ) {
    const performance = {
      utilizationRate: this.calculateUtilization(userId),
      performanceScore: this.calculatePerformanceScore(userId),
      reliabilityIndex: this.calculateReliability(userId),
      growthTrajectory: this.calculateGrowth(userId)
    }

    this.emit('bullpenPerformance', { userId, dataType, data, performance })
  }

  private analyzeTrustPattern(userId: string, entry: TimeEntry) {
    const trustAnalysis = {
      consistencyScore: this.calculateConsistency(userId),
      anomalyRate: this.calculateAnomalyRate(userId),
      verificationStrength: this.calculateVerificationStrength(entry),
      riskLevel: this.assessRiskLevel(userId)
    }

    this.emit('trustPattern', { userId, entry, trustAnalysis })
  }

  private async generateInsights(profile: UserProfile): Promise<Insight[]> {
    const insights: Insight[] = []

    if (profile.onboardingData) {
      insights.push(...await this.generateOnboardingInsights(profile))
    }

    if (profile.recruitmentData) {
      insights.push(...await this.generateRecruitmentInsights(profile))
    }

    if (profile.bullpenData) {
      insights.push(...await this.generateBullpenInsights(profile))
    }

    return insights
  }

  private async identifyPatterns(profile: UserProfile): Promise<Pattern[]> {
    const patterns: Pattern[] = []

    patterns.push(...await this.identifyBehavioralPatterns(profile))
    patterns.push(...await this.identifyPerformancePatterns(profile))
    patterns.push(...await this.identifySkillPatterns(profile))
    patterns.push(...await this.identifyTrustPatterns(profile))

    return patterns
  }

  private async generateRecommendations(
    profile: UserProfile
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    recommendations.push(...await this.generateSkillRecommendations(profile))
    recommendations.push(...await this.generateAssignmentRecommendations(profile))
    recommendations.push(...await this.generateDevelopmentRecommendations(profile))
    recommendations.push(...await this.generateOptimizationRecommendations(profile))

    return recommendations
  }

  private async processAggregationQueue() {
    while (this.aggregationQueue.length > 0) {
      const task = this.aggregationQueue.shift()
      if (task) {
        try {
          await this.executeAggregationTask(task)
        } catch (error) {
          // SECURITY: Removed console.error('Aggregation task failed:', error)
          this.emit('aggregationError', { task, error })
        }
      }
    }
  }

  private async executeAggregationTask(task: AggregationTask) {
    const { type, userId, data } = task

    switch (type) {
      case 'profile_update':
        await this.updateUserProfile(userId, data)
        break
      case 'cross_tenant_analysis':
        await this.performCrossTenantAnalysis(data)
        break
      case 'skill_mapping':
        await this.mapSkillsAcrossUsers(data)
        break
      case 'performance_benchmarking':
        await this.benchmarkPerformance(data)
        break
    }
  }

  private getOrCreateProfile(
    userId: string,
    type: UserProfile['type']
  ): UserProfile {
    let profile = this.userProfiles.get(userId)
    
    if (!profile) {
      profile = {
        id: userId,
        type,
        tenantId: this.detectTenantId(userId),
        metadata: {
          createdAt: new Date(),
          lastActive: new Date(),
          dataPoints: 0,
          learningContributions: 0
        }
      }
      this.userProfiles.set(userId, profile)
    }

    profile.metadata.lastActive = new Date()
    return profile
  }

  private updateProfile(profile: UserProfile) {
    profile.metadata.dataPoints++
    profile.metadata.learningContributions++
    this.userProfiles.set(profile.id, profile)
    
    this.aggregationQueue.push({
      type: 'profile_update',
      userId: profile.id,
      data: profile,
      timestamp: new Date()
    })
  }

  private detectTenantId(userId: string): string {
    return 'default_tenant'
  }

  private countDataPoints(profile: UserProfile): number {
    let count = 0
    
    if (profile.onboardingData) {
      count += profile.onboardingData.steps.length
      count += profile.onboardingData.documents.length
      count += profile.onboardingData.verifications.length
      count += profile.onboardingData.interactions.length
    }
    
    if (profile.recruitmentData) {
      count += profile.recruitmentData.pipeline.length
      count += profile.recruitmentData.assessments.length
      count += profile.recruitmentData.interviews.length
      count += profile.recruitmentData.communications.length
    }
    
    if (profile.bullpenData) {
      count += profile.bullpenData.assignments.length
      count += profile.bullpenData.performance.length
      count += profile.bullpenData.timeTracking.length
      count += profile.bullpenData.trustVerification.length
    }
    
    return count
  }

  private calculateCompletionRate(userId: string): number {
    const profile = this.userProfiles.get(userId)
    if (!profile?.onboardingData) return 0
    
    const completed = profile.onboardingData.steps.filter(
      s => s.status === 'completed'
    ).length
    const total = profile.onboardingData.steps.length
    
    return total > 0 ? (completed / total) * 100 : 0
  }

  private calculateAverageDuration(userId: string): number {
    const profile = this.userProfiles.get(userId)
    if (!profile?.onboardingData) return 0
    
    const durations = profile.onboardingData.steps.map(s => s.duration)
    const sum = durations.reduce((a, b) => a + b, 0)
    
    return durations.length > 0 ? sum / durations.length : 0
  }

  private identifyDropoffPoints(userId: string): string[] {
    const profile = this.userProfiles.get(userId)
    if (!profile?.onboardingData) return []
    
    return profile.onboardingData.steps
      .filter(s => s.status === 'skipped' || s.attempts > 3)
      .map(s => s.name)
  }

  private identifySuccessFactors(userId: string): string[] {
    const profile = this.userProfiles.get(userId)
    if (!profile?.onboardingData) return []
    
    return profile.onboardingData.steps
      .filter(s => s.status === 'completed' && s.attempts === 1)
      .map(s => s.name)
  }

  private getCurrentStage(userId: string): string {
    const profile = this.userProfiles.get(userId)
    if (!profile?.recruitmentData) return 'initial'
    
    const activePipeline = profile.recruitmentData.pipeline.find(
      p => p.status === 'active'
    )
    
    return activePipeline?.stage || 'completed'
  }

  private calculateVelocity(userId: string): number {
    const profile = this.userProfiles.get(userId)
    if (!profile?.recruitmentData) return 0
    
    const stages = profile.recruitmentData.pipeline.filter(
      p => p.exitedAt
    )
    
    if (stages.length === 0) return 0
    
    const totalTime = stages.reduce((sum, stage) => {
      const duration = stage.exitedAt!.getTime() - stage.enteredAt.getTime()
      return sum + duration
    }, 0)
    
    return stages.length / (totalTime / (1000 * 60 * 60 * 24))
  }

  private calculateQualityScore(userId: string): number {
    const profile = this.userProfiles.get(userId)
    if (!profile?.recruitmentData) return 0
    
    const assessments = profile.recruitmentData.assessments
    if (assessments.length === 0) return 0
    
    const totalScore = assessments.reduce((sum, a) => sum + a.score, 0)
    return totalScore / assessments.length
  }

  private predictOutcome(userId: string): string {
    const qualityScore = this.calculateQualityScore(userId)
    const velocity = this.calculateVelocity(userId)
    
    if (qualityScore > 80 && velocity > 0.5) return 'high_probability'
    if (qualityScore > 60 && velocity > 0.3) return 'medium_probability'
    return 'low_probability'
  }

  private calculateUtilization(userId: string): number {
    const profile = this.userProfiles.get(userId)
    if (!profile?.bullpenData) return 0
    
    const assignments = profile.bullpenData.assignments.filter(
      a => !a.endDate || a.endDate > new Date()
    )
    
    return Math.min(100, assignments.length * 25)
  }

  private calculatePerformanceScore(userId: string): number {
    const profile = this.userProfiles.get(userId)
    if (!profile?.bullpenData) return 0
    
    const metrics = profile.bullpenData.performance
    if (metrics.length === 0) return 0
    
    const avgPerformance = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length
    return Math.min(100, avgPerformance)
  }

  private calculateReliability(userId: string): number {
    const profile = this.userProfiles.get(userId)
    if (!profile?.bullpenData) return 0
    
    const trustScores = profile.bullpenData.trustVerification
    if (trustScores.length === 0) return 0
    
    const avgTrust = trustScores.reduce((sum, t) => sum + t.score, 0) / trustScores.length
    return avgTrust
  }

  private calculateGrowth(userId: string): number {
    const profile = this.userProfiles.get(userId)
    if (!profile?.bullpenData) return 0
    
    const skills = profile.bullpenData.skills
    if (skills.length < 2) return 0
    
    const improvements = skills.map(s => s.improvement)
    const avgImprovement = improvements.reduce((sum, i) => sum + i, 0) / improvements.length
    
    return avgImprovement
  }

  private calculateConsistency(userId: string): number {
    const profile = this.userProfiles.get(userId)
    if (!profile?.bullpenData) return 0
    
    const entries = profile.bullpenData.timeTracking
    if (entries.length < 2) return 100
    
    const hours = entries.map(e => e.hours)
    const mean = hours.reduce((sum, h) => sum + h, 0) / hours.length
    const variance = hours.reduce((sum, h) => sum + Math.pow(h - mean, 2), 0) / hours.length
    const stdDev = Math.sqrt(variance)
    
    return Math.max(0, 100 - (stdDev / mean * 100))
  }

  private calculateAnomalyRate(userId: string): number {
    const profile = this.userProfiles.get(userId)
    if (!profile?.bullpenData) return 0
    
    const entries = profile.bullpenData.timeTracking
    if (entries.length === 0) return 0
    
    const anomalous = entries.filter(e => e.anomalies && e.anomalies.length > 0).length
    return (anomalous / entries.length) * 100
  }

  private calculateVerificationStrength(entry: TimeEntry): number {
    const methodScores: Record<string, number> = {
      biometric: 100,
      automated: 75,
      gps: 50,
      manual: 25
    }
    
    return methodScores[entry.verificationMethod] || 0
  }

  private assessRiskLevel(userId: string): 'low' | 'medium' | 'high' {
    const anomalyRate = this.calculateAnomalyRate(userId)
    const consistency = this.calculateConsistency(userId)
    
    if (anomalyRate < 5 && consistency > 80) return 'low'
    if (anomalyRate < 15 && consistency > 60) return 'medium'
    return 'high'
  }

  private async generateOnboardingInsights(profile: UserProfile): Promise<Insight[]> {
    return []
  }

  private async generateRecruitmentInsights(profile: UserProfile): Promise<Insight[]> {
    return []
  }

  private async generateBullpenInsights(profile: UserProfile): Promise<Insight[]> {
    return []
  }

  private async identifyBehavioralPatterns(profile: UserProfile): Promise<Pattern[]> {
    return []
  }

  private async identifyPerformancePatterns(profile: UserProfile): Promise<Pattern[]> {
    return []
  }

  private async identifySkillPatterns(profile: UserProfile): Promise<Pattern[]> {
    return []
  }

  private async identifyTrustPatterns(profile: UserProfile): Promise<Pattern[]> {
    return []
  }

  private async generateSkillRecommendations(profile: UserProfile): Promise<Recommendation[]> {
    return []
  }

  private async generateAssignmentRecommendations(profile: UserProfile): Promise<Recommendation[]> {
    return []
  }

  private async generateDevelopmentRecommendations(profile: UserProfile): Promise<Recommendation[]> {
    return []
  }

  private async generateOptimizationRecommendations(profile: UserProfile): Promise<Recommendation[]> {
    return []
  }

  private async correlateSkills(profiles: UserProfile[]): Promise<Correlation[]> {
    return []
  }

  private async correlatePerformance(profiles: UserProfile[]): Promise<Correlation[]> {
    return []
  }

  private async correlateAvailability(profiles: UserProfile[]): Promise<Correlation[]> {
    return []
  }

  private async correlateTrust(profiles: UserProfile[]): Promise<Correlation[]> {
    return []
  }

  private async assessRiskFactors(profile: UserProfile): Promise<RiskFactor[]> {
    return []
  }

  private async calculateGrowthMetrics(profile: UserProfile): Promise<GrowthMetric[]> {
    return []
  }

  private async updateUserProfile(userId: string, data: any): Promise<void> {
    
  }

  private async performCrossTenantAnalysis(data: any): Promise<void> {
    
  }

  private async mapSkillsAcrossUsers(data: any): Promise<void> {
    
  }

  private async benchmarkPerformance(data: any): Promise<void> {
    
  }

  cleanup() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
    }
    this.removeAllListeners()
  }
}

interface DataStream {
  id: string
  type: string
  active: boolean
  buffer: any[]
}

interface AggregationTask {
  type: string
  userId: string
  data: any
  timestamp: Date
}

interface AggregatedData {
  userId: string
  userType: string
  tenantId: string
  totalDataPoints: number
  learningContributions: number
  insights: Insight[]
  patterns: Pattern[]
  recommendations: Recommendation[]
  riskFactors: RiskFactor[]
  growthMetrics: GrowthMetric[]
}

interface CrossReferenceResult {
  type: string
  userCount: number
  correlations: Correlation[]
  insights: Insight[]
  recommendations: Recommendation[]
}

interface Insight {
  type: string
  description: string
  importance: 'low' | 'medium' | 'high'
  data: any
}

interface Pattern {
  type: string
  description: string
  frequency: number
  confidence: number
  data: any
}

interface Recommendation {
  type: string
  title: string
  description: string
  priority: number
  expectedImpact: string
  actions: string[]
}

interface Correlation {
  factor1: string
  factor2: string
  strength: number
  direction: 'positive' | 'negative' | 'neutral'
  significance: number
}

interface RiskFactor {
  type: string
  level: 'low' | 'medium' | 'high'
  description: string
  mitigations: string[]
}

interface GrowthMetric {
  metric: string
  current: number
  previous: number
  change: number
  trend: 'up' | 'down' | 'stable'
}

export const unifiedDataCollector = UnifiedDataCollector.getInstance()

export default unifiedDataCollector