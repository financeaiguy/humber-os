'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  DollarSign,
  Star,
  Save,
  Loader2
} from 'lucide-react'

interface ContactInfo {
  name: string
  email: string
  phone: string
}

interface ProjectInfo {
  active: number
  completed: number
  totalValue: number
}

interface EngineerInfo {
  deployed: number
  categories: string[]
}

interface RelationshipInfo {
  satisfaction: number
}

interface CustomerFormData {
  name: string
  industry: string
  location: string
  contact: ContactInfo
  projects: ProjectInfo
  engineers: EngineerInfo
  relationship: RelationshipInfo
}

interface NewCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (customer: CustomerFormData) => void
}

export function NewCustomerModal({ isOpen, onClose, onSubmit }: NewCustomerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    industry: '',
    location: '',
    contact: {
      name: '',
      email: '',
      phone: ''
    },
    projects: {
      active: 0,
      completed: 0,
      totalValue: 0
    },
    engineers: {
      deployed: 0,
      categories: []
    },
    relationship: {
      satisfaction: 5.0
    }
  })

  const industryOptions = [
    'Automotive Manufacturing',
    'Automotive Supplier',
    'Aerospace & Defense',
    'Technology',
    'Healthcare',
    'Energy & Utilities',
    'Manufacturing',
    'Telecommunications',
    'Financial Services',
    'Other'
  ]

  const engineeringCategories = [
    'Electrical',
    'Mechanical',
    'Software',
    'Systems',
    'Project',
    'Robotics',
    'Quality',
    'Process',
    'Design',
    'Controls'
  ]

  const handleInputChange = (field: string, value: any, section?: keyof CustomerFormData) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      engineers: {
        ...prev.engineers,
        categories: prev.engineers.categories.includes(category)
          ? prev.engineers.categories.filter(c => c !== category)
          : [...prev.engineers.categories, category]
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.industry || !formData.contact.name || !formData.contact.email) {
        alert('Please fill in all required fields')
        return
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      onSubmit(formData)
      
      // Reset form
      setFormData({
        name: '',
        industry: '',
        location: '',
        contact: {
          name: '',
          email: '',
          phone: ''
        },
        projects: {
          active: 0,
          completed: 0,
          totalValue: 0
        },
        engineers: {
          deployed: 0,
          categories: []
        },
        relationship: {
          satisfaction: 5.0
        }
      })
    } catch (error) {
      // SECURITY: Removed console.error('Error creating customer:', error)
      alert('Failed to create customer. Please try again.')
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
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="fixed inset-4 lg:inset-8 bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div>
              <h2 className="text-2xl font-bold text-white">Add New Customer</h2>
              <p className="text-sm text-slate-400">Create a new customer profile</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-8">
              {/* Company Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-400" />
                  Company Information
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Industry *
                    </label>
                    <select
                      required
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select industry</option>
                      {industryOptions.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="City, State"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Contact */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-green-400" />
                  Primary Contact
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact.name}
                      onChange={(e) => handleInputChange('name', e.target.value, 'contact')}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={formData.contact.email}
                        onChange={(e) => handleInputChange('email', e.target.value, 'contact')}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="email@company.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="tel"
                        value={formData.contact.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value, 'contact')}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-yellow-400" />
                  Project Information
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Active Projects
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.projects.active}
                      onChange={(e) => handleInputChange('active', parseInt(e.target.value) || 0, 'projects')}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Completed Projects
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.projects.completed}
                      onChange={(e) => handleInputChange('completed', parseInt(e.target.value) || 0, 'projects')}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Total Project Value ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.projects.totalValue}
                      onChange={(e) => handleInputChange('totalValue', parseInt(e.target.value) || 0, 'projects')}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Engineering Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Engineering Requirements
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Engineers Currently Deployed
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.engineers.deployed}
                      onChange={(e) => handleInputChange('deployed', parseInt(e.target.value) || 0, 'engineers')}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Engineering Categories
                    </label>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                      {engineeringCategories.map(category => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleCategoryToggle(category)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            formData.engineers.categories.includes(category)
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Relationship */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-purple-400" />
                  Initial Satisfaction Rating
                </h3>
                <div className="w-full lg:w-1/3">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Satisfaction Score (1.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={formData.relationship.satisfaction}
                    onChange={(e) => handleInputChange('satisfaction', parseFloat(e.target.value) || 5.0, 'relationship')}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5.0"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-8 border-t border-slate-700 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Create Customer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}