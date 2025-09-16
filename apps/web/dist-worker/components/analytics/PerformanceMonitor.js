'use client';
import { jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export default function PerformanceMonitor() {
    const [metrics, setMetrics] = useState(null);
    useEffect(() => {
        if (typeof window !== 'undefined' && 'performance' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const navigation = entries.find((entry) => entry.entryType === 'navigation');
                if (navigation) {
                    setMetrics({
                        loadTime: Math.round(navigation.loadEventEnd - navigation.navigationStart),
                        renderTime: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
                        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart)
                    });
                }
            });
            observer.observe({ entryTypes: ['navigation'] });
            return () => observer.disconnect();
        }
    }, []);
    if (!metrics || process.env.NODE_ENV === 'production')
        return null;
    return (_jsxs("div", { className: "fixed bottom-4 right-4 bg-slate-900/90 backdrop-blur text-xs text-white p-2 rounded border border-slate-700 z-50", children: [_jsxs("div", { children: ["Load: ", metrics.loadTime, "ms"] }), _jsxs("div", { children: ["Render: ", metrics.renderTime, "ms"] }), _jsxs("div", { children: ["DOMContentLoaded: ", metrics.domContentLoaded, "ms"] })] }));
}
//# sourceMappingURL=PerformanceMonitor.js.map