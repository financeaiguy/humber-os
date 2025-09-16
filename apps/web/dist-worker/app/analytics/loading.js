import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Skeleton } from '@/components/loading-skeleton';
export default function Loading() {
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("div", { className: "h-10 w-48 bg-slate-800 rounded-lg animate-pulse mb-2" }), _jsx("div", { className: "h-5 w-80 bg-slate-800 rounded animate-pulse" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [...Array(4)].map((_, i) => (_jsxs("div", { className: "rounded-xl bg-slate-800/50 p-4", children: [_jsx(Skeleton, { variant: "circular", width: 40, height: 40, className: "mb-3" }), _jsx(Skeleton, { width: "60%", height: 24, className: "mb-2" }), _jsx(Skeleton, { width: "40%", height: 16 })] }, i))) }), _jsx(Skeleton, { variant: "rectangular", height: 400 })] }));
}
//# sourceMappingURL=loading.js.map