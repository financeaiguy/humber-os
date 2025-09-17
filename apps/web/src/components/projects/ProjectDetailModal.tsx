'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
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
  FileText,
  TrendingUp,
  TrendingDown,
  Activity,
  Briefcase,
  Settings,
  MessageSquare,
  Phone,
  Video,
  Edit,
  Archive,
  MoreHorizontal,
  Star,
  Award,
  Zap,
  Shield,
  AlertTriangle,
  ChevronRight,
  Plus,
  Minus,
  Save,
  Upload,
  Download,
  Share2,
  Bell,
  Flag
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ProjectActionPanel from './ProjectActionPanel'

interface ProjectDetailModalProps {
  project: any
  isOpen: boolean
  onClose: () => void
  onUpdateProject?: (projectId: string, updates: any) => void
  onAssignEngineer?: (projectId: string, engineerId: string) => void
  onCreateTask?: (projectId: string, task: any) => void
}

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
    case 'completed': return 'bg-green-900/50 text-green-300 border border-green-600'
    case 'in_progress': return 'bg-blue-900/50 text-blue-300 border border-blue-600'
    case 'planning': return 'bg-yellow-900/50 text-yellow-300 border border-yellow-600'
    case 'on_hold': return 'bg-orange-900/50 text-orange-300 border border-orange-600'
    case 'bidding': return 'bg-purple-900/50 text-purple-300 border border-purple-600'
    default: return 'bg-slate-900/50 text-slate-300 border border-slate-600'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-900/50 text-red-300 border border-red-600'
    case 'medium': return 'bg-yellow-900/50 text-yellow-300 border border-yellow-600'
    case 'low': return 'bg-green-900/50 text-green-300 border border-green-600'
    default: return 'bg-slate-900/50 text-slate-300 border border-slate-600'
  }
}

export default function ProjectDetailModal({ 
  project, 
  isOpen, 
  onClose, 
  onUpdateProject,
  onAssignEngineer,
  onCreateTask
}: ProjectDetailModalProps) {
  const [activeTab, setActiveTab] = useState('actions')
  const [isEditing, setIsEditing] = useState(false)

  if (!project) return null

  // Mock additional project data for detailed view
  const projectDetails = {
    ...project,
    phases: [
      { id: 1, name: 'Planning & Design', status: 'completed', progress: 100, startDate: '2024-10-15', endDate: '2024-11-15' },
      { id: 2, name: 'Procurement', status: 'completed', progress: 100, startDate: '2024-11-01', endDate: '2024-12-01' },
      { id: 3, name: 'Installation', status: 'in_progress', progress: 65, startDate: '2024-12-01', endDate: '2025-02-15' },
      { id: 4, name: 'Testing & Commissioning', status: 'planning', progress: 0, startDate: '2025-02-15', endDate: '2025-03-15' },
      { id: 5, name: 'Training & Handover', status: 'planning', progress: 0, startDate: '2025-03-15', endDate: '2025-04-15' }
    ],
    tasks: [
      { id: 1, name: 'PLC Programming', assignee: 'Sarah Johnson', status: 'in_progress', priority: 'high', dueDate: '2025-01-15' },
      { id: 2, name: 'HMI Development', assignee: 'Michael Chen', status: 'completed', priority: 'medium', dueDate: '2024-12-30' },
      { id: 3, name: 'Safety System Integration', assignee: 'David Kim', status: 'planning', priority: 'high', dueDate: '2025-02-01' },
      { id: 4, name: 'Quality Control Setup', assignee: 'Sarah Johnson', status: 'planning', priority: 'medium', dueDate: '2025-02-15' }
    ],
    risks: [
      { id: 1, description: 'Delivery delay of critical components', impact: 'high', probability: 'medium', mitigation: 'Alternative suppliers identified' },
      { id: 2, description: 'Integration complexity with legacy systems', impact: 'medium', probability: 'high', mitigation: 'Additional testing phase scheduled' }
    ],
    documents: [
      { id: 1, name: 'Project Charter', type: 'PDF', size: '2.4 MB', uploadDate: '2024-10-15' },
      { id: 2, name: 'Technical Specifications', type: 'PDF', size: '5.1 MB', uploadDate: '2024-10-20' },
      { id: 3, name: 'Progress Report - December', type: 'PDF', size: '1.8 MB', uploadDate: '2024-12-31' }
    ],
    milestones: [
      { id: 1, name: 'Design Approval', date: '2024-11-15', status: 'completed' },
      { id: 2, name: 'Equipment Delivery', date: '2024-12-15', status: 'completed' },
      { id: 3, name: 'Installation Complete', date: '2025-02-15', status: 'upcoming' },
      { id: 4, name: 'System Go-Live', date: '2025-04-15', status: 'upcoming' }
    ],
    financials: {
      totalBudget: project.budget,
      spent: project.spent,
      committed: project.budget * 0.15,
      remaining: project.budget - project.spent,
      categories: [
        { name: 'Labor', budgeted: project.budget * 0.4, spent: project.spent * 0.45 },
        { name: 'Equipment', budgeted: project.budget * 0.35, spent: project.spent * 0.3 },
        { name: 'Materials', budgeted: project.budget * 0.15, spent: project.spent * 0.15 },
        { name: 'Travel & Expenses', budgeted: project.budget * 0.1, spent: project.spent * 0.1 }
      ]
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-900 rounded-2xl border border-slate-700/50 w-full max-w-6xl max-h-[95vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {getStatusIcon(project.status)}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{project.name}</h2>
                    <p className="text-slate-400">{project.client} • {project.location}</p>
                    <p className="text-sm text-slate-500 mt-1">{project.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor(project.priority)}>
                    {project.priority} priority
                  </Badge>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status.replace('_', ' ')}
                  </Badge>
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

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-slate-400">Progress</span>
                  </div>
                  <p className="text-lg font-semibold text-white mt-1">{project.completion}%</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-slate-400">Budget Used</span>
                  </div>
                  <p className="text-lg font-semibold text-white mt-1">
                    {Math.round((project.spent / project.budget) * 100)}%
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-slate-400">Team Size</span>
                  </div>
                  <p className="text-lg font-semibold text-white mt-1">{project.engineers.length}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-orange-400" />
                    <span className="text-sm text-slate-400">Days Left</span>
                  </div>
                  <p className="text-lg font-semibold text-white mt-1">
                    {Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-280px)]">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-8 bg-slate-700/50">
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="phases">Phases</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="financials">Financials</TabsTrigger>
                  <TabsTrigger value="risks">Risks</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                {/* Actions Tab - Primary tab for project management */}
                <TabsContent value="actions" className="space-y-6">
                  <ProjectActionPanel
                    project={project}
                    onUpdateStatus={(projectId, status) => {
                      console.log('Update status:', projectId, status)
                      onUpdateProject?.(projectId, { status })
                    }}
                    onSubmitBid={(projectId, bidData) => {
                      console.log('Submit bid:', projectId, bidData)
                      onUpdateProject?.(projectId, { bidData, status: 'planning' })
                    }}
                    onStartProject={(projectId) => {
                      console.log('Start project:', projectId)
                      onUpdateProject?.(projectId, { status: 'in_progress', startedAt: new Date().toISOString() })
                    }}
                    onCompleteProject={(projectId) => {
                      console.log('Complete project:', projectId)
                      onUpdateProject?.(projectId, { status: 'completed', completedAt: new Date().toISOString() })
                    }}
                  />
                </TabsContent>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Project Timeline */}
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Calendar className="h-5 w-5 mr-2" />
                          Project Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Start Date</span>
                            <span className="text-white">{project.startDate}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">End Date</span>
                            <span className="text-white">{project.endDate}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Duration</span>
                            <span className="text-white">
                              {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                            </span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Overall Progress</span>
                            <span className="text-white">{project.completion}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.completion}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Key Milestones */}
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Flag className="h-5 w-5 mr-2" />
                          Key Milestones
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {projectDetails.milestones.map((milestone) => (
                            <div key={milestone.id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {milestone.status === 'completed' ? (
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                ) : (
                                  <Clock className="h-4 w-4 text-yellow-400" />
                                )}
                                <span className="text-white text-sm">{milestone.name}</span>
                              </div>
                              <span className="text-slate-400 text-sm">{milestone.date}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Activity className="h-5 w-5 mr-2" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="h-2 w-2 rounded-full bg-blue-400 mt-2"></div>
                          <div>
                            <p className="text-white text-sm">PLC programming milestone completed</p>
                            <p className="text-slate-400 text-xs">2 hours ago by Sarah Johnson</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="h-2 w-2 rounded-full bg-green-400 mt-2"></div>
                          <div>
                            <p className="text-white text-sm">Equipment delivery confirmed</p>
                            <p className="text-slate-400 text-xs">1 day ago by Michael Chen</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="h-2 w-2 rounded-full bg-yellow-400 mt-2"></div>
                          <div>
                            <p className="text-white text-sm">Risk assessment updated</p>
                            <p className="text-slate-400 text-xs">3 days ago by David Kim</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Phases Tab */}
                <TabsContent value="phases" className="space-y-4">
                  {projectDetails.phases.map((phase) => (
                    <Card key={phase.id} className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(phase.status)}
                            <h3 className="text-white font-semibold">{phase.name}</h3>
                            <Badge className={getStatusColor(phase.status)}>
                              {phase.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <span className="text-slate-400 text-sm">
                            {phase.startDate} - {phase.endDate}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Progress</span>
                            <span className="text-white">{phase.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${phase.progress}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Tasks Tab */}
                <TabsContent value="tasks" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-white font-semibold">Active Tasks</h3>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                  {projectDetails.tasks.map((task) => (
                    <Card key={task.id} className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(task.status)}
                            <div>
                              <h4 className="text-white font-medium">{task.name}</h4>
                              <p className="text-slate-400 text-sm">Assigned to {task.assignee}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <span className="text-slate-400 text-sm">Due: {task.dueDate}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Team Tab */}
                <TabsContent value="team" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-white font-semibold">Project Team</h3>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.engineers.map((engineer, idx) => (
                      <Card key={idx} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                              {engineer.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{engineer.name}</h4>
                              <p className="text-slate-400 text-sm">{engineer.role}</p>
                            </div>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Video className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Financials Tab */}
                <TabsContent value="financials" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Budget Overview */}
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <DollarSign className="h-5 w-5 mr-2" />
                          Budget Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Total Budget</span>
                            <span className="text-white font-semibold">${projectDetails.financials.totalBudget.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Spent</span>
                            <span className="text-white">${projectDetails.financials.spent.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Committed</span>
                            <span className="text-white">${projectDetails.financials.committed.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Remaining</span>
                            <span className="text-green-400 font-semibold">${projectDetails.financials.remaining.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        {/* Budget Utilization */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Budget Utilization</span>
                            <span className="text-white">{Math.round((projectDetails.financials.spent / projectDetails.financials.totalBudget) * 100)}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(projectDetails.financials.spent / projectDetails.financials.totalBudget) * 100}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Budget Categories */}
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white">Budget by Category</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {projectDetails.financials.categories.map((category, idx) => (
                            <div key={idx} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">{category.name}</span>
                                <span className="text-white">
                                  ${category.spent.toLocaleString()} / ${category.budgeted.toLocaleString()}
                                </span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min((category.spent / category.budgeted) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Risks Tab */}
                <TabsContent value="risks" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-white font-semibold">Project Risks</h3>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Risk
                    </Button>
                  </div>
                  {projectDetails.risks.map((risk) => (
                    <Card key={risk.id} className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5" />
                              <div>
                                <h4 className="text-white font-medium">{risk.description}</h4>
                                <p className="text-slate-400 text-sm mt-1">Mitigation: {risk.mitigation}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Badge className={risk.impact === 'high' ? 'bg-red-900/50 text-red-300 border border-red-600' : 'bg-yellow-900/50 text-yellow-300 border border-yellow-600'}>
                                {risk.impact} impact
                              </Badge>
                              <Badge className={risk.probability === 'high' ? 'bg-red-900/50 text-red-300 border border-red-600' : 'bg-yellow-900/50 text-yellow-300 border border-yellow-600'}>
                                {risk.probability} probability
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-white font-semibold">Project Documents</h3>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                  {projectDetails.documents.map((doc) => (
                    <Card key={doc.id} className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-400" />
                            <div>
                              <h4 className="text-white font-medium">{doc.name}</h4>
                              <p className="text-slate-400 text-sm">{doc.type} • {doc.size} • Uploaded {doc.uploadDate}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-700/50 bg-slate-800/30">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button variant="outline" className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Project
                  </Button>
                  <Button variant="outline" className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Team Chat
                  </Button>
                  <Button variant="outline" className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={onClose} className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                    Close
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
