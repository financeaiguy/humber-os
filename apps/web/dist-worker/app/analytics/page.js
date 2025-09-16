'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
const OptimizedKPIDashboard = dynamic(() => import('@/components/analytics/OptimizedKPIDashboard'), {
    ssr: false,
    loading: () => (_jsxs("div", { className: "w-full space-y-6 p-4", children: [_jsx("div", { className: "animate-pulse bg-slate-700 rounded-xl h-[200px]" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [...Array(4)].map((_, i) => (_jsx("div", { className: "animate-pulse bg-slate-700 rounded-xl h-[120px]" }, i))) }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [...Array(4)].map((_, i) => (_jsx("div", { className: "animate-pulse bg-slate-700 rounded-xl h-[350px]" }, i))) })] }))
});
export default function AnalyticsPage() {
    return (_jsx(Suspense, { fallback: _jsxs("div", { className: "w-full space-y-6 p-4", children: [_jsx("div", { className: "animate-pulse bg-slate-700 rounded-xl h-[200px]" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [...Array(4)].map((_, i) => (_jsx("div", { className: "animate-pulse bg-slate-700 rounded-xl h-[120px]" }, i))) })] }), children: _jsx(OptimizedKPIDashboard, {}) }));
}
//# sourceMappingURL=page.js.map