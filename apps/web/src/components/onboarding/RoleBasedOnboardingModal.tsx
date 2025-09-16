'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, User, Users, Building, Briefcase, HardHat, Wrench,
  ChevronRight, ArrowLeft, CheckCircle, FileText,
  Shield, Calendar, MapPin, Phone, Mail, Hash,
  DollarSign, Clock, Award, Target, Sparkles,
  UserCheck, Factory, Package, Handshake
} from 'lucide-react'

interface RoleBasedOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

type OnboardingRole = 'engineer' | 'operator' | 'partner' | 'customer'

const roleConfigurations = {
  engineer: {
    title: 'Engineer Onboarding',
    icon: HardHat,
    color: 'from-blue-500 to-cyan-500',
    description: 'Onboard technical engineers to specific projects',
    phases: [
      'Project Assignment',
      'Technical Requirements',
      'Safety & Compliance',
      'Tools & Access',
      'Schedule & Reporting'
    ],
    fields: {
      project: ['projectName', 'projectLocation', 'projectManager', 'startDate', 'endDate'],
      technical: ['requiredSkills', 'certifications', 'toolProficiency', 'previousProjects'],
      compliance: ['safetyTraining', 'siteOrientation', 'backgroundCheck', 'drugTest'],
      access: ['badgeAccess', 'systemAccess', 'vpnSetup', 'equipmentIssued'],
      schedule: ['shiftSchedule', 'reportingStructure', 'timesheetProcess', 'milestones']
    }
  },
  operator: {
    title: 'Operator Onboarding',
    icon: Wrench,
    color: 'from-green-500 to-emerald-500',
    description: 'Onboard equipment and machine operators',
    phases: [
      'Equipment Assignment',
      'Safety Certification',
      'Operational Training',
      'Quality Standards',
      'Production Schedule'
    ],
    fields: {
      equipment: ['machineType', 'equipmentId', 'maintenanceSchedule', 'operatingHours'],
      safety: ['oshaCertification', 'equipmentTraining', 'lockoutTagout', 'ppe'],
      training: ['operatorLicense', 'skillAssessment', 'buddySystem', 'trainingHours'],
      quality: ['qualityMetrics', 'inspectionProcess', 'defectReporting', 'spc'],
      production: ['productionTargets', 'shiftPattern', 'breakSchedule', 'teamAssignment']
    }
  },
  partner: {
    title: 'Partner Onboarding',
    icon: Handshake,
    color: 'from-purple-500 to-pink-500',
    description: 'Onboard business partners and vendors',
    phases: [
      'Partnership Agreement',
      'Business Requirements',
      'Integration Setup',
      'Compliance & Legal',
      'Launch Planning'
    ],
    fields: {
      agreement: ['partnershipType', 'contractTerms', 'sla', 'paymentTerms'],
      business: ['companyInfo', 'taxId', 'bankingDetails', 'insurance'],
      integration: ['apiAccess', 'dataSharing', 'systemIntegration', 'communication'],
      compliance: ['vendorCompliance', 'nda', 'liabilityInsurance', 'certifications'],
      launch: ['kickoffDate', 'keyContacts', 'escalationProcess', 'reviewSchedule']
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
      account: ['companyName', 'industry', 'size', 'primaryContact'],
      requirements: ['projectScope', 'deliverables', 'timeline', 'budget'],
      service: ['serviceLevel', 'customizations', 'integrations', 'reporting'],
      training: ['userTraining', 'documentation', 'supportChannels', 'escalation'],
      golive: ['launchDate', 'acceptanceCriteria', 'signoff', 'billing']
    }
  }
}

export default function RoleBasedOnboardingModal({
  isOpen,
  onClose
}: RoleBasedOnboardingModalProps) {
  const [selectedRole, setSelectedRole] = useState<OnboardingRole | null>(null)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [formData, setFormData] = useState<any>({})

  const handleRoleSelect = (role: OnboardingRole) => {
    setSelectedRole(role)
    setCurrentPhase(1)
  }

  const handleBack = () => {
    if (currentPhase > 1) {
      setCurrentPhase(currentPhase - 1)
    } else {
      setSelectedRole(null)
      setCurrentPhase(0)
    }
  }

  const handleNext = () => {
    const config = selectedRole ? roleConfigurations[selectedRole] : null
    if (config && currentPhase < config.phases.length) {
      setCurrentPhase(currentPhase + 1)
    }
  }

  const renderRoleSelection = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-2">Select Onboarding Type</h2>
      <p className="text-slate-400 mb-8">
        Choose the appropriate onboarding process based on the role
      </p>

      <div className="grid grid-cols-2 gap-4">
        {(Object.keys(roleConfigurations) as OnboardingRole[]).map((role) => {
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

  const renderPhaseForm = () => {
    if (!selectedRole) return null
    
    const config = roleConfigurations[selectedRole]
    const Icon = config.icon
    const phase = config.phases[currentPhase - 1]
    
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
                Phase {currentPhase} of {config.phases.length} - {phase}
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
                    index + 1 < currentPhase
                      ? 'bg-green-500 text-white'
                      : index + 1 === currentPhase
                      ? `bg-gradient-to-r ${config.color} text-white`
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {index + 1 < currentPhase ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < config.phases.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all duration-200 ${
                      index + 1 < currentPhase
                        ? 'bg-green-500'
                        : 'bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            {config.phases.map((phase, index) => (
              <div
                key={index}
                className={`text-center ${
                  index === 0 ? 'text-left' : index === config.phases.length - 1 ? 'text-right' : ''
                }`}
                style={{ width: `${100 / config.phases.length}%` }}
              >
                {phase}
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Form Content */}
        <div className="space-y-6">
          {renderFormFields()}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
          >
            Previous
          </button>
          
          <button
            onClick={handleNext}
            className={`px-6 py-3 rounded-lg bg-gradient-to-r ${config.color} text-white font-medium hover:opacity-90 transition-opacity flex items-center space-x-2`}
          >
            <span>{currentPhase === config.phases.length ? 'Complete' : 'Next'}</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    )
  }

  const renderFormFields = () => {
    // This would render specific form fields based on the current phase and role
    // For demonstration, showing a simple placeholder
    return (
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Field 1
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Enter value"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Field 2
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Enter value"
          />
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
              {!selectedRole ? renderRoleSelection() : renderPhaseForm()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}