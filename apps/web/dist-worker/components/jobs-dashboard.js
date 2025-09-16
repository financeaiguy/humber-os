'use client';
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useSession } from '@/components/session-context';
import { JobsStatCard, JobsSection, JobsTable, JobsButton } from './jobs-layout';
import { TrendingUp, Users, ChevronRight, Plus } from 'lucide-react';
import { OptimizedLink } from './optimized-link';
const coreMetrics = [
    {
        title: 'Revenue',
        value: '$917K',
        subtitle: '+12% from last month',
        trend: 'up'
    },
    {
        title: 'Active Projects',
        value: '15',
        subtitle: '3 launching this week',
        trend: 'up'
    },
    {
        title: 'Team Utilization',
        value: '87%',
        subtitle: 'Above target',
        trend: 'up'
    },
    {
        title: 'Client Satisfaction',
        value: '4.8',
        subtitle: 'Out of 5.0',
        trend: 'neutral'
    }
];
const recentProjects = [
    {
        name: 'GM Assembly Line',
        client: 'General Motors',
        status: 'In Progress',
        completion: 65,
        priority: 'high'
    },
    {
        name: 'Ford Paint Shop',
        client: 'Ford Motor Co',
        status: 'In Progress',
        completion: 40,
        priority: 'medium'
    },
    {
        name: 'Stellantis QC System',
        client: 'Stellantis',
        status: 'Planning',
        completion: 15,
        priority: 'medium'
    },
    {
        name: 'HIROTEC Welding',
        client: 'HIROTEC America',
        status: 'In Progress',
        completion: 80,
        priority: 'high'
    }
];
const upcomingTasks = [
    { task: 'GM Project FAT', date: 'Jan 15', priority: 'high' },
    { task: 'Ford Design Review', date: 'Jan 18', priority: 'medium' },
    { task: 'Stellantis Kickoff', date: 'Jan 22', priority: 'low' },
    { task: 'HIROTEC Commissioning', date: 'Jan 25', priority: 'high' }
];
export function JobsDashboard() {
    const { data: session } = useSession();
    return (_jsxs("div", { className: "space-y-12", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("h1", { className: "text-display text-4xl font-bold text-black", children: ["Good ", getTimeOfDay(), ", ", session?.user?.name?.split(' ')[0] || 'there'] }), _jsx("p", { className: "text-body text-gray-600", children: "Here's what's happening with your engineering operations" })] }), _jsx(JobsSection, { title: "At a Glance", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: coreMetrics.map((metric, index) => (_jsx(JobsStatCard, { title: metric.title, value: metric.value, subtitle: metric.subtitle, trend: metric.trend }, index))) }) }), _jsx(JobsSection, { title: "Active Projects", subtitle: "Your most important work", action: _jsx(OptimizedLink, { href: "/projects", children: _jsxs(JobsButton, { variant: "secondary", children: ["View All Projects", _jsx(ChevronRight, { size: 16, className: "ml-2" })] }) }), children: _jsx(JobsTable, { headers: ['Project', 'Client', 'Status', 'Progress'], children: recentProjects.map((project, index) => (_jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [_jsx("td", { className: "py-4", children: _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-body font-medium text-black", children: project.name }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${project.priority === 'high' ? 'bg-red-500' :
                                                        project.priority === 'medium' ? 'bg-yellow-500' :
                                                            'bg-green-500'}` }), _jsxs("span", { className: "text-caption text-xs text-gray-500", children: [project.priority, " priority"] })] })] }) }), _jsx("td", { className: "py-4", children: _jsx("p", { className: "text-body text-gray-600", children: project.client }) }), _jsx("td", { className: "py-4", children: _jsx("span", { className: `inline-flex px-2 py-1 rounded-full text-xs font-medium ${project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                        project.status === 'Planning' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'}`, children: project.status }) }), _jsx("td", { className: "py-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex-1 bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${project.completion}%` } }) }), _jsxs("span", { className: "text-body text-sm font-medium text-gray-900", children: [project.completion, "%"] })] }) })] }, index))) }) }), _jsx(JobsSection, { title: "This Week", subtitle: "Your immediate priorities", children: _jsx("div", { className: "jobs-card", children: _jsx("div", { className: "space-y-4", children: upcomingTasks.map((task, index) => (_jsxs("div", { className: "flex items-center justify-between py-3 border-b border-gray-100 last:border-0", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${task.priority === 'high' ? 'bg-red-500' :
                                                task.priority === 'medium' ? 'bg-yellow-500' :
                                                    'bg-green-500'}` }), _jsx("p", { className: "text-body font-medium text-black", children: task.task })] }), _jsx("p", { className: "text-caption text-gray-500", children: task.date })] }, index))) }) }) }), _jsx(JobsSection, { title: "Quick Actions", children: _jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsx(OptimizedLink, { href: "/projects/new", children: _jsxs(JobsButton, { children: [_jsx(Plus, { size: 16, className: "mr-2" }), "New Project"] }) }), _jsx(OptimizedLink, { href: "/onboarding", children: _jsxs(JobsButton, { variant: "secondary", children: [_jsx(Users, { size: 16, className: "mr-2" }), "Onboard Engineer"] }) }), _jsx(OptimizedLink, { href: "/analytics", children: _jsxs(JobsButton, { variant: "secondary", children: [_jsx(TrendingUp, { size: 16, className: "mr-2" }), "View Analytics"] }) })] }) })] }));
}
function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12)
        return 'morning';
    if (hour < 17)
        return 'afternoon';
    return 'evening';
}
//# sourceMappingURL=jobs-dashboard.js.map