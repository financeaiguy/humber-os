import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export const runtime = 'edge'

// Mock database for individual off-boarding request
const getOffboardingRequest = (id: string) => ({
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
  completionDate: null,
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
    { id: '1', task: 'Complete technical documentation handover', status: 'completed', assignedTo: 'John Smith' },
    { id: '2', task: 'Return all project equipment and assets', status: 'pending', assignedTo: 'Facilities Team' },
    { id: '3', task: 'Conduct final client knowledge transfer session', status: 'pending', assignedTo: 'John Smith' },
    { id: '4', task: 'Submit final expense reports', status: 'completed', assignedTo: 'John Smith' },
    { id: '5', task: 'Update project status in all systems', status: 'pending', assignedTo: 'Project Manager' },
    { id: '6', task: 'Process final client invoicing', status: 'pending', assignedTo: 'Finance Team' },
    { id: '7', task: 'Archive project files and documentation', status: 'pending', assignedTo: 'IT Team' }
  ],
  approvals: [
    {
      id: 'approval-1',
      approverName: 'Sarah Johnson',
      approverRole: 'Project Manager',
      status: 'approved',
      comments: 'Project completed successfully, all deliverables met',
      approvedAt: '2024-01-16T10:00:00Z'
    },
    {
      id: 'approval-2',
      approverName: 'Michael Chen',
      approverRole: 'Operations Director',
      status: 'pending',
      comments: null,
      approvedAt: null
    }
  ],
  timeline: [
    {
      id: 'timeline-1',
      date: '2024-01-15',
      title: 'Off-boarding Request Initiated',
      description: 'Request created by Sarah Johnson (PM)',
      status: 'completed'
    },
    {
      id: 'timeline-2',
      date: '2024-01-16',
      title: 'Initial Review Completed',
      description: 'Request reviewed and approved for processing',
      status: 'completed'
    },
    {
      id: 'timeline-3',
      date: '2024-01-18',
      title: 'Handover Tasks Assigned',
      description: 'Tasks distributed to relevant teams',
      status: 'completed'
    },
    {
      id: 'timeline-4',
      date: '2024-01-20',
      title: 'Documentation Phase',
      description: 'Technical documentation and knowledge transfer in progress',
      status: 'current'
    },
    {
      id: 'timeline-5',
      date: '2024-01-30',
      title: 'Scheduled Completion',
      description: 'Expected completion of all off-boarding activities',
      status: 'pending'
    }
  ],
  auditLog: [
    {
      id: 'audit-1',
      timestamp: '2024-01-15T10:00:00Z',
      userId: 'user-pm-001',
      userName: 'Sarah Johnson',
      action: 'created',
      description: 'Off-boarding request created',
      changes: {}
    },
    {
      id: 'audit-2',
      timestamp: '2024-01-16T14:30:00Z',
      userId: 'user-pm-001',
      userName: 'Sarah Johnson',
      action: 'status_updated',
      description: 'Status changed from PENDING to IN_PROGRESS',
      changes: {
        status: { from: 'PENDING', to: 'IN_PROGRESS' }
      }
    },
    {
      id: 'audit-3',
      timestamp: '2024-01-18T09:15:00Z',
      userId: 'user-eng-001',
      userName: 'John Smith',
      action: 'task_completed',
      description: 'Completed task: Technical documentation handover',
      changes: {
        taskId: '1',
        status: { from: 'pending', to: 'completed' }
      }
    }
  ],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-20T15:30:00Z'
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Off-boarding request ID is required' },
        { status: 400 }
      )
    }

    // In production, fetch from database
    const request = getOffboardingRequest(id)

    if (!request) {
      return NextResponse.json(
        { error: 'Off-boarding request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ request })

  } catch (error) {
    console.error('Error fetching off-boarding request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json() as any

    if (!id) {
      return NextResponse.json(
        { error: 'Off-boarding request ID is required' },
        { status: 400 }
      )
    }

    // In production, fetch and update in database
    const existingRequest = getOffboardingRequest(id)

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Off-boarding request not found' },
        { status: 404 }
      )
    }

    // Update fields
    const updatedRequest = {
      ...existingRequest,
      ...body,
      updatedAt: new Date().toISOString()
    }

    // Log the changes in audit trail
    const changes: Record<string, any> = {}
    Object.keys(body).forEach(key => {
      const existingValue = (existingRequest as any)[key]
      const newValue = body[key]
      if (existingValue !== newValue) {
        changes[key] = {
          from: existingValue,
          to: newValue
        }
      }
    })

    // In production, save to database and create audit log entry

    return NextResponse.json({
      message: 'Off-boarding request updated successfully',
      request: updatedRequest,
      changes
    })

  } catch (error) {
    console.error('Error updating off-boarding request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Off-boarding request ID is required' },
        { status: 400 }
      )
    }

    // In production, check if user has permission to delete
    // Only allow deletion if status is PENDING or DRAFT

    const existingRequest = getOffboardingRequest(id)

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Off-boarding request not found' },
        { status: 404 }
      )
    }

    if (!['PENDING', 'DRAFT'].includes(existingRequest.status)) {
      return NextResponse.json(
        { error: 'Cannot delete off-boarding request in current status' },
        { status: 400 }
      )
    }

    // In production, soft delete or mark as cancelled
    // await deleteOffboardingRequest(id)

    return NextResponse.json({
      message: 'Off-boarding request deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting off-boarding request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}