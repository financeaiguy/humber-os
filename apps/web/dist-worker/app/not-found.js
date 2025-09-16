import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
export default function NotFound() {
    return (_jsxs("div", { className: "flex h-[50vh] flex-col items-center justify-center", children: [_jsx("h2", { className: "text-3xl font-bold text-white mb-4", children: "404 - Page Not Found" }), _jsx("p", { className: "text-slate-400 mb-6", children: "Could not find the requested resource" }), _jsx(Link, { href: "/", className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: "Return Home" })] }));
}
//# sourceMappingURL=not-found.js.map