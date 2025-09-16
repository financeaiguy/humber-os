'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { AlertCircle, RefreshCw, WifiOff, ServerCrash, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export function RetryError({ error, onRetry, showDetails = process.env.NODE_ENV === 'development', variant = 'inline', maxRetries = 3 }) {
    const [isRetrying, setIsRetrying] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [showErrorDetails, setShowErrorDetails] = useState(false);
    const errorMessage = typeof error === 'string' ? error : error.message;
    const isNetworkError = errorMessage.toLowerCase().includes('network') ||
        errorMessage.toLowerCase().includes('fetch');
    const isServerError = errorMessage.toLowerCase().includes('500') ||
        errorMessage.toLowerCase().includes('server');
    const isTimeout = errorMessage.toLowerCase().includes('timeout');
    const handleRetry = async () => {
        if (!onRetry || retryCount >= maxRetries)
            return;
        setIsRetrying(true);
        setRetryCount(prev => prev + 1);
        try {
            await onRetry();
        }
        catch (err) {
            console.error('Retry failed:', err);
        }
        finally {
            setIsRetrying(false);
        }
    };
    const getIcon = () => {
        if (isNetworkError)
            return WifiOff;
        if (isServerError)
            return ServerCrash;
        if (isTimeout)
            return Clock;
        return AlertCircle;
    };
    const Icon = getIcon();
    if (variant === 'compact') {
        return (_jsxs("div", { className: "flex items-center space-x-2 text-red-400 p-2", children: [_jsx(Icon, { className: "h-4 w-4" }), _jsx("span", { className: "text-sm", children: errorMessage }), onRetry && retryCount < maxRetries && (_jsx("button", { onClick: handleRetry, disabled: isRetrying, className: "text-blue-400 hover:text-blue-300 transition-colors", children: _jsx(RefreshCw, { className: `h-4 w-4 ${isRetrying ? 'animate-spin' : ''}` }) }))] }));
    }
    if (variant === 'full') {
        return (_jsx("div", { className: "min-h-[400px] flex items-center justify-center p-8", children: _jsx(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: "max-w-md w-full", children: _jsxs("div", { className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-red-500/20 p-8 text-center", children: [_jsx("div", { className: "h-16 w-16 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-4", children: _jsx(Icon, { className: "h-8 w-8 text-red-400" }) }), _jsx("h3", { className: "text-xl font-semibold text-white mb-2", children: isNetworkError ? 'Connection Problem' :
                                isServerError ? 'Server Error' :
                                    isTimeout ? 'Request Timeout' :
                                        'Something Went Wrong' }), _jsx("p", { className: "text-slate-400 mb-6", children: errorMessage }), onRetry && retryCount < maxRetries && (_jsxs("button", { onClick: handleRetry, disabled: isRetrying, className: "px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 mx-auto", children: [_jsx(RefreshCw, { className: `h-5 w-5 ${isRetrying ? 'animate-spin' : ''}` }), _jsx("span", { children: isRetrying ? 'Retrying...' : 'Try Again' }), retryCount > 0 && (_jsxs("span", { className: "text-xs opacity-70", children: ["(", retryCount, "/", maxRetries, ")"] }))] })), retryCount >= maxRetries && (_jsx("p", { className: "text-sm text-red-400 mt-4", children: "Maximum retry attempts reached. Please refresh the page or contact support." }))] }) }) }));
    }
    return (_jsx("div", { className: "rounded-xl bg-red-500/10 border border-red-500/20 p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Icon, { className: "h-5 w-5 text-red-400 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-red-400 font-medium", children: "Error Loading Data" }), _jsx("p", { className: "text-sm text-slate-400 mt-1", children: errorMessage }), showDetails && error instanceof Error && error.stack && (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => setShowErrorDetails(!showErrorDetails), className: "text-xs text-slate-500 hover:text-slate-400 mt-2 transition-colors", children: [showErrorDetails ? 'Hide' : 'Show', " Details"] }), _jsx(AnimatePresence, { children: showErrorDetails && (_jsx(motion.pre, { initial: { height: 0, opacity: 0 }, animate: { height: 'auto', opacity: 1 }, exit: { height: 0, opacity: 0 }, className: "text-xs text-slate-500 mt-2 overflow-x-auto bg-slate-900/50 rounded p-2", children: error.stack })) })] })), onRetry && retryCount < maxRetries && (_jsxs("button", { onClick: handleRetry, disabled: isRetrying, className: "mt-3 px-4 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white text-sm rounded-lg font-medium transition-colors flex items-center space-x-2 w-fit", children: [_jsx(RefreshCw, { className: `h-4 w-4 ${isRetrying ? 'animate-spin' : ''}` }), _jsx("span", { children: isRetrying ? 'Retrying...' : 'Retry' }), retryCount > 0 && (_jsxs("span", { className: "text-xs opacity-70", children: ["(", retryCount, "/", maxRetries, ")"] }))] }))] })] }) }));
}
//# sourceMappingURL=retry-error.js.map