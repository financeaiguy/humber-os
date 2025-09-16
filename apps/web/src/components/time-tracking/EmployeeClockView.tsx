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

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        (error) => {
          setLocationError(error.message)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
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

  const requestBiometric = async () => {
    try {
      // Check if WebAuthn is available for biometric authentication
      if (window.PublicKeyCredential && navigator.credentials) {
        // Create a challenge for WebAuthn
        const challenge = new Uint8Array(32)
        crypto.getRandomValues(challenge)
        
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
            userVerification: "required"
          },
          timeout: 60000,
          attestation: "direct"
        }

        try {
          // Try to use existing credentials first
          const assertion = await navigator.credentials.get({
            publicKey: {
              challenge,
              timeout: 60000,
              userVerification: "required",
              rpId: window.location.hostname
            }
          } as CredentialRequestOptions)
          
          if (assertion) {
            setBiometricVerified(true)
            return true
          }
        } catch (error) {
          // If no existing credentials, try to create new ones
          try {
            const credential = await navigator.credentials.create({
              publicKey: publicKeyCredentialCreationOptions
            })
            
            if (credential) {
              setBiometricVerified(true)
              return true
            }
          } catch (createError) {
            console.error('Biometric creation failed:', createError)
          }
        }
      }
      
      // Fallback to simulated biometric for browsers without WebAuthn
      const confirmed = window.confirm(
        'Biometric authentication required.\n\n' +
        'This would normally use Face ID, Touch ID, or Windows Hello.\n\n' +
        'Click OK to simulate successful biometric verification.'
      )
      
      if (confirmed) {
        setBiometricVerified(true)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Biometric authentication error:', error)
      return false
    }
  }

  const handleClockIn = async () => {
    setIsClockingIn(true)
    
    try {
      // Step 1: Request location permission and verify
      if (!location) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        
        if (permission.state === 'denied') {
          alert(
            'Location access is required for clock in.\n\n' +
            'Please enable location services in your browser settings and refresh the page.'
          )
          setIsClockingIn(false)
          return
        }
        
        // Try to get location again
        await new Promise<void>((resolve, reject) => {
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
              alert(`Location error: ${error.message}\n\nPlease enable GPS and try again.`)
              reject(error)
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          )
        }).catch(() => {
          setIsClockingIn(false)
          return
        })
      }
      
      // Step 2: Verify device is approved (check device fingerprint)
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
      
      // Step 3: Request biometric authentication
      const biometric = await requestBiometric()
      
      if (!biometric) {
        alert(
          'Biometric verification failed or was cancelled.\n\n' +
          'Please try again and approve the biometric prompt.'
        )
        setIsClockingIn(false)
        return
      }
      
      // Step 4: Verify location is within allowed radius (e.g., within 100 meters of work site)
      const isWithinGeofence = await verifyGeofence(location!)
      
      if (!isWithinGeofence) {
        alert(
          'You are not within the authorized work location.\n\n' +
          'Please ensure you are at the work site and try again.\n' +
          `Current accuracy: ±${Math.round(location!.accuracy)}m`
        )
        setIsClockingIn(false)
        return
      }
      
      // Step 5: Submit clock in request
      const clockInData = {
        employeeId: employee.id,
        timestamp: new Date().toISOString(),
        location: location,
        deviceFingerprint,
        biometricVerified: true,
        verificationType: 'WebAuthn'
      }
      
      // Simulate API call (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Clock in data:', clockInData)
      
      // Success
      setIsClockedIn(true)
      setClockInTime(new Date())
      
      // Show success notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Clock In Successful', {
          body: `You have successfully clocked in at ${new Date().toLocaleTimeString()}`,
          icon: '/icon-192x192.png'
        })
      }
    } catch (error) {
      console.error('Clock in error:', error)
      alert('An error occurred during clock in. Please try again.')
    } finally {
      setIsClockingIn(false)
    }
  }

  const handleClockOut = async () => {
    setIsClockingOut(true)
    
    try {
      // Step 1: Verify location for clock out
      if (!location) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        
        if (permission.state === 'denied') {
          alert(
            'Location access is required for clock out.\n\n' +
            'Please enable location services in your browser settings.'
          )
          setIsClockingOut(false)
          return
        }
        
        // Try to get location
        await new Promise<void>((resolve, reject) => {
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
              // Allow clock out even without location (with warning)
              if (confirm(
                `Location unavailable: ${error.message}\n\n` +
                'Do you want to clock out without location verification?\n' +
                'This will be flagged for review.'
              )) {
                resolve()
              } else {
                reject(error)
              }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          )
        }).catch(() => {
          setIsClockingOut(false)
          return
        })
      }
      
      // Step 2: Request biometric authentication
      const biometric = await requestBiometric()
      
      if (!biometric) {
        alert(
          'Biometric verification failed or was cancelled.\n\n' +
          'Please try again and approve the biometric prompt.'
        )
        setIsClockingOut(false)
        return
      }
      
      // Step 3: Calculate total hours worked
      const totalHours = todayHours
      const overtimeHours = totalHours > 8 ? totalHours - 8 : 0
      
      // Step 4: Submit clock out request
      const clockOutData = {
        employeeId: employee.id,
        clockInTime: clockInTime?.toISOString(),
        clockOutTime: new Date().toISOString(),
        totalHours: totalHours.toFixed(2),
        overtimeHours: overtimeHours.toFixed(2),
        location: location,
        deviceFingerprint: await generateDeviceFingerprint(),
        biometricVerified: true
      }
      
      // Simulate API call (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Clock out data:', clockOutData)
      
      // Success
      setIsClockedIn(false)
      setClockInTime(null)
      setElapsedTime('00:00:00')
      setBiometricVerified(false)
      
      // Show success notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Clock Out Successful', {
          body: `You worked ${totalHours.toFixed(2)} hours today. Great job!`,
          icon: '/icon-192x192.png'
        })
      }
    } catch (error) {
      console.error('Clock out error:', error)
      alert('An error occurred during clock out. Please try again.')
    } finally {
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
  
  // Verify location is within geofence (mock - replace with actual coordinates)
  const verifyGeofence = async (location: { lat: number; lng: number; accuracy: number }): Promise<boolean> => {
    // Example: GM Assembly Plant coordinates (replace with actual work site)
    const workSite = {
      lat: 42.3149,  // Example latitude
      lng: -83.0364, // Example longitude
      radius: 500    // 500 meters radius
    }
    
    // Calculate distance between current location and work site
    const R = 6371e3 // Earth's radius in meters
    const φ1 = location.lat * Math.PI / 180
    const φ2 = workSite.lat * Math.PI / 180
    const Δφ = (workSite.lat - location.lat) * Math.PI / 180
    const Δλ = (workSite.lng - location.lng) * Math.PI / 180
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    
    // Check if within radius (accounting for GPS accuracy)
    return distance <= (workSite.radius + location.accuracy)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 pb-20">
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
          <greeting.icon className="h-6 w-6 text-yellow-400" />
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
    </div>
  )
}