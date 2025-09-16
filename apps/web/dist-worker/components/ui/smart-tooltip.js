'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, ChevronLeft, ChevronRight, Play, Lightbulb, AlertTriangle, Info, Zap } from 'lucide-react';
export function SmartTooltip({ id, title, content, type = 'HELP', placement = 'TOP', userRole = 'NEW_USER', trigger = 'hover', delay = 500, hasAction = false, actionText = 'Learn More', onAction, children, className = '' }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const timeoutRef = useRef();
    const tooltipRef = useRef(null);
    useEffect(() => {
        const dismissedTooltips = JSON.parse(localStorage.getItem('dismissedTooltips') || '[]');
        if (dismissedTooltips.includes(id)) {
            setIsDismissed(true);
        }
    }, [id]);
    useEffect(() => {
        if (trigger === 'auto' && !isDismissed && userRole === 'NEW_USER') {
            const timer = setTimeout(() => setIsVisible(true), delay);
            return () => clearTimeout(timer);
        }
    }, [trigger, isDismissed, userRole, delay]);
    const showTooltip = () => {
        if (isDismissed)
            return;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };
    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };
    const dismissTooltip = () => {
        setIsVisible(false);
        setIsDismissed(true);
        const dismissedTooltips = JSON.parse(localStorage.getItem('dismissedTooltips') || '[]');
        if (!dismissedTooltips.includes(id)) {
            dismissedTooltips.push(id);
            localStorage.setItem('dismissedTooltips', JSON.stringify(dismissedTooltips));
        }
    };
    const getTooltipIcon = () => {
        switch (type) {
            case 'WARNING': return _jsx(AlertTriangle, { className: "w-4 h-4 text-yellow-400" });
            case 'TIP': return _jsx(Lightbulb, { className: "w-4 h-4 text-blue-400" });
            case 'FEATURE': return _jsx(Zap, { className: "w-4 h-4 text-purple-400" });
            case 'PROCESS': return _jsx(Play, { className: "w-4 h-4 text-green-400" });
            default: return _jsx(Info, { className: "w-4 h-4 text-blue-400" });
        }
    };
    const getTooltipColor = () => {
        switch (type) {
            case 'WARNING': return 'border-yellow-400/50 bg-yellow-900/20';
            case 'TIP': return 'border-blue-400/50 bg-blue-900/20';
            case 'FEATURE': return 'border-purple-400/50 bg-purple-900/20';
            case 'PROCESS': return 'border-green-400/50 bg-green-900/20';
            default: return 'border-slate-400/50 bg-slate-900/20';
        }
    };
    const getPlacementClasses = () => {
        switch (placement) {
            case 'TOP': return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
            case 'BOTTOM': return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
            case 'LEFT': return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
            case 'RIGHT': return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
            case 'TOP_LEFT': return 'bottom-full right-0 mb-2';
            case 'TOP_RIGHT': return 'bottom-full left-0 mb-2';
            case 'BOTTOM_LEFT': return 'top-full right-0 mt-2';
            case 'BOTTOM_RIGHT': return 'top-full left-0 mt-2';
            default: return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
        }
    };
    const triggerProps = {
        ...(trigger === 'hover' && {
            onMouseEnter: showTooltip,
            onMouseLeave: hideTooltip
        }),
        ...(trigger === 'click' && {
            onClick: () => setIsVisible(!isVisible)
        }),
        ...(trigger === 'focus' && {
            onFocus: showTooltip,
            onBlur: hideTooltip
        })
    };
    if (isDismissed && trigger !== 'click') {
        return _jsx(_Fragment, { children: children });
    }
    return (_jsxs("div", { className: `relative inline-block ${className}`, ...triggerProps, children: [children, _jsx(AnimatePresence, { children: isVisible && (_jsx(motion.div, { ref: tooltipRef, initial: { opacity: 0, scale: 0.8, y: 10 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.8, y: 10 }, transition: { duration: 0.2, ease: 'easeOut' }, className: `
              absolute z-[10000] w-80 max-w-sm
              ${getPlacementClasses()}
            `, children: _jsxs("div", { className: `
              backdrop-blur-xl border rounded-2xl p-4 shadow-2xl
              ${getTooltipColor()}
            `, children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getTooltipIcon(), _jsx("h3", { className: "font-semibold text-white text-sm", children: title })] }), _jsx("button", { onClick: dismissTooltip, className: "text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10", children: _jsx(X, { className: "w-3 h-3" }) })] }), _jsx("p", { className: "text-slate-200 text-sm leading-relaxed mb-4", children: content }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-xs px-2 py-1 rounded-full bg-white/10 text-slate-300", children: ["For ", userRole.toLowerCase().replace('_', ' '), " users"] }), hasAction && (_jsx("button", { onClick: () => {
                                            onAction?.();
                                            dismissTooltip();
                                        }, className: "text-xs px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors", children: actionText }))] }), _jsx("div", { className: `
                absolute w-3 h-3 transform rotate-45 border
                ${placement === 'TOP' ? 'top-full left-1/2 -translate-x-1/2 -mt-1.5 border-r-0 border-b-0' : ''}
                ${placement === 'BOTTOM' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1.5 border-l-0 border-t-0' : ''}
                ${placement === 'LEFT' ? 'left-full top-1/2 -translate-y-1/2 -ml-1.5 border-t-0 border-l-0' : ''}
                ${placement === 'RIGHT' ? 'right-full top-1/2 -translate-y-1/2 -mr-1.5 border-b-0 border-r-0' : ''}
                ${getTooltipColor().split(' ')[0]} ${getTooltipColor().split(' ')[1]}
              ` })] }) })) })] }));
}
export function WalkthroughOverlay({ isActive, currentStep, onNext, onPrevious, onSkip, onComplete, totalSteps, currentStepIndex }) {
    if (!isActive || !currentStep)
        return null;
    return (_jsx(AnimatePresence, { children: _jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-[9999]", children: [_jsx("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-sm" }), _jsx("div", { className: "absolute inset-0", children: _jsx("div", { className: "absolute border-4 border-blue-400 rounded-lg shadow-2xl shadow-blue-400/50", style: {
                            top: '200px',
                            left: '300px',
                            width: '200px',
                            height: '100px'
                        } }) }), _jsx(motion.div, { initial: { opacity: 0, scale: 0.8, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.8, y: 20 }, className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2", children: _jsxs("div", { className: "bg-slate-800/95 backdrop-blur-xl border border-slate-600 rounded-2xl p-6 max-w-md shadow-2xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("span", { className: "text-sm text-slate-400", children: ["Step ", currentStepIndex + 1, " of ", totalSteps] }), _jsx("div", { className: "flex gap-1", children: Array.from({ length: totalSteps }).map((_, i) => (_jsx("div", { className: `w-2 h-2 rounded-full ${i <= currentStepIndex ? 'bg-blue-400' : 'bg-slate-600'}` }, i))) })] }), _jsx("h3", { className: "text-xl font-bold text-white mb-3", children: currentStep.title }), _jsx("p", { className: "text-slate-200 mb-6 leading-relaxed", children: currentStep.content }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex gap-2", children: [currentStepIndex > 0 && (_jsxs("button", { onClick: onPrevious, className: "flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors", children: [_jsx(ChevronLeft, { className: "w-4 h-4" }), "Back"] })), _jsx("button", { onClick: onSkip, className: "px-4 py-2 text-slate-400 hover:text-white transition-colors", children: "Skip Tour" })] }), _jsx("div", { className: "flex gap-2", children: currentStepIndex < totalSteps - 1 ? (_jsxs("button", { onClick: onNext, className: "flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors", children: ["Next", _jsx(ChevronRight, { className: "w-4 h-4" })] })) : (_jsxs("button", { onClick: onComplete, className: "flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors", children: ["Complete", _jsx(Zap, { className: "w-4 h-4" })] })) })] })] }) })] }) }));
}
export function HelpButton({ content, title = 'Help', placement = 'TOP', className = '' }) {
    return (_jsx(SmartTooltip, { id: `help-${Date.now()}`, title: title, content: content, type: "HELP", placement: placement, trigger: "hover", className: className, children: _jsx("button", { className: "p-2 text-slate-400 hover:text-blue-400 transition-colors rounded-full hover:bg-blue-400/10", children: _jsx(HelpCircle, { className: "w-4 h-4" }) }) }));
}
export function FeatureIntro({ title, description, benefits, difficulty, estimatedTime, onStartTour, onDismiss }) {
    const getDifficultyColor = () => {
        switch (difficulty) {
            case 'BEGINNER': return 'text-green-400 bg-green-400/10';
            case 'INTERMEDIATE': return 'text-yellow-400 bg-yellow-400/10';
            case 'ADVANCED': return 'text-red-400 bg-red-400/10';
        }
    };
    return (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 20 }, className: "fixed top-4 right-4 z-[9999] w-96", children: _jsxs("div", { className: "bg-slate-800/95 backdrop-blur-xl border border-slate-600 rounded-2xl p-6 shadow-2xl", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-white mb-2", children: title }), _jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("span", { className: `text-xs px-2 py-1 rounded-full ${getDifficultyColor()}`, children: difficulty }), _jsxs("span", { className: "text-xs text-slate-400", children: ["~", estimatedTime, " to learn"] })] })] }), _jsx("button", { onClick: onDismiss, className: "text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsx("p", { className: "text-slate-200 mb-4 leading-relaxed", children: description }), _jsxs("div", { className: "mb-6", children: [_jsx("h4", { className: "text-sm font-semibold text-white mb-2", children: "What you'll learn:" }), _jsx("ul", { className: "space-y-1", children: benefits.map((benefit, index) => (_jsxs("li", { className: "text-sm text-slate-300 flex items-center gap-2", children: [_jsx("div", { className: "w-1.5 h-1.5 bg-blue-400 rounded-full" }), benefit] }, index))) })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: onStartTour, className: "flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors", children: "Start Interactive Tour" }), _jsx("button", { onClick: onDismiss, className: "px-4 py-3 text-slate-400 hover:text-white transition-colors", children: "Maybe Later" })] })] }) }));
}
export function ProgressIndicator({ currentStep, totalSteps, stepNames, onStepClick }) {
    return (_jsx("div", { className: "flex items-center justify-center gap-2 py-4", children: stepNames.map((name, index) => (_jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: `
              relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all cursor-pointer
              ${index <= currentStep
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-slate-400'}
              ${onStepClick ? 'hover:scale-110' : ''}
            `, onClick: () => onStepClick?.(index), children: [_jsx("span", { className: "text-xs font-bold", children: index + 1 }), _jsx("div", { className: "absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 whitespace-nowrap", children: name })] }), index < totalSteps - 1 && (_jsx("div", { className: `
              w-8 h-0.5 mx-1 transition-all
              ${index < currentStep ? 'bg-blue-500' : 'bg-slate-600'}
            ` }))] }, index))) }));
}
//# sourceMappingURL=smart-tooltip.js.map