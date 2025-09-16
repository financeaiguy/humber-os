export interface UserMetadata {
    userId: string;
    sessionId: string;
    email?: string;
    role?: string;
    partnerName?: string;
    device: {
        type: 'desktop' | 'tablet' | 'mobile';
        os: string;
        browser: string;
        version: string;
        screenResolution: string;
        viewport: string;
        touchCapable: boolean;
        darkMode: boolean;
    };
    location: {
        timezone: string;
        locale: string;
        country?: string;
        region?: string;
        connectionType: string;
        networkSpeed?: string;
    };
    session: {
        startTime: Date;
        duration: number;
        pageViews: number;
        clickCount: number;
        scrollDepth: number;
        idleTime: number;
        exitPage?: string;
    };
    behavior: {
        mostUsedFeatures: string[];
        averageSessionTime: number;
        preferredDesignMode: 'current' | 'jobs' | null;
        navigationPatterns: string[];
        errorEncounters: number;
        helpRequestCount: number;
    };
    business: {
        primaryWorkflow: string[];
        productivityScore: number;
        featureAdoptionRate: number;
        timeToComplete: Record<string, number>;
        dataExportFrequency: number;
        reportGenerationCount: number;
    };
    performance: {
        loadTimes: Record<string, number>;
        errorRate: number;
        cacheHitRate: number;
        apiResponseTimes: Record<string, number>;
    };
}
declare class UserAnalytics {
    private static instance;
    private metadata;
    private sessionStartTime;
    private interactions;
    private isTracking;
    static getInstance(): UserAnalytics;
    initialize(userId: string, sessionId: string, userRole?: string): void;
    private getDeviceInfo;
    private getDeviceType;
    private getOperatingSystem;
    private getBrowserInfo;
    private getBrowserVersion;
    private getLocationInfo;
    private getConnectionType;
    private setupEventListeners;
    trackPageView(page?: string): void;
    trackFeatureUsage(feature: string, context?: any): void;
    trackDesignModeChange(mode: 'current' | 'jobs'): void;
    trackWorkflowCompletion(workflow: string, timeToComplete: number): void;
    trackPerformance(metric: string, value: number): void;
    trackError(message: string, file?: string, line?: number): void;
    trackDataExport(format: string, size: number): void;
    trackReportGeneration(reportType: string): void;
    private trackInteraction;
    private incrementCounter;
    private updateSessionData;
    getMetadata(): UserMetadata | null;
    getInteractions(): Array<{
        timestamp: Date;
        action: string;
        data?: any;
    }>;
    generateBusinessReport(): {
        userEngagement: any;
        productivity: any;
        technicalHealth: any;
        recommendations: string[];
    };
    private calculateAverageTaskTime;
    private generateRecommendations;
    anonymizeData(): void;
    clearData(): void;
    exportToJSON(): string;
}
export declare const userAnalytics: UserAnalytics;
export declare function useUserAnalytics(): {
    trackPageView: (page?: string) => void;
    trackFeatureUsage: (feature: string, context?: any) => void;
    trackWorkflow: (workflow: string, timeToComplete: number) => void;
    trackDesignMode: (mode: "current" | "jobs") => void;
    trackDataExport: (format: string, size: number) => void;
    trackReportGeneration: (reportType: string) => void;
    getReport: () => {
        userEngagement: any;
        productivity: any;
        technicalHealth: any;
        recommendations: string[];
    };
    exportData: () => string;
};
export declare function initializeUserAnalytics(userId: string, sessionId: string, userRole?: string): void;
export {};
//# sourceMappingURL=user-analytics.d.ts.map