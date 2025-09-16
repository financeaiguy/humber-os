'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, X, Send, Paperclip, Bot, Minimize2, Maximize2, Users, FileText, Trash2, Copy, RefreshCw, ChevronDown } from 'lucide-react';
export function ChatWidget({ isOpen, onToggle, className = '' }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [selectedEngineer, setSelectedEngineer] = useState(null);
    const [showEngineerDropdown, setShowEngineerDropdown] = useState(false);
    const [chatMode, setChatMode] = useState('documents');
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const messagesEndRef = useRef(null);
    useEffect(() => {
        const checkConnection = async () => {
            try {
                setConnectionStatus('connecting');
                const response = await fetch('http://localhost:8787/health', {
                    method: 'GET',
                    headers: { 'X-Tenant-ID': 'demo-tenant' }
                });
                if (response.ok) {
                    setIsConnected(true);
                    setConnectionStatus('connected');
                }
                else {
                    setIsConnected(false);
                    setConnectionStatus('disconnected');
                }
            }
            catch (error) {
                console.error('AI connection check failed:', error);
                setIsConnected(false);
                setConnectionStatus('disconnected');
            }
        };
        checkConnection();
        const interval = setInterval(checkConnection, 30000);
        return () => clearInterval(interval);
    }, []);
    const engineers = [
        {
            id: 'eng_001',
            name: 'Sarah Johnson',
            category: 'ELECTRICAL_ENGINEER',
            status: 'deployed',
            currentProject: 'GM Assembly Line Automation',
            hourlyRate: 85,
            location: 'Detroit, MI',
            skills: ['PLC Programming', 'HMI Design', 'Motor Controls']
        },
        {
            id: 'eng_002',
            name: 'Michael Chen',
            category: 'MECHANICAL_ENGINEER',
            status: 'available',
            hourlyRate: 80,
            location: 'Dearborn, MI',
            skills: ['CAD Design', 'Manufacturing', 'Quality Control']
        },
        {
            id: 'eng_003',
            name: 'Emily Rodriguez',
            category: 'SOFTWARE_ENGINEER',
            status: 'deployed',
            currentProject: 'Ford Paint Shop Upgrade',
            hourlyRate: 95,
            location: 'Remote',
            skills: ['React', 'Node.js', 'Database Design']
        },
        {
            id: 'eng_004',
            name: 'David Kim',
            category: 'SYSTEMS_ENGINEER',
            status: 'processing',
            hourlyRate: 88,
            location: 'Grand Rapids, MI',
            skills: ['System Integration', 'Network Design', 'Troubleshooting']
        },
        {
            id: 'eng_005',
            name: 'Lisa Thompson',
            category: 'PROJECT_ENGINEER',
            status: 'available',
            hourlyRate: 75,
            location: 'Troy, MI',
            skills: ['Project Management', 'Timeline Planning', 'Client Relations']
        }
    ];
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading)
            return;
        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        try {
            let contextMessage = input;
            if (chatMode === 'engineer' && selectedEngineer) {
                contextMessage = `Context: I'm asking about ${selectedEngineer.name}, a ${selectedEngineer.category} engineer who is currently ${selectedEngineer.status}${selectedEngineer.currentProject ? ` on project: ${selectedEngineer.currentProject}` : ''}. Their skills include: ${selectedEngineer.skills?.join(', ')}. They are located in ${selectedEngineer.location} with an hourly rate of $${selectedEngineer.hourlyRate}.\n\nQuestion: ${input}`;
            }
            if (!isConnected) {
                throw new Error('AI models are not connected');
            }
            const response = await fetch('http://localhost:8787/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tenant-ID': 'demo-tenant'
                },
                body: JSON.stringify({
                    message: contextMessage,
                    useRAG: chatMode === 'documents',
                    maxDocuments: 5,
                    engineerContext: selectedEngineer
                })
            });
            if (response.ok) {
                const data = await response.json();
                const assistantMessage = {
                    id: data.messageId,
                    role: 'assistant',
                    content: data.content,
                    sources: data.sourceDocuments?.map((doc) => ({
                        title: doc.metadata.documentTitle,
                        relevance: doc.score
                    })),
                    timestamp: Date.now()
                };
                setMessages(prev => [...prev, assistantMessage]);
            }
            else {
                throw new Error('Failed to get response');
            }
        }
        catch (error) {
            console.error('Chat error:', error);
            const errorContent = !isConnected
                ? 'AI models are currently offline. Please check your connection and try again. The system uses Llama 4 Scout and 120B parameter open-source models via Cloudflare Workers AI.'
                : 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.';
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: errorContent,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
        finally {
            setIsLoading(false);
        }
    };
    if (!isOpen) {
        return (_jsx(motion.button, { initial: { scale: 0 }, animate: { scale: 1 }, onClick: onToggle, className: `fixed bottom-6 right-6 h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 ${className}`, children: _jsx(MessageSquare, { className: "h-8 w-8 text-white" }) }));
    }
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 20, scale: 0.95 }, className: `fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl z-50 flex flex-col ${className}`, style: {
            width: isMinimized ? 'auto' : '800px',
            height: isMinimized ? 'auto' : '85vh',
            maxWidth: isMinimized ? 'auto' : 'calc(100vw - 2rem)',
            maxHeight: isMinimized ? 'auto' : 'calc(100vh - 2rem)'
        }, children: [_jsxs("div", { className: `p-4 flex-shrink-0 ${isMinimized ? '' : 'border-b border-slate-700/50'}`, children: [_jsx("div", { className: `flex items-center ${isMinimized ? 'space-x-2' : 'justify-between mb-4'}`, children: isMinimized ? (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => setIsMinimized(false), className: "flex items-center space-x-2 hover:bg-slate-700/30 rounded-lg p-2 transition-all group cursor-pointer", children: [_jsx("div", { className: "h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0", children: _jsx(Bot, { className: "h-4 w-4 text-white" }) }), _jsx("div", { className: "pr-2", children: _jsx("h3", { className: "text-sm font-semibold text-white whitespace-nowrap", children: "Humber AI" }) }), _jsx(Maximize2, { className: "h-4 w-4 text-slate-400 group-hover:text-white transition-colors" })] }), _jsx("button", { onClick: onToggle, className: "p-2 hover:bg-slate-700/50 rounded-lg transition-colors ml-1", title: "Close chat", children: _jsx(X, { className: "h-4 w-4 text-slate-400 hover:text-white" }) })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center space-x-3 sm:space-x-4", children: [_jsx("div", { className: "h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center", children: _jsx(Bot, { className: "h-5 w-5 sm:h-6 sm:w-6 text-white" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("h3", { className: "text-lg sm:text-xl font-semibold text-white truncate", children: "Humber AI Assistant" }), _jsxs("p", { className: "text-xs sm:text-sm text-slate-400 truncate flex items-center gap-2", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                                                                connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                                                                    'bg-red-400'}` }), connectionStatus === 'connected' ? (chatMode === 'engineer' && selectedEngineer
                                                            ? `Chatting about ${selectedEngineer.name}`
                                                            : chatMode === 'documents'
                                                                ? 'Powered by Llama 4 Scout & 120B OSS'
                                                                : 'Open-source AI models connected') : connectionStatus === 'connecting' ? ('Connecting to AI models...') : ('AI models offline')] })] })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("button", { onClick: () => setMessages([]), className: "p-2 hover:bg-slate-700/50 rounded-lg transition-colors", title: "Clear chat", children: _jsx(Trash2, { className: "h-4 w-4 text-slate-400" }) }), _jsx("button", { onClick: () => setIsMinimized(!isMinimized), className: "p-2 hover:bg-slate-700/50 rounded-lg transition-colors", children: _jsx(Minimize2, { className: "h-4 w-4 text-slate-400" }) }), _jsx("button", { onClick: onToggle, className: "p-2 hover:bg-slate-700/50 rounded-lg transition-colors", children: _jsx(X, { className: "h-4 w-4 text-slate-400" }) })] })] })) }), !isMinimized && (_jsxs("div", { className: "flex items-center space-x-1 sm:space-x-3", children: [_jsxs("button", { onClick: () => setChatMode('documents'), className: `px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${chatMode === 'documents'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'}`, children: [_jsx(FileText, { className: "h-4 w-4 inline mr-1 sm:mr-2" }), _jsx("span", { className: "hidden sm:inline", children: "Documents" }), _jsx("span", { className: "sm:hidden", children: "Docs" })] }), _jsxs("button", { onClick: () => setChatMode('engineer'), className: `px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${chatMode === 'engineer'
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'}`, children: [_jsx(Users, { className: "h-4 w-4 inline mr-1 sm:mr-2" }), _jsx("span", { className: "hidden sm:inline", children: "Bull Pen" }), _jsx("span", { className: "sm:hidden", children: "Bull Pen" })] }), _jsxs("button", { onClick: () => setChatMode('general'), className: `px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${chatMode === 'general'
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'}`, children: [_jsx(MessageSquare, { className: "h-4 w-4 inline mr-1 sm:mr-2" }), _jsx("span", { className: "hidden sm:inline", children: "General" }), _jsx("span", { className: "sm:hidden", children: "Gen" })] })] })), !isMinimized && chatMode === 'engineer' && (_jsxs("div", { className: "mt-3 relative", children: [_jsxs("button", { onClick: () => setShowEngineerDropdown(!showEngineerDropdown), className: "w-full flex items-center justify-between px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white hover:border-slate-500 transition-colors", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [selectedEngineer && (_jsx("div", { className: "h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs font-semibold", children: selectedEngineer.name.split(' ').map(n => n[0]).join('') })), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "text-sm font-medium", children: selectedEngineer ? selectedEngineer.name : 'Select Engineer from Bull Pen' }), selectedEngineer && (_jsxs("p", { className: "text-xs text-slate-400", children: [selectedEngineer.category.replace('_', ' '), " \u2022 ", selectedEngineer.status] }))] })] }), _jsx(ChevronDown, { className: "h-5 w-5 text-slate-400" })] }), showEngineerDropdown && (_jsx("div", { className: "absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto", children: engineers.map((engineer) => (_jsx("button", { onClick: () => {
                                        setSelectedEngineer(engineer);
                                        setShowEngineerDropdown(false);
                                        setMessages([]);
                                    }, className: "w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors border-b border-slate-700 last:border-b-0", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-semibold", children: engineer.name.split(' ').map(n => n[0]).join('') }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-white", children: engineer.name }), _jsx("p", { className: "text-xs text-slate-400", children: engineer.category.replace('_', ' ') })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: `text-xs px-2 py-1 rounded-full ${engineer.status === 'deployed' ? 'bg-green-500/20 text-green-400' :
                                                                            engineer.status === 'available' ? 'bg-blue-500/20 text-blue-400' :
                                                                                'bg-yellow-500/20 text-yellow-400'}`, children: engineer.status }), _jsxs("p", { className: "text-xs text-slate-500 mt-1", children: ["$", engineer.hourlyRate, "/hr"] })] })] }), engineer.currentProject && (_jsxs("p", { className: "text-xs text-slate-500 mt-1 truncate", children: ["\uD83D\uDCCB ", engineer.currentProject] })), engineer.skills && (_jsx("div", { className: "flex flex-wrap gap-1 mt-2", children: engineer.skills.slice(0, 3).map((skill, idx) => (_jsx("span", { className: "text-xs px-2 py-0.5 bg-slate-800/50 text-slate-400 rounded", children: skill }, idx))) }))] })] }) }, engineer.id))) }))] }))] }), !isMinimized && (_jsxs("div", { className: "flex flex-col flex-1 overflow-hidden", children: [_jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-3", children: [messages.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4", children: _jsx(Bot, { className: "h-8 w-8 text-white" }) }), _jsx("h4", { className: "text-lg font-medium text-white mb-2", children: "Hi! I'm your Humber AI Assistant" }), _jsx("p", { className: "text-sm text-slate-400 mb-4", children: chatMode === 'engineer' && selectedEngineer
                                            ? `I'm ready to help you with questions about ${selectedEngineer.name}. Ask about their skills, availability, projects, or performance.`
                                            : chatMode === 'documents'
                                                ? 'I can help you find information from your knowledge base including safety protocols, technical standards, and project guidelines.'
                                                : 'I can help with general questions about operations, projects, and engineering topics.' }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 justify-center", children: chatMode === 'engineer' && selectedEngineer ? (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setInput(`What are ${selectedEngineer.name}'s current skills and expertise?`), className: "px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-600/50 transition-colors text-center", children: "Skills & Expertise" }), _jsx("button", { onClick: () => setInput(`What is ${selectedEngineer.name}'s current availability and status?`), className: "px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-600/50 transition-colors text-center", children: "Availability" }), _jsx("button", { onClick: () => setInput(`What projects has ${selectedEngineer.name} worked on recently?`), className: "px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-600/50 transition-colors text-center sm:col-span-2", children: "Project History" })] })) : chatMode === 'documents' ? (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setInput('What are the electrical safety protocols?'), className: "px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-600/50 transition-colors text-center", children: "Safety Protocols" }), _jsx("button", { onClick: () => setInput('How do I configure PLC systems?'), className: "px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-600/50 transition-colors text-center", children: "PLC Programming" }), _jsx("button", { onClick: () => setInput('What are the project handover procedures?'), className: "px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-600/50 transition-colors text-center sm:col-span-2", children: "Project Procedures" })] })) : (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setInput('Show me the current Bull Pen status'), className: "px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-600/50 transition-colors text-center", children: "Bull Pen Status" }), _jsx("button", { onClick: () => setInput('What are the active projects?'), className: "px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-600/50 transition-colors text-center", children: "Active Projects" })] })) })] })) : (_jsxs(_Fragment, { children: [messages.map((msg) => (_jsx("div", { className: `flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`, children: _jsx("div", { className: `max-w-[90%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                                : 'bg-slate-900/50 text-slate-100 border border-slate-700/50'}`, children: _jsxs("div", { className: "flex items-start space-x-3", children: [msg.role === 'assistant' && (_jsx("div", { className: "h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5", children: _jsx(Bot, { className: "h-3 w-3 text-white" }) })), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm whitespace-pre-wrap leading-relaxed", children: msg.content }), msg.sources && msg.sources.length > 0 && (_jsxs("div", { className: "mt-3 pt-3 border-t border-slate-600/50", children: [_jsx("p", { className: "text-xs text-slate-400 mb-2 font-medium", children: "Sources:" }), _jsx("div", { className: "space-y-1", children: msg.sources.slice(0, 3).map((source, idx) => (_jsxs("div", { className: "text-xs text-slate-300 flex items-center space-x-2 bg-slate-800/50 rounded-lg px-2 py-1", children: [_jsx(Paperclip, { className: "h-3 w-3 text-slate-400" }), _jsx("span", { className: "flex-1 truncate", children: source.title }), _jsxs("span", { className: "text-slate-500 font-medium", children: [Math.round(source.relevance * 100), "%"] })] }, idx))) })] })), _jsx("div", { className: "flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx("button", { onClick: () => navigator.clipboard.writeText(msg.content), className: "p-1 hover:bg-slate-700/50 rounded text-slate-400 hover:text-slate-300", title: "Copy message", children: _jsx(Copy, { className: "h-3 w-3" }) }) })] })] }) }) }, msg.id))), isLoading && (_jsx("div", { className: "flex justify-start", children: _jsxs("div", { className: "bg-slate-900/50 border border-slate-700/50 rounded-2xl px-3 py-2 flex items-center space-x-2", children: [_jsx(Bot, { className: "h-4 w-4 text-purple-400" }), _jsxs("div", { className: "flex space-x-1", children: [_jsx("div", { className: "w-1 h-1 bg-slate-400 rounded-full animate-bounce" }), _jsx("div", { className: "w-1 h-1 bg-slate-400 rounded-full animate-bounce", style: { animationDelay: '0.1s' } }), _jsx("div", { className: "w-1 h-1 bg-slate-400 rounded-full animate-bounce", style: { animationDelay: '0.2s' } })] })] }) }))] })), _jsx("div", { ref: messagesEndRef })] }), _jsxs("div", { className: "p-4 border-t border-slate-700/50 bg-slate-900/30 mt-auto", children: [chatMode === 'engineer' && selectedEngineer && (_jsxs("div", { className: "mb-3 p-3 bg-slate-800/50 rounded-lg border border-slate-600/30", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs font-semibold", children: selectedEngineer.name.split(' ').map(n => n[0]).join('') }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-white", children: selectedEngineer.name }), _jsxs("p", { className: "text-xs text-slate-400", children: [selectedEngineer.category.replace('_', ' '), " \u2022 ", selectedEngineer.status] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-xs text-slate-300", children: ["$", selectedEngineer.hourlyRate, "/hr"] }), _jsx("p", { className: "text-xs text-slate-400", children: selectedEngineer.location })] })] }), selectedEngineer.currentProject && (_jsxs("div", { className: "mt-2 pt-2 border-t border-slate-600/30", children: [_jsx("p", { className: "text-xs text-slate-400", children: "Current Project:" }), _jsx("p", { className: "text-xs text-slate-300 font-medium", children: selectedEngineer.currentProject })] }))] })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-3", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx("textarea", { value: input, onChange: (e) => setInput(e.target.value), placeholder: !isConnected
                                                    ? 'AI models offline - connecting to Llama 4 Scout and 120B OSS models...'
                                                    : chatMode === 'engineer' && selectedEngineer
                                                        ? `Ask about ${selectedEngineer.name}'s skills, availability, projects, or performance...`
                                                        : chatMode === 'documents'
                                                            ? 'Ask about safety protocols, technical standards, project guidelines...'
                                                            : 'Ask about operations, projects, Bull Pen status...', className: "w-full px-4 py-3 text-sm bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 resize-none touch-manipulation", disabled: isLoading || !isConnected, disabled: isLoading, rows: 2, onKeyDown: (e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSubmit(e);
                                                    }
                                                } }), _jsx("div", { className: "absolute bottom-2 right-2 flex items-center space-x-1", children: _jsx("span", { className: "text-xs text-slate-500", children: "Enter to send" }) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { type: "button", className: "p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-slate-300", title: "Attach file", children: _jsx(Paperclip, { className: "h-4 w-4" }) }), _jsx("button", { type: "button", onClick: () => window.location.reload(), className: "p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-slate-300", title: "Refresh", children: _jsx(RefreshCw, { className: "h-4 w-4" }) })] }), _jsxs("button", { type: "submit", disabled: !input.trim() || isLoading || !isConnected, className: "px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2", children: [isLoading ? (_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" })) : (_jsx(Send, { className: "h-4 w-4" })), _jsx("span", { className: "text-sm font-medium", children: "Send" })] })] })] })] })] }))] }));
}
//# sourceMappingURL=chat-widget.js.map