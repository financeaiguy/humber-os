'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, User, Mail, Lock, Eye, EyeOff, Users } from 'lucide-react';
import Link from 'next/link';
const partners = [
    { id: 'humber-operations', name: 'Humber Operations' },
    { id: 'partner-gm', name: 'General Motors' },
    { id: 'partner-ford', name: 'Ford Motor Company' },
    { id: 'partner-stellantis', name: 'Stellantis' },
    { id: 'partner-hirotec', name: 'HIROTEC America' },
];
const roles = [
    {
        value: 'PARTNER_ADMIN',
        label: 'System Admin / Partner',
        description: 'Full system access, user management, all features'
    },
    {
        value: 'PARTNER_OPERATOR',
        label: 'Engineer / Operator / Customer',
        description: 'Operations control, project management, compliance monitoring'
    },
    {
        value: 'ENGINEER_EMPLOYEE',
        label: 'Employee (Self-Service)',
        description: 'Personal time tracking, calendar access, limited features'
    }
];
const demoAccounts = [
    { email: 'admin@humber.com', password: 'admin123', role: 'System Admin', access: 'Full system access' },
    { email: 'engineer@humber.com', password: 'engineer123', role: 'Engineer', access: 'Team management, approvals' },
    { email: 'operator@humber.com', password: 'operator123', role: 'Operator', access: 'Operations control' },
    { email: 'customer@gm.com', password: 'customer123', role: 'Customer (GM)', access: 'Client portal access' },
    { email: 'partner@ford.com', password: 'partner123', role: 'Partner (Ford)', access: 'Strategic management' },
    { email: 'employee@humber.com', password: 'employee123', role: 'Employee', access: 'Self-service portal' },
];
export default function SignUpPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'ENGINEER_EMPLOYEE',
        partnerId: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        try {
            console.log('Sign up data:', formData);
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('prefillEmail', formData.email);
            }
            alert(`Account created successfully for ${formData.name}! Redirecting to sign in with your email prefilled...`);
            router.push('/auth/signin');
        }
        catch (error) {
            console.error('Signup error:', error);
            setError(error instanceof Error ? error.message : 'Something went wrong');
        }
        finally {
            setLoading(false);
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full", children: [_jsxs(motion.div, { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 }, className: "flex flex-col justify-center space-y-8 text-white lg:pr-8", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-3 mb-6", children: [_jsx("div", { className: "p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600", children: _jsx(Building2, { className: "h-8 w-8 text-white" }) }), _jsx("h1", { className: "text-3xl font-bold", children: "Humber Operations" })] }), _jsxs("h2", { className: "text-4xl font-bold mb-4", children: ["Join Our", _jsx("span", { className: "block text-blue-400", children: "Partner Network" })] }), _jsx("p", { className: "text-slate-300 text-lg mb-8", children: "Create your account and get access to our engineering staffing automation platform. Choose your role and partner organization to get started." })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-xl font-semibold text-blue-400", children: "Role Types" }), _jsx("div", { className: "space-y-3", children: roles.map((role) => (_jsxs("div", { className: "p-3 rounded-lg bg-slate-800/30 border border-slate-700/50", children: [_jsx("div", { className: "font-medium text-white", children: role.label }), _jsx("div", { className: "text-sm text-slate-400", children: role.description })] }, role.value))) })] })] }), _jsx(motion.div, { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 }, className: "flex items-center justify-center", children: _jsx("div", { className: "w-full max-w-md", children: _jsxs("div", { className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 w-fit mx-auto mb-4", children: _jsx(Users, { className: "h-6 w-6 text-white" }) }), _jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Create Account" }), _jsx("p", { className: "text-slate-400", children: "Join the Humber Operations platform" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && (_jsx("div", { className: "p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm", children: error })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Full Name" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" }), _jsx("input", { type: "text", name: "name", value: formData.name, onChange: handleChange, className: "w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors", placeholder: "Enter your full name", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email Address" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" }), _jsx("input", { type: "email", name: "email", value: formData.email, onChange: handleChange, className: "w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors", placeholder: "Enter your email", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Partner Organization" }), _jsxs("select", { name: "partnerId", value: formData.partnerId, onChange: handleChange, className: "w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors", required: true, children: [_jsx("option", { value: "", children: "Select your organization" }), partners.map((partner) => (_jsx("option", { value: partner.id, children: partner.name }, partner.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Role" }), _jsx("select", { name: "role", value: formData.role, onChange: handleChange, className: "w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors", required: true, children: roles.map((role) => (_jsx("option", { value: role.value, children: role.label }, role.value))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" }), _jsx("input", { type: showPassword ? 'text' : 'password', name: "password", value: formData.password, onChange: handleChange, className: "w-full pl-10 pr-12 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors", placeholder: "Create a password", required: true }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300", children: showPassword ? _jsx(EyeOff, { className: "h-5 w-5" }) : _jsx(Eye, { className: "h-5 w-5" }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Confirm Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" }), _jsx("input", { type: showConfirmPassword ? 'text' : 'password', name: "confirmPassword", value: formData.confirmPassword, onChange: handleChange, className: "w-full pl-10 pr-12 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors", placeholder: "Confirm your password", required: true }), _jsx("button", { type: "button", onClick: () => setShowConfirmPassword(!showConfirmPassword), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300", children: showConfirmPassword ? _jsx(EyeOff, { className: "h-5 w-5" }) : _jsx(Eye, { className: "h-5 w-5" }) })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? 'Creating Account...' : 'Create Account' })] }), _jsxs("div", { className: "mt-8 pt-6 border-t border-slate-700", children: [_jsx("h3", { className: "text-lg font-semibold text-blue-400 mb-4", children: "\uD83E\uDDEA Demo Accounts Available" }), _jsx("p", { className: "text-sm text-slate-400 mb-4", children: "Skip signup and test with pre-configured demo accounts" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: demoAccounts.map((account, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 * index }, className: "p-3 rounded-lg bg-slate-800/30 border border-slate-700/50", children: [_jsx("div", { className: "text-sm font-medium text-white", children: account.role }), _jsx("div", { className: "text-xs text-slate-400 mb-1", children: account.email }), _jsx("div", { className: "text-xs text-slate-500", children: account.access })] }, account.email))) }), _jsx("div", { className: "mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg", children: _jsxs("p", { className: "text-xs text-blue-400", children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Quick Test:" }), " Go to ", _jsx(Link, { href: "/auth/signin", className: "underline hover:text-blue-300", children: "Sign In" }), " and click any demo account to instantly test different roles and permissions."] }) })] }), _jsx("div", { className: "mt-6 text-center", children: _jsxs("p", { className: "text-slate-400 text-sm", children: ["Already have an account?", ' ', _jsx(Link, { href: "/auth/signin", className: "text-blue-400 hover:text-blue-300 transition-colors", children: "Sign in" })] }) })] }) }) })] }) }));
}
//# sourceMappingURL=page.js.map