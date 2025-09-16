import { EventEmitter } from 'events';
export interface UserProfile {
    id: string;
    type: 'recruit' | 'engineer' | 'operator' | 'admin';
    tenantId: string;
    onboardingData?: OnboardingData;
    recruitmentData?: RecruitmentData;
    bullpenData?: BullpenData;
    metadata: {
        createdAt: Date;
        lastActive: Date;
        dataPoints: number;
        learningContributions: number;
    };
}
export interface OnboardingData {
    startedAt: Date;
    completedAt?: Date;
    steps: OnboardingStep[];
    documents: Document[];
    verifications: Verification[];
    preferences: UserPreferences;
    interactions: Interaction[];
}
export interface OnboardingStep {
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    duration: number;
    attempts: number;
    data: any;
    feedback?: string;
}
export interface RecruitmentData {
    source: string;
    pipeline: PipelineStage[];
    assessments: Assessment[];
    interviews: Interview[];
    skills: Skill[];
    experience: Experience[];
    decisions: Decision[];
    communications: Communication[];
}
export interface PipelineStage {
    stage: string;
    enteredAt: Date;
    exitedAt?: Date;
    status: 'active' | 'passed' | 'failed' | 'withdrawn';
    notes: string[];
    scores: Record<string, number>;
}
export interface BullpenData {
    assignments: Assignment[];
    performance: PerformanceMetric[];
    availability: AvailabilityWindow[];
    skills: SkillUtilization[];
    feedback: Feedback[];
    timeTracking: TimeEntry[];
    trustVerification: TrustScore[];
}
export interface Assignment {
    id: string;
    projectId: string;
    role: string;
    startDate: Date;
    endDate?: Date;
    performance: number;
    deliverables: Deliverable[];
    clientFeedback?: string;
}
export interface PerformanceMetric {
    metric: string;
    value: number;
    timestamp: Date;
    context: Record<string, any>;
}
export interface Document {
    type: string;
    uploadedAt: Date;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    extractedData?: Record<string, any>;
}
export interface Verification {
    type: 'identity' | 'background' | 'skills' | 'reference';
    status: 'pending' | 'passed' | 'failed';
    provider: string;
    completedAt?: Date;
    score?: number;
}
export interface UserPreferences {
    workLocation: string[];
    jobTypes: string[];
    industries: string[];
    salary: {
        min: number;
        max: number;
    };
    benefits: string[];
    schedule: string;
}
export interface Interaction {
    timestamp: Date;
    type: string;
    component: string;
    action: string;
    data: any;
    duration: number;
    outcome?: string;
}
export interface Assessment {
    type: string;
    score: number;
    completedAt: Date;
    details: Record<string, any>;
}
export interface Interview {
    type: 'phone' | 'video' | 'onsite';
    interviewer: string;
    date: Date;
    duration: number;
    rating: number;
    notes: string;
    decision: 'pass' | 'fail' | 'maybe';
}
export interface Skill {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    verified: boolean;
    endorsements: number;
    lastUsed?: Date;
}
export interface Experience {
    company: string;
    role: string;
    startDate: Date;
    endDate?: Date;
    description: string;
    achievements: string[];
    technologies: string[];
}
export interface Decision {
    type: string;
    madeBy: string;
    madeAt: Date;
    outcome: string;
    reasoning: string;
    confidence: number;
}
export interface Communication {
    type: 'email' | 'phone' | 'sms' | 'in_app';
    direction: 'inbound' | 'outbound';
    timestamp: Date;
    subject?: string;
    sentiment?: number;
    responseTime?: number;
}
export interface AvailabilityWindow {
    startDate: Date;
    endDate: Date;
    type: 'available' | 'tentative' | 'unavailable';
    reason?: string;
}
export interface SkillUtilization {
    skill: string;
    projectId: string;
    hoursUsed: number;
    efficiency: number;
    improvement: number;
}
export interface Feedback {
    source: 'client' | 'peer' | 'manager' | 'self';
    rating: number;
    comment: string;
    date: Date;
    actionItems?: string[];
}
export interface TimeEntry {
    date: Date;
    projectId: string;
    hours: number;
    verificationMethod: 'biometric' | 'gps' | 'manual' | 'automated';
    trustScore: number;
    anomalies?: string[];
}
export interface TrustScore {
    timestamp: Date;
    score: number;
    factors: {
        biometric: number;
        location: number;
        pattern: number;
        consistency: number;
    };
    alerts?: string[];
}
export interface Deliverable {
    name: string;
    completedAt: Date;
    quality: number;
    onTime: boolean;
    feedback?: string;
}
declare class UnifiedDataCollector extends EventEmitter {
    private static instance;
    private userProfiles;
    private dataStreams;
    private aggregationQueue;
    private processingInterval?;
    private constructor();
    static getInstance(): UnifiedDataCollector;
    private startProcessing;
    collectOnboardingData(userId: string, step: OnboardingStep, context?: any): Promise<void>;
    collectRecruitmentData(userId: string, dataType: keyof RecruitmentData, data: any): Promise<void>;
    collectBullpenData(userId: string, dataType: keyof BullpenData, data: any): Promise<void>;
    collectTimeTracking(userId: string, entry: TimeEntry): Promise<void>;
    aggregateUserData(userId: string): Promise<AggregatedData>;
    crossReferenceData(userIds: string[], correlationType: 'skills' | 'performance' | 'availability' | 'trust'): Promise<CrossReferenceResult>;
    private analyzeOnboardingPattern;
    private analyzeRecruitmentProgress;
    private analyzeBullpenPerformance;
    private analyzeTrustPattern;
    private generateInsights;
    private identifyPatterns;
    private generateRecommendations;
    private processAggregationQueue;
    private executeAggregationTask;
    private getOrCreateProfile;
    private updateProfile;
    private detectTenantId;
    private countDataPoints;
    private calculateCompletionRate;
    private calculateAverageDuration;
    private identifyDropoffPoints;
    private identifySuccessFactors;
    private getCurrentStage;
    private calculateVelocity;
    private calculateQualityScore;
    private predictOutcome;
    private calculateUtilization;
    private calculatePerformanceScore;
    private calculateReliability;
    private calculateGrowth;
    private calculateConsistency;
    private calculateAnomalyRate;
    private calculateVerificationStrength;
    private assessRiskLevel;
    private generateOnboardingInsights;
    private generateRecruitmentInsights;
    private generateBullpenInsights;
    private identifyBehavioralPatterns;
    private identifyPerformancePatterns;
    private identifySkillPatterns;
    private identifyTrustPatterns;
    private generateSkillRecommendations;
    private generateAssignmentRecommendations;
    private generateDevelopmentRecommendations;
    private generateOptimizationRecommendations;
    private correlateSkills;
    private correlatePerformance;
    private correlateAvailability;
    private correlateTrust;
    private assessRiskFactors;
    private calculateGrowthMetrics;
    private updateUserProfile;
    private performCrossTenantAnalysis;
    private mapSkillsAcrossUsers;
    private benchmarkPerformance;
    cleanup(): void;
}
interface AggregatedData {
    userId: string;
    userType: string;
    tenantId: string;
    totalDataPoints: number;
    learningContributions: number;
    insights: Insight[];
    patterns: Pattern[];
    recommendations: Recommendation[];
    riskFactors: RiskFactor[];
    growthMetrics: GrowthMetric[];
}
interface CrossReferenceResult {
    type: string;
    userCount: number;
    correlations: Correlation[];
    insights: Insight[];
    recommendations: Recommendation[];
}
interface Insight {
    type: string;
    description: string;
    importance: 'low' | 'medium' | 'high';
    data: any;
}
interface Pattern {
    type: string;
    description: string;
    frequency: number;
    confidence: number;
    data: any;
}
interface Recommendation {
    type: string;
    title: string;
    description: string;
    priority: number;
    expectedImpact: string;
    actions: string[];
}
interface Correlation {
    factor1: string;
    factor2: string;
    strength: number;
    direction: 'positive' | 'negative' | 'neutral';
    significance: number;
}
interface RiskFactor {
    type: string;
    level: 'low' | 'medium' | 'high';
    description: string;
    mitigations: string[];
}
interface GrowthMetric {
    metric: string;
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
}
export declare const unifiedDataCollector: UnifiedDataCollector;
export default unifiedDataCollector;
//# sourceMappingURL=unified-data-collector.d.ts.map