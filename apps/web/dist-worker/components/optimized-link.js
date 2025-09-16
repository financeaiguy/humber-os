'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useRouteLoading, getRouteSkeleton } from './route-loading';
import { motion, AnimatePresence } from 'framer-motion';
export function OptimizedLink({ href, children, className = '', prefetch = true, showSkeleton = true, loadingMessage, replace = false, onClick }) {
    const router = useRouter();
    const pathname = usePathname();
    const { setRouteLoading, setRouteLoadingMessage } = useRouteLoading();
    const [isNavigating, setIsNavigating] = useState(false);
    const [showSkeletonState, setShowSkeletonState] = useState(false);
    const handleClick = useCallback((e) => {
        if (typeof href !== 'string') {
            console.warn('OptimizedLink: href must be a string, received:', typeof href, href);
            e.preventDefault();
            return;
        }
        if (href === pathname) {
            e.preventDefault();
            return;
        }
        if (onClick) {
            onClick();
        }
        setIsNavigating(true);
        setRouteLoading(true);
        if (loadingMessage) {
            setRouteLoadingMessage(loadingMessage);
        }
        if (showSkeleton) {
            setShowSkeletonState(true);
        }
        const targetHref = typeof href === 'string' ? href : String(href);
        if (replace) {
            router.replace(targetHref);
        }
        else {
            router.push(targetHref);
        }
    }, [href, pathname, onClick, setRouteLoading, setRouteLoadingMessage, loadingMessage, showSkeleton, replace, router]);
    useEffect(() => {
        if (pathname === href) {
            setIsNavigating(false);
            setShowSkeletonState(false);
        }
    }, [pathname, href]);
    return (_jsxs(_Fragment, { children: [_jsx(Link, { href: href, className: className, prefetch: prefetch, onClick: handleClick, children: children }), _jsx(AnimatePresence, { children: showSkeletonState && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-sm", children: _jsx("div", { className: "container mx-auto p-4 sm:p-6 lg:p-8", children: getRouteSkeleton(href) }) })) })] }));
}
export function DashboardLink({ children, className = '' }) {
    return (_jsx(OptimizedLink, { href: "/", className: className, loadingMessage: "Loading dashboard...", children: children }));
}
export function ProjectsLink({ children, className = '' }) {
    return (_jsx(OptimizedLink, { href: "/projects", className: className, loadingMessage: "Loading projects...", children: children }));
}
export function AnalyticsLink({ children, className = '' }) {
    return (_jsx(OptimizedLink, { href: "/analytics", className: className, loadingMessage: "Loading analytics data...", showSkeleton: true, children: children }));
}
export function OnboardingLink({ children, className = '' }) {
    return (_jsx(OptimizedLink, { href: "/onboarding", className: className, loadingMessage: "Loading onboarding...", children: children }));
}
export function useFastNavigation() {
    const router = useRouter();
    const { setRouteLoading, setRouteLoadingMessage } = useRouteLoading();
    const navigate = useCallback((href, options) => {
        const { replace = false, loadingMessage, prefetch = true } = options || {};
        setRouteLoading(true);
        if (loadingMessage) {
            setRouteLoadingMessage(loadingMessage);
        }
        if (prefetch) {
            router.prefetch(href);
        }
        const targetHref = typeof href === 'string' ? href : String(href);
        if (replace) {
            router.replace(targetHref);
        }
        else {
            router.push(targetHref);
        }
    }, [router, setRouteLoading, setRouteLoadingMessage]);
    return { navigate };
}
//# sourceMappingURL=optimized-link.js.map