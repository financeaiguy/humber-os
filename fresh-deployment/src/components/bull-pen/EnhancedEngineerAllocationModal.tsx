'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, User, Calendar, MapPin, DollarSign, Clock, Check, 
  Upload, Plane, Mail, MessageSquare, Navigation, Home,
  FileText, Download, Calculator, Send, ChevronRight, ChevronLeft,
  Search, Filter, AlertTriangle, CheckCircle2, Users, Target,
  Award, Globe, Briefcase, Settings, Plus, Minus, Eye
} from 'lucide-react'

interface Engineer {
  id: string
  name: string
  category: string
  hourlyRate: number
  experience: number
  skills: string[]
  rating: number
  availability: string
  visaStatus: string
  location: string
  avatar: string
  workAuthorization: {
    type: string
    expiryDate: string
    canTravel: boolean
    restrictions: string[]
  }
  currentAssignments: Array<{
    projectId: string
    startDate: string
    endDate: string
    location: string
  }>
}

interface Project {
  id: string
  name: string
  client: string
  location: string
  budget: number
  requiredSkills: string[]
  startDate: string
  endDate: string
  visaRequirements: string[]
  securityClearance?: string
  travelRequired: boolean
}

interface EnhancedEngineerAllocationModalProps {
  isOpen: boolean
  onClose: () => void
  availableEngineers: Engineer[]
  activeProjects: Project[]
  onAssign: (assignment: any) => void
}

export default function EnhancedEngineerAllocationModal({
  isOpen,
  onClose,
  availableEngineers,
  activeProjects,
  onAssign
}: EnhancedEngineerAllocationModalProps) {
  const [step, setStep] = useState(1) // 1: Project Details, 2: Engineer Selection, 3: Assignment Details
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedEngineers, setSelectedEngineers] = useState<Engineer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCriteria, setFilterCriteria] = useState({
    skills: [] as string[],
    visaStatus: '',
    maxHourlyRate: '',
    minExperience: '',
    availability: 'Available'
  })

  const [projectDetails, setProjectDetails] = useState({
    name: '',
    client: '',
    location: '',
    startDate: '',
    endDate: '',
    budget: '',
    requiredSkills: [] as string[],
    visaRequirements: [] as string[],
    securityClearance: '',
    travelRequired: false,
    description: ''
  })

  const [assignmentData, setAssignmentData] = useState({
    role: '',
    notes: '',
    payRate: '',
    totalHours: '',
    homeAddress: '',
    jobAddress: '',
    documents: [] as File[]
  })

  // All available skills from engineers
  const allSkills = useMemo(() => {
    const skills = new Set<string>()
    availableEngineers.forEach(engineer => {
      engineer.skills.forEach(skill => skills.add(skill))
    })
    return Array.from(skills).sort()
  }, [availableEngineers])

  // Filter engineers based on project requirements and filters
  const filteredEngineers = useMemo(() => {
    return availableEngineers.filter(engineer => {
      // Basic availability check
      if (filterCriteria.availability && engineer.availability !== filterCriteria.availability) {
        return false
      }

      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          engineer.name.toLowerCase().includes(searchLower) ||
          engineer.category.toLowerCase().includes(searchLower) ||
          engineer.skills.some(skill => skill.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }

      // Skills filter
      if (filterCriteria.skills.length > 0) {
        const hasRequiredSkills = filterCriteria.skills.some(skill => 
          engineer.skills.includes(skill)
        )
        if (!hasRequiredSkills) return false
      }

      // Visa status filter
      if (filterCriteria.visaStatus && engineer.visaStatus !== filterCriteria.visaStatus) {
        return false
      }

      // Hourly rate filter
      if (filterCriteria.maxHourlyRate && engineer.hourlyRate > parseFloat(filterCriteria.maxHourlyRate)) {
        return false
      }

      // Experience filter
      if (filterCriteria.minExperience && engineer.experience < parseFloat(filterCriteria.minExperience)) {
        return false
      }

      // Project-specific filters (if project selected)
      if (selectedProject) {
        // Check schedule conflicts
        const hasConflict = engineer.currentAssignments.some(assignment => {
          const assignmentStart = new Date(assignment.startDate)
          const assignmentEnd = new Date(assignment.endDate)
          const projectStart = new Date(selectedProject.startDate)
          const projectEnd = new Date(selectedProject.endDate)
          
          return (
            (assignmentStart <= projectEnd && assignmentEnd >= projectStart) ||
            (projectStart <= assignmentEnd && projectEnd >= assignmentStart)
          )
        })
        if (hasConflict) return false

        // Check visa requirements
        if (selectedProject.visaRequirements.length > 0) {
          const meetsVisaReqs = selectedProject.visaRequirements.includes(engineer.visaStatus)
          if (!meetsVisaReqs) return false
        }

        // Check travel capability
        if (selectedProject.travelRequired && !engineer.workAuthorization.canTravel) {
          return false
        }

        // Check skill match
        if (selectedProject.requiredSkills.length > 0) {
          const hasRequiredSkills = selectedProject.requiredSkills.some(skill =>
            engineer.skills.includes(skill)
          )
          if (!hasRequiredSkills) return false
        }
      }

      return true
    })
  }, [availableEngineers, searchTerm, filterCriteria, selectedProject])

  const toggleEngineerSelection = (engineer: Engineer) => {
    setSelectedEngineers(prev => {
      const isSelected = prev.find(e => e.id === engineer.id)
      if (isSelected) {
        return prev.filter(e => e.id !== engineer.id)
      } else {
        return [...prev, engineer]
      }
    })
  }

  const getAvailabilityStatus = (engineer: Engineer) => {
    if (engineer.availability === 'Available') {
      return { color: 'text-green-400', bg: 'bg-green-500/20', text: 'Available' }
    } else if (engineer.availability === 'Partial') {
      return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', text: 'Partial Availability' }
    } else {
      return { color: 'text-red-400', bg: 'bg-red-500/20', text: 'Not Available' }
    }
  }

  const calculateTotalCost = () => {
    if (!assignmentData.payRate || !assignmentData.totalHours) return 0
    return selectedEngineers.length * parseFloat(assignmentData.payRate) * parseFloat(assignmentData.totalHours)
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleAssign = () => {
    const assignment = {
      project: selectedProject || projectDetails,
      engineers: selectedEngineers,
      assignment: assignmentData,
      totalCost: calculateTotalCost(),
      createdAt: new Date().toISOString()
    }
    onAssign(assignment)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Enhanced Engineer Allocation</h2>
                <p className="text-slate-400">Multi-engineer project assignment with smart matching</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Step Progress */}
            <div className="flex items-center mt-6 space-x-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= stepNum 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {stepNum}
                  </div>
                  <span className={`ml-2 text-sm ${step >= stepNum ? 'text-white' : 'text-slate-400'}`}>
                    {stepNum === 1 ? 'Project Details' : stepNum === 2 ? 'Engineer Selection' : 'Assignment Details'}
                  </span>
                  {stepNum < 3 && <ChevronRight className="h-4 w-4 text-slate-500 ml-4" />}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Step 1: Project Details */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-400" />
                    Project Information
                  </h3>
                  
                  {/* Existing Projects */}
                  {activeProjects.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Select Existing Project
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                        {activeProjects.map(project => (
                          <div
                            key={project.id}
                            onClick={() => setSelectedProject(project)}
                            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                              selectedProject?.id === project.id
                                ? 'bg-blue-500/20 border-blue-500/50'
                                : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            <h4 className="font-medium text-white text-sm">{project.name}</h4>
                            <p className="text-xs text-slate-400">{project.client}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                              <span><MapPin className="h-3 w-3 inline mr-1" />{project.location}</span>
                              <span>Budget: ${(project.budget / 1000000).toFixed(1)}M</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {project.requiredSkills.slice(0, 3).map(skill => (
                                <span key={skill} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                                  {skill}
                                </span>
                              ))}
                              {project.requiredSkills.length > 3 && (
                                <span className="px-2 py-1 bg-slate-600 text-slate-400 rounded text-xs">
                                  +{project.requiredSkills.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-center my-4">
                        <span className="text-slate-400 text-sm">or</span>
                      </div>
                    </div>
                  )}

                  {/* New Project Form */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-slate-300">Create New Project</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
                        <input
                          type="text"
                          placeholder="Tesla Model Y Line Expansion"
                          value={projectDetails.name}
                          onChange={(e) => setProjectDetails(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Client</label>
                        <input
                          type="text"
                          placeholder="Tesla Motors"
                          value={projectDetails.client}
                          onChange={(e) => setProjectDetails(prev => ({ ...prev, client: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                        <input
                          type="text"
                          placeholder="Austin, TX"
                          value={projectDetails.location}
                          onChange={(e) => setProjectDetails(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
                        <input
                          type="date"
                          value={projectDetails.startDate}
                          onChange={(e) => setProjectDetails(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
                        <input
                          type="date"
                          value={projectDetails.endDate}
                          onChange={(e) => setProjectDetails(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Required Skills</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {allSkills.map(skill => (
                          <button
                            key={skill}
                            onClick={() => {
                              setProjectDetails(prev => ({
                                ...prev,
                                requiredSkills: prev.requiredSkills.includes(skill)
                                  ? prev.requiredSkills.filter(s => s !== skill)
                                  : [...prev.requiredSkills, skill]
                              }))
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              projectDetails.requiredSkills.includes(skill)
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Visa Requirements</label>
                        <select
                          multiple
                          value={projectDetails.visaRequirements}
                          onChange={(e) => {
                            const values = Array.from(e.target.selectedOptions, option => option.value)
                            setProjectDetails(prev => ({ ...prev, visaRequirements: values }))
                          }}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="US Citizen">US Citizen</option>
                          <option value="Green Card">Green Card</option>
                          <option value="H1B">H1B</option>
                          <option value="L1">L1</option>
                          <option value="TN">TN</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="travelRequired"
                            checked={projectDetails.travelRequired}
                            onChange={(e) => setProjectDetails(prev => ({ ...prev, travelRequired: e.target.checked }))}
                            className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="travelRequired" className="text-sm text-slate-300">Travel Required</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Engineer Selection */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-400" />
                    Select Engineers ({selectedEngineers.length} selected)
                  </h3>

                  {/* Filters */}
                  <div className="bg-slate-800 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search engineers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Skills</label>
                        <select
                          multiple
                          value={filterCriteria.skills}
                          onChange={(e) => {
                            const values = Array.from(e.target.selectedOptions, option => option.value)
                            setFilterCriteria(prev => ({ ...prev, skills: values }))
                          }}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        >
                          {allSkills.map(skill => (
                            <option key={skill} value={skill}>{skill}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Visa Status</label>
                        <select
                          value={filterCriteria.visaStatus}
                          onChange={(e) => setFilterCriteria(prev => ({ ...prev, visaStatus: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">All</option>
                          <option value="US Citizen">US Citizen</option>
                          <option value="Green Card">Green Card</option>
                          <option value="H1B">H1B</option>
                          <option value="L1">L1</option>
                          <option value="TN">TN</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Max Rate ($/hr)</label>
                        <input
                          type="number"
                          placeholder="100"
                          value={filterCriteria.maxHourlyRate}
                          onChange={(e) => setFilterCriteria(prev => ({ ...prev, maxHourlyRate: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Selected Engineers Summary */}
                  {selectedEngineers.length > 0 && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                      <h4 className="text-sm font-medium text-blue-300 mb-2">Selected Engineers</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEngineers.map(engineer => (
                          <div key={engineer.id} className="flex items-center space-x-2 bg-blue-500/20 rounded-lg px-3 py-1">
                            <span className="text-sm text-white">{engineer.name}</span>
                            <button
                              onClick={() => toggleEngineerSelection(engineer)}
                              className="text-blue-300 hover:text-white"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Engineers Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {filteredEngineers.map(engineer => {
                      const availability = getAvailabilityStatus(engineer)
                      const isSelected = selectedEngineers.find(e => e.id === engineer.id)
                      
                      return (
                        <div
                          key={engineer.id}
                          onClick={() => toggleEngineerSelection(engineer)}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-500/20 border-blue-500/50'
                              : 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{engineer.avatar}</span>
                              </div>
                              <div>
                                <h4 className="font-medium text-white">{engineer.name}</h4>
                                <p className="text-sm text-slate-400">{engineer.category}</p>
                                <div className="flex items-center space-x-3 mt-1">
                                  <span className="text-xs text-slate-500">${engineer.hourlyRate}/hr</span>
                                  <span className="text-xs text-slate-500">{engineer.experience}y exp</span>
                                  <span className={`text-xs px-2 py-1 rounded ${availability.bg} ${availability.color}`}>
                                    {availability.text}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end space-y-1">
                              {isSelected && <CheckCircle2 className="h-5 w-5 text-blue-400" />}
                              <div className="flex items-center space-x-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`h-1 w-1 rounded-full ${
                                      i < engineer.rating ? 'bg-yellow-400' : 'bg-slate-600'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="flex flex-wrap gap-1">
                              {engineer.skills.slice(0, 4).map(skill => (
                                <span key={skill} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                                  {skill}
                                </span>
                              ))}
                              {engineer.skills.length > 4 && (
                                <span className="px-2 py-1 bg-slate-600 text-slate-400 rounded text-xs">
                                  +{engineer.skills.length - 4}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                            <span><Globe className="h-3 w-3 inline mr-1" />{engineer.visaStatus}</span>
                            <span><MapPin className="h-3 w-3 inline mr-1" />{engineer.location}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {filteredEngineers.length === 0 && (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-400">No engineers match the current filters.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Assignment Details */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-blue-400" />
                    Assignment Details
                  </h3>

                  {/* Assignment Summary */}
                  <div className="bg-slate-800 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Project</h4>
                        <p className="text-white font-medium">
                          {selectedProject?.name || projectDetails.name}
                        </p>
                        <p className="text-sm text-slate-400">
                          {selectedProject?.client || projectDetails.client}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Engineers ({selectedEngineers.length})</h4>
                        <div className="space-y-1">
                          {selectedEngineers.slice(0, 3).map(engineer => (
                            <p key={engineer.id} className="text-sm text-white">{engineer.name}</p>
                          ))}
                          {selectedEngineers.length > 3 && (
                            <p className="text-sm text-slate-400">+{selectedEngineers.length - 3} more</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Total Cost</h4>
                        <p className="text-xl font-bold text-green-400">
                          ${calculateTotalCost().toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Assignment Form */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        <DollarSign className="h-4 w-4 inline mr-1" />
                        Pay Rate (per hour)
                      </label>
                      <input
                        type="number"
                        placeholder="75.00"
                        value={assignmentData.payRate}
                        onChange={(e) => setAssignmentData(prev => ({ ...prev, payRate: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Total Hours
                      </label>
                      <input
                        type="number"
                        placeholder="160"
                        value={assignmentData.totalHours}
                        onChange={(e) => setAssignmentData(prev => ({ ...prev, totalHours: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        <Award className="h-4 w-4 inline mr-1" />
                        Role
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Lead Controls Engineer"
                        value={assignmentData.role}
                        onChange={(e) => setAssignmentData(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      placeholder="Assignment details, special requirements, etc..."
                      value={assignmentData.notes}
                      onChange={(e) => setAssignmentData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-700 flex justify-between">
            <div className="flex space-x-3">
              {step > 1 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={step === 1 && !selectedProject && !projectDetails.name}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleAssign}
                  disabled={selectedEngineers.length === 0}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="h-4 w-4" />
                  <span>Assign {selectedEngineers.length} Engineer{selectedEngineers.length !== 1 ? 's' : ''}</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}