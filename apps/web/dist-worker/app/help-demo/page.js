'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, DollarSign, FileText, MessageCircle, Shield, BarChart3, Play } from 'lucide-react';
import { SmartTooltip, HelpButton, FeatureIntro } from '@/components/ui/smart-tooltip';
import { HelpCenter } from '@/components/help-center';
import { useWalkthrough } from '@/lib/walkthrough-manager';
export default function HelpDemoPage() {
    const [userRole, setUserRole] = useState('NEW_USER');
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [showFeatureIntro, setShowFeatureIntro] = useState(false);
    const { startWalkthrough } = useWalkthrough();
    const demoFeatures = [
        {
            icon: Clock,
            title: 'Time Tracking',
            description: 'Clock in and out with biometric verification',
            tooltipContent: 'Use your fingerprint or face scan to track work hours. It\'s like unlocking your phone but for work! The system automatically knows if you\'re at the right location.',
            role: 'ENGINEER',
            difficulty: 'BEGINNER'
        },
        {
            icon: Users,
            title: 'Team Management',
            description: 'Manage engineers and deployments',
            tooltipContent: 'The Bull Pen shows all your engineers like a sports team roster. Green means available, yellow means busy, red means unavailable. Click to deploy them to projects!',
            role: 'MANAGER',
            difficulty: 'INTERMEDIATE'
        },
        {
            icon: DollarSign,
            title: 'Financial Reports',
            description: 'Generate revenue and cost analysis',
            tooltipContent: 'Create beautiful PDF reports automatically. Choose your date range, select report type, and click generate. The system does all the math and formatting for you!',
            role: 'ACCOUNTANT',
            difficulty: 'BEGINNER'
        },
        {
            icon: FileText,
            title: 'Document Upload',
            description: 'Add files to the knowledge base',
            tooltipContent: 'Drag and drop your company documents here. The AI will read them and can answer questions about them later. It\'s like having a super-smart filing cabinet!',
            role: 'MANAGER',
            difficulty: 'BEGINNER'
        },
        {
            icon: MessageCircle,
            title: 'AI Chat Assistant',
            description: 'Get help from your intelligent helper',
            tooltipContent: 'Ask questions in plain English! "How many hours did John work?" or "What are our safety protocols?" The AI knows everything about your company.',
            role: 'NEW_USER',
            difficulty: 'BEGINNER'
        },
        {
            icon: Shield,
            title: 'Security & Compliance',
            description: 'Understand system security features',
            tooltipContent: 'All actions are logged for legal compliance. Biometric verification prevents fraud. Location tracking ensures accurate billing. It\'s like having a security guard for your data!',
            role: 'ADMIN',
            difficulty: 'INTERMEDIATE'
        }
    ];
    const roleColors = {
        'NEW_USER': 'from-blue-500 to-cyan-500',
        'ENGINEER': 'from-green-500 to-emerald-500',
        'MANAGER': 'from-purple-500 to-violet-500',
        'RECRUITER': 'from-orange-500 to-amber-500',
        'ACCOUNTANT': 'from-red-500 to-rose-500',
        'ADMIN': 'from-gray-500 to-slate-500',
        'CLIENT': 'from-indigo-500 to-blue-500',
        'VIEWER': 'from-gray-400 to-gray-500'
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6", children: [_jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h1", { className: "text-4xl font-bold text-white mb-4", children: "\uD83C\uDF93 Interactive Help System Demo" }), _jsx("p", { className: "text-xl text-slate-300 mb-8", children: "Experience our intelligent tooltip and walkthrough system designed for 9th-grade simplicity" }), _jsxs("div", { className: "flex flex-wrap justify-center gap-2 mb-8", children: [_jsx("span", { className: "text-sm text-slate-400 mr-4", children: "Select your role:" }), Object.keys(roleColors).map(role => (_jsx("button", { onClick: () => setUserRole(role), className: `
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${userRole === role
                                            ? `bg-gradient-to-r ${roleColors[role]} text-white`
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
                `, children: role.replace('_', ' ') }, role)))] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12", children: demoFeatures.map((feature, index) => (_jsx(SmartTooltip, { id: `demo-${feature.title.toLowerCase().replace(' ', '-')}`, title: `${feature.title} (${feature.difficulty})`, content: feature.tooltipContent, type: "FEATURE", placement: "TOP", userRole: userRole, trigger: "hover", hasAction: true, actionText: "Start Tutorial", onAction: () => {
                                if (feature.title === 'Time Tracking')
                                    startWalkthrough?.('TIMESHEET');
                                else if (feature.title === 'Team Management')
                                    startWalkthrough?.('DASHBOARD_TOUR');
                                else if (feature.title === 'Financial Reports')
                                    startWalkthrough?.('REPORTING');
                                else if (feature.title === 'Document Upload')
                                    startWalkthrough?.('DOCUMENT_UPLOAD');
                                else if (feature.title === 'AI Chat Assistant')
                                    startWalkthrough?.('CHAT_ASSISTANCE');
                                else
                                    setShowFeatureIntro(true);
                            }, children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: `
                  p-6 rounded-xl border border-slate-600/50 backdrop-blur-xl cursor-pointer
                  transition-all duration-300 hover:scale-105 hover:border-slate-500
                  ${userRole === feature.role || userRole === 'NEW_USER'
                                    ? 'bg-slate-700/50 hover:bg-slate-700/70'
                                    : 'bg-slate-800/30 opacity-60'}
                `, children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: `
                    p-3 rounded-lg bg-gradient-to-r ${roleColors[feature.role]}
                  `, children: _jsx(feature.icon, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-white", children: feature.title }), _jsx("span", { className: "text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400", children: feature.difficulty })] })] }), _jsx("p", { className: "text-slate-300 text-sm leading-relaxed", children: feature.description }), _jsx("div", { className: "mt-4 pt-4 border-t border-slate-600/50", children: _jsxs("span", { className: "text-xs text-slate-400", children: ["Best for: ", _jsx("span", { className: "text-slate-300", children: feature.role.replace('_', ' ') })] }) })] }) }, feature.title))) }), _jsxs("div", { className: "flex flex-wrap justify-center gap-4 mb-12", children: [_jsxs("button", { onClick: () => setIsHelpOpen(true), className: "flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors", children: [_jsx(MessageCircle, { className: "w-5 h-5" }), "Open Help Center"] }), _jsxs("button", { onClick: () => startWalkthrough?.('ONBOARDING'), className: "flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors", children: [_jsx(Play, { className: "w-5 h-5" }), "Start Onboarding Tour"] }), _jsxs("button", { onClick: () => setShowFeatureIntro(true), className: "flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors", children: [_jsx(BarChart3, { className: "w-5 h-5" }), "Feature Introduction"] })] }), _jsxs("div", { className: "bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-slate-600/50", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-6 text-center", children: "\uD83C\uDFAF How to Test the Help System" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-3", children: "\uD83D\uDCF1 Interactive Elements" }), _jsxs("ul", { className: "space-y-2 text-slate-300", children: [_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-blue-400 rounded-full" }), _jsx("strong", { children: "Hover" }), " over any feature card to see smart tooltips"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-400 rounded-full" }), _jsx("strong", { children: "Click" }), " \"Start Tutorial\" in tooltips for guided tours"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-purple-400 rounded-full" }), _jsx("strong", { children: "Press F1" }), " or click help button for assistance"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-yellow-400 rounded-full" }), _jsx("strong", { children: "Change roles" }), " to see different help content"] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-3", children: "\uD83E\uDDE0 Smart Features" }), _jsxs("ul", { className: "space-y-2 text-slate-300", children: [_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-blue-400 rounded-full" }), _jsx("strong", { children: "Role-based content" }), " - Only see relevant help"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-400 rounded-full" }), _jsx("strong", { children: "Progress tracking" }), " - System remembers what you've learned"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-purple-400 rounded-full" }), _jsx("strong", { children: "Contextual help" }), " - Different help for each page"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-yellow-400 rounded-full" }), _jsx("strong", { children: "9th-grade language" }), " - Simple explanations for everything"] })] })] })] }), _jsx("div", { className: "mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20", children: _jsxs("p", { className: "text-blue-200 text-center", children: [_jsx("strong", { children: "\uD83D\uDCA1 Pro Tip:" }), " The help system learns from your role and shows only relevant information. New users get more detailed explanations, while experienced users get quick tips!"] }) })] }), _jsxs("div", { className: "mt-12", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-6 text-center", children: "\uD83C\uDFA8 Tooltip Examples by User Role" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(SmartTooltip, { id: "engineer-example", title: "\u23F0 For Engineers", content: "This button starts your work timer. Just like clocking in at any job, but with fingerprint security to make sure it's really you!", type: "PROCESS", placement: "TOP", userRole: "ENGINEER", hasAction: true, actionText: "Learn More", onAction: () => startWalkthrough?.('TIMESHEET'), children: _jsxs("div", { className: "p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-center cursor-pointer hover:bg-green-500/30 transition-colors", children: [_jsx(Clock, { className: "w-8 h-8 text-green-400 mx-auto mb-2" }), _jsx("p", { className: "text-white font-medium", children: "Clock In" }), _jsx("p", { className: "text-xs text-green-300", children: "Hover me!" })] }) }), _jsx(SmartTooltip, { id: "manager-example", title: "\uD83D\uDC65 For Managers", content: "The Bull Pen shows your team like a sports roster. See who's available (green), busy (yellow), or deployed (blue). Click an engineer to assign them to projects!", type: "FEATURE", placement: "TOP", userRole: "MANAGER", hasAction: true, actionText: "Take Tour", onAction: () => startWalkthrough?.('DASHBOARD_TOUR'), children: _jsxs("div", { className: "p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg text-center cursor-pointer hover:bg-purple-500/30 transition-colors", children: [_jsx(Users, { className: "w-8 h-8 text-purple-400 mx-auto mb-2" }), _jsx("p", { className: "text-white font-medium", children: "Team View" }), _jsx("p", { className: "text-xs text-purple-300", children: "Hover me!" })] }) }), _jsx(SmartTooltip, { id: "accountant-example", title: "\uD83D\uDCB0 For Accountants", content: "Generate professional financial reports with one click! Choose timesheet summary, profit analysis, or client billing. The system creates beautiful PDFs automatically.", type: "PROCESS", placement: "TOP", userRole: "ACCOUNTANT", hasAction: true, actionText: "Learn Reports", onAction: () => startWalkthrough?.('REPORTING'), children: _jsxs("div", { className: "p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-center cursor-pointer hover:bg-red-500/30 transition-colors", children: [_jsx(DollarSign, { className: "w-8 h-8 text-red-400 mx-auto mb-2" }), _jsx("p", { className: "text-white font-medium", children: "Reports" }), _jsx("p", { className: "text-xs text-red-300", children: "Hover me!" })] }) }), _jsx(SmartTooltip, { id: "new-user-example", title: "\uD83E\uDD16 For Everyone", content: "Your AI assistant knows everything about the company! Ask questions like 'How do I submit my timesheet?' or 'What are our safety rules?' It's like having a super-smart coworker!", type: "HELP", placement: "TOP", userRole: "NEW_USER", hasAction: true, actionText: "Try Chat", onAction: () => startWalkthrough?.('CHAT_ASSISTANCE'), children: _jsxs("div", { className: "p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg text-center cursor-pointer hover:bg-blue-500/30 transition-colors", children: [_jsx(MessageCircle, { className: "w-8 h-8 text-blue-400 mx-auto mb-2" }), _jsx("p", { className: "text-white font-medium", children: "AI Chat" }), _jsx("p", { className: "text-xs text-blue-300", children: "Hover me!" })] }) })] })] }), _jsxs("div", { className: "mt-12 bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-slate-600/50", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-6 text-center", children: "\uD83D\uDDE3\uFE0F Simple Language Examples" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "\u274C Complex Technical Terms" }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "p-3 bg-red-500/10 border border-red-500/20 rounded-lg", children: _jsx("p", { className: "text-red-300 text-sm", children: "\"Implement biometric authentication protocols\"" }) }), _jsx("div", { className: "p-3 bg-red-500/10 border border-red-500/20 rounded-lg", children: _jsx("p", { className: "text-red-300 text-sm", children: "\"Execute timesheet reconciliation procedures\"" }) }), _jsx("div", { className: "p-3 bg-red-500/10 border border-red-500/20 rounded-lg", children: _jsx("p", { className: "text-red-300 text-sm", children: "\"Configure multi-tenant RAG architecture\"" }) })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "\u2705 9th Grade Simple" }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "p-3 bg-green-500/10 border border-green-500/20 rounded-lg", children: _jsx("p", { className: "text-green-300 text-sm", children: "\"Use your fingerprint to clock in - like unlocking your phone!\"" }) }), _jsx("div", { className: "p-3 bg-green-500/10 border border-green-500/20 rounded-lg", children: _jsx("p", { className: "text-green-300 text-sm", children: "\"Check if engineer hours match client hours - like balancing a checkbook\"" }) }), _jsx("div", { className: "p-3 bg-green-500/10 border border-green-500/20 rounded-lg", children: _jsx("p", { className: "text-green-300 text-sm", children: "\"Upload documents so the AI can read them and answer questions\"" }) })] })] })] })] }), _jsxs("div", { className: "mt-12 text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-6", children: "\uD83D\uDD18 Interactive Help Buttons" }), _jsxs("div", { className: "flex flex-wrap justify-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2 p-4 bg-slate-700/30 rounded-lg", children: [_jsx("span", { className: "text-white", children: "Time Tracking" }), _jsx(HelpButton, { content: "Clock in when you start work, clock out when you finish. The system uses your fingerprint or face scan to make sure it's really you - just like unlocking your phone!", title: "\u23F0 Time Tracking Help", placement: "TOP" })] }), _jsxs("div", { className: "flex items-center gap-2 p-4 bg-slate-700/30 rounded-lg", children: [_jsx("span", { className: "text-white", children: "Bull Pen" }), _jsx(HelpButton, { content: "Think of this like a sports team roster. Green players are available, yellow are busy, blue are deployed to games (projects). Click to assign them!", title: "\uD83C\uDFDF\uFE0F Bull Pen Explained", placement: "TOP" })] }), _jsxs("div", { className: "flex items-center gap-2 p-4 bg-slate-700/30 rounded-lg", children: [_jsx("span", { className: "text-white", children: "Reports" }), _jsx(HelpButton, { content: "Create professional reports automatically! Choose what you want to see (timesheet, money, performance) and the system makes a beautiful PDF for you.", title: "\uD83D\uDCCA Report Generation", placement: "TOP" })] })] })] })] }), _jsx(HelpCenter, { isOpen: isHelpOpen, onClose: () => setIsHelpOpen(false), userRole: userRole, currentPage: "/help-demo" }), showFeatureIntro && (_jsx(FeatureIntro, { title: "\uD83D\uDD10 Security Features Explained", description: "Understanding why we use advanced security in simple terms", benefits: [
                    'Prevents employees from clocking in for each other',
                    'Ensures accurate billing to clients',
                    'Meets legal requirements for time tracking',
                    'Uses the same technology as your smartphone',
                    'Takes only 2 seconds to verify'
                ], difficulty: "BEGINNER", estimatedTime: "2 minutes", onStartTour: () => {
                    setShowFeatureIntro(false);
                    startWalkthrough?.('TIMESHEET');
                }, onDismiss: () => setShowFeatureIntro(false) }))] }));
}
//# sourceMappingURL=page.js.map