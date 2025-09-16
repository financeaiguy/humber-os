'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, DollarSign, Clock, Target, AlertCircle, CheckCircle, PlayCircle, PauseCircle } from 'lucide-react';
import Link from 'next/link';
const projects = [
    {
        id: 1,
        name: 'GM Assembly Line Automation',
        client: 'General Motors',
        status: 'in_progress',
        priority: 'high',
        completion: 65,
        startDate: '2024-10-15',
        endDate: '2025-04-15',
        budget: 1200000,
        spent: 780000,
        location: 'Detroit, MI',
        engineers: [
            { name: 'Sarah Johnson', role: 'Lead Electrical Engineer' },
            { name: 'Michael Chen', role: 'Mechanical Engineer' },
            { name: 'David Kim', role: 'Systems Engineer' }
        ],
        description: 'Complete automation upgrade for GM assembly line including PLC programming, robotic integration, and quality control systems.'
    },
    {
        id: 2,
        name: 'Ford Paint Shop Upgrade',
        client: 'Ford Motor Company',
        status: 'in_progress',
        priority: 'medium',
        completion: 40,
        startDate: '2024-11-01',
        endDate: '2025-06-30',
        budget: 950000,
        spent: 380000,
        location: 'Dearborn, MI',
        engineers: [
            { name: 'Emily Rodriguez', role: 'Software Engineer' },
            { name: 'Lisa Thompson', role: 'Project Engineer' }
        ],
        description: 'Modernization of paint shop control systems with new HMI interfaces and process optimization.'
    },
    {
        id: 3,
        name: 'Stellantis Quality Control',
        client: 'Stellantis',
        status: 'planning',
        priority: 'medium',
        completion: 15,
        startDate: '2025-01-22',
        endDate: '2025-08-22',
        budget: 750000,
        spent: 112500,
        location: 'Auburn Hills, MI',
        engineers: [
            { name: 'David Kim', role: 'Systems Engineer' }
        ],
        description: 'Implementation of advanced quality control systems with machine vision and statistical process control.'
    },
    {
        id: 4,
        name: 'HIROTEC Welding System',
        client: 'HIROTEC America',
        status: 'in_progress',
        priority: 'high',
        completion: 80,
        startDate: '2024-09-01',
        endDate: '2025-02-28',
        budget: 680000,
        spent: 544000,
        location: 'Howell, MI',
        engineers: [
            { name: 'Michael Chen', role: 'Mechanical Engineer' },
            { name: 'Sarah Johnson', role: 'Electrical Engineer' }
        ],
        description: 'Robotic welding system integration with advanced seam tracking and quality monitoring.'
    },
    {
        id: 5,
        name: 'Magna Seating Automation',
        client: 'Magna International',
        status: 'completed',
        priority: 'low',
        completion: 100,
        startDate: '2024-05-01',
        endDate: '2024-09-30',
        budget: 420000,
        spent: 398000,
        location: 'Troy, MI',
        engineers: [
            { name: 'Lisa Thompson', role: 'Project Engineer' }
        ],
        description: 'Automated seating assembly line with robotic material handling and quality inspection.'
    }
];
const getStatusIcon = (status) => {
    switch (status) {
        case 'completed': return _jsx(CheckCircle, { className: "h-5 w-5 text-green-400" });
        case 'in_progress': return _jsx(PlayCircle, { className: "h-5 w-5 text-blue-400" });
        case 'planning': return _jsx(Clock, { className: "h-5 w-5 text-yellow-400" });
        case 'on_hold': return _jsx(PauseCircle, { className: "h-5 w-5 text-orange-400" });
        default: return _jsx(AlertCircle, { className: "h-5 w-5 text-gray-400" });
    }
};
const getStatusColor = (status) => {
    switch (status) {
        case 'completed': return 'bg-green-500/20 text-green-400';
        case 'in_progress': return 'bg-blue-500/20 text-blue-400';
        case 'planning': return 'bg-yellow-500/20 text-yellow-400';
        case 'on_hold': return 'bg-orange-500/20 text-orange-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
};
const getPriorityColor = (priority) => {
    switch (priority) {
        case 'high': return 'bg-red-500/20 text-red-400';
        case 'medium': return 'bg-yellow-500/20 text-yellow-400';
        case 'low': return 'bg-green-500/20 text-green-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
};
export default function ProjectsPage() {
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-white mb-2", children: "Project Management" }), _jsx("p", { className: "text-slate-400", children: "Track and manage all engineering projects and deployments." })] }), _jsx(Link, { href: "/projects/new", className: "px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300", children: "New Project" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Active Projects" }), _jsx("p", { className: "text-2xl font-bold text-white mt-1", children: activeProjects })] }), _jsx(PlayCircle, { className: "h-8 w-8 text-blue-400" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Completed" }), _jsx("p", { className: "text-2xl font-bold text-white mt-1", children: completedProjects })] }), _jsx(CheckCircle, { className: "h-8 w-8 text-green-400" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Total Budget" }), _jsxs("p", { className: "text-2xl font-bold text-white mt-1", children: ["$", (totalBudget / 1000000).toFixed(1), "M"] })] }), _jsx(DollarSign, { className: "h-8 w-8 text-green-400" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Budget Utilization" }), _jsxs("p", { className: "text-2xl font-bold text-white mt-1", children: [Math.round((totalSpent / totalBudget) * 100), "%"] })] }), _jsx(Target, { className: "h-8 w-8 text-purple-400" })] }) })] }), _jsx("div", { className: "space-y-6", children: projects.map((project, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600 transition-all duration-300", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-start space-x-4", children: [getStatusIcon(project.status), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-1", children: project.name }), _jsx("p", { className: "text-sm text-slate-400", children: project.client })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`, children: [project.priority, " priority"] }), _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`, children: project.status.replace('_', ' ') })] })] }), _jsx("p", { className: "text-sm text-slate-300 mb-4", children: project.description }), _jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm text-slate-400", children: "Progress" }), _jsxs("span", { className: "text-sm font-medium text-white", children: [project.completion, "%"] })] }), _jsx("div", { className: "w-full bg-slate-700 rounded-full h-2", children: _jsx(motion.div, { initial: { width: 0 }, animate: { width: `${project.completion}%` }, transition: { delay: 0.5 + index * 0.1, duration: 1 }, className: "bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4", children: [_jsxs("div", { className: "bg-slate-900/50 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx(Calendar, { className: "h-4 w-4 text-slate-400" }), _jsx("span", { className: "text-sm text-slate-400", children: "Timeline" })] }), _jsxs("p", { className: "text-sm text-white", children: [project.startDate, " - ", project.endDate] })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx(DollarSign, { className: "h-4 w-4 text-slate-400" }), _jsx("span", { className: "text-sm text-slate-400", children: "Budget" })] }), _jsxs("p", { className: "text-sm text-white", children: ["$", project.spent.toLocaleString(), " / $", project.budget.toLocaleString()] })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx(MapPin, { className: "h-4 w-4 text-slate-400" }), _jsx("span", { className: "text-sm text-slate-400", children: "Location" })] }), _jsx("p", { className: "text-sm text-white", children: project.location })] })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-3", children: [_jsx(Users, { className: "h-4 w-4 text-slate-400" }), _jsxs("span", { className: "text-sm text-slate-400", children: ["Assigned Engineers (", project.engineers.length, ")"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2", children: project.engineers.map((engineer, idx) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold", children: engineer.name.split(' ').map(n => n[0]).join('') }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-white", children: engineer.name }), _jsx("p", { className: "text-xs text-slate-400", children: engineer.role })] })] }, idx))) })] })] }, project.id))) })] }));
}
//# sourceMappingURL=page.js.map