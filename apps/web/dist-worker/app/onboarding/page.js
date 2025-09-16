'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, CheckCircle, Clock, AlertCircle, FileCheck, Shield, Briefcase, GraduationCap, Heart, Car, Users, Building, TrendingUp, ChevronRight, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
const NewOnboardingModal = dynamic(() => import('@/components/onboarding/NewOnboardingModal'), { ssr: false });
const RoleBasedOnboardingModal = dynamic(() => import('@/components/onboarding/RoleBasedOnboardingModal'), { ssr: false });
const CustomerOnboardingFlow = dynamic(() => import('@/components/onboarding/CustomerOnboardingFlow'), { ssr: false });
import { OnboardingTracker } from '@/components/onboarding/OnboardingTrackerWrapper';
const onboardingQueue = [
    {
        id: 1,
        name: 'Michael Chen',
        role: 'Senior Mechanical Engineer',
        startDate: '2025-01-20',
        status: 'in_progress',
        currentStep: 'Documentation',
        completedSteps: 3,
        totalSteps: 8,
        recruiter: 'TechTalent Global',
        location: 'Detroit, MI',
        priority: 'high',
        documentsCompleted: ['I-9', 'W-4', 'Direct Deposit'],
        documentsPending: ['NDA', 'Equipment Agreement', 'Handbook Acknowledgment']
    },
    {
        id: 2,
        name: 'Sarah Johnson',
        role: 'Controls Engineer',
        startDate: '2025-01-22',
        status: 'pending',
        currentStep: 'Background Check',
        completedSteps: 2,
        totalSteps: 8,
        recruiter: 'Engineering Elite',
        location: 'Chicago, IL',
        priority: 'medium',
        documentsCompleted: ['I-9', 'W-4'],
        documentsPending: ['Direct Deposit', 'NDA', 'Equipment Agreement']
    },
    {
        id: 3,
        name: 'David Kim',
        role: 'Software Engineer',
        startDate: '2025-01-25',
        status: 'scheduled',
        currentStep: 'Offer Accepted',
        completedSteps: 1,
        totalSteps: 8,
        recruiter: 'TechTalent Global',
        location: 'Remote',
        priority: 'normal',
        documentsCompleted: ['Offer Letter'],
        documentsPending: ['I-9', 'W-4', 'Direct Deposit', 'NDA']
    }
];
const onboardingSteps = [
    { step: 'Offer Accepted', icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
    { step: 'Background Check', icon: Shield, color: 'from-blue-500 to-indigo-500' },
    { step: 'Documentation', icon: FileCheck, color: 'from-purple-500 to-pink-500' },
    { step: 'IT Setup', icon: Building, color: 'from-orange-500 to-red-500' },
    { step: 'Training Scheduled', icon: GraduationCap, color: 'from-cyan-500 to-blue-500' },
    { step: 'Benefits Enrollment', icon: Heart, color: 'from-pink-500 to-rose-500' },
    { step: 'Equipment Assigned', icon: Briefcase, color: 'from-yellow-500 to-orange-500' },
    { step: 'First Day Ready', icon: UserPlus, color: 'from-green-500 to-teal-500' }
];
const benefitsPackages = [
    {
        type: 'Health Insurance',
        icon: Heart,
        options: ['PPO', 'HMO', 'HSA'],
        enrollment: 85,
        deadline: '30 days from start'
    },
    {
        type: '401(k) Retirement',
        icon: TrendingUp,
        options: ['3% Match', 'Roth Option'],
        enrollment: 72,
        deadline: 'Immediate eligibility'
    },
    {
        type: 'Life Insurance',
        icon: Shield,
        options: ['2x Salary', 'Additional Coverage'],
        enrollment: 90,
        deadline: '60 days from start'
    },
    {
        type: 'Transportation',
        icon: Car,
        options: ['Company Vehicle', 'Mileage Reimbursement'],
        enrollment: 45,
        deadline: 'As needed'
    }
];
const complianceChecklist = [
    { item: 'I-9 Employment Verification', category: 'Legal', required: true, automated: true },
    { item: 'E-Verify Submission', category: 'Legal', required: true, automated: true },
    { item: 'W-4 Tax Withholding', category: 'Tax', required: true, automated: false },
    { item: 'State Tax Forms', category: 'Tax', required: true, automated: false },
    { item: 'Background Check Consent', category: 'Security', required: true, automated: true },
    { item: 'Drug Screening', category: 'Security', required: false, automated: false },
    { item: 'NDA Agreement', category: 'Legal', required: true, automated: true },
    { item: 'IT Security Training', category: 'Training', required: true, automated: true }
];
const getStatusColor = (status) => {
    switch (status) {
        case 'in_progress': return 'bg-yellow-500/20 text-yellow-400';
        case 'pending': return 'bg-blue-500/20 text-blue-400';
        case 'scheduled': return 'bg-purple-500/20 text-purple-400';
        case 'completed': return 'bg-green-500/20 text-green-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
};
const getPriorityColor = (priority) => {
    switch (priority) {
        case 'high': return 'text-red-400';
        case 'medium': return 'text-yellow-400';
        case 'normal': return 'text-green-400';
        default: return 'text-gray-400';
    }
};
export default function OnboardingPage() {
    const [showNewOnboardingModal, setShowNewOnboardingModal] = useState(false);
    const [showRoleBasedModal, setShowRoleBasedModal] = useState(false);
    const [showCustomerOnboarding, setShowCustomerOnboarding] = useState(false);
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-white mb-2", children: "Employee Onboarding" }), _jsx("p", { className: "text-slate-400", children: "Manage new hire onboarding, documentation, and compliance requirements." })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("button", { onClick: () => setShowCustomerOnboarding(true), className: "px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center space-x-2", children: [_jsx(Building, { className: "h-5 w-5" }), _jsx("span", { children: "Customer Onboarding" })] }), _jsxs("button", { onClick: () => setShowRoleBasedModal(true), className: "px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center space-x-2", children: [_jsx(Users, { className: "h-5 w-5" }), _jsx("span", { children: "Role-Based Onboarding" })] }), _jsxs("button", { onClick: () => setShowNewOnboardingModal(true), className: "px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2", children: [_jsx(Plus, { className: "h-5 w-5" }), _jsx("span", { children: "Employee Onboarding" })] })] })] }), _jsx(OnboardingTracker, {}), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Active Onboarding" }), _jsx("p", { className: "text-2xl font-bold text-white mt-1", children: onboardingQueue.filter(e => e.status === 'in_progress').length })] }), _jsx(UserPlus, { className: "h-8 w-8 text-blue-400" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Pending Start" }), _jsx("p", { className: "text-2xl font-bold text-white mt-1", children: onboardingQueue.filter(e => e.status === 'pending' || e.status === 'scheduled').length })] }), _jsx(Clock, { className: "h-8 w-8 text-purple-400" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Avg Completion" }), _jsxs("p", { className: "text-2xl font-bold text-white mt-1", children: [Math.round(onboardingQueue.reduce((sum, e) => sum + (e.completedSteps / e.totalSteps * 100), 0) / onboardingQueue.length), "%"] })] }), _jsx(CheckCircle, { className: "h-8 w-8 text-green-400" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Compliance Rate" }), _jsx("p", { className: "text-2xl font-bold text-white mt-1", children: "98%" })] }), _jsx(Shield, { className: "h-8 w-8 text-red-400" })] }) })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-white mb-4", children: "Onboarding Pipeline" }), _jsx("div", { className: "flex items-center space-x-2 overflow-x-auto pb-2", children: onboardingSteps.map((step, index) => (_jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "flex flex-col items-center min-w-[100px]", children: [_jsx("div", { className: `h-12 w-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center mb-2`, children: _jsx(step.icon, { className: "h-6 w-6 text-white" }) }), _jsx("p", { className: "text-xs text-slate-400 text-center", children: step.step })] }), index < onboardingSteps.length - 1 && (_jsx(ChevronRight, { className: "h-4 w-4 text-slate-600 mx-2" }))] }, index))) })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-white mb-4", children: "Active Onboarding" }), _jsx("div", { className: "space-y-4", children: onboardingQueue.map((employee, index) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.1 }, className: "rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600 transition-all duration-300", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold", children: employee.name.split(' ').map(n => n[0]).join('') }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-white text-lg", children: employee.name }), _jsx("p", { className: "text-sm text-slate-400", children: employee.role }), _jsxs("div", { className: "flex items-center space-x-4 mt-1", children: [_jsxs("span", { className: "text-xs text-slate-500", children: ["Start: ", employee.startDate] }), _jsxs("span", { className: "text-xs text-slate-500", children: ["Location: ", employee.location] }), _jsxs("span", { className: `text-xs ${getPriorityColor(employee.priority)}`, children: ["Priority: ", employee.priority] })] })] })] }), _jsx("span", { className: `px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`, children: employee.status.replace('_', ' ') })] }), _jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("span", { className: "text-sm text-slate-400", children: ["Current: ", employee.currentStep] }), _jsxs("span", { className: "text-sm text-slate-400", children: [employee.completedSteps, "/", employee.totalSteps, " Steps"] })] }), _jsx("div", { className: "w-full bg-slate-700 rounded-full h-2", children: _jsx("div", { className: "bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500", style: { width: `${(employee.completedSteps / employee.totalSteps) * 100}%` } }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { className: "bg-slate-900/50 rounded-lg p-3", children: [_jsx("p", { className: "text-xs text-slate-500 mb-2", children: "Completed Documents" }), _jsx("div", { className: "space-y-1", children: employee.documentsCompleted.map((doc, i) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "h-3 w-3 text-green-400" }), _jsx("span", { className: "text-xs text-slate-300", children: doc })] }, i))) })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-lg p-3", children: [_jsx("p", { className: "text-xs text-slate-500 mb-2", children: "Pending Documents" }), _jsx("div", { className: "space-y-1", children: employee.documentsPending.map((doc, i) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(AlertCircle, { className: "h-3 w-3 text-yellow-400" }), _jsx("span", { className: "text-xs text-slate-300", children: doc })] }, i))) })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-xs text-slate-500", children: ["Recruiter: ", employee.recruiter] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { className: "px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors", children: "View Details" }), _jsx("button", { className: "px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors", children: "Complete Step" })] })] })] }, employee.id))) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.5 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Benefits Enrollment" }), _jsx("div", { className: "space-y-3", children: benefitsPackages.map((benefit, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-slate-900/50 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(benefit.icon, { className: "h-5 w-5 text-blue-400" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-white", children: benefit.type }), _jsx("p", { className: "text-xs text-slate-400", children: benefit.options.join(', ') })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-sm font-semibold text-white", children: [benefit.enrollment, "%"] }), _jsx("p", { className: "text-xs text-slate-500", children: benefit.deadline })] })] }, index))) })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.6 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "Compliance Checklist" }), _jsx("div", { className: "space-y-2", children: complianceChecklist.map((item, index) => (_jsxs("div", { className: "flex items-center justify-between p-2 hover:bg-slate-900/50 rounded transition-colors", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `h-5 w-5 rounded ${item.required ? 'bg-red-500/20' : 'bg-slate-700'} flex items-center justify-center`, children: item.required && _jsx("div", { className: "h-2 w-2 bg-red-400 rounded-full" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-white", children: item.item }), _jsx("p", { className: "text-xs text-slate-500", children: item.category })] })] }), item.automated && (_jsx("span", { className: "px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs", children: "Automated" }))] }, index))) })] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.7 }, className: "flex justify-center space-x-4", children: [_jsxs("button", { onClick: () => window.open('/onboarding/new', '_blank'), className: "px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2", children: [_jsx(UserPlus, { className: "h-5 w-5" }), _jsx("span", { children: "Start New Onboarding" })] }), _jsxs("button", { className: "px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-all duration-300 flex items-center space-x-2", children: [_jsx(FileCheck, { className: "h-5 w-5" }), _jsx("span", { children: "Compliance Report" })] })] })] }), _jsx(NewOnboardingModal, { isOpen: showNewOnboardingModal, onClose: () => setShowNewOnboardingModal(false), recruitId: "example_recruit_123" }), _jsx(CustomerOnboardingFlow, { isOpen: showCustomerOnboarding, onClose: () => setShowCustomerOnboarding(false), onComplete: (customerData) => {
                    console.log('Customer onboarding completed:', customerData);
                    alert(`Welcome ${customerData.companyName}! Your account has been created. You can now purchase engineer time from our bull pen.`);
                } }), _jsx(RoleBasedOnboardingModal, { isOpen: showRoleBasedModal, onClose: () => setShowRoleBasedModal(false) })] }));
}
//# sourceMappingURL=page.js.map