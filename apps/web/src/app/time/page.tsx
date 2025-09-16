'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, MapPin, Smartphone, Shield, AlertTriangle, CheckCircle, 
  Camera, Fingerprint, WifiOff, Bell, Mail, MessageSquare,
  TrendingUp, AlertCircle, Activity, ChevronRight, Lock,
  Eye, EyeOff, Navigation, Signal, Battery, Zap, ExternalLink,
  UserCheck, Calculator, X
} from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useSession } from '@/components/session-context'

// Lazy load heavy components
const EmployeeDetailModal = dynamic(() => import('@/components/time-tracking/EmployeeDetailModal'), { ssr: false })
const TimeReconciliation = dynamic(() => import('@/components/time-tracking/TimeReconciliation'), { ssr: false })
const EmployeeClockView = dynamic(() => import('@/components/time-tracking/EmployeeClockView'), { ssr: false })
const TimeTrackingCalendar = dynamic(() => import('@/components/time-tracking/TimeTrackingCalendar'), { ssr: false })
import { ClientTimeDisplay } from '@/components/client-time-display'

// Mock data for time entries with trust layers
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
]

// Trust verification configuration
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
]

// Notification channels configuration
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
]

const getTrustScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-400'
  if (score >= 75) return 'text-yellow-400'
  if (score >= 60) return 'text-orange-400'
  return 'text-red-400'
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'verified': return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'active': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'review': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30'
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

export default function TimeTrackingPage() {
  const { data: session } = useSession()
  const [selectedEntry, setSelectedEntry] = useState<typeof timeEntries[0] | null>(null)
  const [showTrustDetails, setShowTrustDetails] = useState(false)
  const [liveTracking, setLiveTracking] = useState(true)
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [activeView, setActiveView] = useState<'entries' | 'reconciliation' | 'calendar'>('entries')
  const [showClockModal, setShowClockModal] = useState(false)

  return (
    <div className="space-y-8 bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Advanced Time Tracking
          </h1>
          <p className="text-slate-400">
            Multi-layer trust verification with real-time notifications and geofencing
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/time/employee"
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2"
          >
            <UserCheck className="h-5 w-5" />
            <span>Employee View</span>
          </Link>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center space-x-1 bg-slate-800/50 backdrop-blur-xl rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveView('entries')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
            activeView === 'entries'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Time Entries</span>
        </button>
        <button
          onClick={() => setActiveView('reconciliation')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
            activeView === 'reconciliation'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span>Time Reconciliation</span>
        </button>
        <button
          onClick={() => setActiveView('calendar')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
            activeView === 'calendar'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Calendar View</span>
        </button>
      </div>

      {/* Conditional Content Rendering */}
      {activeView === 'entries' ? (
        <>
          {/* Live Clock and Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-slate-700/50 p-6"
          >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Clock className="h-8 w-8 text-blue-400" />
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <ClientTimeDisplay 
              className="text-2xl font-bold text-white"
              dateClassName="text-sm text-slate-400"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Signal className="h-5 w-5 text-green-400" />
              <span className="text-sm text-slate-400">GPS Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <Battery className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-slate-400">85%</span>
            </div>
            <button
              onClick={() => setLiveTracking(!liveTracking)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                liveTracking 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {liveTracking ? 'Live Tracking ON' : 'Live Tracking OFF'}
            </button>
          </div>
        </div>

        {/* Quick Clock In/Out */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setShowClockModal(true)}
            className="py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center space-x-3"
          >
            <Smartphone className="h-6 w-6" />
            <span>Clock In</span>
            <ChevronRight className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setShowClockModal(true)}
            className="py-4 px-6 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center space-x-3"
          >
            <Smartphone className="h-6 w-6" />
            <span>Clock Out</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </motion.div>

      {/* Trust Verification Layers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">3-Layer Trust Verification System</h2>
          <button
            onClick={() => setShowTrustDetails(!showTrustDetails)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
          >
            {showTrustDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showTrustDetails ? 'Hide' : 'Show'} Details</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trustLayers.map((layer, index) => (
            <motion.div
              key={layer.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-r ${layer.color} flex items-center justify-center`}>
                    <layer.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{layer.name}</h3>
                    <p className="text-xs text-slate-400">Weight: {layer.weight}%</p>
                  </div>
                </div>
                {layer.required && (
                  <Lock className="h-4 w-4 text-red-400" />
                )}
              </div>
              
              <AnimatePresence>
                {showTrustDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2"
                  >
                    <p className="text-xs text-slate-500 mb-2">Verification Methods:</p>
                    {layer.methods.map((method, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <div className="h-1.5 w-1.5 bg-green-400 rounded-full" />
                        <span className="text-xs text-slate-300">{method}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active Time Entries */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Active Time Entries</h2>
        <div className="space-y-4">
          {timeEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600 transition-all duration-300 cursor-pointer group"
              onClick={() => {
                setSelectedEntry(entry)
                setShowEmployeeModal(true)
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {entry.employee.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{entry.employee}</h3>
                    <p className="text-sm text-slate-400">{entry.role} • {entry.project}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        <span className="text-xs text-slate-500">{entry.location.address}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-slate-400" />
                    <span className={`text-2xl font-bold ${getTrustScoreColor(entry.trustScore)}`}>
                      {entry.trustScore}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Trust Score</p>
                  <button className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                    <span>View Details</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Time Details */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Clock In</p>
                  <p className="text-sm font-medium text-white">
                    {entry.clockIn ? new Date(entry.clockIn).toLocaleTimeString() : '-'}
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Clock Out</p>
                  <p className="text-sm font-medium text-white">
                    {entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString() : 
                     entry.status === 'active' ? <span className="text-green-400">Active</span> : '-'}
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Total Hours</p>
                  <p className="text-sm font-medium text-white">
                    {entry.totalHours ? `${entry.totalHours.toFixed(2)}h` : 
                     entry.status === 'active' ? <Activity className="h-4 w-4 text-green-400 inline" /> : '-'}
                  </p>
                </div>
              </div>

              {/* Trust Verification Status */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className={`flex items-center space-x-2 p-2 rounded-lg ${
                  entry.verificationLayers.biometric.verified ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  <Fingerprint className={`h-4 w-4 ${
                    entry.verificationLayers.biometric.verified ? 'text-green-400' : 'text-red-400'
                  }`} />
                  <div>
                    <p className="text-xs text-slate-300">{entry.verificationLayers.biometric.type}</p>
                    <p className="text-xs text-slate-500">{entry.verificationLayers.biometric.timestamp}</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-2 p-2 rounded-lg ${
                  entry.verificationLayers.geolocation.verified ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  <Navigation className={`h-4 w-4 ${
                    entry.verificationLayers.geolocation.verified ? 'text-green-400' : 'text-red-400'
                  }`} />
                  <div>
                    <p className="text-xs text-slate-300">GPS ±{entry.verificationLayers.geolocation.accuracy}</p>
                    <p className="text-xs text-slate-500">
                      {entry.verificationLayers.geolocation.withinGeofence ? 'In zone' : 'Outside zone'}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center space-x-2 p-2 rounded-lg ${
                  entry.verificationLayers.deviceTrust.verified ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  <Smartphone className={`h-4 w-4 ${
                    entry.verificationLayers.deviceTrust.verified ? 'text-green-400' : 'text-red-400'
                  }`} />
                  <div>
                    <p className="text-xs text-slate-300">Device OK</p>
                    <p className="text-xs text-slate-500">
                      {entry.verificationLayers.deviceTrust.jailbroken ? 'Jailbroken' : 'Secure'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notifications Sent */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-500">Notifications:</span>
                  {entry.notifications.manager.sent && (
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-3 w-3 text-blue-400" />
                      <span className="text-xs text-slate-400">Manager</span>
                    </div>
                  )}
                  {entry.notifications.hr.sent && (
                    <div className="flex items-center space-x-1">
                      <Mail className="h-3 w-3 text-green-400" />
                      <span className="text-xs text-slate-400">HR</span>
                    </div>
                  )}
                  {entry.notifications.client.sent && (
                    <div className="flex items-center space-x-1">
                      <Bell className="h-3 w-3 text-purple-400" />
                      <span className="text-xs text-slate-400">Client</span>
                    </div>
                  )}
                </div>
                
                {entry.anomalies.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <span className="text-xs text-yellow-400">{entry.anomalies.join(', ')}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Notification Channels Configuration */}
      <div className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Notification Channels</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {notificationChannels.map((channel, index) => (
            <motion.div
              key={channel.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900/50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`h-10 w-10 rounded-lg ${
                    channel.enabled ? 'bg-green-500/20' : 'bg-slate-700'
                  } flex items-center justify-center`}>
                    <channel.icon className={`h-5 w-5 ${
                      channel.enabled ? 'text-green-400' : 'text-slate-500'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{channel.name}</h3>
                    <p className="text-xs text-slate-400">
                      {channel.enabled ? 'Active' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <button className={`w-12 h-6 rounded-full transition-colors ${
                  channel.enabled ? 'bg-green-500' : 'bg-slate-700'
                }`}>
                  <div className={`h-5 w-5 bg-white rounded-full transition-transform ${
                    channel.enabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Recipients:</p>
                  <div className="flex flex-wrap gap-1">
                    {channel.recipients.map((recipient, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-300">
                        {recipient}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500 mb-1">Events:</p>
                  <div className="flex flex-wrap gap-1">
                    {channel.events.slice(0, 3).map((event, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-500/10 rounded text-xs text-blue-400">
                        {event}
                      </span>
                    ))}
                    {channel.events.length > 3 && (
                      <span className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-500">
                        +{channel.events.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trust Score Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">System Trust Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <Zap className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">88%</div>
            <div className="text-sm text-green-300">Avg Trust Score</div>
          </div>
          <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-400">2,847</div>
            <div className="text-sm text-blue-300">Verified Entries</div>
          </div>
          <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <AlertCircle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-400">23</div>
            <div className="text-sm text-yellow-300">Under Review</div>
          </div>
          <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <Bell className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-400">8,541</div>
            <div className="text-sm text-purple-300">Notifications Sent</div>
          </div>
        </div>
      </motion.div>

        </>
      ) : activeView === 'reconciliation' ? (
        /* Time Reconciliation View */
        <TimeReconciliation />
      ) : (
        /* Calendar View */
        <TimeTrackingCalendar 
          userRole={session?.user?.role === 'ENGINEER_EMPLOYEE' ? 'employee' : 
                   session?.user?.role === 'PARTNER_ADMIN' ? 'partner' :
                   session?.user?.role === 'PARTNER_OPERATOR' ? 'operator' : 'engineer'}
          employeeId={session?.user?.id}
          isReadOnly={false}
        />
      )}

      {/* Employee Detail Modal - Available in both views */}
      <EmployeeDetailModal
        employee={selectedEntry}
        isOpen={showEmployeeModal}
        onClose={() => {
          setShowEmployeeModal(false)
          setSelectedEntry(null)
        }}
      />
      
      {/* Clock In/Out Modal */}
      {showClockModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700/50 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Time Clock</h2>
              <button
                onClick={() => setShowClockModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <EmployeeClockView 
              onClose={() => setShowClockModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}