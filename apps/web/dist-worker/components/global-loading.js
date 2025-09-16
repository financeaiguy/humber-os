'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import NProgress from 'nprogress';
if (typeof window !== 'undefined') {
    NProgress.configure({
        showSpinner: false,
        trickleSpeed: 100,
        minimum: 0.1,
        easing: 'ease',
        speed: 300
    });
}
const ROUTE_CONFIGS = {
    '/': { preload: true, cache: true },
    '/projects': { preload: true, cache: true },
    '/analytics': { preload: false, cache: true, slowRoute: true },
    '/onboarding': { preload: true, cache: true },
    '/settings': { preload: true, cache: true },
    '/clients': { preload: true, cache: true },
    '/recruits': { preload: true, cache: true },
    '/time': { preload: true, cache: true },
    '/bull-pen': { preload: true, cache: true },
    '/knowledge': { preload: true, cache: true }
};
export function GlobalLoadingIndicator() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isSlowLoading, setIsSlowLoading] = useState(false);
    const timeoutRef = useRef();
    const slowTimeoutRef = useRef();
    const startTimeRef = useRef();
    const handleStart = useCallback(() => {
        startTimeRef.current = Date.now();
        setIsLoading(true);
        setLoadingProgress(0);
        setIsSlowLoading(false);
        NProgress.start();
        const progressInterval = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return prev;
                }
                return prev + Math.random() * 10;
            });
        }, 100);
        slowTimeoutRef.current = setTimeout(() => {
            setIsSlowLoading(true);
        }, 1000);
        return () => {
            clearInterval(progressInterval);
            if (slowTimeoutRef.current)
                clearTimeout(slowTimeoutRef.current);
        };
    }, []);
    const handleComplete = useCallback(() => {
        const loadTime = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
        setLoadingProgress(100);
        timeoutRef.current = setTimeout(() => {
            setIsLoading(false);
            setIsSlowLoading(false);
            NProgress.done();
        }, loadTime > 2000 ? 200 : 100);
        if (slowTimeoutRef.current)
            clearTimeout(slowTimeoutRef.current);
    }, []);
    useEffect(() => {
        handleComplete();
        const routeConfig = ROUTE_CONFIGS[pathname];
        if (routeConfig?.preload) {
            Object.keys(ROUTE_CONFIGS).forEach(route => {
                if (route !== pathname && ROUTE_CONFIGS[route]?.preload) {
                    router.prefetch(route);
                }
            });
        }
        return () => {
            if (timeoutRef.current)
                clearTimeout(timeoutRef.current);
            if (slowTimeoutRef.current)
                clearTimeout(slowTimeoutRef.current);
            handleComplete();
        };
    }, [pathname, searchParams, handleComplete, router]);
    return (_jsxs(_Fragment, { children: [_jsx("style", { jsx: true, global: true, children: `
        #nprogress {
          pointer-events: none;
        }

        #nprogress .bar {
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%);
          position: fixed;
          z-index: 9999;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.8), 0 0 5px rgba(139, 92, 246, 0.6);
          transition: all 0.3s ease;
        }

        #nprogress .peg {
          display: block;
          position: absolute;
          right: 0px;
          width: 100px;
          height: 100%;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.8), 0 0 5px rgba(59, 130, 246, 0.6);
          opacity: 1;
          transform: rotate(3deg) translate(0px, -4px);
        }

        .slow-loading #nprogress .bar {
          background: linear-gradient(90deg, #f59e0b 0%, #ef4444 50%, #dc2626 100%);
          animation: pulse 1s ease-in-out infinite alternate;
        }

        @keyframes pulse {
          from { box-shadow: 0 0 5px rgba(245, 158, 11, 0.5); }
          to { box-shadow: 0 0 15px rgba(245, 158, 11, 0.8); }
        }
      ` }), _jsx(AnimatePresence, { children: isLoading && (_jsxs(_Fragment, { children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: `fixed top-0 left-0 right-0 z-[9998] pointer-events-none ${isSlowLoading ? 'slow-loading' : ''}`, children: _jsx("div", { className: "h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" }) }), isSlowLoading && (_jsx(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, className: "fixed top-6 right-6 z-[9997] pointer-events-none", children: _jsxs("div", { className: "bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-lg px-4 py-2 shadow-lg", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "h-3 w-3 bg-yellow-500 rounded-full animate-pulse" }), _jsx("span", { className: "text-sm text-slate-300", children: "Loading complex data..." })] }), _jsx("div", { className: "mt-1 text-xs text-slate-400", children: "This may take a moment" })] }) })), _jsx(motion.div, { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0, opacity: 0 }, className: "fixed bottom-6 right-6 z-[9997] pointer-events-none", children: _jsx("div", { className: "bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-full p-2", children: _jsx("div", { className: "h-4 w-4 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" }) }) })] })) })] }));
}
export function PageLoadingIndicator({ route }) {
    const [loadingTip, setLoadingTip] = useState('');
    useEffect(() => {
        const tips = [
            'Loading your dashboard...',
            'Fetching latest data...',
            'Preparing your workspace...',
            'Almost ready...'
        ];
        let tipIndex = 0;
        const interval = setInterval(() => {
            setLoadingTip(tips[tipIndex % tips.length]);
            tipIndex++;
        }, 1500);
        return () => clearInterval(interval);
    }, []);
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md", children: _jsxs(motion.div, { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.8, opacity: 0 }, className: "flex flex-col items-center max-w-sm mx-auto", children: [_jsxs("div", { className: "relative mb-6", children: [_jsx("div", { className: "h-20 w-20 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin" }), _jsx("div", { className: "absolute inset-2", children: _jsx("div", { className: "h-12 w-12 rounded-full border-4 border-slate-800 border-r-purple-500 animate-spin", style: { animationDirection: 'reverse', animationDuration: '1.5s' } }) }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("div", { className: "h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" }) })] }), _jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "text-center", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-2", children: "Humber Operations" }), _jsx(motion.p, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "text-sm text-slate-400", children: loadingTip || 'Loading...' }, loadingTip)] }), _jsx("div", { className: "flex space-x-2 mt-4", children: [0, 1, 2].map((i) => (_jsx(motion.div, { className: "h-2 w-2 bg-blue-500 rounded-full", animate: {
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                        }, transition: {
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2
                        } }, i))) })] }) }));
}
export function InlineLoadingIndicator({ size = 'md' }) {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-3'
    };
    return (_jsx("div", { className: `${sizeClasses[size]} rounded-full border-slate-700 border-t-blue-500 animate-spin` }));
}
export function SkeletonCard() {
    return (_jsxs("div", { className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 animate-pulse", children: [_jsxs("div", { className: "flex items-center space-x-4 mb-4", children: [_jsx("div", { className: "h-12 w-12 bg-slate-700 rounded-full" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "h-4 bg-slate-700 rounded w-3/4 mb-2" }), _jsx("div", { className: "h-3 bg-slate-700 rounded w-1/2" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "h-3 bg-slate-700 rounded" }), _jsx("div", { className: "h-3 bg-slate-700 rounded w-5/6" }), _jsx("div", { className: "h-3 bg-slate-700 rounded w-4/6" })] })] }));
}
export function SkeletonTable({ rows = 5 }) {
    return (_jsxs("div", { className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsx("div", { className: "h-6 bg-slate-700 rounded w-1/4 mb-4" }), _jsx("div", { className: "space-y-3", children: Array.from({ length: rows }).map((_, i) => (_jsxs("div", { className: "flex items-center space-x-4 animate-pulse", children: [_jsx("div", { className: "h-8 w-8 bg-slate-700 rounded" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "h-3 bg-slate-700 rounded w-3/4" }), _jsx("div", { className: "h-3 bg-slate-700 rounded w-1/2" })] }), _jsx("div", { className: "h-6 w-16 bg-slate-700 rounded" })] }, i))) })] }));
}
export function SkeletonChart() {
    return (_jsxs("div", { className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 animate-pulse", children: [_jsx("div", { className: "h-6 bg-slate-700 rounded w-1/3 mb-4" }), _jsx("div", { className: "h-64 bg-slate-700/50 rounded flex items-end justify-between p-4 space-x-2", children: Array.from({ length: 7 }).map((_, i) => (_jsx("div", { className: "bg-slate-600 rounded-t", style: { height: `${Math.random() * 80 + 20}%`, width: '12%' } }, i))) })] }));
}
//# sourceMappingURL=global-loading.js.map