'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserSearch, Target, Briefcase, Globe, DollarSign, FileText, Shield, Award, Clock, Users, UserPlus, ArrowRight, CheckCircle } from 'lucide-react';
import NewRecruitModal from '@/components/recruiting/NewRecruitModal';
import { recruitsApi } from '@/lib/api/recruits';
const recruitmentAgencies = [
    {
        id: 1,
        agency: 'TechTalent Global',
        type: 'Technical Recruiting',
        specialization: ['Software Engineers', 'Controls Engineers', 'Robotics'],
        contactPerson: 'Sarah Mitchell',
        email: 'sarah@techtalentglobal.com',
        phone: '+1 (555) 123-4567',
        location: 'Detroit, MI',
        status: 'active',
        currentPipeline: 12,
        placementRate: 78,
        avgTimeToFill: 21,
        commission: '20%',
        contractType: 'Exclusive',
        certifications: ['ISO 9001', 'SHRM Certified'],
        rating: 4.8
    },
    {
        id: 2,
        agency: 'Engineering Elite',
        type: 'Engineering Specialists',
        specialization: ['Mechanical Engineers', 'Electrical Engineers'],
        contactPerson: 'Michael Chen',
        email: 'mchen@engineeringelite.com',
        phone: '+1 (555) 234-5678',
        location: 'Chicago, IL',
        status: 'active',
        currentPipeline: 8,
        placementRate: 82,
        avgTimeToFill: 18,
        commission: '18%',
        contractType: 'Preferred',
        certifications: ['ASA Certified', 'AIRS CIR'],
        rating: 4.9
    },
    {
        id: 3,
        agency: 'Industrial Staffing Pro',
        type: 'Industrial & Manufacturing',
        specialization: ['Piping Engineers', 'Process Engineers', 'Safety Engineers'],
        contactPerson: 'Emily Rodriguez',
        email: 'emily@industrialstaffing.com',
        phone: '+1 (555) 345-6789',
        location: 'Houston, TX',
        status: 'pending',
        currentPipeline: 5,
        placementRate: 75,
        avgTimeToFill: 24,
        commission: '22%',
        contractType: 'Non-Exclusive',
        certifications: ['NAPS Member'],
        rating: 4.5
    }
];
const recruitmentProtocols = [
    {
        id: 1,
        title: 'Immigration Compliance',
        type: 'Legal',
        description: 'H1-B visa sponsorship and work authorization verification',
        requirements: ['I-9 Verification', 'E-Verify', 'Visa Status Check'],
        automationLevel: 85,
        lastUpdated: '2025-01-10'
    },
    {
        id: 2,
        title: 'Tax & Payroll Setup',
        type: 'Financial',
        description: 'W-4 processing, state tax registration, and payroll integration',
        requirements: ['W-4 Form', 'State Tax Forms', 'Direct Deposit Setup'],
        automationLevel: 90,
        lastUpdated: '2025-01-08'
    },
    {
        id: 3,
        title: 'Background Screening',
        type: 'Security',
        description: 'Criminal background checks, reference verification, and security clearance',
        requirements: ['Criminal Check', 'Employment Verification', 'Education Verification'],
        automationLevel: 75,
        lastUpdated: '2025-01-12'
    },
    {
        id: 4,
        title: 'Technical Assessment',
        type: 'Skills',
        description: 'Skills testing, certification verification, and technical interviews',
        requirements: ['Coding Test', 'Certification Check', 'Portfolio Review'],
        automationLevel: 60,
        lastUpdated: '2025-01-05'
    }
];
const candidatePipeline = [
    { stage: 'Sourced', count: 45, color: 'from-blue-500 to-cyan-500' },
    { stage: 'Screened', count: 32, color: 'from-purple-500 to-pink-500' },
    { stage: 'Interviewed', count: 18, color: 'from-orange-500 to-yellow-500' },
    { stage: 'Offer Extended', count: 8, color: 'from-green-500 to-emerald-500' },
    { stage: 'Accepted', count: 6, color: 'from-indigo-500 to-purple-500' }
];
const getStatusColor = (status) => {
    switch (status) {
        case 'active': return 'bg-green-500/20 text-green-400';
        case 'pending': return 'bg-yellow-500/20 text-yellow-400';
        case 'inactive': return 'bg-red-500/20 text-red-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
};
const getProtocolTypeColor = (type) => {
    switch (type) {
        case 'Legal': return 'from-blue-500 to-indigo-500';
        case 'Financial': return 'from-green-500 to-emerald-500';
        case 'Security': return 'from-red-500 to-orange-500';
        case 'Skills': return 'from-purple-500 to-pink-500';
        default: return 'from-gray-500 to-slate-500';
    }
};
export default function RecruitsPage() {
    const [showNewRecruitModal, setShowNewRecruitModal] = useState(false);
    const [recruits, setRecruits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [movingToOnboarding, setMovingToOnboarding] = useState(null);
    useEffect(() => {
        fetchRecruits();
    }, []);
    const fetchRecruits = async () => {
        try {
            setIsLoading(true);
            const response = await recruitsApi.getRecruits({ limit: 20 });
            setRecruits(response.recruits || []);
        }
        catch (error) {
            console.error('Error fetching recruits:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleMoveToOnboarding = async (recruitId) => {
        try {
            setMovingToOnboarding(recruitId);
            await recruitsApi.moveToOnboarding(recruitId);
            setRecruits(prev => prev.map(recruit => recruit.id === recruitId
                ? { ...recruit, status: 'onboarding' }
                : recruit));
            alert('Recruit successfully moved to onboarding!');
        }
        catch (error) {
            console.error('Error moving recruit to onboarding:', error);
            alert('Failed to move recruit to onboarding. Please try again.');
        }
        finally {
            setMovingToOnboarding(null);
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'sourced': return 'bg-blue-500/20 text-blue-400';
            case 'screened': return 'bg-purple-500/20 text-purple-400';
            case 'interviewed': return 'bg-orange-500/20 text-orange-400';
            case 'offer_extended': return 'bg-yellow-500/20 text-yellow-400';
            case 'accepted': return 'bg-green-500/20 text-green-400';
            case 'rejected': return 'bg-red-500/20 text-red-400';
            case 'onboarding': return 'bg-indigo-500/20 text-indigo-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-white mb-2", children: "Recruitment Management" }), _jsx("p", { className: "text-slate-400", children: "Manage headhunter partnerships, recruitment protocols, and candidate pipeline." })] }), _jsx("div", { className: "flex items-center space-x-3", children: _jsxs("button", { onClick: () => setShowNewRecruitModal(true), className: "px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center space-x-2", children: [_jsx(UserPlus, { className: "h-5 w-5" }), _jsx("span", { children: "Add New Recruit" })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-6", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Active Agencies" }), _jsx("p", { className: "text-2xl font-bold text-white mt-1", children: recruitmentAgencies.filter(a => a.status === 'active').length })] }), _jsx(Briefcase, { className: "h-8 w-8 text-blue-400" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Total Pipeline" }), _jsx("p", { className: "text-2xl font-bold text-white mt-1", children: candidatePipeline.reduce((sum, stage) => sum + stage.count, 0) })] }), _jsx(UserSearch, { className: "h-8 w-8 text-purple-400" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Avg Placement Rate" }), _jsxs("p", { className: "text-2xl font-bold text-white mt-1", children: [Math.round(recruitmentAgencies.reduce((sum, a) => sum + a.placementRate, 0) / recruitmentAgencies.length), "%"] })] }), _jsx(Target, { className: "h-8 w-8 text-green-400" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Avg Time to Fill" }), _jsxs("p", { className: "text-2xl font-bold text-white mt-1", children: [Math.round(recruitmentAgencies.reduce((sum, a) => sum + a.avgTimeToFill, 0) / recruitmentAgencies.length), " days"] })] }), _jsx(Clock, { className: "h-8 w-8 text-orange-400" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Active Protocols" }), _jsx("p", { className: "text-2xl font-bold text-white mt-1", children: recruitmentProtocols.length })] }), _jsx(Shield, { className: "h-8 w-8 text-red-400" })] }) })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.5 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-white mb-4", children: "Candidate Pipeline" }), _jsx("div", { className: "flex items-center space-x-2 overflow-x-auto pb-2", children: candidatePipeline.map((stage, index) => (_jsxs("div", { className: "flex-1 min-w-[120px]", children: [_jsxs("div", { className: `h-24 rounded-lg bg-gradient-to-r ${stage.color} p-3 flex flex-col justify-between`, children: [_jsx("p", { className: "text-xs font-medium text-white/90", children: stage.stage }), _jsx("p", { className: "text-2xl font-bold text-white", children: stage.count })] }), index < candidatePipeline.length - 1 && (_jsx("div", { className: "flex justify-center mt-2", children: _jsx("div", { className: "w-8 h-0.5 bg-slate-600" }) }))] }, index))) })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-white mb-4", children: "Recruitment Protocols & Standards" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: recruitmentProtocols.map((protocol, index) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.1 }, className: "rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4 hover:border-slate-600 transition-all duration-300", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: `h-10 w-10 rounded-lg bg-gradient-to-r ${getProtocolTypeColor(protocol.type)} flex items-center justify-center`, children: [protocol.type === 'Legal' && _jsx(Shield, { className: "h-5 w-5 text-white" }), protocol.type === 'Financial' && _jsx(DollarSign, { className: "h-5 w-5 text-white" }), protocol.type === 'Security' && _jsx(Shield, { className: "h-5 w-5 text-white" }), protocol.type === 'Skills' && _jsx(Award, { className: "h-5 w-5 text-white" })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-white", children: protocol.title }), _jsx("p", { className: "text-xs text-slate-400", children: protocol.type })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-xs text-slate-500", children: "Automation" }), _jsxs("p", { className: "text-sm font-semibold text-white", children: [protocol.automationLevel, "%"] })] })] }), _jsx("p", { className: "text-sm text-slate-400 mb-3", children: protocol.description }), _jsx("div", { className: "flex flex-wrap gap-2 mb-3", children: protocol.requirements.map((req, i) => (_jsx("span", { className: "px-2 py-1 bg-slate-900/50 rounded text-xs text-slate-300", children: req }, i))) }), _jsxs("div", { className: "flex items-center justify-between text-xs text-slate-500", children: [_jsxs("span", { children: ["Last updated: ", protocol.lastUpdated] }), _jsx("button", { className: "text-blue-400 hover:text-blue-300 transition-colors", children: "Edit Protocol" })] })] }, protocol.id))) })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-white mb-4", children: "Current Recruits" }), isLoading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" }) })) : (_jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: recruits.map((recruit, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600 transition-all duration-300", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "font-semibold text-white text-lg", children: [recruit.firstName, " ", recruit.lastName] }), _jsx("p", { className: "text-sm text-slate-400", children: recruit.jobTitle }), _jsxs("p", { className: "text-xs text-slate-500", children: [recruit.yearsExperience, " years experience"] })] }), _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(recruit.status || '')}`, children: recruit.status ? recruit.status.replace('_', ' ') : 'Unknown' })] }), _jsxs("div", { className: "space-y-2 mb-4", children: [_jsxs("div", { className: "flex items-center space-x-2 text-sm text-slate-400", children: [_jsx(Users, { className: "h-4 w-4" }), _jsx("span", { children: recruit.email })] }), _jsxs("div", { className: "flex items-center space-x-2 text-sm text-slate-400", children: [_jsx(Globe, { className: "h-4 w-4" }), _jsx("span", { children: recruit.currentLocation || 'Location not specified' })] })] }), recruit.skills && recruit.skills.length > 0 && (_jsxs("div", { className: "mb-4", children: [_jsx("p", { className: "text-xs text-slate-500 mb-2", children: "Skills" }), _jsxs("div", { className: "flex flex-wrap gap-1", children: [recruit.skills.slice(0, 3).map((skill, i) => (_jsx("span", { className: "px-2 py-1 bg-slate-900/50 rounded text-xs text-slate-300", children: skill }, i))), recruit.skills.length > 3 && (_jsxs("span", { className: "px-2 py-1 bg-slate-900/50 rounded text-xs text-slate-500", children: ["+", recruit.skills.length - 3, " more"] }))] })] })), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-slate-700", children: [_jsxs("div", { className: "text-xs text-slate-500", children: ["Added: ", new Date(recruit.createdAt).toLocaleDateString()] }), recruit.status === 'accepted' && (_jsx("button", { onClick: () => handleMoveToOnboarding(recruit.id), disabled: movingToOnboarding === recruit.id, className: "px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed", children: movingToOnboarding === recruit.id ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-3 w-3 border-b border-white" }), _jsx("span", { children: "Moving..." })] })) : (_jsxs(_Fragment, { children: [_jsx(ArrowRight, { className: "h-4 w-4" }), _jsx("span", { children: "Move to Onboarding" })] })) })), recruit.status === 'onboarding' && (_jsxs("div", { className: "flex items-center space-x-2 text-green-400 text-sm", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx("span", { children: "In Onboarding" })] }))] })] }, recruit.id))) })), !isLoading && recruits.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx(Users, { className: "h-12 w-12 text-slate-600 mx-auto mb-4" }), _jsx("p", { className: "text-slate-400 mb-2", children: "No recruits found" }), _jsx("p", { className: "text-slate-500 text-sm", children: "Add your first recruit to get started" })] }))] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-white mb-4", children: "Headhunter Partnerships" }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6", children: recruitmentAgencies.map((agency, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600 transition-all duration-300", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-white text-lg", children: agency.agency }), _jsx("p", { className: "text-sm text-slate-400", children: agency.type })] }), _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agency.status)}`, children: agency.status })] }), _jsxs("div", { className: "mb-4", children: [_jsx("p", { className: "text-xs text-slate-500 mb-2", children: "Specializations" }), _jsx("div", { className: "flex flex-wrap gap-1", children: agency.specialization.map((spec, i) => (_jsx("span", { className: "px-2 py-1 bg-slate-900/50 rounded text-xs text-slate-300", children: spec }, i))) })] }), _jsxs("div", { className: "space-y-2 mb-4", children: [_jsxs("div", { className: "flex items-center space-x-2 text-sm text-slate-400", children: [_jsx(Users, { className: "h-4 w-4" }), _jsx("span", { children: agency.contactPerson })] }), _jsxs("div", { className: "flex items-center space-x-2 text-sm text-slate-400", children: [_jsx(Globe, { className: "h-4 w-4" }), _jsx("span", { children: agency.location })] })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-lg p-3 mb-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-xs text-slate-500", children: "Contract Type" }), _jsx("span", { className: "text-sm font-medium text-white", children: agency.contractType })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-xs text-slate-500", children: "Commission" }), _jsx("span", { className: "text-sm font-medium text-white", children: agency.commission })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4 pt-4 border-t border-slate-700", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-lg font-bold text-white", children: agency.currentPipeline }), _jsx("p", { className: "text-xs text-slate-400", children: "Pipeline" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("p", { className: "text-lg font-bold text-white", children: [agency.placementRate, "%"] }), _jsx("p", { className: "text-xs text-slate-400", children: "Placement" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("p", { className: "text-lg font-bold text-white", children: [agency.avgTimeToFill, "d"] }), _jsx("p", { className: "text-xs text-slate-400", children: "Avg Fill" })] })] })] }, agency.id))) })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.6 }, className: "flex justify-center space-x-4", children: [_jsxs("button", { className: "px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2", children: [_jsx(Briefcase, { className: "h-5 w-5" }), _jsx("span", { children: "Add New Agency" })] }), _jsxs("button", { className: "px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-all duration-300 flex items-center space-x-2", children: [_jsx(FileText, { className: "h-5 w-5" }), _jsx("span", { children: "Create Protocol" })] })] })] }), _jsx(NewRecruitModal, { isOpen: showNewRecruitModal, onClose: () => setShowNewRecruitModal(false), onRecruitAdded: fetchRecruits })] }));
}
//# sourceMappingURL=page.js.map