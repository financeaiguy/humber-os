import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CardSkeleton, Skeleton } from '@/components/loading-skeleton';
export default function Loading() {
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("div", { className: "h-10 w-56 bg-slate-800 rounded-lg animate-pulse mb-2" }), _jsx("div", { className: "h-5 w-96 bg-slate-800 rounded animate-pulse" })] }), _jsx("div", { className: "grid grid-cols-4 md:grid-cols-8 gap-4", children: [...Array(8)].map((_, i) => (_jsxs("div", { className: "text-center", children: [_jsx(Skeleton, { variant: "circular", width: 48, height: 48, className: "mx-auto mb-2" }), _jsx(Skeleton, { width: "80%", height: 14, className: "mx-auto" })] }, i))) }), _jsx(CardSkeleton, { count: 6 })] }));
}
//# sourceMappingURL=loading.js.map