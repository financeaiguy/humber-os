'use client'

import { useState, useEffect } from 'react'

// export const runtime = 'edge'
import { motion } from 'framer-motion'
import { UserSearch, Target, Briefcase, Globe, DollarSign, FileText, Shield, Award, Clock, Users, UserPlus, ArrowRight, CheckCircle } from 'lucide-react'
import NewRecruitModal from '@/components/recruiting/NewRecruitModal'
import { recruitsApi, type Recruit } from '@/lib/api/recruits'

const recruitmentAgencies = [
  {
    id: 1,
    agency: 'TechTalent Global',
    type: 'Technical Recruiting',
    specialization: ['Software Engineers', 'Controls Engineers', 'Robotics'],
    contactPerson: 'Sarah Mitchell',
    email: 'sarah@techtalentglobal.com',
    phone: '+1 (555) 123-4567',
    location: 'Detroit, MI',
    status: 'active',
    currentPipeline: 12,
    placementRate: 78,
    avgTimeToFill: 21,
    commission: '20%',
    contractType: 'Exclusive',
    certifications: ['ISO 9001', 'SHRM Certified'],
    rating: 4.8
  },
  {
    id: 2,
    agency: 'Engineering Elite',
    type: 'Engineering Specialists',
    specialization: ['Mechanical Engineers', 'Electrical Engineers'],
    contactPerson: 'Michael Chen',
    email: 'mchen@engineeringelite.com',
    phone: '+1 (555) 234-5678',
    location: 'Chicago, IL',
    status: 'active',
    currentPipeline: 8,
    placementRate: 82,
    avgTimeToFill: 18,
    commission: '18%',
    contractType: 'Preferred',
    certifications: ['ASA Certified', 'AIRS CIR'],
    rating: 4.9
  },
  {
    id: 3,
    agency: 'Industrial Staffing Pro',
    type: 'Industrial & Manufacturing',
    specialization: ['Piping Engineers', 'Process Engineers', 'Safety Engineers'],
    contactPerson: 'Emily Rodriguez',
    email: 'emily@industrialstaffing.com',
    phone: '+1 (555) 345-6789',
    location: 'Houston, TX',
    status: 'pending',
    currentPipeline: 5,
    placementRate: 75,
    avgTimeToFill: 24,
    commission: '22%',
    contractType: 'Non-Exclusive',
    certifications: ['NAPS Member'],
    rating: 4.5
  }
]

const recruitmentProtocols = [
  {
    id: 1,
    title: 'Immigration Compliance',
    type: 'Legal',
    description: 'H1-B visa sponsorship and work authorization verification',
    requirements: ['I-9 Verification', 'E-Verify', 'Visa Status Check'],
    automationLevel: 85,
    lastUpdated: '2025-01-10'
  },
  {
    id: 2,
    title: 'Tax & Payroll Setup',
    type: 'Financial',
    description: 'W-4 processing, state tax registration, and payroll integration',
    requirements: ['W-4 Form', 'State Tax Forms', 'Direct Deposit Setup'],
    automationLevel: 90,
    lastUpdated: '2025-01-08'
  },
  {
    id: 3,
    title: 'Background Screening',
    type: 'Security',
    description: 'Criminal background checks, reference verification, and security clearance',
    requirements: ['Criminal Check', 'Employment Verification', 'Education Verification'],
    automationLevel: 75,
    lastUpdated: '2025-01-12'
  },
  {
    id: 4,
    title: 'Technical Assessment',
    type: 'Skills',
    description: 'Skills testing, certification verification, and technical interviews',
    requirements: ['Coding Test', 'Certification Check', 'Portfolio Review'],
    automationLevel: 60,
    lastUpdated: '2025-01-05'
  }
]

const candidatePipeline = [
  { stage: 'Sourced', count: 45, color: 'from-blue-500 to-cyan-500' },
  { stage: 'Screened', count: 32, color: 'from-purple-500 to-pink-500' },
  { stage: 'Interviewed', count: 18, color: 'from-orange-500 to-yellow-500' },
  { stage: 'Offer Extended', count: 8, color: 'from-green-500 to-emerald-500' },
  { stage: 'Accepted', count: 6, color: 'from-indigo-500 to-purple-500' }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500/20 text-green-400'
    case 'pending': return 'bg-yellow-500/20 text-yellow-400'
    case 'inactive': return 'bg-red-500/20 text-red-400'
    default: return 'bg-gray-500/20 text-gray-400'
  }
}

const getProtocolTypeColor = (type: string) => {
  switch (type) {
    case 'Legal': return 'from-blue-500 to-indigo-500'
    case 'Financial': return 'from-green-500 to-emerald-500'
    case 'Security': return 'from-red-500 to-orange-500'
    case 'Skills': return 'from-purple-500 to-pink-500'
    default: return 'from-gray-500 to-slate-500'
  }
}

export default function RecruitsPage() {
  const [showNewRecruitModal, setShowNewRecruitModal] = useState(false)
  const [recruits, setRecruits] = useState<Recruit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [movingToOnboarding, setMovingToOnboarding] = useState<string | null>(null)

  // Fetch recruits on component mount
  useEffect(() => {
    fetchRecruits()
  }, [])

  const fetchRecruits = async () => {
    try {
      setIsLoading(true)
      const response = await recruitsApi.getRecruits({ limit: 20 })
      setRecruits(response.recruits || [])
    } catch (error) {
      // SECURITY: Removed console.error('Error fetching recruits:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMoveToOnboarding = async (recruitId: string) => {
    try {
      setMovingToOnboarding(recruitId)
      await recruitsApi.moveToOnboarding(recruitId)
      
      // Update the recruit status locally
      setRecruits(prev => prev.map(recruit => 
        recruit.id === recruitId 
          ? { ...recruit, status: 'accepted' as const }
          : recruit
      ))
      
      // Show success message (you could use a toast here)
      alert('Recruit successfully moved to onboarding!')
    } catch (error) {
      // SECURITY: Removed console.error('Error moving recruit to onboarding:', error)
      alert('Failed to move recruit to onboarding. Please try again.')
    } finally {
      setMovingToOnboarding(null)
    }
  }

  const getStatusColor = (status: Recruit['status'] | undefined | null | string) => {
    switch (status) {
      case 'sourced': return 'bg-blue-500/20 text-blue-400'
      case 'screened': return 'bg-purple-500/20 text-purple-400'
      case 'interviewed': return 'bg-orange-500/20 text-orange-400'
      case 'offer_extended': return 'bg-yellow-500/20 text-yellow-400'
      case 'accepted': return 'bg-green-500/20 text-green-400'
      case 'rejected': return 'bg-red-500/20 text-red-400'
      case 'onboarding': return 'bg-indigo-500/20 text-indigo-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <>
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Recruitment Management
          </h1>
          <p className="text-slate-400">
            Manage headhunter partnerships, recruitment protocols, and candidate pipeline.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowNewRecruitModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center space-x-2"
          >
            <UserPlus className="h-5 w-5" />
            <span>Add New Recruit</span>
          </button>
        </div>
      </div>

      {/* Recruitment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Agencies</p>
              <p className="text-2xl font-bold text-white mt-1">
                {recruitmentAgencies.filter(a => a.status === 'active').length}
              </p>
            </div>
            <Briefcase className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Pipeline</p>
              <p className="text-2xl font-bold text-white mt-1">
                {candidatePipeline.reduce((sum, stage) => sum + stage.count, 0)}
              </p>
            </div>
            <UserSearch className="h-8 w-8 text-purple-400" />
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
              <p className="text-sm text-slate-400">Avg Placement Rate</p>
              <p className="text-2xl font-bold text-white mt-1">
                {Math.round(recruitmentAgencies.reduce((sum, a) => sum + a.placementRate, 0) / recruitmentAgencies.length)}%
              </p>
            </div>
            <Target className="h-8 w-8 text-green-400" />
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
              <p className="text-sm text-slate-400">Avg Time to Fill</p>
              <p className="text-2xl font-bold text-white mt-1">
                {Math.round(recruitmentAgencies.reduce((sum, a) => sum + a.avgTimeToFill, 0) / recruitmentAgencies.length)} days
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-400" />
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
              <p className="text-sm text-slate-400">Active Protocols</p>
              <p className="text-2xl font-bold text-white mt-1">{recruitmentProtocols.length}</p>
            </div>
            <Shield className="h-8 w-8 text-red-400" />
          </div>
        </motion.div>
      </div>

      {/* Candidate Pipeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Candidate Pipeline</h2>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {candidatePipeline.map((stage, index) => (
            <div key={index} className="flex-1 min-w-[120px]">
              <div className={`h-24 rounded-lg bg-gradient-to-r ${stage.color} p-3 flex flex-col justify-between`}>
                <p className="text-xs font-medium text-white/90">{stage.stage}</p>
                <p className="text-2xl font-bold text-white">{stage.count}</p>
              </div>
              {index < candidatePipeline.length - 1 && (
                <div className="flex justify-center mt-2">
                  <div className="w-8 h-0.5 bg-slate-600"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recruitment Protocols */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recruitment Protocols & Standards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recruitmentProtocols.map((protocol, index) => (
            <motion.div
              key={protocol.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4 hover:border-slate-600 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-r ${getProtocolTypeColor(protocol.type)} flex items-center justify-center`}>
                    {protocol.type === 'Legal' && <Shield className="h-5 w-5 text-white" />}
                    {protocol.type === 'Financial' && <DollarSign className="h-5 w-5 text-white" />}
                    {protocol.type === 'Security' && <Shield className="h-5 w-5 text-white" />}
                    {protocol.type === 'Skills' && <Award className="h-5 w-5 text-white" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{protocol.title}</h3>
                    <p className="text-xs text-slate-400">{protocol.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Automation</p>
                  <p className="text-sm font-semibold text-white">{protocol.automationLevel}%</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-3">{protocol.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {protocol.requirements.map((req, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-900/50 rounded text-xs text-slate-300">
                    {req}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Last updated: {protocol.lastUpdated}</span>
                <button className="text-blue-400 hover:text-blue-300 transition-colors">
                  Edit Protocol
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Current Recruits */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Current Recruits</h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recruits.map((recruit, index) => (
              <motion.div
                key={recruit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white text-lg">
                      {recruit.firstName} {recruit.lastName}
                    </h3>
                    <p className="text-sm text-slate-400">{recruit.jobTitle}</p>
                    <p className="text-xs text-slate-500">{recruit.yearsExperience} years experience</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(recruit.status || '')}`}>
                    {recruit.status ? recruit.status.replace('_', ' ') : 'Unknown'}
                  </span>
                </div>

                {/* Contact */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <Users className="h-4 w-4" />
                    <span>{recruit.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <Globe className="h-4 w-4" />
                    <span>{recruit.currentLocation || 'Location not specified'}</span>
                  </div>
                </div>

                {/* Skills */}
                {recruit.skills && recruit.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {recruit.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-900/50 rounded text-xs text-slate-300">
                          {skill}
                        </span>
                      ))}
                      {recruit.skills.length > 3 && (
                        <span className="px-2 py-1 bg-slate-900/50 rounded text-xs text-slate-500">
                          +{recruit.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <div className="text-xs text-slate-500">
                    Added: {new Date(recruit.createdAt).toLocaleDateString()}
                  </div>
                  {recruit.status === 'accepted' && (
                    <button
                      onClick={() => handleMoveToOnboarding(recruit.id)}
                      disabled={movingToOnboarding === recruit.id}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {movingToOnboarding === recruit.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                          <span>Moving...</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-4 w-4" />
                          <span>Move to Onboarding</span>
                        </>
                      )}
                    </button>
                  )}
                  {recruit.status === 'accepted' && (
                    <div className="flex items-center space-x-2 text-green-400 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>Ready for Onboarding</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {!isLoading && recruits.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No recruits found</p>
            <p className="text-slate-500 text-sm">Add your first recruit to get started</p>
          </div>
        )}
      </div>

      {/* Recruitment Agencies */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Headhunter Partnerships</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {recruitmentAgencies.map((agency, index) => (
            <motion.div
              key={agency.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white text-lg">{agency.agency}</h3>
                  <p className="text-sm text-slate-400">{agency.type}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agency.status)}`}>
                  {agency.status}
                </span>
              </div>

              {/* Specializations */}
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-2">Specializations</p>
                <div className="flex flex-wrap gap-1">
                  {agency.specialization.map((spec, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-900/50 rounded text-xs text-slate-300">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <Users className="h-4 w-4" />
                  <span>{agency.contactPerson}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <Globe className="h-4 w-4" />
                  <span>{agency.location}</span>
                </div>
              </div>

              {/* Contract Details */}
              <div className="bg-slate-900/50 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-500">Contract Type</span>
                  <span className="text-sm font-medium text-white">{agency.contractType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Commission</span>
                  <span className="text-sm font-medium text-white">{agency.commission}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{agency.currentPipeline}</p>
                  <p className="text-xs text-slate-400">Pipeline</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{agency.placementRate}%</p>
                  <p className="text-xs text-slate-400">Placement</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{agency.avgTimeToFill}d</p>
                  <p className="text-xs text-slate-400">Avg Fill</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center space-x-4"
      >
        <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2">
          <Briefcase className="h-5 w-5" />
          <span>Add New Agency</span>
        </button>
        <button className="px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-all duration-300 flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Create Protocol</span>
        </button>
      </motion.div>
    </div>

    {/* New Recruit Modal */}
    <NewRecruitModal 
      isOpen={showNewRecruitModal} 
      onClose={() => setShowNewRecruitModal(false)}
      onRecruitAdded={fetchRecruits}
    />
    </>
  )
}