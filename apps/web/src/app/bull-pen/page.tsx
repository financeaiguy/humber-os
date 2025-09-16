'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Wrench, 
  Zap, 
  GitBranch, 
  Cpu,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Plus,
  Calendar,
  DollarSign,
  Plane,
  Clock,
  Target,
  Briefcase,
  Star,
  Award,
  Globe,
  ArrowRight,
  Filter,
  Search,
  X,
  Edit3,
  Save,
  ShoppingCart
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'

// Lazy load heavy modals
const EngineerAllocationModal = dynamic(() => import('@/components/bull-pen/EngineerAllocationModal'), { ssr: false })
const FlightBookingModal = dynamic(() => import('@/components/bull-pen/FlightBookingModal'), { ssr: false })
const ExpenseTrackingModal = dynamic(() => import('@/components/bull-pen/ExpenseTrackingModal'), { ssr: false })
const EngineerProfileModal = dynamic(() => import('@/components/bull-pen/EngineerProfileModal'), { ssr: false })

// Engineer categories with icons and colors
const categories = [
  { 
    name: 'Controls', 
    icon: Cpu, 
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    available: 12,
    deployed: 8,
    buffered: 2
  },
  { 
    name: 'Mechanical', 
    icon: Wrench, 
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    available: 15,
    deployed: 10,
    buffered: 3
  },
  { 
    name: 'Electrical', 
    icon: Zap, 
    color: 'from-yellow-500 to-orange-600',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    available: 8,
    deployed: 6,
    buffered: 1
  },
  { 
    name: 'Piping', 
    icon: GitBranch, 
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    available: 10,
    deployed: 7,
    buffered: 2
  },
  { 
    name: 'Robotics', 
    icon: Cpu, 
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    available: 5,
    deployed: 3,
    buffered: 1
  },
]

// Available engineers with detailed profiles
const availableEngineers = [
  {
    id: 'eng-001',
    name: 'Sarah Chen',
    role: 'Senior Controls Engineer',
    category: 'Controls',
    avatar: 'SC',
    location: 'Austin, TX',
    coordinates: { lat: 30.2672, lng: -97.7431 },
    hourlyRate: 125,
    experience: 8,
    skills: ['PLC Programming', 'SCADA', 'HMI Design', 'Industrial Networks'],
    rating: 4.9,
    availability: 'Available',
    visaStatus: 'H1-B Valid',
    lastProject: 'Tesla Gigafactory Austin',
    preferredProjects: ['Automotive', 'Manufacturing'],
    certifications: ['Rockwell Automation', 'Siemens'],
    languages: ['English', 'Mandarin'],
    travelPreferences: {
      maxTravelDistance: 500, // miles
      willingToRelocate: false,
      hasValidPassport: true,
      preferredProjects: ['domestic'],
      maxTravelDuration: 30 // days
    },
    workAuthorization: {
      countries: ['US'],
      restrictions: ['H1-B sponsor required'],
      expirationDate: '2025-12-31'
    }
  },
  {
    id: 'eng-002',
    name: 'Michael Rodriguez',
    role: 'Mechanical Engineer',
    category: 'Mechanical',
    avatar: 'MR',
    location: 'Detroit, MI',
    coordinates: { lat: 42.3314, lng: -83.0458 },
    hourlyRate: 115,
    experience: 6,
    skills: ['AutoCAD', 'SolidWorks', 'FEA Analysis', 'Process Design'],
    rating: 4.7,
    availability: 'Available',
    visaStatus: 'Green Card',
    lastProject: 'Ford Rouge Plant',
    preferredProjects: ['Automotive', 'Aerospace'],
    certifications: ['PE License', 'Six Sigma Black Belt'],
    languages: ['English', 'Spanish'],
    travelPreferences: {
      maxTravelDistance: 800,
      willingToRelocate: true,
      hasValidPassport: true,
      preferredProjects: ['domestic', 'international'],
      maxTravelDuration: 90
    },
    workAuthorization: {
      countries: ['US', 'CA', 'MX'],
      restrictions: [],
      expirationDate: 'permanent'
    }
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
  }
]

// Active projects with resource needs
const activeProjects = [
  {
    id: 'proj-001',
    name: 'Tesla Model Y Line Expansion',
    client: 'Tesla Motors',
    location: 'Austin, TX',
    startDate: '2024-02-01',
    endDate: '2024-08-15',
    budget: 2500000,
    spent: 1200000,
    urgency: 'High',
    engineersNeeded: {
      Controls: 3,
      Mechanical: 2,
      Electrical: 2,
      Robotics: 1
    },
    currentEngineers: ['eng-001'],
    status: 'Active',
    progress: 45,
    travelRequired: true,
    housingProvided: true
  },
  {
    id: 'proj-002',
    name: 'Ford F-150 Lightning Assembly',
    client: 'Ford Motor Company',
    location: 'Dearborn, MI',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    budget: 4200000,
    spent: 800000,
    urgency: 'Medium',
    engineersNeeded: {
      Controls: 4,
      Mechanical: 5,
      Electrical: 3,
      Piping: 2
    },
    currentEngineers: ['eng-002'],
    status: 'Ramping Up',
    progress: 20,
    travelRequired: true,
    housingProvided: false
  },
  {
    id: 'proj-003',
    name: 'GM Ultium Battery Plant',
    client: 'General Motors',
    location: 'Warren, OH',
    startDate: '2024-03-01',
    endDate: '2024-11-30',
    budget: 3800000,
    spent: 450000,
    urgency: 'Medium',
    engineersNeeded: {
      Controls: 2,
      Electrical: 4,
      Mechanical: 3,
      Robotics: 2
    },
    currentEngineers: [],
    status: 'Planning',
    progress: 5,
    travelRequired: true,
    housingProvided: true
  }
]

// Mock data for timesheet reconciliation
const timesheetDiscrepancies = [
  {
    id: 1,
    engineerName: 'John Smith',
    engineerHours: 45,
    customerHours: 40,
    difference: 5,
    weekEnding: '2024-01-12',
    status: 'needs_review',
    customer: 'Tesla Motors'
  },
  {
    id: 2,
    engineerName: 'Sarah Johnson',
    engineerHours: 38,
    customerHours: 42,
    difference: -4,
    weekEnding: '2024-01-12',
    status: 'needs_review',
    customer: 'Ford Manufacturing'
  },
  {
    id: 3,
    engineerName: 'Mike Davis',
    engineerHours: 50,
    customerHours: 50,
    difference: 0,
    weekEnding: '2024-01-12',
    status: 'auto_reconciled',
    customer: 'General Motors'
  },
]

// Mock pipeline data
const pipelineStages = [
  { name: 'Recruit', count: 5, icon: Users },
  { name: 'Hire', count: 3, icon: FileText },
  { name: 'Visa', count: 2, icon: FileText },
  { name: 'Deploy', count: 8, icon: CheckCircle },
]

export default function BullPenDashboard() {
  const [activeView, setActiveView] = useState<'engineers' | 'projects' | 'allocation'>('engineers')
  const [selectedEngineer, setSelectedEngineer] = useState<typeof availableEngineers[0] | null>(null)
  const [selectedProject, setSelectedProject] = useState<typeof activeProjects[0] | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('All')
  const [showAllocationModal, setShowAllocationModal] = useState(false)
  const [showFlightModal, setShowFlightModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [engineerActive, setEngineerActive] = useState(true)

  const filteredEngineers = availableEngineers.filter(engineer => {
    const matchesSearch = engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         engineer.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         engineer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === 'All' || engineer.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Resource Allocation Hub</h1>
          <p className="text-slate-400 mt-1">Mix and match engineers for projects • Manage travel and expenses</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowFlightModal(true)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plane className="h-4 w-4 mr-2" />
            Book Travel
          </Button>
          <Button
            onClick={() => setShowExpenseModal(true)}
            className="bg-green-500 hover:bg-green-600"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Track Expenses
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center space-x-1 bg-slate-800/50 backdrop-blur-xl rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveView('engineers')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
            activeView === 'engineers'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Engineers</span>
        </button>
        <button
          onClick={() => setActiveView('projects')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
            activeView === 'projects'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Projects</span>
        </button>
        <button
          onClick={() => setActiveView('allocation')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
            activeView === 'allocation'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Target className="h-4 w-4" />
          <span>Allocation Matrix</span>
        </button>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
              onClick={() => setFilterCategory(category.name)}
            >
              <CardHeader className="pb-2">
                <div className={`inline-flex p-3 rounded-lg ${category.bgColor} border ${category.borderColor} mb-2`}>
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-white">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Available</span>
                    <span className="text-xl font-bold text-white">{category.available}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Deployed</span>
                    <span className="text-sm text-slate-300">{category.deployed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Buffered</span>
                    <span className="text-sm text-slate-300">{category.buffered}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Dynamic Content Based on Active View */}
      <AnimatePresence mode="wait">
        {activeView === 'engineers' && (
          <motion.div
            key="engineers"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Search and Filter Bar */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search engineers, skills, or projects..."
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
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Engineer Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEngineers.map((engineer, index) => (
                <motion.div
                  key={engineer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card 
                    className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300 cursor-pointer h-full"
                    onClick={() => {
                      setSelectedEngineer(engineer)
                      setShowProfileModal(true)
                    }}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{engineer.avatar}</span>
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
                          variant={engineer.availability === 'Available' ? 'success' : 'secondary'}
                          className="text-xs"
                        >
                          {engineer.availability}
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
                              className="text-xs text-slate-200 bg-slate-700/50 border-slate-600 hover:bg-slate-700 transition-colors"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {engineer.skills.length > 3 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs text-slate-200 bg-slate-700/50 border-slate-600 hover:bg-slate-700 transition-colors"
                            >
                              +{engineer.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-4">
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-500 hover:bg-blue-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEngineer(engineer)
                            setShowAllocationModal(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Assign to Project
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEngineer(engineer)
                            setShowProfileModal(true)
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeView === 'projects' && (
          <motion.div
            key="projects"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                          <p className="text-slate-400">{project.client}</p>
                        </div>
                        <Badge 
                          variant={
                            project.urgency === 'High' ? 'destructive' :
                            project.urgency === 'Medium' ? 'warning' : 'success'
                          }
                        >
                          {project.urgency} Priority
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-300">{project.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-300">
                            {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Budget</p>
                          <p className="text-lg font-semibold text-white">
                            ${(project.budget / 1000000).toFixed(1)}M
                          </p>
                          <p className="text-xs text-slate-400">
                            ${(project.spent / 1000000).toFixed(1)}M spent ({((project.spent / project.budget) * 100).toFixed(0)}%)
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Progress</p>
                          <p className="text-lg font-semibold text-white">{project.progress}%</p>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-2">Engineers Needed:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(project.engineersNeeded).map(([category, count]) => (
                            <div key={category} className="flex justify-between items-center p-2 bg-slate-900/50 rounded">
                              <span className="text-sm text-slate-300">{category}</span>
                              <Badge variant="outline">{count}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {project.travelRequired && (
                          <Badge variant="outline" className="text-xs">
                            <Plane className="h-3 w-3 mr-1" />
                            Travel Required
                          </Badge>
                        )}
                        {project.housingProvided && (
                          <Badge variant="outline" className="text-xs">
                            Housing Provided
                          </Badge>
                        )}
                      </div>

                      <Button
                        className="w-full bg-green-500 hover:bg-green-600"
                        onClick={() => {
                          setSelectedProject(project)
                          setShowAllocationModal(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Staff Project
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeView === 'allocation' && (
          <motion.div
            key="allocation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Resource Allocation Matrix</CardTitle>
                <CardDescription>Real-time view of engineer-project assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-3 text-slate-300">Engineer</th>
                        <th className="text-left p-3 text-slate-300">Current Project</th>
                        <th className="text-left p-3 text-slate-300">End Date</th>
                        <th className="text-left p-3 text-slate-300">Next Available</th>
                        <th className="text-left p-3 text-slate-300">Rate</th>
                        <th className="text-left p-3 text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableEngineers.map((engineer) => {
                        const currentProject = activeProjects.find(p => p.currentEngineers.includes(engineer.id))
                        return (
                          <tr key={engineer.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                            <td className="p-3">
                              <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">{engineer.avatar}</span>
                                </div>
                                <div>
                                  <p className="font-medium text-white">{engineer.name}</p>
                                  <p className="text-xs text-slate-400">{engineer.category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              {currentProject ? (
                                <div>
                                  <p className="text-sm font-medium text-white">{currentProject.name}</p>
                                  <p className="text-xs text-slate-400">{currentProject.client}</p>
                                </div>
                              ) : (
                                <Badge variant="success">Available</Badge>
                              )}
                            </td>
                            <td className="p-3">
                              <span className="text-sm text-slate-300">
                                {currentProject ? new Date(currentProject.endDate).toLocaleDateString() : '-'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-sm text-slate-300">
                                {currentProject ? new Date(currentProject.endDate).toLocaleDateString() : 'Now'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-sm font-medium text-green-400">${engineer.hourlyRate}/hr</span>
                            </td>
                            <td className="p-3">
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedEngineer(engineer)
                                    setShowAllocationModal(true)
                                  }}
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-blue-500 hover:bg-blue-600"
                                  onClick={() => setShowFlightModal(true)}
                                >
                                  <Plane className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <EngineerAllocationModal
        isOpen={showAllocationModal}
        onClose={() => {
          setShowAllocationModal(false)
          setSelectedEngineer(null)
          setSelectedProject(null)
        }}
        selectedEngineer={selectedEngineer}
        selectedProject={selectedProject}
        availableEngineers={availableEngineers}
        activeProjects={activeProjects}
      />

      <FlightBookingModal
        isOpen={showFlightModal}
        onClose={() => setShowFlightModal(false)}
        selectedEngineer={selectedEngineer}
      />

      <ExpenseTrackingModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        selectedEngineer={selectedEngineer}
        selectedProject={selectedProject}
      />

      <EngineerProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false)
          setSelectedEngineer(null)
        }}
        engineer={selectedEngineer}
        onAssignToProject={(engineer) => {
          setShowProfileModal(false)
          setSelectedEngineer(engineer)
          setShowAllocationModal(true)
        }}
        onMessage={(engineer) => {
          // Handle message functionality
          console.log('Message engineer:', engineer.name)
        }}
        onVideoCall={(engineer) => {
          // Handle video call functionality
          console.log('Video call engineer:', engineer.name)
        }}
      />
    </div>
  )
}