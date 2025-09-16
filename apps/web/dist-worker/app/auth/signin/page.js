'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { signIn } from '@/lib/auth-client';
const mockCredentials = [
    { email: 'admin@humber.com', password: 'admin123', role: 'System Admin', description: 'Full system access' },
    { email: 'engineer@humber.com', password: 'engineer123', role: 'Engineer', description: 'Engineering management' },
    { email: 'operator@humber.com', password: 'operator123', role: 'Operator', description: 'Operations control' },
    { email: 'customer@gm.com', password: 'customer123', role: 'Customer (GM)', description: 'Client portal access' },
    { email: 'partner@ford.com', password: 'partner123', role: 'Partner (Ford)', description: 'Partner management' },
    { email: 'employee@humber.com', password: 'employee123', role: 'Employee', description: 'Self-service portal' },
];
export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const prefillEmail = sessionStorage.getItem('prefillEmail');
            if (prefillEmail) {
                setEmail(prefillEmail);
                sessionStorage.removeItem('prefillEmail');
                setTimeout(() => {
                    const passwordInput = document.querySelector('input[type="password"]');
                    if (passwordInput) {
                        passwordInput.focus();
                    }
                }, 100);
            }
        }
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const result = await signIn(email, password);
            if (result.success) {
                router.push('/');
                router.refresh();
            }
            else {
                setError(result.error || 'Invalid credentials');
            }
        }
        catch (error) {
            console.error('Signin error:', error);
            setError(error instanceof Error ? error.message : 'Something went wrong');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDemoLogin = async (credentials) => {
        setEmail(credentials.email);
        setPassword(credentials.password);
        setLoading(true);
        setError('');
        try {
            const result = await signIn(credentials.email, credentials.password);
            if (result.success) {
                router.push('/');
                router.refresh();
            }
            else {
                setError(result.error || 'Invalid credentials');
            }
        }
        catch (error) {
            console.error('Signin error:', error);
            setError(error instanceof Error ? error.message : 'Something went wrong');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "auth-page signin-container fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6 overflow-auto", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full", children: [_jsxs(motion.div, { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 }, className: "flex flex-col justify-center space-y-8 text-white lg:pr-8", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-3 mb-6", children: [_jsx("div", { className: "p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600", children: _jsx(Building2, { className: "h-8 w-8 text-white" }) }), _jsx("h1", { className: "text-3xl font-bold", children: "Humber Operations" })] }), _jsxs("h2", { className: "text-4xl font-bold mb-4", children: ["Engineering Staffing", _jsx("span", { className: "block text-blue-400", children: "Automation System" })] }), _jsx("p", { className: "text-slate-300 text-lg", children: "Streamline your engineering deployments with our intelligent automation platform. Multi-partner RBAC system for secure, scalable operations." })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-xl font-semibold text-blue-400", children: "Demo Accounts - Click to Login" }), _jsx("p", { className: "text-sm text-slate-400 mb-4", children: "Test different user roles and permissions in the system" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: mockCredentials.map((cred, index) => (_jsxs(motion.button, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 * index }, onClick: () => handleDemoLogin(cred), disabled: loading, className: "text-left p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-blue-500 transition-all duration-200 group hover:bg-slate-800/70", children: [_jsx("div", { className: "text-sm font-medium text-white group-hover:text-blue-400", children: cred.role }), _jsx("div", { className: "text-xs text-slate-400 mb-1", children: cred.email }), _jsx("div", { className: "text-xs text-slate-500", children: cred.description })] }, cred.email))) }), _jsxs("div", { className: "mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg", children: [_jsx("h4", { className: "text-sm font-medium text-blue-400 mb-2", children: "\uD83C\uDFAF Role Capabilities:" }), _jsxs("div", { className: "text-xs text-slate-400 space-y-1", children: [_jsxs("div", { children: [_jsx("strong", { children: "System Admin:" }), " Full system access, user management, all features"] }), _jsxs("div", { children: [_jsx("strong", { children: "Engineer:" }), " Team management, time approval, bull pen access"] }), _jsxs("div", { children: [_jsx("strong", { children: "Operator:" }), " Project management, compliance monitoring"] }), _jsxs("div", { children: [_jsx("strong", { children: "Customer:" }), " View assigned engineers, approve timesheets"] }), _jsxs("div", { children: [_jsx("strong", { children: "Partner:" }), " Strategic oversight, client relations, analytics"] }), _jsxs("div", { children: [_jsx("strong", { children: "Employee:" }), " Self-service time tracking, personal calendar"] })] })] })] })] }), _jsx(motion.div, { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 }, className: "flex items-center justify-center", children: _jsx("div", { className: "w-full max-w-md", children: _jsxs("div", { className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 w-fit mx-auto mb-4", children: _jsx(Lock, { className: "h-6 w-6 text-white" }) }), _jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Welcome Back" }), _jsx("p", { className: "text-slate-400", children: "Sign in to your account" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [error && (_jsx("div", { className: "p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm", children: error })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email Address" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors", placeholder: "Enter your email", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" }), _jsx("input", { type: showPassword ? 'text' : 'password', value: password, onChange: (e) => setPassword(e.target.value), className: "w-full pl-10 pr-12 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors", placeholder: "Enter your password", required: true }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300", children: showPassword ? _jsx(EyeOff, { className: "h-5 w-5" }) : _jsx(Eye, { className: "h-5 w-5" }) })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? 'Signing In...' : 'Sign In' })] }), _jsx("div", { className: "mt-6 text-center", children: _jsxs("p", { className: "text-slate-400 text-sm", children: ["Don't have an account?", ' ', _jsx(Link, { href: "/auth/signup", className: "text-blue-400 hover:text-blue-300 transition-colors", children: "Sign up" })] }) })] }) }) })] }) }));
}
//# sourceMappingURL=page.js.map