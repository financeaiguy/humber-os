'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  User,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Download,
  MessageSquare,
  Settings,
  UserCheck,
  X,
  Send,
  Plus,
  Eye,
  Users
} from 'lucide-react'
import { OptimizedLink } from '@/components/optimized-link'
import { useSession } from '@/components/session-context'
import type { OffboardingRequest } from '../page'

// Enhanced task interface with comments and role visibility
interface TaskComment {
  id: string
  taskId: string
  authorId: string
  authorName: string
  authorRole: string
  content: string
  timestamp: string
  isInternal?: boolean
}

interface EnhancedHandoverTask {
  id: string
  task: string
  description?: string
  status: 'pending' | 'completed' | 'in_progress' | 'blocked'
  assignedTo: string
  assignedToRole: string
  dueDate?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  visibleToRoles: string[]
  comments: TaskComment[]
  completedBy?: string
  completedAt?: string
  estimatedHours?: number
  actualHours?: number
}

// Enhanced mock data with role-based visibility and comments
const getEnhancedOffboardingRequest = (id: string) => ({
  id: id,
  type: 'PROJECT_COMPLETION',
  status: 'IN_PROGRESS',
  engineerId: 'eng-001',
  engineerName: 'John Smith',
  projectId: 'proj-gm-001',
  projectName: 'GM Assembly Line Automation',
  clientName: 'General Motors',
  initiatedBy: 'Sarah Johnson (PM)',
  initiatedDate: '2024-01-15',
  scheduledDate: '2024-01-30',
  reason: 'Project successfully completed all deliverables. Client satisfaction score: 4.8/5.0. All technical requirements met.',
  notes: 'Exceptional performance throughout the project. Client has requested John for future projects. Recommend for retention and potential promotion.',
  documents: [
    'Final Project Report',
    'Technical Handover Guide', 
    'Asset Transfer Checklist',
    'Client Satisfaction Survey',
    'Knowledge Transfer Document',
    'Equipment Return Form'
  ],
  financialImpact: {
    refunds: 0,
    penalties: 0,
    finalPayment: 15000
  },
  handoverTasks: [
    { 
      id: '1', 
      task: 'Complete technical documentation handover',
      description: 'Prepare comprehensive technical documentation for client team',
      status: 'completed', 
      assignedTo: 'John Smith',
      assignedToRole: 'ENGINEER_EMPLOYEE',
      dueDate: '2024-01-20',
      priority: 'high',
      visibleToRoles: ['PARTNER_ADMIN', 'OPERATOR_ADMIN', 'ENGINEER_EMPLOYEE'],
      completedBy: 'John Smith',
      completedAt: '2024-01-19',
      estimatedHours: 8,
      actualHours: 6,
      comments: [
        {
          id: 'c1',
          taskId: '1',
          authorId: 'eng-001',
          authorName: 'John Smith',
          authorRole: 'ENGINEER_EMPLOYEE',
          content: 'Documentation completed ahead of schedule. Included additional troubleshooting guide.',
          timestamp: '2024-01-19T14:30:00Z'
        }
      ]
    },
    { 
      id: '2', 
      task: 'Return all project equipment and assets',
      description: 'Coordinate with facilities team for equipment return and inventory',
      status: 'pending', 
      assignedTo: 'Facilities Team',
      assignedToRole: 'OPERATOR_ADMIN',
      dueDate: '2024-01-25',
      priority: 'medium',
      visibleToRoles: ['PARTNER_ADMIN', 'OPERATOR_ADMIN'],
      estimatedHours: 4,
      comments: [
        {
          id: 'c2',
          taskId: '2',
          authorId: 'op-001',
          authorName: 'Mike Wilson',
          authorRole: 'OPERATOR_ADMIN',
          content: 'Scheduled for pickup on Jan 24th. All equipment has been catalogued.',
          timestamp: '2024-01-18T10:15:00Z'
        }
      ]
    },
    { 
      id: '3', 
      task: 'Conduct final client knowledge transfer session',
      description: 'Schedule and conduct comprehensive knowledge transfer with client technical team',
      status: 'in_progress', 
      assignedTo: 'John Smith',
      assignedToRole: 'ENGINEER_EMPLOYEE',
      dueDate: '2024-01-28',
      priority: 'critical',
      visibleToRoles: ['PARTNER_ADMIN', 'OPERATOR_ADMIN', 'ENGINEER_EMPLOYEE'],
      estimatedHours: 6,
      comments: [
        {
          id: 'c3',
          taskId: '3',
          authorId: 'partner-001',
          authorName: 'Sarah Johnson',
          authorRole: 'PARTNER_ADMIN',
          content: 'Client has requested additional session on system maintenance. Please include this.',
          timestamp: '2024-01-20T09:00:00Z'
        },
        {
          id: 'c4',
          taskId: '3',
          authorId: 'eng-001',
          authorName: 'John Smith',
          authorRole: 'ENGINEER_EMPLOYEE',
          content: 'Understood. Will prepare maintenance documentation and include in the session.',
          timestamp: '2024-01-20T11:30:00Z'
        }
      ]
    },
    { 
      id: '4', 
      task: 'Submit final expense reports',
      description: 'Compile and submit all project-related expenses for final billing',
      status: 'completed', 
      assignedTo: 'John Smith',
      assignedToRole: 'ENGINEER_EMPLOYEE',
      dueDate: '2024-01-22',
      priority: 'high',
      visibleToRoles: ['PARTNER_ADMIN', 'OPERATOR_ADMIN', 'ENGINEER_EMPLOYEE'],
      completedBy: 'John Smith',
      completedAt: '2024-01-21',
      estimatedHours: 2,
      actualHours: 1.5,
      comments: []
    },
    { 
      id: '5', 
      task: 'Update project status in all systems',
      description: 'Update project management systems, CRM, and internal databases',
      status: 'pending', 
      assignedTo: 'Project Manager',
      assignedToRole: 'PARTNER_ADMIN',
      dueDate: '2024-01-26',
      priority: 'medium',
      visibleToRoles: ['PARTNER_ADMIN', 'OPERATOR_ADMIN'],
      estimatedHours: 3,
      comments: []
    },
    { 
      id: '6', 
      task: 'Process final client invoicing',
      description: 'Generate and send final invoice including completion bonus',
      status: 'pending', 
      assignedTo: 'Finance Team',
      assignedToRole: 'OPERATOR_ADMIN',
      dueDate: '2024-01-30',
      priority: 'high',
      visibleToRoles: ['PARTNER_ADMIN', 'OPERATOR_ADMIN'],
      estimatedHours: 2,
      comments: []
    },
    { 
      id: '7', 
      task: 'Archive project files and documentation',
      description: 'Archive all project files according to data retention policies',
      status: 'pending', 
      assignedTo: 'IT Team',
      assignedToRole: 'OPERATOR_ADMIN',
      dueDate: '2024-02-05',
      priority: 'low',
      visibleToRoles: ['PARTNER_ADMIN', 'OPERATOR_ADMIN'],
      estimatedHours: 4,
      comments: []
    }
  ] as EnhancedHandoverTask[]
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-900/50 text-yellow-300 border border-yellow-600'
    case 'IN_PROGRESS': return 'bg-blue-900/50 text-blue-300 border border-blue-600'
    case 'AWAITING_APPROVAL': return 'bg-orange-900/50 text-orange-300 border border-orange-600'
    case 'COMPLETED': return 'bg-green-900/50 text-green-300 border border-green-600'
    case 'CANCELLED': return 'bg-slate-900/50 text-slate-300 border border-slate-600'
    default: return 'bg-slate-900/50 text-slate-300 border border-slate-600'
  }
}

const TaskStatusIcon = ({ status }: { status: 'pending' | 'completed' }) => {
  return status === 'completed' 
    ? <CheckCircle className="h-4 w-4 text-green-500" />
    : <Clock className="h-4 w-4 text-yellow-500" />
}

export default function OffboardingDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { data: session } = useSession()
  const [request, setRequest] = useState(getEnhancedOffboardingRequest(id))
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'documents' | 'financial' | 'timeline'>('overview')
  const [commentText, setCommentText] = useState<{[taskId: string]: string}>({})
  const [showComments, setShowComments] = useState<{[taskId: string]: boolean}>({})

  // Filter tasks based on user role
  const userRole = session?.user?.role || 'ENGINEER_EMPLOYEE'
  const visibleTasks = request.handoverTasks.filter(task => 
    task.visibleToRoles.includes(userRole) || 
    (userRole === 'ENGINEER_EMPLOYEE' && task.assignedToRole === 'ENGINEER_EMPLOYEE')
  )

  const completedTasks = visibleTasks.filter(task => task.status === 'completed').length
  const totalTasks = visibleTasks.length
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const handleTaskToggle = (taskId: string) => {
    const task = request.handoverTasks.find(t => t.id === taskId)
    if (!task) return

    // Check if user can modify this task
    const canModify = userRole === 'PARTNER_ADMIN' || 
                     userRole === 'OPERATOR_ADMIN' || 
                     (userRole === 'ENGINEER_EMPLOYEE' && task.assignedToRole === 'ENGINEER_EMPLOYEE')

    if (!canModify) {
      alert('You do not have permission to modify this task.')
      return
    }

    setRequest(prev => ({
      ...prev,
      handoverTasks: prev.handoverTasks.map(task =>
        task.id === taskId 
          ? { 
              ...task, 
              status: task.status === 'completed' ? 'pending' : 'completed',
              completedBy: task.status === 'completed' ? undefined : session?.user?.name || 'Unknown User',
              completedAt: task.status === 'completed' ? undefined : new Date().toISOString()
            }
          : task
      )
    }))
  }

  const handleAddComment = (taskId: string) => {
    const comment = commentText[taskId]?.trim()
    if (!comment || !session?.user) return

    const newComment: TaskComment = {
      id: `c${Date.now()}`,
      taskId,
      authorId: session.user.id || 'unknown',
      authorName: session.user.name || 'Unknown User',
      authorRole: userRole,
      content: comment,
      timestamp: new Date().toISOString()
    }

    setRequest(prev => ({
      ...prev,
      handoverTasks: prev.handoverTasks.map(task =>
        task.id === taskId 
          ? { ...task, comments: [...task.comments, newComment] }
          : task
      )
    }))

    setCommentText(prev => ({ ...prev, [taskId]: '' }))
  }

  const toggleComments = (taskId: string) => {
    setShowComments(prev => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const handleStatusUpdate = (newStatus: string) => {
    setRequest(prev => ({ ...prev, status: newStatus as any }))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-900/30 border-red-600'
      case 'high': return 'text-orange-400 bg-orange-900/30 border-orange-600'
      case 'medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-600'
      case 'low': return 'text-green-400 bg-green-900/30 border-green-600'
      default: return 'text-slate-400 bg-slate-900/30 border-slate-600'
    }
  }

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-900/30 border-green-600'
      case 'in_progress': return 'text-blue-400 bg-blue-900/30 border-blue-600'
      case 'blocked': return 'text-red-400 bg-red-900/30 border-red-600'
      case 'pending': return 'text-yellow-400 bg-yellow-900/30 border-yellow-600'
      default: return 'text-slate-400 bg-slate-900/30 border-slate-600'
    }
  }

  const timeline = [
    {
      date: request.initiatedDate,
      title: 'Off-boarding Request Initiated',
      description: `Request created by ${request.initiatedBy}`,
      status: 'completed'
    },
    {
      date: '2024-01-16',
      title: 'Initial Review Completed',
      description: 'Request reviewed and approved for processing',
      status: 'completed'
    },
    {
      date: '2024-01-18',
      title: 'Handover Tasks Assigned',
      description: 'Tasks distributed to relevant teams',
      status: 'completed'
    },
    {
      date: '2024-01-20',
      title: 'Documentation Phase',
      description: 'Technical documentation and knowledge transfer in progress',
      status: 'current'
    },
    {
      date: request.scheduledDate || 'TBD',
      title: 'Scheduled Completion',
      description: 'Expected completion of all off-boarding activities',
      status: 'pending'
    }
  ]

  return (
    <div className="space-y-6 p-6 min-h-screen bg-slate-950">
      {/* Header */}
      <div className="flex items-center gap-4">
        <OptimizedLink href="/offboarding">
          <Button variant="outline" size="sm" className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Off-boarding
          </Button>
        </OptimizedLink>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">Off-boarding Request</h1>
          <p className="text-slate-400">ID: {request.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Status and Quick Actions */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Badge className={`${getStatusColor(request.status)} text-sm px-3 py-1`}>
                {request.status.replace('_', ' ')}
              </Badge>
              <div className="text-sm text-slate-400">
                Progress: {completedTasks}/{totalTasks} tasks completed ({progressPercentage.toFixed(0)}%)
              </div>
            </div>
            <div className="flex gap-2">
              {request.status === 'IN_PROGRESS' && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                    onClick={() => handleStatusUpdate('AWAITING_APPROVAL')}
                  >
                    Submit for Approval
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleStatusUpdate('COMPLETED')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                </>
              )}
              {request.status === 'AWAITING_APPROVAL' && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                    onClick={() => handleStatusUpdate('IN_PROGRESS')}
                  >
                    Request Changes
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleStatusUpdate('COMPLETED')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Approve & Complete
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'tasks', label: 'Handover Tasks', icon: CheckCircle },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'financial', label: 'Financial Impact', icon: DollarSign },
            { id: 'timeline', label: 'Timeline', icon: Calendar }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee Information */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-5 w-5" />
                Employee Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Name</p>
                <p className="font-medium text-white">{request.engineerName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Employee ID</p>
                <p className="font-medium text-white">{request.engineerId}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Current Role</p>
                <p className="font-medium text-white">Senior Engineering Consultant</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Start Date</p>
                <p className="font-medium text-white">March 15, 2023</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Performance Rating</p>
                <p className="font-medium text-green-400">Exceeds Expectations (4.8/5.0)</p>
              </div>
            </CardContent>
          </Card>

          {/* Project Information */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Building2 className="h-5 w-5" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Project</p>
                <p className="font-medium text-white">{request.projectName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Client</p>
                <p className="font-medium text-white">{request.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Project ID</p>
                <p className="font-medium text-white">{request.projectId}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Project Duration</p>
                <p className="font-medium text-white">8 months</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Project Status</p>
                <p className="font-medium text-green-400">98% Complete</p>
              </div>
            </CardContent>
          </Card>

          {/* Off-boarding Information */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="h-5 w-5" />
                Off-boarding Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Type</p>
                <p className="font-medium text-white">Project Completion</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Initiated By</p>
                <p className="font-medium text-white">{request.initiatedBy}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Initiated Date</p>
                <p className="font-medium text-white">{new Date(request.initiatedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Scheduled Date</p>
                <p className="font-medium text-white">{request.scheduledDate ? new Date(request.scheduledDate).toLocaleDateString() : 'TBD'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Current Status</p>
                <Badge className={getStatusColor(request.status)}>
                  {request.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Role-based visibility info */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Eye className="h-4 w-4" />
                <span>Showing tasks visible to your role: </span>
                <Badge className={`${userRole === 'PARTNER_ADMIN' ? 'bg-blue-900/50 text-blue-300' : 
                                   userRole === 'OPERATOR_ADMIN' ? 'bg-purple-900/50 text-purple-300' : 
                                   'bg-green-900/50 text-green-300'} border`}>
                  {userRole.replace('_', ' ')}
                </Badge>
                <span>({visibleTasks.length} of {request.handoverTasks.length} total tasks)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Handover Tasks Progress
              </CardTitle>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-sm text-slate-400">{completedTasks} of {totalTasks} visible tasks completed</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {visibleTasks.map((task) => (
                  <div key={task.id} className="border border-slate-600 rounded-lg bg-slate-800/50 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <button 
                            onClick={() => handleTaskToggle(task.id)}
                            className="mt-1"
                          >
                            <TaskStatusIcon status={task.status} />
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className={`font-medium ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                                {task.task}
                              </p>
                              <Badge className={`text-xs px-2 py-1 border ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </Badge>
                              <Badge className={`text-xs px-2 py-1 border ${getTaskStatusColor(task.status)}`}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            {task.description && (
                              <p className="text-sm text-slate-400 mb-2">{task.description}</p>
                            )}
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-400">
                              <div>
                                <span className="font-medium">Assigned to:</span><br />
                                {task.assignedTo}
                              </div>
                              <div>
                                <span className="font-medium">Due Date:</span><br />
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                              </div>
                              <div>
                                <span className="font-medium">Estimated:</span><br />
                                {task.estimatedHours}h
                              </div>
                              <div>
                                <span className="font-medium">Role:</span><br />
                                {task.assignedToRole.replace('_', ' ')}
                              </div>
                            </div>

                            {task.completedBy && (
                              <div className="mt-2 text-xs text-green-400">
                                ✅ Completed by {task.completedBy} on {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Unknown'}
                                {task.actualHours && ` (${task.actualHours}h actual)`}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                            onClick={() => toggleComments(task.id)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Comment ({task.comments.length})
                          </Button>
                          
                          {task.status !== 'completed' && (
                            <Button 
                              size="sm"
                              onClick={() => handleTaskToggle(task.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={!(userRole === 'PARTNER_ADMIN' || 
                                        userRole === 'OPERATOR_ADMIN' || 
                                        (userRole === 'ENGINEER_EMPLOYEE' && task.assignedToRole === 'ENGINEER_EMPLOYEE'))}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {showComments[task.id] && (
                      <div className="border-t border-slate-600 bg-slate-900/30">
                        <div className="p-4">
                          <h5 className="text-sm font-medium text-white mb-3">Comments</h5>
                          
                          {/* Existing Comments */}
                          <div className="space-y-3 mb-4">
                            {task.comments.map((comment) => (
                              <div key={comment.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-medium text-white">{comment.authorName}</span>
                                  <Badge className={`text-xs px-2 py-1 ${
                                    comment.authorRole === 'PARTNER_ADMIN' ? 'bg-blue-900/50 text-blue-300' :
                                    comment.authorRole === 'OPERATOR_ADMIN' ? 'bg-purple-900/50 text-purple-300' :
                                    'bg-green-900/50 text-green-300'
                                  }`}>
                                    {comment.authorRole.replace('_', ' ')}
                                  </Badge>
                                  <span className="text-xs text-slate-400">
                                    {new Date(comment.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-300">{comment.content}</p>
                              </div>
                            ))}
                          </div>

                          {/* Add New Comment */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add a comment..."
                              value={commentText[task.id] || ''}
                              onChange={(e) => setCommentText(prev => ({ ...prev, [task.id]: e.target.value }))}
                              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              onKeyPress={(e) => e.key === 'Enter' && handleAddComment(task.id)}
                            />
                            <Button
                              size="sm"
                              onClick={() => handleAddComment(task.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              disabled={!commentText[task.id]?.trim()}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'documents' && (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Required Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {request.documents.map((doc, index) => (
                <div key={index} className="border border-slate-600 rounded-lg p-4 bg-slate-800/50 hover:bg-slate-800/70 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-white">{doc}</p>
                        <p className="text-sm text-slate-400">PDF Document</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'financial' && (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Financial Impact Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-900/30 border border-green-600/30 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-400">${request.financialImpact.finalPayment.toLocaleString()}</p>
                <p className="text-sm text-slate-400">Final Payment</p>
              </div>
              <div className="text-center p-6 bg-red-900/30 border border-red-600/30 rounded-lg">
                <X className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-400">${request.financialImpact.refunds.toLocaleString()}</p>
                <p className="text-sm text-slate-400">Refunds</p>
              </div>
              <div className="text-center p-6 bg-yellow-900/30 border border-yellow-600/30 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-400">${request.financialImpact.penalties.toLocaleString()}</p>
                <p className="text-sm text-slate-400">Penalties</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
              <h4 className="font-medium text-white mb-2">Financial Notes</h4>
              <p className="text-sm text-slate-400">
                Final payment includes completion bonus of $5,000 due to exceptional performance and early delivery. 
                No penalties or refunds applicable for this successful project completion.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'timeline' && (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Off-boarding Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {timeline.map((event, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${
                    event.status === 'completed' ? 'bg-green-500' :
                    event.status === 'current' ? 'bg-blue-500' :
                    'bg-gray-300'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">{event.title}</h4>
                      <span className="text-sm text-slate-400">{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reason and Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Reason for Off-boarding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">{request.reason}</p>
          </CardContent>
        </Card>

        {request.notes && (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">{request.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}