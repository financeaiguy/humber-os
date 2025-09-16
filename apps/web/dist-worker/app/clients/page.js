'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Building2, MapPin, Phone, Mail, DollarSign, Users, Briefcase, TrendingUp } from 'lucide-react';
const clients = [
    {
        id: 1,
        name: 'General Motors',
        industry: 'Automotive Manufacturing',
        location: 'Detroit, MI',
        contact: {
            name: 'John Smith',
            email: 'john.smith@gm.com',
            phone: '+1 (313) 555-0123'
        },
        projects: {
            active: 2,
            completed: 8,
            totalValue: 2850000
        },
        engineers: {
            deployed: 6,
            categories: ['Electrical', 'Mechanical', 'Software']
        },
        relationship: {
            since: '2022-03-15',
            status: 'active',
            satisfaction: 4.8,
            lastContact: '2025-01-12'
        }
    },
    {
        id: 2,
        name: 'Ford Motor Company',
        industry: 'Automotive Manufacturing',
        location: 'Dearborn, MI',
        contact: {
            name: 'Maria Garcia',
            email: 'maria.garcia@ford.com',
            phone: '+1 (313) 555-0456'
        },
        projects: {
            active: 1,
            completed: 5,
            totalValue: 1950000
        },
        engineers: {
            deployed: 4,
            categories: ['Mechanical', 'Systems', 'Project']
        },
        relationship: {
            since: '2022-08-20',
            status: 'active',
            satisfaction: 4.6,
            lastContact: '2025-01-10'
        }
    },
    {
        id: 3,
        name: 'Stellantis',
        industry: 'Automotive Manufacturing',
        location: 'Auburn Hills, MI',
        contact: {
            name: 'Robert Wilson',
            email: 'robert.wilson@stellantis.com',
            phone: '+1 (248) 555-0789'
        },
        projects: {
            active: 1,
            completed: 3,
            totalValue: 1200000
        },
        engineers: {
            deployed: 3,
            categories: ['Electrical', 'Systems']
        },
        relationship: {
            since: '2023-01-10',
            status: 'active',
            satisfaction: 4.4,
            lastContact: '2025-01-08'
        }
    },
    {
        id: 4,
        name: 'HIROTEC America',
        industry: 'Automotive Supplier',
        location: 'Howell, MI',
        contact: {
            name: 'Takeshi Yamamoto',
            email: 'takeshi.yamamoto@hirotec.com',
            phone: '+1 (517) 555-0321'
        },
        projects: {
            active: 1,
            completed: 4,
            totalValue: 980000
        },
        engineers: {
            deployed: 2,
            categories: ['Robotics', 'Mechanical']
        },
        relationship: {
            since: '2023-05-22',
            status: 'active',
            satisfaction: 4.9,
            lastContact: '2025-01-11'
        }
    }
];
const getStatusColor = (status) => {
    switch (status) {
        case 'active': return 'bg-green-500/20 text-green-400';
        case 'inactive': return 'bg-gray-500/20 text-gray-400';
        case 'pending': return 'bg-yellow-500/20 text-yellow-400';
        default: return 'bg-blue-500/20 text-blue-400';
    }
};
export default function ClientsPage() {
    const totalRevenue = clients.reduce((sum, client) => sum + client.projects.totalValue, 0);
    const totalProjects = clients.reduce((sum, client) => sum + client.projects.active + client.projects.completed, 0);
    const avgSatisfaction = clients.reduce((sum, client) => sum + client.relationship.satisfaction, 0) / clients.length;
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-white mb-2", children: "Customer Management" }), _jsx("p", { className: "text-slate-400", children: "Manage customer relationships and track project performance." })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Total Clients" }), _jsx("p", { className: "text-2xl font-bold text-white mt-1", children: clients.length })] }), _jsx(Building2, { className: "h-8 w-8 text-blue-400" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Total Revenue" }), _jsxs("p", { className: "text-2xl font-bold text-white mt-1", children: ["$", (totalRevenue / 1000000).toFixed(1), "M"] })] }), _jsx(DollarSign, { className: "h-8 w-8 text-green-400" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Active Projects" }), _jsx("p", { className: "text-2xl font-bold text-white mt-1", children: totalProjects })] }), _jsx(Briefcase, { className: "h-8 w-8 text-purple-400" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Avg Satisfaction" }), _jsx("p", { className: "text-2xl font-bold text-white mt-1", children: avgSatisfaction.toFixed(1) })] }), _jsx(TrendingUp, { className: "h-8 w-8 text-yellow-400" })] }) })] }), _jsx("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-6", children: clients.map((client, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600 transition-all duration-300", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-1", children: client.name }), _jsx("p", { className: "text-sm text-slate-400", children: client.industry })] }), _jsx("span", { className: `px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(client.relationship.status)}`, children: client.relationship.status })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-lg p-4 mb-4", children: [_jsx("h4", { className: "text-sm font-medium text-white mb-3", children: "Primary Contact" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2 text-sm text-slate-300", children: [_jsx(Users, { className: "h-4 w-4 text-slate-400" }), _jsx("span", { children: client.contact.name })] }), _jsxs("div", { className: "flex items-center space-x-2 text-sm text-slate-300", children: [_jsx(Mail, { className: "h-4 w-4 text-slate-400" }), _jsx("span", { children: client.contact.email })] }), _jsxs("div", { className: "flex items-center space-x-2 text-sm text-slate-300", children: [_jsx(Phone, { className: "h-4 w-4 text-slate-400" }), _jsx("span", { children: client.contact.phone })] }), _jsxs("div", { className: "flex items-center space-x-2 text-sm text-slate-300", children: [_jsx(MapPin, { className: "h-4 w-4 text-slate-400" }), _jsx("span", { children: client.location })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { className: "bg-slate-900/50 rounded-lg p-3", children: [_jsx("p", { className: "text-sm text-slate-400", children: "Projects" }), _jsxs("p", { className: "text-lg font-bold text-white", children: [client.projects.active, " active, ", client.projects.completed, " completed"] })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-lg p-3", children: [_jsx("p", { className: "text-sm text-slate-400", children: "Engineers" }), _jsxs("p", { className: "text-lg font-bold text-white", children: [client.engineers.deployed, " deployed"] })] })] }), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-slate-700", children: [_jsxs("div", { className: "text-center", children: [_jsxs("p", { className: "text-lg font-bold text-green-400", children: ["$", (client.projects.totalValue / 1000000).toFixed(1), "M"] }), _jsx("p", { className: "text-xs text-slate-400", children: "Total Value" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-lg font-bold text-yellow-400", children: client.relationship.satisfaction }), _jsx("p", { className: "text-xs text-slate-400", children: "Satisfaction" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("p", { className: "text-lg font-bold text-blue-400", children: [Math.round((new Date().getTime() - new Date(client.relationship.since).getTime()) / (1000 * 60 * 60 * 24 * 365 * 10)) / 10, "y"] }), _jsx("p", { className: "text-xs text-slate-400", children: "Partnership" })] })] })] }, client.id))) })] }));
}
//# sourceMappingURL=page.js.map