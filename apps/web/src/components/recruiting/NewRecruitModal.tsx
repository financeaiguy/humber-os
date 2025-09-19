'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, User, Mail, Phone, MapPin, Briefcase, GraduationCap, 
  Calendar, DollarSign, FileText, ChevronRight, CheckCircle,
  AlertCircle, Loader
} from 'lucide-react'
import { recruitsApi, getFieldErrors, getErrorMessage, ApiValidationError, type RecruitData } from '@/lib/api/recruits'

interface NewRecruitModalProps {
  isOpen: boolean
  onClose: () => void
  onRecruitAdded?: () => void // Callback to refresh recruits list
}

// RecruitData interface is now imported from the API module

const initialRecruitData: RecruitData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  currentLocation: '',
  jobTitle: '',
  yearsExperience: 0,
  currentCompany: '',
  desiredSalary: '',
  skills: [],
  education: '',
  certifications: [],
  availableStartDate: '',
  workAuthorization: 'US Citizen',
  willingToRelocate: false,
  travelWillingness: 'None',
  source: 'Direct Application',
  recruiterName: '',
  recruiterAgency: '',
  notes: ''
}

const workAuthOptions = [
  'US Citizen',
  'Green Card Holder',
  'H1-B Visa',
  'L1 Visa',
  'OPT/F1',
  'TN Visa',
  'Other'
]

const travelOptions = [
  'None',
  'Minimal (< 10%)',
  'Moderate (10-25%)',
  'Frequent (25-50%)',
  'Extensive (> 50%)'
]

const sourceOptions = [
  'Direct Application',
  'LinkedIn',
  'Indeed',
  'Referral',
  'Recruiting Agency',
  'Career Fair',
  'Company Website',
  'Other'
]

export default function NewRecruitModal({ isOpen, onClose, onRecruitAdded }: NewRecruitModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [recruitData, setRecruitData] = useState<RecruitData>(initialRecruitData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newSkill, setNewSkill] = useState('')
  const [newCertification, setNewCertification] = useState('')

  const totalSteps = 4

  const handleInputChange = (field: keyof RecruitData, value: any) => {
    setRecruitData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !recruitData.skills.includes(newSkill.trim())) {
      setRecruitData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setRecruitData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const addCertification = () => {
    if (newCertification.trim() && !recruitData.certifications.includes(newCertification.trim())) {
      setRecruitData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }))
      setNewCertification('')
    }
  }

  const removeCertification = (certToRemove: string) => {
    setRecruitData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert !== certToRemove)
    }))
  }

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!recruitData.firstName.trim()) newErrors.firstName = 'First name is required'
        if (!recruitData.lastName.trim()) newErrors.lastName = 'Last name is required'
        if (!recruitData.email.trim()) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(recruitData.email)) newErrors.email = 'Invalid email format'
        if (!recruitData.phone.trim()) newErrors.phone = 'Phone number is required'
        if (!recruitData.currentLocation.trim()) newErrors.currentLocation = 'Current location is required'
        break
      case 2:
        if (!recruitData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required'
        if (recruitData.yearsExperience < 0) newErrors.yearsExperience = 'Years of experience cannot be negative'
        break
      case 3:
        if (!recruitData.availableStartDate) newErrors.availableStartDate = 'Available start date is required'
        break
      case 4:
        if (!recruitData.source.trim()) newErrors.source = 'Recruiting source is required'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    setErrors({})
    
    try {
      const response = await recruitsApi.submitRecruit(recruitData)
      
      // SECURITY: console statement removed: console.log('Recruit submission successful:', response)
      setSubmitSuccess(true)
      
      // Close modal after success
      setTimeout(() => {
        onClose()
        setSubmitSuccess(false)
        setCurrentStep(1)
        setRecruitData(initialRecruitData)
        setErrors({})
        // Refresh the recruits list
        onRecruitAdded?.()
      }, 2000)
      
    } catch (error) {
      // SECURITY: console statement removed: console.error('Error submitting recruit:', error)
      
      if (error instanceof ApiValidationError) {
        // Set field-specific errors
        const fieldErrors = getFieldErrors(error)
        setErrors(fieldErrors)
      } else {
        setErrors({ submit: getErrorMessage(error) })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setCurrentStep(1)
      setRecruitData(initialRecruitData)
      setErrors({})
      setSubmitSuccess(false)
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
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div>
              <h2 className="text-2xl font-bold text-white">Add New Recruit</h2>
              <p className="text-slate-400 mt-1">Step {currentStep} of {totalSteps}</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 border-b border-slate-700">
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i + 1 <= currentStep 
                      ? 'bg-green-500 text-white' 
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {i + 1 <= currentStep ? <CheckCircle className="h-4 w-4" /> : i + 1}
                  </div>
                  {i < totalSteps - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${
                      i + 1 < currentStep ? 'bg-green-500' : 'bg-slate-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {submitSuccess ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Recruit Added Successfully!</h3>
                <p className="text-slate-400">The recruit has been added to the pipeline and can now be moved to onboarding.</p>
              </motion.div>
            ) : (
              <>
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Personal Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={recruitData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.firstName ? 'border-red-500' : 'border-slate-600'
                            }`}
                            placeholder="Enter first name"
                          />
                          {errors.firstName && (
                            <p className="text-red-400 text-sm mt-1 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.firstName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={recruitData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.lastName ? 'border-red-500' : 'border-slate-600'
                            }`}
                            placeholder="Enter last name"
                          />
                          {errors.lastName && (
                            <p className="text-red-400 text-sm mt-1 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.lastName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={recruitData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.email ? 'border-red-500' : 'border-slate-600'
                            }`}
                            placeholder="Enter email address"
                          />
                          {errors.email && (
                            <p className="text-red-400 text-sm mt-1 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            value={recruitData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.phone ? 'border-red-500' : 'border-slate-600'
                            }`}
                            placeholder="Enter phone number"
                          />
                          {errors.phone && (
                            <p className="text-red-400 text-sm mt-1 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.phone}
                            </p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Current Location *
                          </label>
                          <input
                            type="text"
                            value={recruitData.currentLocation}
                            onChange={(e) => handleInputChange('currentLocation', e.target.value)}
                            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.currentLocation ? 'border-red-500' : 'border-slate-600'
                            }`}
                            placeholder="Enter current city, state"
                          />
                          {errors.currentLocation && (
                            <p className="text-red-400 text-sm mt-1 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.currentLocation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Professional Information */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Briefcase className="h-5 w-5 mr-2" />
                        Professional Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Job Title *
                          </label>
                          <input
                            type="text"
                            value={recruitData.jobTitle}
                            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.jobTitle ? 'border-red-500' : 'border-slate-600'
                            }`}
                            placeholder="e.g., Senior Mechanical Engineer"
                          />
                          {errors.jobTitle && (
                            <p className="text-red-400 text-sm mt-1 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.jobTitle}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Years of Experience
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={recruitData.yearsExperience}
                            onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value) || 0)}
                            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.yearsExperience ? 'border-red-500' : 'border-slate-600'
                            }`}
                            placeholder="0"
                          />
                          {errors.yearsExperience && (
                            <p className="text-red-400 text-sm mt-1 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.yearsExperience}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Current Company
                          </label>
                          <input
                            type="text"
                            value={recruitData.currentCompany}
                            onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter current employer"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Desired Salary
                          </label>
                          <input
                            type="text"
                            value={recruitData.desiredSalary}
                            onChange={(e) => handleInputChange('desiredSalary', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., $85,000 or $40/hr"
                          />
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Technical Skills
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {recruitData.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="ml-2 hover:text-blue-100"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add a skill and press Enter"
                          />
                          <button
                            type="button"
                            onClick={addSkill}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Education */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Education
                        </label>
                        <input
                          type="text"
                          value={recruitData.education}
                          onChange={(e) => handleInputChange('education', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., BS Mechanical Engineering - University of Michigan"
                        />
                      </div>

                      {/* Certifications */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Certifications
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {recruitData.certifications.map((cert, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm"
                            >
                              {cert}
                              <button
                                type="button"
                                onClick={() => removeCertification(cert)}
                                className="ml-2 hover:text-green-100"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCertification}
                            onChange={(e) => setNewCertification(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add a certification and press Enter"
                          />
                          <button
                            type="button"
                            onClick={addCertification}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Availability & Preferences */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Availability & Preferences
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Available Start Date *
                          </label>
                          <input
                            type="date"
                            value={recruitData.availableStartDate}
                            onChange={(e) => handleInputChange('availableStartDate', e.target.value)}
                            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.availableStartDate ? 'border-red-500' : 'border-slate-600'
                            }`}
                          />
                          {errors.availableStartDate && (
                            <p className="text-red-400 text-sm mt-1 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.availableStartDate}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Work Authorization
                          </label>
                          <select
                            value={recruitData.workAuthorization}
                            onChange={(e) => handleInputChange('workAuthorization', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {workAuthOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Travel Willingness
                          </label>
                          <select
                            value={recruitData.travelWillingness}
                            onChange={(e) => handleInputChange('travelWillingness', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {travelOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="willingToRelocate"
                            checked={recruitData.willingToRelocate}
                            onChange={(e) => handleInputChange('willingToRelocate', e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="willingToRelocate" className="text-sm text-slate-300">
                            Willing to relocate
                          </label>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Recruiting Source */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Recruiting Source & Notes
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Source *
                          </label>
                          <select
                            value={recruitData.source}
                            onChange={(e) => handleInputChange('source', e.target.value)}
                            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.source ? 'border-red-500' : 'border-slate-600'
                            }`}
                          >
                            {sourceOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          {errors.source && (
                            <p className="text-red-400 text-sm mt-1 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.source}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Recruiter Name
                          </label>
                          <input
                            type="text"
                            value={recruitData.recruiterName}
                            onChange={(e) => handleInputChange('recruiterName', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter recruiter name"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Recruiting Agency
                          </label>
                          <input
                            type="text"
                            value={recruitData.recruiterAgency}
                            onChange={(e) => handleInputChange('recruiterAgency', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter recruiting agency name"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Notes
                          </label>
                          <textarea
                            value={recruitData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Any additional notes about this recruit..."
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {/* Error Messages */}
            {errors.submit && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.submit}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {!submitSuccess && (
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
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                
                {currentStep < totalSteps ? (
                  <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Adding Recruit...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Add Recruit</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
