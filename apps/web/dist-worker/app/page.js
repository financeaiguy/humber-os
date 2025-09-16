'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { useSession } from '@/components/session-context';
import { TrendingUp, Users, Clock, DollarSign, Activity, AlertCircle, Calendar } from 'lucide-react';
import Link from 'next/link';
import { hasPermission } from '@/lib/permissions';
import { JobsDashboard } from '@/components/jobs-dashboard';
import { useEffect, useState } from 'react';
import { LineChart, Line, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart } from 'recharts';
import { ChartWrapper, ENHANCED_TOOLTIP_PROPS, ENHANCED_LEGEND_PROPS, AXIS_STYLE, GRID_STYLE } from '@/components/ui/chart-wrapper';
const stats = [
    {
        name: 'Total Revenue',
        value: '$917,235',
        change: '+12.5%',
        trend: 'up',
        icon: DollarSign,
        color: 'from-green-500 to-emerald-600',
    },
    {
        name: 'Active Projects',
        value: '15',
        change: '+3 this month',
        trend: 'up',
        icon: Activity,
        color: 'from-blue-500 to-cyan-600',
    },
    {
        name: 'Billable Hours',
        value: '73%',
        change: '+5.2%',
        trend: 'up',
        icon: Clock,
        color: 'from-purple-500 to-pink-600',
    },
    {
        name: 'Team Members',
        value: '35',
        change: '2 new hires',
        trend: 'up',
        icon: Users,
        color: 'from-orange-500 to-red-600',
    },
];
const recentProjects = [
    { id: 1, name: 'GM Assembly Line Automation', client: 'General Motors', status: 'In Progress', completion: 65 },
    { id: 2, name: 'Ford Paint Shop Upgrade', client: 'Ford', status: 'In Progress', completion: 40 },
    { id: 3, name: 'Stellantis Quality Control', client: 'Stellantis', status: 'Planning', completion: 15 },
    { id: 4, name: 'HIROTEC Welding System', client: 'HIROTEC', status: 'In Progress', completion: 80 },
];
const upcomingDeadlines = [
    { id: 1, task: 'GM Project FAT', date: '2024-01-15', priority: 'high' },
    { id: 2, task: 'Ford Design Review', date: '2024-01-18', priority: 'medium' },
    { id: 3, task: 'Stellantis Kickoff', date: '2024-01-22', priority: 'low' },
    { id: 4, task: 'HIROTEC Commissioning', date: '2024-01-25', priority: 'high' },
];
const revenueData = [
    { month: 'Jan', revenue: 850000, projects: 12, utilization: 78 },
    { month: 'Feb', revenue: 920000, projects: 14, utilization: 82 },
    { month: 'Mar', revenue: 1150000, projects: 16, utilization: 85 },
    { month: 'Apr', revenue: 980000, projects: 13, utilization: 79 },
    { month: 'May', revenue: 1200000, projects: 18, utilization: 88 },
    { month: 'Jun', revenue: 1350000, projects: 20, utilization: 92 }
];
const utilizationData = [
    { day: 'Mon', electrical: 85, mechanical: 78, software: 92, systems: 88 },
    { day: 'Tue', electrical: 88, mechanical: 82, software: 89, systems: 85 },
    { day: 'Wed', electrical: 92, mechanical: 85, software: 94, systems: 90 },
    { day: 'Thu', electrical: 87, mechanical: 80, software: 91, systems: 87 },
    { day: 'Fri', electrical: 83, mechanical: 77, software: 88, systems: 84 },
    { day: 'Sat', electrical: 45, mechanical: 40, software: 52, systems: 48 },
    { day: 'Sun', electrical: 25, mechanical: 22, software: 30, systems: 28 }
];
const clientDistribution = [
    { name: 'General Motors', value: 35, color: '#3B82F6' },
    { name: 'Ford', value: 28, color: '#10B981' },
    { name: 'Stellantis', value: 22, color: '#F59E0B' },
    { name: 'HIROTEC', value: 15, color: '#EF4444' }
];
const projectStatusData = [
    { status: 'Planning', count: 3, color: '#F59E0B' },
    { status: 'In Progress', count: 12, color: '#3B82F6' },
    { status: 'Testing', count: 5, color: '#8B5CF6' },
    { status: 'Deployed', count: 8, color: '#10B981' },
    { status: 'On Hold', count: 2, color: '#EF4444' }
];
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
export default function HomePage() {
    const { data: session } = useSession();
    const [isJobsMode, setIsJobsMode] = useState(false);
    useEffect(() => {
        const designMode = document.documentElement.getAttribute('data-design-mode');
        setIsJobsMode(designMode === 'jobs');
    }, []);
    if (!session?.user) {
        return (_jsxs("div", { className: "text-white p-8", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Authentication Required" }), _jsx("p", { className: "mb-4", children: "Please sign in to access the dashboard." }), _jsx("a", { href: "/auth/signin", className: "inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors", children: "Sign In" }), _jsxs("div", { className: "mt-6 text-sm text-slate-200", children: [_jsx("p", { children: "Development credentials:" }), _jsxs("ul", { className: "mt-2 space-y-1", children: [_jsx("li", { children: "\u2022 Partner Admin: partner@ford.com / partner123" }), _jsx("li", { children: "\u2022 Engineer: employee@humber.com / employee123" }), _jsx("li", { children: "\u2022 Operator: operator@humber.com / operator123" })] })] })] }));
    }
    if (isJobsMode) {
        return _jsx(JobsDashboard, {});
    }
    return (_jsxs("div", { className: "space-y-6 sm:space-y-8", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2", children: ["Welcome back, ", session.user.name?.split(' ')[0]] }), _jsxs("p", { className: "text-sm sm:text-base text-slate-200", children: [session.user.partnerName, " - ", session.user.role.replace('_', ' ')] }), _jsx("p", { className: "text-sm sm:text-base text-slate-200 mt-1", children: "Here's what's happening with your automation projects today." })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6", children: stats.map((stat, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "relative overflow-hidden rounded-xl sm:rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4 sm:p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "text-xs sm:text-sm text-slate-200 truncate", children: stat.name }), _jsx("p", { className: "text-xl sm:text-2xl font-bold text-white mt-1", children: stat.value }), _jsx("p", { className: "text-xs text-slate-300 mt-1 truncate", children: stat.change })] }), _jsx("div", { className: `p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${stat.color} flex-shrink-0`, children: _jsx(stat.icon, { className: "h-5 w-5 sm:h-6 sm:w-6 text-white" }) })] }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-full animate-shimmer" })] }, stat.name))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6", children: [_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.4 }, className: "lg:col-span-2 rounded-xl sm:rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4 sm:p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4 sm:mb-6", children: [_jsx("h2", { className: "text-lg sm:text-xl font-semibold text-white", children: "Active Projects" }), _jsx(Link, { href: "/projects", className: "text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors", children: "View all \u2192" })] }), _jsx("div", { className: "space-y-3 sm:space-y-4", children: recentProjects.map((project) => (_jsxs("div", { className: "bg-slate-900/50 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-slate-900/70 transition-colors", children: [_jsxs("div", { className: "flex items-start sm:items-center justify-between mb-2 gap-2", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("h3", { className: "font-medium text-white text-sm sm:text-base truncate", children: project.name }), _jsx("p", { className: "text-xs sm:text-sm text-slate-200 truncate", children: project.client })] }), _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${project.status === 'In Progress'
                                                        ? 'bg-blue-500/20 text-blue-400'
                                                        : 'bg-yellow-500/20 text-yellow-400'}`, children: project.status })] }), _jsxs("div", { className: "mt-3", children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-slate-200 mb-1", children: [_jsx("span", { children: "Progress" }), _jsxs("span", { children: [project.completion, "%"] })] }), _jsx("div", { className: "w-full bg-slate-700 rounded-full h-2", children: _jsx("div", { className: "bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500", style: { width: `${project.completion}%` } }) })] })] }, project.id))) })] }), _jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.5 }, className: "rounded-xl sm:rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4 sm:p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4 sm:mb-6", children: [_jsx("h2", { className: "text-lg sm:text-xl font-semibold text-white", children: "Upcoming Deadlines" }), _jsx(Calendar, { className: "h-4 w-4 sm:h-5 sm:w-5 text-slate-200" })] }), _jsx("div", { className: "space-y-2 sm:space-y-3", children: upcomingDeadlines.map((deadline) => (_jsxs("div", { className: "flex items-center space-x-3 p-2 sm:p-3 rounded-lg hover:bg-slate-900/50 transition-colors", children: [_jsx("div", { className: `h-2 w-2 rounded-full flex-shrink-0 ${deadline.priority === 'high'
                                                ? 'bg-red-500'
                                                : deadline.priority === 'medium'
                                                    ? 'bg-yellow-500'
                                                    : 'bg-green-500'}` }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs sm:text-sm font-medium text-white truncate", children: deadline.task }), _jsx("p", { className: "text-xs text-slate-200", children: deadline.date })] }), deadline.priority === 'high' && (_jsx(AlertCircle, { className: "h-3 w-3 sm:h-4 sm:w-4 text-red-400 flex-shrink-0" }))] }, deadline.id))) })] })] }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.6 }, className: "grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4", children: [
                    { label: 'Log Time', href: '/time', icon: Clock, color: 'from-blue-500 to-cyan-500', permission: 'canLogTime' },
                    { label: 'New Project', href: '/projects/new', icon: Activity, color: 'from-purple-500 to-pink-500', permission: 'canManageProjects' },
                    { label: 'Team Report', href: '/team', icon: Users, color: 'from-green-500 to-emerald-500', permission: 'canViewTeam' },
                    { label: 'Analytics', href: '/analytics', icon: TrendingUp, color: 'from-orange-500 to-red-500', permission: 'canViewAnalytics' },
                ].filter((action) => hasPermission(session.user.role, action.permission)).map((action) => (_jsxs(Link, { href: action.href, className: "group relative overflow-hidden rounded-lg sm:rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-3 sm:p-4 hover:border-slate-600 transition-all duration-300 touch-manipulation", children: [_jsx("div", { className: `absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-10 transition-opacity` }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center sm:space-x-3 space-y-2 sm:space-y-0", children: [_jsx("div", { className: `p-2 rounded-lg bg-gradient-to-r ${action.color} flex-shrink-0`, children: _jsx(action.icon, { className: "h-4 w-4 sm:h-5 sm:w-5 text-white" }) }), _jsx("span", { className: "text-xs sm:text-sm font-medium text-white text-center sm:text-left", children: action.label })] })] }, action.label))) }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.8 }, className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Engineering Analytics" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { className: "px-3 py-1 bg-slate-700 text-white rounded text-sm hover:bg-slate-600 transition-colors", children: "6M" }), _jsx("button", { className: "px-3 py-1 bg-blue-500 text-white rounded text-sm", children: "YTD" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Revenue & Project Volume" }), _jsx(ChartWrapper, { width: "100%", height: 300, children: _jsxs(ComposedChart, { data: revenueData, children: [_jsx(CartesianGrid, { ...GRID_STYLE }), _jsx(XAxis, { dataKey: "month", ...AXIS_STYLE }), _jsx(YAxis, { yAxisId: "left", ...AXIS_STYLE }), _jsx(YAxis, { yAxisId: "right", orientation: "right", ...AXIS_STYLE }), _jsx(Tooltip, { ...ENHANCED_TOOLTIP_PROPS, formatter: (value, name) => [
                                                        name === 'revenue' ? `$${(value / 1000).toFixed(0)}K` : value,
                                                        name === 'revenue' ? 'Revenue' : 'Projects'
                                                    ] }), _jsx(Area, { yAxisId: "left", type: "monotone", dataKey: "revenue", stroke: "#3B82F6", fill: "url(#revenueGradient)", strokeWidth: 2 }), _jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "projects", stroke: "#10B981", strokeWidth: 3 }), _jsx("defs", { children: _jsxs("linearGradient", { id: "revenueGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#3B82F6", stopOpacity: 0.3 }), _jsx("stop", { offset: "95%", stopColor: "#3B82F6", stopOpacity: 0 })] }) })] }) })] }), _jsxs("div", { className: "rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Engineer Utilization by Discipline" }), _jsx(ChartWrapper, { width: "100%", height: 300, children: _jsxs(LineChart, { data: utilizationData, children: [_jsx(CartesianGrid, { ...GRID_STYLE }), _jsx(XAxis, { dataKey: "day", ...AXIS_STYLE }), _jsx(YAxis, { ...AXIS_STYLE, domain: [0, 100] }), _jsx(Tooltip, { contentStyle: {
                                                        backgroundColor: '#1F2937',
                                                        border: '1px solid #374151',
                                                        borderRadius: '8px',
                                                        color: '#F9FAFB',
                                                        zIndex: 9999,
                                                        position: 'relative',
                                                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
                                                    }, wrapperStyle: {
                                                        zIndex: 9999,
                                                        position: 'relative'
                                                    }, formatter: (value) => [`${value}%`, ''] }), _jsx(Legend, { ...ENHANCED_LEGEND_PROPS }), _jsx(Line, { type: "monotone", dataKey: "electrical", stroke: "#3B82F6", strokeWidth: 2, name: "Electrical" }), _jsx(Line, { type: "monotone", dataKey: "mechanical", stroke: "#10B981", strokeWidth: 2, name: "Mechanical" }), _jsx(Line, { type: "monotone", dataKey: "software", stroke: "#F59E0B", strokeWidth: 2, name: "Software" }), _jsx(Line, { type: "monotone", dataKey: "systems", stroke: "#EF4444", strokeWidth: 2, name: "Systems" })] }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Client Revenue Distribution" }), _jsx(ChartWrapper, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: clientDistribution, cx: "50%", cy: "50%", outerRadius: 100, innerRadius: 60, paddingAngle: 2, dataKey: "value", children: clientDistribution.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: {
                                                        backgroundColor: '#1F2937',
                                                        border: '1px solid #374151',
                                                        borderRadius: '8px',
                                                        color: '#F9FAFB',
                                                        zIndex: 9999,
                                                        position: 'relative',
                                                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
                                                    }, wrapperStyle: {
                                                        zIndex: 9999,
                                                        position: 'relative'
                                                    }, formatter: (value) => [`${value}%`, 'Revenue Share'] }), _jsx(Legend, { ...ENHANCED_LEGEND_PROPS })] }) })] }), _jsxs("div", { className: "rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Project Status Overview" }), _jsx(ChartWrapper, { width: "100%", height: 300, children: _jsxs(BarChart, { data: projectStatusData, layout: "horizontal", children: [_jsx(CartesianGrid, { ...GRID_STYLE }), _jsx(XAxis, { type: "number", ...AXIS_STYLE }), _jsx(YAxis, { dataKey: "status", type: "category", ...AXIS_STYLE, width: 80 }), _jsx(Tooltip, { contentStyle: {
                                                        backgroundColor: '#1F2937',
                                                        border: '1px solid #374151',
                                                        borderRadius: '8px',
                                                        color: '#F9FAFB',
                                                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
                                                    }, formatter: (value) => [value, 'Projects'] }), _jsx(Bar, { dataKey: "count", fill: "#3B82F6", children: projectStatusData.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) })] }) })] })] }), _jsxs("div", { className: "rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Key Performance Indicators" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-slate-900/50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-blue-400", children: "87%" }), _jsx("div", { className: "text-sm text-slate-200", children: "Overall Utilization" })] }), _jsxs("div", { className: "text-center p-4 bg-slate-900/50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-green-400", children: "$6.2M" }), _jsx("div", { className: "text-sm text-slate-200", children: "YTD Revenue" })] }), _jsxs("div", { className: "text-center p-4 bg-slate-900/50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-purple-400", children: "30" }), _jsx("div", { className: "text-sm text-slate-200", children: "Active Projects" })] }), _jsxs("div", { className: "text-center p-4 bg-slate-900/50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-orange-400", children: "95%" }), _jsx("div", { className: "text-sm text-slate-200", children: "Client Satisfaction" })] })] })] })] })] }));
}
//# sourceMappingURL=page.js.map