'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/components/session-context';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { LayoutDashboard, Briefcase, Clock, UserPlus, UserSearch, BarChart3, BookOpen, UserCircle, Settings, LogOut, Menu, X, Target, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { canAccessRoute } from '@/lib/permissions';
import { NotificationManager } from '@/components/notification-manager';
const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: Briefcase },
    { name: 'Bull Pen', href: '/bull-pen', icon: Target },
    { name: 'Recruits', href: '/recruits', icon: UserSearch },
    { name: 'Onboarding', href: '/onboarding', icon: UserPlus },
    { name: 'Time Tracking', href: '/time', icon: Clock },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Knowledge Base', href: '/knowledge', icon: BookOpen },
    { name: 'Customers', href: '/clients', icon: UserCircle },
];
export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const { data: session } = useSession();
    const unreadNotificationCount = 3;
    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/auth/signin' });
    };
    const isEmployee = session?.user?.role === 'ENGINEER_EMPLOYEE';
    if (isEmployee) {
        return null;
    }
    return (_jsxs(_Fragment, { children: [_jsx("button", { className: "lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800/90 backdrop-blur-lg border border-slate-600/50 shadow-lg", onClick: () => setMobileMenuOpen(!mobileMenuOpen), children: mobileMenuOpen ? _jsx(X, { size: 20, className: "text-white" }) : _jsx(Menu, { size: 20, className: "text-white" }) }), _jsx("div", { className: cn("fixed inset-y-0 left-0 z-40 w-72 sm:w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0", mobileMenuOpen ? "translate-x-0" : "-translate-x-full"), children: _jsxs("div", { className: "flex h-full flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50", children: [_jsx("div", { className: "flex h-16 items-center justify-center border-b border-slate-700/50", children: _jsx("h1", { className: "text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent", children: "Humber OS" }) }), _jsx("nav", { className: "flex-1 space-y-1 p-4", children: navigation.map((item) => {
                                const isActive = pathname === item.href;
                                const hasAccess = !session?.user || canAccessRoute(session.user.role, item.href);
                                if (!hasAccess)
                                    return null;
                                return (_jsxs(Link, { href: item.href, onClick: () => setMobileMenuOpen(false), className: cn("group flex items-center px-4 py-3 lg:px-3 lg:py-2.5 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation", isActive
                                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30"
                                        : "text-slate-200 hover:text-white hover:bg-white/5 active:bg-white/10"), children: [_jsx(item.icon, { className: cn("mr-3 h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-blue-400" : "text-slate-300 group-hover:text-white") }), item.name, isActive && (_jsx("div", { className: "ml-auto h-2 w-2 rounded-full bg-blue-400 animate-pulse" }))] }, item.name));
                            }) }), _jsx("div", { className: "border-t border-slate-700/50 p-4", children: session?.user && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center space-x-3 mb-4", children: [_jsx("div", { className: "h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold", children: session.user.name?.charAt(0)?.toUpperCase() }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-white", children: session.user.name }), _jsx("p", { className: "text-xs text-slate-200", children: session.user.partnerName }), _jsx("p", { className: "text-xs text-blue-400", children: session.user.role.replace('_', ' ') })] }), _jsxs("button", { onClick: () => setNotificationOpen(true), className: "relative p-2 rounded-lg hover:bg-slate-700/50 transition-colors", title: "Notifications", children: [_jsx(Bell, { className: "h-5 w-5 text-slate-200 hover:text-white" }), unreadNotificationCount > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse", children: unreadNotificationCount > 9 ? '9+' : unreadNotificationCount }))] })] }), _jsxs("div", { className: "space-y-1", children: [_jsxs(Link, { href: "/settings", onClick: () => setMobileMenuOpen(false), className: "flex w-full items-center px-4 py-3 lg:px-3 lg:py-2 text-sm text-slate-200 hover:text-white hover:bg-white/5 active:bg-white/10 rounded-lg transition-colors touch-manipulation", children: [_jsx(Settings, { className: "mr-3 h-4 w-4" }), "Settings"] }), _jsxs("button", { onClick: () => {
                                                    setMobileMenuOpen(false);
                                                    handleSignOut();
                                                }, className: "flex w-full items-center px-4 py-3 lg:px-3 lg:py-2 text-sm text-slate-200 hover:text-white hover:bg-white/5 active:bg-white/10 rounded-lg transition-colors touch-manipulation", children: [_jsx(LogOut, { className: "mr-3 h-4 w-4" }), "Sign out"] })] })] })) })] }) }), mobileMenuOpen && (_jsx("div", { className: "fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden", onClick: () => setMobileMenuOpen(false) })), _jsx(NotificationManager, { isOpen: notificationOpen, onClose: () => setNotificationOpen(false), position: "left" })] }));
}
//# sourceMappingURL=sidebar.js.map