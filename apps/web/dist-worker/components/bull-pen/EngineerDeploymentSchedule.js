'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Building, AlertTriangle, CheckCircle, ChevronRight, Plane, Car, Users, FileText, Shield, DollarSign, Briefcase, AlertCircle, TrendingUp, Target, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
export default function EngineerDeploymentSchedule({ engineer, currentWeek, upcomingWeeks = [], deploymentRequirements = [] }) {
    const [selectedWeek, setSelectedWeek] = useState(0);
    const mockCurrentWeek = currentWeek || {
        weekStarting: '2024-01-15',
        assignments: [
            { day: 'Monday', client: 'Ford', location: 'Dearborn, MI', project: 'F-150 Lightning', hours: 8, travelRequired: false, status: 'confirmed' },
            { day: 'Tuesday', client: 'Ford', location: 'Dearborn, MI', project: 'F-150 Lightning', hours: 8, travelRequired: false, status: 'confirmed' },
            { day: 'Wednesday', client: 'GM', location: 'Warren, MI', project: 'Ultium Battery', hours: 8, travelRequired: true, status: 'confirmed' },
            { day: 'Thursday', client: 'GM', location: 'Warren, MI', project: 'Ultium Battery', hours: 8, travelRequired: false, status: 'confirmed' },
            { day: 'Friday', client: 'GM', location: 'Warren, MI', project: 'Ultium Battery', hours: 8, travelRequired: false, status: 'confirmed' },
        ]
    };
    const mockRequirements = deploymentRequirements.length > 0 ? deploymentRequirements : [
        { id: '1', requirement: 'Background Check - Ford', status: 'complete', priority: 'critical' },
        { id: '2', requirement: 'Background Check - GM', status: 'complete', priority: 'critical' },
        { id: '3', requirement: 'Safety Training - Ford Plant', status: 'complete', priority: 'high' },
        { id: '4', requirement: 'Safety Training - GM Facility', status: 'in-progress', priority: 'high', dueDate: '2024-01-14' },
        { id: '5', requirement: 'Badge Access - Ford', status: 'complete', priority: 'critical' },
        { id: '6', requirement: 'Badge Access - GM', status: 'pending', priority: 'critical', dueDate: '2024-01-15' },
        { id: '7', requirement: 'NDA Signed - Both Clients', status: 'complete', priority: 'critical' },
        { id: '8', requirement: 'Tool Certification', status: 'complete', priority: 'medium' },
        { id: '9', requirement: 'Travel Arrangements', status: 'complete', priority: 'high' },
        { id: '10', requirement: 'Housing Confirmation', status: 'complete', priority: 'medium' }
    ];
    const weeklyMetrics = {
        totalHours: mockCurrentWeek.assignments.reduce((sum, a) => sum + a.hours, 0),
        clientCount: new Set(mockCurrentWeek.assignments.map(a => a.client)).size,
        travelDays: mockCurrentWeek.assignments.filter(a => a.travelRequired).length,
        revenue: mockCurrentWeek.assignments.reduce((sum, a) => sum + (a.hours * engineer.hourlyRate), 0)
    };
    const requirementsByStatus = {
        critical: mockRequirements.filter(r => r.priority === 'critical'),
        pending: mockRequirements.filter(r => r.status === 'pending' || r.status === 'blocked'),
        complete: mockRequirements.filter(r => r.status === 'complete')
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'tentative': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'pending': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };
    const getRequirementStatusIcon = (status) => {
        switch (status) {
            case 'complete': return _jsx(CheckCircle, { className: "h-4 w-4 text-green-400" });
            case 'in-progress': return _jsx(Clock, { className: "h-4 w-4 text-yellow-400" });
            case 'pending': return _jsx(AlertCircle, { className: "h-4 w-4 text-orange-400" });
            case 'blocked': return _jsx(AlertTriangle, { className: "h-4 w-4 text-red-400" });
            default: return null;
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'low': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30", children: [_jsx(CardHeader, { className: "pb-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-white text-xl", children: "Split-Week Deployment Schedule" }), _jsx("p", { className: "text-slate-300 mt-1", children: "Multiple client assignments this week" })] }), _jsx(Badge, { variant: "outline", className: "bg-green-400/10 text-green-400 border-green-400/30", children: "Active Deployment" })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-slate-800/50 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center space-x-2 text-slate-400 mb-1", children: [_jsx(Clock, { className: "h-4 w-4" }), _jsx("span", { className: "text-xs", children: "Total Hours" })] }), _jsx("p", { className: "text-2xl font-bold text-white", children: weeklyMetrics.totalHours })] }), _jsxs("div", { className: "bg-slate-800/50 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center space-x-2 text-slate-400 mb-1", children: [_jsx(Building, { className: "h-4 w-4" }), _jsx("span", { className: "text-xs", children: "Clients" })] }), _jsx("p", { className: "text-2xl font-bold text-white", children: weeklyMetrics.clientCount })] }), _jsxs("div", { className: "bg-slate-800/50 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center space-x-2 text-slate-400 mb-1", children: [_jsx(Car, { className: "h-4 w-4" }), _jsx("span", { className: "text-xs", children: "Travel Days" })] }), _jsx("p", { className: "text-2xl font-bold text-white", children: weeklyMetrics.travelDays })] }), _jsxs("div", { className: "bg-slate-800/50 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center space-x-2 text-slate-400 mb-1", children: [_jsx(DollarSign, { className: "h-4 w-4" }), _jsx("span", { className: "text-xs", children: "Weekly Revenue" })] }), _jsxs("p", { className: "text-2xl font-bold text-green-400", children: ["$", weeklyMetrics.revenue.toLocaleString()] })] })] }) })] }), _jsxs(Card, { className: "bg-slate-800/50 border-slate-700", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-white flex items-center space-x-2", children: [_jsx(Calendar, { className: "h-5 w-5" }), _jsx("span", { children: "This Week's Schedule" }), _jsxs(Badge, { variant: "outline", className: "ml-auto", children: ["Week of ", new Date(mockCurrentWeek.weekStarting).toLocaleDateString()] })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-3", children: mockCurrentWeek.assignments.map((assignment, index) => (_jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.05 }, className: "bg-slate-700/30 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-all", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-2", children: [_jsx(Badge, { variant: "outline", className: "text-white", children: assignment.day }), _jsx(Badge, { className: getStatusColor(assignment.status), children: assignment.status }), assignment.travelRequired && (_jsxs(Badge, { variant: "outline", className: "text-orange-400 border-orange-400/30", children: [_jsx(Car, { className: "h-3 w-3 mr-1" }), "Travel"] }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-500 mb-1", children: "Client" }), _jsxs("p", { className: "text-white font-medium flex items-center space-x-2", children: [_jsx(Building, { className: "h-4 w-4 text-slate-400" }), _jsx("span", { children: assignment.client })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-500 mb-1", children: "Location" }), _jsxs("p", { className: "text-slate-300 flex items-center space-x-2", children: [_jsx(MapPin, { className: "h-4 w-4 text-slate-400" }), _jsx("span", { children: assignment.location })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-500 mb-1", children: "Project" }), _jsxs("p", { className: "text-slate-300 flex items-center space-x-2", children: [_jsx(Briefcase, { className: "h-4 w-4 text-slate-400" }), _jsx("span", { children: assignment.project })] })] })] })] }), _jsxs("div", { className: "text-right ml-4", children: [_jsxs("p", { className: "text-2xl font-bold text-white", children: [assignment.hours, "h"] }), _jsxs("p", { className: "text-xs text-slate-400", children: ["$", assignment.hours * engineer.hourlyRate] })] })] }) }, index))) }), _jsx("div", { className: "mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(TrendingUp, { className: "h-5 w-5 text-blue-400" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Week Summary" }), _jsxs("p", { className: "text-white", children: [weeklyMetrics.clientCount, " clients \u2022 ", weeklyMetrics.totalHours, " hours \u2022 $", weeklyMetrics.revenue.toLocaleString(), " revenue"] })] })] }), _jsx(ChevronRight, { className: "h-5 w-5 text-slate-400" })] }) })] })] }), _jsxs(Card, { className: "bg-slate-800/50 border-slate-700", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "text-white flex items-center space-x-2", children: [_jsx(Shield, { className: "h-5 w-5" }), _jsx("span", { children: "Deployment Requirements" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Badge, { variant: "outline", className: "bg-green-400/10 text-green-400 border-green-400/30", children: [requirementsByStatus.complete.length, "/", mockRequirements.length, " Complete"] }), requirementsByStatus.pending.length > 0 && (_jsxs(Badge, { variant: "outline", className: "bg-orange-400/10 text-orange-400 border-orange-400/30", children: [requirementsByStatus.pending.length, " Pending"] }))] })] }) }), _jsxs(CardContent, { children: [requirementsByStatus.pending.length > 0 && (_jsx("div", { className: "mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg", children: _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-orange-400 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-orange-400 font-medium", children: "Action Required" }), _jsxs("p", { className: "text-sm text-slate-300 mt-1", children: [requirementsByStatus.pending.length, " requirement", requirementsByStatus.pending.length > 1 ? 's' : '', " pending completion before deployment"] })] })] }) })), _jsx("div", { className: "space-y-2", children: mockRequirements.map((req) => (_jsxs("div", { className: `flex items-center justify-between p-3 rounded-lg border ${req.status === 'complete'
                                        ? 'bg-slate-700/20 border-slate-700'
                                        : 'bg-slate-700/40 border-slate-600'}`, children: [_jsxs("div", { className: "flex items-center space-x-3", children: [getRequirementStatusIcon(req.status), _jsxs("div", { children: [_jsx("p", { className: `${req.status === 'complete' ? 'text-slate-400 line-through' : 'text-white'}`, children: req.requirement }), req.dueDate && req.status !== 'complete' && (_jsxs("p", { className: "text-xs text-orange-400 mt-1", children: ["Due: ", new Date(req.dueDate).toLocaleDateString()] }))] })] }), _jsx(Badge, { className: `${getPriorityColor(req.priority)} border`, children: req.priority })] }, req.id))) }), _jsx("div", { className: "mt-6 p-4 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400 mb-1", children: "Deployment Readiness" }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "text-3xl font-bold text-white", children: [Math.round((requirementsByStatus.complete.length / mockRequirements.length) * 100), "%"] }), _jsx("div", { className: "flex-1 h-2 bg-slate-700 rounded-full", children: _jsx("div", { className: "h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500", style: { width: `${(requirementsByStatus.complete.length / mockRequirements.length) * 100}%` } }) })] })] }), _jsx(Target, { className: "h-8 w-8 text-green-400" })] }) })] })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [_jsxs(Button, { variant: "outline", className: "justify-start", children: [_jsx(Navigation, { className: "h-4 w-4 mr-2" }), "Get Directions"] }), _jsxs(Button, { variant: "outline", className: "justify-start", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "View Contracts"] }), _jsxs(Button, { variant: "outline", className: "justify-start", children: [_jsx(Users, { className: "h-4 w-4 mr-2" }), "Contact Clients"] }), _jsxs(Button, { variant: "outline", className: "justify-start", children: [_jsx(Plane, { className: "h-4 w-4 mr-2" }), "Travel Details"] })] })] }));
}
//# sourceMappingURL=EngineerDeploymentSchedule.js.map