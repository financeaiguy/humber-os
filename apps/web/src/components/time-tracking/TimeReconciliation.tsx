'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, CheckCircle, XCircle, Clock, Building,
  FileText, Calculator, TrendingUp, AlertCircle, ChevronRight,
  Zap, Shield, DollarSign, User, Calendar, Download,
  MessageSquare, Mail, Phone, ArrowUpRight, ArrowDownRight,
  Info, CheckSquare, Square, BarChart3, Briefcase
} from 'lucide-react'

interface TimeDiscrepancy {
  id: string;
  date: string;
  employee: string;
  employeeId: string;
  client: string;
  project: string;
  
  // Employee reported times
  employeeClockIn: string;
  employeeClockOut: string;
  employeeTotalHours: number;
  employeeBreakTime: number;
  
  // Client reported times
  clientReportedStart: string;
  clientReportedEnd: string;
  clientReportedHours: number;
  clientReportedBreak: number;
  clientApprover: string;
  
  // Discrepancy details
  timeDifference: number; // in minutes
  discrepancyType: 'early_clock_in' | 'late_clock_out' | 'excessive_break' | 'missing_time' | 'overtime_dispute';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Resolution
  status: 'pending' | 'under_review' | 'resolved' | 'disputed' | 'auto_approved';
  resolution?: {
    adjustedHours: number;
    approvedBy: string;
    approvedAt: string;
    notes: string;
    financialImpact: number;
  };
  
  // Supporting data
  gpsData: {
    withinGeofence: boolean;
    distanceFromSite: number;
  };
  trustScore: number;
  historicalAccuracy: number; // Employee's historical accuracy rate
}

const mockDiscrepancies: TimeDiscrepancy[] = [
  {
    id: 'DISC-001',
    date: '2025-01-15',
    employee: 'Sarah Johnson',
    employeeId: 'HMB-2024-0342',
    client: 'General Motors',
    project: 'Assembly Line Automation',
    
    employeeClockIn: '07:58:23',
    employeeClockOut: '17:32:45',
    employeeTotalHours: 9.15,
    employeeBreakTime: 45,
    
    clientReportedStart: '08:00:00',
    clientReportedEnd: '17:00:00',
    clientReportedHours: 8.5,
    clientReportedBreak: 30,
    clientApprover: 'John Martinez (GM Supervisor)',
    
    timeDifference: 39, // 39 minutes difference
    discrepancyType: 'late_clock_out',
    severity: 'medium',
    
    status: 'pending',
    
    gpsData: {
      withinGeofence: true,
      distanceFromSite: 0
    },
    trustScore: 98,
    historicalAccuracy: 96
  },
  {
    id: 'DISC-002',
    date: '2025-01-14',
    employee: 'Michael Chen',
    employeeId: 'HMB-2024-0155',
    client: 'Ford Motor Company',
    project: 'Paint Shop Upgrade',
    
    employeeClockIn: '06:45:12',
    employeeClockOut: '15:30:22',
    employeeTotalHours: 8.25,
    employeeBreakTime: 30,
    
    clientReportedStart: '07:00:00',
    clientReportedEnd: '15:30:00',
    clientReportedHours: 8.0,
    clientReportedBreak: 30,
    clientApprover: 'Lisa Thompson (Ford Lead)',
    
    timeDifference: -15, // 15 minutes early clock in
    discrepancyType: 'early_clock_in',
    severity: 'low',
    
    status: 'auto_approved',
    resolution: {
      adjustedHours: 8.0,
      approvedBy: 'System Auto-Approval',
      approvedAt: '2025-01-14 18:00:00',
      notes: 'Within 5% threshold - auto-approved per policy',
      financialImpact: 0
    },
    
    gpsData: {
      withinGeofence: true,
      distanceFromSite: 0
    },
    trustScore: 92,
    historicalAccuracy: 94
  },
  {
    id: 'DISC-003',
    date: '2025-01-13',
    employee: 'Emily Rodriguez',
    employeeId: 'HMB-2024-0298',
    client: 'Stellantis',
    project: 'Quality Control System',
    
    employeeClockIn: '08:15:05',
    employeeClockOut: '18:45:30',
    employeeTotalHours: 10.5,
    employeeBreakTime: 60,
    
    clientReportedStart: '08:30:00',
    clientReportedEnd: '17:00:00',
    clientReportedHours: 8.0,
    clientReportedBreak: 30,
    clientApprover: 'Robert Kim (Stellantis Manager)',
    
    timeDifference: 135, // 2.25 hours difference
    discrepancyType: 'overtime_dispute',
    severity: 'high',
    
    status: 'under_review',
    
    gpsData: {
      withinGeofence: false,
      distanceFromSite: 2.5
    },
    trustScore: 75,
    historicalAccuracy: 88
  },
  {
    id: 'DISC-004',
    date: '2025-01-12',
    employee: 'David Kim',
    employeeId: 'HMB-2024-0412',
    client: 'General Motors',
    project: 'Robotic Welding Calibration',
    
    employeeClockIn: '09:00:00',
    employeeClockOut: '14:00:00',
    employeeTotalHours: 5.0,
    employeeBreakTime: 0,
    
    clientReportedStart: '09:00:00',
    clientReportedEnd: '17:00:00',
    clientReportedHours: 8.0,
    clientReportedBreak: 30,
    clientApprover: 'Sarah Williams (GM Lead)',
    
    timeDifference: -180, // 3 hours missing
    discrepancyType: 'missing_time',
    severity: 'critical',
    
    status: 'disputed',
    
    gpsData: {
      withinGeofence: true,
      distanceFromSite: 0
    },
    trustScore: 85,
    historicalAccuracy: 91
  }
]

// Reconciliation thresholds
const thresholds = {
  autoApprove: {
    percentage: 5, // Within 5% auto-approve
    minutes: 15, // Within 15 minutes auto-approve
  },
  review: {
    percentage: 10, // 5-10% needs review
    minutes: 30, // 15-30 minutes needs review
  },
  escalate: {
    percentage: 15, // Above 15% escalate
    minutes: 60, // Above 60 minutes escalate
  }
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30'
    case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
    case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
    case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30'
    default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'auto_approved': return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'resolved': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'under_review': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    case 'disputed': return 'bg-red-500/20 text-red-400 border-red-500/30'
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

const formatTimeDifference = (minutes: number) => {
  const absMinutes = Math.abs(minutes)
  const hours = Math.floor(absMinutes / 60)
  const mins = absMinutes % 60
  const sign = minutes < 0 ? '-' : '+'
  
  if (hours > 0) {
    return `${sign}${hours}h ${mins}m`
  }
  return `${sign}${mins}m`
}

interface TimeReconciliationProps {
  selectedDate?: Date;
  selectedClient?: string;
}

export default function TimeReconciliation({ selectedDate, selectedClient }: TimeReconciliationProps) {
  const [selectedDiscrepancies, setSelectedDiscrepancies] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const filteredDiscrepancies = mockDiscrepancies.filter(d => {
    if (filterStatus !== 'all' && d.status !== filterStatus) return false
    if (filterSeverity !== 'all' && d.severity !== filterSeverity) return false
    if (selectedClient && d.client !== selectedClient) return false
    return true
  })

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedDiscrepancies)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedDiscrepancies(newSelection)
  }

  const calculateFinancialImpact = (discrepancy: TimeDiscrepancy) => {
    const hourlyRate = 90 // Average hourly rate
    const hoursDiff = Math.abs(discrepancy.timeDifference) / 60
    return hoursDiff * hourlyRate
  }

  // Summary statistics
  const stats = {
    total: filteredDiscrepancies.length,
    pending: filteredDiscrepancies.filter(d => d.status === 'pending').length,
    underReview: filteredDiscrepancies.filter(d => d.status === 'under_review').length,
    disputed: filteredDiscrepancies.filter(d => d.status === 'disputed').length,
    resolved: filteredDiscrepancies.filter(d => d.status === 'resolved' || d.status === 'auto_approved').length,
    totalFinancialImpact: filteredDiscrepancies.reduce((sum, d) => sum + calculateFinancialImpact(d), 0),
    totalHoursDifference: filteredDiscrepancies.reduce((sum, d) => sum + Math.abs(d.timeDifference), 0) / 60
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Time Reconciliation</h2>
          <p className="text-slate-400 mt-1">Match employee clock times with client-reported hours</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Bulk Reconcile</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Total</p>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
            <FileText className="h-5 w-5 text-slate-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Pending</p>
              <p className="text-xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <Clock className="h-5 w-5 text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Review</p>
              <p className="text-xl font-bold text-orange-400">{stats.underReview}</p>
            </div>
            <AlertCircle className="h-5 w-5 text-orange-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Disputed</p>
              <p className="text-xl font-bold text-red-400">{stats.disputed}</p>
            </div>
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Hours Diff</p>
              <p className="text-xl font-bold text-purple-400">{stats.totalHoursDifference.toFixed(1)}h</p>
            </div>
            <TrendingUp className="h-5 w-5 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Impact</p>
              <p className="text-xl font-bold text-white">${Math.round(stats.totalFinancialImpact)}</p>
            </div>
            <DollarSign className="h-5 w-5 text-green-400" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="disputed">Disputed</option>
          <option value="resolved">Resolved</option>
          <option value="auto_approved">Auto-Approved</option>
        </select>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        {selectedDiscrepancies.size > 0 && (
          <div className="flex items-center space-x-2 ml-auto">
            <span className="text-sm text-slate-400">{selectedDiscrepancies.size} selected</span>
            <button className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm">
              Approve Selected
            </button>
            <button className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm">
              Reject Selected
            </button>
          </div>
        )}
      </div>

      {/* Reconciliation Thresholds Info */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-slate-700/50 p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white mb-2">Automatic Reconciliation Rules</h3>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-slate-300">≤5% or 15min: Auto-approve</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <span className="text-slate-300">5-10% or 15-30min: Review required</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-slate-300">&gt;10% or 30min: Manager escalation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discrepancies List */}
      <div className="space-y-4">
        {filteredDiscrepancies.map((discrepancy, index) => (
          <motion.div
            key={discrepancy.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden"
          >
            {/* Main Row */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSelection(discrepancy.id)}
                    className="mt-1"
                  >
                    {selectedDiscrepancies.has(discrepancy.id) ? (
                      <CheckSquare className="h-5 w-5 text-blue-400" />
                    ) : (
                      <Square className="h-5 w-5 text-slate-500" />
                    )}
                  </button>

                  {/* Employee Info */}
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-white">{discrepancy.employee}</h3>
                      <span className="text-xs text-slate-500">{discrepancy.employeeId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(discrepancy.status)}`}>
                        {discrepancy.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(discrepancy.severity)}`}>
                        {discrepancy.severity}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(discrepancy.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {discrepancy.client}
                      </span>
                      <span className="flex items-center">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {discrepancy.project}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Time Difference */}
                <div className="text-right">
                  <div className={`text-2xl font-bold ${discrepancy.timeDifference > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {formatTimeDifference(discrepancy.timeDifference)}
                  </div>
                  <p className="text-xs text-slate-500">Time Difference</p>
                  <p className="text-sm text-yellow-400 mt-1">${calculateFinancialImpact(discrepancy).toFixed(2)}</p>
                </div>
              </div>

              {/* Time Comparison */}
              <div className="grid grid-cols-2 gap-6 mt-6">
                {/* Employee Reported */}
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-white flex items-center">
                      <User className="h-4 w-4 mr-2 text-blue-400" />
                      Employee Reported
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-green-400">{discrepancy.trustScore}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Clock In:</span>
                      <span className="text-white font-medium">{discrepancy.employeeClockIn}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Clock Out:</span>
                      <span className="text-white font-medium">{discrepancy.employeeClockOut}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Hours:</span>
                      <span className="text-white font-medium">{discrepancy.employeeTotalHours}h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Break Time:</span>
                      <span className="text-white font-medium">{discrepancy.employeeBreakTime}m</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">GPS Status:</span>
                      <span className={discrepancy.gpsData.withinGeofence ? 'text-green-400' : 'text-red-400'}>
                        {discrepancy.gpsData.withinGeofence ? 'Within Zone' : `${discrepancy.gpsData.distanceFromSite}km away`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-slate-500">Historical Accuracy:</span>
                      <span className="text-slate-300">{discrepancy.historicalAccuracy}%</span>
                    </div>
                  </div>
                </div>

                {/* Client Reported */}
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-white flex items-center">
                      <Building className="h-4 w-4 mr-2 text-purple-400" />
                      Client Reported
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Start Time:</span>
                      <span className="text-white font-medium">{discrepancy.clientReportedStart}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">End Time:</span>
                      <span className="text-white font-medium">{discrepancy.clientReportedEnd}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Hours:</span>
                      <span className="text-white font-medium">{discrepancy.clientReportedHours}h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Break Time:</span>
                      <span className="text-white font-medium">{discrepancy.clientReportedBreak}m</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Approved By:</span>
                      <span className="text-slate-300">{discrepancy.clientApprover}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolution Actions */}
              {discrepancy.status === 'pending' || discrepancy.status === 'under_review' ? (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
                  <div className="flex items-center space-x-3">
                    <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Accept Employee Time</span>
                    </button>
                    <button className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>Accept Client Time</span>
                    </button>
                    <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center space-x-2">
                      <Calculator className="h-4 w-4" />
                      <span>Adjust Manually</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                      <MessageSquare className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                      <Mail className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                      <Phone className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : discrepancy.resolution ? (
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <div className="bg-green-500/10 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-green-400 mb-2">Resolution Details</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400">Adjusted Hours:</span>
                            <span className="text-white font-medium">{discrepancy.resolution.adjustedHours}h</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400">Approved By:</span>
                            <span className="text-white">{discrepancy.resolution.approvedBy}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400">Notes:</span>
                            <span className="text-slate-300">{discrepancy.resolution.notes}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Resolved At</p>
                        <p className="text-sm text-white">{new Date(discrepancy.resolution.approvedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Visual Time Comparison Bar */}
            <div className="bg-slate-900/50 p-4 border-t border-slate-700">
              <div className="relative h-8">
                {/* Base timeline */}
                <div className="absolute inset-0 bg-slate-700 rounded-full"></div>
                
                {/* Employee time */}
                <div 
                  className="absolute top-0 h-4 bg-blue-500 rounded-full opacity-75"
                  style={{
                    left: '10%',
                    width: `${(discrepancy.employeeTotalHours / 12) * 80}%`
                  }}
                ></div>
                
                {/* Client time */}
                <div 
                  className="absolute bottom-0 h-4 bg-purple-500 rounded-full opacity-75"
                  style={{
                    left: '10%',
                    width: `${(discrepancy.clientReportedHours / 12) * 80}%`
                  }}
                ></div>

                {/* Time markers */}
                <div className="absolute top-full mt-1 left-[10%] text-xs text-slate-500">7:00</div>
                <div className="absolute top-full mt-1 left-[50%] text-xs text-slate-500">12:00</div>
                <div className="absolute top-full mt-1 left-[90%] text-xs text-slate-500">19:00</div>
              </div>
              <div className="flex items-center justify-center space-x-6 mt-6">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-slate-400">Employee Time</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                  <span className="text-xs text-slate-400">Client Time</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Actions */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Reconciliation Summary</h3>
            <p className="text-sm text-slate-400">
              Total financial impact: <span className="text-yellow-400 font-medium">${stats.totalFinancialImpact.toFixed(2)}</span>
              {' '}across <span className="text-white font-medium">{stats.totalHoursDifference.toFixed(1)}</span> hours of discrepancies
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>View Analytics</span>
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Run Auto-Reconciliation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}