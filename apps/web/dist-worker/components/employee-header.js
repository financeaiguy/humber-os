'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSession } from '@/components/session-context';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
export function EmployeeHeader() {
    const { data: session } = useSession();
    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/auth/signin' });
    };
    if (!session?.user || session.user.role !== 'ENGINEER_EMPLOYEE') {
        return null;
    }
    return (_jsx("header", { className: "bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3 sticky top-0 z-40", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("h1", { className: "text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent", children: "Humber OS" }), _jsx("div", { className: "h-6 w-px bg-slate-600" }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center", children: _jsx("span", { className: "text-white font-semibold text-sm", children: session.user.name?.charAt(0)?.toUpperCase() }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-white", children: session.user.name }), _jsx("p", { className: "text-xs text-blue-400", children: "Employee" })] })] })] }), _jsxs("button", { onClick: handleSignOut, className: "flex items-center space-x-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors", children: [_jsx(LogOut, { className: "h-4 w-4" }), _jsx("span", { children: "Sign out" })] })] }) }));
}
//# sourceMappingURL=employee-header.js.map