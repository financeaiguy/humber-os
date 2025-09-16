'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Wrench, Zap, GitBranch, Cpu, MapPin, FileText, CheckCircle, Plus, Calendar, DollarSign, Plane, Clock, Target, Briefcase, Star, Search, Edit3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
const EngineerAllocationModal = dynamic(() => import('@/components/bull-pen/EngineerAllocationModal').then((mod) => ({ default: mod.default })), {
    ssr: false,
    loading: () => _jsx("div", { className: "flex items-center justify-center p-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" }) })
});
const FlightBookingModal = dynamic(() => import('@/components/bull-pen/FlightBookingModal').then((mod) => ({ default: mod.default })), {
    ssr: false,
    loading: () => _jsx("div", { className: "flex items-center justify-center p-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" }) })
});
const ExpenseTrackingModal = dynamic(() => import('@/components/bull-pen/ExpenseTrackingModal').then((mod) => ({ default: mod.default })), {
    ssr: false,
    loading: () => _jsx("div", { className: "flex items-center justify-center p-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" }) })
});
const EngineerProfileModal = dynamic(() => import('@/components/bull-pen/EngineerProfileModal').then((mod) => ({ default: mod.default })), {
    ssr: false,
    loading: () => _jsx("div", { className: "flex items-center justify-center p-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" }) })
});
const categories = [
    {
        name: 'Controls',
        icon: Cpu,
        color: 'from-blue-500 to-cyan-600',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30',
        available: 12,
        deployed: 8,
        buffered: 2
    },
    {
        name: 'Mechanical',
        icon: Wrench,
        color: 'from-green-500 to-emerald-600',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30',
        available: 15,
        deployed: 10,
        buffered: 3
    },
    {
        name: 'Electrical',
        icon: Zap,
        color: 'from-yellow-500 to-orange-600',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/30',
        available: 8,
        deployed: 6,
        buffered: 1
    },
    {
        name: 'Piping',
        icon: GitBranch,
        color: 'from-purple-500 to-pink-600',
        bgColor: 'bg-purple-500/20',
        borderColor: 'border-purple-500/30',
        available: 10,
        deployed: 7,
        buffered: 2
    },
    {
        name: 'Robotics',
        icon: Cpu,
        color: 'from-red-500 to-rose-600',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        available: 5,
        deployed: 3,
        buffered: 1
    },
];
const availableEngineers = [
    {
        id: 'eng-001',
        name: 'Sarah Chen',
        role: 'Senior Controls Engineer',
        category: 'Controls',
        avatar: 'SC',
        location: 'Austin, TX',
        coordinates: { lat: 30.2672, lng: -97.7431 },
        hourlyRate: 125,
        experience: 8,
        skills: ['PLC Programming', 'SCADA', 'HMI Design', 'Industrial Networks'],
        rating: 4.9,
        availability: 'Available',
        visaStatus: 'H1-B Valid',
        lastProject: 'Tesla Gigafactory Austin',
        preferredProjects: ['Automotive', 'Manufacturing'],
        certifications: ['Rockwell Automation', 'Siemens'],
        languages: ['English', 'Mandarin'],
        travelPreferences: {
            maxTravelDistance: 500,
            willingToRelocate: false,
            hasValidPassport: true,
            preferredProjects: ['domestic'],
            maxTravelDuration: 30
        },
        workAuthorization: {
            countries: ['US'],
            restrictions: ['H1-B sponsor required'],
            expirationDate: '2025-12-31'
        }
    },
    {
        id: 'eng-002',
        name: 'Michael Rodriguez',
        role: 'Mechanical Engineer',
        category: 'Mechanical',
        avatar: 'MR',
        location: 'Detroit, MI',
        coordinates: { lat: 42.3314, lng: -83.0458 },
        hourlyRate: 115,
        experience: 6,
        skills: ['AutoCAD', 'SolidWorks', 'FEA Analysis', 'Process Design'],
        rating: 4.7,
        availability: 'Available',
        visaStatus: 'Green Card',
        lastProject: 'Ford Rouge Plant',
        preferredProjects: ['Automotive', 'Aerospace'],
        certifications: ['PE License', 'Six Sigma Black Belt'],
        languages: ['English', 'Spanish'],
        travelPreferences: {
            maxTravelDistance: 800,
            willingToRelocate: true,
            hasValidPassport: true,
            preferredProjects: ['domestic', 'international'],
            maxTravelDuration: 90
        },
        workAuthorization: {
            countries: ['US', 'CA', 'MX'],
            restrictions: [],
            expirationDate: 'permanent'
        }
    },
    {
        id: 'eng-003',
        name: 'Priya Patel',
        role: 'Electrical Engineer',
        category: 'Electrical',
        avatar: 'PP',
        location: 'San Jose, CA',
        hourlyRate: 130,
        experience: 10,
        skills: ['Power Systems', 'Motor Controls', 'VFDs', 'Panel Design'],
        rating: 4.8,
        availability: 'On Project',
        visaStatus: 'Citizen',
        lastProject: 'Apple Park Data Center',
        preferredProjects: ['Tech', 'Manufacturing'],
        certifications: ['IEEE Member', 'NECA Certified'],
        languages: ['English', 'Hindi', 'Gujarati']
    },
    {
        id: 'eng-004',
        name: 'David Kim',
        role: 'Robotics Engineer',
        category: 'Robotics',
        avatar: 'DK',
        location: 'Seattle, WA',
        hourlyRate: 140,
        experience: 12,
        skills: ['ROS', 'Python', 'Computer Vision', 'Machine Learning'],
        rating: 4.9,
        availability: 'Available',
        visaStatus: 'H1-B Valid',
        lastProject: 'Amazon Fulfillment Center',
        preferredProjects: ['Robotics', 'Automation'],
        certifications: ['AWS Certified', 'ROS Industrial'],
        languages: ['English', 'Korean']
    }
];
const activeProjects = [
    {
        id: 'proj-001',
        name: 'Tesla Model Y Line Expansion',
        client: 'Tesla Motors',
        location: 'Austin, TX',
        startDate: '2024-02-01',
        endDate: '2024-08-15',
        budget: 2500000,
        spent: 1200000,
        urgency: 'High',
        engineersNeeded: {
            Controls: 3,
            Mechanical: 2,
            Electrical: 2,
            Robotics: 1
        },
        currentEngineers: ['eng-001'],
        status: 'Active',
        progress: 45,
        travelRequired: true,
        housingProvided: true
    },
    {
        id: 'proj-002',
        name: 'Ford F-150 Lightning Assembly',
        client: 'Ford Motor Company',
        location: 'Dearborn, MI',
        startDate: '2024-01-15',
        endDate: '2024-12-31',
        budget: 4200000,
        spent: 800000,
        urgency: 'Medium',
        engineersNeeded: {
            Controls: 4,
            Mechanical: 5,
            Electrical: 3,
            Piping: 2
        },
        currentEngineers: ['eng-002'],
        status: 'Ramping Up',
        progress: 20,
        travelRequired: true,
        housingProvided: false
    },
    {
        id: 'proj-003',
        name: 'GM Ultium Battery Plant',
        client: 'General Motors',
        location: 'Warren, OH',
        startDate: '2024-03-01',
        endDate: '2024-11-30',
        budget: 3800000,
        spent: 450000,
        urgency: 'Medium',
        engineersNeeded: {
            Controls: 2,
            Electrical: 4,
            Mechanical: 3,
            Robotics: 2
        },
        currentEngineers: [],
        status: 'Planning',
        progress: 5,
        travelRequired: true,
        housingProvided: true
    }
];
const timesheetDiscrepancies = [
    {
        id: 1,
        engineerName: 'John Smith',
        engineerHours: 45,
        customerHours: 40,
        difference: 5,
        weekEnding: '2024-01-12',
        status: 'needs_review',
        customer: 'Tesla Motors'
    },
    {
        id: 2,
        engineerName: 'Sarah Johnson',
        engineerHours: 38,
        customerHours: 42,
        difference: -4,
        weekEnding: '2024-01-12',
        status: 'needs_review',
        customer: 'Ford Manufacturing'
    },
    {
        id: 3,
        engineerName: 'Mike Davis',
        engineerHours: 50,
        customerHours: 50,
        difference: 0,
        weekEnding: '2024-01-12',
        status: 'auto_reconciled',
        customer: 'General Motors'
    },
];
const pipelineStages = [
    { name: 'Recruit', count: 5, icon: Users },
    { name: 'Hire', count: 3, icon: FileText },
    { name: 'Visa', count: 2, icon: FileText },
    { name: 'Deploy', count: 8, icon: CheckCircle },
];
export default function BullPenDashboard() {
    const [activeView, setActiveView] = useState('engineers');
    const [selectedEngineer, setSelectedEngineer] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [showAllocationModal, setShowAllocationModal] = useState(false);
    const [showFlightModal, setShowFlightModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [engineerActive, setEngineerActive] = useState(true);
    const filteredEngineers = availableEngineers.filter(engineer => {
        const matchesSearch = engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            engineer.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            engineer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory === 'All' || engineer.category === filterCategory;
        return matchesSearch && matchesCategory;
    });
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-white", children: "Resource Allocation Hub" }), _jsx("p", { className: "text-slate-400 mt-1", children: "Mix and match engineers for projects \u2022 Manage travel and expenses" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs(Button, { onClick: () => setShowFlightModal(true), className: "bg-blue-500 hover:bg-blue-600", children: [_jsx(Plane, { className: "h-4 w-4 mr-2" }), "Book Travel"] }), _jsxs(Button, { onClick: () => setShowExpenseModal(true), className: "bg-green-500 hover:bg-green-600", children: [_jsx(DollarSign, { className: "h-4 w-4 mr-2" }), "Track Expenses"] })] })] }), _jsxs("div", { className: "flex items-center space-x-1 bg-slate-800/50 backdrop-blur-xl rounded-xl p-1 w-fit", children: [_jsxs("button", { onClick: () => setActiveView('engineers'), className: `px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${activeView === 'engineers'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`, children: [_jsx(Users, { className: "h-4 w-4" }), _jsx("span", { children: "Engineers" })] }), _jsxs("button", { onClick: () => setActiveView('projects'), className: `px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${activeView === 'projects'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`, children: [_jsx(Briefcase, { className: "h-4 w-4" }), _jsx("span", { children: "Projects" })] }), _jsxs("button", { onClick: () => setActiveView('allocation'), className: `px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${activeView === 'allocation'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`, children: [_jsx(Target, { className: "h-4 w-4" }), _jsx("span", { children: "Allocation Matrix" })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", children: categories.map((category, index) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, children: _jsxs(Card, { className: "bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all cursor-pointer", onClick: () => setFilterCategory(category.name), children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx("div", { className: `inline-flex p-3 rounded-lg ${category.bgColor} border ${category.borderColor} mb-2`, children: _jsx(category.icon, { className: "h-6 w-6 text-white" }) }), _jsx(CardTitle, { className: "text-lg text-white", children: category.name })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-slate-400", children: "Available" }), _jsx("span", { className: "text-xl font-bold text-white", children: category.available })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-xs text-slate-500", children: "Deployed" }), _jsx("span", { className: "text-sm text-slate-300", children: category.deployed })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-xs text-slate-500", children: "Buffered" }), _jsx("span", { className: "text-sm text-slate-300", children: category.buffered })] })] }) })] }) }, category.name))) }), _jsxs(AnimatePresence, { mode: "wait", children: [activeView === 'engineers' && (_jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: "space-y-6", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "relative flex-1 max-w-md", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" }), _jsx("input", { type: "text", placeholder: "Search engineers, skills, or projects...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none" })] }), _jsxs("select", { value: filterCategory, onChange: (e) => setFilterCategory(e.target.value), className: "px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none", children: [_jsx("option", { value: "All", children: "All Categories" }), categories.map(cat => (_jsx("option", { value: cat.name, children: cat.name }, cat.name)))] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredEngineers.map((engineer, index) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "group", children: _jsxs(Card, { className: "bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300 cursor-pointer h-full", onClick: () => {
                                            setSelectedEngineer(engineer);
                                            setShowProfileModal(true);
                                        }, children: [_jsx(CardHeader, { className: "pb-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center", children: _jsx("span", { className: "text-white font-bold text-lg", children: engineer.avatar }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-white text-lg", children: engineer.name }), _jsx("p", { className: "text-sm text-slate-400", children: engineer.role })] })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Star, { className: "h-4 w-4 text-yellow-400 fill-current" }), _jsx("span", { className: "text-sm font-medium text-white", children: engineer.rating })] })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(MapPin, { className: "h-4 w-4 text-slate-400" }), _jsx("span", { className: "text-sm text-slate-300", children: engineer.location })] }), _jsx(Badge, { variant: engineer.availability === 'Available' ? 'success' : 'secondary', className: "text-xs", children: engineer.availability })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(DollarSign, { className: "h-4 w-4 text-green-400" }), _jsxs("span", { className: "text-sm font-medium text-white", children: ["$", engineer.hourlyRate, "/hr"] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "h-4 w-4 text-blue-400" }), _jsxs("span", { className: "text-sm text-slate-300", children: [engineer.experience, "y exp"] })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-400 font-medium mb-2", children: "Key Skills:" }), _jsxs("div", { className: "flex flex-wrap gap-1.5", children: [engineer.skills.slice(0, 3).map((skill, i) => (_jsx(Badge, { variant: "outline", className: "text-xs text-slate-200 bg-slate-700/50 border-slate-600 hover:bg-slate-700 transition-colors", children: skill }, i))), engineer.skills.length > 3 && (_jsxs(Badge, { variant: "outline", className: "text-xs text-slate-200 bg-slate-700/50 border-slate-600 hover:bg-slate-700 transition-colors", children: ["+", engineer.skills.length - 3, " more"] }))] })] }), _jsxs("div", { className: "flex space-x-2 pt-4", children: [_jsxs(Button, { size: "sm", className: "flex-1 bg-blue-500 hover:bg-blue-600", onClick: (e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedEngineer(engineer);
                                                                    setShowAllocationModal(true);
                                                                }, children: [_jsx(Plus, { className: "h-4 w-4 mr-1" }), "Assign to Project"] }), _jsx(Button, { size: "sm", variant: "outline", onClick: (e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedEngineer(engineer);
                                                                    setShowProfileModal(true);
                                                                }, children: _jsx(FileText, { className: "h-4 w-4" }) })] })] })] }) }, engineer.id))) })] }, "engineers")), activeView === 'projects' && (_jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: "space-y-6", children: _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: activeProjects.map((project, index) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, children: _jsxs(Card, { className: "bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-all duration-300", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold text-white", children: project.name }), _jsx("p", { className: "text-slate-400", children: project.client })] }), _jsxs(Badge, { variant: project.urgency === 'High' ? 'destructive' :
                                                            project.urgency === 'Medium' ? 'warning' : 'success', children: [project.urgency, " Priority"] })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(MapPin, { className: "h-4 w-4 text-slate-400" }), _jsx("span", { className: "text-sm text-slate-300", children: project.location })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Calendar, { className: "h-4 w-4 text-slate-400" }), _jsxs("span", { className: "text-sm text-slate-300", children: [new Date(project.startDate).toLocaleDateString(), " - ", new Date(project.endDate).toLocaleDateString()] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-500 mb-1", children: "Budget" }), _jsxs("p", { className: "text-lg font-semibold text-white", children: ["$", (project.budget / 1000000).toFixed(1), "M"] }), _jsxs("p", { className: "text-xs text-slate-400", children: ["$", (project.spent / 1000000).toFixed(1), "M spent (", ((project.spent / project.budget) * 100).toFixed(0), "%)"] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-500 mb-1", children: "Progress" }), _jsxs("p", { className: "text-lg font-semibold text-white", children: [project.progress, "%"] }), _jsx("div", { className: "w-full bg-slate-700 rounded-full h-2", children: _jsx("div", { className: "bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300", style: { width: `${project.progress}%` } }) })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-500 mb-2", children: "Engineers Needed:" }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: Object.entries(project.engineersNeeded).map(([category, count]) => (_jsxs("div", { className: "flex justify-between items-center p-2 bg-slate-900/50 rounded", children: [_jsx("span", { className: "text-sm text-slate-300", children: category }), _jsx(Badge, { variant: "outline", children: count })] }, category))) })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [project.travelRequired && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: [_jsx(Plane, { className: "h-3 w-3 mr-1" }), "Travel Required"] })), project.housingProvided && (_jsx(Badge, { variant: "outline", className: "text-xs", children: "Housing Provided" }))] }), _jsxs(Button, { className: "w-full bg-green-500 hover:bg-green-600", onClick: () => {
                                                        setSelectedProject(project);
                                                        setShowAllocationModal(true);
                                                    }, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Staff Project"] })] })] }) }, project.id))) }) }, "projects")), activeView === 'allocation' && (_jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, children: _jsxs(Card, { className: "bg-slate-800/50 border-slate-700", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-white", children: "Resource Allocation Matrix" }), _jsx(CardDescription, { children: "Real-time view of engineer-project assignments" })] }), _jsx(CardContent, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-slate-700", children: [_jsx("th", { className: "text-left p-3 text-slate-300", children: "Engineer" }), _jsx("th", { className: "text-left p-3 text-slate-300", children: "Current Project" }), _jsx("th", { className: "text-left p-3 text-slate-300", children: "End Date" }), _jsx("th", { className: "text-left p-3 text-slate-300", children: "Next Available" }), _jsx("th", { className: "text-left p-3 text-slate-300", children: "Rate" }), _jsx("th", { className: "text-left p-3 text-slate-300", children: "Actions" })] }) }), _jsx("tbody", { children: availableEngineers.map((engineer) => {
                                                        const currentProject = activeProjects.find(p => p.currentEngineers.includes(engineer.id));
                                                        return (_jsxs("tr", { className: "border-b border-slate-700/50 hover:bg-slate-700/20", children: [_jsx("td", { className: "p-3", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center", children: _jsx("span", { className: "text-white font-bold text-sm", children: engineer.avatar }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-white", children: engineer.name }), _jsx("p", { className: "text-xs text-slate-400", children: engineer.category })] })] }) }), _jsx("td", { className: "p-3", children: currentProject ? (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-white", children: currentProject.name }), _jsx("p", { className: "text-xs text-slate-400", children: currentProject.client })] })) : (_jsx(Badge, { variant: "success", children: "Available" })) }), _jsx("td", { className: "p-3", children: _jsx("span", { className: "text-sm text-slate-300", children: currentProject ? new Date(currentProject.endDate).toLocaleDateString() : '-' }) }), _jsx("td", { className: "p-3", children: _jsx("span", { className: "text-sm text-slate-300", children: currentProject ? new Date(currentProject.endDate).toLocaleDateString() : 'Now' }) }), _jsx("td", { className: "p-3", children: _jsxs("span", { className: "text-sm font-medium text-green-400", children: ["$", engineer.hourlyRate, "/hr"] }) }), _jsx("td", { className: "p-3", children: _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => {
                                                                                    setSelectedEngineer(engineer);
                                                                                    setShowAllocationModal(true);
                                                                                }, children: _jsx(Edit3, { className: "h-3 w-3" }) }), _jsx(Button, { size: "sm", className: "bg-blue-500 hover:bg-blue-600", onClick: () => setShowFlightModal(true), children: _jsx(Plane, { className: "h-3 w-3" }) })] }) })] }, engineer.id));
                                                    }) })] }) }) })] }) }, "allocation"))] }), _jsx(EngineerAllocationModal, { isOpen: showAllocationModal, onClose: () => {
                    setShowAllocationModal(false);
                    setSelectedEngineer(null);
                    setSelectedProject(null);
                }, selectedEngineer: selectedEngineer, selectedProject: selectedProject, availableEngineers: availableEngineers, activeProjects: activeProjects }), _jsx(FlightBookingModal, { isOpen: showFlightModal, onClose: () => setShowFlightModal(false), selectedEngineer: selectedEngineer }), _jsx(ExpenseTrackingModal, { isOpen: showExpenseModal, onClose: () => setShowExpenseModal(false), selectedEngineer: selectedEngineer, selectedProject: selectedProject }), _jsx(EngineerProfileModal, { isOpen: showProfileModal, onClose: () => {
                    setShowProfileModal(false);
                    setSelectedEngineer(null);
                }, engineer: selectedEngineer, onAssignToProject: (engineer) => {
                    setShowProfileModal(false);
                    setSelectedEngineer(engineer);
                    setShowAllocationModal(true);
                }, onMessage: (engineer) => {
                    console.log('Message engineer:', engineer.name);
                }, onVideoCall: (engineer) => {
                    console.log('Video call engineer:', engineer.name);
                } })] }));
}
//# sourceMappingURL=page.js.map