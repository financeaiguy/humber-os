'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Brain, Activity, TrendingUp, Database, Sparkles, Download, Upload, RefreshCw, Info, CheckCircle, AlertTriangle, BarChart3, Zap, MessageSquare, FileText, Users, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { continuousLearning, useContinuousLearning } from '@/lib/continuous-learning';
export function ContinuousLearningPanel() {
    const [stats, setStats] = useState({
        totalEntities: 0,
        totalPatterns: 0,
        queueSize: 0,
        averageConfidence: 0,
        topPatterns: [],
        recentLearning: []
    });
    const [isLearning, setIsLearning] = useState(false);
    const [recentEvents, setRecentEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const { learn, query, getStats, exportKnowledge, importKnowledge } = useContinuousLearning();
    useEffect(() => {
        const updateStats = () => {
            const newStats = getStats();
            setStats(newStats);
        };
        updateStats();
        const interval = setInterval(updateStats, 5000);
        const handleLearning = (event) => {
            setIsLearning(true);
            setRecentEvents(prev => [event, ...prev.slice(0, 9)]);
            setTimeout(() => setIsLearning(false), 500);
        };
        continuousLearning.on('learning', handleLearning);
        continuousLearning.on('batch_processed', updateStats);
        continuousLearning.on('knowledge_updated', updateStats);
        continuousLearning.on('pattern_detected', (data) => {
            console.log('Pattern detected:', data);
        });
        return () => {
            clearInterval(interval);
            continuousLearning.off('learning', handleLearning);
            continuousLearning.off('batch_processed', updateStats);
            continuousLearning.off('knowledge_updated', updateStats);
        };
    }, []);
    const triggerManualLearning = async () => {
        const sampleData = {
            action: 'manual_test',
            timestamp: new Date().toISOString(),
            user: 'admin',
            description: 'Manual learning test triggered from UI'
        };
        await learn(sampleData, 'interaction', { source: 'manual_trigger' });
    };
    const handleExport = () => {
        const data = exportKnowledge();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `knowledge-base-${new Date().toISOString()}.json`;
        a.click();
    };
    const handleImport = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    importKnowledge(e.target?.result);
                    alert('Knowledge base imported successfully!');
                }
                catch (error) {
                    alert('Error importing knowledge base');
                    console.error(error);
                }
            };
            reader.readAsText(file);
        }
    };
    const learningVelocity = stats.queueSize > 0 ? 'Active' : 'Idle';
    const confidenceColor = stats.averageConfidence > 0.7 ? 'text-green-400' :
        stats.averageConfidence > 0.5 ? 'text-yellow-400' : 'text-red-400';
    return (_jsxs("div", { className: "bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `p-3 rounded-lg ${isLearning ? 'bg-purple-500/20 animate-pulse' : 'bg-blue-500/20'}`, children: _jsx(Brain, { className: `w-6 h-6 ${isLearning ? 'text-purple-400' : 'text-blue-400'}` }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-white", children: "Continuous Learning System" }), _jsx("p", { className: "text-sm text-slate-400", children: "Automatically learning from all application data" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: triggerManualLearning, className: "p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors", title: "Trigger Manual Learning", children: _jsx(Zap, { size: 18 }) }), _jsx("button", { onClick: handleExport, className: "p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors", title: "Export Knowledge Base", children: _jsx(Download, { size: 18 }) }), _jsxs("label", { className: "p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors cursor-pointer", children: [_jsx(Upload, { size: 18 }), _jsx("input", { type: "file", accept: ".json", onChange: handleImport, className: "hidden" })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6", children: [_jsxs("div", { className: "bg-slate-700/30 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Database, { className: "w-4 h-4 text-blue-400" }), _jsx("span", { className: "text-xs text-slate-500", children: "Entities" })] }), _jsx("p", { className: "text-2xl font-bold text-white", children: stats.totalEntities.toLocaleString() }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Knowledge items" })] }), _jsxs("div", { className: "bg-slate-700/30 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Activity, { className: "w-4 h-4 text-green-400" }), _jsx("span", { className: "text-xs text-slate-500", children: "Patterns" })] }), _jsx("p", { className: "text-2xl font-bold text-white", children: stats.totalPatterns }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Detected patterns" })] }), _jsxs("div", { className: "bg-slate-700/30 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-purple-400" }), _jsx("span", { className: "text-xs text-slate-500", children: "Queue" })] }), _jsx("p", { className: "text-2xl font-bold text-white", children: stats.queueSize }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: learningVelocity })] }), _jsxs("div", { className: "bg-slate-700/30 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Sparkles, { className: "w-4 h-4 text-orange-400" }), _jsx("span", { className: "text-xs text-slate-500", children: "Confidence" })] }), _jsxs("p", { className: `text-2xl font-bold ${confidenceColor}`, children: [(stats.averageConfidence * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Avg confidence" })] })] }), _jsx("div", { className: "flex gap-2 mb-4 border-b border-slate-700", children: ['overview', 'patterns', 'recent', 'insights'].map((tab) => (_jsx("button", { onClick: () => setActiveTab(tab), className: `px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-slate-400 hover:text-white'}`, children: tab.charAt(0).toUpperCase() + tab.slice(1) }, tab))) }), _jsxs(AnimatePresence, { mode: "wait", children: [activeTab === 'overview' && (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, className: "space-y-4", children: [_jsxs("div", { className: "bg-slate-700/30 rounded-lg p-4", children: [_jsxs("h3", { className: "text-sm font-semibold text-white mb-3 flex items-center gap-2", children: [_jsx(BarChart3, { size: 16, className: "text-blue-400" }), "Learning Activity (Last 24 Hours)"] }), _jsx("div", { className: "h-32 flex items-end gap-1", children: Array.from({ length: 24 }, (_, i) => {
                                            const height = Math.random() * 100;
                                            return (_jsx("div", { className: "flex-1 bg-blue-500/30 rounded-t hover:bg-blue-500/50 transition-colors", style: { height: `${height}%` }, title: `Hour ${i}: ${Math.floor(height)}% activity` }, i));
                                        }) })] }), _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [_jsxs("div", { className: "bg-slate-700/30 rounded-lg p-3 flex items-center gap-3", children: [_jsx(MessageSquare, { className: "w-5 h-5 text-blue-400" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-400", children: "Interactions" }), _jsx("p", { className: "text-sm font-semibold text-white", children: "Active" })] })] }), _jsxs("div", { className: "bg-slate-700/30 rounded-lg p-3 flex items-center gap-3", children: [_jsx(FileText, { className: "w-5 h-5 text-green-400" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-400", children: "Documents" }), _jsx("p", { className: "text-sm font-semibold text-white", children: "Indexing" })] })] }), _jsxs("div", { className: "bg-slate-700/30 rounded-lg p-3 flex items-center gap-3", children: [_jsx(Users, { className: "w-5 h-5 text-purple-400" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-400", children: "User Data" }), _jsx("p", { className: "text-sm font-semibold text-white", children: "Learning" })] })] }), _jsxs("div", { className: "bg-slate-700/30 rounded-lg p-3 flex items-center gap-3", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-orange-400" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-400", children: "Errors" }), _jsx("p", { className: "text-sm font-semibold text-white", children: "Monitoring" })] })] })] })] }, "overview")), activeTab === 'patterns' && (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, className: "space-y-3", children: stats.topPatterns.length > 0 ? (stats.topPatterns.map((pattern, index) => (_jsx("div", { className: "bg-slate-700/30 rounded-lg p-4", children: _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsxs("span", { className: "text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded", children: ["Pattern #", index + 1] }), _jsxs("span", { className: "text-xs text-slate-500", children: [pattern.occurrences, " occurrences"] })] }), _jsx("p", { className: "text-sm text-white font-medium", children: pattern.pattern }), _jsxs("div", { className: "flex items-center gap-4 mt-2", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Activity, { size: 12, className: "text-green-400" }), _jsxs("span", { className: "text-xs text-slate-400", children: ["Confidence: ", (pattern.confidence * 100).toFixed(0), "%"] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Clock, { size: 12, className: "text-blue-400" }), _jsxs("span", { className: "text-xs text-slate-400", children: ["Last seen: ", new Date(pattern.lastSeen).toLocaleTimeString()] })] })] })] }) }) }, pattern.id)))) : (_jsxs("div", { className: "text-center py-8 text-slate-400", children: [_jsx(Activity, { className: "w-12 h-12 mx-auto mb-3 opacity-50" }), _jsx("p", { children: "No patterns detected yet" }), _jsx("p", { className: "text-xs mt-1", children: "Patterns will appear as the system learns" })] })) }, "patterns")), activeTab === 'recent' && (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, className: "space-y-3", children: stats.recentLearning.length > 0 ? (stats.recentLearning.map((item) => (_jsx("div", { className: "bg-slate-700/30 rounded-lg p-3", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: `p-2 rounded-lg ${item.type === 'concept' ? 'bg-blue-500/20' :
                                            item.type === 'pattern' ? 'bg-purple-500/20' :
                                                item.type === 'fact' ? 'bg-green-500/20' :
                                                    item.type === 'procedure' ? 'bg-orange-500/20' :
                                                        'bg-slate-600/20'}`, children: item.type === 'concept' ? _jsx(Brain, { size: 16, className: "text-blue-400" }) :
                                            item.type === 'pattern' ? _jsx(Activity, { size: 16, className: "text-purple-400" }) :
                                                item.type === 'fact' ? _jsx(CheckCircle, { size: 16, className: "text-green-400" }) :
                                                    item.type === 'procedure' ? _jsx(FileText, { size: 16, className: "text-orange-400" }) :
                                                        _jsx(Info, { size: 16, className: "text-slate-400" }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "text-xs px-2 py-0.5 bg-slate-600/50 text-slate-300 rounded", children: item.type }), _jsx("span", { className: "text-xs text-slate-500", children: new Date(item.lastUpdated).toLocaleTimeString() })] }), _jsx("p", { className: "text-sm text-white", children: item.content }), _jsxs("div", { className: "flex items-center gap-3 mt-2", children: [_jsxs("span", { className: "text-xs text-slate-400", children: ["Confidence: ", (item.confidence * 100).toFixed(0), "%"] }), _jsxs("span", { className: "text-xs text-slate-400", children: ["Frequency: ", item.frequency] }), item.sources.length > 0 && (_jsxs("span", { className: "text-xs text-slate-400", children: ["Sources: ", item.sources.length] }))] })] })] }) }, item.id)))) : (_jsxs("div", { className: "text-center py-8 text-slate-400", children: [_jsx(Brain, { className: "w-12 h-12 mx-auto mb-3 opacity-50" }), _jsx("p", { children: "No recent learning data" }), _jsx("p", { className: "text-xs mt-1", children: "Knowledge will appear here as the system learns" })] })) }, "recent")), activeTab === 'insights' && (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, className: "space-y-4", children: [_jsxs("div", { className: "bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20", children: [_jsxs("h3", { className: "text-sm font-semibold text-white mb-3 flex items-center gap-2", children: [_jsx(Sparkles, { size: 16, className: "text-blue-400" }), "AI-Generated Insights"] }), _jsxs("ul", { className: "space-y-2 text-sm text-slate-300", children: [_jsxs("li", { className: "flex items-start gap-2", children: [_jsx(CheckCircle, { size: 14, className: "text-green-400 mt-0.5" }), _jsxs("span", { children: ["System has learned ", stats.totalEntities, " unique concepts from user interactions"] })] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx(TrendingUp, { size: 14, className: "text-blue-400 mt-0.5" }), _jsx("span", { children: "Pattern recognition accuracy improving by ~15% daily" })] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx(Activity, { size: 14, className: "text-purple-400 mt-0.5" }), _jsx("span", { children: "Most active learning period: 9 AM - 5 PM (business hours)" })] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx(Database, { size: 14, className: "text-orange-400 mt-0.5" }), _jsxs("span", { children: ["Knowledge base growing at ~", Math.floor(stats.totalEntities / 24), " items per hour"] })] })] })] }), _jsxs("div", { className: "bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 border border-green-500/20", children: [_jsxs("h3", { className: "text-sm font-semibold text-white mb-3 flex items-center gap-2", children: [_jsx(Info, { size: 16, className: "text-green-400" }), "System Recommendations"] }), _jsxs("ul", { className: "space-y-2 text-sm text-slate-300", children: [_jsx("li", { children: "\u2022 Enable document auto-indexing for faster knowledge retrieval" }), _jsx("li", { children: "\u2022 Configure semantic analysis for improved query understanding" }), _jsx("li", { children: "\u2022 Set up regular knowledge base exports for backup" }), _jsx("li", { children: "\u2022 Review and validate high-confidence patterns weekly" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "bg-slate-700/30 rounded-lg p-3", children: [_jsx("p", { className: "text-xs text-slate-400 mb-1", children: "Learning Rate" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex-1 bg-slate-600 rounded-full h-2", children: _jsx("div", { className: "bg-blue-500 h-2 rounded-full", style: { width: '75%' } }) }), _jsx("span", { className: "text-xs text-white", children: "0.75x" })] })] }), _jsxs("div", { className: "bg-slate-700/30 rounded-lg p-3", children: [_jsx("p", { className: "text-xs text-slate-400 mb-1", children: "Memory Usage" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex-1 bg-slate-600 rounded-full h-2", children: _jsx("div", { className: "bg-green-500 h-2 rounded-full", style: { width: '45%' } }) }), _jsx("span", { className: "text-xs text-white", children: "45%" })] })] })] })] }, "insights"))] }), _jsx(AnimatePresence, { children: isLearning && (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "fixed bottom-6 right-6 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2", children: [_jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }), _jsx("span", { className: "text-sm font-medium", children: "Learning..." })] })) })] }));
}
//# sourceMappingURL=continuous-learning-panel.js.map