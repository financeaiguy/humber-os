'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, User, Calendar, MapPin, DollarSign, Clock, Check, 
  Upload, Plane, Mail, MessageSquare, Navigation, Home,
  FileText, Download, Calculator, Send
} from 'lucide-react'

interface EngineerAllocationModalProps {
  isOpen: boolean
  onClose: () => void
  selectedEngineer?: any
  selectedProject?: any
  availableEngineers: any[]
  activeProjects: any[]
}

export default function EngineerAllocationModal({
  isOpen,
  onClose,
  selectedEngineer,
  selectedProject,
  availableEngineers,
  activeProjects
}: EngineerAllocationModalProps) {
  const [assignmentData, setAssignmentData] = useState({
    startDate: '',
    endDate: '',
    role: '',
    notes: '',
    payRate: '',
    totalHours: '',
    homeZipCode: '',
    jobZipCode: '',
    homeAddress: '',
    jobAddress: ''
  })

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [distance, setDistance] = useState<number | null>(null)
  const [flightBookingOpen, setFlightBookingOpen] = useState(false)

  // Calculate distance between zip codes (simplified calculation)
  useEffect(() => {
    if (assignmentData.homeZipCode && assignmentData.jobZipCode && 
        assignmentData.homeZipCode.length === 5 && assignmentData.jobZipCode.length === 5) {
      // This is a simplified calculation - in production you'd use a real geocoding API
      const homeCode = parseInt(assignmentData.homeZipCode)
      const jobCode = parseInt(assignmentData.jobZipCode)
      const estimatedDistance = Math.abs(homeCode - jobCode) * 0.5 // Rough estimate
      setDistance(Math.round(estimatedDistance))
    } else {
      setDistance(null)
    }
  }, [assignmentData.homeZipCode, assignmentData.jobZipCode])

  // Calculate total cost
  const totalCost = assignmentData.payRate && assignmentData.totalHours 
    ? parseFloat(assignmentData.payRate) * parseFloat(assignmentData.totalHours)
    : 0

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleFlightBooking = () => {
    // This would integrate with a flight booking API and send notifications
    alert('Flight booking request sent! Engineer will receive email and SMS notification.')
    setFlightBookingOpen(false)
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
          className="bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        >
          <div className="p-4 sm:p-6 border-b border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Engineer Allocation</h2>
                <p className="text-slate-400">Assign engineers to projects</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Engineer Selection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Engineer</h3>
              {selectedEngineer ? (
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold">{selectedEngineer.avatar}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{selectedEngineer.name}</h4>
                      <p className="text-sm text-slate-400">{selectedEngineer.role}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-slate-500">Rate: ${selectedEngineer.hourlyRate}/hr</span>
                        <span className="text-xs text-slate-500">Experience: {selectedEngineer.experience}y</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {availableEngineers.filter(e => e.availability === 'Available').map(engineer => (
                    <div
                      key={engineer.id}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{engineer.avatar}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-white text-sm">{engineer.name}</h4>
                          <p className="text-xs text-slate-400">{engineer.category}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Project Selection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Project</h3>
              {selectedProject ? (
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <h4 className="font-semibold text-white">{selectedProject.name}</h4>
                  <p className="text-sm text-slate-400">{selectedProject.client}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-slate-500">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {selectedProject.location}
                    </span>
                    <span className="text-xs text-slate-500">
                      Budget: ${(selectedProject.budget / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {activeProjects.map(project => (
                    <div
                      key={project.id}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 cursor-pointer transition-colors"
                    >
                      <h4 className="font-medium text-white text-sm">{project.name}</h4>
                      <p className="text-xs text-slate-400">{project.client} • {project.location}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assignment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={assignmentData.startDate}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={assignmentData.endDate}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Pay Rate and Hours */}
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
                  placeholder="40"
                  value={assignmentData.totalHours}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, totalHours: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Calculator className="h-4 w-4 inline mr-1" />
                  Total Cost
                </label>
                <div className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-green-400 font-semibold">
                  ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Role on Project
              </label>
              <input
                type="text"
                placeholder="e.g., Lead Controls Engineer"
                value={assignmentData.role}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Upload className="h-4 w-4 inline mr-1" />
                Engineer Documents
              </label>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 bg-slate-800/50">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <Upload className="h-8 w-8 text-slate-400" />
                  <span className="text-slate-400 text-sm">Click to upload files or drag and drop</span>
                  <span className="text-xs text-slate-500">PDF, DOC, TXT, Images (Max 10MB each)</span>
                </label>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <h4 className="text-sm font-medium text-slate-300">Uploaded Files:</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-white">{file.name}</span>
                        <span className="text-xs text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-slate-600 rounded transition-colors"
                      >
                        <X className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location Tracking */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                <Navigation className="h-5 w-5 inline mr-2" />
                Location & Travel
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Home className="h-4 w-4 inline mr-1" />
                    Engineer Home Address
                  </label>
                  <input
                    type="text"
                    placeholder="123 Main St, City, State"
                    value={assignmentData.homeAddress}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, homeAddress: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Home ZIP Code"
                    value={assignmentData.homeZipCode}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, homeZipCode: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Job Site Address
                  </label>
                  <input
                    type="text"
                    placeholder="456 Work Ave, Job City, State"
                    value={assignmentData.jobAddress}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, jobAddress: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Job ZIP Code"
                    value={assignmentData.jobZipCode}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, jobZipCode: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                    maxLength={5}
                  />
                </div>
              </div>
              
              {distance !== null && (
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-300 text-sm font-medium">
                      Estimated Distance: {distance} miles
                    </span>
                    {distance > 50 && (
                      <button
                        onClick={() => setFlightBookingOpen(true)}
                        className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md text-xs font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-1"
                      >
                        <Plane className="h-3 w-3" />
                        <span>Book Flight</span>
                      </button>
                    )}
                  </div>
                  {distance > 50 && (
                    <p className="text-xs text-blue-400 mt-1">Distance exceeds 50 miles - flight booking recommended</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Notes
              </label>
              <textarea
                placeholder="Additional notes about this assignment..."
                value={assignmentData.notes}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-6 border-t border-slate-700 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Handle assignment logic here
                onClose()
              }}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>Assign Engineer</span>
            </button>
          </div>
        </motion.div>

        {/* Flight Booking Modal */}
        {flightBookingOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-xl border border-slate-700 max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Plane className="h-5 w-5 mr-2 text-blue-400" />
                  Book Flight
                </h3>
                <button
                  onClick={() => setFlightBookingOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-300">Engineer: <span className="text-white font-medium">{selectedEngineer?.name}</span></p>
                  <p className="text-sm text-slate-300">Distance: <span className="text-blue-400 font-medium">{distance} miles</span></p>
                  <p className="text-sm text-slate-300">From: <span className="text-white">{assignmentData.homeAddress}</span></p>
                  <p className="text-sm text-slate-300">To: <span className="text-white">{assignmentData.jobAddress}</span></p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Flight Preferences
                  </label>
                  <select className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                    <option>Economy</option>
                    <option>Business</option>
                    <option>First Class</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={assignmentData.startDate}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={assignmentData.endDate}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    readOnly
                  />
                </div>

                <div className="border-t border-slate-700 pt-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Notifications</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-slate-300">
                      <Mail className="h-4 w-4 text-blue-400" />
                      <span>Email confirmation to engineer</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-300">
                      <MessageSquare className="h-4 w-4 text-green-400" />
                      <span>SMS notification to engineer</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setFlightBookingOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFlightBooking}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Book & Notify</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}