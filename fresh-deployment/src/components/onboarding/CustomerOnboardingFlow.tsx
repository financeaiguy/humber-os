'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building, CreditCard, Users, Clock, CheckCircle, ArrowRight,
  DollarSign, Calendar, Shield, FileText, Mail, Phone,
  MapPin, Briefcase, Target, TrendingUp, Zap, X, Save
} from 'lucide-react'

interface CustomerOnboardingProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (customerData: CustomerData) => void
}

interface CustomerData {
  // Company Information
  companyName: string
  industry: string
  companySize: string
  website: string
  
  // Primary Contact
  contactName: string
  contactEmail: string
  contactPhone: string
  contactTitle: string
  
  // Billing Information
  billingAddress: string
  billingContact: string
  billingEmail: string
  taxId: string
  
  // Service Requirements
  engineerTypes: string[]
  projectDuration: string
  startDate: string
  budget: string
  location: string
  
  // Preferences
  communicationPreference: string
  reportingFrequency: string
  paymentTerms: string
  specialRequirements: string
}

const initialCustomerData: CustomerData = {
  companyName: '',
  industry: '',
  companySize: '',
  website: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  contactTitle: '',
  billingAddress: '',
  billingContact: '',
  billingEmail: '',
  taxId: '',
  engineerTypes: [],
  projectDuration: '',
  startDate: '',
  budget: '',
  location: '',
  communicationPreference: 'email',
  reportingFrequency: 'weekly',
  paymentTerms: 'net30',
  specialRequirements: ''
}

const onboardingSteps = [
  {
    id: 1,
    title: 'Company Information',
    description: 'Basic company details and contact information',
    icon: Building,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 2,
    title: 'Billing Setup',
    description: 'Payment information and billing preferences',
    icon: CreditCard,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 3,
    title: 'Service Requirements',
    description: 'Define your engineering needs and project scope',
    icon: Users,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 4,
    title: 'Preferences & Launch',
    description: 'Communication preferences and go-live setup',
    icon: Zap,
    color: 'from-orange-500 to-red-500'
  }
]

const engineerTypes = [
  { id: 'controls', label: 'Controls Engineers', description: 'PLC, SCADA, HMI programming' },
  { id: 'mechanical', label: 'Mechanical Engineers', description: 'CAD design, analysis, manufacturing' },
  { id: 'electrical', label: 'Electrical Engineers', description: 'Power systems, automation, controls' },
  { id: 'piping', label: 'Piping Engineers', description: 'Process piping, fluid systems' },
  { id: 'robotics', label: 'Robotics Engineers', description: 'Automation, AI, vision systems' }
]

const industries = [
  'Automotive Manufacturing',
  'Aerospace & Defense', 
  'Industrial Manufacturing',
  'Energy & Utilities',
  'Chemical Processing',
  'Food & Beverage',
  'Pharmaceuticals',
  'Other'
]

const companySizes = [
  '1-50 employees',
  '51-200 employees', 
  '201-1000 employees',
  '1000+ employees'
]

export default function CustomerOnboardingFlow({ isOpen, onClose, onComplete }: CustomerOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [customerData, setCustomerData] = useState<CustomerData>(initialCustomerData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof CustomerData, value: any) => {
    setCustomerData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleEngineerTypeToggle = (typeId: string) => {
    setCustomerData(prev => ({
      ...prev,
      engineerTypes: prev.engineerTypes.includes(typeId)
        ? prev.engineerTypes.filter(t => t !== typeId)
        : [...prev.engineerTypes, typeId]
    }))
  }

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!customerData.companyName.trim()) newErrors.companyName = 'Company name is required'
        if (!customerData.contactName.trim()) newErrors.contactName = 'Contact name is required'
        if (!customerData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required'
        if (!customerData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required'
        break
      case 2:
        if (!customerData.billingAddress.trim()) newErrors.billingAddress = 'Billing address is required'
        if (!customerData.billingContact.trim()) newErrors.billingContact = 'Billing contact is required'
        if (!customerData.billingEmail.trim()) newErrors.billingEmail = 'Billing email is required'
        break
      case 3:
        if (customerData.engineerTypes.length === 0) newErrors.engineerTypes = 'Select at least one engineer type'
        if (!customerData.startDate) newErrors.startDate = 'Start date is required'
        if (!customerData.budget.trim()) newErrors.budget = 'Budget range is required'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    
    try {
      // Simulate API call to create customer account
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      onComplete(customerData)
      onClose()
    } catch (error) {
      console.error('Error submitting customer onboarding:', error)
      setErrors({ submit: 'Failed to create customer account. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-800 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div>
              <h2 className="text-2xl font-bold text-white">Customer Onboarding</h2>
              <p className="text-slate-400 mt-1">Get started purchasing engineer time from our bull pen</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              {onboardingSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < onboardingSteps.length - 1 && (
                    <div className={`w-20 h-0.5 mx-3 ${
                      currentStep > step.id ? 'bg-blue-500' : 'bg-slate-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3">
              <h3 className="font-semibold text-white">{onboardingSteps[currentStep - 1].title}</h3>
              <p className="text-sm text-slate-400">{onboardingSteps[currentStep - 1].description}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={customerData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${
                        errors.companyName ? 'border-red-500' : 'border-slate-600'
                      }`}
                      placeholder="Your company name"
                    />
                    {errors.companyName && <p className="text-red-400 text-sm mt-1">{errors.companyName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Industry
                    </label>
                    <select
                      value={customerData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="">Select industry</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Company Size
                    </label>
                    <select
                      value={customerData.companySize}
                      onChange={(e) => handleInputChange('companySize', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="">Select company size</option>
                      {companySizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={customerData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Primary Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        value={customerData.contactName}
                        onChange={(e) => handleInputChange('contactName', e.target.value)}
                        className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${
                          errors.contactName ? 'border-red-500' : 'border-slate-600'
                        }`}
                        placeholder="Primary contact name"
                      />
                      {errors.contactName && <p className="text-red-400 text-sm mt-1">{errors.contactName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Contact Title
                      </label>
                      <input
                        type="text"
                        value={customerData.contactTitle}
                        onChange={(e) => handleInputChange('contactTitle', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        placeholder="Job title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={customerData.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${
                          errors.contactEmail ? 'border-red-500' : 'border-slate-600'
                        }`}
                        placeholder="contact@company.com"
                      />
                      {errors.contactEmail && <p className="text-red-400 text-sm mt-1">{errors.contactEmail}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={customerData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${
                          errors.contactPhone ? 'border-red-500' : 'border-slate-600'
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                      {errors.contactPhone && <p className="text-red-400 text-sm mt-1">{errors.contactPhone}</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Billing Setup */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Billing Address *
                    </label>
                    <textarea
                      value={customerData.billingAddress}
                      onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${
                        errors.billingAddress ? 'border-red-500' : 'border-slate-600'
                      }`}
                      rows={3}
                      placeholder="Complete billing address"
                    />
                    {errors.billingAddress && <p className="text-red-400 text-sm mt-1">{errors.billingAddress}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Billing Contact *
                    </label>
                    <input
                      type="text"
                      value={customerData.billingContact}
                      onChange={(e) => handleInputChange('billingContact', e.target.value)}
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${
                        errors.billingContact ? 'border-red-500' : 'border-slate-600'
                      }`}
                      placeholder="Billing contact name"
                    />
                    {errors.billingContact && <p className="text-red-400 text-sm mt-1">{errors.billingContact}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Billing Email *
                    </label>
                    <input
                      type="email"
                      value={customerData.billingEmail}
                      onChange={(e) => handleInputChange('billingEmail', e.target.value)}
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${
                        errors.billingEmail ? 'border-red-500' : 'border-slate-600'
                      }`}
                      placeholder="billing@company.com"
                    />
                    {errors.billingEmail && <p className="text-red-400 text-sm mt-1">{errors.billingEmail}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tax ID / EIN
                    </label>
                    <input
                      type="text"
                      value={customerData.taxId}
                      onChange={(e) => handleInputChange('taxId', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      placeholder="XX-XXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Payment Terms
                    </label>
                    <select
                      value={customerData.paymentTerms}
                      onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="net15">Net 15 days</option>
                      <option value="net30">Net 30 days</option>
                      <option value="net45">Net 45 days</option>
                      <option value="net60">Net 60 days</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Service Requirements */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Engineer Types Needed *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {engineerTypes.map((type) => (
                      <div
                        key={type.id}
                        onClick={() => handleEngineerTypeToggle(type.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          customerData.engineerTypes.includes(type.id)
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                            : 'border-slate-600 hover:border-slate-500 text-slate-300'
                        }`}
                      >
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm opacity-70">{type.description}</div>
                      </div>
                    ))}
                  </div>
                  {errors.engineerTypes && <p className="text-red-400 text-sm mt-1">{errors.engineerTypes}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Project Start Date *
                    </label>
                    <input
                      type="date"
                      value={customerData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${
                        errors.startDate ? 'border-red-500' : 'border-slate-600'
                      }`}
                    />
                    {errors.startDate && <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Project Duration
                    </label>
                    <select
                      value={customerData.projectDuration}
                      onChange={(e) => handleInputChange('projectDuration', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="">Select duration</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="6-12 months">6-12 months</option>
                      <option value="12+ months">12+ months</option>
                      <option value="ongoing">Ongoing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Budget Range *
                    </label>
                    <select
                      value={customerData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${
                        errors.budget ? 'border-red-500' : 'border-slate-600'
                      }`}
                    >
                      <option value="">Select budget range</option>
                      <option value="$50K-$100K">$50K - $100K</option>
                      <option value="$100K-$250K">$100K - $250K</option>
                      <option value="$250K-$500K">$250K - $500K</option>
                      <option value="$500K-$1M">$500K - $1M</option>
                      <option value="$1M+">$1M+</option>
                    </select>
                    {errors.budget && <p className="text-red-400 text-sm mt-1">{errors.budget}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={customerData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      placeholder="Project location"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Preferences & Launch */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Communication Preference
                    </label>
                    <select
                      value={customerData.communicationPreference}
                      onChange={(e) => handleInputChange('communicationPreference', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="slack">Slack</option>
                      <option value="teams">Microsoft Teams</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Reporting Frequency
                    </label>
                    <select
                      value={customerData.reportingFrequency}
                      onChange={(e) => handleInputChange('reportingFrequency', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Special Requirements
                  </label>
                  <textarea
                    value={customerData.specialRequirements}
                    onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    rows={4}
                    placeholder="Any special requirements, certifications needed, or project specifics..."
                  />
                </div>

                {/* Summary */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Onboarding Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Company:</span>
                      <span className="text-white">{customerData.companyName || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Engineer Types:</span>
                      <span className="text-white">{customerData.engineerTypes.length} selected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Budget:</span>
                      <span className="text-white">{customerData.budget || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Start Date:</span>
                      <span className="text-white">{customerData.startDate || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Messages */}
            {errors.submit && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-slate-700">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1 || isSubmitting}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b border-white"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Complete Onboarding</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
