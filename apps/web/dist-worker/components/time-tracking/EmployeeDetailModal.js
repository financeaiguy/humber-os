'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Building, FileText, TrendingUp, AlertCircle, CheckCircle, Download, Filter, BarChart3, User, Shield, DollarSign, Award, Activity, LogIn, LogOut, Fingerprint, Navigation, Smartphone, Check, Loader2 } from 'lucide-react';
const mockEmployeeDetail = {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Senior Electrical Engineer',
    email: 'sarah.johnson@humber.com',
    phone: '+1 (555) 123-4567',
    employeeId: 'HMB-2024-0342',
    department: 'Electrical Systems',
    supervisor: 'Michael Thompson',
    startDate: '2023-03-15',
    currentClient: 'General Motors'
};
const mockDailyEntries = [
    {
        date: '2025-01-15',
        client: 'General Motors',
        project: 'Assembly Line Automation',
        site: 'GM Tech Center - Detroit',
        clockIn: '07:58:23',
        clockOut: '17:32:45',
        breakTime: 45,
        totalHours: 8.75,
        regularHours: 8,
        overtimeHours: 0.75,
        doubleTimeHours: 0,
        status: 'approved',
        trustScore: 98,
        sopCompliance: {
            followed: ['Safety briefing attended', 'PPE worn', 'Proper badge-in', 'Tool checkout completed'],
            violated: [],
            percentage: 100
        },
        activities: [
            { time: '08:00', description: 'Safety briefing and tool checkout', category: 'Setup' },
            { time: '08:30', description: 'PLC programming for conveyor section 3', category: 'Programming' },
            { time: '12:00', description: 'Lunch break', category: 'Break' },
            { time: '13:00', description: 'System testing and debugging', category: 'Testing' },
            { time: '16:00', description: 'Documentation and handover prep', category: 'Documentation' }
        ],
        expenses: {
            mileage: 45,
            meals: 15,
            equipment: 0,
            other: 0
        }
    },
    {
        date: '2025-01-14',
        client: 'Ford Motor Company',
        project: 'Paint Shop Upgrade',
        site: 'Ford Rouge Complex - Dearborn',
        clockIn: '06:45:12',
        clockOut: '15:30:22',
        breakTime: 30,
        totalHours: 8.25,
        regularHours: 8,
        overtimeHours: 0.25,
        doubleTimeHours: 0,
        status: 'approved',
        trustScore: 95,
        sopCompliance: {
            followed: ['Early shift protocol', 'Chemical safety training', 'Confined space permit'],
            violated: ['Late tool return'],
            percentage: 85
        },
        activities: [
            { time: '07:00', description: 'Confined space entry briefing', category: 'Safety' },
            { time: '07:30', description: 'Paint booth sensor calibration', category: 'Maintenance' },
            { time: '11:30', description: 'Lunch break', category: 'Break' },
            { time: '12:00', description: 'HMI interface updates', category: 'Programming' },
            { time: '15:00', description: 'System validation and sign-off', category: 'Testing' }
        ],
        expenses: {
            mileage: 38,
            meals: 12,
            equipment: 75,
            other: 0
        }
    },
    {
        date: '2025-01-13',
        client: 'General Motors',
        project: 'Quality Control System',
        site: 'GM Lansing Grand River',
        clockIn: '08:15:05',
        clockOut: '18:45:30',
        breakTime: 60,
        totalHours: 9.5,
        regularHours: 8,
        overtimeHours: 1.5,
        doubleTimeHours: 0,
        status: 'pending',
        trustScore: 92,
        sopCompliance: {
            followed: ['Safety gear', 'Badge-in', 'Supervisor check-in'],
            violated: ['Missed afternoon safety briefing'],
            percentage: 75
        },
        activities: [
            { time: '08:30', description: 'Vision system setup', category: 'Installation' },
            { time: '10:00', description: 'Camera calibration', category: 'Calibration' },
            { time: '12:00', description: 'Lunch break', category: 'Break' },
            { time: '13:00', description: 'Software integration', category: 'Programming' },
            { time: '17:00', description: 'Emergency troubleshooting', category: 'Support' }
        ],
        expenses: {
            mileage: 120,
            meals: 18,
            equipment: 0,
            other: 25
        }
    }
];
const clientSOPs = [
    {
        client: 'General Motors',
        requirements: {
            safetyGear: ['Hard hat', 'Safety glasses', 'Steel-toe boots', 'Hi-vis vest'],
            checkInProcess: 'Badge at main gate, secondary badge at building, supervisor sign-in',
            breakPolicy: '30 min lunch, two 15 min breaks',
            overtimePolicy: 'Pre-approval required, 1.5x after 8hrs, 2x after 12hrs',
            reportingStructure: 'Direct report to shift supervisor, daily standup at 8am',
            emergencyProtocol: 'Code Red: Evacuation, Code Blue: Medical, Code Yellow: Chemical'
        },
        restrictions: ['No phones on floor', 'No photography', 'Escort required in certain areas'],
        certifications: ['GM Safety Certified', 'OSHA 10', 'Arc Flash Training']
    },
    {
        client: 'Ford Motor Company',
        requirements: {
            safetyGear: ['Bump cap', 'Safety glasses', 'Safety shoes', 'Ford uniform'],
            checkInProcess: 'Main gate registration, tool crib check-in, area supervisor notification',
            breakPolicy: '30 min lunch, one 15 min break per 4 hours',
            overtimePolicy: 'Supervisor approval, 1.5x after 40hrs/week',
            reportingStructure: 'Report to area lead, attend shift change meeting',
            emergencyProtocol: 'Plant-wide alarm system, designated assembly points'
        },
        restrictions: ['Background check required', 'Drug testing', 'No personal tools'],
        certifications: ['Ford Safety Orientation', 'Confined Space', 'Lock Out Tag Out']
    }
];
const mockEmployeeStats = {
    totalHoursThisWeek: 42.5,
    totalHoursThisMonth: 176.25,
    averageHoursPerDay: 8.8,
    overtimeHoursThisMonth: 12.5,
    clientBreakdown: [
        { client: 'General Motors', hours: 98, percentage: 55, revenue: 12250 },
        { client: 'Ford Motor Company', hours: 62, percentage: 35, revenue: 7750 },
        { client: 'Stellantis', hours: 16.25, percentage: 10, revenue: 2031 }
    ],
    sopComplianceRate: 92,
    averageTrustScore: 95,
    punctualityRate: 98
};
export default function EmployeeDetailModal({ employee, isOpen, onClose }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTab, setSelectedTab] = useState('daily');
    const [selectedClient, setSelectedClient] = useState('all');
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [isClockingIn, setIsClockingIn] = useState(false);
    const [isClockingOut, setIsClockingOut] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState({
        biometric: false,
        location: false,
        device: false
    });
    const [clockInTime, setClockInTime] = useState(null);
    const filteredEntries = selectedClient === 'all'
        ? mockDailyEntries
        : mockDailyEntries.filter(entry => entry.client === selectedClient);
    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'review': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };
    const getTrustScoreColor = (score) => {
        if (score >= 90)
            return 'text-green-400';
        if (score >= 75)
            return 'text-yellow-400';
        if (score >= 60)
            return 'text-orange-400';
        return 'text-red-400';
    };
    const performTrustVerification = async () => {
        const steps = [
            { key: 'biometric', delay: 1000, name: 'Biometric Authentication' },
            { key: 'location', delay: 1500, name: 'Location Verification' },
            { key: 'device', delay: 1000, name: 'Device Trust Check' }
        ];
        for (const step of steps) {
            await new Promise(resolve => setTimeout(resolve, step.delay));
            setVerificationStatus(prev => ({ ...prev, [step.key]: true }));
        }
        return true;
    };
    const handleClockIn = async () => {
        setIsClockingIn(true);
        setVerificationStatus({ biometric: false, location: false, device: false });
        const verified = await performTrustVerification();
        if (verified) {
            await new Promise(resolve => setTimeout(resolve, 500));
            setIsClockedIn(true);
            setClockInTime(new Date());
        }
        setIsClockingIn(false);
    };
    const handleClockOut = async () => {
        setIsClockingOut(true);
        setVerificationStatus({ biometric: false, location: false, device: false });
        const verified = await performTrustVerification();
        if (verified) {
            await new Promise(resolve => setTimeout(resolve, 500));
            setIsClockedIn(false);
            setClockInTime(null);
            setVerificationStatus({ biometric: false, location: false, device: false });
        }
        setIsClockingOut(false);
    };
    if (!employee)
        return null;
    return (_jsx(AnimatePresence, { children: isOpen && (_jsxs(_Fragment, { children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: onClose, className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-50" }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.95, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 20 }, className: "fixed inset-4 lg:inset-8 bg-slate-900 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-700/50", children: [_jsxs("div", { className: "bg-gradient-to-r from-slate-800 to-slate-900 p-6 border-b border-slate-700", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl", children: employee.employee.split(' ').map((n) => n[0]).join('') }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: employee.employee }), _jsxs("p", { className: "text-slate-400", children: [employee.role, " \u2022 ID: ", mockEmployeeDetail.employeeId] }), _jsxs("div", { className: "flex items-center space-x-4 mt-2", children: [_jsxs("span", { className: "text-sm text-slate-500", children: [_jsx(User, { className: "h-4 w-4 inline mr-1" }), "Reports to: ", mockEmployeeDetail.supervisor] }), _jsxs("span", { className: "text-sm text-slate-500", children: [_jsx(Calendar, { className: "h-4 w-4 inline mr-1" }), "Started: ", new Date(mockEmployeeDetail.startDate).toLocaleDateString()] })] })] })] }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-slate-700 rounded-lg transition-colors", children: _jsx(X, { className: "h-5 w-5 text-slate-400" }) })] }), _jsxs("div", { className: "mt-6 space-y-4", children: [_jsx("div", { className: "grid grid-cols-2 gap-4", children: !isClockedIn ? (_jsx("button", { onClick: handleClockIn, disabled: isClockingIn, className: "col-span-2 py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3", children: isClockingIn ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-6 w-6 animate-spin" }), _jsx("span", { children: "Verifying Trust Layers..." })] })) : (_jsxs(_Fragment, { children: [_jsx(LogIn, { className: "h-6 w-6" }), _jsx("span", { children: "Clock In" })] })) })) : (_jsx("button", { onClick: handleClockOut, disabled: isClockingOut, className: "col-span-2 py-4 px-6 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3", children: isClockingOut ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-6 w-6 animate-spin" }), _jsx("span", { children: "Verifying Trust Layers..." })] })) : (_jsxs(_Fragment, { children: [_jsx(LogOut, { className: "h-6 w-6" }), _jsx("span", { children: "Clock Out" })] })) })) }), (isClockingIn || isClockingOut) && (_jsxs(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, className: "grid grid-cols-3 gap-3", children: [_jsxs("div", { className: `p-3 rounded-lg border transition-all ${verificationStatus.biometric
                                                        ? 'bg-green-500/20 border-green-500/30'
                                                        : 'bg-slate-800/50 border-slate-700/50'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Fingerprint, { className: `h-5 w-5 ${verificationStatus.biometric ? 'text-green-400' : 'text-slate-400'}` }), verificationStatus.biometric ? (_jsx(Check, { className: "h-4 w-4 text-green-400" })) : (_jsx(Loader2, { className: "h-4 w-4 text-slate-400 animate-spin" }))] }), _jsx("p", { className: "text-xs font-medium text-white", children: "Biometric" }), _jsx("p", { className: "text-xs text-slate-400", children: verificationStatus.biometric ? 'Verified' : 'Scanning...' })] }), _jsxs("div", { className: `p-3 rounded-lg border transition-all ${verificationStatus.location
                                                        ? 'bg-green-500/20 border-green-500/30'
                                                        : 'bg-slate-800/50 border-slate-700/50'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Navigation, { className: `h-5 w-5 ${verificationStatus.location ? 'text-green-400' : 'text-slate-400'}` }), verificationStatus.location ? (_jsx(Check, { className: "h-4 w-4 text-green-400" })) : (_jsx(Loader2, { className: "h-4 w-4 text-slate-400 animate-spin" }))] }), _jsx("p", { className: "text-xs font-medium text-white", children: "Location" }), _jsx("p", { className: "text-xs text-slate-400", children: verificationStatus.location ? 'In Zone' : 'Checking...' })] }), _jsxs("div", { className: `p-3 rounded-lg border transition-all ${verificationStatus.device
                                                        ? 'bg-green-500/20 border-green-500/30'
                                                        : 'bg-slate-800/50 border-slate-700/50'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Smartphone, { className: `h-5 w-5 ${verificationStatus.device ? 'text-green-400' : 'text-slate-400'}` }), verificationStatus.device ? (_jsx(Check, { className: "h-4 w-4 text-green-400" })) : (_jsx(Loader2, { className: "h-4 w-4 text-slate-400 animate-spin" }))] }), _jsx("p", { className: "text-xs font-medium text-white", children: "Device" }), _jsx("p", { className: "text-xs text-slate-400", children: verificationStatus.device ? 'Trusted' : 'Verifying...' })] })] })), isClockedIn && clockInTime && !isClockingOut && (_jsx("div", { className: "bg-green-500/10 border border-green-500/30 rounded-lg p-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Activity, { className: "h-5 w-5 text-green-400 animate-pulse" }), _jsx("span", { className: "text-sm font-medium text-green-400", children: "Currently Working" })] }), _jsxs("span", { className: "text-sm text-white", children: ["Since ", clockInTime.toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: true
                                                            })] })] }) })), _jsxs("div", { className: "grid grid-cols-4 gap-3", children: [_jsxs("div", { className: "bg-slate-800/50 rounded-lg p-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Clock, { className: "h-4 w-4 text-blue-400" }), _jsxs("span", { className: "text-sm font-bold text-white", children: [mockEmployeeStats.totalHoursThisWeek, "h"] })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "This Week" })] }), _jsxs("div", { className: "bg-slate-800/50 rounded-lg p-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Shield, { className: "h-4 w-4 text-green-400" }), _jsxs("span", { className: `text-sm font-bold ${getTrustScoreColor(mockEmployeeStats.averageTrustScore)}`, children: [mockEmployeeStats.averageTrustScore, "%"] })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Trust Score" })] }), _jsxs("div", { className: "bg-slate-800/50 rounded-lg p-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(FileText, { className: "h-4 w-4 text-purple-400" }), _jsxs("span", { className: "text-sm font-bold text-white", children: [mockEmployeeStats.sopComplianceRate, "%"] })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "SOP" })] }), _jsxs("div", { className: "bg-slate-800/50 rounded-lg p-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(TrendingUp, { className: "h-4 w-4 text-orange-400" }), _jsxs("span", { className: "text-sm font-bold text-white", children: [mockEmployeeStats.punctualityRate, "%"] })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Punctuality" })] })] })] })] }), _jsxs("div", { className: "flex items-center space-x-1 p-4 bg-slate-800/50 border-b border-slate-700", children: [_jsx("button", { onClick: () => setSelectedTab('daily'), className: `px-4 py-2 rounded-lg font-medium transition-all ${selectedTab === 'daily'
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700'}`, children: "Daily Breakdown" }), _jsx("button", { onClick: () => setSelectedTab('weekly'), className: `px-4 py-2 rounded-lg font-medium transition-all ${selectedTab === 'weekly'
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700'}`, children: "Weekly Summary" }), _jsx("button", { onClick: () => setSelectedTab('sop'), className: `px-4 py-2 rounded-lg font-medium transition-all ${selectedTab === 'sop'
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700'}`, children: "SOP & Protocols" }), _jsx("button", { onClick: () => setSelectedTab('stats'), className: `px-4 py-2 rounded-lg font-medium transition-all ${selectedTab === 'stats'
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700'}`, children: "Analytics" }), _jsxs("div", { className: "ml-auto flex items-center space-x-2", children: [_jsx(Filter, { className: "h-4 w-4 text-slate-400" }), _jsxs("select", { value: selectedClient, onChange: (e) => setSelectedClient(e.target.value), className: "bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "all", children: "All Clients" }), _jsx("option", { value: "General Motors", children: "General Motors" }), _jsx("option", { value: "Ford Motor Company", children: "Ford Motor Company" }), _jsx("option", { value: "Stellantis", children: "Stellantis" })] })] })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-6", children: [selectedTab === 'daily' && (_jsx("div", { className: "space-y-4", children: filteredEntries.map((entry, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "bg-slate-800/50 rounded-xl border border-slate-700/50 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("div", { className: "flex items-center space-x-4", children: _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: new Date(entry.date).toLocaleDateString('en-US', {
                                                                        weekday: 'long',
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    }) }), _jsxs("div", { className: "flex items-center space-x-3 mt-1", children: [_jsxs("span", { className: "text-sm text-slate-400", children: [_jsx(Building, { className: "h-4 w-4 inline mr-1" }), entry.client] }), _jsxs("span", { className: "text-sm text-slate-400", children: [_jsx(MapPin, { className: "h-4 w-4 inline mr-1" }), entry.site] })] })] }) }), _jsx("span", { className: `px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(entry.status)}`, children: entry.status })] }), _jsxs("div", { className: "grid grid-cols-5 gap-4 mb-4", children: [_jsxs("div", { className: "bg-slate-900/50 rounded-lg p-3", children: [_jsx("p", { className: "text-xs text-slate-500", children: "Clock In" }), _jsx("p", { className: "text-sm font-medium text-white", children: entry.clockIn })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-lg p-3", children: [_jsx("p", { className: "text-xs text-slate-500", children: "Clock Out" }), _jsx("p", { className: "text-sm font-medium text-white", children: entry.clockOut })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-lg p-3", children: [_jsx("p", { className: "text-xs text-slate-500", children: "Total Hours" }), _jsxs("p", { className: "text-sm font-medium text-white", children: [entry.totalHours, "h"] })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-lg p-3", children: [_jsx("p", { className: "text-xs text-slate-500", children: "Overtime" }), _jsxs("p", { className: "text-sm font-medium text-orange-400", children: [entry.overtimeHours, "h"] })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-lg p-3", children: [_jsx("p", { className: "text-xs text-slate-500", children: "Trust Score" }), _jsxs("p", { className: `text-sm font-medium ${getTrustScoreColor(entry.trustScore)}`, children: [entry.trustScore, "%"] })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-sm font-medium text-slate-300 mb-2", children: "Activities" }), _jsx("div", { className: "space-y-2", children: entry.activities.map((activity, i) => (_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("span", { className: "text-xs text-slate-500 mt-0.5", children: activity.time }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm text-white", children: activity.description }), _jsx("span", { className: "text-xs text-slate-400", children: activity.category })] })] }, i))) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { className: "bg-green-500/10 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-400" }), _jsx("span", { className: "text-sm font-medium text-green-400", children: "SOP Followed" })] }), _jsx("ul", { className: "space-y-1", children: entry.sopCompliance.followed.map((item, i) => (_jsxs("li", { className: "text-xs text-slate-300", children: ["\u2022 ", item] }, i))) })] }), entry.sopCompliance.violated.length > 0 && (_jsxs("div", { className: "bg-red-500/10 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-red-400" }), _jsx("span", { className: "text-sm font-medium text-red-400", children: "Violations" })] }), _jsx("ul", { className: "space-y-1", children: entry.sopCompliance.violated.map((item, i) => (_jsxs("li", { className: "text-xs text-slate-300", children: ["\u2022 ", item] }, i))) })] }))] }), entry.expenses && (_jsxs("div", { className: "bg-slate-900/50 rounded-lg p-3", children: [_jsx("h4", { className: "text-sm font-medium text-slate-300 mb-2", children: "Expenses" }), _jsxs("div", { className: "grid grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-500", children: "Mileage" }), _jsxs("p", { className: "text-sm font-medium text-white", children: ["$", entry.expenses.mileage] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-500", children: "Meals" }), _jsxs("p", { className: "text-sm font-medium text-white", children: ["$", entry.expenses.meals] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-500", children: "Equipment" }), _jsxs("p", { className: "text-sm font-medium text-white", children: ["$", entry.expenses.equipment] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-500", children: "Other" }), _jsxs("p", { className: "text-sm font-medium text-white", children: ["$", entry.expenses.other] })] })] })] }))] }, index))) })), selectedTab === 'weekly' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-slate-800/50 rounded-xl border border-slate-700/50 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Week of January 13-19, 2025" }), _jsxs("div", { className: "grid grid-cols-3 gap-4 mb-6", children: [_jsxs("div", { className: "bg-slate-900/50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Clock, { className: "h-5 w-5 text-blue-400" }), _jsx("span", { className: "text-2xl font-bold text-white", children: "42.5h" })] }), _jsx("p", { className: "text-sm text-slate-400", children: "Total Hours" }), _jsxs("div", { className: "mt-2 space-y-1", children: [_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { className: "text-slate-500", children: "Regular" }), _jsx("span", { className: "text-slate-300", children: "40h" })] }), _jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { className: "text-slate-500", children: "Overtime" }), _jsx("span", { className: "text-orange-400", children: "2.5h" })] })] })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(DollarSign, { className: "h-5 w-5 text-green-400" }), _jsx("span", { className: "text-2xl font-bold text-white", children: "$3,825" })] }), _jsx("p", { className: "text-sm text-slate-400", children: "Gross Earnings" }), _jsxs("div", { className: "mt-2 space-y-1", children: [_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { className: "text-slate-500", children: "Regular Pay" }), _jsx("span", { className: "text-slate-300", children: "$3,600" })] }), _jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { className: "text-slate-500", children: "OT Pay" }), _jsx("span", { className: "text-orange-400", children: "$225" })] })] })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Award, { className: "h-5 w-5 text-purple-400" }), _jsx("span", { className: "text-2xl font-bold text-white", children: "95%" })] }), _jsx("p", { className: "text-sm text-slate-400", children: "Performance" }), _jsxs("div", { className: "mt-2 space-y-1", children: [_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { className: "text-slate-500", children: "Trust Score" }), _jsx("span", { className: "text-green-400", children: "95%" })] }), _jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { className: "text-slate-500", children: "SOP Compliance" }), _jsx("span", { className: "text-green-400", children: "92%" })] })] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "text-sm font-medium text-slate-300", children: "Daily Hours by Client" }), ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => {
                                                            const clients = index % 2 === 0 ? 'General Motors' : 'Ford Motor Company';
                                                            const hours = 8 + Math.random() * 2;
                                                            return (_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: "text-sm text-slate-400 w-12", children: day }), _jsx("div", { className: "flex-1 bg-slate-700 rounded-full h-6 relative overflow-hidden", children: _jsx("div", { className: `absolute left-0 top-0 h-full ${clients === 'General Motors' ? 'bg-blue-500' : 'bg-green-500'} flex items-center justify-center`, style: { width: `${(hours / 10) * 100}%` }, children: _jsxs("span", { className: "text-xs text-white font-medium", children: [hours.toFixed(1), "h"] }) }) }), _jsx("span", { className: "text-xs text-slate-400 w-32", children: clients })] }, day));
                                                        })] })] }), _jsxs("div", { className: "bg-slate-800/50 rounded-xl border border-slate-700/50 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Client Distribution" }), _jsx("div", { className: "space-y-4", children: mockEmployeeStats.clientBreakdown.map((client, index) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `h-10 w-10 rounded-lg ${index === 0 ? 'bg-blue-500/20' : index === 1 ? 'bg-green-500/20' : 'bg-purple-500/20'} flex items-center justify-center`, children: _jsx(Building, { className: `h-5 w-5 ${index === 0 ? 'text-blue-400' : index === 1 ? 'text-green-400' : 'text-purple-400'}` }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-white", children: client.client }), _jsxs("p", { className: "text-xs text-slate-400", children: [client.hours, " hours \u2022 ", client.percentage, "%"] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-medium text-white", children: ["$", client.revenue.toLocaleString()] }), _jsx("p", { className: "text-xs text-slate-400", children: "Revenue" })] })] }, index))) })] })] })), selectedTab === 'sop' && (_jsx("div", { className: "space-y-6", children: clientSOPs.map((sop, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "bg-slate-800/50 rounded-xl border border-slate-700/50 p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4 flex items-center", children: [_jsx(Building, { className: "h-5 w-5 mr-2 text-blue-400" }), sop.client, " - Standard Operating Procedures"] }), _jsxs("div", { className: "grid grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-slate-300 mb-2", children: "Safety Gear Required" }), _jsx("div", { className: "flex flex-wrap gap-2", children: sop.requirements.safetyGear.map((gear, i) => (_jsx("span", { className: "px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-400", children: gear }, i))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-slate-300 mb-2", children: "Check-In Process" }), _jsx("p", { className: "text-sm text-slate-400", children: sop.requirements.checkInProcess })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-slate-300 mb-2", children: "Break Policy" }), _jsx("p", { className: "text-sm text-slate-400", children: sop.requirements.breakPolicy })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-slate-300 mb-2", children: "Overtime Policy" }), _jsx("p", { className: "text-sm text-slate-400", children: sop.requirements.overtimePolicy })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-slate-300 mb-2", children: "Restrictions" }), _jsx("ul", { className: "space-y-1", children: sop.restrictions.map((restriction, i) => (_jsxs("li", { className: "text-sm text-slate-400 flex items-start", children: [_jsx(AlertCircle, { className: "h-3 w-3 text-red-400 mr-2 mt-0.5 flex-shrink-0" }), restriction] }, i))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-slate-300 mb-2", children: "Required Certifications" }), _jsx("div", { className: "flex flex-wrap gap-2", children: sop.certifications.map((cert, i) => (_jsxs("span", { className: "px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-400", children: [_jsx(CheckCircle, { className: "h-3 w-3 inline mr-1" }), cert] }, i))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-slate-300 mb-2", children: "Emergency Protocol" }), _jsx("p", { className: "text-sm text-slate-400", children: sop.requirements.emergencyProtocol })] })] })] })] }, index))) })), selectedTab === 'stats' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-slate-800/50 rounded-xl border border-slate-700/50 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Performance Analytics" }), _jsxs("div", { className: "grid grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-slate-300 mb-3", children: "Monthly Trends" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { className: "text-slate-400", children: "Avg Hours/Day" }), _jsxs("span", { className: "text-white font-medium", children: [mockEmployeeStats.averageHoursPerDay, "h"] })] }), _jsx("div", { className: "w-full bg-slate-700 rounded-full h-2", children: _jsx("div", { className: "bg-blue-500 h-2 rounded-full", style: { width: '88%' } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { className: "text-slate-400", children: "Overtime Hours" }), _jsxs("span", { className: "text-orange-400 font-medium", children: [mockEmployeeStats.overtimeHoursThisMonth, "h"] })] }), _jsx("div", { className: "w-full bg-slate-700 rounded-full h-2", children: _jsx("div", { className: "bg-orange-500 h-2 rounded-full", style: { width: '15%' } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { className: "text-slate-400", children: "Trust Score" }), _jsxs("span", { className: "text-green-400 font-medium", children: [mockEmployeeStats.averageTrustScore, "%"] })] }), _jsx("div", { className: "w-full bg-slate-700 rounded-full h-2", children: _jsx("div", { className: "bg-green-500 h-2 rounded-full", style: { width: '95%' } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { className: "text-slate-400", children: "SOP Compliance" }), _jsxs("span", { className: "text-green-400 font-medium", children: [mockEmployeeStats.sopComplianceRate, "%"] })] }), _jsx("div", { className: "w-full bg-slate-700 rounded-full h-2", children: _jsx("div", { className: "bg-green-500 h-2 rounded-full", style: { width: '92%' } }) })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-slate-300 mb-3", children: "Comparative Analysis" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between p-3 bg-slate-900/50 rounded-lg", children: [_jsx("span", { className: "text-sm text-slate-400", children: "vs Team Average" }), _jsx("span", { className: "text-sm font-medium text-green-400", children: "+12% Better" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-slate-900/50 rounded-lg", children: [_jsx("span", { className: "text-sm text-slate-400", children: "vs Last Month" }), _jsx("span", { className: "text-sm font-medium text-blue-400", children: "+5% Improved" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-slate-900/50 rounded-lg", children: [_jsx("span", { className: "text-sm text-slate-400", children: "Revenue Generated" }), _jsx("span", { className: "text-sm font-medium text-white", children: "$22,031" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-slate-900/50 rounded-lg", children: [_jsx("span", { className: "text-sm text-slate-400", children: "Client Satisfaction" }), _jsx("span", { className: "text-sm font-medium text-green-400", children: "4.8/5.0" })] })] })] })] })] }), _jsxs("div", { className: "bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-slate-700/50 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "AI Recommendations" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5", children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-white font-medium", children: "Strong Performance" }), _jsx("p", { className: "text-xs text-slate-400", children: "Consistently exceeding trust score and SOP compliance targets" })] })] }), _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5", children: _jsx(AlertCircle, { className: "h-4 w-4 text-yellow-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-white font-medium", children: "Consider Ford Certification" }), _jsx("p", { className: "text-xs text-slate-400", children: "35% of hours at Ford - additional certification could increase efficiency" })] })] }), _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5", children: _jsx(Activity, { className: "h-4 w-4 text-blue-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-white font-medium", children: "Optimize Travel Routes" }), _jsx("p", { className: "text-xs text-slate-400", children: "Could save 45 minutes daily by adjusting site visit schedule" })] })] })] })] })] }))] }), _jsxs("div", { className: "bg-slate-800 border-t border-slate-700 p-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("button", { className: "px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors flex items-center space-x-2", children: [_jsx(Download, { className: "h-4 w-4" }), _jsx("span", { children: "Export Report" })] }), _jsxs("button", { className: "px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors flex items-center space-x-2", children: [_jsx(BarChart3, { className: "h-4 w-4" }), _jsx("span", { children: "Full Analytics" })] })] }), _jsx("button", { onClick: onClose, className: "px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300", children: "Close" })] })] })] })) }));
}
//# sourceMappingURL=EmployeeDetailModal.js.map