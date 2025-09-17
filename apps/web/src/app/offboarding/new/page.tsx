'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft,
  User,
  Building2,
  Calendar,
  FileText,
  DollarSign,
  AlertTriangle,
  Save,
  Send,
  Plus,
  X
} from 'lucide-react'
import { OptimizedLink } from '@/components/optimized-link'
import type { OffboardingType, OffboardingRequest } from '../page'

const offboardingTypes: { value: OffboardingType; label: string; description: string }[] = [
  {
    value: 'PROJECT_COMPLETION',
    label: 'Project Completion',
    description: 'Project has been successfully completed and delivered'
  },
  {
    value: 'PROJECT_PAUSE',
    label: 'Project Pause',
    description: 'Temporary pause of project activities'
  },
  {
    value: 'PROJECT_TERMINATION',
    label: 'Project Termination',
    description: 'Project is being terminated before completion'
  },
  {
    value: 'CUSTOMER_TERMINATION',
    label: 'Customer Termination',
    description: 'Customer has terminated the contract'
  },
  {
    value: 'OPERATOR_TERMINATION',
    label: 'Operator Termination',
    description: 'Employee terminated by operator decision'
  },
  {
    value: 'ADMIN_TERMINATION',
    label: 'Admin Termination',
    description: 'Employee terminated by administrative decision'
  },
  {
    value: 'VOLUNTARY_DEPARTURE',
    label: 'Voluntary Departure',
    description: 'Employee voluntary resignation or departure'
  }
]

// Mock data for dropdowns (in production, fetch from APIs)
const engineers = [
  { id: 'eng-001', name: 'John Smith', role: 'Senior Engineering Consultant' },
  { id: 'eng-002', name: 'Maria Garcia', role: 'Manufacturing Engineer' },
  { id: 'eng-003', name: 'David Chen', role: 'Automation Specialist' },
  { id: 'eng-004', name: 'Lisa Johnson', role: 'Quality Engineer' },
  { id: 'eng-005', name: 'Mike Wilson', role: 'Systems Integration Engineer' }
]

const projects = [
  { id: 'proj-gm-001', name: 'GM Assembly Line Automation', client: 'General Motors' },
  { id: 'proj-ford-002', name: 'Ford Paint Shop Upgrade', client: 'Ford Motor Company' },
  { id: 'proj-stellantis-003', name: 'Stellantis QC System', client: 'Stellantis' },
  { id: 'proj-hirotec-004', name: 'HIROTEC Welding System', client: 'HIROTEC America' }
]

interface FormData {
  type: OffboardingType | ''
  engineerId: string
  projectId: string
  scheduledDate: string
  reason: string
  notes: string
  documents: string[]
  handoverTasks: { task: string; assignedTo: string }[]
  financialImpact: {
    expectedRefunds: number
    expectedPenalties: number
    finalPayment: number
  }
}

export default function NewOffboardingPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    type: '',
    engineerId: '',
    projectId: '',
    scheduledDate: '',
    reason: '',
    notes: '',
    documents: [],
    handoverTasks: [
      { task: '', assignedTo: '' }
    ],
    financialImpact: {
      expectedRefunds: 0,
      expectedPenalties: 0,
      finalPayment: 0
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedEngineer = engineers.find(e => e.id === formData.engineerId)
  const selectedProject = projects.find(p => p.id === formData.projectId)
  const selectedType = offboardingTypes.find(t => t.value === formData.type)

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFinancialChange = (field: keyof FormData['financialImpact'], value: number) => {
    setFormData(prev => ({
      ...prev,
      financialImpact: {
        ...prev.financialImpact,
        [field]: value
      }
    }))
  }

  const addHandoverTask = () => {
    setFormData(prev => ({
      ...prev,
      handoverTasks: [...prev.handoverTasks, { task: '', assignedTo: '' }]
    }))
  }

  const removeHandoverTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      handoverTasks: prev.handoverTasks.filter((_, i) => i !== index)
    }))
  }

  const updateHandoverTask = (index: number, field: 'task' | 'assignedTo', value: string) => {
    setFormData(prev => ({
      ...prev,
      handoverTasks: prev.handoverTasks.map((task, i) => 
        i === index ? { ...task, [field]: value } : task
      )
    }))
  }

  const addDocument = (document: string) => {
    if (document && !formData.documents.includes(document)) {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, document]
      }))
    }
  }

  const removeDocument = (document: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d !== document)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.type) newErrors.type = 'Off-boarding type is required'
    if (!formData.engineerId) newErrors.engineerId = 'Engineer selection is required'
    if (!formData.projectId) newErrors.projectId = 'Project selection is required'
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required'
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Scheduled date is required'

    // Validate handover tasks
    const validTasks = formData.handoverTasks.filter(task => task.task.trim() && task.assignedTo.trim())
    if (validTasks.length === 0) {
      newErrors.handoverTasks = 'At least one handover task is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!isDraft && !validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // In production, submit to API
      const submissionData = {
        ...formData,
        status: isDraft ? 'DRAFT' : 'PENDING',
        initiatedBy: 'Current User', // Get from auth context
        initiatedDate: new Date().toISOString().split('T')[0],
        handoverTasks: formData.handoverTasks
          .filter(task => task.task.trim() && task.assignedTo.trim())
          .map((task, index) => ({
            id: `task-${index + 1}`,
            task: task.task,
            assignedTo: task.assignedTo,
            status: 'pending' as const
          }))
      }

      console.log('Submitting off-boarding request:', submissionData)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      router.push('/offboarding')
    } catch (error) {
      console.error('Error submitting off-boarding request:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <OptimizedLink href="/offboarding">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Off-boarding
          </Button>
        </OptimizedLink>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">New Off-boarding Request</h1>
          <p className="text-gray-600">Create a new off-boarding request for project or employee</p>
        </div>
      </div>

      <form className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Off-boarding Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Off-boarding Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select off-boarding type</option>
                  {offboardingTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {selectedType && (
                  <p className="text-sm text-gray-600 mt-1">{selectedType.description}</p>
                )}
                {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type}</p>}
              </div>

              {/* Scheduled Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.scheduledDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.scheduledDate && <p className="text-sm text-red-600 mt-1">{errors.scheduledDate}</p>}
              </div>

              {/* Engineer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engineer *
                </label>
                <select
                  value={formData.engineerId}
                  onChange={(e) => handleInputChange('engineerId', e.target.value)}
                  className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.engineerId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select engineer</option>
                  {engineers.map(engineer => (
                    <option key={engineer.id} value={engineer.id}>
                      {engineer.name} - {engineer.role}
                    </option>
                  ))}
                </select>
                {errors.engineerId && <p className="text-sm text-red-600 mt-1">{errors.engineerId}</p>}
              </div>

              {/* Project Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project *
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => handleInputChange('projectId', e.target.value)}
                  className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.projectId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.client}
                    </option>
                  ))}
                </select>
                {errors.projectId && <p className="text-sm text-red-600 mt-1">{errors.projectId}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reason and Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Reason and Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Off-boarding *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                placeholder="Provide detailed reason for the off-boarding request..."
                rows={4}
                className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.reason ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.reason && <p className="text-sm text-red-600 mt-1">{errors.reason}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional information or special considerations..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Handover Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Handover Tasks
              </div>
              <Button type="button" onClick={addHandoverTask} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.handoverTasks.map((task, index) => (
              <div key={index} className="flex gap-4 items-start p-4 border border-gray-200 rounded-lg">
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    placeholder="Task description"
                    value={task.task}
                    onChange={(e) => updateHandoverTask(index, 'task', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Assigned to (person or team)"
                    value={task.assignedTo}
                    onChange={(e) => updateHandoverTask(index, 'assignedTo', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {formData.handoverTasks.length > 1 && (
                  <Button 
                    type="button" 
                    onClick={() => removeHandoverTask(index)} 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {errors.handoverTasks && <p className="text-sm text-red-600">{errors.handoverTasks}</p>}
          </CardContent>
        </Card>

        {/* Financial Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Impact (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Final Payment
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.financialImpact.finalPayment}
                  onChange={(e) => handleFinancialChange('finalPayment', parseFloat(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Refunds
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.financialImpact.expectedRefunds}
                  onChange={(e) => handleFinancialChange('expectedRefunds', parseFloat(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Penalties
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.financialImpact.expectedPenalties}
                  onChange={(e) => handleFinancialChange('expectedPenalties', parseFloat(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button 
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </div>
  )
}