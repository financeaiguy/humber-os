'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  MapPin,
  Shield,
  Fingerprint,
  Eye,
  Smartphone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Square,
  Coffee,
  Settings
} from 'lucide-react'
import { biometricAuth, livenessDetection, faceRecognition } from '@/lib/biometric-auth'
import { geolocationService, deviceInfoService } from '@/lib/geolocation-service'

interface TimeTrackingState {
  isTracking: boolean
  startTime: Date | null
  currentTime: Date
  totalHours: number
  breakTime: number
  trustScore: number
  verificationLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM'
}

interface VerificationStatus {
  biometric: { status: 'pending' | 'success' | 'failed'; confidence: number }
  geolocation: { status: 'pending' | 'success' | 'failed'; accuracy: number; distance: number }
  device: { status: 'pending' | 'success' | 'failed'; trustLevel: string }
}

export function SecureTimeTracking() {
  const [trackingState, setTrackingState] = useState<TimeTrackingState>({
    isTracking: false,
    startTime: null,
    currentTime: new Date(),
    totalHours: 0,
    breakTime: 0,
    trustScore: 0,
    verificationLevel: 'LOW'
  })

  const [verification, setVerification] = useState<VerificationStatus>({
    biometric: { status: 'pending', confidence: 0 },
    geolocation: { status: 'pending', accuracy: 0, distance: 0 },
    device: { status: 'pending', trustLevel: 'UNVERIFIED' }
  })

  const [showBiometricModal, setShowBiometricModal] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [selectedProject, setSelectedProject] = useState('')
  const intervalRef = useRef<NodeJS.Timeout>()

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTrackingState(prev => ({
        ...prev,
        currentTime: new Date(),
        totalHours: prev.startTime ? (Date.now() - prev.startTime.getTime()) / (1000 * 60 * 60) : 0
      }))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Perform comprehensive security verification
  const performSecurityVerification = async (): Promise<boolean> => {
    setIsVerifying(true)
    
    try {
      // Step 1: Biometric Authentication
      setVerification(prev => ({ ...prev, biometric: { ...prev.biometric, status: 'pending' } }))
      
      const biometricResult = await biometricAuth.authenticateBiometric('user_credential_id')
      setVerification(prev => ({
        ...prev,
        biometric: {
          status: biometricResult.success ? 'success' : 'failed',
          confidence: biometricResult.confidence
        }
      }))

      // Step 2: Geolocation Verification
      setVerification(prev => ({ ...prev, geolocation: { ...prev.geolocation, status: 'pending' } }))
      
      const locationResult = await geolocationService.getCurrentLocation(true)
      setVerification(prev => ({
        ...prev,
        geolocation: {
          status: locationResult.success && locationResult.verification?.isWithinWorkSite ? 'success' : 'failed',
          accuracy: locationResult.location?.accuracy || 0,
          distance: locationResult.verification?.distanceFromWorkSite || 0
        }
      }))

      // Step 3: Device Trust Verification
      setVerification(prev => ({ ...prev, device: { ...prev.device, status: 'pending' } }))
      
      const deviceInfo = await deviceInfoService.getDeviceInfo()
      const deviceTrusted = deviceInfo.security.isSecureContext && deviceInfo.capabilities.biometric
      setVerification(prev => ({
        ...prev,
        device: {
          status: deviceTrusted ? 'success' : 'failed',
          trustLevel: deviceTrusted ? 'TRUSTED' : 'UNVERIFIED'
        }
      }))

      // Calculate overall trust score
      const biometricScore = biometricResult.success ? biometricResult.confidence : 0
      const locationScore = locationResult.verification?.isWithinWorkSite ? 90 : 30
      const deviceScore = deviceTrusted ? 85 : 40
      
      const overallTrustScore = Math.round((biometricScore + locationScore + deviceScore) / 3)
      
      // Determine verification level
      let verificationLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM' = 'LOW'
      if (overallTrustScore >= 90) verificationLevel = 'MAXIMUM'
      else if (overallTrustScore >= 75) verificationLevel = 'HIGH'
      else if (overallTrustScore >= 60) verificationLevel = 'MEDIUM'

      setTrackingState(prev => ({
        ...prev,
        trustScore: overallTrustScore,
        verificationLevel
      }))

      return overallTrustScore >= 60 // Minimum 60% trust score required

    } catch (error) {
      // SECURITY: Removed console.error('Security verification failed:', error)
      return false
    } finally {
      setIsVerifying(false)
    }
  }

  // Handle clock in
  const handleClockIn = async () => {
    if (!selectedProject) {
      alert('Please select a project before clocking in')
      return
    }

    const verified = await performSecurityVerification()
    
    if (!verified) {
      alert('Security verification failed. Please ensure you are at an approved location with proper biometric authentication.')
      return
    }

    setTrackingState(prev => ({
      ...prev,
      isTracking: true,
      startTime: new Date()
    }))

    // Start periodic verification every 30 minutes
    intervalRef.current = setInterval(async () => {
      await performSecurityVerification()
    }, 30 * 60 * 1000)
  }

  // Handle clock out
  const handleClockOut = async () => {
    const verified = await performSecurityVerification()
    
    if (!verified) {
      alert('Security verification failed for clock out. Please verify your identity and location.')
      return
    }

    setTrackingState(prev => ({
      ...prev,
      isTracking: false,
      startTime: null
    }))

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Submit timesheet data to backend
    // await submitTimeEntry(...)
  }

  const getStatusColor = (status: 'pending' | 'success' | 'failed') => {
    switch (status) {
      case 'success': return 'text-green-400'
      case 'failed': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const getStatusIcon = (status: 'pending' | 'success' | 'failed') => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5" />
      case 'failed': return <XCircle className="h-5 w-5" />
      default: return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-blue-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Advanced Time Tracking</h1>
          <p className="text-slate-400">Multi-layer trust verification with real-time monitoring and geofencing</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{formatTime(trackingState.currentTime)}</p>
            <p className="text-sm text-slate-400">Monday, September 15, 2025</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm text-slate-400">GPS Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-blue-400"></div>
            <span className="text-sm text-slate-400">85% Trust Score</span>
          </div>
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
            Live Tracking ON
          </span>
        </div>
      </div>

      {/* Clock In/Out Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clock Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Time Controls</h2>
          
          {/* Project Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">Select Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              disabled={trackingState.isTracking}
            >
              <option value="">Choose Project</option>
              <option value="gm-assembly">GM Assembly Line Automation</option>
              <option value="ford-paint">Ford Paint Shop Upgrade</option>
              <option value="stellantis-qc">Stellantis Quality Control</option>
              <option value="hirotec-welding">HIROTEC Welding System</option>
            </select>
          </div>

          {/* Clock In/Out Buttons */}
          <div className="grid grid-cols-2 gap-4">
            {!trackingState.isTracking ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClockIn}
                disabled={!selectedProject || isVerifying}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-8 w-8 mb-2" />
                <span className="text-lg font-semibold">Clock In</span>
                <span className="text-sm opacity-80">Secure verification</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClockOut}
                disabled={isVerifying}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50"
              >
                <Square className="h-8 w-8 mb-2" />
                <span className="text-lg font-semibold">Clock Out</span>
                <span className="text-sm opacity-80">End session</span>
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
            >
              <Coffee className="h-8 w-8 mb-2" />
              <span className="text-lg font-semibold">Break</span>
              <span className="text-sm opacity-80">Start break</span>
            </motion.button>
          </div>

          {/* Current Session Info */}
          {trackingState.isTracking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-600"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Session Started</span>
                <span className="text-sm font-medium text-white">
                  {trackingState.startTime ? formatTime(trackingState.startTime) : '--:--'}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Hours Worked</span>
                <span className="text-lg font-bold text-white">
                  {trackingState.totalHours.toFixed(2)}h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Trust Score</span>
                <span className={`text-sm font-bold ${getTrustScoreColor(trackingState.trustScore)}`}>
                  {trackingState.trustScore}%
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* 3-Layer Trust Verification System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">3-Layer Trust Verification System</h2>
            <button
              onClick={() => setShowBiometricModal(true)}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Biometric Authentication */}
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-600/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Fingerprint className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">Biometric Authentication</h3>
                  <p className="text-xs text-slate-400">WebAuthn • Face ID</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`${getStatusColor(verification.biometric.status)}`}>
                  {getStatusIcon(verification.biometric.status)}
                </div>
                <span className="text-sm font-medium text-slate-300">
                  {verification.biometric.confidence}%
                </span>
              </div>
            </div>

            {/* Geolocation Verification */}
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-600/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <MapPin className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">Geolocation Verification</h3>
                  <p className="text-xs text-slate-400">
                    {verification.geolocation.distance > 0 
                      ? `${Math.round(verification.geolocation.distance)}m from work site`
                      : 'Verifying location...'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`${getStatusColor(verification.geolocation.status)}`}>
                  {getStatusIcon(verification.geolocation.status)}
                </div>
                <span className="text-sm font-medium text-slate-300">
                  ±{Math.round(verification.geolocation.accuracy)}m
                </span>
              </div>
            </div>

            {/* Device Trust */}
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-600/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">Device Trust</h3>
                  <p className="text-xs text-slate-400">{verification.device.trustLevel}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`${getStatusColor(verification.device.status)}`}>
                  {getStatusIcon(verification.device.status)}
                </div>
                <Smartphone className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Overall Trust Score */}
          <div className="mt-6 p-4 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-lg border border-slate-600/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Overall Trust Score</span>
              <span className={`text-2xl font-bold ${getTrustScoreColor(trackingState.trustScore)}`}>
                {trackingState.trustScore}%
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${trackingState.trustScore}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-2 rounded-full ${
                  trackingState.trustScore >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  trackingState.trustScore >= 75 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                  trackingState.trustScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-gradient-to-r from-red-500 to-red-600'
                }`}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Verification Level: <span className="font-medium text-slate-300">{trackingState.verificationLevel}</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Active Time Entries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Active Time Entries</h2>
        
        <div className="space-y-4">
          {/* Current User */}
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-600/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  SJ
                </div>
                <div>
                  <h3 className="font-semibold text-white">Sarah Johnson</h3>
                  <p className="text-sm text-slate-400">Senior Electrical Engineer • GM Assembly Line</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-slate-400">📍 Detroit, MI • GM Tech Center</span>
                    <span className="text-xs text-slate-400">🔒 Verified</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 font-medium">8:02:18 AM</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Total Hours</p>
                  <p className="text-xl font-bold text-white">9.72h</p>
                </div>
                <div className="flex items-center justify-end space-x-1 mt-2">
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-green-400 font-medium">98%</span>
                </div>
              </div>
            </div>
            
            {/* Verification Status Indicators */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="flex items-center space-x-2 p-2 bg-slate-800/50 rounded">
                <Fingerprint className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-slate-300">FaceID</span>
                <CheckCircle className="h-3 w-3 text-green-400" />
              </div>
              <div className="flex items-center space-x-2 p-2 bg-slate-800/50 rounded">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-slate-300">GPS ±12m</span>
                <CheckCircle className="h-3 w-3 text-green-400" />
              </div>
              <div className="flex items-center space-x-2 p-2 bg-slate-800/50 rounded">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-xs text-slate-300">Device OK</span>
                <CheckCircle className="h-3 w-3 text-green-400" />
              </div>
            </div>
          </div>

          {/* Other Active Users */}
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-600/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                  MC
                </div>
                <div>
                  <h3 className="font-semibold text-white">Michael Chen</h3>
                  <p className="text-sm text-slate-400">Mechanical Engineer • Ford Paint Shop</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-slate-400">📍 Dearborn, MI • Ford Rouge</span>
                    <span className="text-xs text-slate-400">🔒 Active</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 font-medium">7:45:00 AM</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Total Hours</p>
                  <p className="text-xl font-bold text-white">-</p>
                </div>
                <div className="flex items-center justify-end space-x-1 mt-2">
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-green-400 font-medium">92%</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="flex items-center space-x-2 p-2 bg-slate-800/50 rounded">
                <Fingerprint className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-slate-300">TouchID</span>
                <CheckCircle className="h-3 w-3 text-green-400" />
              </div>
              <div className="flex items-center space-x-2 p-2 bg-slate-800/50 rounded">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-slate-300">GPS ±25m</span>
                <CheckCircle className="h-3 w-3 text-green-400" />
              </div>
              <div className="flex items-center space-x-2 p-2 bg-slate-800/50 rounded">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-xs text-slate-300">Secure</span>
                <CheckCircle className="h-3 w-3 text-green-400" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-600/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                  ER
                </div>
                <div>
                  <h3 className="font-semibold text-white">Emily Rodriguez</h3>
                  <p className="text-sm text-slate-400">Software Engineer • Stellantis Automation</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-slate-400">📍 Auburn Hills, MI • Remote</span>
                    <span className="text-xs text-slate-400">🔒 Review</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 font-medium">9:30:00 AM</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Total Hours</p>
                  <p className="text-xl font-bold text-white">-</p>
                </div>
                <div className="flex items-center justify-end space-x-1 mt-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                  <span className="text-xs text-yellow-400 font-medium">75%</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="flex items-center space-x-2 p-2 bg-slate-800/50 rounded">
                <Eye className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-slate-300">PIN</span>
                <XCircle className="h-3 w-3 text-red-400" />
              </div>
              <div className="flex items-center space-x-2 p-2 bg-slate-800/50 rounded">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-slate-300">GPS ±450m</span>
                <AlertTriangle className="h-3 w-3 text-yellow-400" />
              </div>
              <div className="flex items-center space-x-2 p-2 bg-slate-800/50 rounded">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-xs text-slate-300">Device OK</span>
                <CheckCircle className="h-3 w-3 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Biometric Setup Modal */}
      <AnimatePresence>
        {showBiometricModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBiometricModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Biometric Setup</h3>
              
              <div className="space-y-4">
                <button
                  onClick={async () => {
                    const result = await biometricAuth.registerBiometric('user123', 'Sarah Johnson')
                    // SECURITY: Removed // SECURITY: Removed console.log('Biometric registration:', result)
                  }}
                  className="w-full p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-left hover:border-purple-400/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Fingerprint className="h-6 w-6 text-purple-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Setup Fingerprint/Face ID</p>
                      <p className="text-xs text-slate-400">WebAuthn biometric authentication</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={async () => {
                    const result = await faceRecognition.recognizeFace(new ImageData(1, 1))
                    // SECURITY: Removed // SECURITY: Removed console.log('Face recognition test:', result)
                  }}
                  className="w-full p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl text-left hover:border-blue-400/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Eye className="h-6 w-6 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Test Face Recognition</p>
                      <p className="text-xs text-slate-400">Camera-based face detection</p>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }
}
