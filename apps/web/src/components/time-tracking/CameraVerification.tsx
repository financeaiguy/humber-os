'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  X, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Loader2,
  Aperture,
  Focus,
  Zap
} from 'lucide-react'

interface CameraVerificationProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (imageData: string, metadata: CaptureMetadata) => Promise<void>
  purpose: 'clock-in' | 'clock-out'
  employeeId: string
}

interface CaptureMetadata {
  timestamp: string
  purpose: 'clock-in' | 'clock-out'
  employeeId: string
  location?: { lat: number; lng: number; accuracy: number }
  deviceInfo: {
    userAgent: string
    screenResolution: string
    timezone: string
    language: string
  }
  cameraInfo?: {
    width: number
    height: number
    facingMode?: string
  }
}

export default function CameraVerification({ 
  isOpen, 
  onClose, 
  onCapture, 
  purpose, 
  employeeId 
}: CameraVerificationProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [showApprovalUI, setShowApprovalUI] = useState(false)
  const [showManualSubmit, setShowManualSubmit] = useState(false)

  // Request camera permission and start stream
  const startCamera = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser. Please use Chrome, Firefox, Safari, or Edge.')
      }

      // Check permission status but don't block on it
      let permissionStatus: string | undefined
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
          permissionStatus = permission.state
          setCameraPermission(permission.state as any)

          // Only warn if explicitly denied, don't throw
          if (permission.state === 'denied') {
            console.log('Camera permission previously denied, will try to request anyway')
          }
        }
      } catch (permError) {
        console.log('Permissions API not available, continuing')
      }

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      // Use proper constraints with fallback
      let stream: MediaStream

      try {
        // First try with desired constraints
        const constraints: MediaStreamConstraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: facingMode
          },
          audio: false
        }

        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (err: any) {
        // If first attempt fails, try with minimal constraints
        console.log('First camera attempt failed, trying minimal constraints')

        try {
          const minimalConstraints: MediaStreamConstraints = {
            video: true,
            audio: false
          }

          stream = await navigator.mediaDevices.getUserMedia(minimalConstraints)
        } catch (finalErr: any) {
          // Both attempts failed
          throw finalErr
        }
      }
      streamRef.current = stream
      setCameraPermission('granted')

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true)
          setIsLoading(false)
        }
      }

      // Update permission state
      setCameraPermission('granted')
    } catch (err: any) {
      let errorMessage = 'Failed to access camera'

      // Provide more helpful error messages based on the error
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Camera access was denied. Please allow camera access when prompted by your browser, or click the camera icon in the address bar.'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found. Please ensure your device has a camera connected.'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Camera is being used by another application. Please close other apps using the camera and try again.'
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        errorMessage = 'Camera requirements could not be met. Trying with basic settings...'
      } else if (err.name === 'TypeError') {
        errorMessage = 'Camera access failed. Please ensure you are using HTTPS or localhost.'
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setIsLoading(false)
      setCameraPermission('denied')
    }
  }, [facingMode])

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraReady(false)
  }, [])

  // Validate image on client side
  const validateImageSize = (imageData: string): { valid: boolean; error?: string; sizeKB?: number } => {
    try {
      const base64Data = imageData.split(',')[1]
      if (!base64Data) {
        return { valid: false, error: 'Invalid image data' }
      }

      const sizeBytes = (base64Data.length * 3) / 4
      const sizeKB = sizeBytes / 1024
      const sizeMB = sizeKB / 1024

      const MAX_SIZE_MB = 5
      const MIN_SIZE_KB = 5

      if (sizeMB > MAX_SIZE_MB) {
        return { 
          valid: false, 
          error: `Image too large: ${sizeMB.toFixed(2)}MB (max: ${MAX_SIZE_MB}MB)`,
          sizeKB: Math.round(sizeKB)
        }
      }

      if (sizeKB < MIN_SIZE_KB) {
        return { 
          valid: false, 
          error: `Image too small: ${sizeKB.toFixed(2)}KB (min: ${MIN_SIZE_KB}KB)`,
          sizeKB: Math.round(sizeKB)
        }
      }

      return { valid: true, sizeKB: Math.round(sizeKB) }
    } catch (error) {
      return { valid: false, error: 'Image validation failed' }
    }
  }

  // Capture photo with metadata
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) {
      setError('Camera not ready')
      return
    }

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Could not get canvas context')
      }

      // Set canvas dimensions to match video with reasonable limits
      const maxWidth = 1280
      const maxHeight = 720
      
      let { videoWidth, videoHeight } = video
      
      // Scale down if too large
      if (videoWidth > maxWidth || videoHeight > maxHeight) {
        const aspectRatio = videoWidth / videoHeight
        if (videoWidth > videoHeight) {
          videoWidth = maxWidth
          videoHeight = maxWidth / aspectRatio
        } else {
          videoHeight = maxHeight
          videoWidth = maxHeight * aspectRatio
        }
      }

      canvas.width = videoWidth
      canvas.height = videoHeight

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Add timestamp overlay
      const timestamp = new Date().toLocaleString()
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(10, canvas.height - 50, 300, 40)
      ctx.fillStyle = 'white'
      ctx.font = '14px Arial'
      ctx.fillText(`${purpose.toUpperCase()} - ${timestamp}`, 20, canvas.height - 25)

      // Add employee ID overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(canvas.width - 200, 10, 190, 40)
      ctx.fillStyle = 'white'
      ctx.fillText(`Employee: ${employeeId}`, canvas.width - 190, 35)

      // Convert to base64 with optimized quality for size control
      let quality = 0.8
      let imageData = canvas.toDataURL('image/jpeg', quality)
      
      // Validate size and reduce quality if needed
      let validation = validateImageSize(imageData)
      
      // Reduce quality if image is too large
      while (!validation.valid && validation.error?.includes('too large') && quality > 0.3) {
        quality -= 0.1
        imageData = canvas.toDataURL('image/jpeg', quality)
        validation = validateImageSize(imageData)
      }
      
      if (!validation.valid) {
        throw new Error(validation.error)
      }
      
      // SECURITY: console statement removed: console.log(`Photo captured: ${validation.sizeKB}KB at ${Math.round(quality * 100)}% quality`)
      setCapturedImage(imageData)

      // Prepare metadata
      const location = await getCurrentLocation()
      const metadata: CaptureMetadata = {
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
      }

      return { imageData, metadata }
    } catch (err: any) {
      // SECURITY: console statement removed: console.error('Photo capture error:', err)
      setError('Failed to capture photo')
      return null
    }
  }, [isCameraReady, purpose, employeeId, facingMode])

  // Get current location for metadata
  const getCurrentLocation = (): Promise<{ lat: number; lng: number; accuracy: number } | undefined> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        () => resolve(undefined),
        { timeout: 5000, maximumAge: 60000 }
      )
    })
  }

  // Handle photo capture with countdown
  const handleCaptureWithCountdown = useCallback(async () => {
    if (!isCameraReady) return

    // Start countdown
    for (let i = 3; i > 0; i--) {
      setCountdown(i)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    setCountdown(null)

    // Flash effect
    if (flashEnabled) {
      const flashDiv = document.createElement('div')
      flashDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: white;
        z-index: 9999;
        pointer-events: none;
      `
      document.body.appendChild(flashDiv)
      setTimeout(() => document.body.removeChild(flashDiv), 100)
    }

    // Capture the photo
    const result = await capturePhoto()
    if (result) {
      setCapturedImage(result.imageData)
    }
  }, [isCameraReady, capturePhoto, flashEnabled])

  // Confirm and submit captured photo with AI analysis
  const handleConfirmCapture = async () => {
    if (!capturedImage) return

    setIsProcessing(true)
    try {
      // Get metadata for AI analysis
      const location = await getCurrentLocation()
      const metadata: CaptureMetadata = {
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
      }

      // Analyze photo with Workers AI (Llama 4 Scout)
      setError('Analyzing photo with AI...')

      // Dynamic import to avoid SSR issues
      const { workersAIPhotoOCR } = await import('@/lib/workers-ai-photo-ocr')

      const analysisResult = await workersAIPhotoOCR.analyzeTimeTrackingPhoto(
        capturedImage,
        {
          timestamp: metadata.timestamp,
          employeeId: metadata.employeeId,
          purpose: metadata.purpose,
          location: metadata.location,
          deviceInfo: {
            userAgent: metadata.deviceInfo.userAgent,
            screenResolution: metadata.deviceInfo.screenResolution,
            timezone: metadata.deviceInfo.timezone
          }
        }
      )

      // Show analysis results to user
      setError(null)
      setAnalysisResult(analysisResult)

      // Auto-approve if high confidence, otherwise show for review
      if (analysisResult.recommendation === 'approve' && analysisResult.confidence > 0.85) {
        await onCapture(capturedImage, metadata)
        onClose()
      } else {
        // Show approval interface
        setShowApprovalUI(true)
      }

    } catch (err: any) {
      setError(`Analysis failed: ${err.message}. You can still submit manually.`)
      setShowManualSubmit(true)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle manual approval after AI analysis
  const handleManualApproval = async (approved: boolean) => {
    if (!capturedImage) return

    setIsProcessing(true)
    try {
      if (approved) {
        const location = await getCurrentLocation()
        const metadata: CaptureMetadata = {
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
        }

        await onCapture(capturedImage, metadata)
        onClose()
      } else {
        // User rejected, go back to retake
        handleRetake()
      }
    } catch (err: any) {
      setError('Failed to submit photo. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle manual submit when AI analysis fails
  const handleManualSubmit = async () => {
    if (!capturedImage) return

    setIsProcessing(true)
    try {
      const location = await getCurrentLocation()
      const metadata: CaptureMetadata = {
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
      }

      await onCapture(capturedImage, metadata)
      onClose()
    } catch (err: any) {
      setError('Failed to submit photo. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null)
    setError(null)
    setAnalysisResult(null)
    setShowApprovalUI(false)
    setShowManualSubmit(false)
  }

  // Switch camera (front/back)
  const switchCamera = () => {
    setFacingMode(current => current === 'user' ? 'environment' : 'user')
    setCapturedImage(null)
  }

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
      setCapturedImage(null)
      setError(null)
      setCountdown(null)
    }

    return () => {
      stopCamera()
    }
  }, [isOpen, startCamera, stopCamera])

  // Restart camera when facing mode changes
  useEffect(() => {
    if (isOpen && isCameraReady) {
      startCamera()
    }
  }, [facingMode, isOpen, isCameraReady, startCamera])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="fixed inset-4 bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {purpose === 'clock-in' ? 'Clock In Verification' : 'Clock Out Verification'}
              </h3>
              <p className="text-sm text-slate-400">
                Take a photo to verify your identity
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Camera View */}
          <div className="flex-1 relative overflow-hidden min-h-0">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-2" />
                  <p className="text-slate-400">Starting camera...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <div className="text-center p-6 max-w-md">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-400 mb-2 font-medium">{error}</p>

                  {/* Additional help for permission issues */}
                  {error.includes('denied') || error.includes('blocked') ? (
                    <div className="mt-4 p-4 bg-slate-800 rounded-lg text-left">
                      <p className="text-slate-300 text-sm mb-2">To enable camera access:</p>
                      <ol className="text-slate-400 text-sm space-y-1">
                        <li>1. Look for a camera icon in your browser's address bar</li>
                        <li>2. Click it and select "Allow" or "Always allow"</li>
                        <li>3. Click "Try Again" below</li>
                      </ol>
                      <p className="text-slate-500 text-xs mt-2">If you don't see the icon, you may need to go to browser settings → Site settings → Camera</p>
                    </div>
                  ) : null}

                  <button
                    onClick={startCamera}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Video Feed */}
            {!capturedImage && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* Captured Image Preview */}
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            )}

            {/* Countdown Overlay */}
            {countdown && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <motion.div
                  key={countdown}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="text-6xl font-bold text-white"
                >
                  {countdown}
                </motion.div>
              </div>
            )}

            {/* Camera Controls Overlay */}
            {isCameraReady && !capturedImage && (
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={switchCamera}
                  className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                  title="Switch Camera"
                >
                  <RotateCcw size={20} />
                </button>
                <button
                  onClick={() => setFlashEnabled(!flashEnabled)}
                  className={`p-2 rounded-lg ${
                    flashEnabled ? 'bg-yellow-500/50' : 'bg-black/50'
                  } text-white hover:bg-black/70 transition-colors`}
                  title="Toggle Flash"
                >
                  <Zap size={20} />
                </button>
              </div>
            )}

            {/* Viewfinder Guide */}
            {isCameraReady && !capturedImage && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-white/30 rounded-2xl">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-2xl"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-2xl"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-2xl"></div>
                </div>
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                  <p className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                    Position your face in the frame
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Controls - Fixed at bottom */}
          <div className="p-4 border-t border-slate-700 bg-slate-900 flex-shrink-0">
            {!capturedImage ? (
              <div className="space-y-3">
                {/* Camera info */}
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Camera size={16} />
                    <span className="text-sm">
                      {facingMode === 'user' ? 'Front' : 'Back'} Camera
                    </span>
                  </div>
                  {flashEnabled && (
                    <div className="flex items-center space-x-2 text-yellow-400">
                      <Zap size={16} />
                      <span className="text-sm">Flash On</span>
                    </div>
                  )}
                </div>
                
                {/* Main capture button - full width and prominent */}
                <button
                  onClick={handleCaptureWithCountdown}
                  disabled={!isCameraReady || countdown !== null}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg"
                >
                  <Aperture size={24} />
                  <span>Take Photo of Me at Location</span>
                </button>
                
                {/* Camera status */}
                <div className="text-center">
                  {!isCameraReady && !isLoading && !error && (
                    <p className="text-sm text-slate-400">Preparing camera...</p>
                  )}
                  {isCameraReady && (
                    <p className="text-sm text-green-400">Camera ready</p>
                  )}
                </div>
              </div>
            ) : showApprovalUI && analysisResult ? (
              <div className="space-y-4">
                {/* AI Analysis Results */}
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">AI Analysis Results</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Confidence:</span>
                      <span className={`font-medium ${
                        analysisResult.confidence > 0.7 ? 'text-green-400' :
                        analysisResult.confidence > 0.4 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {Math.round(analysisResult.confidence * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recommendation:</span>
                      <span className={`font-medium capitalize ${
                        analysisResult.recommendation === 'approve' ? 'text-green-400' :
                        analysisResult.recommendation === 'review' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {analysisResult.recommendation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Face Detected:</span>
                      <span className={analysisResult.analysis.faceDetected ? 'text-green-400' : 'text-red-400'}>
                        {analysisResult.analysis.faceDetected ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Workplace:</span>
                      <span className={analysisResult.analysis.workplaceEnvironment ? 'text-green-400' : 'text-yellow-400'}>
                        {analysisResult.analysis.workplaceEnvironment ? 'Detected' : 'Uncertain'}
                      </span>
                    </div>
                    {analysisResult.flags.length > 0 && (
                      <div className="mt-3">
                        <span className="text-slate-400 text-xs">Flags:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysisResult.flags.map((flag: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-red-900/50 text-red-300 text-xs rounded">
                              {flag.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Approval Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleRetake}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <RotateCcw size={20} />
                    <span>Retake</span>
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleManualApproval(false)}
                      disabled={isProcessing}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      <X size={20} />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleManualApproval(true)}
                      disabled={isProcessing}
                      className="px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Check size={20} />
                          <span>Approve & Submit</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-center text-sm text-slate-400">
                  AI has analyzed your photo. Please review and decide.
                </p>
              </div>
            ) : showManualSubmit ? (
              <div className="space-y-3">
                <div className="bg-yellow-900/50 rounded-lg p-3">
                  <p className="text-yellow-300 text-sm">
                    AI analysis is unavailable. You can still submit manually for review.
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleRetake}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <RotateCcw size={20} />
                    <span>Retake</span>
                  </button>
                  <button
                    onClick={handleManualSubmit}
                    disabled={isProcessing}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Check size={20} />
                        <span>Submit for Review</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleRetake}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <RotateCcw size={20} />
                    <span>Retake</span>
                  </button>
                  <button
                    onClick={handleConfirmCapture}
                    disabled={isProcessing}
                    className="px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Check size={20} />
                        <span>Analyze & Submit</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-center text-sm text-slate-400">
                  Photo will be analyzed by AI before submission
                </p>
              </div>
            )}
          </div>

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}