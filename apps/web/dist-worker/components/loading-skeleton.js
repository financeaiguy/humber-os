'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
export function Skeleton({ className = '', variant = 'text', width, height, count = 1 }) {
    const baseClasses = 'animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]';
    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
        card: 'rounded-xl'
    };
    const skeletonStyle = {
        width: width || (variant === 'circular' ? '40px' : '100%'),
        height: height || (variant === 'circular' ? '40px' : variant === 'card' ? '200px' : '20px')
    };
    return (_jsx(_Fragment, { children: Array.from({ length: count }).map((_, index) => (_jsx("div", { className: `${baseClasses} ${variantClasses[variant]} ${className} ${count > 1 ? 'mb-2' : ''}`, style: skeletonStyle }, index))) }));
}
export function TableSkeleton({ rows = 5, columns = 5 }) {
    return (_jsx("div", { className: "rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-slate-900/50 border-b border-slate-700/50", children: _jsx("tr", { children: Array.from({ length: columns }).map((_, i) => (_jsx("th", { className: "px-6 py-4 text-left", children: _jsx(Skeleton, { width: "80%", height: 16 }) }, i))) }) }), _jsx("tbody", { children: Array.from({ length: rows }).map((_, rowIndex) => (_jsx("tr", { className: "border-b border-slate-700/30", children: Array.from({ length: columns }).map((_, colIndex) => (_jsx("td", { className: "px-6 py-4", children: _jsx(Skeleton, { width: colIndex === 0 ? '60%' : '40%', height: 14 }) }, colIndex))) }, rowIndex))) })] }) }));
}
export function CardSkeleton({ count = 1 }) {
    return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: Array.from({ length: count }).map((_, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-4", children: [_jsx(Skeleton, { variant: "circular", width: 48, height: 48 }), _jsxs("div", { className: "flex-1", children: [_jsx(Skeleton, { width: "60%", height: 18, className: "mb-2" }), _jsx(Skeleton, { width: "40%", height: 14 })] })] }), _jsx(Skeleton, { variant: "rectangular", height: 100, className: "mb-4" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Skeleton, { width: "30%", height: 14 }), _jsx(Skeleton, { width: "20%", height: 24 })] })] }, index))) }));
}
export function PageSkeleton() {
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx(Skeleton, { width: "40%", height: 40, className: "mb-2" }), _jsx(Skeleton, { width: "60%", height: 20 })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: Array.from({ length: 4 }).map((_, i) => (_jsxs("div", { className: "rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4", children: [_jsx(Skeleton, { variant: "circular", width: 40, height: 40, className: "mb-3" }), _jsx(Skeleton, { width: "60%", height: 24, className: "mb-2" }), _jsx(Skeleton, { width: "40%", height: 16 })] }, i))) }), _jsx(TableSkeleton, { rows: 8, columns: 6 })] }));
}
export function FormSkeleton() {
    return (_jsxs("div", { className: "space-y-6", children: [Array.from({ length: 4 }).map((_, i) => (_jsxs("div", { children: [_jsx(Skeleton, { width: "30%", height: 14, className: "mb-2" }), _jsx(Skeleton, { variant: "rectangular", height: 40 })] }, i))), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Skeleton, { variant: "rectangular", width: 120, height: 40 }), _jsx(Skeleton, { variant: "rectangular", width: 120, height: 40 })] })] }));
}
//# sourceMappingURL=loading-skeleton.js.map