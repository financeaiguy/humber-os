'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, Clock, Building, FileText, Calculator, TrendingUp, AlertCircle, Zap, Shield, DollarSign, User, Calendar, Download, MessageSquare, Mail, Phone, Info, CheckSquare, Square, BarChart3, Briefcase } from 'lucide-react';
const mockDiscrepancies = [
    {
        id: 'DISC-001',
        date: '2025-01-15',
        employee: 'Sarah Johnson',
        employeeId: 'HMB-2024-0342',
        client: 'General Motors',
        project: 'Assembly Line Automation',
        employeeClockIn: '07:58:23',
        employeeClockOut: '17:32:45',
        employeeTotalHours: 9.15,
        employeeBreakTime: 45,
        clientReportedStart: '08:00:00',
        clientReportedEnd: '17:00:00',
        clientReportedHours: 8.5,
        clientReportedBreak: 30,
        clientApprover: 'John Martinez (GM Supervisor)',
        timeDifference: 39,
        discrepancyType: 'late_clock_out',
        severity: 'medium',
        status: 'pending',
        gpsData: {
            withinGeofence: true,
            distanceFromSite: 0
        },
        trustScore: 98,
        historicalAccuracy: 96
    },
    {
        id: 'DISC-002',
        date: '2025-01-14',
        employee: 'Michael Chen',
        employeeId: 'HMB-2024-0155',
        client: 'Ford Motor Company',
        project: 'Paint Shop Upgrade',
        employeeClockIn: '06:45:12',
        employeeClockOut: '15:30:22',
        employeeTotalHours: 8.25,
        employeeBreakTime: 30,
        clientReportedStart: '07:00:00',
        clientReportedEnd: '15:30:00',
        clientReportedHours: 8.0,
        clientReportedBreak: 30,
        clientApprover: 'Lisa Thompson (Ford Lead)',
        timeDifference: -15,
        discrepancyType: 'early_clock_in',
        severity: 'low',
        status: 'auto_approved',
        resolution: {
            adjustedHours: 8.0,
            approvedBy: 'System Auto-Approval',
            approvedAt: '2025-01-14 18:00:00',
            notes: 'Within 5% threshold - auto-approved per policy',
            financialImpact: 0
        },
        gpsData: {
            withinGeofence: true,
            distanceFromSite: 0
        },
        trustScore: 92,
        historicalAccuracy: 94
    },
    {
        id: 'DISC-003',
        date: '2025-01-13',
        employee: 'Emily Rodriguez',
        employeeId: 'HMB-2024-0298',
        client: 'Stellantis',
        project: 'Quality Control System',
        employeeClockIn: '08:15:05',
        employeeClockOut: '18:45:30',
        employeeTotalHours: 10.5,
        employeeBreakTime: 60,
        clientReportedStart: '08:30:00',
        clientReportedEnd: '17:00:00',
        clientReportedHours: 8.0,
        clientReportedBreak: 30,
        clientApprover: 'Robert Kim (Stellantis Manager)',
        timeDifference: 135,
        discrepancyType: 'overtime_dispute',
        severity: 'high',
        status: 'under_review',
        gpsData: {
            withinGeofence: false,
            distanceFromSite: 2.5
        },
        trustScore: 75,
        historicalAccuracy: 88
    },
    {
        id: 'DISC-004',
        date: '2025-01-12',
        employee: 'David Kim',
        employeeId: 'HMB-2024-0412',
        client: 'General Motors',
        project: 'Robotic Welding Calibration',
        employeeClockIn: '09:00:00',
        employeeClockOut: '14:00:00',
        employeeTotalHours: 5.0,
        employeeBreakTime: 0,
        clientReportedStart: '09:00:00',
        clientReportedEnd: '17:00:00',
        clientReportedHours: 8.0,
        clientReportedBreak: 30,
        clientApprover: 'Sarah Williams (GM Lead)',
        timeDifference: -180,
        discrepancyType: 'missing_time',
        severity: 'critical',
        status: 'disputed',
        gpsData: {
            withinGeofence: true,
            distanceFromSite: 0
        },
        trustScore: 85,
        historicalAccuracy: 91
    }
];
const thresholds = {
    autoApprove: {
        percentage: 5,
        minutes: 15,
    },
    review: {
        percentage: 10,
        minutes: 30,
    },
    escalate: {
        percentage: 15,
        minutes: 60,
    }
};
const getSeverityColor = (severity) => {
    switch (severity) {
        case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30';
        case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
        case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
        case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
        default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
};
const getStatusColor = (status) => {
    switch (status) {
        case 'auto_approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'resolved': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'under_review': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 'disputed': return 'bg-red-500/20 text-red-400 border-red-500/30';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
};
const formatTimeDifference = (minutes) => {
    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    const sign = minutes < 0 ? '-' : '+';
    if (hours > 0) {
        return `${sign}${hours}h ${mins}m`;
    }
    return `${sign}${mins}m`;
};
export default function TimeReconciliation({ selectedDate, selectedClient }) {
    const [selectedDiscrepancies, setSelectedDiscrepancies] = useState(new Set());
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterSeverity, setFilterSeverity] = useState('all');
    const [showDetails, setShowDetails] = useState(null);
    const filteredDiscrepancies = mockDiscrepancies.filter(d => {
        if (filterStatus !== 'all' && d.status !== filterStatus)
            return false;
        if (filterSeverity !== 'all' && d.severity !== filterSeverity)
            return false;
        if (selectedClient && d.client !== selectedClient)
            return false;
        return true;
    });
    const toggleSelection = (id) => {
        const newSelection = new Set(selectedDiscrepancies);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        }
        else {
            newSelection.add(id);
        }
        setSelectedDiscrepancies(newSelection);
    };
    const calculateFinancialImpact = (discrepancy) => {
        const hourlyRate = 90;
        const hoursDiff = Math.abs(discrepancy.timeDifference) / 60;
        return hoursDiff * hourlyRate;
    };
    const stats = {
        total: filteredDiscrepancies.length,
        pending: filteredDiscrepancies.filter(d => d.status === 'pending').length,
        underReview: filteredDiscrepancies.filter(d => d.status === 'under_review').length,
        disputed: filteredDiscrepancies.filter(d => d.status === 'disputed').length,
        resolved: filteredDiscrepancies.filter(d => d.status === 'resolved' || d.status === 'auto_approved').length,
        totalFinancialImpact: filteredDiscrepancies.reduce((sum, d) => sum + calculateFinancialImpact(d), 0),
        totalHoursDifference: filteredDiscrepancies.reduce((sum, d) => sum + Math.abs(d.timeDifference), 0) / 60
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Time Reconciliation" }), _jsx("p", { className: "text-slate-400 mt-1", children: "Match employee clock times with client-reported hours" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("button", { className: "px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center space-x-2", children: [_jsx(Download, { className: "h-4 w-4" }), _jsx("span", { children: "Export Report" })] }), _jsxs("button", { className: "px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2", children: [_jsx(Calculator, { className: "h-4 w-4" }), _jsx("span", { children: "Bulk Reconcile" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-6 gap-4", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-400", children: "Total" }), _jsx("p", { className: "text-xl font-bold text-white", children: stats.total })] }), _jsx(FileText, { className: "h-5 w-5 text-slate-400" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-400", children: "Pending" }), _jsx("p", { className: "text-xl font-bold text-yellow-400", children: stats.pending })] }), _jsx(Clock, { className: "h-5 w-5 text-yellow-400" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-400", children: "Review" }), _jsx("p", { className: "text-xl font-bold text-orange-400", children: stats.underReview })] }), _jsx(AlertCircle, { className: "h-5 w-5 text-orange-400" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-400", children: "Disputed" }), _jsx("p", { className: "text-xl font-bold text-red-400", children: stats.disputed })] }), _jsx(XCircle, { className: "h-5 w-5 text-red-400" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 }, className: "bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-400", children: "Hours Diff" }), _jsxs("p", { className: "text-xl font-bold text-purple-400", children: [stats.totalHoursDifference.toFixed(1), "h"] })] }), _jsx(TrendingUp, { className: "h-5 w-5 text-purple-400" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.5 }, className: "bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-400", children: "Impact" }), _jsxs("p", { className: "text-xl font-bold text-white", children: ["$", Math.round(stats.totalFinancialImpact)] })] }), _jsx(DollarSign, { className: "h-5 w-5 text-green-400" })] }) })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("select", { value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), className: "bg-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "under_review", children: "Under Review" }), _jsx("option", { value: "disputed", children: "Disputed" }), _jsx("option", { value: "resolved", children: "Resolved" }), _jsx("option", { value: "auto_approved", children: "Auto-Approved" })] }), _jsxs("select", { value: filterSeverity, onChange: (e) => setFilterSeverity(e.target.value), className: "bg-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "all", children: "All Severity" }), _jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" }), _jsx("option", { value: "critical", children: "Critical" })] }), selectedDiscrepancies.size > 0 && (_jsxs("div", { className: "flex items-center space-x-2 ml-auto", children: [_jsxs("span", { className: "text-sm text-slate-400", children: [selectedDiscrepancies.size, " selected"] }), _jsx("button", { className: "px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm", children: "Approve Selected" }), _jsx("button", { className: "px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm", children: "Reject Selected" })] }))] }), _jsx("div", { className: "bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-slate-700/50 p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Info, { className: "h-5 w-5 text-blue-400 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-sm font-medium text-white mb-2", children: "Automatic Reconciliation Rules" }), _jsxs("div", { className: "grid grid-cols-3 gap-4 text-xs", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-400" }), _jsx("span", { className: "text-slate-300", children: "\u22645% or 15min: Auto-approve" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-yellow-400" }), _jsx("span", { className: "text-slate-300", children: "5-10% or 15-30min: Review required" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-400" }), _jsx("span", { className: "text-slate-300", children: ">10% or 30min: Manager escalation" })] })] })] })] }) }), _jsx("div", { className: "space-y-4", children: filteredDiscrepancies.map((discrepancy, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.05 }, className: "bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden", children: [_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("button", { onClick: () => toggleSelection(discrepancy.id), className: "mt-1", children: selectedDiscrepancies.has(discrepancy.id) ? (_jsx(CheckSquare, { className: "h-5 w-5 text-blue-400" })) : (_jsx(Square, { className: "h-5 w-5 text-slate-500" })) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-3 mb-2", children: [_jsx("h3", { className: "font-semibold text-white", children: discrepancy.employee }), _jsx("span", { className: "text-xs text-slate-500", children: discrepancy.employeeId }), _jsx("span", { className: `px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(discrepancy.status)}`, children: discrepancy.status.replace('_', ' ') }), _jsx("span", { className: `px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(discrepancy.severity)}`, children: discrepancy.severity })] }), _jsxs("div", { className: "flex items-center space-x-4 text-sm text-slate-400", children: [_jsxs("span", { className: "flex items-center", children: [_jsx(Calendar, { className: "h-3 w-3 mr-1" }), new Date(discrepancy.date).toLocaleDateString()] }), _jsxs("span", { className: "flex items-center", children: [_jsx(Building, { className: "h-3 w-3 mr-1" }), discrepancy.client] }), _jsxs("span", { className: "flex items-center", children: [_jsx(Briefcase, { className: "h-3 w-3 mr-1" }), discrepancy.project] })] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: `text-2xl font-bold ${discrepancy.timeDifference > 0 ? 'text-red-400' : 'text-green-400'}`, children: formatTimeDifference(discrepancy.timeDifference) }), _jsx("p", { className: "text-xs text-slate-500", children: "Time Difference" }), _jsxs("p", { className: "text-sm text-yellow-400 mt-1", children: ["$", calculateFinancialImpact(discrepancy).toFixed(2)] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-6 mt-6", children: [_jsxs("div", { className: "bg-slate-900/50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("h4", { className: "text-sm font-medium text-white flex items-center", children: [_jsx(User, { className: "h-4 w-4 mr-2 text-blue-400" }), "Employee Reported"] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Shield, { className: "h-4 w-4 text-slate-400" }), _jsxs("span", { className: "text-sm text-green-400", children: [discrepancy.trustScore, "%"] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-400", children: "Clock In:" }), _jsx("span", { className: "text-white font-medium", children: discrepancy.employeeClockIn })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-400", children: "Clock Out:" }), _jsx("span", { className: "text-white font-medium", children: discrepancy.employeeClockOut })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-400", children: "Total Hours:" }), _jsxs("span", { className: "text-white font-medium", children: [discrepancy.employeeTotalHours, "h"] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-400", children: "Break Time:" }), _jsxs("span", { className: "text-white font-medium", children: [discrepancy.employeeBreakTime, "m"] })] })] }), _jsxs("div", { className: "mt-3 pt-3 border-t border-slate-700", children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-slate-500", children: "GPS Status:" }), _jsx("span", { className: discrepancy.gpsData.withinGeofence ? 'text-green-400' : 'text-red-400', children: discrepancy.gpsData.withinGeofence ? 'Within Zone' : `${discrepancy.gpsData.distanceFromSite}km away` })] }), _jsxs("div", { className: "flex items-center justify-between text-xs mt-1", children: [_jsx("span", { className: "text-slate-500", children: "Historical Accuracy:" }), _jsxs("span", { className: "text-slate-300", children: [discrepancy.historicalAccuracy, "%"] })] })] })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-lg p-4", children: [_jsx("div", { className: "flex items-center justify-between mb-3", children: _jsxs("h4", { className: "text-sm font-medium text-white flex items-center", children: [_jsx(Building, { className: "h-4 w-4 mr-2 text-purple-400" }), "Client Reported"] }) }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-400", children: "Start Time:" }), _jsx("span", { className: "text-white font-medium", children: discrepancy.clientReportedStart })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-400", children: "End Time:" }), _jsx("span", { className: "text-white font-medium", children: discrepancy.clientReportedEnd })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-400", children: "Total Hours:" }), _jsxs("span", { className: "text-white font-medium", children: [discrepancy.clientReportedHours, "h"] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-400", children: "Break Time:" }), _jsxs("span", { className: "text-white font-medium", children: [discrepancy.clientReportedBreak, "m"] })] })] }), _jsx("div", { className: "mt-3 pt-3 border-t border-slate-700", children: _jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-slate-500", children: "Approved By:" }), _jsx("span", { className: "text-slate-300", children: discrepancy.clientApprover })] }) })] })] }), discrepancy.status === 'pending' || discrepancy.status === 'under_review' ? (_jsxs("div", { className: "flex items-center justify-between mt-6 pt-6 border-t border-slate-700", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("button", { className: "px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx("span", { children: "Accept Employee Time" })] }), _jsxs("button", { className: "px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center space-x-2", children: [_jsx(Building, { className: "h-4 w-4" }), _jsx("span", { children: "Accept Client Time" })] }), _jsxs("button", { className: "px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center space-x-2", children: [_jsx(Calculator, { className: "h-4 w-4" }), _jsx("span", { children: "Adjust Manually" })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { className: "p-2 text-slate-400 hover:text-white transition-colors", children: _jsx(MessageSquare, { className: "h-5 w-5" }) }), _jsx("button", { className: "p-2 text-slate-400 hover:text-white transition-colors", children: _jsx(Mail, { className: "h-5 w-5" }) }), _jsx("button", { className: "p-2 text-slate-400 hover:text-white transition-colors", children: _jsx(Phone, { className: "h-5 w-5" }) })] })] })) : discrepancy.resolution ? (_jsx("div", { className: "mt-6 pt-6 border-t border-slate-700", children: _jsx("div", { className: "bg-green-500/10 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-green-400 mb-2", children: "Resolution Details" }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-slate-400", children: "Adjusted Hours:" }), _jsxs("span", { className: "text-white font-medium", children: [discrepancy.resolution.adjustedHours, "h"] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-slate-400", children: "Approved By:" }), _jsx("span", { className: "text-white", children: discrepancy.resolution.approvedBy })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-slate-400", children: "Notes:" }), _jsx("span", { className: "text-slate-300", children: discrepancy.resolution.notes })] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-xs text-slate-500", children: "Resolved At" }), _jsx("p", { className: "text-sm text-white", children: new Date(discrepancy.resolution.approvedAt).toLocaleString() })] })] }) }) })) : null] }), _jsxs("div", { className: "bg-slate-900/50 p-4 border-t border-slate-700", children: [_jsxs("div", { className: "relative h-8", children: [_jsx("div", { className: "absolute inset-0 bg-slate-700 rounded-full" }), _jsx("div", { className: "absolute top-0 h-4 bg-blue-500 rounded-full opacity-75", style: {
                                                left: '10%',
                                                width: `${(discrepancy.employeeTotalHours / 12) * 80}%`
                                            } }), _jsx("div", { className: "absolute bottom-0 h-4 bg-purple-500 rounded-full opacity-75", style: {
                                                left: '10%',
                                                width: `${(discrepancy.clientReportedHours / 12) * 80}%`
                                            } }), _jsx("div", { className: "absolute top-full mt-1 left-[10%] text-xs text-slate-500", children: "7:00" }), _jsx("div", { className: "absolute top-full mt-1 left-[50%] text-xs text-slate-500", children: "12:00" }), _jsx("div", { className: "absolute top-full mt-1 left-[90%] text-xs text-slate-500", children: "19:00" })] }), _jsxs("div", { className: "flex items-center justify-center space-x-6 mt-6", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "h-3 w-3 bg-blue-500 rounded-full" }), _jsx("span", { className: "text-xs text-slate-400", children: "Employee Time" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "h-3 w-3 bg-purple-500 rounded-full" }), _jsx("span", { className: "text-xs text-slate-400", children: "Client Time" })] })] })] })] }, discrepancy.id))) }), _jsx("div", { className: "bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-2", children: "Reconciliation Summary" }), _jsxs("p", { className: "text-sm text-slate-400", children: ["Total financial impact: ", _jsxs("span", { className: "text-yellow-400 font-medium", children: ["$", stats.totalFinancialImpact.toFixed(2)] }), ' ', "across ", _jsx("span", { className: "text-white font-medium", children: stats.totalHoursDifference.toFixed(1) }), " hours of discrepancies"] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("button", { className: "px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center space-x-2", children: [_jsx(BarChart3, { className: "h-4 w-4" }), _jsx("span", { children: "View Analytics" })] }), _jsxs("button", { className: "px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center space-x-2", children: [_jsx(Zap, { className: "h-4 w-4" }), _jsx("span", { children: "Run Auto-Reconciliation" })] })] })] }) })] }));
}
//# sourceMappingURL=TimeReconciliation.js.map