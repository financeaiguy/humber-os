'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Clock, Shield, CheckCircle, AlertCircle, Save, X, Plus, Eye, Filter, Download, Upload, Users, Building, Briefcase, Target, TrendingUp } from 'lucide-react';
import { useSession } from '@/components/session-context';
import { hasPermission } from '@/lib/permissions';
export default function TimeTrackingCalendar({ userRole, employeeId, isReadOnly = false }) {
    const { data: session } = useSession();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [timeEntries, setTimeEntries] = useState([]);
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [viewMode, setViewMode] = useState('month');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const mockTimeEntries = [
        {
            id: 'entry_001',
            date: '2025-09-15',
            clockIn: '08:00',
            clockOut: '17:00',
            totalHours: 8.5,
            project: 'GM Assembly Line',
            client: 'General Motors',
            status: 'approved',
            trustScore: 95,
            location: 'Detroit, MI',
            notes: 'Regular shift, no issues',
            employeeId: 'emp_001',
            employeeName: 'John Smith'
        },
        {
            id: 'entry_002',
            date: '2025-09-14',
            clockIn: '08:15',
            clockOut: '16:45',
            totalHours: 8.0,
            project: 'Ford Paint Shop',
            client: 'Ford Motor Company',
            status: 'pending',
            trustScore: 88,
            location: 'Dearborn, MI',
            notes: 'Slight delay due to traffic',
            employeeId: 'emp_001',
            employeeName: 'John Smith'
        },
        {
            id: 'entry_003',
            date: '2025-09-13',
            clockIn: '07:45',
            clockOut: '18:30',
            totalHours: 10.25,
            project: 'Stellantis Automation',
            client: 'Stellantis',
            status: 'disputed',
            trustScore: 72,
            location: 'Auburn Hills, MI',
            notes: 'Overtime due to equipment issues',
            employeeId: 'emp_001',
            employeeName: 'John Smith'
        }
    ];
    useEffect(() => {
        setTimeEntries(mockTimeEntries);
    }, [currentDate, employeeId]);
    const canEdit = () => {
        switch (userRole) {
            case 'engineer':
                return hasPermission('PARTNER_ADMIN', 'canLogTime');
            case 'operator':
                return hasPermission('PARTNER_OPERATOR', 'canLogTime');
            case 'partner':
                return hasPermission('PARTNER_ADMIN', 'canManageProjects');
            case 'assistant':
                return hasPermission('PARTNER_OPERATOR', 'canViewAnalytics');
            case 'employee':
                return hasPermission('ENGINEER_EMPLOYEE', 'canLogTime');
            default:
                return false;
        }
    };
    const canViewAll = () => {
        return ['engineer', 'operator', 'partner'].includes(userRole);
    };
    const canApprove = () => {
        return ['engineer', 'operator', 'partner'].includes(userRole);
    };
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        const days = [];
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }
        return days;
    };
    const getEntriesForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return timeEntries.filter(entry => entry.date === dateStr);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'disputed': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };
    const getTrustScoreColor = (score) => {
        if (score >= 90)
            return 'text-green-400';
        if (score >= 75)
            return 'text-yellow-400';
        return 'text-red-400';
    };
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    const navigateMonth = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1);
            }
            else {
                newDate.setMonth(newDate.getMonth() + 1);
            }
            return newDate;
        });
    };
    const handleDateClick = (date) => {
        if (!date)
            return;
        setSelectedDate(date);
        const entries = getEntriesForDate(date);
        if (entries.length > 0) {
            setEditingEntry(entries[0]);
            setShowEntryModal(true);
        }
        else if (canEdit()) {
            setEditingEntry({
                id: '',
                date: date.toISOString().split('T')[0],
                clockIn: '',
                clockOut: '',
                totalHours: 0,
                project: '',
                client: '',
                status: 'pending',
                trustScore: 0,
                location: '',
                employeeId: employeeId || session?.user?.id || '',
                employeeName: session?.user?.name || 'Current User'
            });
            setShowEntryModal(true);
        }
    };
    const handleSaveEntry = () => {
        if (!editingEntry)
            return;
        if (editingEntry.id) {
            setTimeEntries(prev => prev.map(entry => entry.id === editingEntry.id ? editingEntry : entry));
        }
        else {
            const newEntry = {
                ...editingEntry,
                id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            setTimeEntries(prev => [...prev, newEntry]);
        }
        setShowEntryModal(false);
        setEditingEntry(null);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Time Tracking Calendar" }), _jsx("p", { className: "text-slate-400", children: userRole === 'employee' ? 'Your time entries and schedule' :
                                    userRole === 'engineer' ? 'Manage engineer time entries' :
                                        userRole === 'operator' ? 'Operator time management' :
                                            userRole === 'partner' ? 'Partner time oversight' :
                                                'Assistant time coordination' })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex items-center bg-slate-800 rounded-lg p-1", children: ['month', 'week', 'day'].map((mode) => (_jsx("button", { onClick: () => setViewMode(mode), className: `px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === mode
                                        ? 'bg-blue-500 text-white'
                                        : 'text-slate-400 hover:text-white'}`, children: mode.charAt(0).toUpperCase() + mode.slice(1) }, mode))) }), _jsx("button", { onClick: () => setShowFilters(!showFilters), className: "p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors", children: _jsx(Filter, { className: "h-5 w-5" }) }), canEdit() && (_jsxs("button", { onClick: () => {
                                    setEditingEntry({
                                        id: '',
                                        date: new Date().toISOString().split('T')[0],
                                        clockIn: '',
                                        clockOut: '',
                                        totalHours: 0,
                                        project: '',
                                        client: '',
                                        status: 'pending',
                                        trustScore: 0,
                                        location: '',
                                        employeeId: employeeId || session?.user?.id || '',
                                        employeeName: session?.user?.name || 'Current User'
                                    });
                                    setShowEntryModal(true);
                                }, className: "px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all flex items-center space-x-2", children: [_jsx(Plus, { className: "h-4 w-4" }), _jsx("span", { children: "Add Entry" })] }))] })] }), showFilters && (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, className: "bg-slate-800/50 rounded-lg p-4 border border-slate-700", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Status" }), _jsxs("select", { value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white", children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "disputed", children: "Disputed" }), _jsx("option", { value: "rejected", children: "Rejected" })] })] }), canViewAll() && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Employee" }), _jsxs("select", { className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white", children: [_jsx("option", { value: "all", children: "All Employees" }), _jsx("option", { value: "emp_001", children: "John Smith" }), _jsx("option", { value: "emp_002", children: "Sarah Johnson" }), _jsx("option", { value: "emp_003", children: "Mike Chen" })] })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Project" }), _jsxs("select", { className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white", children: [_jsx("option", { value: "all", children: "All Projects" }), _jsx("option", { value: "gm-assembly", children: "GM Assembly Line" }), _jsx("option", { value: "ford-paint", children: "Ford Paint Shop" }), _jsx("option", { value: "stellantis-auto", children: "Stellantis Automation" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Trust Score" }), _jsxs("select", { className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white", children: [_jsx("option", { value: "all", children: "All Scores" }), _jsx("option", { value: "high", children: "High (90%+)" }), _jsx("option", { value: "medium", children: "Medium (75-89%)" }), _jsx("option", { value: "low", children: "Low (< 75%)" })] })] })] }) })), _jsxs("div", { className: "flex items-center justify-between bg-slate-800/50 rounded-lg p-4", children: [_jsx("button", { onClick: () => navigateMonth('prev'), className: "p-2 hover:bg-slate-700 rounded-lg transition-colors", children: _jsx(ChevronLeft, { className: "h-5 w-5 text-slate-400" }) }), _jsx("h3", { className: "text-xl font-semibold text-white", children: currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }), _jsx("button", { onClick: () => navigateMonth('next'), className: "p-2 hover:bg-slate-700 rounded-lg transition-colors", children: _jsx(ChevronRight, { className: "h-5 w-5 text-slate-400" }) })] }), _jsxs("div", { className: "bg-slate-800/50 rounded-lg p-6", children: [_jsx("div", { className: "grid grid-cols-7 gap-2 mb-4", children: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (_jsx("div", { className: "text-center text-slate-400 font-medium py-2", children: day }, day))) }), _jsx("div", { className: "grid grid-cols-7 gap-2", children: getDaysInMonth(currentDate).map((date, index) => {
                            if (!date) {
                                return _jsx("div", { className: "h-24" }, index);
                            }
                            const entries = getEntriesForDate(date);
                            const hasEntries = entries.length > 0;
                            const isToday = date.toDateString() === new Date().toDateString();
                            const isSelected = selectedDate?.toDateString() === date.toDateString();
                            return (_jsxs(motion.div, { whileHover: { scale: 1.02 }, onClick: () => handleDateClick(date), className: `h-24 p-2 rounded-lg border cursor-pointer transition-all ${isSelected
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : isToday
                                        ? 'border-green-500 bg-green-500/10'
                                        : hasEntries
                                            ? 'border-slate-600 bg-slate-700/30 hover:bg-slate-700/50'
                                            : 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/30'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: `text-sm font-medium ${isToday ? 'text-green-400' : 'text-white'}`, children: date.getDate() }), hasEntries && (_jsxs("div", { className: "flex space-x-1", children: [entries.slice(0, 2).map((entry) => (_jsx("div", { className: `w-2 h-2 rounded-full ${entry.status === 'approved' ? 'bg-green-400' :
                                                            entry.status === 'pending' ? 'bg-yellow-400' :
                                                                'bg-red-400'}` }, entry.id))), entries.length > 2 && (_jsxs("span", { className: "text-xs text-slate-400", children: ["+", entries.length - 2] }))] }))] }), hasEntries && (_jsx("div", { className: "space-y-1", children: entries.slice(0, 2).map((entry) => (_jsxs("div", { className: "text-xs text-slate-400 truncate", children: [entry.totalHours, "h - ", entry.project] }, entry.id))) }))] }, date.toISOString()));
                        }) })] }), _jsxs("div", { className: "bg-slate-800/50 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: userRole === 'employee' ? 'Your Actions' :
                            userRole === 'engineer' ? 'Engineer Controls' :
                                userRole === 'operator' ? 'Operator Dashboard' :
                                    userRole === 'partner' ? 'Partner Management' :
                                        'Assistant Tools' }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [userRole === 'employee' && (_jsxs(_Fragment, { children: [_jsxs("button", { className: "p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/20 transition-all flex items-center space-x-3", children: [_jsx(Clock, { className: "h-5 w-5" }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-medium", children: "Clock In/Out" }), _jsx("div", { className: "text-sm opacity-70", children: "Track your time" })] })] }), _jsxs("button", { className: "p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all flex items-center space-x-3", children: [_jsx(Calendar, { className: "h-5 w-5" }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-medium", children: "View Schedule" }), _jsx("div", { className: "text-sm opacity-70", children: "Your assignments" })] })] }), _jsxs("button", { className: "p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-all flex items-center space-x-3", children: [_jsx(Download, { className: "h-5 w-5" }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-medium", children: "Export Data" }), _jsx("div", { className: "text-sm opacity-70", children: "Download timesheet" })] })] })] })), userRole === 'engineer' && (_jsxs(_Fragment, { children: [_jsxs("button", { className: "p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all flex items-center space-x-3", children: [_jsx(Users, { className: "h-5 w-5" }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-medium", children: "Manage Team" }), _jsx("div", { className: "text-sm opacity-70", children: "Engineer oversight" })] })] }), _jsxs("button", { className: "p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/20 transition-all flex items-center space-x-3", children: [_jsx(CheckCircle, { className: "h-5 w-5" }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-medium", children: "Approve Time" }), _jsx("div", { className: "text-sm opacity-70", children: "Review submissions" })] })] }), _jsxs("button", { className: "p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-500/20 transition-all flex items-center space-x-3", children: [_jsx(TrendingUp, { className: "h-5 w-5" }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-medium", children: "Analytics" }), _jsx("div", { className: "text-sm opacity-70", children: "Performance metrics" })] })] })] })), userRole === 'operator' && (_jsxs(_Fragment, { children: [_jsxs("button", { className: "p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-all flex items-center space-x-3", children: [_jsx(Building, { className: "h-5 w-5" }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-medium", children: "Project Management" }), _jsx("div", { className: "text-sm opacity-70", children: "Assign engineers" })] })] }), _jsxs("button", { className: "p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 hover:bg-orange-500/20 transition-all flex items-center space-x-3", children: [_jsx(Shield, { className: "h-5 w-5" }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-medium", children: "Compliance" }), _jsx("div", { className: "text-sm opacity-70", children: "Monitor adherence" })] })] }), _jsxs("button", { className: "p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all flex items-center space-x-3", children: [_jsx(AlertCircle, { className: "h-5 w-5" }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-medium", children: "Disputes" }), _jsx("div", { className: "text-sm opacity-70", children: "Resolve issues" })] })] })] })), userRole === 'partner' && (_jsxs(_Fragment, { children: [_jsxs("button", { className: "p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all flex items-center space-x-3", children: [_jsx(Briefcase, { className: "h-5 w-5" }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-medium", children: "Client Relations" }), _jsx("div", { className: "text-sm opacity-70", children: "Manage accounts" })] })] }), _jsxs("button", { className: "p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/20 transition-all flex items-center space-x-3", children: [_jsx(Target, { className: "h-5 w-5" }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-medium", children: "Strategic Planning" }), _jsx("div", { className: "text-sm opacity-70", children: "Resource allocation" })] })] }), _jsxs("button", { className: "p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-all flex items-center space-x-3", children: [_jsx(TrendingUp, { className: "h-5 w-5" }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-medium", children: "Business Analytics" }), _jsx("div", { className: "text-sm opacity-70", children: "Revenue insights" })] })] })] })), userRole === 'assistant' && (_jsxs(_Fragment, { children: [_jsxs("button", { className: "p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-all flex items-center space-x-3", children: [_jsx(Calendar, { className: "h-5 w-5" }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-medium", children: "Schedule Coordination" }), _jsx("div", { className: "text-sm opacity-70", children: "Manage appointments" })] })] }), _jsxs("button", { className: "p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400 hover:bg-indigo-500/20 transition-all flex items-center space-x-3", children: [_jsx(Upload, { className: "h-5 w-5" }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-medium", children: "Data Entry" }), _jsx("div", { className: "text-sm opacity-70", children: "Input time records" })] })] }), _jsxs("button", { className: "p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg text-pink-400 hover:bg-pink-500/20 transition-all flex items-center space-x-3", children: [_jsx(Eye, { className: "h-5 w-5" }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-medium", children: "Monitor Status" }), _jsx("div", { className: "text-sm opacity-70", children: "Track progress" })] })] })] }))] })] }), showEntryModal && editingEntry && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", onClick: () => setShowEntryModal(false), children: _jsxs(motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: "bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-hidden", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-slate-700", children: [_jsx("h3", { className: "text-xl font-bold text-white", children: editingEntry.id ? 'Edit Time Entry' : 'New Time Entry' }), _jsx("button", { onClick: () => setShowEntryModal(false), className: "p-2 hover:bg-slate-700 rounded-lg transition-colors", children: _jsx(X, { className: "h-5 w-5 text-slate-400" }) })] }), _jsxs("div", { className: "p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Date" }), _jsx("input", { type: "date", value: editingEntry.date, onChange: (e) => setEditingEntry(prev => prev ? { ...prev, date: e.target.value } : null), disabled: !canEdit() || isReadOnly, className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Employee" }), _jsx("input", { type: "text", value: editingEntry.employeeName, disabled: true, className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white opacity-50" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Clock In" }), _jsx("input", { type: "time", value: editingEntry.clockIn, onChange: (e) => setEditingEntry(prev => prev ? { ...prev, clockIn: e.target.value } : null), disabled: !canEdit() || isReadOnly, className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Clock Out" }), _jsx("input", { type: "time", value: editingEntry.clockOut, onChange: (e) => setEditingEntry(prev => prev ? { ...prev, clockOut: e.target.value } : null), disabled: !canEdit() || isReadOnly, className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Total Hours" }), _jsx("input", { type: "number", step: "0.25", value: editingEntry.totalHours, onChange: (e) => setEditingEntry(prev => prev ? { ...prev, totalHours: parseFloat(e.target.value) } : null), disabled: !canEdit() || isReadOnly, className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Project" }), _jsxs("select", { value: editingEntry.project, onChange: (e) => setEditingEntry(prev => prev ? { ...prev, project: e.target.value } : null), disabled: !canEdit() || isReadOnly, className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50", children: [_jsx("option", { value: "", children: "Select Project" }), _jsx("option", { value: "GM Assembly Line", children: "GM Assembly Line" }), _jsx("option", { value: "Ford Paint Shop", children: "Ford Paint Shop" }), _jsx("option", { value: "Stellantis Automation", children: "Stellantis Automation" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Client" }), _jsxs("select", { value: editingEntry.client, onChange: (e) => setEditingEntry(prev => prev ? { ...prev, client: e.target.value } : null), disabled: !canEdit() || isReadOnly, className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50", children: [_jsx("option", { value: "", children: "Select Client" }), _jsx("option", { value: "General Motors", children: "General Motors" }), _jsx("option", { value: "Ford Motor Company", children: "Ford Motor Company" }), _jsx("option", { value: "Stellantis", children: "Stellantis" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Status" }), _jsxs("select", { value: editingEntry.status, onChange: (e) => setEditingEntry(prev => prev ? { ...prev, status: e.target.value } : null), disabled: !canApprove() || isReadOnly, className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50", children: [_jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "disputed", children: "Disputed" }), _jsx("option", { value: "rejected", children: "Rejected" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Trust Score" }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("input", { type: "range", min: "0", max: "100", value: editingEntry.trustScore, onChange: (e) => setEditingEntry(prev => prev ? { ...prev, trustScore: parseInt(e.target.value) } : null), disabled: !canEdit() || isReadOnly, className: "flex-1 disabled:opacity-50" }), _jsxs("span", { className: `font-medium ${getTrustScoreColor(editingEntry.trustScore)}`, children: [editingEntry.trustScore, "%"] })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Location" }), _jsx("input", { type: "text", value: editingEntry.location, onChange: (e) => setEditingEntry(prev => prev ? { ...prev, location: e.target.value } : null), disabled: !canEdit() || isReadOnly, placeholder: "Work site location", className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Notes" }), _jsx("textarea", { value: editingEntry.notes || '', onChange: (e) => setEditingEntry(prev => prev ? { ...prev, notes: e.target.value } : null), disabled: !canEdit() || isReadOnly, rows: 3, placeholder: "Additional notes or comments", className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50 resize-none" })] })] })] }), _jsxs("div", { className: "flex items-center justify-between p-6 border-t border-slate-700", children: [_jsxs("div", { className: "text-sm text-slate-400", children: ["Role: ", userRole, " | ", canEdit() ? 'Can Edit' : 'Read Only'] }), _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: () => setShowEntryModal(false), className: "px-4 py-2 text-slate-400 hover:text-white transition-colors", children: "Cancel" }), canEdit() && !isReadOnly && (_jsxs("button", { onClick: handleSaveEntry, className: "px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all flex items-center space-x-2", children: [_jsx(Save, { className: "h-4 w-4" }), _jsx("span", { children: "Save Entry" })] }))] })] })] }) }))] }));
}
//# sourceMappingURL=TimeTrackingCalendar.js.map