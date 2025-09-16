'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Apple } from 'lucide-react';
export function DesignToggle() {
    const [isJobsMode, setIsJobsMode] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        const savedMode = localStorage.getItem('humber-design-mode');
        if (savedMode === 'jobs') {
            setIsJobsMode(true);
            document.documentElement.setAttribute('data-design-mode', 'jobs');
        }
    }, []);
    const toggleDesignMode = () => {
        const newMode = !isJobsMode;
        setIsJobsMode(newMode);
        if (newMode) {
            document.documentElement.setAttribute('data-design-mode', 'jobs');
            localStorage.setItem('humber-design-mode', 'jobs');
        }
        else {
            document.documentElement.removeAttribute('data-design-mode');
            localStorage.removeItem('humber-design-mode');
        }
        window.location.reload();
    };
    if (process.env.NODE_ENV === 'production')
        return null;
    return (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setIsOpen(!isOpen), className: "fixed bottom-4 left-4 z-50 w-12 h-12 bg-white border-2 border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200", title: "Design Mode Toggle", children: isJobsMode ? (_jsx(Apple, { size: 20, className: "text-gray-800" })) : (_jsx(Palette, { size: 20, className: "text-gray-600" })) }), _jsx(AnimatePresence, { children: isOpen && (_jsx(motion.div, { initial: { opacity: 0, scale: 0.95, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 20 }, className: "fixed bottom-20 left-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-72", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-1", children: "Design Mode" }), _jsx("p", { className: "text-sm text-gray-600", children: "Switch between design philosophies" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: `p-3 rounded-lg border-2 transition-all ${!isJobsMode ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: "Current Design" }), _jsx("p", { className: "text-sm text-gray-600", children: "Rich gradients & animations" })] }), !isJobsMode && _jsx("div", { className: "w-3 h-3 bg-blue-500 rounded-full" })] }) }), _jsx("div", { className: `p-3 rounded-lg border-2 transition-all cursor-pointer ${isJobsMode ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`, onClick: toggleDesignMode, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-medium text-gray-900 flex items-center gap-2", children: [_jsx(Apple, { size: 16 }), "Jobs-Inspired"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Minimal, elegant, focused" })] }), isJobsMode && _jsx("div", { className: "w-3 h-3 bg-gray-900 rounded-full" })] }) })] }), _jsx("div", { className: "text-xs text-gray-500 border-t pt-3", children: isJobsMode ? (_jsxs("p", { children: [_jsx("strong", { children: "Jobs Mode:" }), " Simplified navigation, minimal colors, maximum focus on content and usability."] })) : (_jsxs("p", { children: [_jsx("strong", { children: "Current:" }), " Rich visual experience with gradients, animations, and comprehensive feature access."] })) }), _jsx("button", { onClick: () => setIsOpen(false), className: "w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors", children: "Close" })] }) })) }), isOpen && (_jsx("div", { className: "fixed inset-0 z-40 bg-black bg-opacity-10", onClick: () => setIsOpen(false) }))] }));
}
//# sourceMappingURL=design-toggle.js.map