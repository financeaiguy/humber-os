'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Building2,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Users,
  Briefcase,
  TrendingUp,
  Calendar,
  Star,
  Edit,
  Activity,
  Clock,
  ChevronRight,
  Save,
  Trash2,
  AlertTriangle,
  Plus,
  Minus
} from 'lucide-react'

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  role?: string
  isPrimary: boolean
}

interface Customer {
  id: number
  name: string
  industry: string
  location: string
  contacts: Contact[]
  projects: {
    active: number
    completed: number
    totalValue: number
  }
  engineers: {
    deployed: number
    categories: string[]
  }
  relationship: {
    since: string
    status: string
    satisfaction: number
    lastContact: string
  }
}

interface CustomerDetailModalProps {
  customer: Customer | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: (customer: Customer) => void
  onDelete?: (customerId: number) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  }
}

export function CustomerDetailModal({ customer, isOpen, onClose, onUpdate, onDelete }: CustomerDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editData, setEditData] = useState<Customer | null>(null)
  const router = useRouter()

  if (!customer) return null

  // Initialize edit data when entering edit mode
  const handleEditStart = () => {
    setEditData({ ...customer })
    setIsEditing(true)
  }

  // Handle adding contact (ensures edit mode is active)
  const handleAddContact = () => {
    if (!isEditing) {
      const newEditData = { ...customer }
      setEditData(newEditData)
      setIsEditing(true)

      // Add contact to the new edit data
      const existingContacts = newEditData.contacts || []
      const newContact: Contact = {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        email: '',
        phone: '',
        role: '',
        isPrimary: existingContacts.length === 0
      }
      const newContacts = [...existingContacts, newContact]
      newEditData.contacts = newContacts
      setEditData(newEditData)
    } else {
      addContact()
    }
  }

  const handleEditCancel = () => {
    setEditData(null)
    setIsEditing(false)
  }

  const handleSave = () => {
    if (editData && onUpdate) {
      onUpdate(editData)
      setIsEditing(false)
      setEditData(null)
    }
  }

  const handleDelete = () => {
    if (onDelete && customer) {
      onDelete(customer.id)
      setShowDeleteConfirm(false)
      onClose()
    }
  }

  const updateEditData = (field: string, value: any) => {
    if (!editData) return

    const keys = field.split('.')
    if (keys.length === 1) {
      setEditData({ ...editData, [field]: value })
    } else {
      const newData = { ...editData }
      let current: any = newData
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      setEditData(newData)
    }
  }

  const addEngineerCategory = () => {
    if (!editData) return
    const newCategories = [...editData.engineers.categories, '']
    updateEditData('engineers.categories', newCategories)
  }

  const removeEngineerCategory = (index: number) => {
    if (!editData) return
    const newCategories = editData.engineers.categories.filter((_, i) => i !== index)
    updateEditData('engineers.categories', newCategories)
  }

  const updateEngineerCategory = (index: number, value: string) => {
    if (!editData) return
    const newCategories = [...editData.engineers.categories]
    newCategories[index] = value
    updateEditData('engineers.categories', newCategories)
  }

  const addContact = () => {
    if (!editData) return
    const existingContacts = editData.contacts || []
    const newContact: Contact = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      email: '',
      phone: '',
      role: '',
      isPrimary: existingContacts.length === 0
    }
    const newContacts = [...existingContacts, newContact]
    updateEditData('contacts', newContacts)
  }

  const removeContact = (contactId: string) => {
    if (!editData || !editData.contacts) return
    const newContacts = editData.contacts.filter(contact => contact.id !== contactId)
    // If we removed the primary contact, make the first remaining contact primary
    if (newContacts.length > 0 && !newContacts.some(c => c.isPrimary)) {
      newContacts[0].isPrimary = true
    }
    updateEditData('contacts', newContacts)
  }

  const updateContact = (contactId: string, field: keyof Contact, value: any) => {
    if (!editData || !editData.contacts) return
    const newContacts = editData.contacts.map(contact => {
      if (contact.id === contactId) {
        const updatedContact = { ...contact, [field]: value }

        // If setting this contact as primary, unset others
        if (field === 'isPrimary' && value === true) {
          editData.contacts.forEach(c => {
            if (c.id !== contactId) c.isPrimary = false
          })
        }

        return updatedContact
      }
      return contact
    })
    updateEditData('contacts', newContacts)
  }

  const displayData = isEditing ? editData! : customer

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const partnershipYears = Math.round(
    (new Date().getTime() - new Date(displayData.relationship.since).getTime()) /
    (1000 * 60 * 60 * 24 * 365 * 10)
  ) / 10

  const recentActivities = [
    {
      id: 1,
      action: 'Project milestone completed',
      project: 'EV Battery Integration',
      date: '2025-01-12',
      type: 'milestone'
    },
    {
      id: 2,
      action: 'Engineer deployed',
      project: 'Autonomous Systems',
      date: '2025-01-10',
      type: 'deployment'
    },
    {
      id: 3,
      action: 'Contract renewal',
      project: 'Annual Service Agreement',
      date: '2025-01-08',
      type: 'contract'
    },
    {
      id: 4,
      action: 'Performance review',
      project: 'Q4 2024 Assessment',
      date: '2025-01-05',
      type: 'review'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <TrendingUp className="h-4 w-4 text-green-400" />
      case 'deployment': return <Users className="h-4 w-4 text-blue-400" />
      case 'contract': return <Briefcase className="h-4 w-4 text-purple-400" />
      case 'review': return <Star className="h-4 w-4 text-yellow-400" />
      default: return <Activity className="h-4 w-4 text-slate-400" />
    }
  }

  const renderInput = (field: string, label: string, type: string = 'text', placeholder?: string) => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], displayData) || ''

    if (!isEditing) {
      return <span className="text-white">{value}</span>
    }

    return (
      <input
        type={type}
        value={value}
        onChange={(e) => updateEditData(field, type === 'number' ? Number(e.target.value) : e.target.value)}
        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
        placeholder={placeholder || label}
      />
    )
  }

  const renderSelect = (field: string, options: string[]) => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], displayData) || ''

    if (!isEditing) {
      return <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(value)}`}>
        {value}
      </span>
    }

    return (
      <select
        value={value}
        onChange={(e) => updateEditData(field, e.target.value)}
        className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
                  <Building2 className="h-6 w-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={displayData.name}
                        onChange={(e) => updateEditData('name', e.target.value)}
                        className="text-2xl font-bold bg-transparent text-white border-b border-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={displayData.industry}
                        onChange={(e) => updateEditData('industry', e.target.value)}
                        className="text-slate-400 bg-transparent border-b border-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-2xl font-bold text-white">{displayData.name}</h2>
                      <p className="text-slate-400">{displayData.industry}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {renderSelect('relationship.status', ['active', 'inactive', 'pending'])}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-700/50">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'projects', label: 'Projects' },
                { id: 'activity', label: 'Activity' },
                { id: 'contact', label: 'Contact' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-blue-400 bg-blue-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-5 w-5 text-green-400" />
                        <div className="flex-1">
                          <p className="text-sm text-slate-400">Total Value</p>
                          {isEditing ? (
                            <input
                              type="number"
                              value={displayData.projects.totalValue}
                              onChange={(e) => updateEditData('projects.totalValue', Number(e.target.value))}
                              className="text-lg font-bold text-white bg-transparent border-b border-slate-600 focus:border-blue-500 focus:outline-none w-full"
                            />
                          ) : (
                            <p className="text-lg font-bold text-white">
                              ${(displayData.projects.totalValue / 1000000).toFixed(1)}M
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4">
                      <div className="flex items-center space-x-3">
                        <Briefcase className="h-5 w-5 text-purple-400" />
                        <div className="flex-1">
                          <p className="text-sm text-slate-400">Active Projects</p>
                          {isEditing ? (
                            <input
                              type="number"
                              value={displayData.projects.active}
                              onChange={(e) => updateEditData('projects.active', Number(e.target.value))}
                              className="text-lg font-bold text-white bg-transparent border-b border-slate-600 focus:border-blue-500 focus:outline-none w-full"
                            />
                          ) : (
                            <p className="text-lg font-bold text-white">{displayData.projects.active}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4">
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-blue-400" />
                        <div className="flex-1">
                          <p className="text-sm text-slate-400">Engineers</p>
                          {isEditing ? (
                            <input
                              type="number"
                              value={displayData.engineers.deployed}
                              onChange={(e) => updateEditData('engineers.deployed', Number(e.target.value))}
                              className="text-lg font-bold text-white bg-transparent border-b border-slate-600 focus:border-blue-500 focus:outline-none w-full"
                            />
                          ) : (
                            <p className="text-lg font-bold text-white">{displayData.engineers.deployed}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4">
                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <div className="flex-1">
                          <p className="text-sm text-slate-400">Satisfaction</p>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="5"
                              value={displayData.relationship.satisfaction}
                              onChange={(e) => updateEditData('relationship.satisfaction', Number(e.target.value))}
                              className="text-lg font-bold text-white bg-transparent border-b border-slate-600 focus:border-blue-500 focus:outline-none w-full"
                            />
                          ) : (
                            <p className="text-lg font-bold text-white">{displayData.relationship.satisfaction}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Relationship Info */}
                  <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Relationship Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Partnership Since</p>
                        {isEditing ? (
                          <input
                            type="date"
                            value={displayData.relationship.since}
                            onChange={(e) => updateEditData('relationship.since', e.target.value)}
                            className="text-white bg-slate-800/50 border border-slate-600 rounded px-3 py-1 focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          <div>
                            <p className="text-white font-medium">{formatDate(displayData.relationship.since)}</p>
                            <p className="text-xs text-slate-500">{partnershipYears} years</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Last Contact</p>
                        {isEditing ? (
                          <input
                            type="date"
                            value={displayData.relationship.lastContact}
                            onChange={(e) => updateEditData('relationship.lastContact', e.target.value)}
                            className="text-white bg-slate-800/50 border border-slate-600 rounded px-3 py-1 focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          <p className="text-white font-medium">{formatDate(displayData.relationship.lastContact)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Engineer Categories */}
                  <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Deployed Engineer Categories</h3>
                      {isEditing && (
                        <button
                          onClick={addEngineerCategory}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {displayData.engineers.categories.map((category, index) => (
                        <div key={index} className="flex items-center">
                          {isEditing ? (
                            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                              <input
                                type="text"
                                value={category}
                                onChange={(e) => updateEngineerCategory(index, e.target.value)}
                                className="text-blue-400 text-sm bg-transparent border-none focus:outline-none min-w-0"
                              />
                              <button
                                onClick={() => removeEngineerCategory(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm border border-blue-500/30">
                              {category}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Project Summary</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-2xl font-bold text-green-400">{displayData.projects.active}</p>
                        <p className="text-sm text-slate-400">Active Projects</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-400">{displayData.projects.completed}</p>
                        <p className="text-sm text-slate-400">Completed Projects</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Projects</h3>
                    <div className="space-y-3">
                      {['EV Battery Integration', 'Autonomous Systems Development', 'Manufacturing Optimization'].map((project, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
                          <div>
                            <p className="text-white font-medium">{project}</p>
                            <p className="text-sm text-slate-400">In Progress</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-900/50">
                          <div className="p-2 rounded-lg bg-slate-800/50">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{activity.action}</p>
                            <p className="text-sm text-slate-400">{activity.project}</p>
                            <div className="flex items-center space-x-1 mt-1">
                              <Clock className="h-3 w-3 text-slate-500" />
                              <p className="text-xs text-slate-500">{formatDate(activity.date)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Contact Information</h3>
                      <button
                        onClick={handleAddContact}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Contact</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Location field */}
                      <div className="rounded-lg bg-slate-900/50 p-4">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <div className="flex-1">
                            <p className="text-sm text-slate-400 mb-1">Company Location</p>
                            {renderInput('location', 'Location')}
                          </div>
                        </div>
                      </div>

                      {/* Contacts */}
                      <div className="space-y-3">
                        {displayData.contacts && displayData.contacts.length > 0 ? (
                          displayData.contacts.map((contact, index) => (
                            <div key={contact.id} className="rounded-lg bg-slate-900/50 p-4 border border-slate-700/30">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${contact.isPrimary ? 'bg-blue-400' : 'bg-slate-600'}`} />
                                  <span className="text-sm font-medium text-white">
                                    {contact.isPrimary ? 'Primary Contact' : `Contact ${index + 1}`}
                                  </span>
                                  {contact.role && (
                                    <span className="text-xs text-slate-400">({contact.role})</span>
                                  )}
                                </div>
                                {isEditing && displayData.contacts.length > 1 && (
                                  <button
                                    onClick={() => removeContact(contact.id)}
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex items-center space-x-3">
                                  <Users className="h-4 w-4 text-slate-400" />
                                  <div className="flex-1">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={contact.name}
                                        onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                                        placeholder="Contact Name"
                                      />
                                    ) : (
                                      <span className="text-white">{contact.name}</span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                  <Briefcase className="h-4 w-4 text-slate-400" />
                                  <div className="flex-1">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={contact.role || ''}
                                        onChange={(e) => updateContact(contact.id, 'role', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                                        placeholder="Role/Title"
                                      />
                                    ) : (
                                      <span className="text-white">{contact.role || 'No role specified'}</span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                  <Mail className="h-4 w-4 text-slate-400" />
                                  <div className="flex-1">
                                    {isEditing ? (
                                      <input
                                        type="email"
                                        value={contact.email}
                                        onChange={(e) => updateContact(contact.id, 'email', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                                        placeholder="Email"
                                      />
                                    ) : (
                                      <span className="text-white">{contact.email}</span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                  <Phone className="h-4 w-4 text-slate-400" />
                                  <div className="flex-1">
                                    {isEditing ? (
                                      <input
                                        type="tel"
                                        value={contact.phone}
                                        onChange={(e) => updateContact(contact.id, 'phone', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                                        placeholder="Phone"
                                      />
                                    ) : (
                                      <span className="text-white">{contact.phone}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {isEditing && displayData.contacts.length > 1 && (
                                <div className="mt-3 pt-3 border-t border-slate-700/50">
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={contact.isPrimary}
                                      onChange={(e) => updateContact(contact.id, 'isPrimary', e.target.checked)}
                                      className="w-4 h-4 bg-slate-800 border border-slate-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-300">Set as primary contact</span>
                                  </label>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 mb-4">No contacts added yet</p>
                            {isEditing && (
                              <button
                                onClick={addContact}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                              >
                                <Plus className="h-4 w-4" />
                                <span>Add First Contact</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-slate-700/50">
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>Last updated: {formatDate(displayData.relationship.lastContact)}</span>
              </div>

              <div className="flex items-center space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleEditCancel}
                      className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                    <button
                      onClick={handleEditStart}
                      className="px-4 py-2 text-slate-400 hover:text-white transition-colors flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit Details</span>
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        onClose()
                        router.push('/projects')
                      }}
                    >
                      View Projects
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 max-w-md mx-4"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 rounded-full bg-red-500/20 border border-red-500/30">
                      <AlertTriangle className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Delete Customer</h3>
                      <p className="text-sm text-slate-400">This action cannot be undone</p>
                    </div>
                  </div>

                  <p className="text-slate-300 mb-6">
                    Are you sure you want to delete <strong>{customer.name}</strong>?
                    This will permanently remove all customer data and project associations.
                  </p>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Customer</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  )
}