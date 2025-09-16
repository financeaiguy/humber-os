import { EventEmitter } from 'events';
import { continuousLearning } from './continuous-learning';
class UnifiedDataCollector extends EventEmitter {
    constructor() {
        super();
        this.userProfiles = new Map();
        this.dataStreams = new Map();
        this.aggregationQueue = [];
        this.startProcessing();
    }
    static getInstance() {
        if (!UnifiedDataCollector.instance) {
            UnifiedDataCollector.instance = new UnifiedDataCollector();
        }
        return UnifiedDataCollector.instance;
    }
    startProcessing() {
        this.processingInterval = setInterval(() => {
            this.processAggregationQueue();
        }, 5000);
    }
    async collectOnboardingData(userId, step, context) {
        const profile = this.getOrCreateProfile(userId, 'recruit');
        if (!profile.onboardingData) {
            profile.onboardingData = {
                startedAt: new Date(),
                steps: [],
                documents: [],
                verifications: [],
                preferences: {},
                interactions: []
            };
        }
        profile.onboardingData.steps.push(step);
        await continuousLearning.learn({
            userId,
            type: 'onboarding',
            step: step.name,
            status: step.status,
            data: step.data,
            duration: step.duration,
            context
        }, 'user_activity');
        this.analyzeOnboardingPattern(userId, step);
        this.updateProfile(profile);
    }
    async collectRecruitmentData(userId, dataType, data) {
        const profile = this.getOrCreateProfile(userId, 'recruit');
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
            };
        }
        if (Array.isArray(profile.recruitmentData[dataType])) {
            profile.recruitmentData[dataType].push(data);
        }
        else {
            profile.recruitmentData[dataType] = data;
        }
        await continuousLearning.learn({
            userId,
            type: 'recruitment',
            dataType,
            data,
            timestamp: new Date()
        }, 'recruitment');
        this.analyzeRecruitmentProgress(userId, dataType, data);
        this.updateProfile(profile);
    }
    async collectBullpenData(userId, dataType, data) {
        const profile = this.getOrCreateProfile(userId, 'engineer');
        if (!profile.bullpenData) {
            profile.bullpenData = {
                assignments: [],
                performance: [],
                availability: [],
                skills: [],
                feedback: [],
                timeTracking: [],
                trustVerification: []
            };
        }
        if (Array.isArray(profile.bullpenData[dataType])) {
            profile.bullpenData[dataType].push(data);
        }
        await continuousLearning.learn({
            userId,
            type: 'bullpen',
            dataType,
            data,
            timestamp: new Date()
        }, 'performance');
        this.analyzeBullpenPerformance(userId, dataType, data);
        this.updateProfile(profile);
    }
    async collectTimeTracking(userId, entry) {
        const profile = this.getOrCreateProfile(userId, 'engineer');
        if (!profile.bullpenData) {
            profile.bullpenData = {
                assignments: [],
                performance: [],
                availability: [],
                skills: [],
                feedback: [],
                timeTracking: [],
                trustVerification: []
            };
        }
        profile.bullpenData.timeTracking.push(entry);
        await continuousLearning.learn({
            userId,
            type: 'time_tracking',
            entry,
            trustScore: entry.trustScore,
            verificationMethod: entry.verificationMethod,
            anomalies: entry.anomalies
        }, 'trust_verification');
        this.analyzeTrustPattern(userId, entry);
        this.updateProfile(profile);
    }
    async aggregateUserData(userId) {
        const profile = this.userProfiles.get(userId);
        if (!profile) {
            throw new Error(`No profile found for user ${userId}`);
        }
        const aggregated = {
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
        };
        await continuousLearning.learn({
            userId,
            type: 'aggregation',
            aggregated,
            timestamp: new Date()
        }, 'analytics');
        return aggregated;
    }
    async crossReferenceData(userIds, correlationType) {
        const profiles = userIds
            .map(id => this.userProfiles.get(id))
            .filter(p => p);
        const result = {
            type: correlationType,
            userCount: profiles.length,
            correlations: [],
            insights: [],
            recommendations: []
        };
        switch (correlationType) {
            case 'skills':
                result.correlations = await this.correlateSkills(profiles);
                break;
            case 'performance':
                result.correlations = await this.correlatePerformance(profiles);
                break;
            case 'availability':
                result.correlations = await this.correlateAvailability(profiles);
                break;
            case 'trust':
                result.correlations = await this.correlateTrust(profiles);
                break;
        }
        await continuousLearning.learn({
            type: 'cross_reference',
            correlationType,
            userIds,
            result,
            timestamp: new Date()
        }, 'pattern_recognition');
        return result;
    }
    analyzeOnboardingPattern(userId, step) {
        const patterns = {
            completionRate: this.calculateCompletionRate(userId),
            averageDuration: this.calculateAverageDuration(userId),
            dropoffPoints: this.identifyDropoffPoints(userId),
            successFactors: this.identifySuccessFactors(userId)
        };
        this.emit('onboardingPattern', { userId, step, patterns });
    }
    analyzeRecruitmentProgress(userId, dataType, data) {
        const progress = {
            stage: this.getCurrentStage(userId),
            velocity: this.calculateVelocity(userId),
            qualityScore: this.calculateQualityScore(userId),
            predictedOutcome: this.predictOutcome(userId)
        };
        this.emit('recruitmentProgress', { userId, dataType, data, progress });
    }
    analyzeBullpenPerformance(userId, dataType, data) {
        const performance = {
            utilizationRate: this.calculateUtilization(userId),
            performanceScore: this.calculatePerformanceScore(userId),
            reliabilityIndex: this.calculateReliability(userId),
            growthTrajectory: this.calculateGrowth(userId)
        };
        this.emit('bullpenPerformance', { userId, dataType, data, performance });
    }
    analyzeTrustPattern(userId, entry) {
        const trustAnalysis = {
            consistencyScore: this.calculateConsistency(userId),
            anomalyRate: this.calculateAnomalyRate(userId),
            verificationStrength: this.calculateVerificationStrength(entry),
            riskLevel: this.assessRiskLevel(userId)
        };
        this.emit('trustPattern', { userId, entry, trustAnalysis });
    }
    async generateInsights(profile) {
        const insights = [];
        if (profile.onboardingData) {
            insights.push(...await this.generateOnboardingInsights(profile));
        }
        if (profile.recruitmentData) {
            insights.push(...await this.generateRecruitmentInsights(profile));
        }
        if (profile.bullpenData) {
            insights.push(...await this.generateBullpenInsights(profile));
        }
        return insights;
    }
    async identifyPatterns(profile) {
        const patterns = [];
        patterns.push(...await this.identifyBehavioralPatterns(profile));
        patterns.push(...await this.identifyPerformancePatterns(profile));
        patterns.push(...await this.identifySkillPatterns(profile));
        patterns.push(...await this.identifyTrustPatterns(profile));
        return patterns;
    }
    async generateRecommendations(profile) {
        const recommendations = [];
        recommendations.push(...await this.generateSkillRecommendations(profile));
        recommendations.push(...await this.generateAssignmentRecommendations(profile));
        recommendations.push(...await this.generateDevelopmentRecommendations(profile));
        recommendations.push(...await this.generateOptimizationRecommendations(profile));
        return recommendations;
    }
    async processAggregationQueue() {
        while (this.aggregationQueue.length > 0) {
            const task = this.aggregationQueue.shift();
            if (task) {
                try {
                    await this.executeAggregationTask(task);
                }
                catch (error) {
                    console.error('Aggregation task failed:', error);
                    this.emit('aggregationError', { task, error });
                }
            }
        }
    }
    async executeAggregationTask(task) {
        const { type, userId, data } = task;
        switch (type) {
            case 'profile_update':
                await this.updateUserProfile(userId, data);
                break;
            case 'cross_tenant_analysis':
                await this.performCrossTenantAnalysis(data);
                break;
            case 'skill_mapping':
                await this.mapSkillsAcrossUsers(data);
                break;
            case 'performance_benchmarking':
                await this.benchmarkPerformance(data);
                break;
        }
    }
    getOrCreateProfile(userId, type) {
        let profile = this.userProfiles.get(userId);
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
            };
            this.userProfiles.set(userId, profile);
        }
        profile.metadata.lastActive = new Date();
        return profile;
    }
    updateProfile(profile) {
        profile.metadata.dataPoints++;
        profile.metadata.learningContributions++;
        this.userProfiles.set(profile.id, profile);
        this.aggregationQueue.push({
            type: 'profile_update',
            userId: profile.id,
            data: profile,
            timestamp: new Date()
        });
    }
    detectTenantId(userId) {
        return 'default_tenant';
    }
    countDataPoints(profile) {
        let count = 0;
        if (profile.onboardingData) {
            count += profile.onboardingData.steps.length;
            count += profile.onboardingData.documents.length;
            count += profile.onboardingData.verifications.length;
            count += profile.onboardingData.interactions.length;
        }
        if (profile.recruitmentData) {
            count += profile.recruitmentData.pipeline.length;
            count += profile.recruitmentData.assessments.length;
            count += profile.recruitmentData.interviews.length;
            count += profile.recruitmentData.communications.length;
        }
        if (profile.bullpenData) {
            count += profile.bullpenData.assignments.length;
            count += profile.bullpenData.performance.length;
            count += profile.bullpenData.timeTracking.length;
            count += profile.bullpenData.trustVerification.length;
        }
        return count;
    }
    calculateCompletionRate(userId) {
        const profile = this.userProfiles.get(userId);
        if (!profile?.onboardingData)
            return 0;
        const completed = profile.onboardingData.steps.filter(s => s.status === 'completed').length;
        const total = profile.onboardingData.steps.length;
        return total > 0 ? (completed / total) * 100 : 0;
    }
    calculateAverageDuration(userId) {
        const profile = this.userProfiles.get(userId);
        if (!profile?.onboardingData)
            return 0;
        const durations = profile.onboardingData.steps.map(s => s.duration);
        const sum = durations.reduce((a, b) => a + b, 0);
        return durations.length > 0 ? sum / durations.length : 0;
    }
    identifyDropoffPoints(userId) {
        const profile = this.userProfiles.get(userId);
        if (!profile?.onboardingData)
            return [];
        return profile.onboardingData.steps
            .filter(s => s.status === 'skipped' || s.attempts > 3)
            .map(s => s.name);
    }
    identifySuccessFactors(userId) {
        const profile = this.userProfiles.get(userId);
        if (!profile?.onboardingData)
            return [];
        return profile.onboardingData.steps
            .filter(s => s.status === 'completed' && s.attempts === 1)
            .map(s => s.name);
    }
    getCurrentStage(userId) {
        const profile = this.userProfiles.get(userId);
        if (!profile?.recruitmentData)
            return 'initial';
        const activePipeline = profile.recruitmentData.pipeline.find(p => p.status === 'active');
        return activePipeline?.stage || 'completed';
    }
    calculateVelocity(userId) {
        const profile = this.userProfiles.get(userId);
        if (!profile?.recruitmentData)
            return 0;
        const stages = profile.recruitmentData.pipeline.filter(p => p.exitedAt);
        if (stages.length === 0)
            return 0;
        const totalTime = stages.reduce((sum, stage) => {
            const duration = stage.exitedAt.getTime() - stage.enteredAt.getTime();
            return sum + duration;
        }, 0);
        return stages.length / (totalTime / (1000 * 60 * 60 * 24));
    }
    calculateQualityScore(userId) {
        const profile = this.userProfiles.get(userId);
        if (!profile?.recruitmentData)
            return 0;
        const assessments = profile.recruitmentData.assessments;
        if (assessments.length === 0)
            return 0;
        const totalScore = assessments.reduce((sum, a) => sum + a.score, 0);
        return totalScore / assessments.length;
    }
    predictOutcome(userId) {
        const qualityScore = this.calculateQualityScore(userId);
        const velocity = this.calculateVelocity(userId);
        if (qualityScore > 80 && velocity > 0.5)
            return 'high_probability';
        if (qualityScore > 60 && velocity > 0.3)
            return 'medium_probability';
        return 'low_probability';
    }
    calculateUtilization(userId) {
        const profile = this.userProfiles.get(userId);
        if (!profile?.bullpenData)
            return 0;
        const assignments = profile.bullpenData.assignments.filter(a => !a.endDate || a.endDate > new Date());
        return Math.min(100, assignments.length * 25);
    }
    calculatePerformanceScore(userId) {
        const profile = this.userProfiles.get(userId);
        if (!profile?.bullpenData)
            return 0;
        const metrics = profile.bullpenData.performance;
        if (metrics.length === 0)
            return 0;
        const avgPerformance = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
        return Math.min(100, avgPerformance);
    }
    calculateReliability(userId) {
        const profile = this.userProfiles.get(userId);
        if (!profile?.bullpenData)
            return 0;
        const trustScores = profile.bullpenData.trustVerification;
        if (trustScores.length === 0)
            return 0;
        const avgTrust = trustScores.reduce((sum, t) => sum + t.score, 0) / trustScores.length;
        return avgTrust;
    }
    calculateGrowth(userId) {
        const profile = this.userProfiles.get(userId);
        if (!profile?.bullpenData)
            return 0;
        const skills = profile.bullpenData.skills;
        if (skills.length < 2)
            return 0;
        const improvements = skills.map(s => s.improvement);
        const avgImprovement = improvements.reduce((sum, i) => sum + i, 0) / improvements.length;
        return avgImprovement;
    }
    calculateConsistency(userId) {
        const profile = this.userProfiles.get(userId);
        if (!profile?.bullpenData)
            return 0;
        const entries = profile.bullpenData.timeTracking;
        if (entries.length < 2)
            return 100;
        const hours = entries.map(e => e.hours);
        const mean = hours.reduce((sum, h) => sum + h, 0) / hours.length;
        const variance = hours.reduce((sum, h) => sum + Math.pow(h - mean, 2), 0) / hours.length;
        const stdDev = Math.sqrt(variance);
        return Math.max(0, 100 - (stdDev / mean * 100));
    }
    calculateAnomalyRate(userId) {
        const profile = this.userProfiles.get(userId);
        if (!profile?.bullpenData)
            return 0;
        const entries = profile.bullpenData.timeTracking;
        if (entries.length === 0)
            return 0;
        const anomalous = entries.filter(e => e.anomalies && e.anomalies.length > 0).length;
        return (anomalous / entries.length) * 100;
    }
    calculateVerificationStrength(entry) {
        const methodScores = {
            biometric: 100,
            automated: 75,
            gps: 50,
            manual: 25
        };
        return methodScores[entry.verificationMethod] || 0;
    }
    assessRiskLevel(userId) {
        const anomalyRate = this.calculateAnomalyRate(userId);
        const consistency = this.calculateConsistency(userId);
        if (anomalyRate < 5 && consistency > 80)
            return 'low';
        if (anomalyRate < 15 && consistency > 60)
            return 'medium';
        return 'high';
    }
    async generateOnboardingInsights(profile) {
        return [];
    }
    async generateRecruitmentInsights(profile) {
        return [];
    }
    async generateBullpenInsights(profile) {
        return [];
    }
    async identifyBehavioralPatterns(profile) {
        return [];
    }
    async identifyPerformancePatterns(profile) {
        return [];
    }
    async identifySkillPatterns(profile) {
        return [];
    }
    async identifyTrustPatterns(profile) {
        return [];
    }
    async generateSkillRecommendations(profile) {
        return [];
    }
    async generateAssignmentRecommendations(profile) {
        return [];
    }
    async generateDevelopmentRecommendations(profile) {
        return [];
    }
    async generateOptimizationRecommendations(profile) {
        return [];
    }
    async correlateSkills(profiles) {
        return [];
    }
    async correlatePerformance(profiles) {
        return [];
    }
    async correlateAvailability(profiles) {
        return [];
    }
    async correlateTrust(profiles) {
        return [];
    }
    async assessRiskFactors(profile) {
        return [];
    }
    async calculateGrowthMetrics(profile) {
        return [];
    }
    async updateUserProfile(userId, data) {
    }
    async performCrossTenantAnalysis(data) {
    }
    async mapSkillsAcrossUsers(data) {
    }
    async benchmarkPerformance(data) {
    }
    cleanup() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
        }
        this.removeAllListeners();
    }
}
export const unifiedDataCollector = UnifiedDataCollector.getInstance();
export default unifiedDataCollector;
//# sourceMappingURL=unified-data-collector.js.map