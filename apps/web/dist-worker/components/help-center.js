'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Search, Book, Play, Clock, Users, Zap, Shield, DollarSign, FileText, MessageCircle, ChevronRight, Star } from 'lucide-react';
import { useWalkthrough } from '@/lib/walkthrough-manager';
import { SmartTooltip, FeatureIntro } from './ui/smart-tooltip';
export function HelpCenter({ isOpen, onClose, userRole, currentPage }) {
    const [activeTab, setActiveTab] = useState('quick-help');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFeatureIntro, setShowFeatureIntro] = useState(false);
    const { startWalkthrough, getRecommendations, getContextualHelp } = useWalkthrough();
    const quickHelpItems = [
        {
            icon: Clock,
            title: 'How do I track my time?',
            description: 'Learn the simple 3-step process to clock in and out',
            action: () => startWalkthrough?.('TIMESHEET'),
            difficulty: 'BEGINNER',
            time: '3 min',
            roles: ['ENGINEER', 'NEW_USER']
        },
        {
            icon: Users,
            title: 'How do I manage my team?',
            description: 'Use the Bull Pen to see and deploy your engineers',
            action: () => startWalkthrough?.('DASHBOARD_TOUR'),
            difficulty: 'BEGINNER',
            time: '5 min',
            roles: ['MANAGER']
        },
        {
            icon: FileText,
            title: 'How do I generate reports?',
            description: 'Create professional PDFs with one click',
            action: () => startWalkthrough?.('REPORTING'),
            difficulty: 'BEGINNER',
            time: '4 min',
            roles: ['ACCOUNTANT', 'MANAGER']
        },
        {
            icon: MessageCircle,
            title: 'How does the AI chat work?',
            description: 'Get help from your intelligent assistant',
            action: () => startWalkthrough?.('CHAT_ASSISTANCE'),
            difficulty: 'BEGINNER',
            time: '4 min',
            roles: ['NEW_USER', 'ENGINEER', 'MANAGER']
        },
        {
            icon: Shield,
            title: 'Why do I need biometric verification?',
            description: 'Understanding security and compliance requirements',
            action: () => setShowFeatureIntro(true),
            difficulty: 'BEGINNER',
            time: '2 min',
            roles: ['ENGINEER', 'NEW_USER']
        },
        {
            icon: DollarSign,
            title: 'How do I understand the financials?',
            description: 'Reading revenue, costs, and profit charts',
            action: () => startWalkthrough?.('BILLING'),
            difficulty: 'INTERMEDIATE',
            time: '5 min',
            roles: ['ACCOUNTANT', 'MANAGER']
        }
    ];
    const tutorials = [
        {
            id: 'onboarding',
            title: '🏠 Getting Started Tour',
            description: 'Perfect for first-time users - covers all the basics',
            difficulty: 'BEGINNER',
            time: '5 min',
            steps: 4,
            roles: ['NEW_USER'],
            action: () => startWalkthrough?.('ONBOARDING')
        },
        {
            id: 'timesheet',
            title: '⏰ Time Tracking Mastery',
            description: 'Learn secure time tracking with biometric verification',
            difficulty: 'BEGINNER',
            time: '3 min',
            steps: 4,
            roles: ['ENGINEER', 'NEW_USER'],
            action: () => startWalkthrough?.('TIMESHEET')
        },
        {
            id: 'recruiting',
            title: '👥 Hiring Process Guide',
            description: 'Complete walkthrough of the recruitment workflow',
            difficulty: 'INTERMEDIATE',
            time: '7 min',
            steps: 5,
            roles: ['RECRUITER', 'MANAGER'],
            action: () => startWalkthrough?.('RECRUITING')
        },
        {
            id: 'reporting',
            title: '📊 Report Generation Magic',
            description: 'Create professional reports and automate delivery',
            difficulty: 'BEGINNER',
            time: '4 min',
            steps: 4,
            roles: ['ACCOUNTANT', 'MANAGER'],
            action: () => startWalkthrough?.('REPORTING')
        },
        {
            id: 'documents',
            title: '📚 Knowledge Base Setup',
            description: 'Upload documents and train your AI assistant',
            difficulty: 'BEGINNER',
            time: '3 min',
            steps: 3,
            roles: ['MANAGER', 'ADMIN'],
            action: () => startWalkthrough?.('DOCUMENT_UPLOAD')
        },
        {
            id: 'chat',
            title: '🤖 AI Assistant Mastery',
            description: 'Get the most out of your intelligent helper',
            difficulty: 'BEGINNER',
            time: '4 min',
            steps: 4,
            roles: ['NEW_USER', 'ENGINEER', 'MANAGER'],
            action: () => startWalkthrough?.('CHAT_ASSISTANCE')
        }
    ];
    const searchableContent = [
        { term: 'clock in time tracking', content: 'Use the time tracking section to clock in with biometric verification' },
        { term: 'upload documents knowledge base', content: 'Go to Knowledge section and drag/drop your files' },
        { term: 'generate reports pdf', content: 'Use the Reports section to create automated PDFs' },
        { term: 'add engineer recruit hire', content: 'Use the Operations workflow to add new candidates' },
        { term: 'bull pen team management', content: 'Bull Pen shows all engineers and their deployment status' },
        { term: 'chat ai assistant help', content: 'Click the chat bubble to ask questions and get help' },
        { term: 'biometric fingerprint face scan', content: 'Security feature that uses your unique biometric data for verification' },
        { term: 'location gps verification', content: 'Automatic location checking to ensure you\'re at the right work site' },
        { term: 'notifications email sms alerts', content: 'System sends automatic alerts for important events' },
        { term: 'compliance audit trail legal', content: 'All actions are logged for legal compliance and audit purposes' }
    ];
    const filteredQuickHelp = quickHelpItems.filter(item => item.roles.includes(userRole) || item.roles.includes('NEW_USER'));
    const filteredTutorials = tutorials.filter(tutorial => tutorial.roles.includes(userRole) || tutorial.roles.includes('NEW_USER'));
    const filteredSearch = searchableContent.filter(item => item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()));
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'BEGINNER': return 'text-green-400 bg-green-400/10';
            case 'INTERMEDIATE': return 'text-yellow-400 bg-yellow-400/10';
            case 'ADVANCED': return 'text-red-400 bg-red-400/10';
            default: return 'text-blue-400 bg-blue-400/10';
        }
    };
    if (!isOpen)
        return null;
    return (_jsxs(_Fragment, { children: [_jsxs(AnimatePresence, { children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]", onClick: onClose }, "help-backdrop"), _jsx(motion.div, { initial: { opacity: 0, scale: 0.9, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.9, y: 20 }, className: "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-4xl max-h-[90vh] overflow-hidden", children: _jsxs("div", { className: "bg-slate-800/95 backdrop-blur-xl border border-slate-600 rounded-2xl shadow-2xl", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-slate-600", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-blue-500/20 rounded-lg", children: _jsx(HelpCircle, { className: "w-6 h-6 text-blue-400" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-white", children: "Help Center" }), _jsxs("p", { className: "text-sm text-slate-400", children: ["Designed for ", userRole.toLowerCase().replace('_', ' '), " users"] })] })] }), _jsx("button", { onClick: onClose, className: "p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "p-4 bg-blue-500/10 border-b border-slate-600", children: _jsxs("p", { className: "text-sm text-blue-200", children: [_jsx("strong", { children: "Current page:" }), " ", getContextualHelp(currentPage)] }) }), _jsx("div", { className: "flex border-b border-slate-600", children: [
                                        { id: 'quick-help', label: 'Quick Help', icon: Zap },
                                        { id: 'tutorials', label: 'Tutorials', icon: Play },
                                        { id: 'search', label: 'Search', icon: Search }
                                    ].map(tab => (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `
                    flex items-center gap-2 px-6 py-4 transition-colors
                    ${activeTab === tab.id
                                            ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'}
                  `, children: [_jsx(tab.icon, { className: "w-4 h-4" }), tab.label] }, tab.id))) }), _jsxs("div", { className: "p-6 max-h-96 overflow-y-auto", children: [activeTab === 'quick-help' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4", children: ["\uD83D\uDE80 Quick Help for ", userRole.toLowerCase().replace('_', ' '), " Users"] }), filteredQuickHelp.map((item, index) => (_jsx("div", { className: "group p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg border border-slate-600/50 hover:border-slate-500 transition-all cursor-pointer", onClick: item.action, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors", children: _jsx(item.icon, { className: "w-5 h-5 text-blue-400" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium text-white mb-1", children: item.title }), _jsx("p", { className: "text-sm text-slate-300 mb-2", children: item.description }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `text-xs px-2 py-1 rounded-full ${getDifficultyColor(item.difficulty)}`, children: item.difficulty }), _jsx("span", { className: "text-xs text-slate-400", children: item.time })] })] }), _jsx(ChevronRight, { className: "w-4 h-4 text-slate-400 group-hover:text-white transition-colors" })] }) }, index)))] })), activeTab === 'tutorials' && (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "\uD83C\uDF93 Interactive Tutorials" }), filteredTutorials.map((tutorial, index) => (_jsx("div", { className: "group p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg border border-slate-600/50 hover:border-slate-500 transition-all cursor-pointer", onClick: tutorial.action, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors", children: _jsx(Play, { className: "w-5 h-5 text-purple-400" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium text-white mb-1", children: tutorial.title }), _jsx("p", { className: "text-sm text-slate-300 mb-2", children: tutorial.description }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `text-xs px-2 py-1 rounded-full ${getDifficultyColor(tutorial.difficulty)}`, children: tutorial.difficulty }), _jsx("span", { className: "text-xs text-slate-400", children: tutorial.time }), _jsx("span", { className: "text-xs text-slate-400", children: "\u2022" }), _jsxs("span", { className: "text-xs text-slate-400", children: [tutorial.steps, " steps"] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Star, { className: "w-4 h-4 text-yellow-400" }), _jsx(ChevronRight, { className: "w-4 h-4 text-slate-400 group-hover:text-white transition-colors" })] })] }) }, tutorial.id)))] })), activeTab === 'search' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: "text", placeholder: "Search for help... (e.g., 'how to clock in', 'upload documents')", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400" })] }), searchQuery && (_jsxs("div", { className: "space-y-3", children: [_jsxs("h3", { className: "text-lg font-semibold text-white", children: ["Search Results for \"", searchQuery, "\""] }), filteredSearch.length > 0 ? (filteredSearch.map((result, index) => (_jsxs("div", { className: "p-4 bg-slate-700/30 rounded-lg border border-slate-600/50", children: [_jsx("p", { className: "text-white font-medium mb-1 capitalize", children: result.term.replace(/\b\w/g, l => l.toUpperCase()) }), _jsx("p", { className: "text-sm text-slate-300", children: result.content })] }, index)))) : (_jsxs("div", { className: "p-8 text-center", children: [_jsx(Book, { className: "w-12 h-12 text-slate-400 mx-auto mb-3" }), _jsx("p", { className: "text-slate-400", children: "No results found. Try searching for \"time tracking\", \"reports\", or \"chat\"" })] }))] })), !searchQuery && (_jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "\uD83D\uDCA1 Popular Help Topics" }), [
                                                            'How to clock in and out',
                                                            'Upload documents to knowledge base',
                                                            'Generate timesheet reports',
                                                            'Use AI chat assistant',
                                                            'Manage engineer deployments',
                                                            'Understanding biometric security'
                                                        ].map((topic, index) => (_jsx("button", { onClick: () => setSearchQuery(topic), className: "block w-full text-left p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg border border-slate-600/50 hover:border-slate-500 transition-all", children: _jsx("span", { className: "text-white", children: topic }) }, index)))] }))] }))] }), _jsx("div", { className: "p-4 border-t border-slate-600 bg-slate-800/50", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-xs text-slate-400", children: "Need more help? Ask the AI chat assistant! \uD83D\uDCAC" }), _jsx("div", { className: "flex gap-2", children: _jsx(SmartTooltip, { id: "help-center-tip", title: "\uD83D\uDCA1 Pro Tip", content: "You can access help anytime by pressing F1 or clicking the help icon in the top-right corner!", type: "TIP", placement: "TOP", userRole: userRole, children: _jsx("button", { className: "text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors", children: "Pro Tips" }) }) })] }) })] }) }, "help-modal")] }), showFeatureIntro && (_jsx(FeatureIntro, { title: "\uD83D\uDD10 Biometric Security Explained", description: "Understanding why we use fingerprint and face scanning for time tracking", benefits: [
                    'Prevents time theft and buddy punching',
                    'Ensures accurate billing to clients',
                    'Meets legal compliance requirements',
                    'Same technology as your smartphone',
                    'Quick and convenient - takes 2 seconds'
                ], difficulty: "BEGINNER", estimatedTime: "2 minutes", onStartTour: () => {
                    setShowFeatureIntro(false);
                    startWalkthrough?.('TIMESHEET');
                }, onDismiss: () => setShowFeatureIntro(false) }))] }));
}
export function GlobalHelpTrigger() {
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [userRole, setUserRole] = useState('NEW_USER');
    const [currentPage, setCurrentPage] = useState('/');
    useEffect(() => {
        const savedRole = localStorage.getItem('userRole') || 'NEW_USER';
        setUserRole(savedRole);
        setCurrentPage(window.location.pathname);
        const handleKeyPress = (e) => {
            if (e.key === 'F1' || (e.ctrlKey && e.key === 'h')) {
                e.preventDefault();
                setIsHelpOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx(SmartTooltip, { id: "global-help-trigger", title: "\uD83C\uDD98 Need Help?", content: "Click here or press F1 to open the help center. Get tutorials, tips, and guided walkthroughs!", type: "HELP", placement: "BOTTOM_LEFT", userRole: userRole, children: _jsx("button", { onClick: () => setIsHelpOpen(true), className: "fixed bottom-6 right-6 z-[9998] p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-2xl transition-all hover:scale-110", children: _jsx(HelpCircle, { className: "w-6 h-6" }) }) }), _jsx(HelpCenter, { isOpen: isHelpOpen, onClose: () => setIsHelpOpen(false), userRole: userRole, currentPage: currentPage })] }));
}
//# sourceMappingURL=help-center.js.map