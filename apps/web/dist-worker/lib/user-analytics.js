class UserAnalytics {
    constructor() {
        this.metadata = {};
        this.sessionStartTime = new Date();
        this.interactions = [];
        this.isTracking = true;
    }
    static getInstance() {
        if (!UserAnalytics.instance) {
            UserAnalytics.instance = new UserAnalytics();
        }
        return UserAnalytics.instance;
    }
    initialize(userId, sessionId, userRole) {
        if (typeof window === 'undefined')
            return;
        this.metadata = {
            userId,
            sessionId,
            role: userRole,
            device: this.getDeviceInfo(),
            location: this.getLocationInfo(),
            session: {
                startTime: this.sessionStartTime,
                duration: 0,
                pageViews: 0,
                clickCount: 0,
                scrollDepth: 0,
                idleTime: 0
            },
            behavior: {
                mostUsedFeatures: [],
                averageSessionTime: 0,
                preferredDesignMode: null,
                navigationPatterns: [],
                errorEncounters: 0,
                helpRequestCount: 0
            },
            business: {
                primaryWorkflow: [],
                productivityScore: 0,
                featureAdoptionRate: 0,
                timeToComplete: {},
                dataExportFrequency: 0,
                reportGenerationCount: 0
            },
            performance: {
                loadTimes: {},
                errorRate: 0,
                cacheHitRate: 0,
                apiResponseTimes: {}
            }
        };
        this.setupEventListeners();
        this.trackPageView();
    }
    getDeviceInfo() {
        const ua = navigator.userAgent;
        const screen = window.screen;
        return {
            type: this.getDeviceType(),
            os: this.getOperatingSystem(),
            browser: this.getBrowserInfo(),
            version: this.getBrowserVersion(),
            screenResolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            touchCapable: 'ontouchstart' in window,
            darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
        };
    }
    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768)
            return 'mobile';
        if (width < 1024)
            return 'tablet';
        return 'desktop';
    }
    getOperatingSystem() {
        const ua = navigator.userAgent;
        if (ua.includes('Win'))
            return 'Windows';
        if (ua.includes('Mac'))
            return 'macOS';
        if (ua.includes('Linux'))
            return 'Linux';
        if (ua.includes('Android'))
            return 'Android';
        if (ua.includes('iOS'))
            return 'iOS';
        return 'Unknown';
    }
    getBrowserInfo() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome'))
            return 'Chrome';
        if (ua.includes('Firefox'))
            return 'Firefox';
        if (ua.includes('Safari'))
            return 'Safari';
        if (ua.includes('Edge'))
            return 'Edge';
        return 'Unknown';
    }
    getBrowserVersion() {
        const ua = navigator.userAgent;
        const match = ua.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/i);
        return match ? match[2] : 'Unknown';
    }
    getLocationInfo() {
        return {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            locale: navigator.language,
            connectionType: this.getConnectionType()
        };
    }
    getConnectionType() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        return connection ? connection.effectiveType || 'unknown' : 'unknown';
    }
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            this.trackInteraction('click', {
                element: e.target?.tagName,
                className: e.target?.className,
                id: e.target?.id
            });
            this.incrementCounter('clickCount');
        });
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                this.updateSessionData('scrollDepth', maxScroll);
            }
        });
        let idleStart = null;
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                idleStart = new Date();
            }
            else if (idleStart) {
                const idleTime = new Date().getTime() - idleStart.getTime();
                this.updateSessionData('idleTime', (this.metadata.session?.idleTime || 0) + idleTime);
                idleStart = null;
            }
        });
        setInterval(() => {
            const duration = new Date().getTime() - this.sessionStartTime.getTime();
            this.updateSessionData('duration', duration);
        }, 30000);
        window.addEventListener('error', (e) => {
            this.trackError(e.error?.message || 'Unknown error', e.filename, e.lineno);
        });
        window.addEventListener('unhandledrejection', (e) => {
            this.trackError(`Unhandled Promise: ${e.reason}`);
        });
    }
    trackPageView(page) {
        const currentPage = page || window.location.pathname;
        this.trackInteraction('page_view', { page: currentPage });
        this.incrementCounter('pageViews');
        if (this.metadata.behavior) {
            this.metadata.behavior.navigationPatterns.push(currentPage);
            if (this.metadata.behavior.navigationPatterns.length > 20) {
                this.metadata.behavior.navigationPatterns = this.metadata.behavior.navigationPatterns.slice(-20);
            }
        }
    }
    trackFeatureUsage(feature, context) {
        this.trackInteraction('feature_usage', { feature, context });
        if (this.metadata.behavior) {
            const features = this.metadata.behavior.mostUsedFeatures;
            const index = features.indexOf(feature);
            if (index > -1) {
                features.splice(index, 1);
            }
            features.unshift(feature);
            this.metadata.behavior.mostUsedFeatures = features.slice(0, 10);
        }
    }
    trackDesignModeChange(mode) {
        this.trackInteraction('design_mode_change', { mode });
        if (this.metadata.behavior) {
            this.metadata.behavior.preferredDesignMode = mode;
        }
    }
    trackWorkflowCompletion(workflow, timeToComplete) {
        this.trackInteraction('workflow_completion', { workflow, timeToComplete });
        if (this.metadata.business) {
            this.metadata.business.timeToComplete[workflow] = timeToComplete;
            const workflows = this.metadata.business.primaryWorkflow;
            const index = workflows.indexOf(workflow);
            if (index > -1) {
                workflows.splice(index, 1);
            }
            workflows.unshift(workflow);
            this.metadata.business.primaryWorkflow = workflows.slice(0, 5);
        }
    }
    trackPerformance(metric, value) {
        if (this.metadata.performance) {
            if (metric.includes('load_time')) {
                this.metadata.performance.loadTimes[metric] = value;
            }
            else if (metric.includes('api_response')) {
                this.metadata.performance.apiResponseTimes[metric] = value;
            }
        }
    }
    trackError(message, file, line) {
        this.trackInteraction('error', { message, file, line });
        this.incrementCounter('errorEncounters', 'behavior');
    }
    trackDataExport(format, size) {
        this.trackInteraction('data_export', { format, size });
        this.incrementCounter('dataExportFrequency', 'business');
    }
    trackReportGeneration(reportType) {
        this.trackInteraction('report_generation', { reportType });
        this.incrementCounter('reportGenerationCount', 'business');
    }
    trackInteraction(action, data) {
        this.interactions.push({
            timestamp: new Date(),
            action,
            data
        });
        if (this.interactions.length > 1000) {
            this.interactions = this.interactions.slice(-1000);
        }
    }
    incrementCounter(field, category = 'session') {
        const categoryData = this.metadata[category];
        if (categoryData && categoryData[field] !== undefined) {
            categoryData[field]++;
        }
    }
    updateSessionData(field, value) {
        if (this.metadata.session) {
            this.metadata.session[field] = value;
        }
    }
    getMetadata() {
        return this.metadata;
    }
    getInteractions() {
        return [...this.interactions];
    }
    generateBusinessReport() {
        const metadata = this.metadata;
        return {
            userEngagement: {
                sessionDuration: metadata.session?.duration || 0,
                pageViews: metadata.session?.pageViews || 0,
                featureAdoption: metadata.behavior?.mostUsedFeatures?.length || 0,
                designPreference: metadata.behavior?.preferredDesignMode
            },
            productivity: {
                primaryWorkflows: metadata.business?.primaryWorkflow || [],
                averageTaskTime: this.calculateAverageTaskTime(),
                errorRate: metadata.performance?.errorRate || 0,
                exportFrequency: metadata.business?.dataExportFrequency || 0
            },
            technicalHealth: {
                loadTimes: metadata.performance?.loadTimes || {},
                deviceInfo: metadata.device,
                connectionType: metadata.location?.connectionType
            },
            recommendations: this.generateRecommendations()
        };
    }
    calculateAverageTaskTime() {
        const times = Object.values(this.metadata.business?.timeToComplete || {});
        return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    }
    generateRecommendations() {
        const recommendations = [];
        const metadata = this.metadata;
        const avgLoadTime = Object.values(metadata.performance?.loadTimes || {}).reduce((a, b) => a + b, 0) / Object.keys(metadata.performance?.loadTimes || {}).length;
        if (avgLoadTime > 2000) {
            recommendations.push('Consider optimizing page load times - average exceeds 2 seconds');
        }
        if (metadata.behavior?.preferredDesignMode === 'jobs') {
            recommendations.push('User prefers Jobs-inspired design - consider making it default');
        }
        if ((metadata.behavior?.mostUsedFeatures?.length || 0) < 3) {
            recommendations.push('Low feature adoption - consider user onboarding improvements');
        }
        if ((metadata.behavior?.errorEncounters || 0) > 5) {
            recommendations.push('High error rate detected - investigate stability issues');
        }
        return recommendations;
    }
    anonymizeData() {
        if (this.metadata.userId) {
            this.metadata.userId = 'anonymous_' + Math.random().toString(36).substr(2, 9);
        }
        delete this.metadata.email;
    }
    clearData() {
        this.metadata = {};
        this.interactions = [];
    }
    exportToJSON() {
        return JSON.stringify({
            metadata: this.metadata,
            interactions: this.interactions,
            report: this.generateBusinessReport(),
            exportTimestamp: new Date().toISOString()
        }, null, 2);
    }
}
export const userAnalytics = UserAnalytics.getInstance();
export function useUserAnalytics() {
    return {
        trackPageView: (page) => userAnalytics.trackPageView(page),
        trackFeatureUsage: (feature, context) => userAnalytics.trackFeatureUsage(feature, context),
        trackWorkflow: (workflow, timeToComplete) => userAnalytics.trackWorkflowCompletion(workflow, timeToComplete),
        trackDesignMode: (mode) => userAnalytics.trackDesignModeChange(mode),
        trackDataExport: (format, size) => userAnalytics.trackDataExport(format, size),
        trackReportGeneration: (reportType) => userAnalytics.trackReportGeneration(reportType),
        getReport: () => userAnalytics.generateBusinessReport(),
        exportData: () => userAnalytics.exportToJSON()
    };
}
export function initializeUserAnalytics(userId, sessionId, userRole) {
    if (typeof window !== 'undefined') {
        userAnalytics.initialize(userId, sessionId, userRole);
    }
}
//# sourceMappingURL=user-analytics.js.map