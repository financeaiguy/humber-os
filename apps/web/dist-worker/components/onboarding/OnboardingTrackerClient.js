'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, User, Clock, FileText, Shield, Globe, CheckCircle, Loader2, Search, RefreshCw, Bell } from 'lucide-react';
import { useSession } from '@/components/session-context';
import { CandidateDetailsModal } from './CandidateDetailsModal';
import { useRealTimeOnboarding } from '@/hooks/useRealTimeOnboarding';
const statusConfig = {
    vetting: { label: 'Vetting', icon: Shield, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    offer_letter: { label: 'Offer Letter', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    legal: { label: 'Legal Review', icon: Shield, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    immigration: { label: 'Immigration', icon: Globe, color: 'text-green-400', bg: 'bg-green-400/10' },
    final_review: { label: 'Final Review', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    completed: { label: 'Completed', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
};
export function OnboardingTrackerClient() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState('list');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [mounted, setMounted] = useState(false);
    const userRole = session?.user?.role;
    const isEngineer = userRole === 'ENGINEER_EMPLOYEE';
    const isOperator = userRole === 'PARTNER_OPERATOR' || userRole === 'PARTNER_ADMIN';
    const isCustomer = userRole === 'CUSTOMER';
    const { candidates = [], loading = true, error, lastUpdate, recentUpdates = [], statusCounts = {}, updateCandidate, refresh } = useRealTimeOnboarding({
        refreshInterval: mounted ? 30000 : 0,
        enableNotifications: mounted,
        statusFilter,
        searchTerm
    });
    useEffect(() => {
        setMounted(true);
    }, []);
    const filteredCandidates = useMemo(() => {
        if (!mounted)
            return [];
        let filtered = [...candidates];
        if (searchTerm) {
            filtered = filtered.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.role.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(c => c.status === statusFilter);
        }
        if (isEngineer) {
            filtered = filtered.filter(c => c.email === session?.user?.email);
        }
        else if (isCustomer) {
            filtered = filtered.filter(c => c.assignedTo === session?.user?.organizationId);
        }
        return filtered;
    }, [candidates, searchTerm, statusFilter, session, isEngineer, isCustomer, mounted]);
    const handleViewCandidate = (candidate) => {
        setSelectedCandidate(candidate);
        setShowDetailsModal(true);
    };
    const handleUpdateCandidate = async (candidateId, updates) => {
        if (!updateCandidate || typeof updateCandidate !== 'function') {
            console.warn('updateCandidate is not available');
            return;
        }
        try {
            await updateCandidate(candidateId, updates);
            if (selectedCandidate?.id === candidateId) {
                setSelectedCandidate(prev => prev ? { ...prev, ...updates } : null);
            }
        }
        catch (error) {
            console.error('Failed to update candidate:', error);
            throw error;
        }
    };
    if (!mounted) {
        return (_jsx("div", { className: "relative", children: _jsxs("div", { className: "w-full px-4 py-3 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 flex items-center justify-center", children: [_jsx(Loader2, { className: "w-5 h-5 text-blue-400 animate-spin mr-2" }), _jsx("span", { className: "text-white", children: "Loading onboarding pipeline..." })] }) }));
    }
    if (isEngineer && filteredCandidates.length > 0) {
        const myOnboarding = filteredCandidates[0];
        const StatusIcon = statusConfig[myOnboarding.status].icon;
        return (_jsxs("div", { className: "bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50", children: [_jsx("h2", { className: "text-xl font-semibold text-white mb-6", children: "Your Onboarding Progress" }), _jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm text-slate-400", children: "Overall Progress" }), _jsxs("span", { className: "text-sm font-medium text-white", children: [myOnboarding.progress, "%"] })] }), _jsx("div", { className: "w-full bg-slate-700/50 rounded-full h-3", children: _jsx(motion.div, { className: "bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full", initial: { width: 0 }, animate: { width: `${myOnboarding.progress}%` }, transition: { duration: 0.5 } }) })] }), _jsx("div", { className: `${statusConfig[myOnboarding.status].bg} rounded-lg p-4 mb-6`, children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(StatusIcon, { className: `w-5 h-5 ${statusConfig[myOnboarding.status].color}` }), _jsxs("div", { children: [_jsxs("p", { className: "text-white font-medium", children: ["Current Stage: ", statusConfig[myOnboarding.status].label] }), _jsxs("p", { className: "text-sm text-slate-400", children: ["Last updated: ", myOnboarding.lastUpdate] })] })] }) }), _jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-sm font-medium text-slate-300 mb-2", children: "Required Actions" }), myOnboarding.status === 'vetting' && (_jsx("div", { className: "bg-slate-700/30 rounded-lg p-3 border border-yellow-500/20", children: _jsx("p", { className: "text-sm text-slate-300", children: "\u2713 Complete background check authorization" }) })), myOnboarding.status === 'offer_letter' && (_jsx("div", { className: "bg-slate-700/30 rounded-lg p-3 border border-blue-500/20", children: _jsx("p", { className: "text-sm text-slate-300", children: "\u2713 Review and sign your offer letter" }) })), myOnboarding.status === 'legal' && (_jsx("div", { className: "bg-slate-700/30 rounded-lg p-3 border border-purple-500/20", children: _jsx("p", { className: "text-sm text-slate-300", children: "\u2713 Complete employment agreements" }) })), myOnboarding.status === 'immigration' && (_jsx("div", { className: "bg-slate-700/30 rounded-lg p-3 border border-green-500/20", children: _jsx("p", { className: "text-sm text-slate-300", children: "\u2713 Submit I-9 documentation" }) }))] }), _jsxs("div", { className: "mt-6 flex gap-3", children: [_jsx("button", { className: "flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors", children: "Continue Onboarding" }), _jsx("button", { className: "px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors", children: "View Documents" })] })] }));
    }
    return (_jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setIsOpen(!isOpen), className: "w-full px-4 py-3 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 hover:bg-slate-700/50 transition-all flex items-center justify-between group", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "relative", children: [_jsx(User, { className: "w-5 h-5 text-blue-400" }), candidates.length > 0 && (_jsx("div", { className: "absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" }))] }), _jsx("span", { className: "text-white font-medium", children: "Onboarding Pipeline" }), _jsxs("div", { className: "flex items-center gap-2", children: [Object.entries(statusCounts).slice(0, 3).map(([status, count]) => (_jsxs("span", { className: `px-2 py-1 rounded-full text-xs ${statusConfig[status]?.bg || 'bg-slate-700/50'} ${statusConfig[status]?.color || 'text-slate-400'}`, children: [count, " ", statusConfig[status]?.label || status] }, status))), recentUpdates.length > 0 && (_jsxs("span", { className: "px-2 py-1 rounded-full text-xs bg-red-400/20 text-red-400 animate-pulse", children: [recentUpdates.length, " updates"] }))] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [refresh && typeof refresh === 'function' && (_jsx("div", { onClick: (e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    if (typeof refresh === 'function') {
                                        refresh();
                                    }
                                }, className: "p-1 text-slate-400 hover:text-white transition-colors cursor-pointer", title: "Refresh data", role: "button", tabIndex: 0, onKeyDown: (e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        if (typeof refresh === 'function') {
                                            refresh();
                                        }
                                    }
                                }, children: _jsx(RefreshCw, { className: "w-4 h-4" }) })), _jsx(ChevronDown, { className: `w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}` })] })] }), _jsx(AnimatePresence, { children: isOpen && (_jsxs(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, className: "absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl z-50 max-h-[600px] overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-slate-700/50", children: [_jsxs("div", { className: "flex gap-3 mb-3", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: "text", placeholder: "Search by name, email, or role...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500" })] }), _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500", children: [_jsx("option", { value: "all", children: "All Status" }), Object.entries(statusConfig).map(([key, config]) => (_jsx("option", { value: key, children: config.label }, key)))] }), _jsxs("div", { className: "flex gap-1 bg-slate-700/50 rounded-lg p-1", children: [_jsx("button", { onClick: () => setViewMode('list'), className: `px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`, children: "List" }), _jsx("button", { onClick: () => setViewMode('kanban'), className: `px-3 py-1 rounded ${viewMode === 'kanban' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`, children: "Kanban" })] })] }), _jsx("div", { className: "flex gap-2 flex-wrap mb-3", children: Object.entries(statusCounts).map(([status, count]) => (_jsxs("button", { onClick: () => setStatusFilter(status), className: `px-3 py-1 rounded-full text-xs transition-all ${statusFilter === status
                                            ? `${statusConfig[status]?.bg || 'bg-slate-700/50'} ${statusConfig[status]?.color || 'text-slate-400'} ring-2 ring-offset-2 ring-offset-slate-800`
                                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`, children: [count, " ", statusConfig[status]?.label || status] }, status))) }), recentUpdates.length > 0 && lastUpdate && (_jsxs("div", { className: "bg-slate-700/30 rounded-lg p-3 mb-3", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Bell, { className: "w-4 h-4 text-blue-400" }), _jsx("span", { className: "text-sm font-medium text-white", children: "Recent Activity" }), _jsxs("span", { className: "text-xs text-slate-500", children: ["Last updated: ", typeof lastUpdate === 'string' ? lastUpdate : new Date(lastUpdate).toLocaleTimeString()] })] }), _jsx("div", { className: "space-y-1 max-h-24 overflow-y-auto", children: recentUpdates.slice(0, 3).map((update, index) => (_jsxs("div", { className: "text-xs text-slate-400 flex items-center gap-2", children: [_jsx("div", { className: "w-1 h-1 bg-blue-400 rounded-full" }), update.message] }, index))) })] }))] }), _jsx("div", { className: "overflow-y-auto max-h-[400px] p-4", children: loading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx(Loader2, { className: "w-6 h-6 text-blue-400 animate-spin" }) })) : filteredCandidates.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(User, { className: "w-12 h-12 text-slate-600 mx-auto mb-3" }), _jsx("p", { className: "text-slate-400", children: "No candidates found" })] })) : viewMode === 'list' ? (_jsx("div", { className: "space-y-3", children: filteredCandidates.map((candidate) => {
                                    const StatusIcon = statusConfig[candidate.status].icon;
                                    return (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, className: "bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-all cursor-pointer group", onClick: () => handleViewCandidate(candidate), children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h3", { className: "text-white font-medium", children: candidate.name }), _jsx("span", { className: `px-2 py-0.5 rounded-full text-xs ${statusConfig[candidate.status].bg} ${statusConfig[candidate.status].color}`, children: statusConfig[candidate.status].label })] }), _jsx("p", { className: "text-sm text-slate-400 mb-1", children: candidate.role }), _jsxs("p", { className: "text-xs text-slate-500", children: [candidate.email, " \u2022 ", candidate.location] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(StatusIcon, { className: `w-4 h-4 ${statusConfig[candidate.status].color}` }), _jsxs("span", { className: "text-sm text-slate-400", children: ["Phase ", candidate.phase, "/6"] })] }), _jsx("div", { className: "w-24 bg-slate-600/50 rounded-full h-2 mb-1", children: _jsx("div", { className: "bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full", style: { width: `${candidate.progress}%` } }) }), _jsx("p", { className: "text-xs text-slate-500", children: candidate.lastUpdate })] })] }), candidate.documents && (_jsx("div", { className: "flex gap-2 mt-3 pt-3 border-t border-slate-600/50", children: Object.entries(candidate.documents).map(([doc, completed]) => (_jsx("span", { className: `text-xs px-2 py-1 rounded ${completed
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-slate-600/50 text-slate-500'}`, children: doc.replace('_', ' ').toUpperCase() }, doc))) }))] }, candidate.id));
                                }) })) : (_jsx("div", { className: "flex gap-4 overflow-x-auto pb-4", children: Object.entries(statusConfig).map(([status, config]) => {
                                    const statusCandidates = filteredCandidates.filter(c => c.status === status);
                                    const Icon = config.icon;
                                    return (_jsxs("div", { className: "flex-shrink-0 w-72", children: [_jsxs("div", { className: `${config.bg} rounded-t-lg p-3 flex items-center gap-2`, children: [_jsx(Icon, { className: `w-4 h-4 ${config.color}` }), _jsx("span", { className: `font-medium ${config.color}`, children: config.label }), _jsx("span", { className: `ml-auto px-2 py-0.5 rounded-full text-xs bg-slate-700/50 ${config.color}`, children: statusCandidates.length })] }), _jsx("div", { className: "bg-slate-700/20 rounded-b-lg p-2 min-h-[200px] space-y-2", children: statusCandidates.map((candidate) => (_jsxs("div", { className: "bg-slate-800/50 rounded-lg p-3 hover:bg-slate-800/70 transition-all cursor-pointer", onClick: () => handleViewCandidate(candidate), children: [_jsx("p", { className: "text-white font-medium text-sm mb-1", children: candidate.name }), _jsx("p", { className: "text-xs text-slate-400 mb-2", children: candidate.role }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs text-slate-500", children: candidate.lastUpdate }), _jsx("div", { className: "w-16 bg-slate-600/50 rounded-full h-1.5", children: _jsx("div", { className: "bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full", style: { width: `${candidate.progress}%` } }) })] })] }, candidate.id))) })] }, status));
                                }) })) }), isOperator && (_jsxs("div", { className: "p-4 border-t border-slate-700/50 flex justify-between items-center", children: [_jsxs("button", { className: "px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2", children: [_jsx(User, { className: "w-4 h-4" }), "Add New Candidate"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors", children: "Export Report" }), _jsx("button", { className: "px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors", children: "Settings" })] })] }))] })) }), _jsx(CandidateDetailsModal, { candidate: selectedCandidate, isOpen: showDetailsModal, onClose: () => {
                    setShowDetailsModal(false);
                    setSelectedCandidate(null);
                }, onUpdate: handleUpdateCandidate })] }));
}
//# sourceMappingURL=OnboardingTrackerClient.js.map