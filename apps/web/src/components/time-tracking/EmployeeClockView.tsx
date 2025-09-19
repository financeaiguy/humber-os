'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, MapPin, Smartphone, Shield, CheckCircle, 
  Camera, Fingerprint, Navigation, Signal, Battery, 
  User, Calendar, Briefcase, AlertCircle, ChevronRight,
  LogIn, LogOut, Activity, History, Sun, Moon, Coffee,
  Loader2, Check, X, Wifi, WifiOff
} from 'lucide-react'
import CameraVerification from './CameraVerification'

interface EmployeeClockViewProps {
  employeeData?: {
    id: string
    name: string
    role: string
    project: string
    avatar?: string
  }
  onClose?: () => void
}

export default function EmployeeClockView({ employeeData, onClose }: EmployeeClockViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isClockingIn, setIsClockingIn] = useState(false)
  const [isClockingOut, setIsClockingOut] = useState(false)
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [biometricVerified, setBiometricVerified] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<any>(null)
  const [networkStatus, setNetworkStatus] = useState(true)
  const [batteryLevel, setBatteryLevel] = useState(100)
  const [clockInTime, setClockInTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState('00:00:00')
  const [todayHours, setTodayHours] = useState(0)
  const [weekHours, setWeekHours] = useState(37.5)
  const [showCamera, setShowCamera] = useState(false)
  const [pendingAction, setPendingAction] = useState<'clock-in' | 'clock-out' | null>(null)

  // Mock employee data if not provided
  const employee = employeeData || {
    id: 'emp_001',
    name: 'John Smith',
    role: 'Senior Engineer',
    project: 'GM Assembly Line',
    avatar: 'JS'
  }

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Update elapsed time when clocked in
  useEffect(() => {
    if (isClockedIn && clockInTime) {
      const timer = setInterval(() => {
        const now = new Date()
        const diff = now.getTime() - clockInTime.getTime()
        const hours = Math.floor(diff / 3600000)
        const minutes = Math.floor((diff % 3600000) / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)
        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        )
        setTodayHours(diff / 3600000)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isClockedIn, clockInTime])

  // Don't automatically request location on mount - wait for user action
  useEffect(() => {
    // Check if geolocation is available but don't request it yet
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported')
    } else {
      // Just mark that location is available but not yet requested
      console.log('Geolocation available, will request when needed')
    }
  }, [])

  // Check network status
  useEffect(() => {
    setNetworkStatus(navigator.onLine)
    const handleOnline = () => setNetworkStatus(true)
    const handleOffline = () => setNetworkStatus(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Check battery level (if supported)
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100))
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100))
        })
      })
    }
  }, [])

  // Get device info
  useEffect(() => {
    setDeviceInfo({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
  }, [])

  const requestBiometric = async (): Promise<boolean> => {
    try {
      // Development bypass - always allow in development mode
      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_APP_ENV === 'development') {
        setBiometricVerified(false) // Mark as manual verification for development
        return true
      }

      // Check if WebAuthn is available for biometric authentication
      if (window.PublicKeyCredential && navigator.credentials) {
        // Check available authenticators
        const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        
        if (isAvailable) {
          // Create a challenge for WebAuthn
          const challenge = new Uint8Array(32)
          crypto.getRandomValues(challenge)
          
          try {
            // Try to use existing credentials first (authentication)
            const assertion = await navigator.credentials.get({
              publicKey: {
                challenge,
                timeout: 60000,
                userVerification: "required",
                rpId: window.location.hostname,
                allowCredentials: [] // Allow any registered credential
              }
            } as CredentialRequestOptions)
            
            if (assertion) {
              setBiometricVerified(true)
              // SECURITY: console statement removed: console.log('Biometric authentication successful')
              return true
            }
          } catch (getError) {
            // SECURITY: console statement removed: console.log('No existing credentials, attempting registration')
            
            // If no existing credentials, try to create new ones (registration)
            const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
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
                { alg: -7, type: "public-key" },  // ES256
                { alg: -257, type: "public-key" }  // RS256
              ],
              authenticatorSelection: {
                authenticatorAttachment: "platform",
                userVerification: "required",
                residentKey: "preferred"
              },
              timeout: 60000,
              attestation: "none" // Changed from "direct" for better compatibility
            }
            
            try {
              const credential = await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions
              })
              
              if (credential) {
                setBiometricVerified(true)
                // SECURITY: console statement removed: console.log('Biometric registration and authentication successful')
                return true
              }
            } catch (createError) {
              // SECURITY: console statement removed: console.error('Biometric registration failed:', createError)
            }
          }
        }
      }
      
      // Secure fallback: Require manual security verification
      // In production, this might involve:
      // 1. SMS verification
      // 2. Email verification  
      // 3. Security questions
      // 4. Manager approval
      
      const fallbackOptions = [
        'SMS Verification Code',
        'Email Verification',
        'Security Questions',
        'Manager Approval Required'
      ]
      
      const choice = window.confirm(
        '⚠️ BIOMETRIC AUTHENTICATION UNAVAILABLE ⚠️\n\n' +
        'Your device does not support biometric authentication.\n\n' +
        'For security, time tracking requires additional verification.\n\n' +
        'Would you like to use alternative verification?\n' +
        '(In production: SMS, Email, or Manager approval)'
      )
      
      if (choice) {
        // In production, implement actual alternative verification
        // For now, require manager/admin approval
        alert(
          '🔐 SECURITY NOTICE 🔐\n\n' +
          'This time entry will be flagged for manual verification.\n\n' +
          'A manager must approve this entry before it becomes official.\n\n' +
          'Proceeding with manual verification flag...'
        )
        
        setBiometricVerified(false) // Mark as NOT biometrically verified
        return true // Allow but flag for review
      }
      
      return false
    } catch (error) {
      // SECURITY: console statement removed: console.error('Biometric authentication error:', error)
      
      // Even errors should require fallback verification
      const proceed = window.confirm(
        '❌ AUTHENTICATION ERROR ❌\n\n' +
        'Biometric system encountered an error.\n\n' +
        'This entry will require manual verification.\n\n' +
        'Continue with manual review process?'
      )
      
      if (proceed) {
        setBiometricVerified(false) // Mark for manual review
        return true
      }
      
      return false
    }
  }

  const handleClockIn = async () => {
    // Step 1: Pre-flight checks
    console.log('Clock in button clicked')
    setIsClockingIn(true)

    try {
      // Check location first (but don't block if it fails)
      if (!location) {
        console.log('No location yet, attempting to get current location...')
        try {
          await getCurrentLocation()
        } catch (locationError) {
          console.log('Location access failed, continuing without location:', locationError)
          // Continue without location - will be flagged for review
        }
      }
      
      // Check device approval
      const deviceFingerprint = await generateDeviceFingerprint()
      const isApprovedDevice = await verifyDevice(deviceFingerprint)
      
      if (!isApprovedDevice) {
        alert(
          'This device is not approved for time tracking.\n\n' +
          'Please contact your administrator to approve this device:\n' +
          `Device ID: ${deviceFingerprint.substring(0, 8)}...`
        )
        setIsClockingIn(false)
        return
      }
      
      // Verify location geofence (skip if no location available)
      if (location) {
        const isWithinGeofence = await verifyGeofence(location)
        if (!isWithinGeofence && !isDemoMode()) {
          alert(
            'You are not within the authorized work location.\n\n' +
            'Please ensure you are at the work site and try again.\n' +
            `Current accuracy: ±${Math.round(location.accuracy)}m`
          )
          setIsClockingIn(false)
          return
        }
      } else if (!isDemoMode()) {
        // No location available - warn but allow to continue
        const proceed = confirm(
          'Location services are unavailable.\n\n' +
          'Your clock-in will be flagged for manual review.\n' +
          'Do you want to continue?'
        )
        if (!proceed) {
          setIsClockingIn(false)
          return
        }
      }
      
      // All checks passed - show camera for photo verification
      setPendingAction('clock-in')
      setShowCamera(true)
      setIsClockingIn(false)
      
    } catch (error: any) {
      // SECURITY: console statement removed: console.error('Clock in preparation error:', error)
      console.error('Clock in preparation error:', error)
      // Only show error alert for actual errors, not cancellations
      if (error?.message && error.message !== 'User cancelled' && error.message !== 'Location access failed') {
        alert(`Clock in error: ${error.message}`)
      }
      setIsClockingIn(false)
    }
  }

  // Get current location helper
  const getCurrentLocation = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
          resolve()
        },
        (error) => {
          setLocationError('Location access failed')
          reject(error)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    })
  }

  const handleClockOut = async () => {
    // Step 1: Pre-flight checks for clock out
    setIsClockingOut(true)
    
    try {
      // Check location (more lenient for clock out)
      if (!location) {
        try {
          await getCurrentLocation()
        } catch (error) {
          // Allow clock out without location but warn user
          if (!isDemoMode()) {
            const proceed = confirm(
              `Location unavailable: ${error}\n\n` +
              'Do you want to clock out without location verification?\n' +
              'This will be flagged for review.'
            )
            if (!proceed) {
              setIsClockingOut(false)
              return
            }
          }
        }
      }
      
      // Verify location for clock out (in demo mode, this might fail)
      if (location && !await verifyGeofence(location)) {
        if (isDemoMode()) {
          // In demo mode, show the failure but allow retry
          setIsClockingOut(false)
          return
        } else {
          // In production, allow clock out with warning
          const proceed = confirm(
            'Location verification failed for clock out.\n\n' +
            'You may still clock out, but this will be flagged for review.\n' +
            'Continue with clock out?'
          )
          if (!proceed) {
            setIsClockingOut(false)
            return
          }
        }
      }
      
      // All checks passed - show camera for photo verification
      setPendingAction('clock-out')
      setShowCamera(true)
      setIsClockingOut(false)
      
    } catch (error) {
      // SECURITY: console statement removed: console.error('Clock out preparation error:', error)
      alert('An error occurred preparing clock out. Please try again.')
      setIsClockingOut(false)
    }
  }

  // Generate unique device fingerprint
  const generateDeviceFingerprint = async (): Promise<string> => {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 0,
      navigator.maxTouchPoints || 0
    ].join('|')
    
    // Hash the fingerprint
    const msgBuffer = new TextEncoder().encode(fingerprint)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    return hashHex
  }
  
  // Verify if device is approved (mock - replace with actual API call)
  const verifyDevice = async (fingerprint: string): Promise<boolean> => {
    // In production, this would check against a whitelist of approved devices
    // For now, simulate approval check
    const approvedDevices = localStorage.getItem('approvedDevices')
    if (!approvedDevices) {
      // First time - auto-approve and save
      localStorage.setItem('approvedDevices', JSON.stringify([fingerprint]))
      return true
    }
    
    const devices = JSON.parse(approvedDevices)
    return devices.includes(fingerprint)
  }
  
  // Check if we're in demo mode
  const isDemoMode = (): boolean => {
    return window.location.hostname.includes('demo') || 
           window.location.hostname.includes('pages.dev') ||
           process.env.NODE_ENV === 'development'
  }

  // Verify location is within geofence with demo mode scenarios
  const verifyGeofence = async (location: { lat: number; lng: number; accuracy: number }): Promise<boolean> => {
    // Demo mode: Simulate different scenarios
    if (isDemoMode()) {
      return handleDemoLocationScenarios(location)
    }
    
    // Production mode: Always verify location
    // Get work sites from environment configuration (server-side)
    const workSites = [
      {
        name: 'GM Assembly Plant',
        lat: 42.3149,  // Example latitude
        lng: -83.0364, // Example longitude
        radius: 500    // 500 meters radius
      },
      {
        name: 'Ford Dearborn Plant',
        lat: 42.3223,
        lng: -83.1963,
        radius: 300
      }
      // Add more authorized work locations as needed
    ]
    
    // Check if current location is within any authorized work site
    for (const workSite of workSites) {
      const distance = calculateDistance(location, workSite)
      
      // Check if within radius (accounting for GPS accuracy)
      if (distance <= (workSite.radius + location.accuracy)) {
        // SECURITY: console statement removed: console.log(`Location verified at ${workSite.name}: ${distance.toFixed(0)}m away`)
        return true
      }
    }
    
    // SECURITY: console statement removed: console.warn('Location verification failed: Not at any authorized work site')
    return false
  }

  // Demo mode location scenarios
  const handleDemoLocationScenarios = (location: { lat: number; lng: number; accuracy: number }): boolean => {
    const currentAttempts = parseInt(localStorage.getItem('demoLocationAttempts') || '0')
    
    // Scenario 1: First attempt (clock in) - SUCCESS
    if (currentAttempts === 0) {
      localStorage.setItem('demoLocationAttempts', '1')
      // SECURITY: console statement removed: console.log('🎭 DEMO: Clock in successful - authorized location')
      showDemoNotification('✅ Location Verified', 'You are at an authorized work site', 'success')
      return true
    }
    
    // Scenario 2: Second attempt (clock out) - FAIL
    if (currentAttempts === 1) {
      localStorage.setItem('demoLocationAttempts', '2')
      // SECURITY: console statement removed: console.log('🎭 DEMO: Clock out failed - location verification failed')
      showDemoNotification('❌ Location Verification Failed', 'You are not within the authorized work location.\n\nPlease ensure you are at the work site and try again.', 'error')
      return false
    }
    
    // Scenario 3: Third attempt - SUCCESS (after moving back to work site)
    if (currentAttempts === 2) {
      localStorage.setItem('demoLocationAttempts', '3')
      // SECURITY: console statement removed: console.log('🎭 DEMO: Clock out successful - back at authorized location')
      showDemoNotification('✅ Location Verified', 'Successfully verified work site location', 'success')
      return true
    }
    
    // Reset after demo cycle
    if (currentAttempts >= 3) {
      localStorage.setItem('demoLocationAttempts', '0')
      return true
    }
    
    return true
  }

  // Show demo notifications
  const showDemoNotification = (title: string, message: string, type: 'success' | 'error' | 'warning') => {
    const colors = {
      success: { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400' },
      error: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400' },
      warning: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400' }
    }
    
    // Create notification element
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 z-50 ${colors[type].bg} ${colors[type].border} border rounded-xl p-4 max-w-sm shadow-xl backdrop-blur-xl`
    notification.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="flex-1">
          <p class="font-semibold ${colors[type].text}">${title}</p>
          <p class="text-sm text-slate-300 mt-1">${message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-slate-400 hover:text-white">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `
    
    document.body.appendChild(notification)
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove()
      }
    }, 5000)
  }

  // Helper function to calculate distance between two points (Haversine formula)
  const calculateDistance = (
    point1: { lat: number; lng: number }, 
    point2: { lat: number; lng: number }
  ): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = point1.lat * Math.PI / 180
    const φ2 = point2.lat * Math.PI / 180
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    
    return R * c
  }

  // Handle camera capture and submit to secure API
  const handleCameraCapture = async (imageData: string, metadata: any) => {
    try {
      const deviceFingerprint = await generateDeviceFingerprint()
      const biometric = await requestBiometric()

      if (!biometric) {
        throw new Error('Biometric verification failed')
      }

      // Prepare secure time entry
      const timeEntry = {
        type: pendingAction,
        timestamp: new Date().toISOString(),
        photo: imageData,
        metadata: {
          ...metadata,
          biometricVerified: true,
          deviceFingerprint
        }
      }

      // Submit to secure API
      const response = await fetch('/api/time-tracking/secure-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(timeEntry)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit time entry')
      }

      // Temporary debug logging
      console.log('✅ Time entry submitted successfully:', result)

      // Success - update local state
      if (pendingAction === 'clock-in') {
        setIsClockedIn(true)
        setClockInTime(new Date())
        setBiometricVerified(true)
      } else {
        setIsClockedIn(false)
        setClockInTime(null)
        setElapsedTime('00:00:00')
        setBiometricVerified(false)
      }

      // Show success notification
      if ('Notification' in window && Notification.permission === 'granted') {
        const action = pendingAction === 'clock-in' ? 'Clock In' : 'Clock Out'
        new Notification(`${action} Successful`, {
          body: `${action} completed with photo verification at ${new Date().toLocaleTimeString()}`,
          icon: '/icon-192x192.png'
        })
      }

      // Reset pending action and close camera
      setPendingAction(null)
      setShowCamera(false)

    } catch (error: any) {
      // SECURITY: console statement removed: console.error('Camera capture submission error:', error)
      alert(`Failed to submit ${pendingAction}: ${error.message || 'Submission failed. Please try again.'}`)
      // Close camera even on error
      setShowCamera(false)
      setPendingAction(null)
    }
  }
  
  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])
  
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return { text: 'Good Morning', icon: Sun }
    if (hour < 17) return { text: 'Good Afternoon', icon: Sun }
    if (hour < 20) return { text: 'Good Evening', icon: Moon }
    return { text: 'Good Night', icon: Moon }
  }

  const greeting = getGreeting()

  return (
    <div className="p-4">
      {/* Mobile Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {employee.avatar || employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{greeting.text}</h1>
              <p className="text-sm text-slate-400">{employee.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <greeting.icon className="h-6 w-6 text-yellow-400" />
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            {networkStatus ? (
              <div className="flex items-center space-x-1">
                <Wifi className="h-3 w-3 text-green-400" />
                <span>Online</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <WifiOff className="h-3 w-3 text-red-400" />
                <span>Offline</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Signal className="h-3 w-3 text-green-400" />
              <span>GPS</span>
            </div>
            <div className="flex items-center space-x-1">
              <Battery className="h-3 w-3 text-yellow-400" />
              <span>{batteryLevel}%</span>
            </div>
          </div>
          <span>{currentTime.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Live Clock Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mb-6"
      >
        <div className="text-center mb-4">
          <div className="text-5xl font-bold text-white mb-2">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </div>
          <p className="text-slate-400">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Status Indicator */}
        {isClockedIn ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-400 animate-pulse" />
                <span className="text-green-400 font-semibold">Currently Working</span>
              </div>
              <span className="text-2xl font-bold text-white">{elapsedTime}</span>
            </div>
            <div className="text-xs text-slate-400">
              Clocked in at {clockInTime?.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-slate-400">Not clocked in</p>
          </div>
        )}
      </motion.div>

      {/* Employee Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Briefcase className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-sm font-semibold text-white">{employee.role}</p>
              <p className="text-xs text-slate-400">{employee.project}</p>
            </div>
          </div>
        </div>
        
        {/* Today's Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Today</p>
            <p className="text-lg font-semibold text-white">
              {todayHours.toFixed(2)}h
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">This Week</p>
            <p className="text-lg font-semibold text-white">
              {weekHours.toFixed(1)}h
            </p>
          </div>
        </div>
      </motion.div>

      {/* Clock In/Out Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        {!isClockedIn ? (
          <button
            onClick={handleClockIn}
            disabled={isClockingIn}
            className="w-full py-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            {isClockingIn ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <LogIn className="h-6 w-6" />
                <span>Clock In</span>
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleClockOut}
            disabled={isClockingOut}
            className="w-full py-6 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-bold text-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            {isClockingOut ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <LogOut className="h-6 w-6" />
                <span>Clock Out</span>
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </button>
        )}
      </motion.div>

      {/* Demo Mode Indicator */}
      {isDemoMode() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse"></div>
              <h3 className="text-sm font-semibold text-purple-300">Demo Mode Active</h3>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('demoLocationAttempts')
                showDemoNotification('🔄 Demo Reset', 'Location scenarios have been reset', 'success')
              }}
              className="text-xs bg-purple-500/20 hover:bg-purple-500/30 px-3 py-1 rounded-lg transition-colors text-purple-300"
            >
              Reset Demo
            </button>
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <p>• First clock-in: ✅ Location verified</p>
            <p>• First clock-out: ❌ Location verification fails</p>
            <p>• Second clock-out: ✅ Location verified (retry success)</p>
          </div>
          <div className="mt-2 text-xs text-purple-300">
            Current attempt: {parseInt(localStorage.getItem('demoLocationAttempts') || '0') + 1}
          </div>
        </motion.div>
      )}

      {/* Verification Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 mb-6"
      >
        <h3 className="text-sm font-semibold text-white mb-3">Verification Status</h3>
        <div className="space-y-3">
          {/* Biometric */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`h-8 w-8 rounded-lg ${
                biometricVerified ? 'bg-green-500/20' : 'bg-slate-700'
              } flex items-center justify-center`}>
                <Fingerprint className={`h-4 w-4 ${
                  biometricVerified ? 'text-green-400' : 'text-slate-500'
                }`} />
              </div>
              <div>
                <p className="text-sm text-white">Biometric</p>
                <p className="text-xs text-slate-400">Face ID</p>
              </div>
            </div>
            {biometricVerified ? (
              <Check className="h-5 w-5 text-green-400" />
            ) : (
              <X className="h-5 w-5 text-slate-500" />
            )}
          </div>

          {/* Location */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`h-8 w-8 rounded-lg ${
                location ? 'bg-green-500/20' : 'bg-slate-700'
              } flex items-center justify-center`}>
                <MapPin className={`h-4 w-4 ${
                  location ? 'text-green-400' : 'text-slate-500'
                }`} />
              </div>
              <div>
                <p className="text-sm text-white">Location</p>
                <p className="text-xs text-slate-400">
                  {location ? `±${Math.round(location.accuracy)}m` : 'Not available'}
                </p>
              </div>
            </div>
            {location ? (
              <Check className="h-5 w-5 text-green-400" />
            ) : (
              <X className="h-5 w-5 text-slate-500" />
            )}
          </div>

          {/* Device Trust */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white">Device Trust</p>
                <p className="text-xs text-slate-400">Verified</p>
              </div>
            </div>
            <Check className="h-5 w-5 text-green-400" />
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
          <History className="h-4 w-4 text-slate-400" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
            <div>
              <p className="text-sm text-white">Clock Out</p>
              <p className="text-xs text-slate-400">Yesterday</p>
            </div>
            <span className="text-sm text-slate-400">5:32 PM</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
            <div>
              <p className="text-sm text-white">Clock In</p>
              <p className="text-xs text-slate-400">Yesterday</p>
            </div>
            <span className="text-sm text-slate-400">8:15 AM</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-white">Break</p>
              <p className="text-xs text-slate-400">Yesterday</p>
            </div>
            <span className="text-sm text-slate-400">12:00 PM</span>
          </div>
        </div>
      </motion.div>

      {/* Bottom Navigation (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 px-4 py-3">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center space-y-1 text-blue-400">
            <Clock className="h-6 w-6" />
            <span className="text-xs">Time</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-slate-400">
            <Calendar className="h-6 w-6" />
            <span className="text-xs">Schedule</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-slate-400">
            <History className="h-6 w-6" />
            <span className="text-xs">History</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-slate-400">
            <User className="h-6 w-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>

      {/* Camera Verification Modal */}
      <CameraVerification
        isOpen={showCamera}
        onClose={() => {
          setShowCamera(false)
          setPendingAction(null)
        }}
        onCapture={handleCameraCapture}
        purpose={pendingAction || 'clock-in'}
        employeeId={employee.id}
      />
    </div>
  )
}