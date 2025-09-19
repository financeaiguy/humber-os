'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Calendar, Clock, MapPin, Building, FileText, 
  TrendingUp, AlertCircle, CheckCircle, ChevronLeft, 
  ChevronRight, Download, Filter, BarChart3, User,
  Briefcase, Shield, DollarSign, Award, Activity,
  LogIn, LogOut, Fingerprint, Navigation, Smartphone,
  Check, Loader2
} from 'lucide-react'

interface EmployeeDetail {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  employeeId: string;
  department: string;
  supervisor: string;
  startDate: string;
  currentClient?: string;
  profileImage?: string;
}

interface DailyTimeEntry {
  date: string;
  client: string;
  project: string;
  site: string;
  clockIn: string;
  clockOut: string;
  breakTime: number; // in minutes
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  doubleTimeHours: number;
  status: 'approved' | 'pending' | 'rejected' | 'review';
  trustScore: number;
  sopCompliance: {
    followed: string[];
    violated: string[];
    percentage: number;
  };
  activities: {
    time: string;
    description: string;
    category: string;
  }[];
  expenses?: {
    mileage?: number;
    meals?: number;
    equipment?: number;
    other?: number;
  };
}

interface ClientSOP {
  client: string;
  requirements: {
    safetyGear: string[];
    checkInProcess: string;
    breakPolicy: string;
    overtimePolicy: string;
    reportingStructure: string;
    emergencyProtocol: string;
  };
  restrictions: string[];
  certifications: string[];
}

interface EmployeeStats {
  totalHoursThisWeek: number;
  totalHoursThisMonth: number;
  averageHoursPerDay: number;
  overtimeHoursThisMonth: number;
  clientBreakdown: {
    client: string;
    hours: number;
    percentage: number;
    revenue: number;
  }[];
  sopComplianceRate: number;
  averageTrustScore: number;
  punctualityRate: number;
}

const mockEmployeeDetail: EmployeeDetail = {
  id: 1,
  name: 'Sarah Johnson',
  role: 'Senior Electrical Engineer',
  email: 'employee@example.com',
  phone: '+1 (555) 123-4567',
  employeeId: 'HMB-2024-0342',
  department: 'Electrical Systems',
  supervisor: 'Michael Thompson',
  startDate: '2023-03-15',
  currentClient: 'General Motors'
}

const mockDailyEntries: DailyTimeEntry[] = [
  {
    date: '2025-01-15',
    client: 'General Motors',
    project: 'Assembly Line Automation',
    site: 'GM Tech Center - Detroit',
    clockIn: '07:58:23',
    clockOut: '17:32:45',
    breakTime: 45,
    totalHours: 8.75,
    regularHours: 8,
    overtimeHours: 0.75,
    doubleTimeHours: 0,
    status: 'approved',
    trustScore: 98,
    sopCompliance: {
      followed: ['Safety briefing attended', 'PPE worn', 'Proper badge-in', 'Tool checkout completed'],
      violated: [],
      percentage: 100
    },
    activities: [
      { time: '08:00', description: 'Safety briefing and tool checkout', category: 'Setup' },
      { time: '08:30', description: 'PLC programming for conveyor section 3', category: 'Programming' },
      { time: '12:00', description: 'Lunch break', category: 'Break' },
      { time: '13:00', description: 'System testing and debugging', category: 'Testing' },
      { time: '16:00', description: 'Documentation and handover prep', category: 'Documentation' }
    ],
    expenses: {
      mileage: 45,
      meals: 15,
      equipment: 0,
      other: 0
    }
  },
  {
    date: '2025-01-14',
    client: 'Ford Motor Company',
    project: 'Paint Shop Upgrade',
    site: 'Ford Rouge Complex - Dearborn',
    clockIn: '06:45:12',
    clockOut: '15:30:22',
    breakTime: 30,
    totalHours: 8.25,
    regularHours: 8,
    overtimeHours: 0.25,
    doubleTimeHours: 0,
    status: 'approved',
    trustScore: 95,
    sopCompliance: {
      followed: ['Early shift protocol', 'Chemical safety training', 'Confined space permit'],
      violated: ['Late tool return'],
      percentage: 85
    },
    activities: [
      { time: '07:00', description: 'Confined space entry briefing', category: 'Safety' },
      { time: '07:30', description: 'Paint booth sensor calibration', category: 'Maintenance' },
      { time: '11:30', description: 'Lunch break', category: 'Break' },
      { time: '12:00', description: 'HMI interface updates', category: 'Programming' },
      { time: '15:00', description: 'System validation and sign-off', category: 'Testing' }
    ],
    expenses: {
      mileage: 38,
      meals: 12,
      equipment: 75,
      other: 0
    }
  },
  {
    date: '2025-01-13',
    client: 'General Motors',
    project: 'Quality Control System',
    site: 'GM Lansing Grand River',
    clockIn: '08:15:05',
    clockOut: '18:45:30',
    breakTime: 60,
    totalHours: 9.5,
    regularHours: 8,
    overtimeHours: 1.5,
    doubleTimeHours: 0,
    status: 'pending',
    trustScore: 92,
    sopCompliance: {
      followed: ['Safety gear', 'Badge-in', 'Supervisor check-in'],
      violated: ['Missed afternoon safety briefing'],
      percentage: 75
    },
    activities: [
      { time: '08:30', description: 'Vision system setup', category: 'Installation' },
      { time: '10:00', description: 'Camera calibration', category: 'Calibration' },
      { time: '12:00', description: 'Lunch break', category: 'Break' },
      { time: '13:00', description: 'Software integration', category: 'Programming' },
      { time: '17:00', description: 'Emergency troubleshooting', category: 'Support' }
    ],
    expenses: {
      mileage: 120,
      meals: 18,
      equipment: 0,
      other: 25
    }
  }
]

const clientSOPs: ClientSOP[] = [
  {
    client: 'General Motors',
    requirements: {
      safetyGear: ['Hard hat', 'Safety glasses', 'Steel-toe boots', 'Hi-vis vest'],
      checkInProcess: 'Badge at main gate, secondary badge at building, supervisor sign-in',
      breakPolicy: '30 min lunch, two 15 min breaks',
      overtimePolicy: 'Pre-approval required, 1.5x after 8hrs, 2x after 12hrs',
      reportingStructure: 'Direct report to shift supervisor, daily standup at 8am',
      emergencyProtocol: 'Code Red: Evacuation, Code Blue: Medical, Code Yellow: Chemical'
    },
    restrictions: ['No phones on floor', 'No photography', 'Escort required in certain areas'],
    certifications: ['GM Safety Certified', 'OSHA 10', 'Arc Flash Training']
  },
  {
    client: 'Ford Motor Company',
    requirements: {
      safetyGear: ['Bump cap', 'Safety glasses', 'Safety shoes', 'Ford uniform'],
      checkInProcess: 'Main gate registration, tool crib check-in, area supervisor notification',
      breakPolicy: '30 min lunch, one 15 min break per 4 hours',
      overtimePolicy: 'Supervisor approval, 1.5x after 40hrs/week',
      reportingStructure: 'Report to area lead, attend shift change meeting',
      emergencyProtocol: 'Plant-wide alarm system, designated assembly points'
    },
    restrictions: ['Background check required', 'Drug testing', 'No personal tools'],
    certifications: ['Ford Safety Orientation', 'Confined Space', 'Lock Out Tag Out']
  }
]

const mockEmployeeStats: EmployeeStats = {
  totalHoursThisWeek: 42.5,
  totalHoursThisMonth: 176.25,
  averageHoursPerDay: 8.8,
  overtimeHoursThisMonth: 12.5,
  clientBreakdown: [
    { client: 'General Motors', hours: 98, percentage: 55, revenue: 12250 },
    { client: 'Ford Motor Company', hours: 62, percentage: 35, revenue: 7750 },
    { client: 'Stellantis', hours: 16.25, percentage: 10, revenue: 2031 }
  ],
  sopComplianceRate: 92,
  averageTrustScore: 95,
  punctualityRate: 98
}

interface EmployeeDetailModalProps {
  employee: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmployeeDetailModal({ employee, isOpen, onClose }: EmployeeDetailModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTab, setSelectedTab] = useState<'daily' | 'weekly' | 'sop' | 'stats'>('daily')
  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [isClockingIn, setIsClockingIn] = useState(false)
  const [isClockingOut, setIsClockingOut] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState({
    biometric: false,
    location: false,
    device: false
  })
  const [clockInTime, setClockInTime] = useState<Date | null>(null)

  const filteredEntries = selectedClient === 'all' 
    ? mockDailyEntries 
    : mockDailyEntries.filter(entry => entry.client === selectedClient)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'review': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-yellow-400'
    if (score >= 60) return 'text-orange-400'
    return 'text-red-400'
  }

  const performTrustVerification = async () => {
    // Simulate 3-layer trust verification
    const steps = [
      { key: 'biometric', delay: 1000, name: 'Biometric Authentication' },
      { key: 'location', delay: 1500, name: 'Location Verification' },
      { key: 'device', delay: 1000, name: 'Device Trust Check' }
    ]

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay))
      setVerificationStatus(prev => ({ ...prev, [step.key]: true }))
    }
    
    return true
  }

  const handleClockIn = async () => {
    setIsClockingIn(true)
    setVerificationStatus({ biometric: false, location: false, device: false })
    
    const verified = await performTrustVerification()
    
    if (verified) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsClockedIn(true)
      setClockInTime(new Date())
    }
    
    setIsClockingIn(false)
  }

  const handleClockOut = async () => {
    setIsClockingOut(true)
    setVerificationStatus({ biometric: false, location: false, device: false })
    
    const verified = await performTrustVerification()
    
    if (verified) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsClockedIn(false)
      setClockInTime(null)
      setVerificationStatus({ biometric: false, location: false, device: false })
    }
    
    setIsClockingOut(false)
  }

  if (!employee) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 lg:inset-8 bg-slate-900 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-700/50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 border-b border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                    {employee.employee.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{employee.employee}</h2>
                    <p className="text-slate-400">{employee.role} • ID: {mockEmployeeDetail.employeeId}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-slate-500">
                        <User className="h-4 w-4 inline mr-1" />
                        Reports to: {mockEmployeeDetail.supervisor}
                      </span>
                      <span className="text-sm text-slate-500">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Started: {new Date(mockEmployeeDetail.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              {/* Clock In/Out Section with 3-Layer Trust */}
              <div className="mt-6 space-y-4">
                {/* Clock In/Out Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  {!isClockedIn ? (
                    <button
                      onClick={handleClockIn}
                      disabled={isClockingIn}
                      className="col-span-2 py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                    >
                      {isClockingIn ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span>Verifying Trust Layers...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="h-6 w-6" />
                          <span>Clock In</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleClockOut}
                      disabled={isClockingOut}
                      className="col-span-2 py-4 px-6 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                    >
                      {isClockingOut ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span>Verifying Trust Layers...</span>
                        </>
                      ) : (
                        <>
                          <LogOut className="h-6 w-6" />
                          <span>Clock Out</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* 3-Layer Trust Verification Display */}
                {(isClockingIn || isClockingOut) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-3 gap-3"
                  >
                    {/* Biometric Verification */}
                    <div className={`p-3 rounded-lg border transition-all ${
                      verificationStatus.biometric 
                        ? 'bg-green-500/20 border-green-500/30' 
                        : 'bg-slate-800/50 border-slate-700/50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <Fingerprint className={`h-5 w-5 ${
                          verificationStatus.biometric ? 'text-green-400' : 'text-slate-400'
                        }`} />
                        {verificationStatus.biometric ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-white">Biometric</p>
                      <p className="text-xs text-slate-400">
                        {verificationStatus.biometric ? 'Verified' : 'Scanning...'}
                      </p>
                    </div>

                    {/* Location Verification */}
                    <div className={`p-3 rounded-lg border transition-all ${
                      verificationStatus.location 
                        ? 'bg-green-500/20 border-green-500/30' 
                        : 'bg-slate-800/50 border-slate-700/50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <Navigation className={`h-5 w-5 ${
                          verificationStatus.location ? 'text-green-400' : 'text-slate-400'
                        }`} />
                        {verificationStatus.location ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-white">Location</p>
                      <p className="text-xs text-slate-400">
                        {verificationStatus.location ? 'In Zone' : 'Checking...'}
                      </p>
                    </div>

                    {/* Device Trust */}
                    <div className={`p-3 rounded-lg border transition-all ${
                      verificationStatus.device 
                        ? 'bg-green-500/20 border-green-500/30' 
                        : 'bg-slate-800/50 border-slate-700/50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <Smartphone className={`h-5 w-5 ${
                          verificationStatus.device ? 'text-green-400' : 'text-slate-400'
                        }`} />
                        {verificationStatus.device ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-white">Device</p>
                      <p className="text-xs text-slate-400">
                        {verificationStatus.device ? 'Trusted' : 'Verifying...'}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Current Status */}
                {isClockedIn && clockInTime && !isClockingOut && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-green-400 animate-pulse" />
                        <span className="text-sm font-medium text-green-400">Currently Working</span>
                      </div>
                      <span className="text-sm text-white">
                        Since {clockInTime.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick Stats Bar */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-slate-800/50 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-bold text-white">{mockEmployeeStats.totalHoursThisWeek}h</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">This Week</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <Shield className="h-4 w-4 text-green-400" />
                      <span className={`text-sm font-bold ${getTrustScoreColor(mockEmployeeStats.averageTrustScore)}`}>
                        {mockEmployeeStats.averageTrustScore}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Trust Score</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <FileText className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-bold text-white">{mockEmployeeStats.sopComplianceRate}%</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">SOP</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <TrendingUp className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-bold text-white">{mockEmployeeStats.punctualityRate}%</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Punctuality</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center space-x-1 p-4 bg-slate-800/50 border-b border-slate-700">
              <button
                onClick={() => setSelectedTab('daily')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedTab === 'daily' 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                Daily Breakdown
              </button>
              <button
                onClick={() => setSelectedTab('weekly')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedTab === 'weekly' 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                Weekly Summary
              </button>
              <button
                onClick={() => setSelectedTab('sop')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedTab === 'sop' 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                SOP & Protocols
              </button>
              <button
                onClick={() => setSelectedTab('stats')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedTab === 'stats' 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                Analytics
              </button>

              {/* Client Filter */}
              <div className="ml-auto flex items-center space-x-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Clients</option>
                  <option value="General Motors">General Motors</option>
                  <option value="Ford Motor Company">Ford Motor Company</option>
                  <option value="Stellantis">Stellantis</option>
                </select>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedTab === 'daily' && (
                <div className="space-y-4">
                  {filteredEntries.map((entry, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6"
                    >
                      {/* Date Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {new Date(entry.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </h3>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-sm text-slate-400">
                                <Building className="h-4 w-4 inline mr-1" />
                                {entry.client}
                              </span>
                              <span className="text-sm text-slate-400">
                                <MapPin className="h-4 w-4 inline mr-1" />
                                {entry.site}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(entry.status)}`}>
                          {entry.status}
                        </span>
                      </div>

                      {/* Time Details */}
                      <div className="grid grid-cols-5 gap-4 mb-4">
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <p className="text-xs text-slate-500">Clock In</p>
                          <p className="text-sm font-medium text-white">{entry.clockIn}</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <p className="text-xs text-slate-500">Clock Out</p>
                          <p className="text-sm font-medium text-white">{entry.clockOut}</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <p className="text-xs text-slate-500">Total Hours</p>
                          <p className="text-sm font-medium text-white">{entry.totalHours}h</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <p className="text-xs text-slate-500">Overtime</p>
                          <p className="text-sm font-medium text-orange-400">{entry.overtimeHours}h</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <p className="text-xs text-slate-500">Trust Score</p>
                          <p className={`text-sm font-medium ${getTrustScoreColor(entry.trustScore)}`}>
                            {entry.trustScore}%
                          </p>
                        </div>
                      </div>

                      {/* Activities Timeline */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Activities</h4>
                        <div className="space-y-2">
                          {entry.activities.map((activity, i) => (
                            <div key={i} className="flex items-start space-x-3">
                              <span className="text-xs text-slate-500 mt-0.5">{activity.time}</span>
                              <div className="flex-1">
                                <p className="text-sm text-white">{activity.description}</p>
                                <span className="text-xs text-slate-400">{activity.category}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SOP Compliance */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-green-500/10 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-sm font-medium text-green-400">SOP Followed</span>
                          </div>
                          <ul className="space-y-1">
                            {entry.sopCompliance.followed.map((item, i) => (
                              <li key={i} className="text-xs text-slate-300">• {item}</li>
                            ))}
                          </ul>
                        </div>
                        {entry.sopCompliance.violated.length > 0 && (
                          <div className="bg-red-500/10 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-red-400" />
                              <span className="text-sm font-medium text-red-400">Violations</span>
                            </div>
                            <ul className="space-y-1">
                              {entry.sopCompliance.violated.map((item, i) => (
                                <li key={i} className="text-xs text-slate-300">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Expenses */}
                      {entry.expenses && (
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-slate-300 mb-2">Expenses</h4>
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-slate-500">Mileage</p>
                              <p className="text-sm font-medium text-white">${entry.expenses.mileage}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Meals</p>
                              <p className="text-sm font-medium text-white">${entry.expenses.meals}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Equipment</p>
                              <p className="text-sm font-medium text-white">${entry.expenses.equipment}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Other</p>
                              <p className="text-sm font-medium text-white">${entry.expenses.other}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {selectedTab === 'weekly' && (
                <div className="space-y-6">
                  {/* Weekly Overview */}
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Week of January 13-19, 2025</h3>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Clock className="h-5 w-5 text-blue-400" />
                          <span className="text-2xl font-bold text-white">42.5h</span>
                        </div>
                        <p className="text-sm text-slate-400">Total Hours</p>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Regular</span>
                            <span className="text-slate-300">40h</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Overtime</span>
                            <span className="text-orange-400">2.5h</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <DollarSign className="h-5 w-5 text-green-400" />
                          <span className="text-2xl font-bold text-white">$3,825</span>
                        </div>
                        <p className="text-sm text-slate-400">Gross Earnings</p>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Regular Pay</span>
                            <span className="text-slate-300">$3,600</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">OT Pay</span>
                            <span className="text-orange-400">$225</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Award className="h-5 w-5 text-purple-400" />
                          <span className="text-2xl font-bold text-white">95%</span>
                        </div>
                        <p className="text-sm text-slate-400">Performance</p>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Trust Score</span>
                            <span className="text-green-400">95%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">SOP Compliance</span>
                            <span className="text-green-400">92%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Daily Breakdown Chart */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-slate-300">Daily Hours by Client</h4>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => {
                        const clients = index % 2 === 0 ? 'General Motors' : 'Ford Motor Company'
                        const hours = 8 + Math.random() * 2
                        return (
                          <div key={day} className="flex items-center space-x-3">
                            <span className="text-sm text-slate-400 w-12">{day}</span>
                            <div className="flex-1 bg-slate-700 rounded-full h-6 relative overflow-hidden">
                              <div 
                                className={`absolute left-0 top-0 h-full ${
                                  clients === 'General Motors' ? 'bg-blue-500' : 'bg-green-500'
                                } flex items-center justify-center`}
                                style={{ width: `${(hours / 10) * 100}%` }}
                              >
                                <span className="text-xs text-white font-medium">{hours.toFixed(1)}h</span>
                              </div>
                            </div>
                            <span className="text-xs text-slate-400 w-32">{clients}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Client Breakdown */}
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Client Distribution</h3>
                    <div className="space-y-4">
                      {mockEmployeeStats.clientBreakdown.map((client, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`h-10 w-10 rounded-lg ${
                              index === 0 ? 'bg-blue-500/20' : index === 1 ? 'bg-green-500/20' : 'bg-purple-500/20'
                            } flex items-center justify-center`}>
                              <Building className={`h-5 w-5 ${
                                index === 0 ? 'text-blue-400' : index === 1 ? 'text-green-400' : 'text-purple-400'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-white">{client.client}</p>
                              <p className="text-xs text-slate-400">{client.hours} hours • {client.percentage}%</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-white">${client.revenue.toLocaleString()}</p>
                            <p className="text-xs text-slate-400">Revenue</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'sop' && (
                <div className="space-y-6">
                  {clientSOPs.map((sop, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6"
                    >
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Building className="h-5 w-5 mr-2 text-blue-400" />
                        {sop.client} - Standard Operating Procedures
                      </h3>

                      <div className="grid grid-cols-2 gap-6">
                        {/* Requirements */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-slate-300 mb-2">Safety Gear Required</h4>
                            <div className="flex flex-wrap gap-2">
                              {sop.requirements.safetyGear.map((gear, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-400">
                                  {gear}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-slate-300 mb-2">Check-In Process</h4>
                            <p className="text-sm text-slate-400">{sop.requirements.checkInProcess}</p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-slate-300 mb-2">Break Policy</h4>
                            <p className="text-sm text-slate-400">{sop.requirements.breakPolicy}</p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-slate-300 mb-2">Overtime Policy</h4>
                            <p className="text-sm text-slate-400">{sop.requirements.overtimePolicy}</p>
                          </div>
                        </div>

                        {/* Restrictions & Certifications */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-slate-300 mb-2">Restrictions</h4>
                            <ul className="space-y-1">
                              {sop.restrictions.map((restriction, i) => (
                                <li key={i} className="text-sm text-slate-400 flex items-start">
                                  <AlertCircle className="h-3 w-3 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                                  {restriction}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-slate-300 mb-2">Required Certifications</h4>
                            <div className="flex flex-wrap gap-2">
                              {sop.certifications.map((cert, i) => (
                                <span key={i} className="px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-400">
                                  <CheckCircle className="h-3 w-3 inline mr-1" />
                                  {cert}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-slate-300 mb-2">Emergency Protocol</h4>
                            <p className="text-sm text-slate-400">{sop.requirements.emergencyProtocol}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {selectedTab === 'stats' && (
                <div className="space-y-6">
                  {/* Performance Metrics */}
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Performance Analytics</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-3">Monthly Trends</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-400">Avg Hours/Day</span>
                              <span className="text-white font-medium">{mockEmployeeStats.averageHoursPerDay}h</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-400">Overtime Hours</span>
                              <span className="text-orange-400 font-medium">{mockEmployeeStats.overtimeHoursThisMonth}h</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-400">Trust Score</span>
                              <span className="text-green-400 font-medium">{mockEmployeeStats.averageTrustScore}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-400">SOP Compliance</span>
                              <span className="text-green-400 font-medium">{mockEmployeeStats.sopComplianceRate}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-3">Comparative Analysis</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                            <span className="text-sm text-slate-400">vs Team Average</span>
                            <span className="text-sm font-medium text-green-400">+12% Better</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                            <span className="text-sm text-slate-400">vs Last Month</span>
                            <span className="text-sm font-medium text-blue-400">+5% Improved</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                            <span className="text-sm text-slate-400">Revenue Generated</span>
                            <span className="text-sm font-medium text-white">$22,031</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                            <span className="text-sm text-slate-400">Client Satisfaction</span>
                            <span className="text-sm font-medium text-green-400">4.8/5.0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">AI Recommendations</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">Strong Performance</p>
                          <p className="text-xs text-slate-400">Consistently exceeding trust score and SOP compliance targets</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertCircle className="h-4 w-4 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">Consider Ford Certification</p>
                          <p className="text-xs text-slate-400">35% of hours at Ford - additional certification could increase efficiency</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Activity className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">Optimize Travel Routes</p>
                          <p className="text-xs text-slate-400">Could save 45 minutes daily by adjusting site visit schedule</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="bg-slate-800 border-t border-slate-700 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export Report</span>
                </button>
                <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Full Analytics</span>
                </button>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}