'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Clock, FileText, Shield, Globe, CheckCircle, AlertCircle, Edit, Save, Upload, Download, MessageCircle, Phone, Mail, Building, Star } from 'lucide-react';
import { useSession } from '@/components/session-context';
const statusConfig = {
    vetting: { label: 'Vetting', icon: Shield, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    offer_letter: { label: 'Offer Letter', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    legal: { label: 'Legal Review', icon: Shield, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    immigration: { label: 'Immigration', icon: Globe, color: 'text-green-400', bg: 'bg-green-400/10' },
    final_review: { label: 'Final Review', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    completed: { label: 'Completed', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
};
const documentLabels = {
    resume: 'Resume',
    offer: 'Offer Letter',
    background: 'Background Check',
    i9: 'I-9 Form',
    visa: 'Visa Documentation'
};
export function CandidateDetailsModal({ candidate, isOpen, onClose, onUpdate }) {
    const { data: session } = useSession();
    const [isEditing, setIsEditing] = useState(false);
    const [editedCandidate, setEditedCandidate] = useState({});
    const [loading, setLoading] = useState(false);
    if (!candidate)
        return null;
    const userRole = session?.user?.role;
    const isEngineer = userRole === 'ENGINEER_EMPLOYEE';
    const canEdit = !isEngineer || candidate.email === session?.user?.email;
    const StatusIcon = statusConfig[candidate.status].icon;
    const priorityColor = {
        high: 'text-red-400',
        medium: 'text-yellow-400',
        normal: 'text-green-400'
    }[candidate.priority || 'normal'];
    const handleEdit = () => {
        setEditedCandidate({ ...candidate });
        setIsEditing(true);
    };
    const handleSave = async () => {
        if (!candidate?.id)
            return;
        setLoading(true);
        try {
            await onUpdate(candidate.id, editedCandidate);
            setIsEditing(false);
            setEditedCandidate({});
        }
        catch (error) {
            console.error('Failed to update candidate:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCancel = () => {
        setIsEditing(false);
        setEditedCandidate({});
    };
    const handleDocumentToggle = (docType) => {
        setEditedCandidate(prev => ({
            ...prev,
            documents: {
                ...prev.documents,
                [docType]: !prev.documents?.[docType]
            }
        }));
    };
    const getNextStatus = (currentStatus) => {
        const statusOrder = ['vetting', 'offer_letter', 'legal', 'immigration', 'final_review', 'completed'];
        const currentIndex = statusOrder.indexOf(currentStatus);
        return statusOrder[currentIndex + 1] || currentStatus;
    };
    const canAdvanceStatus = () => {
        return canEdit && candidate.status !== 'completed';
    };
    return (_jsx(AnimatePresence, { children: isOpen && (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black/80 backdrop-blur-sm", onClick: onClose }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.95, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 20 }, className: "relative bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-slate-700/50", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg", children: candidate.name.split(' ').map(n => n[0]).join('') }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-white", children: candidate.name }), _jsx("p", { className: "text-slate-400", children: candidate.role })] }), _jsxs("div", { className: `px-3 py-1 rounded-full text-sm ${statusConfig[candidate.status].bg} ${statusConfig[candidate.status].color}`, children: [_jsx(StatusIcon, { className: "w-4 h-4 inline mr-1" }), statusConfig[candidate.status].label] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [canEdit && !isEditing && (_jsxs("button", { onClick: handleEdit, className: "px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2", children: [_jsx(Edit, { className: "w-4 h-4" }), "Edit"] })), isEditing && (_jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: handleSave, disabled: loading, className: "px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2 disabled:opacity-50", children: [_jsx(Save, { className: "w-4 h-4" }), loading ? 'Saving...' : 'Save'] }), _jsx("button", { onClick: handleCancel, className: "px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors", children: "Cancel" })] })), _jsx("button", { onClick: onClose, className: "p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] })] }), _jsx("div", { className: "p-6 overflow-y-auto max-h-[calc(90vh-140px)]", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs("div", { className: "bg-slate-700/30 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "text-lg font-medium text-white", children: "Onboarding Progress" }), _jsxs("span", { className: "text-sm text-slate-400", children: ["Phase ", candidate.phase, "/6"] })] }), _jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm text-slate-400", children: "Overall Progress" }), _jsxs("span", { className: "text-sm font-medium text-white", children: [candidate.progress, "%"] })] }), _jsx("div", { className: "w-full bg-slate-600/50 rounded-full h-3", children: _jsx(motion.div, { className: "bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full", initial: { width: 0 }, animate: { width: `${candidate.progress}%` }, transition: { duration: 0.5 } }) })] }), canAdvanceStatus() && (_jsxs("button", { onClick: () => {
                                                            const nextStatus = getNextStatus(candidate.status);
                                                            onUpdate(candidate.id, { status: nextStatus });
                                                        }, className: "w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), "Advance to ", statusConfig[getNextStatus(candidate.status)]?.label] }))] }), _jsxs("div", { className: "bg-slate-700/30 rounded-xl p-4", children: [_jsx("h3", { className: "text-lg font-medium text-white mb-4", children: "Required Documents" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [Object.entries(documentLabels).map(([key, label]) => {
                                                                const isCompleted = isEditing
                                                                    ? editedCandidate.documents?.[key]
                                                                    : candidate.documents?.[key];
                                                                return (_jsxs("div", { className: `flex items-center justify-between p-3 rounded-lg border ${isCompleted
                                                                        ? 'bg-green-500/20 border-green-500/30 text-green-400'
                                                                        : 'bg-slate-600/30 border-slate-600/50 text-slate-400'}`, children: [_jsxs("div", { className: "flex items-center gap-2", children: [isCompleted ? (_jsx(CheckCircle, { className: "w-4 h-4" })) : (_jsx(AlertCircle, { className: "w-4 h-4" })), _jsx("span", { className: "text-sm font-medium", children: label })] }), isEditing && canEdit && (_jsx("button", { onClick: () => handleDocumentToggle(key), className: `px-2 py-1 text-xs rounded transition-colors ${isCompleted
                                                                                ? 'bg-green-500/30 text-green-300 hover:bg-green-500/40'
                                                                                : 'bg-slate-500/30 text-slate-300 hover:bg-slate-500/40'}`, children: isCompleted ? 'Mark Incomplete' : 'Mark Complete' })), !isEditing && (_jsxs("div", { className: "flex gap-1", children: [_jsx("button", { className: "p-1 text-slate-400 hover:text-white transition-colors", children: _jsx(Upload, { className: "w-3 h-3" }) }), _jsx("button", { className: "p-1 text-slate-400 hover:text-white transition-colors", children: _jsx(Download, { className: "w-3 h-3" }) })] }))] }, key));
                                                            }), "\\n                    "] })] }), _jsxs("div", { className: "bg-slate-700/30 rounded-xl p-4", children: [_jsx("h3", { className: "text-lg font-medium text-white mb-3", children: "Notes" }), isEditing ? (_jsx("textarea", { value: editedCandidate.notes || '', onChange: (e) => setEditedCandidate(prev => ({ ...prev, notes: e.target.value })), className: "w-full h-24 bg-slate-600/50 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none", placeholder: "Add notes about this candidate..." })) : (_jsx("p", { className: "text-slate-300 text-sm", children: candidate.notes || 'No notes available' }))] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-slate-700/30 rounded-xl p-4", children: [_jsx("h3", { className: "text-lg font-medium text-white mb-3", children: "Contact Information" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Mail, { className: "w-4 h-4 text-slate-400" }), _jsx("span", { className: "text-sm text-slate-300", children: candidate.email })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-slate-400" }), _jsx("span", { className: "text-sm text-slate-300", children: candidate.location })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Building, { className: "w-4 h-4 text-slate-400" }), _jsx("span", { className: "text-sm text-slate-300", children: candidate.recruiter })] })] })] }), _jsxs("div", { className: "bg-slate-700/30 rounded-xl p-4", children: [_jsx("h3", { className: "text-lg font-medium text-white mb-3", children: "Timeline" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-slate-400" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-300", children: "Start Date" }), _jsx("p", { className: "text-xs text-slate-500", children: candidate.startDate })] })] }), candidate.estimatedCompletion && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4 text-slate-400" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-300", children: "Est. Completion" }), _jsx("p", { className: "text-xs text-slate-500", children: candidate.estimatedCompletion })] })] })), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Star, { className: `w-4 h-4 ${priorityColor}` }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-300", children: "Priority" }), _jsx("p", { className: `text-xs ${priorityColor} capitalize`, children: candidate.priority })] })] })] })] }), !isEngineer && (_jsxs("div", { className: "bg-slate-700/30 rounded-xl p-4", children: [_jsx("h3", { className: "text-lg font-medium text-white mb-3", children: "Quick Actions" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("button", { className: "w-full px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2 text-sm", children: [_jsx(MessageCircle, { className: "w-4 h-4" }), "Send Message"] }), _jsxs("button", { className: "w-full px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2 text-sm", children: [_jsx(Phone, { className: "w-4 h-4" }), "Schedule Call"] }), _jsxs("button", { className: "w-full px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center gap-2 text-sm", children: [_jsx(FileText, { className: "w-4 h-4" }), "Generate Report"] })] })] }))] })] }) })] })] })) }));
}
//# sourceMappingURL=CandidateDetailsModal.js.map