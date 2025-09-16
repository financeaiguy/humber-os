'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, User, Briefcase, ChevronRight, Archive, Eye, Search, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
const mockNotifications = [
    {
        id: '1',
        type: 'onboarding',
        title: 'New Employee Onboarding',
        message: 'Michael Chen has completed documentation phase',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        read: false,
        priority: 'high',
        category: 'Employee Onboarding',
        actionUrl: '/onboarding',
        actionLabel: 'View Progress'
    },
    {
        id: '2',
        type: 'alert',
        title: 'Pending Approval Required',
        message: 'Sarah Johnson\'s background check needs your approval',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: false,
        priority: 'urgent',
        category: 'Approvals',
        actionUrl: '/onboarding',
        actionLabel: 'Review Now'
    },
    {
        id: '3',
        type: 'task',
        title: 'Training Schedule Reminder',
        message: 'David Kim\'s IT security training is scheduled for tomorrow',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        read: false,
        priority: 'medium',
        category: 'Training',
        actionUrl: '/onboarding',
        actionLabel: 'View Schedule'
    },
    {
        id: '4',
        type: 'success',
        title: 'Onboarding Completed',
        message: 'Emily Rodriguez has successfully completed all onboarding steps',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        read: true,
        priority: 'low',
        category: 'Completions'
    },
    {
        id: '5',
        type: 'system',
        title: 'System Update',
        message: 'New compliance requirements have been added to the onboarding process',
        timestamp: new Date(Date.now() - 1000 * 60 * 180),
        read: true,
        priority: 'low',
        category: 'System'
    }
];
export function NotificationManager({ isOpen, onClose, position = 'left' }) {
    const [notifications, setNotifications] = useState(mockNotifications);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNotification, setSelectedNotification] = useState(null);
    const unreadCount = notifications.filter(n => !n.read).length;
    const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;
    const handleMarkAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };
    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };
    const handleDelete = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        setSelectedNotification(null);
    };
    const handleArchive = (id) => {
        handleDelete(id);
    };
    const getFilteredNotifications = () => {
        let filtered = [...notifications];
        switch (filter) {
            case 'unread':
                filtered = filtered.filter(n => !n.read);
                break;
            case 'onboarding':
                filtered = filtered.filter(n => n.type === 'onboarding');
                break;
            case 'urgent':
                filtered = filtered.filter(n => n.priority === 'urgent' || n.priority === 'high');
                break;
        }
        if (searchQuery) {
            filtered = filtered.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.category?.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return filtered.sort((a, b) => {
            if (a.priority === 'urgent' && b.priority !== 'urgent')
                return -1;
            if (b.priority === 'urgent' && a.priority !== 'urgent')
                return 1;
            return b.timestamp.getTime() - a.timestamp.getTime();
        });
    };
    const getIcon = (type) => {
        switch (type) {
            case 'onboarding': return User;
            case 'task': return Briefcase;
            case 'alert': return AlertCircle;
            case 'success': return CheckCircle;
            case 'system': return Info;
            default: return Bell;
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'text-red-400 bg-red-500/20';
            case 'high': return 'text-orange-400 bg-orange-500/20';
            case 'medium': return 'text-yellow-400 bg-yellow-500/20';
            case 'low': return 'text-blue-400 bg-blue-500/20';
        }
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'onboarding': return 'from-blue-500 to-cyan-500';
            case 'task': return 'from-purple-500 to-pink-500';
            case 'alert': return 'from-red-500 to-orange-500';
            case 'success': return 'from-green-500 to-emerald-500';
            case 'system': return 'from-gray-500 to-slate-500';
        }
    };
    return (_jsx(AnimatePresence, { children: isOpen && (_jsxs(_Fragment, { children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: onClose, className: "fixed inset-0 bg-black/20 backdrop-blur-sm z-40" }), _jsxs(motion.div, { initial: { x: position === 'left' ? -400 : 400, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: position === 'left' ? -400 : 400, opacity: 0 }, transition: { type: 'spring', damping: 25 }, className: `fixed top-0 ${position === 'left' ? 'left-0' : 'right-0'} h-full w-[400px] bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl z-50`, children: [_jsxs("div", { className: "p-6 border-b border-slate-700/50", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "relative", children: [_jsx(Bell, { className: "h-6 w-6 text-white" }), unreadCount > 0 && (_jsx("span", { className: "absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center", children: unreadCount }))] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-white", children: "Notifications" }), _jsxs("p", { className: "text-xs text-slate-400", children: [unreadCount, " unread, ", urgentCount, " urgent"] })] })] }), _jsx("button", { onClick: onClose, className: "p-2 rounded-lg hover:bg-slate-800 transition-colors", children: _jsx(X, { className: "h-5 w-5 text-slate-400" }) })] }), _jsxs("div", { className: "relative mb-3", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search notifications...", className: "w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" })] }), _jsx("div", { className: "flex space-x-2", children: ['all', 'unread', 'onboarding', 'urgent'].map((tab) => (_jsx("button", { onClick: () => setFilter(tab), className: `px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filter === tab
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'}`, children: tab.charAt(0).toUpperCase() + tab.slice(1) }, tab))) })] }), _jsxs("div", { className: "px-6 py-3 border-b border-slate-700/50 flex items-center justify-between", children: [_jsxs("button", { onClick: handleMarkAllAsRead, className: "text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1", children: [_jsx(Check, { className: "h-3 w-3" }), _jsx("span", { children: "Mark all as read" })] }), _jsxs("button", { className: "text-xs text-slate-400 hover:text-white transition-colors flex items-center space-x-1", children: [_jsx(Settings, { className: "h-3 w-3" }), _jsx("span", { children: "Settings" })] })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-4 space-y-3", style: { maxHeight: 'calc(100vh - 280px)' }, children: getFilteredNotifications().length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Bell, { className: "h-12 w-12 text-slate-600 mx-auto mb-3" }), _jsx("p", { className: "text-slate-400", children: "No notifications found" }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: filter !== 'all' ? 'Try changing your filter' : 'You\'re all caught up!' })] })) : (getFilteredNotifications().map((notification) => {
                                const Icon = getIcon(notification.type);
                                return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, onClick: () => setSelectedNotification(notification), className: `relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${!notification.read
                                        ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                                        : 'bg-slate-900/30 border-slate-800 hover:bg-slate-800/50'}`, children: [!notification.read && (_jsx("div", { className: "absolute top-4 left-2 h-2 w-2 bg-blue-500 rounded-full animate-pulse" })), _jsxs("div", { className: "flex items-start space-x-3 ml-2", children: [_jsx("div", { className: `p-2 rounded-lg bg-gradient-to-r ${getTypeColor(notification.type)} flex-shrink-0`, children: _jsx(Icon, { className: "h-4 w-4 text-white" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-start justify-between mb-1", children: [_jsx("h3", { className: "text-sm font-medium text-white truncate pr-2", children: notification.title }), _jsx("button", { onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        handleDelete(notification.id);
                                                                    }, className: "p-1 rounded hover:bg-slate-700 transition-colors flex-shrink-0", children: _jsx(X, { className: "h-3 w-3 text-slate-400" }) })] }), _jsx("p", { className: "text-xs text-slate-400 line-clamp-2 mb-2", children: notification.message }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [notification.category && (_jsx("span", { className: "text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded", children: notification.category })), _jsx("span", { className: `text-xs px-2 py-0.5 rounded ${getPriorityColor(notification.priority)}`, children: notification.priority })] }), _jsx("span", { className: "text-xs text-slate-500", children: formatDistanceToNow(notification.timestamp, { addSuffix: true }) })] }), notification.actionUrl && (_jsxs("button", { onClick: (e) => {
                                                                e.stopPropagation();
                                                                handleMarkAsRead(notification.id);
                                                                window.location.href = notification.actionUrl;
                                                            }, className: "mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1", children: [_jsx("span", { children: notification.actionLabel || 'View' }), _jsx(ChevronRight, { className: "h-3 w-3" })] }))] })] }), _jsxs("div", { className: "absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity flex space-x-1", children: [!notification.read && (_jsx("button", { onClick: (e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(notification.id);
                                                    }, className: "p-1 rounded hover:bg-slate-700 transition-colors", title: "Mark as read", children: _jsx(Eye, { className: "h-3 w-3 text-slate-400" }) })), _jsx("button", { onClick: (e) => {
                                                        e.stopPropagation();
                                                        handleArchive(notification.id);
                                                    }, className: "p-1 rounded hover:bg-slate-700 transition-colors", title: "Archive", children: _jsx(Archive, { className: "h-3 w-3 text-slate-400" }) })] })] }, notification.id));
                            })) }), _jsx("div", { className: "p-4 border-t border-slate-700/50", children: _jsxs("button", { onClick: () => {
                                    setFilter('all');
                                    setSearchQuery('');
                                }, className: "w-full py-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors text-sm", children: ["View All Notifications (", notifications.length, ")"] }) })] })] })) }));
}
export function NotificationBadge({ count }) {
    if (count === 0)
        return null;
    return (_jsx("span", { className: "absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse", children: count > 9 ? '9+' : count }));
}
//# sourceMappingURL=notification-manager.js.map