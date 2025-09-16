export declare class PerformanceMonitor {
    private static instance;
    private routeTimings;
    private preloadedRoutes;
    private observer;
    static getInstance(): PerformanceMonitor;
    startRouteTimer(route: string): void;
    endRouteTimer(route: string): number;
    getAverageRouteTime(route: string): number;
    getSlowRoutes(threshold?: number): string[];
    initIntelligentPreloading(): void;
    preloadRoute(href: string): void;
    private preloadCriticalResources;
    cleanup(): void;
    getPerformanceReport(): {
        routeTimings: Record<string, number>;
        slowRoutes: string[];
        preloadedCount: number;
        webVitals: any;
    };
}
export declare const ROUTE_PERFORMANCE_CONFIG: {
    readonly '/': {
        readonly priority: "high";
        readonly preloadDependencies: readonly ["/projects", "/analytics"];
        readonly cacheStrategy: "immediate";
        readonly skeletonType: "dashboard";
    };
    readonly '/projects': {
        readonly priority: "high";
        readonly preloadDependencies: readonly ["/projects/new"];
        readonly cacheStrategy: "immediate";
        readonly skeletonType: "projects";
    };
    readonly '/analytics': {
        readonly priority: "medium";
        readonly preloadDependencies: readonly [];
        readonly cacheStrategy: "lazy";
        readonly skeletonType: "analytics";
        readonly heavyRoute: true;
        readonly loadingTimeout: 5000;
    };
    readonly '/onboarding': {
        readonly priority: "high";
        readonly preloadDependencies: readonly ["/onboarding/new"];
        readonly cacheStrategy: "immediate";
        readonly skeletonType: "onboarding";
    };
    readonly '/settings': {
        readonly priority: "low";
        readonly preloadDependencies: readonly [];
        readonly cacheStrategy: "lazy";
        readonly skeletonType: "default";
    };
};
export declare function initSmartPreloading(): void;
export declare function optimizeForMobile(): void;
export declare function shouldLoadFeature(feature: string): boolean;
//# sourceMappingURL=performance.d.ts.map