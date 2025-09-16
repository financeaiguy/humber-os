'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from '@/components/session-context';
import Link from 'next/link';
import { Home, Briefcase, Users, BarChart3, Settings, Menu, X } from 'lucide-react';
const coreNavigation = [
    { name: 'Overview', href: '/', icon: Home },
    { name: 'Projects', href: '/projects', icon: Briefcase },
    { name: 'Team', href: '/recruits', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
];
export function JobsLayout({ children }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    if (pathname.startsWith('/auth')) {
        return (_jsx("div", { className: "jobs-layout min-h-screen bg-slate-950", children: children }));
    }
    return (_jsxs("div", { className: "jobs-layout bg-slate-950", children: [_jsx("button", { className: "md:hidden fixed top-4 left-4 z-50 p-3 bg-slate-800 border border-slate-600 rounded-lg shadow-md text-white", onClick: () => setSidebarOpen(!sidebarOpen), children: sidebarOpen ? _jsx(X, { size: 20 }) : _jsx(Menu, { size: 20 }) }), _jsxs("aside", { className: `
        jobs-sidebar fixed inset-y-0 left-0 z-40 
        transform transition-transform duration-300 ease-out
        md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `, children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-display text-2xl font-bold text-black", children: "Humber" }), _jsx("p", { className: "text-caption text-gray-500 mt-1", children: "Engineering Operations" })] }), _jsx("nav", { className: "jobs-nav", children: coreNavigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (_jsxs(Link, { href: item.href, className: `jobs-nav-item ${isActive ? 'active' : ''}`, onClick: () => setSidebarOpen(false), children: [_jsx(item.icon, { size: 18 }), _jsx("span", { className: "text-body", children: item.name })] }, item.name));
                        }) }), session?.user && (_jsx("div", { className: "mt-auto pt-8 border-t border-gray-200", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold", children: session.user.name?.charAt(0)?.toUpperCase() }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-body text-sm font-medium text-black truncate", children: session.user.name }), _jsx("p", { className: "text-caption text-xs text-gray-500 truncate", children: session.user.partnerName })] })] }) }))] }), _jsx("main", { className: "jobs-main md:ml-60", children: _jsx("div", { className: "jobs-fade-in", children: children }) }), sidebarOpen && (_jsx("div", { className: "fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden", onClick: () => setSidebarOpen(false) }))] }));
}
export function JobsStatCard({ title, value, subtitle, trend }) {
    return (_jsx("div", { className: "jobs-card", children: _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-caption text-gray-500", children: title }), _jsx("p", { className: "text-display text-3xl font-bold text-black", children: value }), subtitle && (_jsx("p", { className: `text-body text-sm ${trend === 'up' ? 'text-green-600' :
                        trend === 'down' ? 'text-red-600' :
                            'text-gray-500'}`, children: subtitle }))] }) }));
}
export function JobsSection({ title, subtitle, action, children }) {
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-heading text-2xl font-semibold text-black", children: title }), subtitle && (_jsx("p", { className: "text-body text-gray-600 mt-1", children: subtitle }))] }), action] }), children] }));
}
export function JobsTable({ headers, children }) {
    return (_jsx("div", { className: "jobs-card", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsx("tr", { className: "border-b border-gray-200", children: headers.map((header, index) => (_jsx("th", { className: "text-caption text-left py-3 px-0 text-gray-500 font-medium", children: header }, index))) }) }), _jsx("tbody", { className: "divide-y divide-gray-100", children: children })] }) }) }));
}
export function JobsButton({ children, variant = 'primary', size = 'medium', ...props }) {
    const baseClass = variant === 'primary' ? 'jobs-button' : 'jobs-button-secondary';
    const sizeClass = {
        small: 'px-3 py-2 text-sm',
        medium: 'px-4 py-2',
        large: 'px-6 py-3 text-lg'
    }[size];
    return (_jsx("button", { className: `${baseClass} ${sizeClass} jobs-focus`, ...props, children: children }));
}
//# sourceMappingURL=jobs-layout.js.map