'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { SkeletonCard, SkeletonTable, SkeletonChart } from './global-loading';
const LoadingContext = createContext(undefined);
export function useRouteLoading() {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useRouteLoading must be used within a LoadingProvider');
    }
    return context;
}
export function LoadingProvider({ children }) {
    const [isRouteLoading, setIsRouteLoading] = useState(false);
    const [routeLoadingMessage, setRouteLoadingMessage] = useState('');
    const router = useRouter();
    const pathname = usePathname();
    const setRouteLoading = (loading) => {
        setIsRouteLoading(loading);
        if (!loading) {
            setRouteLoadingMessage('');
        }
    };
    useEffect(() => {
        setRouteLoading(false);
    }, [pathname]);
    return (_jsx(LoadingContext.Provider, { value: {
            isRouteLoading,
            setRouteLoading,
            routeLoadingMessage,
            setRouteLoadingMessage
        }, children: children }));
}
export function DashboardSkeleton() {
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-8 bg-slate-700 rounded w-1/3 mb-4" }), _jsx("div", { className: "h-4 bg-slate-700 rounded w-2/3" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: Array.from({ length: 4 }).map((_, i) => (_jsxs("div", { className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 animate-pulse", children: [_jsx("div", { className: "h-4 bg-slate-700 rounded w-3/4 mb-2" }), _jsx("div", { className: "h-8 bg-slate-700 rounded w-1/2" })] }, i))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsx(SkeletonChart, {}), _jsx(SkeletonChart, {})] }), _jsx(SkeletonTable, { rows: 6 })] }));
}
export function ProjectsSkeleton() {
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex items-center justify-between animate-pulse", children: [_jsxs("div", { children: [_jsx("div", { className: "h-8 bg-slate-700 rounded w-64 mb-2" }), _jsx("div", { className: "h-4 bg-slate-700 rounded w-80" })] }), _jsx("div", { className: "h-10 bg-slate-700 rounded w-32" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: Array.from({ length: 4 }).map((_, i) => (_jsxs("div", { className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 animate-pulse", children: [_jsx("div", { className: "h-4 bg-slate-700 rounded w-3/4 mb-2" }), _jsx("div", { className: "h-6 bg-slate-700 rounded w-1/2" })] }, i))) }), _jsx("div", { className: "space-y-6", children: Array.from({ length: 3 }).map((_, i) => (_jsx(SkeletonCard, {}, i))) })] }));
}
export function AnalyticsSkeleton() {
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-8 bg-slate-700 rounded w-1/4 mb-4" }), _jsx("div", { className: "h-4 bg-slate-700 rounded w-1/2" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsx(SkeletonChart, {}), _jsx(SkeletonChart, {}), _jsx(SkeletonChart, {})] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsx(SkeletonChart, {}), _jsx(SkeletonTable, { rows: 8 })] })] }));
}
export function OnboardingSkeleton() {
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex items-center justify-between animate-pulse", children: [_jsxs("div", { children: [_jsx("div", { className: "h-8 bg-slate-700 rounded w-56 mb-2" }), _jsx("div", { className: "h-4 bg-slate-700 rounded w-96" })] }), _jsx("div", { className: "h-10 bg-slate-700 rounded w-48" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: Array.from({ length: 4 }).map((_, i) => (_jsxs("div", { className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 animate-pulse", children: [_jsx("div", { className: "h-4 bg-slate-700 rounded w-3/4 mb-2" }), _jsx("div", { className: "h-6 bg-slate-700 rounded w-1/2" })] }, i))) }), _jsx("div", { className: "space-y-4", children: Array.from({ length: 3 }).map((_, i) => (_jsxs("div", { className: "rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 animate-pulse", children: [_jsxs("div", { className: "flex items-center space-x-4 mb-4", children: [_jsx("div", { className: "h-12 w-12 bg-slate-700 rounded-full" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "h-4 bg-slate-700 rounded w-3/4 mb-2" }), _jsx("div", { className: "h-3 bg-slate-700 rounded w-1/2" })] })] }), _jsx("div", { className: "h-2 bg-slate-700 rounded mb-4" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx("div", { className: "h-16 bg-slate-700/50 rounded" }), _jsx("div", { className: "h-16 bg-slate-700/50 rounded" })] })] }, i))) })] }));
}
export function getRouteSkeleton(pathname) {
    switch (pathname) {
        case '/':
            return _jsx(DashboardSkeleton, {});
        case '/projects':
            return _jsx(ProjectsSkeleton, {});
        case '/analytics':
            return _jsx(AnalyticsSkeleton, {});
        case '/onboarding':
            return _jsx(OnboardingSkeleton, {});
        default:
            return (_jsx("div", { className: "space-y-6", children: Array.from({ length: 3 }).map((_, i) => (_jsx(SkeletonCard, {}, i))) }));
    }
}
export function RouteSkeleton({ pathname, show }) {
    return (_jsx(AnimatePresence, { children: show && (_jsx("div", { className: "min-h-screen", children: getRouteSkeleton(pathname) })) }));
}
//# sourceMappingURL=route-loading.js.map