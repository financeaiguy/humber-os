'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, User, Clock, FileText, Shield, Globe, CheckCircle, AlertCircle, Loader2, Search, Filter } from 'lucide-react'
import { useSession } from '@/components/session-context'

interface OnboardingCandidate {
  id: string
  name: string
  email: string
  role: string
  status: 'vetting' | 'offer_letter' | 'legal' | 'immigration' | 'final_review' | 'completed'
  phase: number
  progress: number
  startDate: string
  lastUpdate: string
  assignedTo?: string
  location?: string
  documents?: {
    resume?: boolean
    offer?: boolean
    background?: boolean
    i9?: boolean
    visa?: boolean
  }
}

const statusConfig = {
  vetting: { label: 'Vetting', icon: Shield, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  offer_letter: { label: 'Offer Letter', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  legal: { label: 'Legal Review', icon: Shield, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  immigration: { label: 'Immigration', icon: Globe, color: 'text-green-400', bg: 'bg-green-400/10' },
  final_review: { label: 'Final Review', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
}

export function OnboardingTracker() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [candidates, setCandidates] = useState<OnboardingCandidate[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<OnboardingCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')

  // Determine user role and permissions
  const userRole = session?.user?.role
  const isEngineer = userRole === 'ENGINEER_EMPLOYEE'
  const isOperator = userRole === 'PARTNER_OPERATOR' || userRole === 'PARTNER_ADMIN'
  const isCustomer = userRole === 'CUSTOMER'

  useEffect(() => {
    fetchCandidates()
    // Set up real-time updates
    const interval = setInterval(fetchCandidates, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [session])

  useEffect(() => {
    // Filter candidates based on search and status
    let filtered = [...candidates]
    
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }
    
    // Role-based filtering
    if (isEngineer) {
      // Engineers only see their own onboarding
      filtered = filtered.filter(c => c.email === session?.user?.email)
    } else if (isCustomer) {
      // Customers see engineers assigned to them
      filtered = filtered.filter(c => c.assignedTo === session?.user?.organizationId)
    }
    
    setFilteredCandidates(filtered)
  }, [candidates, searchTerm, statusFilter, session, isEngineer, isCustomer])

  const fetchCandidates = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      if (searchTerm) {
        params.set('search', searchTerm)
      }

      const response = await fetch(`/api/onboarding/candidates?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch candidates')
      }

      const data = await response.json()
      setCandidates(data.candidates || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch candidates:', error)
      // Fallback to empty array on error
      setCandidates([])
      setLoading(false)
    }
  }

  const getStatusCounts = () => {
    const counts: Record<string, number> = {}
    candidates.forEach(c => {
      counts[c.status] = (counts[c.status] || 0) + 1
    })
    return counts
  }

  const statusCounts = getStatusCounts()

  if (isEngineer && filteredCandidates.length > 0) {
    // First-person view for engineers
    const myOnboarding = filteredCandidates[0]
    const StatusIcon = statusConfig[myOnboarding.status].icon
    
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-semibold text-white mb-6">Your Onboarding Progress</h2>
        
        {/* Progress Overview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Overall Progress</span>
            <span className="text-sm font-medium text-white">{myOnboarding.progress}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${myOnboarding.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Current Status */}
        <div className={`${statusConfig[myOnboarding.status].bg} rounded-lg p-4 mb-6`}>
          <div className="flex items-center gap-3">
            <StatusIcon className={`w-5 h-5 ${statusConfig[myOnboarding.status].color}`} />
            <div>
              <p className="text-white font-medium">Current Stage: {statusConfig[myOnboarding.status].label}</p>
              <p className="text-sm text-slate-400">Last updated: {myOnboarding.lastUpdate}</p>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-300 mb-2">Required Actions</h3>
          {myOnboarding.status === 'vetting' && (
            <div className="bg-slate-700/30 rounded-lg p-3 border border-yellow-500/20">
              <p className="text-sm text-slate-300">✓ Complete background check authorization</p>
            </div>
          )}
          {myOnboarding.status === 'offer_letter' && (
            <div className="bg-slate-700/30 rounded-lg p-3 border border-blue-500/20">
              <p className="text-sm text-slate-300">✓ Review and sign your offer letter</p>
            </div>
          )}
          {myOnboarding.status === 'legal' && (
            <div className="bg-slate-700/30 rounded-lg p-3 border border-purple-500/20">
              <p className="text-sm text-slate-300">✓ Complete employment agreements</p>
            </div>
          )}
          {myOnboarding.status === 'immigration' && (
            <div className="bg-slate-700/30 rounded-lg p-3 border border-green-500/20">
              <p className="text-sm text-slate-300">✓ Submit I-9 documentation</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-3">
          <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Continue Onboarding
          </button>
          <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            View Documents
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 hover:bg-slate-700/50 transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-blue-400" />
          <span className="text-white font-medium">Onboarding Pipeline</span>
          <div className="flex items-center gap-2">
            {Object.entries(statusCounts).slice(0, 3).map(([status, count]) => (
              <span key={status} className={`px-2 py-1 rounded-full text-xs ${statusConfig[status as keyof typeof statusConfig].bg} ${statusConfig[status as keyof typeof statusConfig].color}`}>
                {count} {statusConfig[status as keyof typeof statusConfig].label}
              </span>
            ))}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl z-50 max-h-[600px] overflow-hidden"
          >
            {/* Search and Filters */}
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex gap-3 mb-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
                <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`px-3 py-1 rounded ${viewMode === 'kanban' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Kanban
                  </button>
                </div>
              </div>

              {/* Status Summary */}
              <div className="flex gap-2 flex-wrap">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-full text-xs transition-all ${
                      statusFilter === status 
                        ? `${statusConfig[status as keyof typeof statusConfig].bg} ${statusConfig[status as keyof typeof statusConfig].color} ring-2 ring-offset-2 ring-offset-slate-800 ring-${status}-500`
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {count} {statusConfig[status as keyof typeof statusConfig].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidates List/Kanban */}
            <div className="overflow-y-auto max-h-[400px] p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No candidates found</p>
                </div>
              ) : viewMode === 'list' ? (
                <div className="space-y-3">
                  {filteredCandidates.map((candidate) => {
                    const StatusIcon = statusConfig[candidate.status].icon
                    return (
                      <motion.div
                        key={candidate.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-all cursor-pointer group"
                        onClick={() => {
                          // Navigate to candidate details or open modal
                          console.log('View candidate:', candidate.id)
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-white font-medium">{candidate.name}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${statusConfig[candidate.status].bg} ${statusConfig[candidate.status].color}`}>
                                {statusConfig[candidate.status].label}
                              </span>
                            </div>
                            <p className="text-sm text-slate-400 mb-1">{candidate.role}</p>
                            <p className="text-xs text-slate-500">{candidate.email} • {candidate.location}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-2">
                              <StatusIcon className={`w-4 h-4 ${statusConfig[candidate.status].color}`} />
                              <span className="text-sm text-slate-400">Phase {candidate.phase}/6</span>
                            </div>
                            <div className="w-24 bg-slate-600/50 rounded-full h-2 mb-1">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                style={{ width: `${candidate.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-500">{candidate.lastUpdate}</p>
                          </div>
                        </div>
                        
                        {/* Document Status */}
                        {candidate.documents && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-600/50">
                            {Object.entries(candidate.documents).map(([doc, completed]) => (
                              <span
                                key={doc}
                                className={`text-xs px-2 py-1 rounded ${
                                  completed 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-slate-600/50 text-slate-500'
                                }`}
                              >
                                {doc.replace('_', ' ').toUpperCase()}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                // Kanban View
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const statusCandidates = filteredCandidates.filter(c => c.status === status)
                    const Icon = config.icon
                    return (
                      <div key={status} className="flex-shrink-0 w-72">
                        <div className={`${config.bg} rounded-t-lg p-3 flex items-center gap-2`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          <span className={`font-medium ${config.color}`}>{config.label}</span>
                          <span className={`ml-auto px-2 py-0.5 rounded-full text-xs bg-slate-700/50 ${config.color}`}>
                            {statusCandidates.length}
                          </span>
                        </div>
                        <div className="bg-slate-700/20 rounded-b-lg p-2 min-h-[200px] space-y-2">
                          {statusCandidates.map((candidate) => (
                            <div
                              key={candidate.id}
                              className="bg-slate-800/50 rounded-lg p-3 hover:bg-slate-800/70 transition-all cursor-pointer"
                            >
                              <p className="text-white font-medium text-sm mb-1">{candidate.name}</p>
                              <p className="text-xs text-slate-400 mb-2">{candidate.role}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">{candidate.lastUpdate}</span>
                                <div className="w-16 bg-slate-600/50 rounded-full h-1.5">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                                    style={{ width: `${candidate.progress}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Actions Footer */}
            {isOperator && (
              <div className="p-4 border-t border-slate-700/50 flex justify-between items-center">
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Add New Candidate
                </button>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                    Export Report
                  </button>
                  <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                    Settings
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}