'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, RotateCcw, Check, AlertCircle, Loader2, Aperture, Zap } from 'lucide-react';
export default function CameraVerification({ isOpen, onClose, onCapture, purpose, employeeId }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [cameraPermission, setCameraPermission] = useState('prompt');
    const [facingMode, setFacingMode] = useState('user');
    const [flashEnabled, setFlashEnabled] = useState(false);
    const startCamera = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const permission = await navigator.permissions.query({ name: 'camera' });
            setCameraPermission(permission.state);
            if (permission.state === 'denied') {
                throw new Error('Camera access denied. Please enable camera permissions in your browser settings.');
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            const constraints = {
                video: {
                    width: { ideal: 1280, min: 640 },
                    height: { ideal: 720, min: 480 },
                    facingMode: facingMode,
                    frameRate: { ideal: 30 },
                },
                audio: false
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    setIsCameraReady(true);
                    setIsLoading(false);
                };
            }
            setCameraPermission('granted');
        }
        catch (err) {
            console.error('Camera access error:', err);
            setError(err.message || 'Failed to access camera');
            setIsLoading(false);
            setCameraPermission('denied');
        }
    }, [facingMode]);
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraReady(false);
    }, []);
    const validateImageSize = (imageData) => {
        try {
            const base64Data = imageData.split(',')[1];
            if (!base64Data) {
                return { valid: false, error: 'Invalid image data' };
            }
            const sizeBytes = (base64Data.length * 3) / 4;
            const sizeKB = sizeBytes / 1024;
            const sizeMB = sizeKB / 1024;
            const MAX_SIZE_MB = 5;
            const MIN_SIZE_KB = 5;
            if (sizeMB > MAX_SIZE_MB) {
                return {
                    valid: false,
                    error: `Image too large: ${sizeMB.toFixed(2)}MB (max: ${MAX_SIZE_MB}MB)`,
                    sizeKB: Math.round(sizeKB)
                };
            }
            if (sizeKB < MIN_SIZE_KB) {
                return {
                    valid: false,
                    error: `Image too small: ${sizeKB.toFixed(2)}KB (min: ${MIN_SIZE_KB}KB)`,
                    sizeKB: Math.round(sizeKB)
                };
            }
            return { valid: true, sizeKB: Math.round(sizeKB) };
        }
        catch (error) {
            return { valid: false, error: 'Image validation failed' };
        }
    };
    const capturePhoto = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || !isCameraReady) {
            setError('Camera not ready');
            return;
        }
        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Could not get canvas context');
            }
            const maxWidth = 1280;
            const maxHeight = 720;
            let { videoWidth, videoHeight } = video;
            if (videoWidth > maxWidth || videoHeight > maxHeight) {
                const aspectRatio = videoWidth / videoHeight;
                if (videoWidth > videoHeight) {
                    videoWidth = maxWidth;
                    videoHeight = maxWidth / aspectRatio;
                }
                else {
                    videoHeight = maxHeight;
                    videoWidth = maxHeight * aspectRatio;
                }
            }
            canvas.width = videoWidth;
            canvas.height = videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const timestamp = new Date().toLocaleString();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(10, canvas.height - 50, 300, 40);
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.fillText(`${purpose.toUpperCase()} - ${timestamp}`, 20, canvas.height - 25);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(canvas.width - 200, 10, 190, 40);
            ctx.fillStyle = 'white';
            ctx.fillText(`Employee: ${employeeId}`, canvas.width - 190, 35);
            let quality = 0.8;
            let imageData = canvas.toDataURL('image/jpeg', quality);
            let validation = validateImageSize(imageData);
            while (!validation.valid && validation.error?.includes('too large') && quality > 0.3) {
                quality -= 0.1;
                imageData = canvas.toDataURL('image/jpeg', quality);
                validation = validateImageSize(imageData);
            }
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            console.log(`Photo captured: ${validation.sizeKB}KB at ${Math.round(quality * 100)}% quality`);
            setCapturedImage(imageData);
            const location = await getCurrentLocation();
            const metadata = {
                timestamp: new Date().toISOString(),
                purpose,
                employeeId,
                location,
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    screenResolution: `${window.screen.width}x${window.screen.height}`,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    language: navigator.language
                },
                cameraInfo: {
                    width: canvas.width,
                    height: canvas.height,
                    facingMode
                }
            };
            return { imageData, metadata };
        }
        catch (err) {
            console.error('Photo capture error:', err);
            setError('Failed to capture photo');
            return null;
        }
    }, [isCameraReady, purpose, employeeId, facingMode]);
    const getCurrentLocation = () => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(undefined);
                return;
            }
            navigator.geolocation.getCurrentPosition((position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            }, () => resolve(undefined), { timeout: 5000, maximumAge: 60000 });
        });
    };
    const handleCaptureWithCountdown = useCallback(async () => {
        if (!isCameraReady)
            return;
        for (let i = 3; i > 0; i--) {
            setCountdown(i);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        setCountdown(null);
        if (flashEnabled) {
            const flashDiv = document.createElement('div');
            flashDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: white;
        z-index: 9999;
        pointer-events: none;
      `;
            document.body.appendChild(flashDiv);
            setTimeout(() => document.body.removeChild(flashDiv), 100);
        }
        const result = await capturePhoto();
        if (result) {
            setCapturedImage(result.imageData);
        }
    }, [isCameraReady, capturePhoto, flashEnabled]);
    const handleConfirmCapture = async () => {
        if (!capturedImage)
            return;
        setIsProcessing(true);
        try {
            const location = await getCurrentLocation();
            const metadata = {
                timestamp: new Date().toISOString(),
                purpose,
                employeeId,
                location,
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    screenResolution: `${window.screen.width}x${window.screen.height}`,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    language: navigator.language
                },
                cameraInfo: canvasRef.current ? {
                    width: canvasRef.current.width,
                    height: canvasRef.current.height,
                    facingMode
                } : undefined
            };
            await onCapture(capturedImage, metadata);
            onClose();
        }
        catch (err) {
            console.error('Failed to submit photo:', err);
            setError('Failed to submit photo. Please try again.');
        }
        finally {
            setIsProcessing(false);
        }
    };
    const handleRetake = () => {
        setCapturedImage(null);
        setError(null);
    };
    const switchCamera = () => {
        setFacingMode(current => current === 'user' ? 'environment' : 'user');
        setCapturedImage(null);
    };
    useEffect(() => {
        if (isOpen) {
            startCamera();
        }
        else {
            stopCamera();
            setCapturedImage(null);
            setError(null);
            setCountdown(null);
        }
        return () => {
            stopCamera();
        };
    }, [isOpen, startCamera, stopCamera]);
    useEffect(() => {
        if (isOpen && isCameraReady) {
            startCamera();
        }
    }, [facingMode, isOpen, isCameraReady, startCamera]);
    if (!isOpen)
        return null;
    return (_jsx(AnimatePresence, { children: _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm", onClick: onClose, children: _jsxs(motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, className: "fixed inset-4 bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-slate-700", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: purpose === 'clock-in' ? 'Clock In Verification' : 'Clock Out Verification' }), _jsx("p", { className: "text-sm text-slate-400", children: "Take a photo to verify your identity" })] }), _jsx("button", { onClick: onClose, className: "p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors", children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "flex-1 relative overflow-hidden", children: [isLoading && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-slate-900", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "h-8 w-8 animate-spin text-blue-400 mx-auto mb-2" }), _jsx("p", { className: "text-slate-400", children: "Starting camera..." })] }) })), error && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-slate-900", children: _jsxs("div", { className: "text-center p-6", children: [_jsx(AlertCircle, { className: "h-12 w-12 text-red-400 mx-auto mb-4" }), _jsx("p", { className: "text-red-400 mb-4", children: error }), _jsx("button", { onClick: startCamera, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: "Try Again" })] }) })), !capturedImage && (_jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, className: "w-full h-full object-cover" })), capturedImage && (_jsx("img", { src: capturedImage, alt: "Captured", className: "w-full h-full object-cover" })), countdown && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/50", children: _jsx(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, exit: { scale: 0 }, className: "text-6xl font-bold text-white", children: countdown }, countdown) })), isCameraReady && !capturedImage && (_jsxs("div", { className: "absolute top-4 right-4 flex space-x-2", children: [_jsx("button", { onClick: switchCamera, className: "p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors", title: "Switch Camera", children: _jsx(RotateCcw, { size: 20 }) }), _jsx("button", { onClick: () => setFlashEnabled(!flashEnabled), className: `p-2 rounded-lg ${flashEnabled ? 'bg-yellow-500/50' : 'bg-black/50'} text-white hover:bg-black/70 transition-colors`, title: "Toggle Flash", children: _jsx(Zap, { size: 20 }) })] })), isCameraReady && !capturedImage && (_jsxs("div", { className: "absolute inset-0 pointer-events-none", children: [_jsxs("div", { className: "absolute inset-4 border-2 border-white/30 rounded-2xl", children: [_jsx("div", { className: "absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-2xl" }), _jsx("div", { className: "absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-2xl" }), _jsx("div", { className: "absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-2xl" }), _jsx("div", { className: "absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-2xl" })] }), _jsx("div", { className: "absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center", children: _jsx("p", { className: "text-white text-sm bg-black/50 px-3 py-1 rounded-full", children: "Position your face in the frame" }) })] }))] }), _jsx("div", { className: "p-4 border-t border-slate-700", children: !capturedImage ? (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2 text-slate-400", children: [_jsx(Camera, { size: 16 }), _jsxs("span", { className: "text-sm", children: [facingMode === 'user' ? 'Front' : 'Back', " Camera"] })] }), flashEnabled && (_jsxs("div", { className: "flex items-center space-x-2 text-yellow-400", children: [_jsx(Zap, { size: 16 }), _jsx("span", { className: "text-sm", children: "Flash On" })] }))] }), _jsxs("button", { onClick: handleCaptureWithCountdown, disabled: !isCameraReady || countdown !== null, className: "px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2", children: [_jsx(Aperture, { size: 20 }), _jsx("span", { children: "Capture Photo" })] })] })) : (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { onClick: handleRetake, disabled: isProcessing, className: "px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50", children: "Retake" }), _jsx("button", { onClick: handleConfirmCapture, disabled: isProcessing, className: "px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2", children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-5 w-5 animate-spin" }), _jsx("span", { children: "Processing..." })] })) : (_jsxs(_Fragment, { children: [_jsx(Check, { size: 20 }), _jsx("span", { children: "Confirm & Submit" })] })) })] })) }), _jsx("canvas", { ref: canvasRef, className: "hidden" })] }) }) }));
}
//# sourceMappingURL=CameraVerification.js.map