'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, DollarSign, Clock, Check, ChevronRight, ChevronLeft, Search, AlertTriangle, CheckCircle2, Users, Target, Award, Globe, Briefcase } from 'lucide-react';
export default function EnhancedEngineerAllocationModal({ isOpen, onClose, availableEngineers, activeProjects, onAssign }) {
    const [step, setStep] = useState(1);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedEngineers, setSelectedEngineers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCriteria, setFilterCriteria] = useState({
        skills: [],
        visaStatus: '',
        maxHourlyRate: '',
        minExperience: '',
        availability: 'Available'
    });
    const [projectDetails, setProjectDetails] = useState({
        name: '',
        client: '',
        location: '',
        startDate: '',
        endDate: '',
        budget: '',
        requiredSkills: [],
        visaRequirements: [],
        securityClearance: '',
        travelRequired: false,
        description: ''
    });
    const [assignmentData, setAssignmentData] = useState({
        role: '',
        notes: '',
        payRate: '',
        totalHours: '',
        homeAddress: '',
        jobAddress: '',
        documents: []
    });
    const allSkills = useMemo(() => {
        const skills = new Set();
        availableEngineers.forEach(engineer => {
            engineer.skills.forEach(skill => skills.add(skill));
        });
        return Array.from(skills).sort();
    }, [availableEngineers]);
    const filteredEngineers = useMemo(() => {
        return availableEngineers.filter(engineer => {
            if (filterCriteria.availability && engineer.availability !== filterCriteria.availability) {
                return false;
            }
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = engineer.name.toLowerCase().includes(searchLower) ||
                    engineer.category.toLowerCase().includes(searchLower) ||
                    engineer.skills.some(skill => skill.toLowerCase().includes(searchLower));
                if (!matchesSearch)
                    return false;
            }
            if (filterCriteria.skills.length > 0) {
                const hasRequiredSkills = filterCriteria.skills.some(skill => engineer.skills.includes(skill));
                if (!hasRequiredSkills)
                    return false;
            }
            if (filterCriteria.visaStatus && engineer.visaStatus !== filterCriteria.visaStatus) {
                return false;
            }
            if (filterCriteria.maxHourlyRate && engineer.hourlyRate > parseFloat(filterCriteria.maxHourlyRate)) {
                return false;
            }
            if (filterCriteria.minExperience && engineer.experience < parseFloat(filterCriteria.minExperience)) {
                return false;
            }
            if (selectedProject) {
                const hasConflict = engineer.currentAssignments.some(assignment => {
                    const assignmentStart = new Date(assignment.startDate);
                    const assignmentEnd = new Date(assignment.endDate);
                    const projectStart = new Date(selectedProject.startDate);
                    const projectEnd = new Date(selectedProject.endDate);
                    return ((assignmentStart <= projectEnd && assignmentEnd >= projectStart) ||
                        (projectStart <= assignmentEnd && projectEnd >= assignmentStart));
                });
                if (hasConflict)
                    return false;
                if (selectedProject.visaRequirements.length > 0) {
                    const meetsVisaReqs = selectedProject.visaRequirements.includes(engineer.visaStatus);
                    if (!meetsVisaReqs)
                        return false;
                }
                if (selectedProject.travelRequired && !engineer.workAuthorization.canTravel) {
                    return false;
                }
                if (selectedProject.requiredSkills.length > 0) {
                    const hasRequiredSkills = selectedProject.requiredSkills.some(skill => engineer.skills.includes(skill));
                    if (!hasRequiredSkills)
                        return false;
                }
            }
            return true;
        });
    }, [availableEngineers, searchTerm, filterCriteria, selectedProject]);
    const toggleEngineerSelection = (engineer) => {
        setSelectedEngineers(prev => {
            const isSelected = prev.find(e => e.id === engineer.id);
            if (isSelected) {
                return prev.filter(e => e.id !== engineer.id);
            }
            else {
                return [...prev, engineer];
            }
        });
    };
    const getAvailabilityStatus = (engineer) => {
        if (engineer.availability === 'Available') {
            return { color: 'text-green-400', bg: 'bg-green-500/20', text: 'Available' };
        }
        else if (engineer.availability === 'Partial') {
            return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', text: 'Partial Availability' };
        }
        else {
            return { color: 'text-red-400', bg: 'bg-red-500/20', text: 'Not Available' };
        }
    };
    const calculateTotalCost = () => {
        if (!assignmentData.payRate || !assignmentData.totalHours)
            return 0;
        return selectedEngineers.length * parseFloat(assignmentData.payRate) * parseFloat(assignmentData.totalHours);
    };
    const handleNext = () => {
        if (step < 3)
            setStep(step + 1);
    };
    const handlePrevious = () => {
        if (step > 1)
            setStep(step - 1);
    };
    const handleAssign = () => {
        const assignment = {
            project: selectedProject || projectDetails,
            engineers: selectedEngineers,
            assignment: assignmentData,
            totalCost: calculateTotalCost(),
            createdAt: new Date().toISOString()
        };
        onAssign(assignment);
        onClose();
    };
    if (!isOpen)
        return null;
    return (_jsx(AnimatePresence, { children: _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: onClose, className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, onClick: (e) => e.stopPropagation(), className: "bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "p-4 sm:p-6 border-b border-slate-700", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl sm:text-2xl font-bold text-white", children: "Enhanced Engineer Allocation" }), _jsx("p", { className: "text-slate-400", children: "Multi-engineer project assignment with smart matching" })] }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-slate-800 rounded-lg transition-colors", children: _jsx(X, { className: "h-5 w-5 text-slate-400" }) })] }), _jsx("div", { className: "flex items-center mt-6 space-x-4", children: [1, 2, 3].map((stepNum) => (_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= stepNum
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-slate-700 text-slate-400'}`, children: stepNum }), _jsx("span", { className: `ml-2 text-sm ${step >= stepNum ? 'text-white' : 'text-slate-400'}`, children: stepNum === 1 ? 'Project Details' : stepNum === 2 ? 'Engineer Selection' : 'Assignment Details' }), stepNum < 3 && _jsx(ChevronRight, { className: "h-4 w-4 text-slate-500 ml-4" })] }, stepNum))) })] }), _jsxs("div", { className: "p-6", children: [step === 1 && (_jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, className: "space-y-6", children: _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4 flex items-center", children: [_jsx(Target, { className: "h-5 w-5 mr-2 text-blue-400" }), "Project Information"] }), activeProjects.length > 0 && (_jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-3", children: "Select Existing Project" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto", children: activeProjects.map(project => (_jsxs("div", { onClick: () => setSelectedProject(project), className: `p-4 rounded-lg border cursor-pointer transition-colors ${selectedProject?.id === project.id
                                                            ? 'bg-blue-500/20 border-blue-500/50'
                                                            : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`, children: [_jsx("h4", { className: "font-medium text-white text-sm", children: project.name }), _jsx("p", { className: "text-xs text-slate-400", children: project.client }), _jsxs("div", { className: "flex items-center space-x-4 mt-2 text-xs text-slate-500", children: [_jsxs("span", { children: [_jsx(MapPin, { className: "h-3 w-3 inline mr-1" }), project.location] }), _jsxs("span", { children: ["Budget: $", (project.budget / 1000000).toFixed(1), "M"] })] }), _jsxs("div", { className: "flex flex-wrap gap-1 mt-2", children: [project.requiredSkills.slice(0, 3).map(skill => (_jsx("span", { className: "px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs", children: skill }, skill))), project.requiredSkills.length > 3 && (_jsxs("span", { className: "px-2 py-1 bg-slate-600 text-slate-400 rounded text-xs", children: ["+", project.requiredSkills.length - 3, " more"] }))] })] }, project.id))) }), _jsx("div", { className: "text-center my-4", children: _jsx("span", { className: "text-slate-400 text-sm", children: "or" }) })] })), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "text-md font-medium text-slate-300", children: "Create New Project" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Project Name" }), _jsx("input", { type: "text", placeholder: "Tesla Model Y Line Expansion", value: projectDetails.name, onChange: (e) => setProjectDetails(prev => ({ ...prev, name: e.target.value })), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Client" }), _jsx("input", { type: "text", placeholder: "Tesla Motors", value: projectDetails.client, onChange: (e) => setProjectDetails(prev => ({ ...prev, client: e.target.value })), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Location" }), _jsx("input", { type: "text", placeholder: "Austin, TX", value: projectDetails.location, onChange: (e) => setProjectDetails(prev => ({ ...prev, location: e.target.value })), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Start Date" }), _jsx("input", { type: "date", value: projectDetails.startDate, onChange: (e) => setProjectDetails(prev => ({ ...prev, startDate: e.target.value })), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "End Date" }), _jsx("input", { type: "date", value: projectDetails.endDate, onChange: (e) => setProjectDetails(prev => ({ ...prev, endDate: e.target.value })), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Required Skills" }), _jsx("div", { className: "flex flex-wrap gap-2 mb-2", children: allSkills.map(skill => (_jsx("button", { onClick: () => {
                                                                    setProjectDetails(prev => ({
                                                                        ...prev,
                                                                        requiredSkills: prev.requiredSkills.includes(skill)
                                                                            ? prev.requiredSkills.filter(s => s !== skill)
                                                                            : [...prev.requiredSkills, skill]
                                                                    }));
                                                                }, className: `px-3 py-1 rounded-full text-xs font-medium transition-colors ${projectDetails.requiredSkills.includes(skill)
                                                                    ? 'bg-blue-500 text-white'
                                                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`, children: skill }, skill))) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Visa Requirements" }), _jsxs("select", { multiple: true, value: projectDetails.visaRequirements, onChange: (e) => {
                                                                        const values = Array.from(e.target.selectedOptions, option => option.value);
                                                                        setProjectDetails(prev => ({ ...prev, visaRequirements: values }));
                                                                    }, className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", children: [_jsx("option", { value: "US Citizen", children: "US Citizen" }), _jsx("option", { value: "Green Card", children: "Green Card" }), _jsx("option", { value: "H1B", children: "H1B" }), _jsx("option", { value: "L1", children: "L1" }), _jsx("option", { value: "TN", children: "TN" })] })] }), _jsx("div", { className: "flex items-center space-x-4", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "travelRequired", checked: projectDetails.travelRequired, onChange: (e) => setProjectDetails(prev => ({ ...prev, travelRequired: e.target.checked })), className: "w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500" }), _jsx("label", { htmlFor: "travelRequired", className: "text-sm text-slate-300", children: "Travel Required" })] }) })] })] })] }) })), step === 2 && (_jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, className: "space-y-6", children: _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4 flex items-center", children: [_jsx(Users, { className: "h-5 w-5 mr-2 text-blue-400" }), "Select Engineers (", selectedEngineers.length, " selected)"] }), _jsx("div", { className: "bg-slate-800 rounded-lg p-4 mb-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Search" }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-slate-400" }), _jsx("input", { type: "text", placeholder: "Search engineers...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Skills" }), _jsx("select", { multiple: true, value: filterCriteria.skills, onChange: (e) => {
                                                                    const values = Array.from(e.target.selectedOptions, option => option.value);
                                                                    setFilterCriteria(prev => ({ ...prev, skills: values }));
                                                                }, className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none", children: allSkills.map(skill => (_jsx("option", { value: skill, children: skill }, skill))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Visa Status" }), _jsxs("select", { value: filterCriteria.visaStatus, onChange: (e) => setFilterCriteria(prev => ({ ...prev, visaStatus: e.target.value })), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none", children: [_jsx("option", { value: "", children: "All" }), _jsx("option", { value: "US Citizen", children: "US Citizen" }), _jsx("option", { value: "Green Card", children: "Green Card" }), _jsx("option", { value: "H1B", children: "H1B" }), _jsx("option", { value: "L1", children: "L1" }), _jsx("option", { value: "TN", children: "TN" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Max Rate ($/hr)" }), _jsx("input", { type: "number", placeholder: "100", value: filterCriteria.maxHourlyRate, onChange: (e) => setFilterCriteria(prev => ({ ...prev, maxHourlyRate: e.target.value })), className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none" })] })] }) }), selectedEngineers.length > 0 && (_jsxs("div", { className: "bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6", children: [_jsx("h4", { className: "text-sm font-medium text-blue-300 mb-2", children: "Selected Engineers" }), _jsx("div", { className: "flex flex-wrap gap-2", children: selectedEngineers.map(engineer => (_jsxs("div", { className: "flex items-center space-x-2 bg-blue-500/20 rounded-lg px-3 py-1", children: [_jsx("span", { className: "text-sm text-white", children: engineer.name }), _jsx("button", { onClick: () => toggleEngineerSelection(engineer), className: "text-blue-300 hover:text-white", children: _jsx(X, { className: "h-3 w-3" }) })] }, engineer.id))) })] })), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto", children: filteredEngineers.map(engineer => {
                                                const availability = getAvailabilityStatus(engineer);
                                                const isSelected = selectedEngineers.find(e => e.id === engineer.id);
                                                return (_jsxs("div", { onClick: () => toggleEngineerSelection(engineer), className: `p-4 rounded-lg border cursor-pointer transition-colors ${isSelected
                                                        ? 'bg-blue-500/20 border-blue-500/50'
                                                        : 'bg-slate-800 border-slate-700 hover:bg-slate-750'}`, children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center", children: _jsx("span", { className: "text-white font-bold text-sm", children: engineer.avatar }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-white", children: engineer.name }), _jsx("p", { className: "text-sm text-slate-400", children: engineer.category }), _jsxs("div", { className: "flex items-center space-x-3 mt-1", children: [_jsxs("span", { className: "text-xs text-slate-500", children: ["$", engineer.hourlyRate, "/hr"] }), _jsxs("span", { className: "text-xs text-slate-500", children: [engineer.experience, "y exp"] }), _jsx("span", { className: `text-xs px-2 py-1 rounded ${availability.bg} ${availability.color}`, children: availability.text })] })] })] }), _jsxs("div", { className: "flex flex-col items-end space-y-1", children: [isSelected && _jsx(CheckCircle2, { className: "h-5 w-5 text-blue-400" }), _jsx("div", { className: "flex items-center space-x-1", children: Array.from({ length: 5 }).map((_, i) => (_jsx("div", { className: `h-1 w-1 rounded-full ${i < engineer.rating ? 'bg-yellow-400' : 'bg-slate-600'}` }, i))) })] })] }), _jsx("div", { className: "mt-3", children: _jsxs("div", { className: "flex flex-wrap gap-1", children: [engineer.skills.slice(0, 4).map(skill => (_jsx("span", { className: "px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs", children: skill }, skill))), engineer.skills.length > 4 && (_jsxs("span", { className: "px-2 py-1 bg-slate-600 text-slate-400 rounded text-xs", children: ["+", engineer.skills.length - 4] }))] }) }), _jsxs("div", { className: "mt-2 flex items-center justify-between text-xs text-slate-500", children: [_jsxs("span", { children: [_jsx(Globe, { className: "h-3 w-3 inline mr-1" }), engineer.visaStatus] }), _jsxs("span", { children: [_jsx(MapPin, { className: "h-3 w-3 inline mr-1" }), engineer.location] })] })] }, engineer.id));
                                            }) }), filteredEngineers.length === 0 && (_jsxs("div", { className: "text-center py-8", children: [_jsx(AlertTriangle, { className: "h-12 w-12 text-slate-400 mx-auto mb-4" }), _jsx("p", { className: "text-slate-400", children: "No engineers match the current filters." })] }))] }) })), step === 3 && (_jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, className: "space-y-6", children: _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4 flex items-center", children: [_jsx(Briefcase, { className: "h-5 w-5 mr-2 text-blue-400" }), "Assignment Details"] }), _jsx("div", { className: "bg-slate-800 rounded-lg p-4 mb-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-slate-300 mb-2", children: "Project" }), _jsx("p", { className: "text-white font-medium", children: selectedProject?.name || projectDetails.name }), _jsx("p", { className: "text-sm text-slate-400", children: selectedProject?.client || projectDetails.client })] }), _jsxs("div", { children: [_jsxs("h4", { className: "text-sm font-medium text-slate-300 mb-2", children: ["Engineers (", selectedEngineers.length, ")"] }), _jsxs("div", { className: "space-y-1", children: [selectedEngineers.slice(0, 3).map(engineer => (_jsx("p", { className: "text-sm text-white", children: engineer.name }, engineer.id))), selectedEngineers.length > 3 && (_jsxs("p", { className: "text-sm text-slate-400", children: ["+", selectedEngineers.length - 3, " more"] }))] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-slate-300 mb-2", children: "Total Cost" }), _jsxs("p", { className: "text-xl font-bold text-green-400", children: ["$", calculateTotalCost().toLocaleString()] })] })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(DollarSign, { className: "h-4 w-4 inline mr-1" }), "Pay Rate (per hour)"] }), _jsx("input", { type: "number", placeholder: "75.00", value: assignmentData.payRate, onChange: (e) => setAssignmentData(prev => ({ ...prev, payRate: e.target.value })), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(Clock, { className: "h-4 w-4 inline mr-1" }), "Total Hours"] }), _jsx("input", { type: "number", placeholder: "160", value: assignmentData.totalHours, onChange: (e) => setAssignmentData(prev => ({ ...prev, totalHours: e.target.value })), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [_jsx(Award, { className: "h-4 w-4 inline mr-1" }), "Role"] }), _jsx("input", { type: "text", placeholder: "e.g., Lead Controls Engineer", value: assignmentData.role, onChange: (e) => setAssignmentData(prev => ({ ...prev, role: e.target.value })), className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Additional Notes" }), _jsx("textarea", { placeholder: "Assignment details, special requirements, etc...", value: assignmentData.notes, onChange: (e) => setAssignmentData(prev => ({ ...prev, notes: e.target.value })), rows: 4, className: "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none" })] })] }) }))] }), _jsxs("div", { className: "p-6 border-t border-slate-700 flex justify-between", children: [_jsx("div", { className: "flex space-x-3", children: step > 1 && (_jsxs("button", { onClick: handlePrevious, className: "px-4 py-2 text-slate-400 hover:text-white transition-colors flex items-center space-x-2", children: [_jsx(ChevronLeft, { className: "h-4 w-4" }), _jsx("span", { children: "Previous" })] })) }), _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-slate-400 hover:text-white transition-colors", children: "Cancel" }), step < 3 ? (_jsxs("button", { onClick: handleNext, disabled: step === 1 && !selectedProject && !projectDetails.name, className: "px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx("span", { children: "Next" }), _jsx(ChevronRight, { className: "h-4 w-4" })] })) : (_jsxs("button", { onClick: handleAssign, disabled: selectedEngineers.length === 0, className: "px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(Check, { className: "h-4 w-4" }), _jsxs("span", { children: ["Assign ", selectedEngineers.length, " Engineer", selectedEngineers.length !== 1 ? 's' : ''] })] }))] })] })] }) }) }));
}
//# sourceMappingURL=EnhancedEngineerAllocationModal.js.map