'use client'

import { motion } from 'framer-motion'
import { 
  Clock, 
  Calendar, 
  Play,
  Pause,
  Square,
  Plus,
  Filter,
  Download,
  CheckCircle,
  AlertCircle,
  Timer
} from 'lucide-react'
import { useState } from 'react'

const timeEntries = [
  {
    id: 1,
    project: 'GM Assembly Line Automation',
    client: 'General Motors',
    date: '2025-01-15',
    startTime: '08:00',
    endTime: '17:00',
    totalHours: 8.5,
    overtimeHours: 0.5,
    status: 'submitted',
    description: 'PLC programming for conveyor system integration',
    engineer: 'Sarah Johnson'
  },
  {
    id: 2,
    project: 'Ford Paint Shop Upgrade',
    client: 'Ford Motor Company', 
    date: '2025-01-15',
    startTime: '09:00',
    endTime: '18:00',
    totalHours: 8.0,
    overtimeHours: 0,
    status: 'approved',
    description: 'HMI interface development and testing',
    engineer: 'Emily Rodriguez'
  },
  {
    id: 3,
    project: 'HIROTEC Welding System',
    client: 'HIROTEC America',
    date: '2025-01-14',
    startTime: '07:30',
    endTime: '16:30',
    totalHours: 8.0,
    overtimeHours: 0,
    status: 'draft',
    description: 'Robotic welding calibration and testing',
    engineer: 'Michael Chen'
  },
  {
    id: 4,
    project: 'GM Assembly Line Automation',
    client: 'General Motors',
    date: '2025-01-14',
    startTime: '08:00',
    endTime: '19:00',
    totalHours: 10.0,
    overtimeHours: 2.0,
    status: 'reconciling',
    description: 'Emergency troubleshooting and system recovery',
    engineer: 'David Kim'
  },
  {
    id: 5,
    project: 'Stellantis Quality Control',
    client: 'Stellantis',
    date: '2025-01-13',
    startTime: '09:00',
    endTime: '17:30',
    totalHours: 8.0,
    overtimeHours: 0,
    status: 'paid',
    description: 'Vision system configuration and calibration',
    engineer: 'Lisa Thompson'
  }
]

const weeklyStats = {
  totalHours: 42.5,
  regularHours: 40.0,
  overtimeHours: 2.5,
  billableHours: 42.5,
  utilization: 85.0
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return 'bg-green-500/20 text-green-400'
    case 'approved': return 'bg-blue-500/20 text-blue-400'
    case 'submitted': return 'bg-yellow-500/20 text-yellow-400'
    case 'reconciling': return 'bg-orange-500/20 text-orange-400'
    case 'draft': return 'bg-gray-500/20 text-gray-400'
    default: return 'bg-slate-500/20 text-slate-400'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'paid': return <CheckCircle className="h-4 w-4" />
    case 'approved': return <CheckCircle className="h-4 w-4" />
    case 'submitted': return <Clock className="h-4 w-4" />
    case 'reconciling': return <AlertCircle className="h-4 w-4" />
    case 'draft': return <Timer className="h-4 w-4" />
    default: return <Clock className="h-4 w-4" />
  }
}

export default function TimeTrackingPage() {
  const [isTracking, setIsTracking] = useState(false)
  const [currentProject, setCurrentProject] = useState('')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Time Tracking
        </h1>
        <p className="text-slate-400">
          Track time, manage timesheets, and monitor billable hours.
        </p>
      </div>

      {/* Time Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Current Session</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={currentProject}
              onChange={(e) => setCurrentProject(e.target.value)}
              className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              disabled={isTracking}
            >
              <option value="">Select Project</option>
              <option value="gm-assembly">GM Assembly Line Automation</option>
              <option value="ford-paint">Ford Paint Shop Upgrade</option>
              <option value="stellantis-qc">Stellantis Quality Control</option>
              <option value="hirotec-welding">HIROTEC Welding System</option>
            </select>
            
            {isTracking && (
              <div className="flex items-center space-x-2 text-green-400">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-medium">Tracking: 02:34:15</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {!isTracking ? (
              <button
                onClick={() => setIsTracking(true)}
                disabled={!currentProject}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-4 w-4" />
                <span>Start</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsTracking(false)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
                >
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </button>
                <button
                  onClick={() => setIsTracking(false)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300"
                >
                  <Square className="h-4 w-4" />
                  <span>Stop</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Hours</p>
              <p className="text-2xl font-bold text-white mt-1">{weeklyStats.totalHours}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Regular</p>
              <p className="text-2xl font-bold text-white mt-1">{weeklyStats.regularHours}</p>
            </div>
            <Timer className="h-8 w-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Overtime</p>
              <p className="text-2xl font-bold text-white mt-1">{weeklyStats.overtimeHours}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Billable</p>
              <p className="text-2xl font-bold text-white mt-1">{weeklyStats.billableHours}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Utilization</p>
              <p className="text-2xl font-bold text-white mt-1">{weeklyStats.utilization}%</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-white"></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Time Entries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Time Entries</h2>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {timeEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900/50 rounded-xl p-4 hover:bg-slate-900/70 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-white">{entry.project}</h3>
                    <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                      {getStatusIcon(entry.status)}
                      <span>{entry.status}</span>
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-1">{entry.client}</p>
                  <p className="text-sm text-slate-300">{entry.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Date</p>
                  <p className="text-white font-medium">{entry.date}</p>
                </div>
                <div>
                  <p className="text-slate-400">Time</p>
                  <p className="text-white font-medium">{entry.startTime} - {entry.endTime}</p>
                </div>
                <div>
                  <p className="text-slate-400">Regular Hours</p>
                  <p className="text-white font-medium">{entry.totalHours - entry.overtimeHours}</p>
                </div>
                <div>
                  <p className="text-slate-400">Overtime</p>
                  <p className="text-white font-medium">{entry.overtimeHours}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex justify-center"
      >
        <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300">
          <Plus className="h-5 w-5" />
          <span>Add Manual Entry</span>
        </button>
      </motion.div>
    </div>
  )
}