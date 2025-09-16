'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Users, Scale, AlertTriangle, Shield, FileText } from 'lucide-react';
export default function JointEmploymentPage() {
    const jointEmploymentFactors = [
        {
            factor: 'Supervision and Control',
            humberRole: 'Recruitment, placement, payroll, performance management',
            clientRole: 'Day-to-day work direction, task assignment, safety oversight',
            riskLevel: 'High',
            mitigation: 'Clear contract delineation of supervisory responsibilities'
        },
        {
            factor: 'Payment and Benefits',
            humberRole: 'Salary, benefits, workers comp, payroll taxes',
            clientRole: 'Project bonuses, overtime approval, expense reimbursement',
            riskLevel: 'Medium',
            mitigation: 'All compensation flows through Humber Operations'
        },
        {
            factor: 'Hiring and Firing',
            humberRole: 'Recruitment, screening, hiring decisions, termination',
            clientRole: 'Project assignment, performance feedback, removal requests',
            riskLevel: 'High',
            mitigation: 'Humber retains final hiring/firing authority'
        },
        {
            factor: 'Training and Development',
            humberRole: 'Safety training, compliance training, skill development',
            clientRole: 'Job-specific training, equipment operation, procedures',
            riskLevel: 'Low',
            mitigation: 'Documented training responsibility matrix'
        }
    ];
    const liabilityAreas = [
        {
            area: 'FMLA Obligations',
            description: 'Family and Medical Leave Act responsibilities',
            humberLiability: 'Track FMLA eligibility, provide leave administration',
            clientLiability: 'Maintain job protection, coordinate with Humber on leave',
            protection: 'Joint FMLA policy with clear responsibility allocation'
        },
        {
            area: 'Wage & Hour Claims',
            description: 'FLSA overtime and minimum wage compliance',
            humberLiability: 'Accurate time tracking, overtime calculation, payroll',
            clientLiability: 'Work schedule approval, overtime authorization',
            protection: 'Biometric time tracking with client approval workflows'
        },
        {
            area: 'Discrimination Claims',
            description: 'Equal Employment Opportunity violations',
            humberLiability: 'Non-discriminatory hiring, placement policies',
            clientLiability: 'Equal treatment at work site, harassment prevention',
            protection: 'Joint EEO training and incident reporting procedures'
        },
        {
            area: 'Safety and Workers Comp',
            description: 'Workplace injury and safety compliance',
            humberLiability: 'Workers comp coverage, safety training, incident reporting',
            clientLiability: 'Safe work environment, OSHA compliance, hazard communication',
            protection: 'Comprehensive safety protocols and insurance coverage'
        }
    ];
    const getRiskColor = (level) => {
        switch (level) {
            case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "mb-12", children: [_jsxs(Link, { href: "/compliance", className: "inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Back to Compliance"] }), _jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-3 bg-blue-500/20 rounded-lg", children: _jsx(Scale, { className: "w-8 h-8 text-blue-400" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-white", children: "Joint Employment Liability" }), _jsx("p", { className: "text-slate-400", children: "Managing shared employment responsibilities with automotive clients" })] })] }), _jsx("div", { className: "bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-yellow-400 mt-1" }), _jsx("div", { children: _jsxs("p", { className: "text-yellow-200 text-sm", children: [_jsx("strong", { children: "Joint Employment Risk:" }), " When Humber Operations and automotive clients (GM, Ford, Stellantis, HIROTEC) both exercise control over engineers, both entities may be liable for employment law violations."] }) })] }) })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 mb-8", children: [_jsxs("h2", { className: "text-2xl font-bold text-white mb-6 flex items-center gap-2", children: [_jsx(Users, { className: "w-6 h-6 text-purple-400" }), "Joint Employment Factor Analysis"] }), _jsx("div", { className: "space-y-6", children: jointEmploymentFactors.map((factor, index) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.1 }, className: "bg-slate-700/30 rounded-lg p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: factor.factor }), _jsxs("div", { className: `px-3 py-1 rounded-full border text-xs ${getRiskColor(factor.riskLevel)}`, children: [factor.riskLevel, " Risk"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-blue-400 mb-2", children: "Humber Operations Role" }), _jsx("p", { className: "text-slate-300 text-sm", children: factor.humberRole })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-green-400 mb-2", children: "Client Company Role" }), _jsx("p", { className: "text-slate-300 text-sm", children: factor.clientRole })] })] }), _jsxs("div", { className: "bg-slate-800/50 rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold text-purple-400 mb-2", children: "Risk Mitigation Strategy" }), _jsx("p", { className: "text-purple-200 text-sm", children: factor.mitigation })] })] }, factor.factor))) })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 mb-8", children: [_jsxs("h2", { className: "text-2xl font-bold text-white mb-6 flex items-center gap-2", children: [_jsx(Shield, { className: "w-6 h-6 text-red-400" }), "Shared Liability Management"] }), _jsx("div", { className: "space-y-6", children: liabilityAreas.map((area, index) => (_jsxs("div", { className: "bg-slate-700/30 rounded-lg p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(Scale, { className: "w-5 h-5 text-blue-400" }), _jsx("h3", { className: "text-lg font-semibold text-white", children: area.area })] }), _jsx("p", { className: "text-slate-400 text-sm mb-4", children: area.description }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { className: "bg-blue-500/10 border border-blue-500/20 rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold text-blue-400 mb-2", children: "Humber Operations Responsibilities" }), _jsx("p", { className: "text-blue-200 text-sm", children: area.humberLiability })] }), _jsxs("div", { className: "bg-green-500/10 border border-green-500/20 rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold text-green-400 mb-2", children: "Client Company Responsibilities" }), _jsx("p", { className: "text-green-200 text-sm", children: area.clientLiability })] })] }), _jsxs("div", { className: "bg-purple-500/10 border border-purple-500/20 rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold text-purple-400 mb-2", children: "\uD83D\uDEE1\uFE0F Protection Strategy" }), _jsx("p", { className: "text-purple-200 text-sm", children: area.protection })] })] }, area.area))) })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8", children: [_jsxs("h2", { className: "text-2xl font-bold text-white mb-6 flex items-center gap-2", children: [_jsx(FileText, { className: "w-6 h-6 text-green-400" }), "Contractual Protections"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-green-500/10 border border-green-500/20 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-green-400 mb-3", children: "\uD83D\uDCCB Standard Contract Clauses" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("ul", { className: "text-green-200 space-y-2 text-sm", children: [_jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Indemnification:" }), " Client indemnifies Humber for workplace injuries"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Insurance Requirements:" }), " Client maintains minimum $2M liability coverage"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Safety Compliance:" }), " Client warrants OSHA-compliant workplace"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Supervision Limits:" }), " Clear boundaries on client supervisory authority"] })] }), _jsxs("ul", { className: "text-green-200 space-y-2 text-sm", children: [_jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Wage & Hour:" }), " Client pre-approves all overtime and schedule changes"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Discrimination:" }), " Joint commitment to EEO compliance"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Termination:" }), " Humber retains sole termination authority"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Data Protection:" }), " Client protects engineer personal information"] })] })] })] }), _jsxs("div", { className: "bg-blue-500/10 border border-blue-500/20 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-blue-400 mb-3", children: "\u2696\uFE0F Dispute Resolution Framework" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold", children: "1" }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-white", children: "Direct Resolution (30 days)" }), _jsx("p", { className: "text-blue-200 text-sm", children: "Humber and client work directly to resolve employment disputes" })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold", children: "2" }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-white", children: "Mediation (60 days)" }), _jsx("p", { className: "text-green-200 text-sm", children: "Neutral third-party mediation for complex disputes" })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold", children: "3" }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-white", children: "Arbitration (90 days)" }), _jsx("p", { className: "text-purple-200 text-sm", children: "Binding arbitration for unresolved liability issues" })] })] })] })] })] })] })] }) }));
}
//# sourceMappingURL=page.js.map