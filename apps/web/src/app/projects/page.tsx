'use client'

// export const runtime = 'edge'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Briefcase, 
  Calendar,
  MapPin, 
  Users,
  DollarSign,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'
import ProjectDetailModal from '@/components/projects/ProjectDetailModal'
import { BurnRateWidget } from '@/components/burn-rate-widget'
import { BurnRateCalculator, PurchaseOrder, EngineerTimeEntry } from '@/lib/burn-rate-calculator'

const projects = [
  {
    id: 1,
    name: 'GM Assembly Line Automation',
    client: 'General Motors',
    status: 'in_progress',
    priority: 'high',
    completion: 65,
    startDate: '2024-10-15',
    endDate: '2025-04-15',
    budget: 1200000,
    spent: 780000,
    location: 'Detroit, MI',
    engineers: [
      { name: 'Sarah Johnson', role: 'Lead Electrical Engineer' },
      { name: 'Michael Chen', role: 'Mechanical Engineer' },
      { name: 'David Kim', role: 'Systems Engineer' }
    ],
    description: 'Complete automation upgrade for GM assembly line including PLC programming, robotic integration, and quality control systems.'
  },
  {
    id: 6,
    name: 'Tesla Gigafactory Expansion',
    client: 'Tesla Inc.',
    status: 'bidding',
    priority: 'high',
    completion: 0,
    startDate: '2025-03-01',
    endDate: '2025-12-31',
    budget: 2500000,
    spent: 0,
    location: 'Austin, TX',
    engineers: [],
    description: 'Large-scale automation project for Tesla Gigafactory expansion including battery production line automation and quality control systems.'
  },
  {
    id: 2,
    name: 'Ford Paint Shop Upgrade',
    client: 'Ford Motor Company',
    status: 'in_progress',
    priority: 'medium',
    completion: 40,
    startDate: '2024-11-01',
    endDate: '2025-06-30',
    budget: 950000,
    spent: 380000,
    location: 'Dearborn, MI',
    engineers: [
      { name: 'Emily Rodriguez', role: 'Software Engineer' },
      { name: 'Lisa Thompson', role: 'Project Engineer' }
    ],
    description: 'Modernization of paint shop control systems with new HMI interfaces and process optimization.'
  },
  {
    id: 3,
    name: 'Stellantis Quality Control',
    client: 'Stellantis',
    status: 'planning',
    priority: 'medium',
    completion: 15,
    startDate: '2025-01-22',
    endDate: '2025-08-22',
    budget: 750000,
    spent: 112500,
    location: 'Auburn Hills, MI',
    engineers: [
      { name: 'David Kim', role: 'Systems Engineer' }
    ],
    description: 'Implementation of advanced quality control systems with machine vision and statistical process control.'
  },
  {
    id: 4,
    name: 'HIROTEC Welding System',
    client: 'HIROTEC America',
    status: 'in_progress',
    priority: 'high',
    completion: 80,
    startDate: '2024-09-01',
    endDate: '2025-02-28',
    budget: 680000,
    spent: 544000,
    location: 'Howell, MI',
    engineers: [
      { name: 'Michael Chen', role: 'Mechanical Engineer' },
      { name: 'Sarah Johnson', role: 'Electrical Engineer' }
    ],
    description: 'Robotic welding system integration with advanced seam tracking and quality monitoring.'
  },
  {
    id: 5,
    name: 'Magna Seating Automation',
    client: 'Magna International',
    status: 'completed',
    priority: 'low',
    completion: 100,
    startDate: '2024-05-01',
    endDate: '2024-09-30',
    budget: 420000,
    spent: 398000,
    location: 'Troy, MI',
    engineers: [
      { name: 'Lisa Thompson', role: 'Project Engineer' }
    ],
    description: 'Automated seating assembly line with robotic material handling and quality inspection.'
  }
]

// Mock Purchase Order Data for projects
const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-gm-001',
    poNumber: 'PO-2024-GM-001',
    clientName: 'General Motors',
    projectName: 'GM Assembly Line Automation',
    totalBudget: 1200000,
    allocatedHours: 9600,
    startDate: '2024-10-15',
    endDate: '2025-04-15',
    projectId: '1',
    status: 'active'
  },
  {
    id: 'po-ford-001',
    poNumber: 'PO-2024-FORD-001',
    clientName: 'Ford Motor Company',
    projectName: 'Ford Paint Shop Upgrade',
    totalBudget: 950000,
    allocatedHours: 7600,
    startDate: '2024-11-01',
    endDate: '2025-06-30',
    projectId: '2',
    status: 'active'
  },
  {
    id: 'po-hirotec-001',
    poNumber: 'PO-2024-HIRO-001',
    clientName: 'HIROTEC America',
    projectName: 'HIROTEC Welding System',
    totalBudget: 680000,
    allocatedHours: 5440,
    startDate: '2024-09-01',
    endDate: '2025-02-28',
    projectId: '4',
    status: 'at_risk'
  }
]

// Mock Time Entry Data for projects
const mockTimeEntries: EngineerTimeEntry[] = [
  // GM Project Time Entries
  ...Array.from({ length: 40 }, (_, i) => ({
    id: `time-gm-${i}`,
    engineerId: `eng-${i % 3 + 1}`,
    engineerName: ['Sarah Johnson', 'Michael Chen', 'David Kim'][i % 3],
    projectId: '1',
    poId: 'po-gm-001',
    hours: 8 + Math.random() * 4,
    date: new Date(2024, 9, 15 + i * 3).toISOString(),
    rate: 125,
    approved: true
  })),
  // Ford Project Time Entries
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `time-ford-${i}`,
    engineerId: `eng-${i % 2 + 4}`,
    engineerName: ['Emily Rodriguez', 'Lisa Thompson'][i % 2],
    projectId: '2',
    poId: 'po-ford-001',
    hours: 7 + Math.random() * 5,
    date: new Date(2024, 10, 1 + i * 2).toISOString(),
    rate: 115,
    approved: true
  })),
  // HIROTEC Project Time Entries (high burn rate)
  ...Array.from({ length: 50 }, (_, i) => ({
    id: `time-hirotec-${i}`,
    engineerId: `eng-${i % 2 + 1}`,
    engineerName: ['Michael Chen', 'Sarah Johnson'][i % 2],
    projectId: '4',
    poId: 'po-hirotec-001',
    hours: 10 + Math.random() * 4,
    date: new Date(2024, 8, 1 + i * 2).toISOString(),
    rate: 130,
    approved: true
  }))
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-5 w-5 text-green-400" />
    case 'in_progress': return <PlayCircle className="h-5 w-5 text-blue-400" />
    case 'planning': return <Clock className="h-5 w-5 text-yellow-400" />
    case 'on_hold': return <PauseCircle className="h-5 w-5 text-orange-400" />
    case 'bidding': return <Target className="h-5 w-5 text-purple-400" />
    default: return <AlertCircle className="h-5 w-5 text-gray-400" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-500/20 text-green-400'
    case 'in_progress': return 'bg-blue-500/20 text-blue-400'
    case 'planning': return 'bg-yellow-500/20 text-yellow-400'
    case 'on_hold': return 'bg-orange-500/20 text-orange-400'
    case 'bidding': return 'bg-purple-500/20 text-purple-400'
    default: return 'bg-gray-500/20 text-gray-400'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500/20 text-red-400'
    case 'medium': return 'bg-yellow-500/20 text-yellow-400'
    case 'low': return 'bg-green-500/20 text-green-400'
    default: return 'bg-gray-500/20 text-gray-400'
  }
}

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  
  const activeProjects = projects.filter(p => p.status === 'in_progress').length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0)

  const handleProjectClick = (project: any) => {
    setSelectedProject(project)
    setShowProjectModal(true)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Project Management
          </h1>
          <p className="text-slate-400">
            Track and manage all engineering projects and deployments.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
        >
          New Project
        </Link>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Projects</p>
              <p className="text-2xl font-bold text-white mt-1">{activeProjects}</p>
            </div>
            <PlayCircle className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Completed</p>
              <p className="text-2xl font-bold text-white mt-1">{completedProjects}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Budget</p>
              <p className="text-2xl font-bold text-white mt-1">${(totalBudget / 1000000).toFixed(1)}M</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
        </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Budget Utilization</p>
              <p className="text-2xl font-bold text-white mt-1">{Math.round((totalSpent / totalBudget) * 100)}%</p>
            </div>
            <Target className="h-8 w-8 text-purple-400" />
        </div>
        </motion.div>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600 hover:bg-slate-800/70 transition-all duration-300 cursor-pointer group"
            onClick={() => handleProjectClick(project)}
          >
            {/* Project Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                {getStatusIcon(project.status)}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">{project.name}</h3>
                  <p className="text-sm text-slate-400">{project.client}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                  {project.priority} priority
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1">
                  <Eye className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-blue-400">View Details</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 mb-4">{project.description}</p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Progress</span>
                <span className="text-sm font-medium text-white">{project.completion}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${project.completion}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Project Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Timeline</span>
                </div>
                  <p className="text-sm text-white">{project.startDate} - {project.endDate}</p>
              </div>
              
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Budget</span>
                </div>
                <p className="text-sm text-white">
                  ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
                </p>
              </div>
              
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Location</span>
                </div>
                <p className="text-sm text-white">{project.location}</p>
              </div>
            </div>

            {/* Assigned Engineers */}
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Users className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">Assigned Engineers ({project.engineers.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {project.engineers.map((engineer, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                      {engineer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm text-white">{engineer.name}</p>
                      <p className="text-xs text-slate-400">{engineer.role}</p>
                    </div>
                </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Purchase Order Burn Rate Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Purchase Order Tracking</h2>
          <span className="text-sm text-slate-400">Real-time PO utilization and projections</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockPurchaseOrders.map((po, index) => {
            const poTimeEntries = mockTimeEntries.filter(entry => 
              entry.poId === po.id
            )
            const project = projects.find(p => p.id.toString() === po.projectId)
            
            return (
              <motion.div
                key={po.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 overflow-hidden hover:border-blue-500/50 transition-all"
              >
                <div className="p-4 border-b border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white text-lg">
                      {po.clientName}
                    </h3>
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${po.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : po.status === 'at_risk'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-500/20 text-gray-400'
                      }
                    `}>
                      {po.status === 'at_risk' ? 'At Risk' : 'Active'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">
                    {po.poNumber}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {po.projectName}
                  </p>
                </div>
                
                <BurnRateWidget
                  purchaseOrder={po}
                  timeEntries={poTimeEntries}
                  compact={true}
                  showDetails={true}
                  onAlertClick={(alert) => {
                    // SECURITY: console statement removed: console.log('Alert clicked:', alert)
                    // Handle alert click - could open modal or navigate to details
                  }}
                />
                
                <div className="px-4 py-3 bg-slate-900/30 border-t border-slate-700/50 flex items-center justify-between">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleProjectClick(project)
                    }}
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    View Project Details →
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      // Export functionality would go here
                      alert('Export report functionality coming soon')
                    }}
                    className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    Export Report
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false)
          setSelectedProject(null)
        }}
        onUpdateProject={(projectId, updates) => {
          // Handle project updates
          // SECURITY: console statement removed: console.log('Update project:', projectId, updates)
        }}
        onAssignEngineer={(projectId, engineerId) => {
          // Handle engineer assignment
          // SECURITY: console statement removed: console.log('Assign engineer:', projectId, engineerId)
        }}
        onCreateTask={(projectId, task) => {
          // Handle task creation
          // SECURITY: console statement removed: console.log('Create task:', projectId, task)
        }}
      />
    </div>
  )
}