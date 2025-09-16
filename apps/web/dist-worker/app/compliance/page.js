'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Shield, FileText, AlertTriangle, CheckCircle, Clock, Users, Database, Scale } from 'lucide-react';
export default function CompliancePage() {
    const complianceItems = [
        {
            category: 'Biometric Privacy Laws',
            items: [
                { law: 'Illinois BIPA', status: 'compliant', description: 'Biometric Information Privacy Act compliance' },
                { law: 'Texas CUBI', status: 'compliant', description: 'Capture or Use of Biometric Identifier Act' },
                { law: 'California CCPA', status: 'compliant', description: 'Consumer privacy rights for biometric data' },
                { law: 'GDPR Article 9', status: 'compliant', description: 'Special category data protections' }
            ]
        },
        {
            category: 'Labor & Employment Laws',
            items: [
                { law: 'FLSA', status: 'compliant', description: 'Fair Labor Standards Act time tracking' },
                { law: 'State Labor Laws', status: 'compliant', description: 'Michigan, Ohio, Indiana employment laws' },
                { law: 'OSHA Standards', status: 'compliant', description: 'Occupational safety and health compliance' },
                { law: 'Workers Compensation', status: 'compliant', description: 'Insurance and safety requirements' }
            ]
        },
        {
            category: 'Financial & Audit',
            items: [
                { law: 'SOX Compliance', status: 'compliant', description: 'Sarbanes-Oxley financial reporting' },
                { law: 'IRS Requirements', status: 'compliant', description: 'Tax reporting and payroll compliance' },
                { law: 'State Tax Laws', status: 'compliant', description: 'Multi-state tax withholding' },
                { law: 'GAAP Standards', status: 'compliant', description: 'Generally Accepted Accounting Principles' }
            ]
        },
        {
            category: 'Industry Specific',
            items: [
                { law: 'ITAR', status: 'compliant', description: 'International Traffic in Arms Regulations' },
                { law: 'EAR', status: 'compliant', description: 'Export Administration Regulations' },
                { law: 'Automotive Security', status: 'compliant', description: 'Client-specific security requirements' },
                { law: 'ISO 27001', status: 'in-progress', description: 'Information security management' }
            ]
        },
        {
            category: 'Background Checks',
            items: [
                { law: 'FCRA', status: 'compliant', description: 'Fair Credit Reporting Act compliance' },
                { law: 'State Background Laws', status: 'compliant', description: 'Multi-state background check laws' },
                { law: 'Drug Testing Laws', status: 'compliant', description: 'DOT and state drug testing requirements' },
                { law: 'Ban the Box', status: 'compliant', description: 'Fair chance employment practices' }
            ]
        }
    ];
    const getStatusColor = (status) => {
        switch (status) {
            case 'compliant': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'in-progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'needs-attention': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'compliant': return _jsx(CheckCircle, { className: "w-4 h-4" });
            case 'in-progress': return _jsx(Clock, { className: "w-4 h-4" });
            case 'needs-attention': return _jsx(AlertTriangle, { className: "w-4 h-4" });
            default: return _jsx(AlertTriangle, { className: "w-4 h-4" });
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "mb-12", children: [_jsxs(Link, { href: "/", className: "inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Back to Dashboard"] }), _jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-3 bg-blue-500/20 rounded-lg", children: _jsx(Scale, { className: "w-8 h-8 text-blue-400" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-white", children: "Legal Compliance Dashboard" }), _jsx("p", { className: "text-slate-400", children: "Comprehensive legal and regulatory compliance overview" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsxs("div", { className: "bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-400", children: "98%" }), _jsx("div", { className: "text-sm text-green-300", children: "Compliance Score" })] }), _jsxs("div", { className: "bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-400", children: "23" }), _jsx("div", { className: "text-sm text-blue-300", children: "Laws & Regulations" })] }), _jsxs("div", { className: "bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-purple-400", children: "0" }), _jsx("div", { className: "text-sm text-purple-300", children: "Active Violations" })] }), _jsxs("div", { className: "bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-orange-400", children: "1" }), _jsx("div", { className: "text-sm text-orange-300", children: "In Progress" })] })] })] }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "space-y-8", children: complianceItems.map((category, categoryIndex) => (_jsxs("div", { className: "bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8", children: [_jsxs("h2", { className: "text-xl font-bold text-white mb-6 flex items-center gap-2", children: [_jsx(Shield, { className: "w-6 h-6 text-blue-400" }), category.category] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: category.items.map((item, itemIndex) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: categoryIndex * 0.1 + itemIndex * 0.05 }, className: `p-4 rounded-lg border ${getStatusColor(item.status)}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h3", { className: "font-semibold text-white", children: item.law }), _jsxs("div", { className: "flex items-center gap-1", children: [getStatusIcon(item.status), _jsx("span", { className: "text-xs capitalize", children: item.status.replace('-', ' ') })] })] }), _jsx("p", { className: "text-sm opacity-90", children: item.description })] }, item.law))) })] }, category.category))) }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "mt-12 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8", children: [_jsx("h2", { className: "text-xl font-bold text-white mb-6", children: "\uD83D\uDE80 Compliance Quick Actions" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Link, { href: "/biometric-consent", className: "group", children: _jsxs("div", { className: "p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors", children: [_jsx(FileText, { className: "w-8 h-8 text-blue-400 mb-3" }), _jsx("h3", { className: "font-semibold text-white mb-2", children: "Biometric Consent" }), _jsx("p", { className: "text-blue-200 text-sm", children: "Manage biometric data consent and rights" })] }) }), _jsx(Link, { href: "/dpia", className: "group", children: _jsxs("div", { className: "p-6 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors", children: [_jsx(Database, { className: "w-8 h-8 text-green-400 mb-3" }), _jsx("h3", { className: "font-semibold text-white mb-2", children: "DPIA Report" }), _jsx("p", { className: "text-green-200 text-sm", children: "Data Protection Impact Assessment" })] }) }), _jsx(Link, { href: "/legal-contact", className: "group", children: _jsxs("div", { className: "p-6 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors", children: [_jsx(Users, { className: "w-8 h-8 text-purple-400 mb-3" }), _jsx("h3", { className: "font-semibold text-white mb-2", children: "Legal Contact" }), _jsx("p", { className: "text-purple-200 text-sm", children: "Contact legal and privacy officers" })] }) })] })] })] }) }));
}
//# sourceMappingURL=page.js.map