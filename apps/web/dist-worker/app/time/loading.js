import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Skeleton, CardSkeleton } from '@/components/loading-skeleton';
export default function Loading() {
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("div", { className: "h-10 w-64 bg-slate-800 rounded-lg animate-pulse mb-2" }), _jsx("div", { className: "h-5 w-96 bg-slate-800 rounded animate-pulse" })] }), _jsx("div", { className: "rounded-2xl bg-slate-800/50 p-6", children: _jsx(Skeleton, { variant: "rectangular", height: 120 }) }), _jsx(CardSkeleton, { count: 3 })] }));
}
//# sourceMappingURL=loading.js.map