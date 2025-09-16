import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TableSkeleton, CardSkeleton } from '@/components/loading-skeleton';
export default function Loading() {
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("div", { className: "h-10 w-48 bg-slate-800 rounded-lg animate-pulse mb-2" }), _jsx("div", { className: "h-5 w-96 bg-slate-800 rounded animate-pulse" })] }), _jsx(CardSkeleton, { count: 3 }), _jsx(TableSkeleton, { rows: 6, columns: 5 })] }));
}
//# sourceMappingURL=loading.js.map