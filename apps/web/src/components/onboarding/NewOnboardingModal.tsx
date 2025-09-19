'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, User, Calendar, Globe, MapPin, Hash, Clock,
  CheckCircle, ArrowRight, ArrowLeft, FileText,
  Shield, Briefcase, Building, Phone, Mail,
  Flag, Plane, Key, CreditCard, AlertCircle, Loader2,
  Wifi, WifiOff, RefreshCw, DollarSign, Target, Award,
  Sparkles, Eye, Download, Upload, FileCheck,
  CheckSquare, Info, Signature, FileSignature,
  BadgeCheck, ScrollText, FilePlus
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { onboardingApi, getErrorMessage, getFieldErrors, ApiValidationError, ApiNetworkError } from '@/lib/api/onboarding'
import { useFormValidation, formatLegalIdentifier, getFieldDisplayName } from '@/hooks/useFormValidation'
import { DocumentViewer } from '../knowledge-base/document-viewer'

interface OnboardingData {
  // Phase 1: Basic Information
  recruitmentDate: string
  visaStatus: string
  travelLimitations: string
  specialtyKeywords: string[]
  legalIdentifier: {
    type: 'SSN' | 'TIN' | 'ITIN' | 'EIN'
    number: string
  }
  totalExperience: number
  employeeType: 'full-time' | 'contractor' | 'part-time' | 'intern'
  
  // Auto-populated from recruitment (will be fetched)
  firstName: string
  lastName: string
  email: string
  phone: string
  currentLocation: string
  desiredSalary: number
  availableStartDate: string
}

interface NewOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  recruitId?: string // ID from recruitment system to auto-populate data
}

export default function NewOnboardingModal({
  isOpen,
  onClose,
  recruitId
}: NewOnboardingModalProps) {
  const [currentPhase, setCurrentPhase] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [networkError, setNetworkError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  const { errors, validateField, validateForm, clearFieldError, setFieldError, clearErrors } = useFormValidation()
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    recruitmentDate: '',
    visaStatus: '',
    travelLimitations: '',
    specialtyKeywords: [],
    legalIdentifier: {
      type: 'SSN',
      number: ''
    },
    totalExperience: 0,
    employeeType: 'full-time',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentLocation: '',
    desiredSalary: 0,
    availableStartDate: ''
  })
  
  // Phase 2: Offer Letter Details State
  const [offerDetails, setOfferDetails] = useState<any>({
    jobTitle: '',
    department: '',
    hourlyRate: '',
    hoursPerWeek: 40,
    startDate: '',
    responsibilities: '',
    requirements: '',
    expectations: '',
    contractType: '',
    workLocation: '',
    enableSmartContract: false
  })
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [offerLetterGenerated, setOfferLetterGenerated] = useState(false)
  const [offerLetterPDF, setOfferLetterPDF] = useState<string | null>(null)

  // Phase 3: Documentation & Compliance State
  const [documents, setDocuments] = useState({
    i9: { uploaded: false, verified: false, file: null, name: '' },
    w4: { uploaded: false, verified: false, file: null, name: '' },
    stateWithholding: { uploaded: false, verified: false, file: null, name: '' },
    directDeposit: { uploaded: false, verified: false, file: null, name: '' },
    emergencyContacts: { uploaded: false, verified: false, file: null, name: '' },
    confidentialityAgreement: { uploaded: false, signed: false, file: null, name: '' },
    handbookAcknowledgment: { uploaded: false, signed: false, file: null, name: '' },
    beneficiaryDesignation: { uploaded: false, verified: false, file: null, name: '' },
    medicalInsurance: { uploaded: false, verified: false, file: null, name: '' },
    workAuthorization: { uploaded: false, verified: false, file: null, name: '' }
  })

  const [compliance, setCompliance] = useState({
    backgroundCheck: { status: 'pending', date: '', notes: '' },
    drugScreening: { status: 'pending', date: '', notes: '' },
    referenceChecks: { status: 'pending', date: '', notes: '' },
    creditCheck: { status: 'not_required', date: '', notes: '' },
    criminalHistory: { status: 'pending', date: '', notes: '' },
    educationVerification: { status: 'pending', date: '', notes: '' },
    employmentVerification: { status: 'pending', date: '', notes: '' },
    securityClearance: { status: 'not_required', date: '', notes: '' }
  })

  const [digitalSignatures, setDigitalSignatures] = useState({
    employeeHandbook: { signed: false, timestamp: '', ipAddress: '' },
    codeOfConduct: { signed: false, timestamp: '', ipAddress: '' },
    itSecurityPolicy: { signed: false, timestamp: '', ipAddress: '' },
    remoteWorkPolicy: { signed: false, timestamp: '', ipAddress: '' },
    nonCompeteAgreement: { signed: false, timestamp: '', ipAddress: '' }
  })

  // PDF Viewer State
  const [showPdfViewer, setShowPdfViewer] = useState(false)
  const [currentDocumentToSign, setCurrentDocumentToSign] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)

  // Auto-populate data from recruitment system with real API
  useEffect(() => {
    if (recruitId && isOpen) {
      fetchRecruitmentData()
    } else if (isOpen && !recruitId) {
      // If no recruitId, allow manual entry by skipping the loading state
      setIsLoading(false)
    }
  }, [recruitId, isOpen])

  const fetchRecruitmentData = async () => {
    setIsLoading(true)
    setApiError(null)
    setNetworkError(false)
    
    try {
      const data = await onboardingApi.fetchRecruitmentData(recruitId!)
      
      setOnboardingData(prev => ({
        ...prev,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        currentLocation: data.currentLocation,
        desiredSalary: data.desiredSalary,
        availableStartDate: data.availableStartDate,
        totalExperience: data.totalExperience,
        recruitmentDate: data.recruitmentDate,
        specialtyKeywords: data.skills || [],
        visaStatus: data.visaStatus || ''
      }))
      
      setRetryCount(0)
    } catch (error) {
      // SECURITY: console statement removed: console.error('Error fetching recruitment data:', error)
      
      if (error instanceof ApiNetworkError) {
        setNetworkError(true)
        setApiError('Unable to connect to recruitment system. Please check your internet connection.')
      } else {
        setApiError(getErrorMessage(error))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const retryFetchData = () => {
    setRetryCount(prev => prev + 1)
    fetchRecruitmentData()
  }

  const handleInputChange = (field: string, value: any) => {
    // Clear any existing error for this field
    clearFieldError(field)
    
    // Update the data
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setOnboardingData(prev => {
        const newData = {
          ...prev,
          [parent]: {
            ...prev[parent as keyof OnboardingData],
            [child]: value
          }
        }
        
        // Format legal identifier as user types
        if (parent === 'legalIdentifier' && child === 'number') {
          const type = (newData.legalIdentifier as any).type
          newData.legalIdentifier.number = formatLegalIdentifier(type, value)
        }
        
        return newData
      })
    } else {
      setOnboardingData(prev => ({
        ...prev,
        [field]: value
      }))
    }
    
    // Validate field on change (debounced validation would be better for UX)
    setTimeout(() => {
      const error = validateField(field, value, onboardingData)
      if (error) {
        setFieldError(field, error)
      }
    }, 500)
  }

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !onboardingData.specialtyKeywords.includes(keyword.trim())) {
      setOnboardingData(prev => ({
        ...prev,
        specialtyKeywords: [...prev.specialtyKeywords, keyword.trim()]
      }))
    }
  }

  const removeKeyword = (index: number) => {
    setOnboardingData(prev => ({
      ...prev,
      specialtyKeywords: prev.specialtyKeywords.filter((_, i) => i !== index)
    }))
  }

  const handleNext = () => {
    if (currentPhase < 3) {
      setCurrentPhase(currentPhase + 1)
    }
  }

  const handleBack = () => {
    if (currentPhase > 1) {
      setCurrentPhase(currentPhase - 1)
    }
  }

  // Phase 2: Offer Letter Generation Handlers
  const handleGenerateOfferLetter = async () => {
    setIsGenerating(true)
    
    try {
      // Prepare offer data combining Phase 1 and Phase 2 data
      const offerData = {
        ...onboardingData,
        ...offerDetails,
        candidateName: `${onboardingData.firstName} ${onboardingData.lastName}`,
        candidateEmail: onboardingData.email,
        candidatePhone: onboardingData.phone
      }
      
      // Send to AI/Chat widget for generation
      const response = await fetch('/api/onboarding/generate-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData)
      })
      
      if (!response.ok) throw new Error('Failed to generate offer letter')
      
      const { pdfUrl, contractAddress } = await response.json()
      
      setOfferLetterPDF(pdfUrl)
      setOfferLetterGenerated(true)
      
      // If smart contract enabled, store the contract address
      if (offerDetails.enableSmartContract && contractAddress) {
        setOfferDetails({...offerDetails, contractAddress})
      }
    } catch (error) {
      // SECURITY: console statement removed: console.error('Error generating offer letter:', error)
      setApiError('Failed to generate offer letter. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handlePreviewPDF = () => {
    if (offerLetterPDF) {
      window.open(offerLetterPDF, '_blank')
    }
  }
  
  const handleDownloadPDF = () => {
    if (offerLetterPDF) {
      const link = document.createElement('a')
      link.href = offerLetterPDF
      link.download = `offer-letter-${onboardingData.firstName}-${onboardingData.lastName}.pdf`
      link.click()
    }
  }

  // Phase 3: Document Upload Handler
  const handleDocumentUpload = (docType: string, file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      setDocuments(prev => ({
        ...prev,
        [docType]: {
          ...prev[docType as keyof typeof prev],
          uploaded: true,
          file: reader.result,
          name: file.name
        }
      }))
    }
    reader.readAsDataURL(file)
  }

  // Phase 3: Digital Signature Handler
  // Mock document data for digital signatures
  const signatureDocuments = {
    employeeHandbook: {
      id: 'handbook_001',
      title: 'Employee Handbook Acknowledgment',
      type: 'pdf' as const,
      size: 1234567,
      url: '/documents/employee-handbook.pdf',
      content: `EMPLOYEE HANDBOOK ACKNOWLEDGMENT\n\nI acknowledge that I have received and read the Employee Handbook. I understand that this handbook provides information about company policies, procedures, benefits, and working conditions.\n\nI understand that the policies, rules, benefits, and procedures described in this handbook are subject to change by the company at any time with or without notice.\n\nI understand that my employment is at-will, meaning that either the company or I may terminate my employment at any time, with or without cause or advance notice.\n\nBy signing below, I acknowledge that I have read, understood, and agree to comply with all policies and procedures outlined in this Employee Handbook.\n\nEmployee Signature: _____________________  Date: _________\n\nPrint Name: ____________________________`,
      metadata: {
        author: 'HR Department',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z',
        tags: ['handbook', 'acknowledgment', 'employment'],
        category: 'HR Documents',
        description: 'Employee handbook acknowledgment form requiring digital signature',
        version: 1,
        status: 'approved' as const,
        accessLevel: 'internal' as const,
        downloadCount: 0,
        viewCount: 0,
        rating: 5,
        comments: 0
      }
    },
    codeOfConduct: {
      id: 'conduct_001',
      title: 'Code of Conduct Agreement',
      type: 'pdf' as const,
      size: 987654,
      url: '/documents/code-of-conduct.pdf',
      content: `CODE OF CONDUCT AGREEMENT\n\nAs an employee of this organization, I commit to upholding the highest standards of professional conduct and ethical behavior.\n\nI will:\n• Treat all colleagues, clients, and stakeholders with respect and dignity\n• Maintain confidentiality of proprietary and sensitive information\n• Avoid conflicts of interest and disclose any potential conflicts\n• Comply with all applicable laws, regulations, and company policies\n• Report any violations of this code or unethical behavior\n• Use company resources responsibly and for business purposes only\n\nI understand that violations of this Code of Conduct may result in disciplinary action, up to and including termination of employment.\n\nBy signing below, I acknowledge that I have read, understood, and agree to comply with this Code of Conduct.\n\nEmployee Signature: _____________________  Date: _________\n\nPrint Name: ____________________________`,
      metadata: {
        author: 'Legal Department',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
        tags: ['conduct', 'ethics', 'agreement'],
        category: 'Legal Documents',
        description: 'Code of conduct agreement requiring employee signature',
        version: 1,
        status: 'approved' as const,
        accessLevel: 'internal' as const,
        downloadCount: 0,
        viewCount: 0,
        rating: 5,
        comments: 0
      }
    },
    itSecurityPolicy: {
      id: 'security_001',
      title: 'IT Security Policy Agreement',
      type: 'pdf' as const,
      size: 1567890,
      url: '/documents/it-security-policy.pdf',
      content: `IT SECURITY POLICY AGREEMENT\n\nI understand and agree to comply with the company's IT Security Policy, which includes:\n\nPASSWORD SECURITY:\n• Use strong, unique passwords for all accounts\n• Do not share passwords with anyone\n• Change passwords when required or if compromised\n\nDATA PROTECTION:\n• Protect company data and customer information\n• Use only approved software and applications\n• Report security incidents immediately\n\nDEVICE SECURITY:\n• Keep devices physically secure\n• Install security updates promptly\n• Use only company-approved cloud services\n\nACCESS CONTROLS:\n• Access only information necessary for job duties\n• Log out when away from workstation\n• Follow clean desk policy\n\nI understand that failure to comply with these policies may result in disciplinary action and potential legal consequences.\n\nEmployee Signature: _____________________  Date: _________\n\nPrint Name: ____________________________`,
      metadata: {
        author: 'IT Security Team',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-12T00:00:00Z',
        tags: ['security', 'IT', 'policy'],
        category: 'Security Documents',
        description: 'IT security policy agreement and acknowledgment',
        version: 2,
        status: 'approved' as const,
        accessLevel: 'internal' as const,
        downloadCount: 0,
        viewCount: 0,
        rating: 5,
        comments: 0
      }
    },
    remoteWorkPolicy: {
      id: 'remote_001',
      title: 'Remote Work Policy Agreement',
      type: 'pdf' as const,
      size: 1123456,
      url: '/documents/remote-work-policy.pdf',
      content: `REMOTE WORK POLICY AGREEMENT\n\nI understand and agree to the following terms for remote work:\n\nWORK ENVIRONMENT:\n• Maintain a professional, distraction-free workspace\n• Ensure reliable internet connectivity\n• Provide adequate lighting and ergonomic setup\n\nCOMMUNICATION:\n• Be available during core business hours\n• Respond to messages within reasonable timeframes\n• Participate actively in video conferences\n\nPRODUCTIVITY:\n• Maintain the same work standards as in-office\n• Complete all assigned tasks and meet deadlines\n• Track time accurately if required\n\nSECURITY:\n• Use VPN when accessing company systems\n• Secure all devices and documents\n• Follow IT security policies\n\nI understand that remote work is a privilege that may be revoked at any time.\n\nEmployee Signature: _____________________  Date: _________\n\nPrint Name: ____________________________`,
      metadata: {
        author: 'HR Department',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-08T00:00:00Z',
        tags: ['remote', 'work', 'policy'],
        category: 'HR Documents',
        description: 'Remote work policy and agreement terms',
        version: 1,
        status: 'approved' as const,
        accessLevel: 'internal' as const,
        downloadCount: 0,
        viewCount: 0,
        rating: 5,
        comments: 0
      }
    },
    nonCompeteAgreement: {
      id: 'noncompete_001',
      title: 'Non-Compete Agreement',
      type: 'pdf' as const,
      size: 2234567,
      url: '/documents/non-compete-agreement.pdf',
      content: `NON-COMPETE AGREEMENT\n\nI agree to the following non-compete terms:\n\nNON-COMPETITION:\n• During employment and for 12 months after termination\n• Will not work for direct competitors\n• Will not solicit company customers or employees\n• Will not start competing business\n\nCONFIDENTIALITY:\n• Protect all proprietary information\n• Do not disclose trade secrets\n• Return all company materials upon termination\n\nNON-SOLICITATION:\n• Will not recruit company employees\n• Will not contact clients for competing purposes\n• Will not interfere with business relationships\n\nThis agreement is binding and enforceable according to applicable state laws.\n\nI acknowledge that I have read and understood this agreement and agree to be bound by its terms.\n\nEmployee Signature: _____________________  Date: _________\n\nPrint Name: ____________________________\n\nWitness Signature: ______________________  Date: _________`,
      metadata: {
        author: 'Legal Department',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-05T00:00:00Z',
        tags: ['noncompete', 'legal', 'agreement'],
        category: 'Legal Documents',
        description: 'Non-compete and confidentiality agreement',
        version: 1,
        status: 'approved' as const,
        accessLevel: 'restricted' as const,
        downloadCount: 0,
        viewCount: 0,
        rating: 5,
        comments: 0
      }
    }
  }

  const handleDigitalSignature = (agreementType: string) => {
    // Show PDF viewer first for document review
    const document = signatureDocuments[agreementType as keyof typeof signatureDocuments]
    if (document) {
      setSelectedDocument(document)
      setCurrentDocumentToSign(agreementType)
      setShowPdfViewer(true)
    }
  }

  const confirmDigitalSignature = () => {
    if (!currentDocumentToSign) return

    const timestamp = new Date().toISOString()
    const ipAddress = '192.168.1.1' // In production, get actual IP

    setDigitalSignatures(prev => ({
      ...prev,
      [currentDocumentToSign]: {
        signed: true,
        timestamp,
        ipAddress
      }
    }))

    // Close PDF viewer and reset state
    setShowPdfViewer(false)
    setCurrentDocumentToSign(null)
    setSelectedDocument(null)
  }

  const cancelSignature = () => {
    setShowPdfViewer(false)
    setCurrentDocumentToSign(null)
    setSelectedDocument(null)
  }

  // Phase 3: Compliance Status Update
  const handleComplianceUpdate = (checkType: string, status: string, notes: string = '') => {
    setCompliance(prev => ({
      ...prev,
      [checkType]: {
        ...prev[checkType as keyof typeof prev],
        status,
        date: new Date().toISOString().split('T')[0],
        notes
      }
    }))
  }

  const handleSubmit = async () => {
    // Skip Phase 1 validation if we're on Phase 3 (documentation phase)
    // In Phase 3, we're completing documentation and compliance, not personal info
    if (currentPhase !== 3) {
      if (!validateForm(onboardingData)) {
        setApiError('Please fix the validation errors before submitting.')
        return
      }
    }
    
    setIsSubmitting(true)
    setApiError(null)
    clearErrors()
    
    try {
      const response = await onboardingApi.submitOnboarding({
        ...onboardingData,
        recruitId,
        phase: currentPhase
      })
      
      // SECURITY: console statement removed: console.log('Onboarding submission successful:', response)
      setSubmitSuccess(true)
      
      // Close modal after success delay
      setTimeout(() => {
        onClose()
        setSubmitSuccess(false)
      }, 2000)
      
    } catch (error) {
      // SECURITY: console statement removed: console.error('Error submitting onboarding:', error)
      
      if (error instanceof ApiValidationError) {
        // Set field-specific errors
        const fieldErrors = getFieldErrors(error)
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setFieldError(field, message)
        })
        setApiError('Please fix the validation errors and try again.')
      } else {
        setApiError(getErrorMessage(error))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveForLater = async () => {
    setIsSaving(true)
    setApiError(null)
    setSaveSuccess(false)

    try {
      const response = await onboardingApi.submitOnboarding({
        ...onboardingData,
        recruitId,
        phase: currentPhase,
        status: 'draft', // Save as draft instead of completing
        documents,
        digitalSignatures,
        compliance,
        offerDetails
      })

      setSaveSuccess(true)

      // Show success message briefly, then close
      setTimeout(() => {
        onClose()
        setSaveSuccess(false)
      }, 2000)

    } catch (error) {
      if (error instanceof ApiValidationError) {
        setApiError('Some validation errors were found, but progress has been saved.')
        setSaveSuccess(true)
      } else {
        setApiError('Failed to save progress. Please try again.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">New Employee Onboarding</h2>
                <p className="text-slate-400">Phase {currentPhase} of 3 - Setting up new hire</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 flex items-center space-x-4">
              {[1, 2, 3].map((phase) => (
                <div key={phase} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    phase < currentPhase 
                      ? 'bg-green-500 text-white' 
                      : phase === currentPhase 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-slate-700 text-slate-400'
                  }`}>
                    {phase < currentPhase ? <CheckCircle className="h-4 w-4" /> : phase}
                  </div>
                  {phase < 3 && (
                    <div className={`w-12 h-1 rounded-full mx-2 ${
                      phase < currentPhase ? 'bg-green-500' : 'bg-slate-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading recruitment data...</p>
              {retryCount > 0 && (
                <p className="text-xs text-slate-500 mt-2">Retry attempt {retryCount}</p>
              )}
            </div>
          ) : apiError ? (
            <div className="p-12 text-center">
              <div className="mb-4">
                {networkError ? (
                  <WifiOff className="h-12 w-12 text-red-400 mx-auto mb-4" />
                ) : (
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {networkError ? 'Connection Error' : 'Error Loading Data'}
              </h3>
              <p className="text-slate-400 mb-4">{apiError}</p>
              <button
                onClick={retryFetchData}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2 mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry</span>
              </button>
            </div>
          ) : (
            <div className="p-6">
              {/* Phase 1: Basic Information */}
              {currentPhase === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                    
                    {/* Auto-populated fields from recruitment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          <User className="h-4 w-4 inline mr-1" />
                          First Name
                        </label>
                        <input
                          type="text"
                          value={onboardingData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none ${
                            errors.firstName 
                              ? 'border-red-500 focus:border-red-500' 
                              : 'border-slate-700 focus:border-blue-500'
                          }`}
                          placeholder="John"
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-400 flex items-center space-x-1">
                            <AlertCircle className="h-3 w-3" />
                            <span>{errors.firstName}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={onboardingData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none ${
                            errors.lastName 
                              ? 'border-red-500 focus:border-red-500' 
                              : 'border-slate-700 focus:border-blue-500'
                          }`}
                          placeholder="Smith"
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-400 flex items-center space-x-1">
                            <AlertCircle className="h-3 w-3" />
                            <span>{errors.lastName}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          <Mail className="h-4 w-4 inline mr-1" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={onboardingData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          placeholder="employee@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          <Phone className="h-4 w-4 inline mr-1" />
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={onboardingData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    {/* New onboarding-specific fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Recruitment Date
                        </label>
                        <input
                          type="date"
                          value={onboardingData.recruitmentDate}
                          onChange={(e) => handleInputChange('recruitmentDate', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Total Experience (Years)
                        </label>
                        <input
                          type="number"
                          value={onboardingData.totalExperience}
                          onChange={(e) => handleInputChange('totalExperience', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          placeholder="7"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          <Flag className="h-4 w-4 inline mr-1" />
                          Visa Status
                        </label>
                        <select
                          value={onboardingData.visaStatus}
                          onChange={(e) => handleInputChange('visaStatus', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Select Visa Status</option>
                          <option value="US_CITIZEN">US Citizen</option>
                          <option value="PERMANENT_RESIDENT">Permanent Resident</option>
                          <option value="H1B">H-1B Visa</option>
                          <option value="L1">L-1 Visa</option>
                          <option value="TN">TN Visa</option>
                          <option value="F1_OPT">F-1 OPT</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          <Briefcase className="h-4 w-4 inline mr-1" />
                          Employee Type
                        </label>
                        <select
                          value={onboardingData.employeeType}
                          onChange={(e) => handleInputChange('employeeType', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="full-time">Full-time Employee</option>
                          <option value="contractor">Contractor</option>
                          <option value="part-time">Part-time</option>
                          <option value="intern">Intern</option>
                        </select>
                      </div>
                    </div>

                    {/* Legal Identifier */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        <Key className="h-4 w-4 inline mr-1" />
                        Legal Identifier for Payroll
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select
                          value={onboardingData.legalIdentifier.type}
                          onChange={(e) => handleInputChange('legalIdentifier.type', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="SSN">SSN</option>
                          <option value="TIN">TIN</option>
                          <option value="ITIN">ITIN</option>
                          <option value="EIN">EIN</option>
                        </select>
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={onboardingData.legalIdentifier.number}
                            onChange={(e) => handleInputChange('legalIdentifier.number', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            placeholder="XXX-XX-XXXX"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Travel Limitations */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        <Plane className="h-4 w-4 inline mr-1" />
                        Travel Limitations
                      </label>
                      <textarea
                        value={onboardingData.travelLimitations}
                        onChange={(e) => handleInputChange('travelLimitations', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        rows={3}
                        placeholder="Any travel restrictions, passport limitations, or geographic constraints..."
                      />
                    </div>

                    {/* Specialty Keywords */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        <Hash className="h-4 w-4 inline mr-1" />
                        Specialty Keywords for Tracking
                      </label>
                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Add keyword (e.g., PLC, SCADA, Automation)"
                            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addKeyword((e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = ''
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              const input = document.querySelector('input[placeholder*="Add keyword"]') as HTMLInputElement
                              if (input?.value) {
                                addKeyword(input.value)
                                input.value = ''
                              }
                            }}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        {onboardingData.specialtyKeywords.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {onboardingData.specialtyKeywords.map((keyword, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center space-x-1"
                              >
                                <span>{keyword}</span>
                                <button
                                  onClick={() => removeKeyword(index)}
                                  className="hover:text-red-300"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Phase 2: Offer Letter Generation */}
              {currentPhase === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-400" />
                      Offer Letter Details
                    </h3>
                    
                    {/* Position & Department */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          <Briefcase className="h-4 w-4 inline mr-1" />
                          Job Title *
                        </label>
                        <input
                          type="text"
                          value={offerDetails.jobTitle || ''}
                          onChange={(e) => setOfferDetails({...offerDetails, jobTitle: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          placeholder="Senior Controls Engineer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          <Building className="h-4 w-4 inline mr-1" />
                          Department *
                        </label>
                        <select
                          value={offerDetails.department || ''}
                          onChange={(e) => setOfferDetails({...offerDetails, department: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Select Department</option>
                          <option value="controls">Controls Engineering</option>
                          <option value="mechanical">Mechanical Engineering</option>
                          <option value="electrical">Electrical Engineering</option>
                          <option value="robotics">Robotics</option>
                          <option value="software">Software Engineering</option>
                        </select>
                      </div>
                    </div>

                    {/* Compensation Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          <DollarSign className="h-4 w-4 inline mr-1" />
                          Hourly Rate *
                        </label>
                        <input
                          type="number"
                          value={offerDetails.hourlyRate || ''}
                          onChange={(e) => setOfferDetails({...offerDetails, hourlyRate: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          placeholder="85"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Hours per Week
                        </label>
                        <input
                          type="number"
                          value={offerDetails.hoursPerWeek || 40}
                          onChange={(e) => setOfferDetails({...offerDetails, hoursPerWeek: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          placeholder="40"
                          min="0"
                          max="60"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Start Date *
                        </label>
                        <input
                          type="date"
                          value={offerDetails.startDate || ''}
                          onChange={(e) => setOfferDetails({...offerDetails, startDate: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Key Responsibilities */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        <Target className="h-4 w-4 inline mr-1" />
                        Key Responsibilities *
                      </label>
                      <textarea
                        value={offerDetails.responsibilities || ''}
                        onChange={(e) => setOfferDetails({...offerDetails, responsibilities: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        rows={4}
                        placeholder="• Design and implement control systems&#10;• Collaborate with cross-functional teams&#10;• Troubleshoot and optimize automation processes"
                      />
                    </div>

                    {/* Requirements */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Requirements *
                      </label>
                      <textarea
                        value={offerDetails.requirements || ''}
                        onChange={(e) => setOfferDetails({...offerDetails, requirements: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        rows={4}
                        placeholder="• Bachelor's degree in relevant field&#10;• 5+ years of experience&#10;• Proficiency in PLC programming"
                      />
                    </div>

                    {/* Expectations */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        <Award className="h-4 w-4 inline mr-1" />
                        Expectations
                      </label>
                      <textarea
                        value={offerDetails.expectations || ''}
                        onChange={(e) => setOfferDetails({...offerDetails, expectations: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        rows={3}
                        placeholder="Performance expectations and goals for the first 90 days"
                      />
                    </div>

                    {/* Contract Type & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          <FileText className="h-4 w-4 inline mr-1" />
                          Contract Type *
                        </label>
                        <select
                          value={offerDetails.contractType || ''}
                          onChange={(e) => setOfferDetails({...offerDetails, contractType: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Select Contract Type</option>
                          <option value="w2">W-2 Employee</option>
                          <option value="1099">1099 Contractor</option>
                          <option value="c2c">Corp-to-Corp</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          <MapPin className="h-4 w-4 inline mr-1" />
                          Work Location *
                        </label>
                        <input
                          type="text"
                          value={offerDetails.workLocation || ''}
                          onChange={(e) => setOfferDetails({...offerDetails, workLocation: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          placeholder="Chicago, IL (Remote/Hybrid/Onsite)"
                        />
                      </div>
                    </div>

                    {/* Smart Contract Options */}
                    <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center text-sm font-medium text-slate-300">
                          <Shield className="h-4 w-4 mr-2 text-green-400" />
                          Enable Blockchain Contract (Polygon)
                        </label>
                        <Switch
                          checked={offerDetails.enableSmartContract || false}
                          onCheckedChange={(checked) => setOfferDetails({...offerDetails, enableSmartContract: checked})}
                        />
                      </div>
                      {offerDetails.enableSmartContract && (
                        <div className="text-xs text-slate-400 space-y-1">
                          <p>• Contract will be deployed on Polygon network</p>
                          <p>• Automated milestone-based payments</p>
                          <p>• Immutable contract terms</p>
                          <p>• Multi-signature approval required</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4">
                      <button
                        onClick={handleGenerateOfferLetter}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Offer Letter
                          </>
                        )}
                      </button>
                      
                      {offerLetterGenerated && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handlePreviewPDF}
                            className="flex items-center px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </button>
                          <button
                            onClick={handleDownloadPDF}
                            className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Phase 3: Documentation & Compliance */}
              {currentPhase === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <FileCheck className="h-5 w-5 mr-2 text-green-400" />
                      Documentation & Compliance Setup
                    </h3>

                    {/* Required Documents Section */}
                    <div className="mb-8">
                      <h4 className="text-md font-medium text-white mb-4 flex items-center">
                        <Upload className="h-4 w-4 mr-2 text-blue-400" />
                        Required Documents
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries({
                          i9: 'I-9 Employment Eligibility Verification',
                          w4: 'W-4 Federal Tax Withholding',
                          stateWithholding: 'State Tax Withholding Forms',
                          directDeposit: 'Direct Deposit Authorization',
                          emergencyContacts: 'Emergency Contact Information',
                          workAuthorization: 'Work Authorization Documentation'
                        }).map(([key, label]) => (
                          <div key={key} className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">{label}</span>
                              {documents[key as keyof typeof documents].uploaded ? (
                                <BadgeCheck className="h-4 w-4 text-green-400" />
                              ) : (
                                <FilePlus className="h-4 w-4 text-slate-400" />
                              )}
                            </div>

                            {documents[key as keyof typeof documents].uploaded ? (
                              <div className="flex items-center space-x-2 text-xs text-green-400">
                                <CheckCircle className="h-3 w-3" />
                                <span>{documents[key as keyof typeof documents].name}</span>
                              </div>
                            ) : (
                              <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.doc,.docx,.jpg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleDocumentUpload(key, file)
                                  }}
                                />
                                <div className="text-center">
                                  <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                                  <span className="text-xs text-slate-400">Click to upload</span>
                                </div>
                              </label>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Digital Signatures Section */}
                    <div className="mb-8">
                      <h4 className="text-md font-medium text-white mb-4 flex items-center">
                        <FileSignature className="h-4 w-4 mr-2 text-purple-400" />
                        Digital Signatures Required
                      </h4>

                      <div className="space-y-3">
                        {Object.entries({
                          employeeHandbook: 'Employee Handbook Acknowledgment',
                          codeOfConduct: 'Code of Conduct Agreement',
                          itSecurityPolicy: 'IT Security Policy',
                          remoteWorkPolicy: 'Remote Work Policy',
                          nonCompeteAgreement: 'Non-Compete Agreement'
                        }).map(([key, label]) => (
                          <div key={key} className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div>
                                <p className="text-sm font-medium text-white">{label}</p>
                                {digitalSignatures[key as keyof typeof digitalSignatures].signed && (
                                  <p className="text-xs text-slate-400">
                                    Signed on {new Date(digitalSignatures[key as keyof typeof digitalSignatures].timestamp).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>

                            {digitalSignatures[key as keyof typeof digitalSignatures].signed ? (
                              <div className="flex items-center space-x-2 text-green-400">
                                <Signature className="h-4 w-4" />
                                <span className="text-sm">Signed</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleDigitalSignature(key)}
                                className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                              >
                                <Signature className="h-3 w-3" />
                                <span>Sign</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Compliance Checks Section */}
                    <div className="mb-8">
                      <h4 className="text-md font-medium text-white mb-4 flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-red-400" />
                        Background & Compliance Checks
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries({
                          backgroundCheck: 'Background Check',
                          drugScreening: 'Drug Screening',
                          referenceChecks: 'Reference Verification',
                          educationVerification: 'Education Verification',
                          employmentVerification: 'Employment History',
                          criminalHistory: 'Criminal History Check'
                        }).map(([key, label]) => (
                          <div key={key} className="p-3 bg-slate-800/30 border border-slate-700 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">{label}</span>
                              <div className={`px-2 py-1 rounded text-xs ${
                                compliance[key as keyof typeof compliance].status === 'completed'
                                  ? 'bg-green-500/20 text-green-400'
                                  : compliance[key as keyof typeof compliance].status === 'in_progress'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : compliance[key as keyof typeof compliance].status === 'failed'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-slate-500/20 text-slate-400'
                              }`}>
                                {compliance[key as keyof typeof compliance].status.replace('_', ' ')}
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleComplianceUpdate(key, 'in_progress')}
                                className="flex-1 px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs hover:bg-yellow-600/30 transition-colors"
                              >
                                In Progress
                              </button>
                              <button
                                onClick={() => handleComplianceUpdate(key, 'completed')}
                                className="flex-1 px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs hover:bg-green-600/30 transition-colors"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleComplianceUpdate(key, 'failed')}
                                className="flex-1 px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs hover:bg-red-600/30 transition-colors"
                              >
                                Failed
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Completion Summary */}
                    <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                      <h4 className="text-md font-medium text-white mb-3 flex items-center">
                        <CheckSquare className="h-4 w-4 mr-2 text-blue-400" />
                        Completion Summary
                      </h4>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-400">
                            {Object.values(documents).filter(doc => doc.uploaded).length}/
                            {Object.values(documents).length}
                          </div>
                          <div className="text-xs text-slate-400">Documents</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-400">
                            {Object.values(digitalSignatures).filter(sig => sig.signed).length}/
                            {Object.values(digitalSignatures).length}
                          </div>
                          <div className="text-xs text-slate-400">Signatures</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-400">
                            {Object.values(compliance).filter(check => check.status === 'completed').length}/
                            {Object.values(compliance).length}
                          </div>
                          <div className="text-xs text-slate-400">Checks</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Error/Success Display */}
          {(apiError || submitSuccess || saveSuccess) && (
            <div className="px-6 py-3 border-t border-slate-700 bg-slate-800/50">
              {submitSuccess ? (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Onboarding submitted successfully!</span>
                </div>
              ) : saveSuccess ? (
                <div className="flex items-center space-x-2 text-blue-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Progress saved successfully! You can return to complete this later.</span>
                </div>
              ) : apiError ? (
                <div className="flex items-start space-x-2 text-red-400">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Submission Error</p>
                    <p className="text-xs text-red-300 mt-1">{apiError}</p>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Footer */}
          <div className="p-6 border-t border-slate-700 flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentPhase === 1 || isSubmitting}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              {currentPhase < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveForLater}
                    disabled={isSaving || saveSuccess || isSubmitting}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : saveSuccess ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4" />
                        <span>Save for Later</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || submitSuccess || isSaving}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : submitSuccess ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Submitted!</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Complete Onboarding</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* PDF Viewer for Digital Signatures */}
      {showPdfViewer && selectedDocument && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex flex-col">
          <DocumentViewer
            isOpen={showPdfViewer}
            onClose={cancelSignature}
            document={selectedDocument}
            documents={[selectedDocument]}
          />

          {/* Custom Action Bar for Digital Signature */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent p-6">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileSignature className="h-5 w-5 text-purple-400" />
                <div>
                  <h3 className="text-white font-medium">Digital Signature Required</h3>
                  <p className="text-slate-400 text-sm">
                    Please review the document above before signing
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={cancelSignature}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDigitalSignature}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center space-x-2"
                >
                  <Signature className="h-4 w-4" />
                  <span>Sign Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}