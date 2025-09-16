'use client';
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.handleReset = () => {
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
                showDetails: false,
                retryCount: this.state.retryCount + 1
            });
        };
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false,
            retryCount: 0
        };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
        if (process.env.NODE_ENV === 'production') {
        }
    }
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return _jsx(_Fragment, { children: this.props.fallback });
            }
            return (_jsx("div", { className: "min-h-[400px] flex items-center justify-center p-8", children: _jsx("div", { className: "max-w-2xl w-full", children: _jsx("div", { className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-red-500/20 p-8", children: _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "h-12 w-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0", children: _jsx(AlertTriangle, { className: "h-6 w-6 text-red-400" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h2", { className: "text-xl font-semibold text-white mb-2", children: "Something went wrong" }), _jsx("p", { className: "text-slate-400 mb-6", children: "We encountered an unexpected error. The team has been notified and is working on a fix." }), _jsxs("div", { className: "flex items-center space-x-3 mb-6", children: [_jsxs("button", { onClick: this.handleReset, className: "px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2", children: [_jsx(RefreshCw, { className: "h-4 w-4" }), _jsx("span", { children: "Try Again" }), this.state.retryCount > 0 && (_jsxs("span", { className: "text-xs opacity-70", children: ["(", this.state.retryCount, ")"] }))] }), _jsxs(Link, { href: "/", className: "px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2", children: [_jsx(Home, { className: "h-4 w-4" }), _jsx("span", { children: "Go Home" })] })] }), process.env.NODE_ENV === 'development' && this.state.error && (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => this.setState({ showDetails: !this.state.showDetails }), className: "text-sm text-slate-400 hover:text-white transition-colors flex items-center space-x-1", children: [this.state.showDetails ? (_jsx(ChevronUp, { className: "h-4 w-4" })) : (_jsx(ChevronDown, { className: "h-4 w-4" })), _jsxs("span", { children: [this.state.showDetails ? 'Hide' : 'Show', " technical details"] })] }), this.state.showDetails && (_jsxs("div", { className: "mt-4 p-4 bg-slate-900/50 rounded-lg", children: [_jsxs("div", { className: "mb-3", children: [_jsx("p", { className: "text-xs text-red-400 font-mono mb-1", children: "Error Message:" }), _jsx("p", { className: "text-sm text-slate-300 font-mono", children: this.state.error.message })] }), this.state.errorInfo && (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-red-400 font-mono mb-1", children: "Stack Trace:" }), _jsx("pre", { className: "text-xs text-slate-400 font-mono overflow-x-auto", children: this.state.errorInfo.componentStack })] }))] }))] }))] })] }) }) }) }));
        }
        return this.props.children;
    }
}
export function withErrorBoundary(Component, fallback) {
    return function WithErrorBoundaryComponent(props) {
        return (_jsx(ErrorBoundary, { fallback: fallback, children: _jsx(Component, { ...props }) }));
    };
}
//# sourceMappingURL=error-boundary.js.map