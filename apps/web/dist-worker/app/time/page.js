'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Smartphone, Shield, AlertTriangle, Fingerprint, Bell, Mail, MessageSquare, AlertCircle, Activity, ChevronRight, Lock, Eye, EyeOff, Navigation, Signal, Battery, Zap, ExternalLink, UserCheck, Calculator, X, Calendar } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSession } from '@/components/session-context';
const EmployeeDetailModal = dynamic(() => import('@/components/time-tracking/EmployeeDetailModal'), { ssr: false });
const TimeReconciliation = dynamic(() => import('@/components/time-tracking/TimeReconciliation'), { ssr: false });
const EmployeeClockView = dynamic(() => import('@/components/time-tracking/EmployeeClockView'), { ssr: false });
const TimeTrackingCalendar = dynamic(() => import('@/components/time-tracking/TimeTrackingCalendar'), { ssr: false });
import { ClientTimeDisplay } from '@/components/client-time-display';
const timeEntries = [
    {
        id: 1,
        employee: 'Sarah Johnson',
        role: 'Senior Electrical Engineer',
        project: 'GM Assembly Line',
        clockIn: '2025-01-15 08:02:15',
        clockOut: '2025-01-15 17:45:32',
        totalHours: 9.72,
        location: { lat: 42.3314, lng: -83.0458, address: 'Detroit, MI - GM Tech Center' },
        trustScore: 98,
        verificationLayers: {
            biometric: { verified: true, type: 'FaceID', timestamp: '08:02:10' },
            geolocation: { verified: true, accuracy: '12m', withinGeofence: true },
            deviceTrust: { verified: true, deviceId: 'iPhone-14-Pro-XXX', jailbroken: false }
        },
        notifications: {
            manager: { sent: true, method: 'SMS', number: '+1-555-0100' },
            hr: { sent: true, method: 'Email', email: 'hr@humber.com' },
            client: { sent: false, method: 'API', endpoint: 'gm.workforce.api' }
        },
        anomalies: [],
        status: 'verified'
    },
    {
        id: 2,
        employee: 'Michael Chen',
        role: 'Mechanical Engineer',
        project: 'Ford Paint Shop',
        clockIn: '2025-01-15 07:45:00',
        clockOut: null,
        totalHours: null,
        location: { lat: 42.3154, lng: -83.2165, address: 'Dearborn, MI - Ford Rouge' },
        trustScore: 92,
        verificationLayers: {
            biometric: { verified: true, type: 'TouchID', timestamp: '07:44:55' },
            geolocation: { verified: true, accuracy: '25m', withinGeofence: true },
            deviceTrust: { verified: true, deviceId: 'Android-S23-YYY', jailbroken: false }
        },
        notifications: {
            manager: { sent: true, method: 'SMS', number: '+1-555-0101' },
            hr: { sent: false, method: 'Email', email: 'hr@humber.com' },
            client: { sent: true, method: 'Webhook', endpoint: 'ford.timetrack.webhook' }
        },
        anomalies: [],
        status: 'active'
    },
    {
        id: 3,
        employee: 'Emily Rodriguez',
        role: 'Software Engineer',
        project: 'Stellantis Automation',
        clockIn: '2025-01-15 09:30:00',
        clockOut: null,
        totalHours: null,
        location: { lat: 42.4733, lng: -83.2847, address: 'Auburn Hills, MI - Remote' },
        trustScore: 75,
        verificationLayers: {
            biometric: { verified: false, type: 'PIN', timestamp: '09:29:55' },
            geolocation: { verified: true, accuracy: '45m', withinGeofence: false },
            deviceTrust: { verified: true, deviceId: 'iPad-Pro-ZZZ', jailbroken: false }
        },
        notifications: {
            manager: { sent: true, method: 'SMS', number: '+1-555-0102' },
            hr: { sent: true, method: 'Email', email: 'hr@humber.com' },
            client: { sent: false, method: 'None', endpoint: null }
        },
        anomalies: ['Outside geofence', 'No biometric verification'],
        status: 'review'
    }
];
const trustLayers = [
    {
        name: 'Biometric Authentication',
        icon: Fingerprint,
        weight: 40,
        methods: ['FaceID', 'TouchID', 'Fingerprint', 'Voice Recognition'],
        required: true,
        color: 'from-purple-500 to-pink-500'
    },
    {
        name: 'Geolocation Verification',
        icon: MapPin,
        weight: 35,
        methods: ['GPS', 'WiFi Triangulation', 'Cell Tower', 'Bluetooth Beacons'],
        required: true,
        color: 'from-blue-500 to-cyan-500'
    },
    {
        name: 'Device Trust',
        icon: Shield,
        weight: 25,
        methods: ['Device ID', 'Jailbreak Detection', 'App Integrity', 'Network Security'],
        required: true,
        color: 'from-green-500 to-emerald-500'
    }
];
const notificationChannels = [
    {
        name: 'Twilio SMS',
        icon: MessageSquare,
        enabled: true,
        config: {
            accountSid: 'AC***',
            authToken: '***',
            fromNumber: '+1-555-0000'
        },
        recipients: ['Manager', 'HR', 'Admin'],
        events: ['Clock In', 'Clock Out', 'Anomaly Detected', 'Overtime Alert']
    },
    {
        name: 'SendGrid Email',
        icon: Mail,
        enabled: true,
        config: {
            apiKey: 'SG.***',
            fromEmail: 'timetrack@humber.com'
        },
        recipients: ['HR', 'Payroll', 'Client'],
        events: ['Daily Summary', 'Weekly Report', 'Exceptions']
    },
    {
        name: 'Push Notifications',
        icon: Bell,
        enabled: true,
        config: {
            fcmKey: 'FCM***',
            apnsKey: 'APNS***'
        },
        recipients: ['Employee', 'Manager'],
        events: ['Reminder', 'Approval Required', 'Schedule Change']
    }
];
const getTrustScoreColor = (score) => {
    if (score >= 90)
        return 'text-green-400';
    if (score >= 75)
        return 'text-yellow-400';
    if (score >= 60)
        return 'text-orange-400';
    return 'text-red-400';
};
const getStatusColor = (status) => {
    switch (status) {
        case 'verified': return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'active': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'review': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
};
export default function TimeTrackingPage() {
    const { data: session } = useSession();
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [showTrustDetails, setShowTrustDetails] = useState(false);
    const [liveTracking, setLiveTracking] = useState(true);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [activeView, setActiveView] = useState('entries');
    const [showClockModal, setShowClockModal] = useState(false);
    return (_jsxs("div", { className: "space-y-8 bg-slate-950 min-h-screen", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-white mb-2", children: "Advanced Time Tracking" }), _jsx("p", { className: "text-slate-400", children: "Multi-layer trust verification with real-time notifications and geofencing" })] }), _jsx("div", { className: "flex items-center space-x-3", children: _jsxs(Link, { href: "/time/employee", className: "px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2", children: [_jsx(UserCheck, { className: "h-5 w-5" }), _jsx("span", { children: "Employee View" })] }) })] }), _jsxs("div", { className: "flex items-center space-x-1 bg-slate-800/50 backdrop-blur-xl rounded-xl p-1 w-fit", children: [_jsxs("button", { onClick: () => setActiveView('entries'), className: `px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${activeView === 'entries'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`, children: [_jsx(Clock, { className: "h-4 w-4" }), _jsx("span", { children: "Time Entries" })] }), _jsxs("button", { onClick: () => setActiveView('reconciliation'), className: `px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${activeView === 'reconciliation'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`, children: [_jsx(Calculator, { className: "h-4 w-4" }), _jsx("span", { children: "Time Reconciliation" })] }), _jsxs("button", { onClick: () => setActiveView('calendar'), className: `px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${activeView === 'calendar'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`, children: [_jsx(Calendar, { className: "h-4 w-4" }), _jsx("span", { children: "Calendar View" })] })] }), activeView === 'entries' ? (_jsxs(_Fragment, { children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "relative", children: [_jsx(Clock, { className: "h-8 w-8 text-blue-400" }), _jsx("div", { className: "absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" })] }), _jsx(ClientTimeDisplay, { className: "text-2xl font-bold text-white", dateClassName: "text-sm text-slate-400" })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Signal, { className: "h-5 w-5 text-green-400" }), _jsx("span", { className: "text-sm text-slate-400", children: "GPS Active" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Battery, { className: "h-5 w-5 text-yellow-400" }), _jsx("span", { className: "text-sm text-slate-400", children: "85%" })] }), _jsx("button", { onClick: () => setLiveTracking(!liveTracking), className: `px-4 py-2 rounded-lg font-medium transition-all ${liveTracking
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-slate-700 text-slate-400'}`, children: liveTracking ? 'Live Tracking ON' : 'Live Tracking OFF' })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("button", { onClick: () => setShowClockModal(true), className: "py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center space-x-3", children: [_jsx(Smartphone, { className: "h-6 w-6" }), _jsx("span", { children: "Clock In" }), _jsx(ChevronRight, { className: "h-5 w-5" })] }), _jsxs("button", { onClick: () => setShowClockModal(true), className: "py-4 px-6 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center space-x-3", children: [_jsx(Smartphone, { className: "h-6 w-6" }), _jsx("span", { children: "Clock Out" }), _jsx(ChevronRight, { className: "h-5 w-5" })] })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-xl font-semibold text-white", children: "3-Layer Trust Verification System" }), _jsxs("button", { onClick: () => setShowTrustDetails(!showTrustDetails), className: "text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1", children: [showTrustDetails ? _jsx(EyeOff, { className: "h-4 w-4" }) : _jsx(Eye, { className: "h-4 w-4" }), _jsxs("span", { children: [showTrustDetails ? 'Hide' : 'Show', " Details"] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: trustLayers.map((layer, index) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.1 }, className: "rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `h-10 w-10 rounded-lg bg-gradient-to-r ${layer.color} flex items-center justify-center`, children: _jsx(layer.icon, { className: "h-5 w-5 text-white" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-white", children: layer.name }), _jsxs("p", { className: "text-xs text-slate-400", children: ["Weight: ", layer.weight, "%"] })] })] }), layer.required && (_jsx(Lock, { className: "h-4 w-4 text-red-400" }))] }), _jsx(AnimatePresence, { children: showTrustDetails && (_jsxs(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: 'auto', opacity: 1 }, exit: { height: 0, opacity: 0 }, className: "space-y-2", children: [_jsx("p", { className: "text-xs text-slate-500 mb-2", children: "Verification Methods:" }), layer.methods.map((method, i) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "h-1.5 w-1.5 bg-green-400 rounded-full" }), _jsx("span", { className: "text-xs text-slate-300", children: method })] }, i)))] })) })] }, layer.name))) })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-white mb-4", children: "Active Time Entries" }), _jsx("div", { className: "space-y-4", children: timeEntries.map((entry, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600 transition-all duration-300 cursor-pointer group", onClick: () => {
                                        setSelectedEntry(entry);
                                        setShowEmployeeModal(true);
                                    }, children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold", children: entry.employee.split(' ').map(n => n[0]).join('') }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-white text-lg", children: entry.employee }), _jsxs("p", { className: "text-sm text-slate-400", children: [entry.role, " \u2022 ", entry.project] }), _jsxs("div", { className: "flex items-center space-x-3 mt-1", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(MapPin, { className: "h-3 w-3 text-slate-500" }), _jsx("span", { className: "text-xs text-slate-500", children: entry.location.address })] }), _jsx("span", { className: `text-xs px-2 py-0.5 rounded-full border ${getStatusColor(entry.status)}`, children: entry.status })] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Shield, { className: "h-5 w-5 text-slate-400" }), _jsxs("span", { className: `text-2xl font-bold ${getTrustScoreColor(entry.trustScore)}`, children: [entry.trustScore, "%"] })] }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Trust Score" }), _jsxs("button", { className: "mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1 opacity-0 group-hover:opacity-100", children: [_jsx("span", { children: "View Details" }), _jsx(ExternalLink, { className: "h-3 w-3" })] })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4 mb-4", children: [_jsxs("div", { className: "bg-slate-900/50 rounded-lg p-3", children: [_jsx("p", { className: "text-xs text-slate-500 mb-1", children: "Clock In" }), _jsx("p", { className: "text-sm font-medium text-white", children: entry.clockIn ? new Date(entry.clockIn).toLocaleTimeString() : '-' })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-lg p-3", children: [_jsx("p", { className: "text-xs text-slate-500 mb-1", children: "Clock Out" }), _jsx("p", { className: "text-sm font-medium text-white", children: entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString() :
                                                                entry.status === 'active' ? _jsx("span", { className: "text-green-400", children: "Active" }) : '-' })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-lg p-3", children: [_jsx("p", { className: "text-xs text-slate-500 mb-1", children: "Total Hours" }), _jsx("p", { className: "text-sm font-medium text-white", children: entry.totalHours ? `${entry.totalHours.toFixed(2)}h` :
                                                                entry.status === 'active' ? _jsx(Activity, { className: "h-4 w-4 text-green-400 inline" }) : '-' })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-3 mb-4", children: [_jsxs("div", { className: `flex items-center space-x-2 p-2 rounded-lg ${entry.verificationLayers.biometric.verified ? 'bg-green-500/10' : 'bg-red-500/10'}`, children: [_jsx(Fingerprint, { className: `h-4 w-4 ${entry.verificationLayers.biometric.verified ? 'text-green-400' : 'text-red-400'}` }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-300", children: entry.verificationLayers.biometric.type }), _jsx("p", { className: "text-xs text-slate-500", children: entry.verificationLayers.biometric.timestamp })] })] }), _jsxs("div", { className: `flex items-center space-x-2 p-2 rounded-lg ${entry.verificationLayers.geolocation.verified ? 'bg-green-500/10' : 'bg-red-500/10'}`, children: [_jsx(Navigation, { className: `h-4 w-4 ${entry.verificationLayers.geolocation.verified ? 'text-green-400' : 'text-red-400'}` }), _jsxs("div", { children: [_jsxs("p", { className: "text-xs text-slate-300", children: ["GPS \u00B1", entry.verificationLayers.geolocation.accuracy] }), _jsx("p", { className: "text-xs text-slate-500", children: entry.verificationLayers.geolocation.withinGeofence ? 'In zone' : 'Outside zone' })] })] }), _jsxs("div", { className: `flex items-center space-x-2 p-2 rounded-lg ${entry.verificationLayers.deviceTrust.verified ? 'bg-green-500/10' : 'bg-red-500/10'}`, children: [_jsx(Smartphone, { className: `h-4 w-4 ${entry.verificationLayers.deviceTrust.verified ? 'text-green-400' : 'text-red-400'}` }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-300", children: "Device OK" }), _jsx("p", { className: "text-xs text-slate-500", children: entry.verificationLayers.deviceTrust.jailbroken ? 'Jailbroken' : 'Secure' })] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: "text-xs text-slate-500", children: "Notifications:" }), entry.notifications.manager.sent && (_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(MessageSquare, { className: "h-3 w-3 text-blue-400" }), _jsx("span", { className: "text-xs text-slate-400", children: "Manager" })] })), entry.notifications.hr.sent && (_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Mail, { className: "h-3 w-3 text-green-400" }), _jsx("span", { className: "text-xs text-slate-400", children: "HR" })] })), entry.notifications.client.sent && (_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Bell, { className: "h-3 w-3 text-purple-400" }), _jsx("span", { className: "text-xs text-slate-400", children: "Client" })] }))] }), entry.anomalies.length > 0 && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-400" }), _jsx("span", { className: "text-xs text-yellow-400", children: entry.anomalies.join(', ') })] }))] })] }, entry.id))) })] }), _jsxs("div", { className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-white mb-4", children: "Notification Channels" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: notificationChannels.map((channel, index) => (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { delay: index * 0.1 }, className: "bg-slate-900/50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `h-10 w-10 rounded-lg ${channel.enabled ? 'bg-green-500/20' : 'bg-slate-700'} flex items-center justify-center`, children: _jsx(channel.icon, { className: `h-5 w-5 ${channel.enabled ? 'text-green-400' : 'text-slate-500'}` }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-white", children: channel.name }), _jsx("p", { className: "text-xs text-slate-400", children: channel.enabled ? 'Active' : 'Disabled' })] })] }), _jsx("button", { className: `w-12 h-6 rounded-full transition-colors ${channel.enabled ? 'bg-green-500' : 'bg-slate-700'}`, children: _jsx("div", { className: `h-5 w-5 bg-white rounded-full transition-transform ${channel.enabled ? 'translate-x-6' : 'translate-x-0.5'}` }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-500 mb-1", children: "Recipients:" }), _jsx("div", { className: "flex flex-wrap gap-1", children: channel.recipients.map((recipient, i) => (_jsx("span", { className: "px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-300", children: recipient }, i))) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-500 mb-1", children: "Events:" }), _jsxs("div", { className: "flex flex-wrap gap-1", children: [channel.events.slice(0, 3).map((event, i) => (_jsx("span", { className: "px-2 py-0.5 bg-blue-500/10 rounded text-xs text-blue-400", children: event }, i))), channel.events.length > 3 && (_jsxs("span", { className: "px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-500", children: ["+", channel.events.length - 3] }))] })] })] })] }, channel.name))) })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.5 }, className: "rounded-2xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-4", children: "System Trust Analytics" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30", children: [_jsx(Zap, { className: "h-8 w-8 text-green-400 mx-auto mb-2" }), _jsx("div", { className: "text-2xl font-bold text-green-400", children: "88%" }), _jsx("div", { className: "text-sm text-green-300", children: "Avg Trust Score" })] }), _jsxs("div", { className: "text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30", children: [_jsx(Shield, { className: "h-8 w-8 text-blue-400 mx-auto mb-2" }), _jsx("div", { className: "text-2xl font-bold text-blue-400", children: "2,847" }), _jsx("div", { className: "text-sm text-blue-300", children: "Verified Entries" })] }), _jsxs("div", { className: "text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30", children: [_jsx(AlertCircle, { className: "h-8 w-8 text-yellow-400 mx-auto mb-2" }), _jsx("div", { className: "text-2xl font-bold text-yellow-400", children: "23" }), _jsx("div", { className: "text-sm text-yellow-300", children: "Under Review" })] }), _jsxs("div", { className: "text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/30", children: [_jsx(Bell, { className: "h-8 w-8 text-purple-400 mx-auto mb-2" }), _jsx("div", { className: "text-2xl font-bold text-purple-400", children: "8,541" }), _jsx("div", { className: "text-sm text-purple-300", children: "Notifications Sent" })] })] })] })] })) : activeView === 'reconciliation' ? (_jsx(TimeReconciliation, {})) : (_jsx(TimeTrackingCalendar, { userRole: session?.user?.role === 'ENGINEER_EMPLOYEE' ? 'employee' :
                    session?.user?.role === 'PARTNER_ADMIN' ? 'partner' :
                        session?.user?.role === 'PARTNER_OPERATOR' ? 'operator' : 'engineer', employeeId: session?.user?.id, isReadOnly: false })), _jsx(EmployeeDetailModal, { employee: selectedEntry, isOpen: showEmployeeModal, onClose: () => {
                    setShowEmployeeModal(false);
                    setSelectedEntry(null);
                } }), showClockModal && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-slate-900 rounded-2xl border border-slate-700/50 w-full max-w-md max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "p-4 border-b border-slate-700/50 flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-semibold text-white", children: "Time Clock" }), _jsx("button", { onClick: () => setShowClockModal(false), className: "p-2 hover:bg-slate-800 rounded-lg transition-colors", children: _jsx(X, { className: "h-5 w-5 text-slate-400" }) })] }), _jsx(EmployeeClockView, { onClose: () => setShowClockModal(false) })] }) }))] }));
}
//# sourceMappingURL=page.js.map