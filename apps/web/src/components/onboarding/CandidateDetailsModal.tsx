'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, User, MapPin, Calendar, Clock, FileText, Shield, Globe, 
  CheckCircle, AlertCircle, Edit, Save, Upload, Download,
  MessageCircle, Phone, Mail, Building, Star
} from 'lucide-react'
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
  recruiter?: string
  priority?: 'high' | 'medium' | 'normal'
  estimatedCompletion?: string
  notes?: string
}

interface CandidateDetailsModalProps {
  candidate: OnboardingCandidate | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (candidateId: string, updates: Partial<OnboardingCandidate>) => Promise<void>
}

const statusConfig = {
  vetting: { label: 'Vetting', icon: Shield, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  offer_letter: { label: 'Offer Letter', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  legal: { label: 'Legal Review', icon: Shield, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  immigration: { label: 'Immigration', icon: Globe, color: 'text-green-400', bg: 'bg-green-400/10' },
  final_review: { label: 'Final Review', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
}

const documentLabels = {
  resume: 'Resume',
  offer: 'Offer Letter',
  background: 'Background Check',
  i9: 'I-9 Form',
  visa: 'Visa Documentation'
}

export function CandidateDetailsModal({ candidate, isOpen, onClose, onUpdate }: CandidateDetailsModalProps) {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [editedCandidate, setEditedCandidate] = useState<Partial<OnboardingCandidate>>({})
  const [loading, setLoading] = useState(false)

  if (!candidate) return null

  const userRole = session?.user?.role
  const isEngineer = userRole === 'ENGINEER_EMPLOYEE'
  const canEdit = !isEngineer || candidate.email === session?.user?.email

  const StatusIcon = statusConfig[candidate.status].icon
  const priorityColor = {
    high: 'text-red-400',
    medium: 'text-yellow-400',
    normal: 'text-green-400'
  }[candidate.priority || 'normal']

  const handleEdit = () => {
    setEditedCandidate({ ...candidate })
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!candidate?.id) return

    setLoading(true)
    try {
      await onUpdate(candidate.id, editedCandidate)
      setIsEditing(false)
      setEditedCandidate({})
    } catch (error) {
      // SECURITY: console statement removed: console.error('Failed to update candidate:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedCandidate({})
  }

  const handleDocumentToggle = (docType: keyof typeof documentLabels) => {
    setEditedCandidate(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: !prev.documents?.[docType]
      }
    }))
  }

  const getNextStatus = (currentStatus: string) => {
    const statusOrder = ['vetting', 'offer_letter', 'legal', 'immigration', 'final_review', 'completed']
    const currentIndex = statusOrder.indexOf(currentStatus)
    return statusOrder[currentIndex + 1] || currentStatus
  }

  const canAdvanceStatus = () => {
    return canEdit && candidate.status !== 'completed'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{candidate.name}</h2>
                  <p className="text-slate-400">{candidate.role}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${statusConfig[candidate.status].bg} ${statusConfig[candidate.status].color}`}>
                  <StatusIcon className="w-4 h-4 inline mr-1" />
                  {statusConfig[candidate.status].label}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {canEdit && !isEditing && (
                  <button
                    onClick={handleEdit}
                    className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                )}
                
                {isEditing && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Progress Overview */}
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-white">Onboarding Progress</h3>
                      <span className="text-sm text-slate-400">Phase {candidate.phase}/6</span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Overall Progress</span>
                        <span className="text-sm font-medium text-white">{candidate.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-600/50 rounded-full h-3">
                        <motion.div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {canAdvanceStatus() && (
                      <button
                        onClick={() => {
                          const nextStatus = getNextStatus(candidate.status)
                          onUpdate(candidate.id, { status: nextStatus as any })
                        }}
                        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Advance to {statusConfig[getNextStatus(candidate.status) as keyof typeof statusConfig]?.label}
                      </button>
                    )}
                  </div>

                  {/* Documents */}
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-4">Required Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(documentLabels).map(([key, label]) => {
                        const isCompleted = isEditing 
                          ? editedCandidate.documents?.[key as keyof typeof documentLabels] 
                          : candidate.documents?.[key as keyof typeof documentLabels]
                        
                        return (
                          <div
                            key={key}
                            className={`flex items-center justify-between p-3 rounded-lg border ${ 
                              isCompleted 
                                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                                : 'bg-slate-600/30 border-slate-600/50 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isCompleted ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <AlertCircle className="w-4 h-4" />
                              )}
                              <span className="text-sm font-medium">{label}</span>
                            </div>
                            
                            {isEditing && canEdit && (
                              <button
                                onClick={() => handleDocumentToggle(key as keyof typeof documentLabels)}
                                className={`px-2 py-1 text-xs rounded transition-colors ${
                                  isCompleted 
                                    ? 'bg-green-500/30 text-green-300 hover:bg-green-500/40'
                                    : 'bg-slate-500/30 text-slate-300 hover:bg-slate-500/40'
                                }`}
                              >
                                {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                              </button>
                            )}
                            
                            {!isEditing && (
                              <div className="flex gap-1">
                                <button className="p-1 text-slate-400 hover:text-white transition-colors">
                                  <Upload className="w-3 h-3" />
                                </button>
                                <button className="p-1 text-slate-400 hover:text-white transition-colors">
                                  <Download className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}\n                    </div>
                  </div>

                  {/* Notes */}
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-3">Notes</h3>
                    {isEditing ? (
                      <textarea
                        value={editedCandidate.notes || ''}
                        onChange={(e) => setEditedCandidate(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full h-24 bg-slate-600/50 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                        placeholder="Add notes about this candidate..."
                      />
                    ) : (
                      <p className="text-slate-300 text-sm">
                        {candidate.notes || 'No notes available'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-4">
                  
                  {/* Contact Info */}
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">{candidate.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">{candidate.recruiter}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-3">Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-300">Start Date</p>
                          <p className="text-xs text-slate-500">{candidate.startDate}</p>
                        </div>
                      </div>
                      {candidate.estimatedCompletion && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-300">Est. Completion</p>
                            <p className="text-xs text-slate-500">{candidate.estimatedCompletion}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Star className={`w-4 h-4 ${priorityColor}`} />
                        <div>
                          <p className="text-sm text-slate-300">Priority</p>
                          <p className={`text-xs ${priorityColor} capitalize`}>{candidate.priority}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {!isEngineer && (
                    <div className="bg-slate-700/30 rounded-xl p-4">
                      <h3 className="text-lg font-medium text-white mb-3">Quick Actions</h3>
                      <div className="space-y-2">
                        <button className="w-full px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2 text-sm">
                          <MessageCircle className="w-4 h-4" />
                          Send Message
                        </button>
                        <button className="w-full px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4" />
                          Schedule Call
                        </button>
                        <button className="w-full px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4" />
                          Generate Report
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}