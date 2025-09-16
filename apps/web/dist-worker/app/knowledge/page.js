'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { BookOpen, Search, FileText, Video, Download, Clock, User, Upload, MessageSquare, X, Send, Paperclip } from 'lucide-react';
import { useState, useRef } from 'react';
import { ContinuousLearningPanel } from '@/components/knowledge-base/continuous-learning-panel';
import { continuousLearning } from '@/lib/continuous-learning';
const knowledgeArticles = [
    {
        id: 1,
        title: 'Electrical Safety Protocols for Automotive Plants',
        category: 'Safety',
        type: 'document',
        author: 'Sarah Johnson',
        lastUpdated: '2025-01-10',
        readTime: '8 min read',
        tags: ['electrical', 'safety', 'automotive'],
        description: 'Comprehensive guide to electrical safety protocols in automotive manufacturing environments.'
    },
    {
        id: 2,
        title: 'PLC Programming Best Practices',
        category: 'Technical',
        type: 'video',
        author: 'Michael Chen',
        lastUpdated: '2025-01-08',
        readTime: '25 min watch',
        tags: ['plc', 'programming', 'automation'],
        description: 'Video tutorial covering advanced PLC programming techniques and debugging strategies.'
    },
    {
        id: 3,
        title: 'Project Handover Checklist',
        category: 'Process',
        type: 'checklist',
        author: 'Lisa Thompson',
        lastUpdated: '2025-01-05',
        readTime: '5 min read',
        tags: ['project-management', 'handover', 'checklist'],
        description: 'Essential checklist for smooth project handovers to client teams.'
    },
    {
        id: 4,
        title: 'Robotic Welding System Configuration',
        category: 'Technical',
        type: 'document',
        author: 'David Kim',
        lastUpdated: '2025-01-03',
        readTime: '12 min read',
        tags: ['robotics', 'welding', 'configuration'],
        description: 'Step-by-step guide for configuring and calibrating robotic welding systems.'
    },
    {
        id: 5,
        title: 'Client Communication Templates',
        category: 'Communication',
        type: 'template',
        author: 'Emily Rodriguez',
        lastUpdated: '2024-12-28',
        readTime: '3 min read',
        tags: ['communication', 'templates', 'client'],
        description: 'Standard templates for client communications throughout project lifecycle.'
    },
    {
        id: 6,
        title: 'Quality Control Standards',
        category: 'Quality',
        type: 'document',
        author: 'Sarah Johnson',
        lastUpdated: '2024-12-25',
        readTime: '15 min read',
        tags: ['quality', 'standards', 'testing'],
        description: 'Quality control standards and testing procedures for all engineering projects.'
    }
];
const categories = ['All', 'Technical', 'Safety', 'Process', 'Communication', 'Quality'];
const types = ['All', 'document', 'video', 'checklist', 'template'];
export default function KnowledgeBasePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedType, setSelectedType] = useState('All');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showChatWidget, setShowChatWidget] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const filteredArticles = knowledgeArticles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
        const matchesType = selectedType === 'All' || article.type === selectedType;
        return matchesSearch && matchesCategory && matchesType;
    });
    const handleSearch = (value) => {
        setSearchTerm(value);
        if (value) {
            continuousLearning.learn({
                type: 'knowledge_search',
                query: value,
                resultsCount: filteredArticles.length,
                timestamp: new Date().toISOString()
            }, 'interaction');
        }
    };
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        continuousLearning.learn({
            type: 'knowledge_filter',
            filterType: 'category',
            value: category,
            timestamp: new Date().toISOString()
        }, 'interaction');
    };
    const handleTypeChange = (type) => {
        setSelectedType(type);
        continuousLearning.learn({
            type: 'knowledge_filter',
            filterType: 'type',
            value: type,
            timestamp: new Date().toISOString()
        }, 'interaction');
    };
    const handleArticleClick = (article) => {
        continuousLearning.learn({
            type: 'article_view',
            articleId: article.id,
            title: article.title,
            category: article.category,
            tags: article.tags,
            timestamp: new Date().toISOString()
        }, 'document');
    };
    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('metadata', JSON.stringify({
                title: file.name.replace(/\.[^/.]+$/, ''),
                category: 'REFERENCE',
                tags: [],
                uploadedBy: 'Current User'
            }));
            await new Promise(resolve => setTimeout(resolve, 2000));
            continuousLearning.learn({
                type: 'document_upload',
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                category: 'REFERENCE',
                timestamp: new Date().toISOString()
            }, 'document');
            setShowUploadModal(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            alert('Document uploaded successfully!');
        }
        catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        }
        finally {
            setIsUploading(false);
        }
    };
    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim())
            return;
        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: chatInput
        };
        setChatMessages(prev => [...prev, userMessage]);
        const query = chatInput;
        setChatInput('');
        continuousLearning.learn({
            type: 'chat_query',
            query: query,
            timestamp: new Date().toISOString()
        }, 'interaction');
        setTimeout(() => {
            const aiResponse = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Based on the knowledge base, I can help you with that. Here's what I found relevant to "${query}":\n\n• Electrical safety protocols require proper lockout/tagout procedures\n• PLC programming standards emphasize safety interlocks\n• Project management templates are available for timeline planning\n\nWould you like me to elaborate on any of these topics?`,
                sources: [
                    { title: 'Electrical Safety Protocols', relevance: 0.89 },
                    { title: 'PLC Programming Standards', relevance: 0.82 }
                ]
            };
            setChatMessages(prev => [...prev, aiResponse]);
            continuousLearning.learn({
                type: 'chat_response',
                query: query,
                response: aiResponse.content,
                sources: aiResponse.sources,
                timestamp: new Date().toISOString()
            }, 'interaction');
        }, 1500);
    };
    const getTypeIcon = (type) => {
        switch (type) {
            case 'video': return _jsx(Video, { className: "h-4 w-4" });
            case 'checklist': return _jsx(FileText, { className: "h-4 w-4" });
            case 'template': return _jsx(Download, { className: "h-4 w-4" });
            default: return _jsx(BookOpen, { className: "h-4 w-4" });
        }
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'video': return 'bg-red-500/20 text-red-400';
            case 'checklist': return 'bg-green-500/20 text-green-400';
            case 'template': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-blue-500/20 text-blue-400';
        }
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-white mb-2", children: "Knowledge Base" }), _jsx("p", { className: "text-slate-400", children: "Access documentation, guides, and resources for engineering projects." })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("button", { onClick: () => setShowChatWidget(true), className: "flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300", children: [_jsx(MessageSquare, { className: "h-4 w-4" }), _jsx("span", { children: "Ask AI" })] }), _jsxs("button", { onClick: () => setShowUploadModal(true), className: "flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-300", children: [_jsx(Upload, { className: "h-4 w-4" }), _jsx("span", { children: "Upload Document" })] })] })] }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" }), _jsx("input", { type: "text", placeholder: "Search articles, guides, and documentation...", value: searchTerm, onChange: (e) => handleSearch(e.target.value), className: "w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500" })] }), _jsx("select", { value: selectedCategory, onChange: (e) => handleCategoryChange(e.target.value), className: "px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500", children: categories.map(category => (_jsx("option", { value: category, children: category }, category))) }), _jsx("select", { value: selectedType, onChange: (e) => handleTypeChange(e.target.value), className: "px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500", children: types.map(type => (_jsx("option", { value: type, children: type === 'All' ? 'All Types' : type }, type))) })] }) }), _jsx(ContinuousLearningPanel, {}), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: filteredArticles.map((article, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 * index }, onClick: () => handleArticleClick(article), className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600 transition-all duration-300 cursor-pointer group", children: [_jsx("div", { className: "flex items-start justify-between mb-4", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `p-2 rounded-lg ${getTypeColor(article.type)}`, children: getTypeIcon(article.type) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-white group-hover:text-blue-400 transition-colors", children: article.title }), _jsx("p", { className: "text-sm text-slate-400", children: article.category })] })] }) }), _jsx("p", { className: "text-sm text-slate-300 mb-4", children: article.description }), _jsx("div", { className: "flex flex-wrap gap-2 mb-4", children: article.tags.map(tag => (_jsxs("span", { className: "px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full", children: ["#", tag] }, tag))) }), _jsxs("div", { className: "flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-700", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(User, { className: "h-3 w-3" }), _jsx("span", { children: article.author })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Clock, { className: "h-3 w-3" }), _jsx("span", { children: article.readTime })] })] }), _jsxs("span", { children: ["Updated ", article.lastUpdated] })] })] }, article.id))) }), filteredArticles.length === 0 && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "text-center py-12", children: [_jsx(BookOpen, { className: "h-12 w-12 text-slate-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-white mb-2", children: "No articles found" }), _jsx("p", { className: "text-slate-400", children: "Try adjusting your search terms or filters." })] })), showUploadModal && (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: "bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-xl font-semibold text-white", children: "Upload Document" }), _jsx("button", { onClick: () => setShowUploadModal(false), className: "p-2 hover:bg-slate-700 rounded-lg transition-colors", children: _jsx(X, { className: "h-4 w-4 text-slate-400" }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-white mb-2", children: "Select File" }), _jsx("input", { ref: fileInputRef, type: "file", accept: ".pdf,.doc,.docx,.csv,.xls,.xlsx,.txt", onChange: handleFileUpload, className: "w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600" }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Supports: PDF, DOC, DOCX, CSV, XLS, XLSX, TXT (Max 50MB)" })] }), isUploading && (_jsxs("div", { className: "bg-slate-900/50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" }), _jsx("span", { className: "text-sm text-white", children: "Processing document..." })] }), _jsx("p", { className: "text-xs text-slate-400 mt-2", children: "Extracting text, generating embeddings, and indexing for search." })] }))] })] }) })), showChatWidget && (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: "bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl h-[600px] flex flex-col", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-slate-700", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center", children: _jsx(MessageSquare, { className: "h-4 w-4 text-white" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: "Knowledge Assistant" }), _jsx("p", { className: "text-xs text-slate-400", children: "Powered by your document library" })] })] }), _jsx("button", { onClick: () => setShowChatWidget(false), className: "p-2 hover:bg-slate-700 rounded-lg transition-colors", children: _jsx(X, { className: "h-4 w-4 text-slate-400" }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-4 space-y-4", children: chatMessages.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(MessageSquare, { className: "h-12 w-12 text-slate-400 mx-auto mb-4" }), _jsx("h4", { className: "text-lg font-medium text-white mb-2", children: "Ask me anything!" }), _jsx("p", { className: "text-slate-400 text-sm", children: "I can help you find information from your knowledge base including safety protocols, technical standards, and project guidelines." })] })) : (chatMessages.map((msg) => (_jsx("div", { className: `flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`, children: _jsxs("div", { className: `max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                        : 'bg-slate-900/50 text-slate-100 border border-slate-700'}`, children: [_jsx("p", { className: "text-sm whitespace-pre-wrap", children: msg.content }), msg.sources && msg.sources.length > 0 && (_jsxs("div", { className: "mt-3 pt-3 border-t border-slate-600", children: [_jsx("p", { className: "text-xs text-slate-400 mb-2", children: "Sources:" }), msg.sources.map((source, idx) => (_jsxs("div", { className: "text-xs text-slate-300 mb-1 flex items-center space-x-2", children: [_jsx(Paperclip, { className: "h-3 w-3" }), _jsx("span", { children: source.title }), _jsxs("span", { className: "text-slate-500", children: ["(", Math.round(source.relevance * 100), "% relevant)"] })] }, idx)))] }))] }) }, msg.id)))) }), _jsx("div", { className: "p-4 border-t border-slate-700", children: _jsxs("form", { onSubmit: handleChatSubmit, className: "flex items-center space-x-2", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx("input", { type: "text", value: chatInput, onChange: (e) => setChatInput(e.target.value), placeholder: "Ask about safety protocols, technical standards, or project guidelines...", className: "w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 pr-12" }), _jsx(Paperclip, { className: "absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" })] }), _jsx("button", { type: "submit", disabled: !chatInput.trim(), className: "p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed", children: _jsx(Send, { className: "h-4 w-4" }) })] }) })] }) }))] }));
}
//# sourceMappingURL=page.js.map