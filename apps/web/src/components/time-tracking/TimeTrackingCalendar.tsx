'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, ChevronLeft, ChevronRight, Clock, MapPin, User, 
  Shield, CheckCircle, AlertCircle, Edit3, Save, X, Plus,
  Eye, EyeOff, Settings, Filter, Download, Upload, Users,
  Building, Briefcase, Target, TrendingUp
} from 'lucide-react'
import { useSession } from '@/components/session-context'
import { hasPermission } from '@/lib/permissions'

interface TimeEntry {
  id: string
  date: string
  clockIn: string
  clockOut: string
  totalHours: number
  project: string
  client: string
  status: 'pending' | 'approved' | 'disputed' | 'rejected'
  trustScore: number
  location: string
  notes?: string
  employeeId: string
  employeeName: string
}

interface CalendarProps {
  userRole: 'engineer' | 'operator' | 'partner' | 'assistant' | 'employee'
  employeeId?: string
  isReadOnly?: boolean
}

export default function TimeTrackingCalendar({ userRole, employeeId, isReadOnly = false }: CalendarProps) {
  const { data: session } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Mock data for demonstration
  const mockTimeEntries: TimeEntry[] = [
    {
      id: 'entry_001',
      date: '2025-09-15',
      clockIn: '08:00',
      clockOut: '17:00',
      totalHours: 8.5,
      project: 'GM Assembly Line',
      client: 'General Motors',
      status: 'approved',
      trustScore: 95,
      location: 'Detroit, MI',
      notes: 'Regular shift, no issues',
      employeeId: 'emp_001',
      employeeName: 'John Smith'
    },
    {
      id: 'entry_002',
      date: '2025-09-14',
      clockIn: '08:15',
      clockOut: '16:45',
      totalHours: 8.0,
      project: 'Ford Paint Shop',
      client: 'Ford Motor Company',
      status: 'pending',
      trustScore: 88,
      location: 'Dearborn, MI',
      notes: 'Slight delay due to traffic',
      employeeId: 'emp_001',
      employeeName: 'John Smith'
    },
    {
      id: 'entry_003',
      date: '2025-09-13',
      clockIn: '07:45',
      clockOut: '18:30',
      totalHours: 10.25,
      project: 'Stellantis Automation',
      client: 'Stellantis',
      status: 'disputed',
      trustScore: 72,
      location: 'Auburn Hills, MI',
      notes: 'Overtime due to equipment issues',
      employeeId: 'emp_001',
      employeeName: 'John Smith'
    }
  ]

  useEffect(() => {
    // In production, fetch real data based on user role and permissions
    setTimeEntries(mockTimeEntries)
  }, [currentDate, employeeId])

  const canEdit = () => {
    switch (userRole) {
      case 'engineer':
        return hasPermission('PARTNER_ADMIN', 'canLogTime')
      case 'operator':
        return hasPermission('PARTNER_OPERATOR', 'canLogTime')
      case 'partner':
        return hasPermission('PARTNER_ADMIN', 'canManageProjects')
      case 'assistant':
        return hasPermission('PARTNER_OPERATOR', 'canViewAnalytics')
      case 'employee':
        return hasPermission('ENGINEER_EMPLOYEE', 'canLogTime')
      default:
        return false
    }
  }

  const canViewAll = () => {
    return ['engineer', 'operator', 'partner'].includes(userRole)
  }

  const canApprove = () => {
    return ['engineer', 'operator', 'partner'].includes(userRole)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getEntriesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return timeEntries.filter(entry => entry.date === dateStr)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'disputed': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-yellow-400'
    return 'text-red-400'
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDateClick = (date: Date | null) => {
    if (!date) return
    setSelectedDate(date)
    const entries = getEntriesForDate(date)
    if (entries.length > 0) {
      setEditingEntry(entries[0])
      setShowEntryModal(true)
    } else if (canEdit()) {
      // Create new entry
      setEditingEntry({
        id: '',
        date: date.toISOString().split('T')[0],
        clockIn: '',
        clockOut: '',
        totalHours: 0,
        project: '',
        client: '',
        status: 'pending',
        trustScore: 0,
        location: '',
        employeeId: employeeId || session?.user?.id || '',
        employeeName: session?.user?.name || 'Current User'
      })
      setShowEntryModal(true)
    }
  }

  const handleSaveEntry = () => {
    if (!editingEntry) return
    
    // In production, save to database via API
    if (editingEntry.id) {
      // Update existing entry
      setTimeEntries(prev => prev.map(entry => 
        entry.id === editingEntry.id ? editingEntry : entry
      ))
    } else {
      // Create new entry
      const newEntry = {
        ...editingEntry,
        id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      setTimeEntries(prev => [...prev, newEntry])
    }
    
    setShowEntryModal(false)
    setEditingEntry(null)
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Time Tracking Calendar
          </h2>
          <p className="text-slate-400">
            {userRole === 'employee' ? 'Your time entries and schedule' : 
             userRole === 'engineer' ? 'Manage engineer time entries' :
             userRole === 'operator' ? 'Operator time management' :
             userRole === 'partner' ? 'Partner time oversight' : 
             'Assistant time coordination'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-800 rounded-lg p-1">
            {['month', 'week', 'day'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <Filter className="h-5 w-5" />
          </button>

          {/* Role-specific actions */}
          {canEdit() && (
            <button
              onClick={() => {
                setEditingEntry({
                  id: '',
                  date: new Date().toISOString().split('T')[0],
                  clockIn: '',
                  clockOut: '',
                  totalHours: 0,
                  project: '',
                  client: '',
                  status: 'pending',
                  trustScore: 0,
                  location: '',
                  employeeId: employeeId || session?.user?.id || '',
                  employeeName: session?.user?.name || 'Current User'
                })
                setShowEntryModal(true)
              }}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="disputed">Disputed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            {canViewAll() && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Employee</label>
                <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                  <option value="all">All Employees</option>
                  <option value="emp_001">John Smith</option>
                  <option value="emp_002">Sarah Johnson</option>
                  <option value="emp_003">Mike Chen</option>
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Project</label>
              <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                <option value="all">All Projects</option>
                <option value="gm-assembly">GM Assembly Line</option>
                <option value="ford-paint">Ford Paint Shop</option>
                <option value="stellantis-auto">Stellantis Automation</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Trust Score</label>
              <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                <option value="all">All Scores</option>
                <option value="high">High (90%+)</option>
                <option value="medium">Medium (75-89%)</option>
                <option value="low">Low (<75%)</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-slate-400" />
        </button>
        
        <h3 className="text-xl font-semibold text-white">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-800/50 rounded-lg p-6">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-slate-400 font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {getDaysInMonth(currentDate).map((date, index) => {
            if (!date) {
              return <div key={index} className="h-24" />
            }

            const entries = getEntriesForDate(date)
            const hasEntries = entries.length > 0
            const isToday = date.toDateString() === new Date().toDateString()
            const isSelected = selectedDate?.toDateString() === date.toDateString()

            return (
              <motion.div
                key={date.toISOString()}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleDateClick(date)}
                className={`h-24 p-2 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10'
                    : isToday
                    ? 'border-green-500 bg-green-500/10'
                    : hasEntries
                    ? 'border-slate-600 bg-slate-700/30 hover:bg-slate-700/50'
                    : 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-green-400' : 'text-white'
                  }`}>
                    {date.getDate()}
                  </span>
                  {hasEntries && (
                    <div className="flex space-x-1">
                      {entries.slice(0, 2).map((entry) => (
                        <div
                          key={entry.id}
                          className={`w-2 h-2 rounded-full ${
                            entry.status === 'approved' ? 'bg-green-400' :
                            entry.status === 'pending' ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`}
                        />
                      ))}
                      {entries.length > 2 && (
                        <span className="text-xs text-slate-400">+{entries.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
                
                {hasEntries && (
                  <div className="space-y-1">
                    {entries.slice(0, 2).map((entry) => (
                      <div key={entry.id} className="text-xs text-slate-400 truncate">
                        {entry.totalHours}h - {entry.project}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Role-specific Action Panel */}
      <div className="bg-slate-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {userRole === 'employee' ? 'Your Actions' :
           userRole === 'engineer' ? 'Engineer Controls' :
           userRole === 'operator' ? 'Operator Dashboard' :
           userRole === 'partner' ? 'Partner Management' :
           'Assistant Tools'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Employee Actions */}
          {userRole === 'employee' && (
            <>
              <button className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/20 transition-all flex items-center space-x-3">
                <Clock className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Clock In/Out</div>
                  <div className="text-sm opacity-70">Track your time</div>
                </div>
              </button>
              <button className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all flex items-center space-x-3">
                <Calendar className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">View Schedule</div>
                  <div className="text-sm opacity-70">Your assignments</div>
                </div>
              </button>
              <button className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-all flex items-center space-x-3">
                <Download className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Export Data</div>
                  <div className="text-sm opacity-70">Download timesheet</div>
                </div>
              </button>
            </>
          )}

          {/* Engineer Actions */}
          {userRole === 'engineer' && (
            <>
              <button className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all flex items-center space-x-3">
                <Users className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Manage Team</div>
                  <div className="text-sm opacity-70">Engineer oversight</div>
                </div>
              </button>
              <button className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/20 transition-all flex items-center space-x-3">
                <CheckCircle className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Approve Time</div>
                  <div className="text-sm opacity-70">Review submissions</div>
                </div>
              </button>
              <button className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-500/20 transition-all flex items-center space-x-3">
                <TrendingUp className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Analytics</div>
                  <div className="text-sm opacity-70">Performance metrics</div>
                </div>
              </button>
            </>
          )}

          {/* Operator Actions */}
          {userRole === 'operator' && (
            <>
              <button className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-all flex items-center space-x-3">
                <Building className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Project Management</div>
                  <div className="text-sm opacity-70">Assign engineers</div>
                </div>
              </button>
              <button className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 hover:bg-orange-500/20 transition-all flex items-center space-x-3">
                <Shield className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Compliance</div>
                  <div className="text-sm opacity-70">Monitor adherence</div>
                </div>
              </button>
              <button className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all flex items-center space-x-3">
                <AlertCircle className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Disputes</div>
                  <div className="text-sm opacity-70">Resolve issues</div>
                </div>
              </button>
            </>
          )}

          {/* Partner Actions */}
          {userRole === 'partner' && (
            <>
              <button className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all flex items-center space-x-3">
                <Briefcase className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Client Relations</div>
                  <div className="text-sm opacity-70">Manage accounts</div>
                </div>
              </button>
              <button className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/20 transition-all flex items-center space-x-3">
                <Target className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Strategic Planning</div>
                  <div className="text-sm opacity-70">Resource allocation</div>
                </div>
              </button>
              <button className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-all flex items-center space-x-3">
                <TrendingUp className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Business Analytics</div>
                  <div className="text-sm opacity-70">Revenue insights</div>
                </div>
              </button>
            </>
          )}

          {/* Assistant Actions */}
          {userRole === 'assistant' && (
            <>
              <button className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-all flex items-center space-x-3">
                <Calendar className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Schedule Coordination</div>
                  <div className="text-sm opacity-70">Manage appointments</div>
                </div>
              </button>
              <button className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400 hover:bg-indigo-500/20 transition-all flex items-center space-x-3">
                <Upload className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Data Entry</div>
                  <div className="text-sm opacity-70">Input time records</div>
                </div>
              </button>
              <button className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg text-pink-400 hover:bg-pink-500/20 transition-all flex items-center space-x-3">
                <Eye className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Monitor Status</div>
                  <div className="text-sm opacity-70">Track progress</div>
                </div>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Time Entry Modal */}
      {showEntryModal && editingEntry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowEntryModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">
                {editingEntry.id ? 'Edit Time Entry' : 'New Time Entry'}
              </h3>
              <button
                onClick={() => setShowEntryModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={editingEntry.date}
                    onChange={(e) => setEditingEntry(prev => prev ? {...prev, date: e.target.value} : null)}
                    disabled={!canEdit() || isReadOnly}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Employee</label>
                  <input
                    type="text"
                    value={editingEntry.employeeName}
                    disabled
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white opacity-50"
                  />
                </div>
              </div>

              {/* Time Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Clock In</label>
                  <input
                    type="time"
                    value={editingEntry.clockIn}
                    onChange={(e) => setEditingEntry(prev => prev ? {...prev, clockIn: e.target.value} : null)}
                    disabled={!canEdit() || isReadOnly}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Clock Out</label>
                  <input
                    type="time"
                    value={editingEntry.clockOut}
                    onChange={(e) => setEditingEntry(prev => prev ? {...prev, clockOut: e.target.value} : null)}
                    disabled={!canEdit() || isReadOnly}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Total Hours</label>
                  <input
                    type="number"
                    step="0.25"
                    value={editingEntry.totalHours}
                    onChange={(e) => setEditingEntry(prev => prev ? {...prev, totalHours: parseFloat(e.target.value)} : null)}
                    disabled={!canEdit() || isReadOnly}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Project Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Project</label>
                  <select
                    value={editingEntry.project}
                    onChange={(e) => setEditingEntry(prev => prev ? {...prev, project: e.target.value} : null)}
                    disabled={!canEdit() || isReadOnly}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50"
                  >
                    <option value="">Select Project</option>
                    <option value="GM Assembly Line">GM Assembly Line</option>
                    <option value="Ford Paint Shop">Ford Paint Shop</option>
                    <option value="Stellantis Automation">Stellantis Automation</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Client</label>
                  <select
                    value={editingEntry.client}
                    onChange={(e) => setEditingEntry(prev => prev ? {...prev, client: e.target.value} : null)}
                    disabled={!canEdit() || isReadOnly}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50"
                  >
                    <option value="">Select Client</option>
                    <option value="General Motors">General Motors</option>
                    <option value="Ford Motor Company">Ford Motor Company</option>
                    <option value="Stellantis">Stellantis</option>
                  </select>
                </div>
              </div>

              {/* Status and Trust Score */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    value={editingEntry.status}
                    onChange={(e) => setEditingEntry(prev => prev ? {...prev, status: e.target.value as any} : null)}
                    disabled={!canApprove() || isReadOnly}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="disputed">Disputed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Trust Score</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editingEntry.trustScore}
                      onChange={(e) => setEditingEntry(prev => prev ? {...prev, trustScore: parseInt(e.target.value)} : null)}
                      disabled={!canEdit() || isReadOnly}
                      className="flex-1 disabled:opacity-50"
                    />
                    <span className={`font-medium ${getTrustScoreColor(editingEntry.trustScore)}`}>
                      {editingEntry.trustScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Location and Notes */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={editingEntry.location}
                    onChange={(e) => setEditingEntry(prev => prev ? {...prev, location: e.target.value} : null)}
                    disabled={!canEdit() || isReadOnly}
                    placeholder="Work site location"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                  <textarea
                    value={editingEntry.notes || ''}
                    onChange={(e) => setEditingEntry(prev => prev ? {...prev, notes: e.target.value} : null)}
                    disabled={!canEdit() || isReadOnly}
                    rows={3}
                    placeholder="Additional notes or comments"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-slate-700">
              <div className="text-sm text-slate-400">
                Role: {userRole} | {canEdit() ? 'Can Edit' : 'Read Only'}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEntryModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                
                {canEdit() && !isReadOnly && (
                  <button
                    onClick={handleSaveEntry}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Entry</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
