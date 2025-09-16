'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, User, Users, Building, Briefcase, HardHat, Wrench,
  ChevronRight, ArrowLeft, CheckCircle, FileText,
  Shield, Calendar, MapPin, Phone, Mail, Hash,
  DollarSign, Clock, Award, Target, Sparkles,
  UserCheck, Factory, Package, Handshake, Home, Globe
} from 'lucide-react'

interface RoleBasedOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

type OnboardingType = 'internal' | 'external'
type OnboardingRole = 'employee' | 'operator' | 'partner' | 'customer'

const roleConfigurations = {
  employee: {
    title: 'Employee/Engineer Onboarding',
    icon: HardHat,
    color: 'from-blue-500 to-cyan-500',
    description: 'Onboard technical staff, engineers, and other employees',
    phases: [
      'Personal Information',
      'Employment Details',
      'Documentation',
      'System Access',
      'Team Integration'
    ],
    fields: {
      personal: ['fullName', 'email', 'phone', 'address', 'emergencyContact'],
      employment: ['position', 'department', 'manager', 'startDate', 'employmentType'],
      documentation: ['i9Form', 'w4Form', 'directDeposit', 'benefitsEnrollment', 'handbookAcknowledgment'],
      access: ['emailAccount', 'systemAccess', 'badgeAccess', 'equipmentIssued', 'parkingAccess'],
      team: ['teamIntroduction', 'buddyAssignment', 'trainingSchedule', 'firstWeekPlan', 'goalsetting']
    }
  },
  operator: {
    title: 'Operator/Manager Onboarding',
    icon: Wrench,
    color: 'from-green-500 to-emerald-500',
    description: 'Onboard project managers and operators who manage engineering teams',
    phases: [
      'Management Profile',
      'Team Assignment',
      'Authority Setup',
      'Process Training',
      'KPI Configuration'
    ],
    fields: {
      profile: ['managerName', 'experience', 'previousTeams', 'managementStyle', 'certifications'],
      team: ['teamSize', 'teamMembers', 'reportingStructure', 'projectAssignments', 'resourceAllocation'],
      authority: ['approvalLimits', 'budgetAccess', 'hiringAuthority', 'systemPermissions', 'decisionMatrix'],
      training: ['leadershipTraining', 'companyProcesses', 'toolsTraining', 'complianceTraining', 'hrPolicies'],
      kpi: ['performanceMetrics', 'teamGoals', 'deliveryTargets', 'qualityStandards', 'reportingSchedule']
    }
  },
  partner: {
    title: 'Partner Onboarding',
    icon: Handshake,
    color: 'from-purple-500 to-pink-500',
    description: 'Onboard business partners, vendors, and suppliers',
    phases: [
      'Partnership Agreement',
      'Business Requirements',
      'Integration Setup',
      'Compliance & Legal',
      'Launch Planning'
    ],
    fields: {
      agreement: ['partnershipType', 'contractTerms', 'sla', 'paymentTerms', 'renewalTerms'],
      business: ['companyInfo', 'taxId', 'bankingDetails', 'insurance', 'references'],
      integration: ['apiAccess', 'dataSharing', 'systemIntegration', 'communication', 'reporting'],
      compliance: ['vendorCompliance', 'nda', 'liabilityInsurance', 'certifications', 'auditRequirements'],
      launch: ['kickoffDate', 'keyContacts', 'escalationProcess', 'reviewSchedule', 'successCriteria']
    }
  },
  customer: {
    title: 'Customer Onboarding',
    icon: Building,
    color: 'from-orange-500 to-red-500',
    description: 'Onboard new customer organizations',
    phases: [
      'Account Setup',
      'Requirements Gathering',
      'Service Configuration',
      'Training & Support',
      'Go-Live Preparation'
    ],
    fields: {
      account: ['companyName', 'industry', 'size', 'primaryContact', 'billingContact'],
      requirements: ['projectScope', 'deliverables', 'timeline', 'budget', 'expectations'],
      service: ['serviceLevel', 'customizations', 'integrations', 'reporting', 'slaTerms'],
      training: ['userTraining', 'documentation', 'supportChannels', 'escalation', 'knowledgeTransfer'],
      golive: ['launchDate', 'acceptanceCriteria', 'signoff', 'billing', 'successMetrics']
    }
  }
}

export default function RoleBasedOnboardingModal({
  isOpen,
  onClose
}: RoleBasedOnboardingModalProps) {
  const [onboardingType, setOnboardingType] = useState<OnboardingType | null>(null)
  const [selectedRole, setSelectedRole] = useState<OnboardingRole | null>(null)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [formData, setFormData] = useState<any>({})

  const handleTypeSelect = (type: OnboardingType) => {
    setOnboardingType(type)
    setCurrentPhase(1)
  }

  const handleRoleSelect = (role: OnboardingRole) => {
    setSelectedRole(role)
    setCurrentPhase(2)
  }

  const handleBack = () => {
    if (currentPhase > 2) {
      setCurrentPhase(currentPhase - 1)
    } else if (currentPhase === 2) {
      setSelectedRole(null)
      setCurrentPhase(1)
    } else {
      setOnboardingType(null)
      setCurrentPhase(0)
    }
  }

  const handleNext = () => {
    const config = selectedRole ? roleConfigurations[selectedRole] : null
    if (config && currentPhase - 1 < config.phases.length) {
      setCurrentPhase(currentPhase + 1)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const renderTypeSelection = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-2">Select Onboarding Type</h2>
      <p className="text-slate-400 mb-8">
        Choose whether this is for internal staff or external partners
      </p>

      <div className="grid grid-cols-2 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleTypeSelect('internal')}
          className="relative overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700/50 p-8 text-center hover:border-blue-500/50 transition-all duration-200 group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
          
          <div className="relative z-10">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-4">
              <Home className="h-8 w-8 text-white" />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">
              Internal Onboarding
            </h3>
            
            <p className="text-sm text-slate-400 mb-4">
              For employees, engineers, and internal operators/managers
            </p>
            
            <div className="flex items-center justify-center text-blue-400 text-sm font-medium">
              <span>Select</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleTypeSelect('external')}
          className="relative overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700/50 p-8 text-center hover:border-purple-500/50 transition-all duration-200 group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
          
          <div className="relative z-10">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
              <Globe className="h-8 w-8 text-white" />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">
              External Onboarding
            </h3>
            
            <p className="text-sm text-slate-400 mb-4">
              For partners, vendors, customers, and external organizations
            </p>
            
            <div className="flex items-center justify-center text-purple-400 text-sm font-medium">
              <span>Select</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  )

  const renderRoleSelection = () => {
    const availableRoles = onboardingType === 'internal' 
      ? ['employee', 'operator'] as OnboardingRole[]
      : ['partner', 'customer'] as OnboardingRole[]

    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors mr-3"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {onboardingType === 'internal' ? 'Internal' : 'External'} Onboarding
            </h2>
            <p className="text-slate-400">
              Select the specific role to onboard
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {availableRoles.map((role) => {
            const config = roleConfigurations[role]
            const Icon = config.icon
            
            return (
              <motion.button
                key={role}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect(role)}
                className="relative overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700/50 p-6 text-left hover:border-slate-600 transition-all duration-200 group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-10 transition-opacity duration-200`} />
                
                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${config.color} mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {config.title}
                  </h3>
                  
                  <p className="text-sm text-slate-400 mb-4">
                    {config.description}
                  </p>
                  
                  <div className="flex items-center text-blue-400 text-sm font-medium">
                    <span>Start Process</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  const renderPhaseForm = () => {
    if (!selectedRole) return null
    
    const config = roleConfigurations[selectedRole]
    const Icon = config.icon
    const phaseIndex = currentPhase - 2
    const phase = config.phases[phaseIndex]
    const phaseKey = Object.keys(config.fields)[phaseIndex]
    const fields = config.fields[phaseKey as keyof typeof config.fields]
    
    return (
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white">{config.title}</h2>
              <p className="text-sm text-slate-400">
                {onboardingType === 'internal' ? 'Internal' : 'External'} • Phase {phaseIndex + 1} of {config.phases.length} - {phase}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {config.phases.map((phase, index) => (
              <div
                key={index}
                className={`flex items-center ${
                  index < config.phases.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                    index < phaseIndex
                      ? 'bg-green-500 text-white'
                      : index === phaseIndex
                      ? `bg-gradient-to-r ${config.color} text-white`
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {index < phaseIndex ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < config.phases.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all duration-200 ${
                      index < phaseIndex
                        ? 'bg-green-500'
                        : 'bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Form Fields */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {fields.map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <input
                  type="text"
                  value={formData[field] || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
          >
            Previous
          </button>
          
          {phaseIndex === config.phases.length - 1 ? (
            <button
              onClick={() => {
                console.log('Onboarding completed with data:', {
                  type: onboardingType,
                  role: selectedRole,
                  data: formData
                })
                onClose()
              }}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center space-x-2"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Complete Onboarding</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className={`px-6 py-3 rounded-lg bg-gradient-to-r ${config.color} text-white font-medium hover:opacity-90 transition-opacity flex items-center space-x-2`}
            >
              <span>Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    )
  }

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {currentPhase === 0 && renderTypeSelection()}
              {currentPhase === 1 && renderRoleSelection()}
              {currentPhase >= 2 && renderPhaseForm()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}