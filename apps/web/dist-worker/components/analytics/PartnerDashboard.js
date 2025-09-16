'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSession } from 'next-auth/react';
import { PieChart, Pie, Cell, AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartWrapper } from '@/components/ui/chart-wrapper';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Clock, DollarSign, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
const getPartnerData = (partnerId, _partnerName) => {
    const baseData = {
        'partner-gm': {
            revenue: { current: 2100000, previous: 1850000, growth: 13.5 },
            utilization: { current: 89, previous: 82, growth: 8.5 },
            engineers: { total: 125, deployed: 118, available: 5, processing: 2 },
            projects: { active: 12, completed: 28, success_rate: 95.2 }
        },
        'partner-ford': {
            revenue: { current: 1850000, previous: 1620000, growth: 14.2 },
            utilization: { current: 85, previous: 78, growth: 9.0 },
            engineers: { total: 98, deployed: 89, available: 7, processing: 2 },
            projects: { active: 9, completed: 22, success_rate: 93.8 }
        },
        'partner-stellantis': {
            revenue: { current: 1650000, previous: 1450000, growth: 13.8 },
            utilization: { current: 87, previous: 80, growth: 8.8 },
            engineers: { total: 88, deployed: 82, available: 4, processing: 2 },
            projects: { active: 8, completed: 19, success_rate: 94.1 }
        },
        'partner-hirotec': {
            revenue: { current: 950000, previous: 820000, growth: 15.9 },
            utilization: { current: 91, previous: 84, growth: 8.3 },
            engineers: { total: 52, deployed: 49, available: 2, processing: 1 },
            projects: { active: 6, completed: 15, success_rate: 96.7 }
        }
    };
    return baseData[partnerId] || baseData['partner-gm'];
};
const getPartnerProjects = (partnerName) => [
    { name: `${partnerName} Assembly Line`, progress: 85, status: 'In Progress', budget: 450000, spent: 380000 },
    { name: `${partnerName} Quality Control`, progress: 62, status: 'In Progress', budget: 320000, spent: 198000 },
    { name: `${partnerName} Paint Shop`, progress: 95, status: 'Near Completion', budget: 280000, spent: 266000 },
    { name: `${partnerName} Robotics`, progress: 28, status: 'Planning', budget: 380000, spent: 106000 },
];
const monthlyTrend = [
    { month: 'Jul', revenue: 820000, engineers: 45, utilization: 78 },
    { month: 'Aug', revenue: 890000, engineers: 48, utilization: 82 },
    { month: 'Sep', revenue: 950000, engineers: 52, utilization: 85 },
    { month: 'Oct', revenue: 1020000, engineers: 55, utilization: 87 },
    { month: 'Nov', revenue: 1180000, engineers: 58, utilization: 89 },
    { month: 'Dec', revenue: 1350000, engineers: 62, utilization: 91 }
];
const engineerSpecialties = [
    { name: 'Electrical', value: 35, color: '#3B82F6' },
    { name: 'Mechanical', value: 28, color: '#10B981' },
    { name: 'Software', value: 22, color: '#8B5CF6' },
    { name: 'Systems', value: 15, color: '#F59E0B' }
];
function MetricCard({ title, value, change, icon: Icon, color }) {
    const isPositive = change > 0;
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("div", { className: `p-3 rounded-xl bg-gradient-to-r ${color}`, children: _jsx(Icon, { className: "h-6 w-6 text-white" }) }), _jsxs("div", { className: `flex items-center space-x-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`, children: [isPositive ? _jsx(TrendingUp, { className: "h-4 w-4" }) : _jsx(TrendingDown, { className: "h-4 w-4" }), _jsxs("span", { className: "text-sm", children: [isPositive ? '+' : '', change.toFixed(1), "%"] })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: title }), _jsx("p", { className: "text-2xl font-bold text-white", children: value })] })] }));
}
export default function PartnerDashboard() {
    const { data: session } = useSession();
    if (!session?.user) {
        return _jsx("div", { className: "text-white", children: "Loading..." });
    }
    const partnerData = getPartnerData(session.user.partnerId, session.user.partnerName);
    const projects = getPartnerProjects(session.user.partnerName);
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-4xl font-bold text-white mb-2", children: [session.user.partnerName, " Analytics"] }), _jsx("p", { className: "text-slate-400", children: "Comprehensive overview of your engineering operations and performance metrics." })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(MetricCard, { title: "Monthly Revenue", value: `$${(partnerData.revenue.current / 1000).toFixed(0)}K`, change: partnerData.revenue.growth, icon: DollarSign, color: "from-green-500 to-emerald-600" }), _jsx(MetricCard, { title: "Engineer Utilization", value: `${partnerData.utilization.current}%`, change: partnerData.utilization.growth, icon: Clock, color: "from-blue-500 to-cyan-600" }), _jsx(MetricCard, { title: "Active Engineers", value: `${partnerData.engineers.deployed}/${partnerData.engineers.total}`, change: 8.2, icon: Users, color: "from-purple-500 to-pink-600" }), _jsx(MetricCard, { title: "Project Success Rate", value: `${partnerData.projects.success_rate}%`, change: 2.1, icon: CheckCircle, color: "from-orange-500 to-red-600" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-4", children: "Revenue & Utilization Trend" }), _jsx(ChartWrapper, { width: "100%", height: 300, children: _jsxs(AreaChart, { data: monthlyTrend, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#334155" }), _jsx(XAxis, { dataKey: "month", stroke: "#94a3b8" }), _jsx(YAxis, { yAxisId: "revenue", orientation: "left", stroke: "#94a3b8" }), _jsx(YAxis, { yAxisId: "utilization", orientation: "right", stroke: "#94a3b8" }), _jsx(Tooltip, { contentStyle: {
                                                backgroundColor: '#1e293b',
                                                border: '1px solid #334155',
                                                borderRadius: '8px',
                                                color: '#F9FAFB',
                                                zIndex: 9999,
                                                position: 'relative',
                                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
                                            }, wrapperStyle: {
                                                zIndex: 9999,
                                                position: 'relative'
                                            } }), _jsx(Legend, {}), _jsx(Area, { yAxisId: "revenue", type: "monotone", dataKey: "revenue", stackId: "1", stroke: "#10B981", fill: "#10B981", fillOpacity: 0.3, name: "Revenue ($)" }), _jsx(Line, { yAxisId: "utilization", type: "monotone", dataKey: "utilization", stroke: "#3B82F6", strokeWidth: 3, dot: { fill: '#3B82F6', strokeWidth: 2 }, name: "Utilization (%)" })] }) })] }), _jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-4", children: "Engineer Specialties" }), _jsx(ChartWrapper, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: engineerSpecialties, cx: "50%", cy: "50%", labelLine: false, label: ({ name, value }) => `${name}: ${value}`, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: engineerSpecialties.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: {
                                                backgroundColor: '#1e293b',
                                                border: '1px solid #334155',
                                                borderRadius: '8px',
                                                color: '#F9FAFB',
                                                zIndex: 9999,
                                                position: 'relative',
                                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
                                            }, wrapperStyle: {
                                                zIndex: 9999,
                                                position: 'relative'
                                            } })] }) }), _jsx("div", { className: "grid grid-cols-2 gap-3 mt-4", children: engineerSpecialties.map((specialty, index) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full", style: { backgroundColor: specialty.color } }), _jsxs("span", { className: "text-sm text-slate-300", children: [specialty.name, ": ", specialty.value] })] }, specialty.name))) })] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-6", children: "Active Projects" }), _jsx("div", { className: "space-y-4", children: projects.map((project, index) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.1 }, className: "bg-slate-900/50 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-white", children: project.name }), _jsx("p", { className: "text-sm text-slate-400", children: project.status })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-sm font-medium text-white", children: ["$", (project.spent / 1000).toFixed(0), "K / $", (project.budget / 1000).toFixed(0), "K"] }), _jsxs("p", { className: "text-xs text-slate-400", children: [((project.spent / project.budget) * 100).toFixed(1), "% of budget"] })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-slate-400 mb-1", children: [_jsx("span", { children: "Progress" }), _jsxs("span", { children: [project.progress, "%"] })] }), _jsx("div", { className: "w-full bg-slate-700 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full transition-all duration-500 ${project.progress > 90 ? 'bg-green-500' :
                                                    project.progress > 60 ? 'bg-blue-500' : 'bg-yellow-500'}`, style: { width: `${project.progress}%` } }) })] })] }, project.name))) })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 p-6", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-3", children: [_jsx(TrendingUp, { className: "h-6 w-6 text-green-400" }), _jsx("h4", { className: "font-semibold text-white", children: "Revenue Growth" })] }), _jsxs("p", { className: "text-2xl font-bold text-green-400 mb-2", children: ["+", partnerData.revenue.growth.toFixed(1), "%"] }), _jsx("p", { className: "text-sm text-slate-300", children: "Monthly revenue increased significantly driven by higher utilization rates and project expansions." })] }), _jsxs("div", { className: "rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30 p-6", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-3", children: [_jsx(Activity, { className: "h-6 w-6 text-blue-400" }), _jsx("h4", { className: "font-semibold text-white", children: "Operational Efficiency" })] }), _jsxs("p", { className: "text-2xl font-bold text-blue-400 mb-2", children: [partnerData.utilization.current, "%"] }), _jsx("p", { className: "text-sm text-slate-300", children: "Engineer utilization exceeds industry average by 12%, indicating optimal resource allocation." })] }), _jsxs("div", { className: "rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 p-6", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-3", children: [_jsx(AlertTriangle, { className: "h-6 w-6 text-purple-400" }), _jsx("h4", { className: "font-semibold text-white", children: "Risk Assessment" })] }), _jsx("p", { className: "text-2xl font-bold text-purple-400 mb-2", children: "Low" }), _jsx("p", { className: "text-sm text-slate-300", children: "All projects on track with minimal risk factors. Strong performance across all metrics." })] })] })] }));
}
//# sourceMappingURL=PartnerDashboard.js.map