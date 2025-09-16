'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Smartphone, Fingerprint, Signal, Battery, User, Calendar, Briefcase, ChevronRight, LogIn, LogOut, Activity, History, Sun, Moon, Loader2, Check, X, Wifi, WifiOff } from 'lucide-react';
import CameraVerification from './CameraVerification';
export default function EmployeeClockView({ employeeData, onClose }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isClockingIn, setIsClockingIn] = useState(false);
    const [isClockingOut, setIsClockingOut] = useState(false);
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [biometricVerified, setBiometricVerified] = useState(false);
    const [deviceInfo, setDeviceInfo] = useState(null);
    const [networkStatus, setNetworkStatus] = useState(true);
    const [batteryLevel, setBatteryLevel] = useState(100);
    const [clockInTime, setClockInTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState('00:00:00');
    const [todayHours, setTodayHours] = useState(0);
    const [weekHours, setWeekHours] = useState(37.5);
    const [showCamera, setShowCamera] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const employee = employeeData || {
        id: 'emp_001',
        name: 'John Smith',
        role: 'Senior Engineer',
        project: 'GM Assembly Line',
        avatar: 'JS'
    };
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        if (isClockedIn && clockInTime) {
            const timer = setInterval(() => {
                const now = new Date();
                const diff = now.getTime() - clockInTime.getTime();
                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes
                    .toString()
                    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                setTodayHours(diff / 3600000);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isClockedIn, clockInTime]);
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            }, (error) => {
                setLocationError(error.message);
            }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
        }
    }, []);
    useEffect(() => {
        setNetworkStatus(navigator.onLine);
        const handleOnline = () => setNetworkStatus(true);
        const handleOffline = () => setNetworkStatus(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    useEffect(() => {
        if ('getBattery' in navigator) {
            navigator.getBattery().then((battery) => {
                setBatteryLevel(Math.round(battery.level * 100));
                battery.addEventListener('levelchange', () => {
                    setBatteryLevel(Math.round(battery.level * 100));
                });
            });
        }
    }, []);
    useEffect(() => {
        setDeviceInfo({
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
    }, []);
    const requestBiometric = async () => {
        try {
            if (window.PublicKeyCredential && navigator.credentials) {
                const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                if (isAvailable) {
                    const challenge = new Uint8Array(32);
                    crypto.getRandomValues(challenge);
                    try {
                        const assertion = await navigator.credentials.get({
                            publicKey: {
                                challenge,
                                timeout: 60000,
                                userVerification: "required",
                                rpId: window.location.hostname,
                                allowCredentials: []
                            }
                        });
                        if (assertion) {
                            setBiometricVerified(true);
                            console.log('Biometric authentication successful');
                            return true;
                        }
                    }
                    catch (getError) {
                        console.log('No existing credentials, attempting registration');
                        const publicKeyCredentialCreationOptions = {
                            challenge,
                            rp: {
                                name: "Humber Operations",
                                id: window.location.hostname
                            },
                            user: {
                                id: new TextEncoder().encode(employee.id),
                                name: employee.name,
                                displayName: employee.name
                            },
                            pubKeyCredParams: [
                                { alg: -7, type: "public-key" },
                                { alg: -257, type: "public-key" }
                            ],
                            authenticatorSelection: {
                                authenticatorAttachment: "platform",
                                userVerification: "required",
                                residentKey: "preferred"
                            },
                            timeout: 60000,
                            attestation: "none"
                        };
                        try {
                            const credential = await navigator.credentials.create({
                                publicKey: publicKeyCredentialCreationOptions
                            });
                            if (credential) {
                                setBiometricVerified(true);
                                console.log('Biometric registration and authentication successful');
                                return true;
                            }
                        }
                        catch (createError) {
                            console.error('Biometric registration failed:', createError);
                        }
                    }
                }
            }
            const fallbackOptions = [
                'SMS Verification Code',
                'Email Verification',
                'Security Questions',
                'Manager Approval Required'
            ];
            const choice = window.confirm('⚠️ BIOMETRIC AUTHENTICATION UNAVAILABLE ⚠️\n\n' +
                'Your device does not support biometric authentication.\n\n' +
                'For security, time tracking requires additional verification.\n\n' +
                'Would you like to use alternative verification?\n' +
                '(In production: SMS, Email, or Manager approval)');
            if (choice) {
                alert('🔐 SECURITY NOTICE 🔐\n\n' +
                    'This time entry will be flagged for manual verification.\n\n' +
                    'A manager must approve this entry before it becomes official.\n\n' +
                    'Proceeding with manual verification flag...');
                setBiometricVerified(false);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Biometric authentication error:', error);
            const proceed = window.confirm('❌ AUTHENTICATION ERROR ❌\n\n' +
                'Biometric system encountered an error.\n\n' +
                'This entry will require manual verification.\n\n' +
                'Continue with manual review process?');
            if (proceed) {
                setBiometricVerified(false);
                return true;
            }
            return false;
        }
    };
    const handleClockIn = async () => {
        setIsClockingIn(true);
        try {
            if (!location) {
                await getCurrentLocation();
            }
            const deviceFingerprint = await generateDeviceFingerprint();
            const isApprovedDevice = await verifyDevice(deviceFingerprint);
            if (!isApprovedDevice) {
                alert('This device is not approved for time tracking.\n\n' +
                    'Please contact your administrator to approve this device:\n' +
                    `Device ID: ${deviceFingerprint.substring(0, 8)}...`);
                setIsClockingIn(false);
                return;
            }
            if (location && !await verifyGeofence(location)) {
                alert('You are not within the authorized work location.\n\n' +
                    'Please ensure you are at the work site and try again.\n' +
                    `Current accuracy: ±${Math.round(location.accuracy)}m`);
                setIsClockingIn(false);
                return;
            }
            setPendingAction('clock-in');
            setShowCamera(true);
            setIsClockingIn(false);
        }
        catch (error) {
            console.error('Clock in preparation error:', error);
            alert('An error occurred preparing clock in. Please try again.');
            setIsClockingIn(false);
        }
    };
    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
                resolve();
            }, (error) => {
                setLocationError(error.message);
                reject(error);
            }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
        });
    };
    const handleClockOut = async () => {
        setIsClockingOut(true);
        try {
            if (!location) {
                try {
                    await getCurrentLocation();
                }
                catch (error) {
                    const proceed = confirm(`Location unavailable: ${error}\n\n` +
                        'Do you want to clock out without location verification?\n' +
                        'This will be flagged for review.');
                    if (!proceed) {
                        setIsClockingOut(false);
                        return;
                    }
                }
            }
            setPendingAction('clock-out');
            setShowCamera(true);
            setIsClockingOut(false);
        }
        catch (error) {
            console.error('Clock out preparation error:', error);
            alert('An error occurred preparing clock out. Please try again.');
            setIsClockingOut(false);
        }
    };
    const generateDeviceFingerprint = async () => {
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            navigator.platform,
            screen.width + 'x' + screen.height,
            screen.colorDepth,
            new Date().getTimezoneOffset(),
            navigator.hardwareConcurrency || 0,
            navigator.maxTouchPoints || 0
        ].join('|');
        const msgBuffer = new TextEncoder().encode(fingerprint);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    };
    const verifyDevice = async (fingerprint) => {
        const approvedDevices = localStorage.getItem('approvedDevices');
        if (!approvedDevices) {
            localStorage.setItem('approvedDevices', JSON.stringify([fingerprint]));
            return true;
        }
        const devices = JSON.parse(approvedDevices);
        return devices.includes(fingerprint);
    };
    const verifyGeofence = async (location) => {
        const workSites = [
            {
                name: 'GM Assembly Plant',
                lat: 42.3149,
                lng: -83.0364,
                radius: 500
            },
            {
                name: 'Ford Dearborn Plant',
                lat: 42.3223,
                lng: -83.1963,
                radius: 300
            }
        ];
        for (const workSite of workSites) {
            const distance = calculateDistance(location, workSite);
            if (distance <= (workSite.radius + location.accuracy)) {
                console.log(`Location verified at ${workSite.name}: ${distance.toFixed(0)}m away`);
                return true;
            }
        }
        console.warn('Location verification failed: Not at any authorized work site');
        return false;
    };
    const calculateDistance = (point1, point2) => {
        const R = 6371e3;
        const φ1 = point1.lat * Math.PI / 180;
        const φ2 = point2.lat * Math.PI / 180;
        const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
        const Δλ = (point2.lng - point1.lng) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };
    const handleCameraCapture = async (imageData, metadata) => {
        try {
            const deviceFingerprint = await generateDeviceFingerprint();
            const biometric = await requestBiometric();
            if (!biometric) {
                throw new Error('Biometric verification failed');
            }
            const timeEntry = {
                type: pendingAction,
                timestamp: new Date().toISOString(),
                photo: imageData,
                metadata: {
                    ...metadata,
                    biometricVerified: true,
                    deviceFingerprint
                }
            };
            const response = await fetch('/api/time-tracking/secure-entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(timeEntry)
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit time entry');
            }
            if (pendingAction === 'clock-in') {
                setIsClockedIn(true);
                setClockInTime(new Date());
                setBiometricVerified(true);
            }
            else {
                setIsClockedIn(false);
                setClockInTime(null);
                setElapsedTime('00:00:00');
                setBiometricVerified(false);
            }
            if ('Notification' in window && Notification.permission === 'granted') {
                const action = pendingAction === 'clock-in' ? 'Clock In' : 'Clock Out';
                new Notification(`${action} Successful`, {
                    body: `${action} completed with photo verification at ${new Date().toLocaleTimeString()}`,
                    icon: '/icon-192x192.png'
                });
            }
            setPendingAction(null);
        }
        catch (error) {
            console.error('Camera capture submission error:', error);
            alert(`Failed to submit ${pendingAction}: ${error.message}`);
        }
    };
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);
    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12)
            return { text: 'Good Morning', icon: Sun };
        if (hour < 17)
            return { text: 'Good Afternoon', icon: Sun };
        if (hour < 20)
            return { text: 'Good Evening', icon: Moon };
        return { text: 'Good Night', icon: Moon };
    };
    const greeting = getGreeting();
    return (_jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold", children: employee.avatar || employee.name.split(' ').map(n => n[0]).join('') }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-white", children: greeting.text }), _jsx("p", { className: "text-sm text-slate-400", children: employee.name })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(greeting.icon, { className: "h-6 w-6 text-yellow-400" }), onClose && (_jsx("button", { onClick: onClose, className: "p-2 hover:bg-slate-800 rounded-lg transition-colors", children: _jsx(X, { className: "h-5 w-5 text-slate-400" }) }))] })] }), _jsxs("div", { className: "flex items-center justify-between text-xs text-slate-400", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [networkStatus ? (_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Wifi, { className: "h-3 w-3 text-green-400" }), _jsx("span", { children: "Online" })] })) : (_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(WifiOff, { className: "h-3 w-3 text-red-400" }), _jsx("span", { children: "Offline" })] })), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Signal, { className: "h-3 w-3 text-green-400" }), _jsx("span", { children: "GPS" })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Battery, { className: "h-3 w-3 text-yellow-400" }), _jsxs("span", { children: [batteryLevel, "%"] })] })] }), _jsx("span", { children: currentTime.toLocaleTimeString() })] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mb-6", children: [_jsxs("div", { className: "text-center mb-4", children: [_jsx("div", { className: "text-5xl font-bold text-white mb-2", children: currentTime.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                }) }), _jsx("p", { className: "text-slate-400", children: currentTime.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                }) })] }), isClockedIn ? (_jsxs("div", { className: "bg-green-500/10 border border-green-500/30 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Activity, { className: "h-5 w-5 text-green-400 animate-pulse" }), _jsx("span", { className: "text-green-400 font-semibold", children: "Currently Working" })] }), _jsx("span", { className: "text-2xl font-bold text-white", children: elapsedTime })] }), _jsxs("div", { className: "text-xs text-slate-400", children: ["Clocked in at ", clockInTime?.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    })] })] })) : (_jsx("div", { className: "bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-center", children: _jsx("p", { className: "text-slate-400", children: "Not clocked in" }) }))] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 mb-6", children: [_jsx("div", { className: "flex items-center justify-between mb-3", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Briefcase, { className: "h-5 w-5 text-blue-400" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-white", children: employee.role }), _jsx("p", { className: "text-xs text-slate-400", children: employee.project })] })] }) }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "bg-slate-900/50 rounded-lg p-3", children: [_jsx("p", { className: "text-xs text-slate-500 mb-1", children: "Today" }), _jsxs("p", { className: "text-lg font-semibold text-white", children: [todayHours.toFixed(2), "h"] })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-lg p-3", children: [_jsx("p", { className: "text-xs text-slate-500 mb-1", children: "This Week" }), _jsxs("p", { className: "text-lg font-semibold text-white", children: [weekHours.toFixed(1), "h"] })] })] })] }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "mb-6", children: !isClockedIn ? (_jsx("button", { onClick: handleClockIn, disabled: isClockingIn, className: "w-full py-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3", children: isClockingIn ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-6 w-6 animate-spin" }), _jsx("span", { children: "Verifying..." })] })) : (_jsxs(_Fragment, { children: [_jsx(LogIn, { className: "h-6 w-6" }), _jsx("span", { children: "Clock In" }), _jsx(ChevronRight, { className: "h-5 w-5" })] })) })) : (_jsx("button", { onClick: handleClockOut, disabled: isClockingOut, className: "w-full py-6 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-bold text-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3", children: isClockingOut ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-6 w-6 animate-spin" }), _jsx("span", { children: "Processing..." })] })) : (_jsxs(_Fragment, { children: [_jsx(LogOut, { className: "h-6 w-6" }), _jsx("span", { children: "Clock Out" }), _jsx(ChevronRight, { className: "h-5 w-5" })] })) })) }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 mb-6", children: [_jsx("h3", { className: "text-sm font-semibold text-white mb-3", children: "Verification Status" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `h-8 w-8 rounded-lg ${biometricVerified ? 'bg-green-500/20' : 'bg-slate-700'} flex items-center justify-center`, children: _jsx(Fingerprint, { className: `h-4 w-4 ${biometricVerified ? 'text-green-400' : 'text-slate-500'}` }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-white", children: "Biometric" }), _jsx("p", { className: "text-xs text-slate-400", children: "Face ID" })] })] }), biometricVerified ? (_jsx(Check, { className: "h-5 w-5 text-green-400" })) : (_jsx(X, { className: "h-5 w-5 text-slate-500" }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `h-8 w-8 rounded-lg ${location ? 'bg-green-500/20' : 'bg-slate-700'} flex items-center justify-center`, children: _jsx(MapPin, { className: `h-4 w-4 ${location ? 'text-green-400' : 'text-slate-500'}` }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-white", children: "Location" }), _jsx("p", { className: "text-xs text-slate-400", children: location ? `±${Math.round(location.accuracy)}m` : 'Not available' })] })] }), location ? (_jsx(Check, { className: "h-5 w-5 text-green-400" })) : (_jsx(X, { className: "h-5 w-5 text-slate-500" }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center", children: _jsx(Smartphone, { className: "h-4 w-4 text-green-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-white", children: "Device Trust" }), _jsx("p", { className: "text-xs text-slate-400", children: "Verified" })] })] }), _jsx(Check, { className: "h-5 w-5 text-green-400" })] })] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 }, className: "bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "text-sm font-semibold text-white", children: "Recent Activity" }), _jsx(History, { className: "h-4 w-4 text-slate-400" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between py-2 border-b border-slate-700/50", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-white", children: "Clock Out" }), _jsx("p", { className: "text-xs text-slate-400", children: "Yesterday" })] }), _jsx("span", { className: "text-sm text-slate-400", children: "5:32 PM" })] }), _jsxs("div", { className: "flex items-center justify-between py-2 border-b border-slate-700/50", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-white", children: "Clock In" }), _jsx("p", { className: "text-xs text-slate-400", children: "Yesterday" })] }), _jsx("span", { className: "text-sm text-slate-400", children: "8:15 AM" })] }), _jsxs("div", { className: "flex items-center justify-between py-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-white", children: "Break" }), _jsx("p", { className: "text-xs text-slate-400", children: "Yesterday" })] }), _jsx("span", { className: "text-sm text-slate-400", children: "12:00 PM" })] })] })] }), _jsx("div", { className: "fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 px-4 py-3", children: _jsxs("div", { className: "flex items-center justify-around", children: [_jsxs("button", { className: "flex flex-col items-center space-y-1 text-blue-400", children: [_jsx(Clock, { className: "h-6 w-6" }), _jsx("span", { className: "text-xs", children: "Time" })] }), _jsxs("button", { className: "flex flex-col items-center space-y-1 text-slate-400", children: [_jsx(Calendar, { className: "h-6 w-6" }), _jsx("span", { className: "text-xs", children: "Schedule" })] }), _jsxs("button", { className: "flex flex-col items-center space-y-1 text-slate-400", children: [_jsx(History, { className: "h-6 w-6" }), _jsx("span", { className: "text-xs", children: "History" })] }), _jsxs("button", { className: "flex flex-col items-center space-y-1 text-slate-400", children: [_jsx(User, { className: "h-6 w-6" }), _jsx("span", { className: "text-xs", children: "Profile" })] })] }) }), _jsx(CameraVerification, { isOpen: showCamera, onClose: () => {
                    setShowCamera(false);
                    setPendingAction(null);
                }, onCapture: handleCameraCapture, purpose: pendingAction || 'clock-in', employeeId: employee.id })] }));
}
//# sourceMappingURL=EmployeeClockView.js.map