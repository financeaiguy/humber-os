'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Award, MapPin, FileText, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
export default function LicensingPage() {
    const stateRequirements = [
        {
            state: 'Michigan',
            required: true,
            status: 'compliant',
            licenseType: 'Private Employment Agency License',
            renewalDate: '2025-12-31',
            bondAmount: '$10,000',
            details: 'Required for all staffing agencies placing workers in Michigan'
        },
        {
            state: 'Ohio',
            required: false,
            status: 'n/a',
            licenseType: 'No specific licensing required',
            renewalDate: 'N/A',
            bondAmount: 'N/A',
            details: 'Ohio does not require specific staffing agency licensing'
        },
        {
            state: 'Indiana',
            required: true,
            status: 'compliant',
            licenseType: 'Employment Agency License',
            renewalDate: '2025-06-30',
            bondAmount: '$5,000',
            details: 'Required for placement of permanent employees'
        },
        {
            state: 'Illinois',
            required: true,
            status: 'compliant',
            licenseType: 'Private Employment Agency License',
            renewalDate: '2025-09-15',
            bondAmount: '$25,000',
            details: 'Required due to BIPA biometric data collection'
        },
        {
            state: 'Kentucky',
            required: false,
            status: 'n/a',
            licenseType: 'No specific licensing required',
            renewalDate: 'N/A',
            bondAmount: 'N/A',
            details: 'Kentucky does not require staffing agency licensing'
        },
        {
            state: 'Tennessee',
            required: true,
            status: 'pending',
            licenseType: 'Employment Agency License',
            renewalDate: '2025-03-31',
            bondAmount: '$10,000',
            details: 'Application in progress for Tennessee operations'
        }
    ];
    const getStatusColor = (status) => {
        switch (status) {
            case 'compliant': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'n/a': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'compliant': return _jsx(CheckCircle, { className: "w-4 h-4" });
            case 'pending': return _jsx(AlertTriangle, { className: "w-4 h-4" });
            case 'expired': return _jsx(AlertTriangle, { className: "w-4 h-4" });
            default: return _jsx(FileText, { className: "w-4 h-4" });
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "mb-12", children: [_jsxs(Link, { href: "/compliance", className: "inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Back to Compliance"] }), _jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-3 bg-blue-500/20 rounded-lg", children: _jsx(Award, { className: "w-8 h-8 text-blue-400" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-white", children: "Licensing & Registration" }), _jsx("p", { className: "text-slate-400", children: "State-specific staffing agency licensing and bonding requirements" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsxs("div", { className: "bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-400", children: "4" }), _jsx("div", { className: "text-sm text-green-300", children: "Licensed States" })] }), _jsxs("div", { className: "bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-400", children: "$50K" }), _jsx("div", { className: "text-sm text-blue-300", children: "Total Bond Coverage" })] }), _jsxs("div", { className: "bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-purple-400", children: "6" }), _jsx("div", { className: "text-sm text-purple-300", children: "Operating States" })] }), _jsxs("div", { className: "bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-yellow-400", children: "1" }), _jsx("div", { className: "text-sm text-yellow-300", children: "Pending Application" })] })] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 mb-8", children: [_jsxs("h2", { className: "text-2xl font-bold text-white mb-6 flex items-center gap-2", children: [_jsx(MapPin, { className: "w-6 h-6 text-green-400" }), "State-by-State Licensing Status"] }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: stateRequirements.map((state, index) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.1 }, className: `p-6 rounded-lg border ${getStatusColor(state.status)}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: state.state }), _jsxs("div", { className: "flex items-center gap-2", children: [getStatusIcon(state.status), _jsx("span", { className: "text-sm capitalize", children: state.status.replace('-', ' ') })] })] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-400", children: "License Type:" }), _jsx("span", { className: "text-white", children: state.licenseType })] }), state.renewalDate !== 'N/A' && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-400", children: "Renewal Date:" }), _jsx("span", { className: "text-white", children: state.renewalDate })] })), state.bondAmount !== 'N/A' && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-400", children: "Bond Amount:" }), _jsx("span", { className: "text-white", children: state.bondAmount })] })), _jsx("p", { className: "text-slate-300 text-xs mt-3 italic", children: state.details })] })] }, state.state))) })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 mb-8", children: [_jsxs("h2", { className: "text-2xl font-bold text-white mb-6 flex items-center gap-2", children: [_jsx(Shield, { className: "w-6 h-6 text-blue-400" }), "Insurance & Liability Coverage"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-blue-500/10 border border-blue-500/20 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-blue-400 mb-3", children: "\uD83C\uDFE5 Required Coverage" }), _jsxs("ul", { className: "text-blue-200 space-y-2 text-sm", children: [_jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Workers' Compensation:" }), " $2M per occurrence, all states"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "General Liability:" }), " $2M per occurrence, $4M aggregate"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Professional Liability:" }), " $1M per claim, $3M aggregate"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Employment Practices:" }), " $1M per claim (EPLI)"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Cyber Liability:" }), " $5M for data breaches and cyber attacks"] })] })] }), _jsxs("div", { className: "bg-green-500/10 border border-green-500/20 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-green-400 mb-3", children: "\uD83D\uDCBC Additional Coverage" }), _jsxs("ul", { className: "text-green-200 space-y-2 text-sm", children: [_jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Errors & Omissions:" }), " $1M for placement mistakes"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Fidelity Bond:" }), " $100K for employee dishonesty"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Auto Liability:" }), " $1M for business vehicle use"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Umbrella Policy:" }), " $10M excess coverage"] })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-purple-500/10 border border-purple-500/20 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-purple-400 mb-3", children: "\u2696\uFE0F Joint Employment Protection" }), _jsxs("ul", { className: "text-purple-200 space-y-2 text-sm", children: [_jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Shared FMLA Liability:" }), " Coverage for family leave obligations"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Wage & Hour Claims:" }), " Protection against overtime disputes"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Discrimination Claims:" }), " Coverage for EEO violations"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Client Indemnification:" }), " Protection for client liability"] })] })] }), _jsxs("div", { className: "bg-orange-500/10 border border-orange-500/20 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-orange-400 mb-3", children: "\uD83D\uDD10 Biometric-Specific Coverage" }), _jsxs("ul", { className: "text-orange-200 space-y-2 text-sm", children: [_jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "BIPA Violation Claims:" }), " $5M coverage for biometric privacy violations"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Data Breach Response:" }), " $2M for breach notification and remediation"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Privacy Law Violations:" }), " Coverage for GDPR, CCPA fines"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "Technology E&O:" }), " Coverage for biometric system failures"] })] })] })] })] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8", children: [_jsxs("h2", { className: "text-2xl font-bold text-white mb-6 flex items-center gap-2", children: [_jsx(FileText, { className: "w-6 h-6 text-purple-400" }), "Worker Classification Compliance"] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-yellow-400 mb-3", children: "\u26A0\uFE0F ABC Test Compliance" }), _jsx("p", { className: "text-yellow-200 text-sm mb-4", children: "For states using the ABC Test (California, Massachusetts, New Jersey), all three criteria must be met for independent contractor classification:" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-slate-700/30 rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold text-white mb-2", children: "A - Control" }), _jsx("p", { className: "text-yellow-200 text-xs", children: "Worker is free from control and direction in performing work, both under contract and in fact." })] }), _jsxs("div", { className: "bg-slate-700/30 rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold text-white mb-2", children: "B - Business" }), _jsx("p", { className: "text-yellow-200 text-xs", children: "Work performed is outside the usual course of the hiring entity's business." })] }), _jsxs("div", { className: "bg-slate-700/30 rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold text-white mb-2", children: "C - Custom" }), _jsx("p", { className: "text-yellow-200 text-xs", children: "Worker is customarily engaged in an independently established trade, occupation, or business." })] })] })] }), _jsxs("div", { className: "bg-blue-500/10 border border-blue-500/20 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-blue-400 mb-3", children: "\uD83D\uDCCB Humber Operations Classification" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-white mb-2", children: "W-2 Employees (Recommended)" }), _jsxs("ul", { className: "text-blue-200 text-sm space-y-1", children: [_jsx("li", { children: "\u2022 All engineers classified as W-2 employees" }), _jsx("li", { children: "\u2022 Full benefits and workers' compensation coverage" }), _jsx("li", { children: "\u2022 Payroll taxes handled by Humber Operations" }), _jsx("li", { children: "\u2022 FLSA overtime protection provided" }), _jsx("li", { children: "\u2022 Reduced misclassification risk" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-white mb-2", children: "1099 Contractors (Limited Use)" }), _jsxs("ul", { className: "text-blue-200 text-sm space-y-1", children: [_jsx("li", { children: "\u2022 Only for specialized consulting projects" }), _jsx("li", { children: "\u2022 Must meet strict ABC test criteria" }), _jsx("li", { children: "\u2022 Independent business entity required" }), _jsx("li", { children: "\u2022 No direct client supervision" }), _jsx("li", { children: "\u2022 Quarterly classification review required" })] })] })] })] })] })] })] }) }));
}
//# sourceMappingURL=page.js.map