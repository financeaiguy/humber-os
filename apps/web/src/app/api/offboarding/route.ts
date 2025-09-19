import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export const runtime = 'edge'

// Mock database for off-boarding requests
// In production, this would be replaced with actual database operations
const mockOffboardingRequests = [
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
    notes: 'Exceptional performance throughout the project',
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
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  }
]

export async function GET(request: NextRequest) {
  try {
    // Development bypass for API testing interface
    const authHeader = request.headers.get('authorization')
    const isDevelopment = process.env.NODE_ENV === 'development'

    if (isDevelopment && authHeader === 'Bearer test-token-for-api-testing') {
      // Allow the request to proceed with mock user context
    } else {
      const session = await auth()

      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const engineerId = searchParams.get('engineerId')
    const projectId = searchParams.get('projectId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Filter requests based on query parameters
    let filteredRequests = [...mockOffboardingRequests]

    if (status && status !== 'ALL') {
      filteredRequests = filteredRequests.filter(req => req.status === status)
    }

    if (type && type !== 'ALL') {
      filteredRequests = filteredRequests.filter(req => req.type === type)
    }

    if (engineerId) {
      filteredRequests = filteredRequests.filter(req => req.engineerId === engineerId)
    }

    if (projectId) {
      filteredRequests = filteredRequests.filter(req => req.projectId === projectId)
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedRequests = filteredRequests.slice(startIndex, endIndex)

    // Calculate statistics
    const stats = {
      total: filteredRequests.length,
      pending: filteredRequests.filter(req => req.status === 'PENDING').length,
      inProgress: filteredRequests.filter(req => req.status === 'IN_PROGRESS').length,
      awaitingApproval: filteredRequests.filter(req => req.status === 'AWAITING_APPROVAL').length,
      completed: filteredRequests.filter(req => req.status === 'COMPLETED').length,
      cancelled: filteredRequests.filter(req => req.status === 'CANCELLED').length
    }

    return NextResponse.json({
      requests: paginatedRequests,
      pagination: {
        page,
        limit,
        total: filteredRequests.length,
        totalPages: Math.ceil(filteredRequests.length / limit)
      },
      stats
    })

  } catch (error) {
    // SECURITY: console statement removed: console.error('Error fetching off-boarding requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json() as any

    // Validate required fields
    const requiredFields = ['type', 'engineerId', 'projectId', 'reason', 'scheduledDate']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          missingFields 
        },
        { status: 400 }
      )
    }

    // Generate new off-boarding request ID
    const newId = `off-${Date.now()}`

    const newRequest = {
      id: newId,
      type: body.type,
      status: body.status || 'PENDING',
      engineerId: body.engineerId,
      engineerName: body.engineerName || 'Unknown Engineer',
      projectId: body.projectId,
      projectName: body.projectName || 'Unknown Project',
      clientName: body.clientName || 'Unknown Client',
      initiatedBy: session.user.name || 'Unknown User',
      initiatedDate: new Date().toISOString().split('T')[0],
      scheduledDate: body.scheduledDate,
      completionDate: null,
      reason: body.reason,
      notes: body.notes || '',
      documents: body.documents || [],
      financialImpact: {
        refunds: body.financialImpact?.expectedRefunds || 0,
        penalties: body.financialImpact?.expectedPenalties || 0,
        finalPayment: body.financialImpact?.finalPayment || 0
      },
      handoverTasks: body.handoverTasks?.map((task: any, index: number) => ({
        id: `task-${index + 1}`,
        task: task.task,
        status: 'pending' as const,
        assignedTo: task.assignedTo
      })) || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // In production, save to database
    mockOffboardingRequests.push(newRequest)

    // Send notifications (in production)
    // await sendOffboardingNotification(newRequest)

    return NextResponse.json({
      message: 'Off-boarding request created successfully',
      request: newRequest
    }, { status: 201 })

  } catch (error) {
    // SECURITY: console statement removed: console.error('Error creating off-boarding request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}