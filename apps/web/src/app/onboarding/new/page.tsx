'use client'
// export const runtime = 'edge'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  User, MapPin, FileText, Upload, Calendar, Phone, Mail,
  Globe, Plane, Car, Clock, Shield, CheckCircle, AlertCircle,
  Camera, Scan, Eye, Download, X, Plus, Trash2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { OnboardingForm, IdentityDocumentType, VisaStatusType, EngineerCategory } from '@humber/types'

interface UploadedDocument {
  id: string
  file: File
  type: IdentityDocumentType
  preview: string
  ocrProcessed: boolean
  ocrData?: any
}

const documentTypes: { value: IdentityDocumentType; label: string }[] = [
  { value: 'drivers_license', label: 'Driver\'s License' },
  { value: 'state_id', label: 'State ID' },
  { value: 'passport', label: 'Passport' },
  { value: 'visa', label: 'Visa' },
  { value: 'work_permit', label: 'Work Permit' },
  { value: 'green_card', label: 'Green Card' },
  { value: 'social_security_card', label: 'Social Security Card' },
  { value: 'birth_certificate', label: 'Birth Certificate' }
]

const visaStatuses: { value: VisaStatusType; label: string }[] = [
  { value: 'citizen', label: 'Citizen' },
  { value: 'permanent_resident', label: 'Permanent Resident' },
  { value: 'work_visa', label: 'Work Visa' },
  { value: 'student_visa', label: 'Student Visa' },
  { value: 'tourist_visa', label: 'Tourist Visa' },
  { value: 'asylum', label: 'Asylum' },
  { value: 'refugee', label: 'Refugee' },
  { value: 'pending', label: 'Pending' },
  { value: 'expired', label: 'Expired' },
  { value: 'none_required', label: 'None Required' }
]

const engineerCategories: { value: EngineerCategory; label: string }[] = [
  { value: 'ELECTRICAL_ENGINEER', label: 'Electrical Engineer' },
  { value: 'MECHANICAL_ENGINEER', label: 'Mechanical Engineer' },
  { value: 'SOFTWARE_ENGINEER', label: 'Software Engineer' },
  { value: 'SYSTEMS_ENGINEER', label: 'Systems Engineer' },
  { value: 'PROJECT_ENGINEER', label: 'Project Engineer' }
]

export default function NewOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState<Partial<OnboardingForm>>({
    identityDocuments: [],
    skills: [],
    previousEmployers: []
  })

  const handleFileUpload = useCallback((files: FileList | null, documentType: IdentityDocumentType) => {
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newDocument: UploadedDocument = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            type: documentType,
            preview: e.target?.result as string,
            ocrProcessed: false
          }
          setUploadedDocuments(prev => [...prev, newDocument])
        }
        reader.readAsDataURL(file)
      }
    })
  }, [])

  const processOCR = async (documentId: string) => {
    setIsProcessing(true)
    try {
      const document = uploadedDocuments.find(doc => doc.id === documentId)
      if (!document) {
        throw new Error('Document not found')
      }

      const formData = new FormData()
      formData.append('file', document.file)
      formData.append('documentType', document.type)
      formData.append('tenantId', 'default') // You would get this from your auth context
      formData.append('onboardingId', 'temp-' + Date.now()) // Generate or get actual onboarding ID

      const response = await fetch('/api/onboarding/process-ocr', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('OCR processing failed')
      }

      const result = await response.json()
      
      if (result.success) {
        setUploadedDocuments(prev => 
          prev.map(doc => 
            doc.id === documentId 
              ? { 
                  ...doc, 
                  ocrProcessed: true, 
                  ocrData: result.data
                }
              : doc
          )
        )

        // Auto-populate form fields with extracted data
        if (result.data.extractedFields) {
          const fields = result.data.extractedFields
          setFormData(prev => ({
            ...prev,
            firstName: prev.firstName || fields.firstName,
            lastName: prev.lastName || fields.lastName,
            dateOfBirth: prev.dateOfBirth || fields.dateOfBirth,
            currentLocation: {
              ...prev.currentLocation,
              address: prev.currentLocation?.address || fields.address,
              city: prev.currentLocation?.city || fields.city,
              state: prev.currentLocation?.state || fields.state,
              zipCode: prev.currentLocation?.zipCode || fields.zipCode,
              country: prev.currentLocation?.country || fields.country || 'US'
            } as any
          }))
        }
      } else {
        throw new Error(result.error || 'OCR processing failed')
      }
    } catch (error) {
      // SECURITY: console statement removed: console.error('OCR processing failed:', error)
      // Show error to user
      alert('OCR processing failed. Please try again or enter information manually.')
    }
    setIsProcessing(false)
  }

  const removeDocument = (documentId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }

  const steps = [
    { number: 1, title: 'Personal Information', icon: User },
    { number: 2, title: 'Location & Travel', icon: MapPin },
    { number: 3, title: 'Passport & Visa', icon: Globe },
    { number: 4, title: 'Identity Documents', icon: FileText },
    { number: 5, title: 'Skills & Experience', icon: Shield },
    { number: 6, title: 'Availability', icon: Clock },
    { number: 7, title: 'Review & Submit', icon: CheckCircle }
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                <Input 
                  placeholder="Enter first name"
                  className="bg-slate-800 border-slate-600 text-white"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                <Input 
                  placeholder="Enter last name"
                  className="bg-slate-800 border-slate-600 text-white"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <Input 
                  type="email"
                  placeholder="Enter email address"
                  className="bg-slate-800 border-slate-600 text-white"
                  value={formData.email || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                <Input 
                  placeholder="Enter phone number"
                  className="bg-slate-800 border-slate-600 text-white"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Date of Birth</label>
                <Input 
                  type="date"
                  className="bg-slate-800 border-slate-600 text-white"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Engineer Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as EngineerCategory }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {engineerCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Current Location</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
                  <Input 
                    placeholder="Street address"
                    className="bg-slate-800 border-slate-600 text-white"
                    value={formData.currentLocation?.address || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      currentLocation: { ...prev.currentLocation, address: e.target.value } as any
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
                  <Input 
                    placeholder="City"
                    className="bg-slate-800 border-slate-600 text-white"
                    value={formData.currentLocation?.city || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      currentLocation: { ...prev.currentLocation, city: e.target.value } as any
                    }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">State/Province</label>
                  <Input 
                    placeholder="State"
                    className="bg-slate-800 border-slate-600 text-white"
                    value={formData.currentLocation?.state || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      currentLocation: { ...prev.currentLocation, state: e.target.value } as any
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">ZIP Code</label>
                  <Input 
                    placeholder="ZIP Code"
                    className="bg-slate-800 border-slate-600 text-white"
                    value={formData.currentLocation?.zipCode || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      currentLocation: { ...prev.currentLocation, zipCode: e.target.value } as any
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Country</label>
                  <Input 
                    placeholder="Country"
                    className="bg-slate-800 border-slate-600 text-white"
                    value={formData.currentLocation?.country || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      currentLocation: { ...prev.currentLocation, country: e.target.value } as any
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Willing to Relocate</label>
                <Switch 
                  checked={formData.willingToRelocate || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, willingToRelocate: checked }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Maximum Travel Distance (miles)</label>
                <Input 
                  type="number"
                  placeholder="Enter max travel distance"
                  className="bg-slate-800 border-slate-600 text-white"
                  value={formData.maxTravelDistance || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxTravelDistance: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Passport Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Passport Number</label>
                  <Input 
                    placeholder="Enter passport number"
                    className="bg-slate-800 border-slate-600 text-white"
                    value={formData.passport?.passportNumber || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      passport: { ...prev.passport, passportNumber: e.target.value } as any
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Issuing Country</label>
                  <Input 
                    placeholder="Issuing country"
                    className="bg-slate-800 border-slate-600 text-white"
                    value={formData.passport?.issuingCountry || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      passport: { ...prev.passport, issuingCountry: e.target.value } as any
                    }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Issue Date</label>
                  <Input 
                    type="date"
                    className="bg-slate-800 border-slate-600 text-white"
                    value={formData.passport?.issueDate || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      passport: { ...prev.passport, issueDate: e.target.value } as any
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Expiration Date</label>
                  <Input 
                    type="date"
                    className="bg-slate-800 border-slate-600 text-white"
                    value={formData.passport?.expirationDate || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      passport: { ...prev.passport, expirationDate: e.target.value } as any
                    }))}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Visa Status</h3>
              
              {['US', 'Canada', 'Mexico'].map(country => (
                <div key={country} className="mb-4 p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-white mb-3">{country}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                      <Select>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue placeholder="Select visa status" />
                        </SelectTrigger>
                        <SelectContent>
                          {visaStatuses.map(status => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Visa Number (if applicable)</label>
                      <Input 
                        placeholder="Enter visa number"
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Identity Documents</h3>
              <p className="text-slate-400 mb-6">
                Upload clear photos of your identity documents. Our OCR system will automatically extract information.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {documentTypes.map(docType => (
                  <div key={docType.value} className="p-4 bg-slate-800/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{docType.label}</span>
                      <FileText className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files, docType.value)}
                      className="hidden"
                      id={`upload-${docType.value}`}
                    />
                    <label
                      htmlFor={`upload-${docType.value}`}
                      className="flex items-center justify-center w-full py-2 px-4 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30 hover:bg-blue-500/30 cursor-pointer transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </label>
                  </div>
                ))}
              </div>

              {uploadedDocuments.length > 0 && (
                <div>
                  <h4 className="font-medium text-white mb-4">Uploaded Documents</h4>
                  <div className="space-y-4">
                    {uploadedDocuments.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-600">
                        <div className="flex items-center space-x-4">
                          <img src={doc.preview} alt="Document preview" className="w-16 h-16 object-cover rounded" />
                          <div>
                            <p className="font-medium text-white">{documentTypes.find(t => t.value === doc.type)?.label}</p>
                            <p className="text-sm text-slate-400">{doc.file.name}</p>
                            {doc.ocrProcessed ? (
                              <Badge className="bg-green-500/20 text-green-400 mt-1">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Processed
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-500/20 text-yellow-400 mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!doc.ocrProcessed && (
                            <Button
                              size="sm"
                              onClick={() => processOCR(doc.id)}
                              disabled={isProcessing}
                              className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                            >
                              <Scan className="h-4 w-4 mr-1" />
                              Process
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeDocument(doc.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Years of Experience</label>
              <Input 
                type="number"
                placeholder="Enter years of experience"
                className="bg-slate-800 border-slate-600 text-white"
                value={formData.yearsOfExperience || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Skills (one per line)</label>
              <Textarea 
                placeholder="Enter your skills..."
                rows={6}
                className="bg-slate-800 border-slate-600 text-white"
                value={formData.skills?.join('\n') || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value.split('\n').filter(s => s.trim()) }))}
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Available Start Date</label>
                <Input 
                  type="date"
                  className="bg-slate-800 border-slate-600 text-white"
                  value={formData.availability?.startDate || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    availability: { ...prev.availability, startDate: e.target.value } as any
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Hours Per Week</label>
                <Input 
                  type="number"
                  placeholder="40"
                  className="bg-slate-800 border-slate-600 text-white"
                  value={formData.availability?.hoursPerWeek || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    availability: { ...prev.availability, hoursPerWeek: parseInt(e.target.value) } as any
                  }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Shift Preference</label>
              <Select value={formData.availability?.shiftPreference} onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                availability: { ...prev.availability, shiftPreference: value as any } as any
              }))}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select shift preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day Shift</SelectItem>
                  <SelectItem value="night">Night Shift</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Available for Weekend Work</label>
                <Switch 
                  checked={formData.availability?.weekendAvailable || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    availability: { ...prev.availability, weekendAvailable: checked } as any
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Willing to Travel</label>
                <Switch 
                  checked={formData.travelRequirements?.willTravel || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    travelRequirements: { ...prev.travelRequirements, willTravel: checked } as any
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Have Valid Driver's License</label>
                <Switch 
                  checked={formData.travelRequirements?.hasValidDriversLicense || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    travelRequirements: { ...prev.travelRequirements, hasValidDriversLicense: checked } as any
                  }))}
                />
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-4">Review Your Information</h3>
              <p className="text-slate-400 mb-6">
                Please review all information before submitting your onboarding form.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Phone:</strong> {formData.phone}</p>
                  <p><strong>Category:</strong> {formData.category}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Location</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p><strong>City:</strong> {formData.currentLocation?.city}</p>
                  <p><strong>Country:</strong> {formData.currentLocation?.country}</p>
                  <p><strong>Willing to Relocate:</strong> {formData.willingToRelocate ? 'Yes' : 'No'}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Documents</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p><strong>Uploaded:</strong> {uploadedDocuments.length} documents</p>
                  <p><strong>Processed:</strong> {uploadedDocuments.filter(d => d.ocrProcessed).length} documents</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Availability</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p><strong>Start Date:</strong> {formData.availability?.startDate}</p>
                  <p><strong>Hours/Week:</strong> {formData.availability?.hoursPerWeek}</p>
                  <p><strong>Travel:</strong> {formData.travelRequirements?.willTravel ? 'Yes' : 'No'}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Engineer Onboarding
          </h1>
          <p className="text-slate-400">
            Complete your onboarding process to join our engineering team
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center">
                <div className={`
                  h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold
                  ${currentStep >= step.number 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-700 text-slate-400'
                  }
                `}>
                  {currentStep > step.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-2 text-center max-w-[80px]">
                  {step.title}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    h-0.5 w-16 mt-5 absolute
                    ${currentStep > step.number ? 'bg-blue-500' : 'bg-slate-700'}
                  `} style={{ left: `${(index + 1) * (100 / steps.length)}%` }} />
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              {(() => {
                const StepIcon = steps[currentStep - 1].icon;
                return <StepIcon className="h-6 w-6 mr-2" />;
              })()}
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
          >
            Previous
          </Button>
          
          {currentStep < steps.length ? (
            <Button
              onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={() => {
                // TODO: Submit form
                // SECURITY: console statement removed: console.log('Submitting onboarding form:', formData)
              }}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}