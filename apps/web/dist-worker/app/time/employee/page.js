'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, History } from 'lucide-react';
import EmployeeClockView from '@/components/time-tracking/EmployeeClockView';
import TimeTrackingCalendar from '@/components/time-tracking/TimeTrackingCalendar';
export default function EmployeeTimePage() {
    const [activeTab, setActiveTab] = useState('clock');
    const mockEmployeeData = {
        id: 'emp_001',
        name: 'Sarah Johnson',
        role: 'Senior Electrical Engineer',
        project: 'GM Assembly Line',
        avatar: 'SJ'
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-950", children: [_jsx("div", { className: "sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50", children: _jsxs("div", { className: "flex items-center justify-center space-x-1 p-4", children: [_jsxs("button", { onClick: () => setActiveTab('clock'), className: `flex flex-col items-center space-y-1 px-6 py-3 rounded-xl transition-all ${activeTab === 'clock'
                                ? 'bg-blue-500 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'}`, children: [_jsx(Clock, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm font-medium", children: "Time Clock" })] }), _jsxs("button", { onClick: () => setActiveTab('calendar'), className: `flex flex-col items-center space-y-1 px-6 py-3 rounded-xl transition-all ${activeTab === 'calendar'
                                ? 'bg-blue-500 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'}`, children: [_jsx(Calendar, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm font-medium", children: "Schedule" })] }), _jsxs("button", { onClick: () => setActiveTab('history'), className: `flex flex-col items-center space-y-1 px-6 py-3 rounded-xl transition-all ${activeTab === 'history'
                                ? 'bg-blue-500 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'}`, children: [_jsx(History, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm font-medium", children: "History" })] })] }) }), _jsxs("div", { className: "p-4", children: [activeTab === 'clock' && (_jsx(EmployeeClockView, { employeeData: mockEmployeeData, onClose: () => { } })), activeTab === 'calendar' && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "max-w-7xl mx-auto", children: _jsx(TimeTrackingCalendar, { userRole: "employee", employeeId: mockEmployeeData.id, isReadOnly: false }) })), activeTab === 'history' && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "max-w-7xl mx-auto", children: _jsxs("div", { className: "bg-slate-800/50 rounded-lg p-6", children: [_jsx("h2", { className: "text-xl font-bold text-white mb-4", children: "Time Entry History" }), _jsx("p", { className: "text-slate-400 mb-6", children: "Your complete time tracking history with verification details." }), _jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-slate-700/30 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "w-2 h-2 bg-green-400 rounded-full" }), _jsxs("div", { children: [_jsxs("div", { className: "text-white font-medium", children: ["September ", 15 + i, ", 2025"] }), _jsx("div", { className: "text-slate-400 text-sm", children: "8.5 hours - GM Assembly Line" })] })] }), _jsx("div", { className: "text-green-400 text-sm", children: "Approved" })] }, i))) })] }) }))] })] }));
}
//# sourceMappingURL=page.js.map