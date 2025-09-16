'use client';
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { initializeUserAnalytics, userAnalytics } from '@/lib/user-analytics';
export function UserAnalyticsProvider({ children, userId, userRole }) {
    const pathname = usePathname();
    const initialized = useRef(false);
    const sessionId = useRef();
    useEffect(() => {
        if (typeof window === 'undefined' || initialized.current)
            return;
        sessionId.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (userId) {
            initializeUserAnalytics(userId, sessionId.current, userRole);
            initialized.current = true;
            console.log('🔍 User Analytics initialized for:', {
                userId,
                userRole,
                sessionId: sessionId.current
            });
        }
    }, [userId, userRole]);
    useEffect(() => {
        if (initialized.current && pathname) {
            userAnalytics.trackPageView(pathname);
            const featureMap = {
                '/': 'dashboard',
                '/projects': 'project_management',
                '/analytics': 'analytics_dashboard',
                '/onboarding': 'employee_onboarding',
                '/recruits': 'recruitment_management',
                '/bull-pen': 'candidate_pool',
                '/clients': 'client_management',
                '/settings': 'user_settings',
                '/time': 'time_tracking'
            };
            const feature = featureMap[pathname];
            if (feature) {
                userAnalytics.trackFeatureUsage(feature, { route: pathname });
            }
        }
    }, [pathname]);
    useEffect(() => {
        if (typeof window === 'undefined' || !initialized.current)
            return;
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'navigation') {
                    const navEntry = entry;
                    userAnalytics.trackPerformance('page_load_time', navEntry.loadEventEnd - navEntry.fetchStart);
                    userAnalytics.trackPerformance('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart);
                }
                if (entry.entryType === 'paint') {
                    userAnalytics.trackPerformance(`${entry.name}_time`, entry.startTime);
                }
            }
        });
        try {
            observer.observe({ entryTypes: ['navigation', 'paint'] });
        }
        catch (e) {
        }
        return () => {
            observer.disconnect();
        };
    }, []);
    useEffect(() => {
        if (typeof window === 'undefined' || !initialized.current)
            return;
        const exportInterval = setInterval(() => {
            const report = userAnalytics.generateBusinessReport();
            localStorage.setItem('humber_analytics_report', JSON.stringify({
                ...report,
                timestamp: new Date().toISOString(),
                userId,
                sessionId: sessionId.current
            }));
        }, 5 * 60 * 1000);
        return () => clearInterval(exportInterval);
    }, [userId]);
    useEffect(() => {
        if (typeof window === 'undefined' || !initialized.current)
            return;
        let idleTimer;
        let isIdle = false;
        const resetIdleTimer = () => {
            clearTimeout(idleTimer);
            if (isIdle) {
                isIdle = false;
                userAnalytics.trackFeatureUsage('user_active');
            }
            idleTimer = setTimeout(() => {
                isIdle = true;
                userAnalytics.trackFeatureUsage('user_idle');
            }, 5 * 60 * 1000);
        };
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.addEventListener(event, resetIdleTimer, { passive: true });
        });
        resetIdleTimer();
        return () => {
            clearTimeout(idleTimer);
            events.forEach(event => {
                document.removeEventListener(event, resetIdleTimer);
            });
        };
    }, []);
    return _jsx(_Fragment, { children: children });
}
export function AnalyticsDebugPanel() {
    if (process.env.NODE_ENV === 'production')
        return null;
    const handleExportData = () => {
        const data = userAnalytics.exportToJSON();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `humber-analytics-${new Date().toISOString()}.json`;
        a.click();
    };
    const handleViewReport = () => {
        const report = userAnalytics.generateBusinessReport();
        console.table(report);
        alert('Analytics report logged to console');
    };
    const handleClearData = () => {
        userAnalytics.clearData();
        localStorage.removeItem('humber_analytics_report');
        alert('Analytics data cleared');
    };
    return (_jsxs("div", { className: "fixed bottom-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg text-xs space-y-2", children: [_jsx("div", { className: "font-bold", children: "Analytics Debug" }), _jsxs("div", { className: "space-x-2", children: [_jsx("button", { onClick: handleViewReport, className: "bg-blue-600 px-2 py-1 rounded hover:bg-blue-700", children: "View Report" }), _jsx("button", { onClick: handleExportData, className: "bg-green-600 px-2 py-1 rounded hover:bg-green-700", children: "Export Data" }), _jsx("button", { onClick: handleClearData, className: "bg-red-600 px-2 py-1 rounded hover:bg-red-700", children: "Clear Data" })] })] }));
}
//# sourceMappingURL=user-analytics-provider.js.map