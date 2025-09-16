'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Shield, Fingerprint, Eye, Smartphone, CheckCircle, XCircle, AlertTriangle, Play, Square, Coffee, Settings } from 'lucide-react';
import { biometricAuth, faceRecognition } from '@/lib/biometric-auth';
import { geolocationService, deviceInfoService } from '@/lib/geolocation-service';
export function SecureTimeTracking() {
    const [trackingState, setTrackingState] = useState({
        isTracking: false,
        startTime: null,
        currentTime: new Date(),
        totalHours: 0,
        breakTime: 0,
        trustScore: 0,
        verificationLevel: 'LOW'
    });
    const [verification, setVerification] = useState({
        biometric: { status: 'pending', confidence: 0 },
        geolocation: { status: 'pending', accuracy: 0, distance: 0 },
        device: { status: 'pending', trustLevel: 'UNVERIFIED' }
    });
    const [showBiometricModal, setShowBiometricModal] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [selectedProject, setSelectedProject] = useState('');
    const intervalRef = useRef();
    useEffect(() => {
        const timer = setInterval(() => {
            setTrackingState(prev => ({
                ...prev,
                currentTime: new Date(),
                totalHours: prev.startTime ? (Date.now() - prev.startTime.getTime()) / (1000 * 60 * 60) : 0
            }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    const performSecurityVerification = async () => {
        setIsVerifying(true);
        try {
            setVerification(prev => ({ ...prev, biometric: { ...prev.biometric, status: 'pending' } }));
            const biometricResult = await biometricAuth.authenticateBiometric('user_credential_id');
            setVerification(prev => ({
                ...prev,
                biometric: {
                    status: biometricResult.success ? 'success' : 'failed',
                    confidence: biometricResult.confidence
                }
            }));
            setVerification(prev => ({ ...prev, geolocation: { ...prev.geolocation, status: 'pending' } }));
            const locationResult = await geolocationService.getCurrentLocation(true);
            setVerification(prev => ({
                ...prev,
                geolocation: {
                    status: locationResult.success && locationResult.verification?.isWithinWorkSite ? 'success' : 'failed',
                    accuracy: locationResult.location?.accuracy || 0,
                    distance: locationResult.verification?.distanceFromWorkSite || 0
                }
            }));
            setVerification(prev => ({ ...prev, device: { ...prev.device, status: 'pending' } }));
            const deviceInfo = await deviceInfoService.getDeviceInfo();
            const deviceTrusted = deviceInfo.security.isSecureContext && deviceInfo.capabilities.biometric;
            setVerification(prev => ({
                ...prev,
                device: {
                    status: deviceTrusted ? 'success' : 'failed',
                    trustLevel: deviceTrusted ? 'TRUSTED' : 'UNVERIFIED'
                }
            }));
            const biometricScore = biometricResult.success ? biometricResult.confidence : 0;
            const locationScore = locationResult.verification?.isWithinWorkSite ? 90 : 30;
            const deviceScore = deviceTrusted ? 85 : 40;
            const overallTrustScore = Math.round((biometricScore + locationScore + deviceScore) / 3);
            let verificationLevel = 'LOW';
            if (overallTrustScore >= 90)
                verificationLevel = 'MAXIMUM';
            else if (overallTrustScore >= 75)
                verificationLevel = 'HIGH';
            else if (overallTrustScore >= 60)
                verificationLevel = 'MEDIUM';
            setTrackingState(prev => ({
                ...prev,
                trustScore: overallTrustScore,
                verificationLevel
            }));
            return overallTrustScore >= 60;
        }
        catch (error) {
            console.error('Security verification failed:', error);
            return false;
        }
        finally {
            setIsVerifying(false);
        }
    };
    const handleClockIn = async () => {
        if (!selectedProject) {
            alert('Please select a project before clocking in');
            return;
        }
        const verified = await performSecurityVerification();
        if (!verified) {
            alert('Security verification failed. Please ensure you are at an approved location with proper biometric authentication.');
            return;
        }
        setTrackingState(prev => ({
            ...prev,
            isTracking: true,
            startTime: new Date()
        }));
        intervalRef.current = setInterval(async () => {
            await performSecurityVerification();
        }, 30 * 60 * 1000);
    };
    const handleClockOut = async () => {
        const verified = await performSecurityVerification();
        if (!verified) {
            alert('Security verification failed for clock out. Please verify your identity and location.');
            return;
        }
        setTrackingState(prev => ({
            ...prev,
            isTracking: false,
            startTime: null
        }));
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'text-green-400';
            case 'failed': return 'text-red-400';
            default: return 'text-yellow-400';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return _jsx(CheckCircle, { className: "h-5 w-5" });
            case 'failed': return _jsx(XCircle, { className: "h-5 w-5" });
            default: return _jsx(AlertTriangle, { className: "h-5 w-5" });
        }
    };
    const getTrustScoreColor = (score) => {
        if (score >= 90)
            return 'text-green-400';
        if (score >= 75)
            return 'text-blue-400';
        if (score >= 60)
            return 'text-yellow-400';
        return 'text-red-400';
    };
    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-white mb-2", children: "Advanced Time Tracking" }), _jsx("p", { className: "text-slate-400", children: "Multi-layer trust verification with real-time monitoring and geofencing" })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-2xl font-bold text-white", children: formatTime(trackingState.currentTime) }), _jsx("p", { className: "text-sm text-slate-400", children: "Monday, September 15, 2025" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "h-3 w-3 rounded-full bg-green-400 animate-pulse" }), _jsx("span", { className: "text-sm text-slate-400", children: "GPS Active" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "h-3 w-3 rounded-full bg-blue-400" }), _jsx("span", { className: "text-sm text-slate-400", children: "85% Trust Score" })] }), _jsx("span", { className: "px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium", children: "Live Tracking ON" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-white mb-4", children: "Time Controls" }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-white mb-2", children: "Select Project" }), _jsxs("select", { value: selectedProject, onChange: (e) => setSelectedProject(e.target.value), className: "w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500", disabled: trackingState.isTracking, children: [_jsx("option", { value: "", children: "Choose Project" }), _jsx("option", { value: "gm-assembly", children: "GM Assembly Line Automation" }), _jsx("option", { value: "ford-paint", children: "Ford Paint Shop Upgrade" }), _jsx("option", { value: "stellantis-qc", children: "Stellantis Quality Control" }), _jsx("option", { value: "hirotec-welding", children: "HIROTEC Welding System" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [!trackingState.isTracking ? (_jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: handleClockIn, disabled: !selectedProject || isVerifying, className: "flex flex-col items-center justify-center p-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(Play, { className: "h-8 w-8 mb-2" }), _jsx("span", { className: "text-lg font-semibold", children: "Clock In" }), _jsx("span", { className: "text-sm opacity-80", children: "Secure verification" })] })) : (_jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: handleClockOut, disabled: isVerifying, className: "flex flex-col items-center justify-center p-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50", children: [_jsx(Square, { className: "h-8 w-8 mb-2" }), _jsx("span", { className: "text-lg font-semibold", children: "Clock Out" }), _jsx("span", { className: "text-sm opacity-80", children: "End session" })] })), _jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, className: "flex flex-col items-center justify-center p-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-300", children: [_jsx(Coffee, { className: "h-8 w-8 mb-2" }), _jsx("span", { className: "text-lg font-semibold", children: "Break" }), _jsx("span", { className: "text-sm opacity-80", children: "Start break" })] })] }), trackingState.isTracking && (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-600", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm text-slate-400", children: "Session Started" }), _jsx("span", { className: "text-sm font-medium text-white", children: trackingState.startTime ? formatTime(trackingState.startTime) : '--:--' })] }), _jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm text-slate-400", children: "Hours Worked" }), _jsxs("span", { className: "text-lg font-bold text-white", children: [trackingState.totalHours.toFixed(2), "h"] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-slate-400", children: "Trust Score" }), _jsxs("span", { className: `text-sm font-bold ${getTrustScoreColor(trackingState.trustScore)}`, children: [trackingState.trustScore, "%"] })] })] }))] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-xl font-semibold text-white", children: "3-Layer Trust Verification System" }), _jsx("button", { onClick: () => setShowBiometricModal(true), className: "p-2 hover:bg-slate-700/50 rounded-lg transition-colors", children: _jsx(Settings, { className: "h-5 w-5 text-slate-400" }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-600/30", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-2 rounded-lg bg-purple-500/20", children: _jsx(Fingerprint, { className: "h-6 w-6 text-purple-400" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-white", children: "Biometric Authentication" }), _jsx("p", { className: "text-xs text-slate-400", children: "WebAuthn \u2022 Face ID" })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `${getStatusColor(verification.biometric.status)}`, children: getStatusIcon(verification.biometric.status) }), _jsxs("span", { className: "text-sm font-medium text-slate-300", children: [verification.biometric.confidence, "%"] })] })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-600/30", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-2 rounded-lg bg-blue-500/20", children: _jsx(MapPin, { className: "h-6 w-6 text-blue-400" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-white", children: "Geolocation Verification" }), _jsx("p", { className: "text-xs text-slate-400", children: verification.geolocation.distance > 0
                                                                    ? `${Math.round(verification.geolocation.distance)}m from work site`
                                                                    : 'Verifying location...' })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `${getStatusColor(verification.geolocation.status)}`, children: getStatusIcon(verification.geolocation.status) }), _jsxs("span", { className: "text-sm font-medium text-slate-300", children: ["\u00B1", Math.round(verification.geolocation.accuracy), "m"] })] })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-600/30", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-2 rounded-lg bg-green-500/20", children: _jsx(Shield, { className: "h-6 w-6 text-green-400" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-white", children: "Device Trust" }), _jsx("p", { className: "text-xs text-slate-400", children: verification.device.trustLevel })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `${getStatusColor(verification.device.status)}`, children: getStatusIcon(verification.device.status) }), _jsx(Smartphone, { className: "h-4 w-4 text-slate-400" })] })] })] }), _jsxs("div", { className: "mt-6 p-4 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-lg border border-slate-600/30", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-white", children: "Overall Trust Score" }), _jsxs("span", { className: `text-2xl font-bold ${getTrustScoreColor(trackingState.trustScore)}`, children: [trackingState.trustScore, "%"] })] }), _jsx("div", { className: "w-full bg-slate-700 rounded-full h-2", children: _jsx(motion.div, { initial: { width: 0 }, animate: { width: `${trackingState.trustScore}%` }, transition: { duration: 1, ease: "easeOut" }, className: `h-2 rounded-full ${trackingState.trustScore >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                                trackingState.trustScore >= 75 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                                    trackingState.trustScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                                        'bg-gradient-to-r from-red-500 to-red-600'}` }) }), _jsxs("p", { className: "text-xs text-slate-400 mt-2", children: ["Verification Level: ", _jsx("span", { className: "font-medium text-slate-300", children: trackingState.verificationLevel })] })] })] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-white mb-6", children: "Active Time Entries" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-4 bg-slate-900/50 rounded-xl border border-slate-600/30", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold", children: "SJ" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-white", children: "Sarah Johnson" }), _jsx("p", { className: "text-sm text-slate-400", children: "Senior Electrical Engineer \u2022 GM Assembly Line" }), _jsxs("div", { className: "flex items-center space-x-4 mt-1", children: [_jsx("span", { className: "text-xs text-slate-400", children: "\uD83D\uDCCD Detroit, MI \u2022 GM Tech Center" }), _jsx("span", { className: "text-xs text-slate-400", children: "\uD83D\uDD12 Verified" })] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx(Clock, { className: "h-4 w-4 text-green-400" }), _jsx("span", { className: "text-green-400 font-medium", children: "8:02:18 AM" })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-slate-400", children: "Total Hours" }), _jsx("p", { className: "text-xl font-bold text-white", children: "9.72h" })] }), _jsxs("div", { className: "flex items-center justify-end space-x-1 mt-2", children: [_jsx("div", { className: "h-2 w-2 rounded-full bg-green-400" }), _jsx("span", { className: "text-xs text-green-400 font-medium", children: "98%" })] })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-2 mt-4", children: [_jsxs("div", { className: "flex items-center space-x-2 p-2 bg-slate-800/50 rounded", children: [_jsx(Fingerprint, { className: "h-4 w-4 text-purple-400" }), _jsx("span", { className: "text-xs text-slate-300", children: "FaceID" }), _jsx(CheckCircle, { className: "h-3 w-3 text-green-400" })] }), _jsxs("div", { className: "flex items-center space-x-2 p-2 bg-slate-800/50 rounded", children: [_jsx(MapPin, { className: "h-4 w-4 text-blue-400" }), _jsx("span", { className: "text-xs text-slate-300", children: "GPS \u00B112m" }), _jsx(CheckCircle, { className: "h-3 w-3 text-green-400" })] }), _jsxs("div", { className: "flex items-center space-x-2 p-2 bg-slate-800/50 rounded", children: [_jsx(Shield, { className: "h-4 w-4 text-green-400" }), _jsx("span", { className: "text-xs text-slate-300", children: "Device OK" }), _jsx(CheckCircle, { className: "h-3 w-3 text-green-400" })] })] })] }), _jsxs("div", { className: "p-4 bg-slate-900/50 rounded-xl border border-slate-600/30", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold", children: "MC" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-white", children: "Michael Chen" }), _jsx("p", { className: "text-sm text-slate-400", children: "Mechanical Engineer \u2022 Ford Paint Shop" }), _jsxs("div", { className: "flex items-center space-x-4 mt-1", children: [_jsx("span", { className: "text-xs text-slate-400", children: "\uD83D\uDCCD Dearborn, MI \u2022 Ford Rouge" }), _jsx("span", { className: "text-xs text-slate-400", children: "\uD83D\uDD12 Active" })] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx(Clock, { className: "h-4 w-4 text-green-400" }), _jsx("span", { className: "text-green-400 font-medium", children: "7:45:00 AM" })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-slate-400", children: "Total Hours" }), _jsx("p", { className: "text-xl font-bold text-white", children: "-" })] }), _jsxs("div", { className: "flex items-center justify-end space-x-1 mt-2", children: [_jsx("div", { className: "h-2 w-2 rounded-full bg-green-400" }), _jsx("span", { className: "text-xs text-green-400 font-medium", children: "92%" })] })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-2 mt-4", children: [_jsxs("div", { className: "flex items-center space-x-2 p-2 bg-slate-800/50 rounded", children: [_jsx(Fingerprint, { className: "h-4 w-4 text-purple-400" }), _jsx("span", { className: "text-xs text-slate-300", children: "TouchID" }), _jsx(CheckCircle, { className: "h-3 w-3 text-green-400" })] }), _jsxs("div", { className: "flex items-center space-x-2 p-2 bg-slate-800/50 rounded", children: [_jsx(MapPin, { className: "h-4 w-4 text-blue-400" }), _jsx("span", { className: "text-xs text-slate-300", children: "GPS \u00B125m" }), _jsx(CheckCircle, { className: "h-3 w-3 text-green-400" })] }), _jsxs("div", { className: "flex items-center space-x-2 p-2 bg-slate-800/50 rounded", children: [_jsx(Shield, { className: "h-4 w-4 text-green-400" }), _jsx("span", { className: "text-xs text-slate-300", children: "Secure" }), _jsx(CheckCircle, { className: "h-3 w-3 text-green-400" })] })] })] }), _jsxs("div", { className: "p-4 bg-slate-900/50 rounded-xl border border-slate-600/30", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "h-12 w-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold", children: "ER" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-white", children: "Emily Rodriguez" }), _jsx("p", { className: "text-sm text-slate-400", children: "Software Engineer \u2022 Stellantis Automation" }), _jsxs("div", { className: "flex items-center space-x-4 mt-1", children: [_jsx("span", { className: "text-xs text-slate-400", children: "\uD83D\uDCCD Auburn Hills, MI \u2022 Remote" }), _jsx("span", { className: "text-xs text-slate-400", children: "\uD83D\uDD12 Review" })] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx(Clock, { className: "h-4 w-4 text-green-400" }), _jsx("span", { className: "text-green-400 font-medium", children: "9:30:00 AM" })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-slate-400", children: "Total Hours" }), _jsx("p", { className: "text-xl font-bold text-white", children: "-" })] }), _jsxs("div", { className: "flex items-center justify-end space-x-1 mt-2", children: [_jsx("div", { className: "h-2 w-2 rounded-full bg-yellow-400" }), _jsx("span", { className: "text-xs text-yellow-400 font-medium", children: "75%" })] })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-2 mt-4", children: [_jsxs("div", { className: "flex items-center space-x-2 p-2 bg-slate-800/50 rounded", children: [_jsx(Eye, { className: "h-4 w-4 text-purple-400" }), _jsx("span", { className: "text-xs text-slate-300", children: "PIN" }), _jsx(XCircle, { className: "h-3 w-3 text-red-400" })] }), _jsxs("div", { className: "flex items-center space-x-2 p-2 bg-slate-800/50 rounded", children: [_jsx(MapPin, { className: "h-4 w-4 text-blue-400" }), _jsx("span", { className: "text-xs text-slate-300", children: "GPS \u00B1450m" }), _jsx(AlertTriangle, { className: "h-3 w-3 text-yellow-400" })] }), _jsxs("div", { className: "flex items-center space-x-2 p-2 bg-slate-800/50 rounded", children: [_jsx(Shield, { className: "h-4 w-4 text-green-400" }), _jsx("span", { className: "text-xs text-slate-300", children: "Device OK" }), _jsx(CheckCircle, { className: "h-3 w-3 text-green-400" })] })] })] })] })] }), _jsx(AnimatePresence, { children: showBiometricModal && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", onClick: () => setShowBiometricModal(false), children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, onClick: (e) => e.stopPropagation(), className: "bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 p-6 w-full max-w-md", children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-4", children: "Biometric Setup" }), _jsxs("div", { className: "space-y-4", children: [_jsx("button", { onClick: async () => {
                                            const result = await biometricAuth.registerBiometric('user123', 'Sarah Johnson');
                                            console.log('Biometric registration:', result);
                                        }, className: "w-full p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-left hover:border-purple-400/50 transition-colors", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Fingerprint, { className: "h-6 w-6 text-purple-400" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-white", children: "Setup Fingerprint/Face ID" }), _jsx("p", { className: "text-xs text-slate-400", children: "WebAuthn biometric authentication" })] })] }) }), _jsx("button", { onClick: async () => {
                                            const result = await faceRecognition.recognizeFace(new ImageData(1, 1));
                                            console.log('Face recognition test:', result);
                                        }, className: "w-full p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl text-left hover:border-blue-400/50 transition-colors", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Eye, { className: "h-6 w-6 text-blue-400" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-white", children: "Test Face Recognition" }), _jsx("p", { className: "text-xs text-slate-400", children: "Camera-based face detection" })] })] }) })] })] }) })) })] }));
    function formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
}
//# sourceMappingURL=secure-time-tracking.js.map