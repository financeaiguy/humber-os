'use client'

// export const runtime = 'edge'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  UserPlus, CheckCircle, Clock, AlertCircle, FileCheck, 
  Shield, Briefcase, GraduationCap, Heart, Home, Car,
  CreditCard, Users, Building, Calendar, TrendingUp, ChevronRight,
  Plus
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Lazy load heavy modals
const NewOnboardingModal = dynamic(() => import('@/components/onboarding/NewOnboardingModal'), { ssr: false })
const RoleBasedOnboardingModal = dynamic(() => import('@/components/onboarding/RoleBasedOnboardingModal'), { ssr: false })
const CustomerOnboardingFlow = dynamic(() => import('@/components/onboarding/CustomerOnboardingFlow'), { ssr: false })
import { OnboardingTracker } from '@/components/onboarding/OnboardingTrackerWrapper'

const onboardingQueue = [
  {
    id: 1,
    name: 'Michael Chen',
    role: 'Senior Mechanical Engineer',
    startDate: '2025-01-20',
    status: 'in_progress',
    currentStep: 'Documentation',
    completedSteps: 3,
    totalSteps: 8,
    recruiter: 'TechTalent Global',
    location: 'Detroit, MI',
    priority: 'high',
    documentsCompleted: ['I-9', 'W-4', 'Direct Deposit'],
    documentsPending: ['NDA', 'Equipment Agreement', 'Handbook Acknowledgment']
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    role: 'Controls Engineer',
    startDate: '2025-01-22',
    status: 'pending',
    currentStep: 'Background Check',
    completedSteps: 2,
    totalSteps: 8,
    recruiter: 'Engineering Elite',
    location: 'Chicago, IL',
    priority: 'medium',
    documentsCompleted: ['I-9', 'W-4'],
    documentsPending: ['Direct Deposit', 'NDA', 'Equipment Agreement']
  },
  {
    id: 3,
    name: 'David Kim',
    role: 'Software Engineer',
    startDate: '2025-01-25',
    status: 'scheduled',
    currentStep: 'Offer Accepted',
    completedSteps: 1,
    totalSteps: 8,
    recruiter: 'TechTalent Global',
    location: 'Remote',
    priority: 'normal',
    documentsCompleted: ['Offer Letter'],
    documentsPending: ['I-9', 'W-4', 'Direct Deposit', 'NDA']
  }
]

const onboardingSteps = [
  { step: 'Offer Accepted', icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
  { step: 'Background Check', icon: Shield, color: 'from-blue-500 to-indigo-500' },
  { step: 'Documentation', icon: FileCheck, color: 'from-purple-500 to-pink-500' },
  { step: 'IT Setup', icon: Building, color: 'from-orange-500 to-red-500' },
  { step: 'Training Scheduled', icon: GraduationCap, color: 'from-cyan-500 to-blue-500' },
  { step: 'Benefits Enrollment', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { step: 'Equipment Assigned', icon: Briefcase, color: 'from-yellow-500 to-orange-500' },
  { step: 'First Day Ready', icon: UserPlus, color: 'from-green-500 to-teal-500' }
]

const benefitsPackages = [
  {
    type: 'Health Insurance',
    icon: Heart,
    options: ['PPO', 'HMO', 'HSA'],
    enrollment: 85,
    deadline: '30 days from start'
  },
  {
    type: '401(k) Retirement',
    icon: TrendingUp,
    options: ['3% Match', 'Roth Option'],
    enrollment: 72,
    deadline: 'Immediate eligibility'
  },
  {
    type: 'Life Insurance',
    icon: Shield,
    options: ['2x Salary', 'Additional Coverage'],
    enrollment: 90,
    deadline: '60 days from start'
  },
  {
    type: 'Transportation',
    icon: Car,
    options: ['Company Vehicle', 'Mileage Reimbursement'],
    enrollment: 45,
    deadline: 'As needed'
  }
]

const complianceChecklist = [
  { item: 'I-9 Employment Verification', category: 'Legal', required: true, automated: true },
  { item: 'E-Verify Submission', category: 'Legal', required: true, automated: true },
  { item: 'W-4 Tax Withholding', category: 'Tax', required: true, automated: false },
  { item: 'State Tax Forms', category: 'Tax', required: true, automated: false },
  { item: 'Background Check Consent', category: 'Security', required: true, automated: true },
  { item: 'Drug Screening', category: 'Security', required: false, automated: false },
  { item: 'NDA Agreement', category: 'Legal', required: true, automated: true },
  { item: 'IT Security Training', category: 'Training', required: true, automated: true }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'in_progress': return 'bg-yellow-500/20 text-yellow-400'
    case 'pending': return 'bg-blue-500/20 text-blue-400'
    case 'scheduled': return 'bg-purple-500/20 text-purple-400'
    case 'completed': return 'bg-green-500/20 text-green-400'
    case 'paused': return 'bg-orange-500/20 text-orange-400'
    default: return 'bg-gray-500/20 text-gray-400'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'text-red-400'
    case 'medium': return 'text-yellow-400'
    case 'normal': return 'text-green-400'
    default: return 'text-gray-400'
  }
}

export default function OnboardingPage() {
  const [showNewOnboardingModal, setShowNewOnboardingModal] = useState(false)
  const [showRoleBasedModal, setShowRoleBasedModal] = useState(false)
  const [showCustomerOnboarding, setShowCustomerOnboarding] = useState(false)
  const [onboardingData, setOnboardingData] = useState(onboardingQueue)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  return (
    <>
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Employee Onboarding
          </h1>
          <p className="text-slate-400">
            Manage new hire onboarding, documentation, and compliance requirements.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCustomerOnboarding(true)}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center space-x-2"
          >
            <Building className="h-5 w-5" />
            <span>Customer Onboarding</span>
          </button>
          <button
            onClick={() => setShowRoleBasedModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center space-x-2"
          >
            <Users className="h-5 w-5" />
            <span>Role-Based Onboarding</span>
          </button>
          <button
            onClick={() => setShowNewOnboardingModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Employee Onboarding</span>
          </button>
        </div>
      </div>

      {/* Onboarding Tracker Dropdown */}
      <OnboardingTracker />

      {/* Onboarding Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Onboarding</p>
              <p className="text-2xl font-bold text-white mt-1">
                {onboardingData.filter(e => e.status === 'in_progress').length}
              </p>
            </div>
            <UserPlus className="h-8 w-8 text-blue-400" />
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
              <p className="text-sm text-slate-400">Pending Start</p>
              <p className="text-2xl font-bold text-white mt-1">
                {onboardingData.filter(e => e.status === 'pending' || e.status === 'scheduled').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-400" />
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
              <p className="text-sm text-slate-400">Avg Completion</p>
              <p className="text-2xl font-bold text-white mt-1">
                {Math.round(onboardingData.reduce((sum, e) => sum + (e.completedSteps / e.totalSteps * 100), 0) / onboardingData.length)}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
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
              <p className="text-sm text-slate-400">Compliance Rate</p>
              <p className="text-2xl font-bold text-white mt-1">98%</p>
            </div>
            <Shield className="h-8 w-8 text-red-400" />
          </div>
        </motion.div>
      </div>

      {/* Onboarding Pipeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Onboarding Pipeline</h2>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {onboardingSteps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center min-w-[100px]">
                <div className={`h-12 w-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center mb-2`}>
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-xs text-slate-400 text-center">{step.step}</p>
              </div>
              {index < onboardingSteps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-slate-600 mx-2" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Active Onboarding Queue */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Active Onboarding</h2>
        <div className="space-y-4">
          {onboardingData.map((employee, index) => (
            <motion.div
              key={employee.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{employee.name}</h3>
                    <p className="text-sm text-slate-400">{employee.role}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-slate-500">Start: {employee.startDate}</span>
                      <span className="text-xs text-slate-500">Location: {employee.location}</span>
                      <span className={`text-xs ${getPriorityColor(employee.priority)}`}>
                        Priority: {employee.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                  {employee.status.replace('_', ' ')}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Current: {employee.currentStep}</span>
                  <span className="text-sm text-slate-400">
                    {employee.completedSteps}/{employee.totalSteps} Steps
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(employee.completedSteps / employee.totalSteps) * 100}%` }}
                  />
                </div>
              </div>

              {/* Documents Status */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-2">Completed Documents</p>
                  <div className="space-y-1">
                    {employee.documentsCompleted.map((doc, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-slate-300">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-2">Pending Documents</p>
                  <div className="space-y-1">
                    {employee.documentsPending.map((doc, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <AlertCircle className="h-3 w-3 text-yellow-400" />
                        <span className="text-xs text-slate-300">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Recruiter: {employee.recruiter}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      // Open employee details modal
                      setSelectedEmployee(employee)
                      setShowDetailsModal(true)
                    }}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors cursor-pointer">
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      // Mark current step as complete and advance to next
                      const nextStepIndex = onboardingSteps.findIndex(s => s.step === employee.currentStep) + 1
                      if (nextStepIndex < onboardingSteps.length) {
                        // Update the employee's current step using state
                        setOnboardingData(prevData =>
                          prevData.map(emp =>
                            emp.id === employee.id
                              ? {
                                  ...emp,
                                  currentStep: onboardingSteps[nextStepIndex].step,
                                  completedSteps: emp.completedSteps + 1,
                                  status: nextStepIndex === onboardingSteps.length - 1 ? 'completed' : emp.status
                                }
                              : emp
                          )
                        )
                      }
                    }}
                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors cursor-pointer">
                    Complete Step
                  </button>
                  <button
                    onClick={() => {
                      // Pause onboarding process
                      setOnboardingData(prevData =>
                        prevData.map(emp =>
                          emp.id === employee.id
                            ? { ...emp, status: 'paused' }
                            : emp
                        )
                      )
                      alert(`Onboarding paused for ${employee.name}`)
                    }}
                    className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs hover:bg-yellow-500/30 transition-colors cursor-pointer">
                    Pause
                  </button>
                  <button
                    onClick={() => {
                      // Flag for partner review
                      setOnboardingData(prevData =>
                        prevData.map(emp =>
                          emp.id === employee.id
                            ? { ...emp, flaggedForReview: true, priority: 'high' }
                            : emp
                        )
                      )
                      alert(`${employee.name} has been flagged for partner review`)
                    }}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors cursor-pointer">
                    Flag
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Benefits & Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Benefits Enrollment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Benefits Enrollment</h3>
          <div className="space-y-3">
            {benefitsPackages.map((benefit, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <benefit.icon className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{benefit.type}</p>
                    <p className="text-xs text-slate-400">{benefit.options.join(', ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{benefit.enrollment}%</p>
                  <p className="text-xs text-slate-500">{benefit.deadline}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Compliance Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Compliance Checklist</h3>
          <div className="space-y-2">
            {complianceChecklist.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-slate-900/50 rounded transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`h-5 w-5 rounded ${item.required ? 'bg-red-500/20' : 'bg-slate-700'} flex items-center justify-center`}>
                    {item.required && <div className="h-2 w-2 bg-red-400 rounded-full" />}
                  </div>
                  <div>
                    <p className="text-sm text-white">{item.item}</p>
                    <p className="text-xs text-slate-500">{item.category}</p>
                  </div>
                </div>
                {item.automated && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                    Automated
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex justify-center space-x-4"
      >
        <button 
          onClick={() => window.open('/onboarding/new', '_blank')}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2"
        >
          <UserPlus className="h-5 w-5" />
          <span>Start New Onboarding</span>
        </button>
        <button className="px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-all duration-300 flex items-center space-x-2">
          <FileCheck className="h-5 w-5" />
          <span>Compliance Report</span>
        </button>
      </motion.div>
    </div>

    {/* New Onboarding Modal */}
    <NewOnboardingModal
      isOpen={showNewOnboardingModal}
      onClose={() => setShowNewOnboardingModal(false)}
      recruitId="rec_123" // This would come from recruitment system integration
    />

    {/* Customer Onboarding Modal */}
    <CustomerOnboardingFlow
      isOpen={showCustomerOnboarding}
      onClose={() => setShowCustomerOnboarding(false)}
      onComplete={(customerData) => {
        // SECURITY: console statement removed: console.log('Customer onboarding completed:', customerData)
        // In production, this would create customer account and redirect to purchase interface
        alert(`Welcome ${customerData.companyName}! Your account has been created. You can now purchase engineer time from our bull pen.`)
      }}
    />

    {/* Role-Based Onboarding Modal */}
    <RoleBasedOnboardingModal 
      isOpen={showRoleBasedModal} 
      onClose={() => setShowRoleBasedModal(false)} 
    />

    {/* Employee Details Modal */}
    {showDetailsModal && selectedEmployee && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-slate-900 rounded-2xl border border-slate-700 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Employee Details</h2>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Employee Information */}
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-3">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Name</p>
                  <p className="text-white font-medium">{selectedEmployee.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Role</p>
                  <p className="text-white font-medium">{selectedEmployee.role}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Start Date</p>
                  <p className="text-white font-medium">{selectedEmployee.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Location</p>
                  <p className="text-white font-medium">{selectedEmployee.location}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-3">Onboarding Progress</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-400">Current Step: {selectedEmployee.currentStep}</span>
                    <span className="text-sm text-slate-400">
                      {selectedEmployee.completedSteps}/{selectedEmployee.totalSteps} Steps
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(selectedEmployee.completedSteps / selectedEmployee.totalSteps) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-3">Completed Documents</h3>
                <div className="space-y-2">
                  {selectedEmployee.documentsCompleted.map((doc: string, i: number) => (
                    <div key={i} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-slate-300">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-3">Pending Documents</h3>
                <div className="space-y-2">
                  {selectedEmployee.documentsPending.map((doc: string, i: number) => (
                    <div key={i} className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-slate-300">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    // Pause onboarding
                    setOnboardingData(prevData =>
                      prevData.map(emp =>
                        emp.id === selectedEmployee.id
                          ? { ...emp, status: 'paused' }
                          : emp
                      )
                    )
                    setSelectedEmployee({ ...selectedEmployee, status: 'paused' })
                    alert(`Onboarding paused for ${selectedEmployee.name}`)
                  }}
                  className="px-4 py-2 bg-yellow-600/20 text-yellow-400 border border-yellow-600/50 rounded-lg hover:bg-yellow-600/30 transition-colors"
                >
                  Pause Onboarding
                </button>
                <button
                  onClick={() => {
                    // Flag for review
                    setOnboardingData(prevData =>
                      prevData.map(emp =>
                        emp.id === selectedEmployee.id
                          ? { ...emp, flaggedForReview: true, priority: 'high' }
                          : emp
                      )
                    )
                    alert(`${selectedEmployee.name} has been flagged for partner review`)
                    setShowDetailsModal(false)
                  }}
                  className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg hover:bg-red-600/30 transition-colors"
                >
                  Flag for Review
                </button>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert('Sending reminder email to ' + selectedEmployee.name)
                    setShowDetailsModal(false)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Reminder
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )}
    </>
  )
}