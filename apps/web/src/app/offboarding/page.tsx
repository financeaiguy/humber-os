'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  UserMinus, 
  FolderX, 
  Pause, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  XCircle,
  FileText,
  Settings,
  ArrowRight,
  Calendar,
  DollarSign,
  User,
  Building2
} from 'lucide-react'
import { OptimizedLink } from '@/components/optimized-link'

// Off-boarding types and statuses
export type OffboardingType = 
  | 'PROJECT_COMPLETION'    // Project finished successfully
  | 'PROJECT_PAUSE'         // Temporary project pause
  | 'PROJECT_TERMINATION'   // Project terminated
  | 'CUSTOMER_TERMINATION'  // Customer terminated contract
  | 'OPERATOR_TERMINATION'  // Operator terminated employee
  | 'ADMIN_TERMINATION'     // Admin terminated employee
  | 'VOLUNTARY_DEPARTURE'   // Employee voluntary departure

export type OffboardingStatus = 
  | 'PENDING'
  | 'IN_PROGRESS' 
  | 'AWAITING_APPROVAL'
  | 'COMPLETED'
  | 'CANCELLED'

export interface OffboardingRequest {
  id: string
  type: OffboardingType
  status: OffboardingStatus
  engineerId: string
  engineerName: string
  projectId: string
  projectName: string
  clientName: string
  initiatedBy: string
  initiatedDate: string
  scheduledDate?: string
  completionDate?: string
  reason: string
  notes?: string
  approvedBy?: string
  documents: string[]
  financialImpact: {
    refunds: number
    penalties: number
    finalPayment: number
  }
  handoverTasks: {
    id: string
    task: string
    status: 'pending' | 'completed'
    assignedTo: string
  }[]
}

// Mock data - in production this would come from your API
const mockOffboardingRequests: OffboardingRequest[] = [
  {
    id: 'off-001',
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
    reason: 'Project successfully completed all deliverables',
    documents: ['Final Report', 'Handover Guide', 'Asset Transfer'],
    financialImpact: {
      refunds: 0,
      penalties: 0,
      finalPayment: 15000
    },
    handoverTasks: [
      { id: '1', task: 'Technical documentation handover', status: 'completed', assignedTo: 'John Smith' },
      { id: '2', task: 'Equipment return', status: 'pending', assignedTo: 'Facilities Team' },
      { id: '3', task: 'Client knowledge transfer', status: 'pending', assignedTo: 'John Smith' }
    ]
  },
  {
    id: 'off-002',
    type: 'CUSTOMER_TERMINATION',
    status: 'AWAITING_APPROVAL',
    engineerId: 'eng-002',
    engineerName: 'Maria Garcia',
    projectId: 'proj-ford-002',
    projectName: 'Ford Paint Shop Upgrade',
    clientName: 'Ford Motor Company',
    initiatedBy: 'Ford Legal Team',
    initiatedDate: '2024-01-10',
    scheduledDate: '2024-01-20',
    reason: 'Client budget constraints and project scope changes',
    notes: 'Client requesting immediate termination with 50% completion payment',
    documents: ['Termination Notice', 'Partial Completion Report'],
    financialImpact: {
      refunds: 25000,
      penalties: 5000,
      finalPayment: 30000
    },
    handoverTasks: [
      { id: '1', task: 'Secure all client data', status: 'completed', assignedTo: 'IT Security' },
      { id: '2', task: 'Equipment retrieval', status: 'pending', assignedTo: 'Logistics Team' },
      { id: '3', task: 'Final billing reconciliation', status: 'pending', assignedTo: 'Finance Team' }
    ]
  },
  {
    id: 'off-003',
    type: 'PROJECT_PAUSE',
    status: 'PENDING',
    engineerId: 'eng-003',
    engineerName: 'David Chen',
    projectId: 'proj-stellantis-003',
    projectName: 'Stellantis QC System',
    clientName: 'Stellantis',
    initiatedBy: 'Alex Thompson (Admin)',
    initiatedDate: '2024-01-12',
    reason: 'Temporary pause due to client facility upgrades',
    notes: 'Expected to resume in Q2 2024',
    documents: ['Pause Agreement', 'Asset Storage Plan'],
    financialImpact: {
      refunds: 0,
      penalties: 0,
      finalPayment: 0
    },
    handoverTasks: [
      { id: '1', task: 'Secure project assets', status: 'pending', assignedTo: 'David Chen' },
      { id: '2', task: 'Update project timeline', status: 'pending', assignedTo: 'Project Manager' }
    ]
  },
  {
    id: 'off-004',
    type: 'OPERATOR_TERMINATION',
    status: 'COMPLETED',
    engineerId: 'eng-004',
    engineerName: 'Lisa Johnson',
    projectId: 'proj-hirotec-004',
    projectName: 'HIROTEC Welding System',
    clientName: 'HIROTEC America',
    initiatedBy: 'HR Team',
    initiatedDate: '2024-01-05',
    completionDate: '2024-01-08',
    reason: 'Performance issues and policy violations',
    documents: ['Termination Letter', 'Final Paycheck', 'Asset Return Receipt'],
    financialImpact: {
      refunds: 0,
      penalties: 0,
      finalPayment: 8500
    },
    handoverTasks: [
      { id: '1', task: 'Knowledge transfer to replacement', status: 'completed', assignedTo: 'Mike Wilson' },
      { id: '2', task: 'Access revocation', status: 'completed', assignedTo: 'IT Security' },
      { id: '3', task: 'Asset return verification', status: 'completed', assignedTo: 'Facilities' }
    ]
  }
]

const getStatusColor = (status: OffboardingStatus) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-900/50 text-yellow-300 border border-yellow-600'
    case 'IN_PROGRESS': return 'bg-blue-900/50 text-blue-300 border border-blue-600'
    case 'AWAITING_APPROVAL': return 'bg-orange-900/50 text-orange-300 border border-orange-600'
    case 'COMPLETED': return 'bg-green-900/50 text-green-300 border border-green-600'
    case 'CANCELLED': return 'bg-slate-900/50 text-slate-300 border border-slate-600'
    default: return 'bg-slate-900/50 text-slate-300 border border-slate-600'
  }
}

const getTypeIcon = (type: OffboardingType) => {
  switch (type) {
    case 'PROJECT_COMPLETION': return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'PROJECT_PAUSE': return <Pause className="h-4 w-4 text-blue-500" />
    case 'PROJECT_TERMINATION': return <FolderX className="h-4 w-4 text-red-500" />
    case 'CUSTOMER_TERMINATION': return <Building2 className="h-4 w-4 text-orange-500" />
    case 'OPERATOR_TERMINATION': return <UserMinus className="h-4 w-4 text-red-500" />
    case 'ADMIN_TERMINATION': return <Settings className="h-4 w-4 text-red-500" />
    case 'VOLUNTARY_DEPARTURE': return <User className="h-4 w-4 text-purple-500" />
    default: return <AlertTriangle className="h-4 w-4 text-gray-500" />
  }
}

const getTypeLabel = (type: OffboardingType) => {
  switch (type) {
    case 'PROJECT_COMPLETION': return 'Project Completion'
    case 'PROJECT_PAUSE': return 'Project Pause'
    case 'PROJECT_TERMINATION': return 'Project Termination'
    case 'CUSTOMER_TERMINATION': return 'Customer Termination'
    case 'OPERATOR_TERMINATION': return 'Operator Termination'
    case 'ADMIN_TERMINATION': return 'Admin Termination'
    case 'VOLUNTARY_DEPARTURE': return 'Voluntary Departure'
    default: return 'Unknown'
  }
}

export default function OffboardingPage() {
  const [requests, setRequests] = useState<OffboardingRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<OffboardingRequest | null>(null)
  const [filterStatus, setFilterStatus] = useState<OffboardingStatus | 'ALL'>('ALL')
  const [filterType, setFilterType] = useState<OffboardingType | 'ALL'>('ALL')

  useEffect(() => {
    // In production, fetch from API
    setRequests(mockOffboardingRequests)
  }, [])

  const filteredRequests = requests.filter(request => {
    if (filterStatus !== 'ALL' && request.status !== filterStatus) return false
    if (filterType !== 'ALL' && request.type !== filterType) return false
    return true
  })

  const statusCounts = {
    PENDING: requests.filter(r => r.status === 'PENDING').length,
    IN_PROGRESS: requests.filter(r => r.status === 'IN_PROGRESS').length,
    AWAITING_APPROVAL: requests.filter(r => r.status === 'AWAITING_APPROVAL').length,
    COMPLETED: requests.filter(r => r.status === 'COMPLETED').length
  }

  return (
    <div className="space-y-6 p-6 min-h-screen bg-slate-950">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Off-boarding Management</h1>
          <p className="text-slate-400 mt-1">
            Manage project completions, terminations, and employee off-boarding
          </p>
        </div>
        <div className="flex gap-3">
          <OptimizedLink href="/offboarding/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserMinus className="h-4 w-4 mr-2" />
              New Off-boarding Request
            </Button>
          </OptimizedLink>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-white">{statusCounts.PENDING}</p>
                <p className="text-sm text-slate-400">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-white">{statusCounts.IN_PROGRESS}</p>
                <p className="text-sm text-slate-400">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-white">{statusCounts.AWAITING_APPROVAL}</p>
                <p className="text-sm text-slate-400">Awaiting Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-white">{statusCounts.COMPLETED}</p>
                <p className="text-sm text-slate-400">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Status</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value as OffboardingStatus | 'ALL')}
                className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="AWAITING_APPROVAL">Awaiting Approval</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Type</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value as OffboardingType | 'ALL')}
                className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Types</option>
                <option value="PROJECT_COMPLETION">Project Completion</option>
                <option value="PROJECT_PAUSE">Project Pause</option>
                <option value="PROJECT_TERMINATION">Project Termination</option>
                <option value="CUSTOMER_TERMINATION">Customer Termination</option>
                <option value="OPERATOR_TERMINATION">Operator Termination</option>
                <option value="ADMIN_TERMINATION">Admin Termination</option>
                <option value="VOLUNTARY_DEPARTURE">Voluntary Departure</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Off-boarding Requests List */}
      <div className="grid gap-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-all">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(request.type)}
                    <h3 className="font-semibold text-lg text-white">{request.engineerName}</h3>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Type</p>
                      <p className="font-medium text-white">{getTypeLabel(request.type)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Project</p>
                      <p className="font-medium text-white">{request.projectName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Client</p>
                      <p className="font-medium text-white">{request.clientName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Initiated</p>
                      <p className="font-medium text-white">{new Date(request.initiatedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-300">Scheduled: {request.scheduledDate ? new Date(request.scheduledDate).toLocaleDateString() : 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-300">Impact: ${request.financialImpact.finalPayment.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-300">{request.documents.length} documents</span>
                    </div>
                  </div>
                  
                  <p className="text-slate-400 text-sm">{request.reason}</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <OptimizedLink href={`/offboarding/${request.id}`}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </OptimizedLink>
                  
                  {request.status === 'PENDING' && (
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Process
                    </Button>
                  )}
                  
                  {request.status === 'AWAITING_APPROVAL' && (
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Approve
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Progress indicator for handover tasks */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Handover Progress</span>
                  <span className="font-medium text-white">
                    {request.handoverTasks.filter(t => t.status === 'completed').length} / {request.handoverTasks.length} completed
                  </span>
                </div>
                <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${(request.handoverTasks.filter(t => t.status === 'completed').length / request.handoverTasks.length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-12 text-center">
            <UserMinus className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No off-boarding requests found</h3>
            <p className="text-slate-400 mb-4">
              {filterStatus !== 'ALL' || filterType !== 'ALL' 
                ? 'Try adjusting your filters to see more results.'
                : 'There are currently no off-boarding requests to display.'
              }
            </p>
            <OptimizedLink href="/offboarding/new">
              <Button>Create New Request</Button>
            </OptimizedLink>
          </CardContent>
        </Card>
      )}
    </div>
  )
}