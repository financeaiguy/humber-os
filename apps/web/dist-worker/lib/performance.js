export class PerformanceMonitor {
    constructor() {
        this.routeTimings = new Map();
        this.preloadedRoutes = new Set();
        this.observer = null;
    }
    static getInstance() {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }
    startRouteTimer(route) {
        if (typeof window !== 'undefined') {
            const startTime = performance.now();
            sessionStorage.setItem(`route_start_${route}`, startTime.toString());
        }
    }
    endRouteTimer(route) {
        if (typeof window === 'undefined')
            return 0;
        const startTimeStr = sessionStorage.getItem(`route_start_${route}`);
        if (!startTimeStr)
            return 0;
        const startTime = parseFloat(startTimeStr);
        const endTime = performance.now();
        const duration = endTime - startTime;
        if (!this.routeTimings.has(route)) {
            this.routeTimings.set(route, []);
        }
        this.routeTimings.get(route).push(duration);
        sessionStorage.removeItem(`route_start_${route}`);
        return duration;
    }
    getAverageRouteTime(route) {
        const timings = this.routeTimings.get(route);
        if (!timings || timings.length === 0)
            return 0;
        return timings.reduce((a, b) => a + b, 0) / timings.length;
    }
    getSlowRoutes(threshold = 2000) {
        const slowRoutes = [];
        for (const [route, timings] of this.routeTimings.entries()) {
            const avgTime = this.getAverageRouteTime(route);
            if (avgTime > threshold) {
                slowRoutes.push(route);
            }
        }
        return slowRoutes;
    }
    initIntelligentPreloading() {
        if (typeof window === 'undefined' || this.observer)
            return;
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const href = element.getAttribute('data-preload-href');
                    if (href && !this.preloadedRoutes.has(href)) {
                        this.preloadRoute(href);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });
    }
    preloadRoute(href) {
        if (typeof window === 'undefined' || this.preloadedRoutes.has(href))
            return;
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
        this.preloadedRoutes.add(href);
        this.preloadCriticalResources(href);
        setTimeout(() => {
            document.head.removeChild(link);
        }, 100);
    }
    preloadCriticalResources(route) {
        const resourceMap = {
            '/analytics': [
                '/_next/static/chunks/recharts',
                '/_next/static/chunks/analytics'
            ],
            '/projects': [
                '/_next/static/chunks/framer-motion',
                '/_next/static/chunks/projects'
            ],
            '/onboarding': [
                '/_next/static/chunks/onboarding'
            ]
        };
        const resources = resourceMap[route];
        if (resources) {
            resources.forEach(resource => {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = resource;
                document.head.appendChild(link);
            });
        }
    }
    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
    getPerformanceReport() {
        const report = {
            routeTimings: {},
            slowRoutes: this.getSlowRoutes(),
            preloadedCount: this.preloadedRoutes.size,
            webVitals: {}
        };
        for (const [route, timings] of this.routeTimings.entries()) {
            report.routeTimings[route] = this.getAverageRouteTime(route);
        }
        if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'navigation') {
                            const navEntry = entry;
                            report.webVitals.loadTime = navEntry.loadEventEnd - navEntry.loadEventStart;
                            report.webVitals.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart;
                        }
                    }
                });
                observer.observe({ entryTypes: ['navigation'] });
            }
            catch (e) {
            }
        }
        return report;
    }
}
export const ROUTE_PERFORMANCE_CONFIG = {
    '/': {
        priority: 'high',
        preloadDependencies: ['/projects', '/analytics'],
        cacheStrategy: 'immediate',
        skeletonType: 'dashboard'
    },
    '/projects': {
        priority: 'high',
        preloadDependencies: ['/projects/new'],
        cacheStrategy: 'immediate',
        skeletonType: 'projects'
    },
    '/analytics': {
        priority: 'medium',
        preloadDependencies: [],
        cacheStrategy: 'lazy',
        skeletonType: 'analytics',
        heavyRoute: true,
        loadingTimeout: 5000
    },
    '/onboarding': {
        priority: 'high',
        preloadDependencies: ['/onboarding/new'],
        cacheStrategy: 'immediate',
        skeletonType: 'onboarding'
    },
    '/settings': {
        priority: 'low',
        preloadDependencies: [],
        cacheStrategy: 'lazy',
        skeletonType: 'default'
    }
};
export function initSmartPreloading() {
    if (typeof window === 'undefined')
        return;
    const monitor = PerformanceMonitor.getInstance();
    monitor.initIntelligentPreloading();
    setTimeout(() => {
        Object.entries(ROUTE_PERFORMANCE_CONFIG).forEach(([route, config]) => {
            if (config.priority === 'high') {
                monitor.preloadRoute(route);
            }
        });
    }, 1000);
    const currentPath = window.location.pathname;
    const config = ROUTE_PERFORMANCE_CONFIG[currentPath];
    if (config?.preloadDependencies) {
        config.preloadDependencies.forEach(dep => {
            setTimeout(() => monitor.preloadRoute(dep), 500);
        });
    }
}
export function optimizeForMobile() {
    if (typeof window === 'undefined')
        return;
    const isSlowDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    if (isSlowDevice) {
        document.documentElement.style.setProperty('--animation-duration', '0s');
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.1s');
    }
}
export function shouldLoadFeature(feature) {
    const featureFlags = {
        analytics: true,
        charts: true,
        animations: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        fullFeatures: navigator.connection?.effectiveType !== 'slow-2g'
    };
    return featureFlags[feature] ?? true;
}
//# sourceMappingURL=performance.js.map