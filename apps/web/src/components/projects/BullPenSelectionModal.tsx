'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Search,
  Users,
  MapPin,
  DollarSign,
  Clock,
  Star,
  Plus,
  Filter,
  CheckCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Engineer data from Bull Pen
const availableEngineers = [
  {
    id: 'eng-001',
    name: 'Sarah Chen',
    role: 'Senior Controls Engineer',
    category: 'Controls',
    avatar: 'SC',
    location: 'Austin, TX',
    hourlyRate: 125,
    experience: 8,
    skills: ['PLC Programming', 'SCADA', 'HMI Design', 'Industrial Networks'],
    rating: 4.9,
    availability: 'Available',
    visaStatus: 'H1-B Valid',
    lastProject: 'Tesla Gigafactory Austin',
    preferredProjects: ['Automotive', 'Manufacturing'],
    certifications: ['Rockwell Automation', 'Siemens'],
    languages: ['English', 'Mandarin']
  },
  {
    id: 'eng-002',
    name: 'Michael Rodriguez',
    role: 'Mechanical Engineer',
    category: 'Mechanical',
    avatar: 'MR',
    location: 'Detroit, MI',
    hourlyRate: 115,
    experience: 6,
    skills: ['AutoCAD', 'SolidWorks', 'FEA Analysis', 'Process Design'],
    rating: 4.7,
    availability: 'Available',
    visaStatus: 'Green Card',
    lastProject: 'Ford Rouge Plant',
    preferredProjects: ['Automotive', 'Aerospace'],
    certifications: ['PE License', 'Six Sigma Black Belt'],
    languages: ['English', 'Spanish']
  },
  {
    id: 'eng-003',
    name: 'Priya Patel',
    role: 'Electrical Engineer',
    category: 'Electrical',
    avatar: 'PP',
    location: 'San Jose, CA',
    hourlyRate: 130,
    experience: 10,
    skills: ['Power Systems', 'Motor Controls', 'VFDs', 'Panel Design'],
    rating: 4.8,
    availability: 'On Project',
    visaStatus: 'Citizen',
    lastProject: 'Apple Park Data Center',
    preferredProjects: ['Tech', 'Manufacturing'],
    certifications: ['IEEE Member', 'NECA Certified'],
    languages: ['English', 'Hindi', 'Gujarati']
  },
  {
    id: 'eng-004',
    name: 'David Kim',
    role: 'Robotics Engineer',
    category: 'Robotics',
    avatar: 'DK',
    location: 'Seattle, WA',
    hourlyRate: 140,
    experience: 12,
    skills: ['ROS', 'Python', 'Computer Vision', 'Machine Learning'],
    rating: 4.9,
    availability: 'Available',
    visaStatus: 'H1-B Valid',
    lastProject: 'Amazon Fulfillment Center',
    preferredProjects: ['Robotics', 'Automation'],
    certifications: ['AWS Certified', 'ROS Industrial'],
    languages: ['English', 'Korean']
  },
  {
    id: 'eng-005',
    name: 'Jennifer Williams',
    role: 'Systems Engineer',
    category: 'Controls',
    avatar: 'JW',
    location: 'Chicago, IL',
    hourlyRate: 120,
    experience: 7,
    skills: ['Systems Integration', 'Network Design', 'Cybersecurity', 'SCADA'],
    rating: 4.6,
    availability: 'Available',
    visaStatus: 'Citizen',
    lastProject: 'Boeing Manufacturing',
    preferredProjects: ['Aerospace', 'Manufacturing'],
    certifications: ['CISSP', 'CompTIA Security+'],
    languages: ['English']
  },
  {
    id: 'eng-006',
    name: 'Carlos Silva',
    role: 'Process Engineer',
    category: 'Process',
    avatar: 'CS',
    location: 'Houston, TX',
    hourlyRate: 110,
    experience: 5,
    skills: ['Process Design', 'Piping Systems', 'P&ID', 'Safety Systems'],
    rating: 4.5,
    availability: 'Available',
    visaStatus: 'Green Card',
    lastProject: 'ExxonMobil Refinery',
    preferredProjects: ['Oil & Gas', 'Chemical'],
    certifications: ['FE License', 'HAZOP Leader'],
    languages: ['English', 'Spanish', 'Portuguese']
  }
]

const categories = ['All', 'Controls', 'Mechanical', 'Electrical', 'Robotics', 'Process']

interface BullPenSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectEngineers: (engineers: any[]) => void
  project?: any
}

export default function BullPenSelectionModal({
  isOpen,
  onClose,
  onSelectEngineers,
  project
}: BullPenSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [selectedEngineers, setSelectedEngineers] = useState<any[]>([])

  const filteredEngineers = availableEngineers.filter(engineer => {
    const matchesSearch = engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         engineer.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         engineer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === 'All' || engineer.category === filterCategory
    const isAvailable = engineer.availability === 'Available'
    return matchesSearch && matchesCategory && isAvailable
  })

  const toggleEngineerSelection = (engineer: any) => {
    setSelectedEngineers(prev => {
      const isSelected = prev.find(e => e.id === engineer.id)
      if (isSelected) {
        return prev.filter(e => e.id !== engineer.id)
      } else {
        return [...prev, engineer]
      }
    })
  }

  const handleAddToProject = () => {
    onSelectEngineers(selectedEngineers)
    setSelectedEngineers([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Select Engineers from Bull Pen</h2>
            <p className="text-slate-400 mt-1">
              Add available engineers and operators to {project?.name || 'your project'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {selectedEngineers.length > 0 && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {selectedEngineers.length} selected
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search engineers, skills, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat} {cat === 'All' ? 'Categories' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Engineers List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEngineers.map((engineer, index) => {
              const isSelected = selectedEngineers.find(e => e.id === engineer.id)

              return (
                <motion.div
                  key={engineer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300 cursor-pointer h-full ${
                      isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''
                    }`}
                    onClick={() => toggleEngineerSelection(engineer)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
                            <span className="text-white font-bold text-lg">{engineer.avatar}</span>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-lg">{engineer.name}</h3>
                            <p className="text-sm text-slate-400">{engineer.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-white">{engineer.rating}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-300">{engineer.location}</span>
                        </div>
                        <Badge
                          variant="success"
                          className="text-xs"
                        >
                          Available
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-medium text-white">${engineer.hourlyRate}/hr</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-slate-300">{engineer.experience}y exp</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400 font-medium mb-2">Key Skills:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {engineer.skills.slice(0, 3).map((skill, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs text-slate-200 bg-slate-700/50 border-slate-600"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {engineer.skills.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs text-slate-200 bg-slate-700/50 border-slate-600"
                            >
                              +{engineer.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 text-xs text-slate-400">
                        <p>Last Project: {engineer.lastProject}</p>
                        <p>Visa Status: {engineer.visaStatus}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {filteredEngineers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No Available Engineers</h3>
              <p className="text-slate-500">
                No engineers match your current search criteria or all are currently on projects.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              {selectedEngineers.length > 0 && (
                <span>
                  {selectedEngineers.length} engineer{selectedEngineers.length > 1 ? 's' : ''} selected
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddToProject}
                disabled={selectedEngineers.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add {selectedEngineers.length > 0 ? `${selectedEngineers.length} ` : ''}to Project
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}