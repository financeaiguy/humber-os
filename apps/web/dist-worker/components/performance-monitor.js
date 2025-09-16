'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { PerformanceMonitor } from '@/lib/performance';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';
export function PerformanceDevPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [performanceData, setPerformanceData] = useState(null);
    const [isProduction, setIsProduction] = useState(false);
    useEffect(() => {
        setIsProduction(process.env.NODE_ENV === 'production');
        if (process.env.NODE_ENV === 'development') {
            const interval = setInterval(() => {
                const monitor = PerformanceMonitor.getInstance();
                const report = monitor.getPerformanceReport();
                setPerformanceData({
                    ...report,
                    currentRoute: window.location.pathname,
                    loadTime: performance.now()
                });
            }, 2000);
            const handleKeyDown = (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                    setIsOpen(prev => !prev);
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                clearInterval(interval);
                window.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, []);
    if (isProduction || !performanceData)
        return null;
    return (_jsxs(AnimatePresence, { children: [isOpen && (_jsx(motion.div, { initial: { opacity: 0, x: 300 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 300 }, className: "fixed top-4 right-4 z-[9999] w-80 bg-slate-900/95 backdrop-blur-lg border border-slate-700 rounded-lg shadow-2xl", children: _jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-white flex items-center", children: [_jsx(Activity, { className: "h-5 w-5 mr-2 text-green-400" }), "Performance Monitor"] }), _jsx("button", { onClick: () => setIsOpen(false), className: "text-slate-400 hover:text-white transition-colors", children: "\u00D7" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "bg-slate-800/50 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center text-sm text-slate-300 mb-2", children: [_jsx(Zap, { className: "h-4 w-4 mr-2" }), "Current Route: ", performanceData.currentRoute] }), _jsxs("div", { className: "text-xs text-slate-400", children: ["Avg Load Time: ", performanceData.routeTimings[performanceData.currentRoute]?.toFixed(0) || 'N/A', "ms"] })] }), _jsxs("div", { className: "bg-slate-800/50 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center text-sm text-slate-300 mb-2", children: [_jsx(Clock, { className: "h-4 w-4 mr-2" }), "Route Performance"] }), _jsx("div", { className: "space-y-1 max-h-32 overflow-y-auto", children: Object.entries(performanceData.routeTimings).map(([route, time]) => (_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { className: "text-slate-400 truncate", children: route }), _jsxs("span", { className: `${time > 2000 ? 'text-red-400' : time > 1000 ? 'text-yellow-400' : 'text-green-400'}`, children: [time.toFixed(0), "ms"] })] }, route))) })] }), _jsxs("div", { className: "bg-slate-800/50 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center text-sm text-slate-300 mb-2", children: [_jsx(TrendingUp, { className: "h-4 w-4 mr-2" }), "Optimizations"] }), _jsxs("div", { className: "space-y-1 text-xs", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-400", children: "Preloaded Routes" }), _jsx("span", { className: "text-green-400", children: performanceData.preloadedCount })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-400", children: "Slow Routes" }), _jsx("span", { className: performanceData.slowRoutes.length > 0 ? 'text-red-400' : 'text-green-400', children: performanceData.slowRoutes.length })] })] })] }), performanceData.slowRoutes.length > 0 && (_jsxs("div", { className: "bg-red-900/20 border border-red-500/30 rounded-lg p-3", children: [_jsx("div", { className: "text-sm text-red-400 mb-1", children: "Slow Routes Detected:" }), performanceData.slowRoutes.map(route => (_jsx("div", { className: "text-xs text-red-300", children: route }, route)))] }))] }), _jsx("div", { className: "mt-4 text-xs text-slate-500 text-center", children: "Press Ctrl+Shift+P to toggle" })] }) })), !isOpen && (_jsx(motion.button, { initial: { opacity: 0 }, animate: { opacity: 1 }, onClick: () => setIsOpen(true), className: "fixed bottom-4 right-4 z-[9999] w-12 h-12 bg-slate-900/90 backdrop-blur-lg border border-slate-700 rounded-full flex items-center justify-center hover:bg-slate-800/90 transition-colors", children: _jsx(Activity, { className: "h-5 w-5 text-green-400" }) }))] }));
}
export function ProductionPerformanceTracker() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production')
            return;
        const monitor = PerformanceMonitor.getInstance();
        const trackPageLoad = () => {
            const loadTime = performance.now();
            const route = window.location.pathname;
            if (loadTime > 3000) {
                console.warn(`Slow page load detected: ${route} (${loadTime.toFixed(0)}ms)`);
            }
        };
        if (document.readyState === 'complete') {
            trackPageLoad();
        }
        else {
            window.addEventListener('load', trackPageLoad);
        }
        return () => {
            window.removeEventListener('load', trackPageLoad);
        };
    }, []);
    return null;
}
//# sourceMappingURL=performance-monitor.js.map