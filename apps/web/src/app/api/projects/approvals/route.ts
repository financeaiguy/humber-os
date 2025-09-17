import { NextRequest, NextResponse } from 'next/server'
import { ProjectApproval, ApprovalStatus, ApproverType } from '@/types/invoicing'
import { projectCostCalculator } from '@/lib/project-cost-calculator'
import { withAuth, withRole, withAuditLog, AuthenticatedRequest } from '@/lib/auth-middleware'
import { 
  projectApprovalRequestSchema, 
  projectApprovalActionSchema,
  approvalFiltersSchema,
  validateRequestBody,
  createValidationResponse 
} from '@/lib/validation-schemas'
import { generateApprovalId } from '@/lib/secure-token-generator'

// Mock storage - replace with actual database
const projectApprovals = new Map<string, ProjectApproval[]>()
const approvalWorkflows = new Map<string, ApproverType[]>()

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json()
    
    // Validate approval request
    const validationResult = validateRequestBody(projectApprovalRequestSchema, requestData)
    if (!validationResult.success) {
      return NextResponse.json(createValidationResponse(validationResult.errors), { status: 400 })
    }

    const { projectId, requestType, requesterId, requesterName, budgetAmount, deploymentDetails } = validationResult.data

    // Determine required approvers based on request type and budget
    const requiredApprovers = determineRequiredApprovers(requestType, budgetAmount)
    
    // Create approval requests
    const approvals: ProjectApproval[] = []
    for (const approverType of requiredApprovers) {
      const approvers = await getApproversByType(approverType)
      
      for (const approver of approvers) {
        approvals.push({
          id: generateApprovalId(),
          projectId,
          approverType,
          approverId: approver.id,
          approverName: approver.name,
          approverEmail: approver.email,
          status: 'pending',
          budgetLimit: getBudgetLimitForApprover(approverType),
          conditions: getApprovalConditions(requestType, budgetAmount)
        })
      }
    }

    // Store approvals
    projectApprovals.set(projectId, approvals)

    // Send notifications to approvers
    await sendApprovalNotifications(approvals, {
      projectId,
      requestType,
      requesterName,
      budgetAmount,
      deploymentDetails
    })

    return NextResponse.json({
      success: true,
      approvals,
      message: `Approval requests sent to ${requiredApprovers.join(', ')}`
    })

  } catch (error) {
    console.error('Approval request error:', error)
    return NextResponse.json(
      { error: 'Failed to create approval request' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // TODO: Add auth validation here instead of HOF wrapper
    const requestData = await request.json()
    
    // Validate approval action
    const validationResult = validateRequestBody(projectApprovalActionSchema, requestData)
    if (!validationResult.success) {
      return NextResponse.json(createValidationResponse(validationResult.errors), { status: 400 })
    }

    const { approvalId, action, approverId, notes, conditions } = validationResult.data

    // Find and update approval
    const approval = await findApprovalById(approvalId)
    if (!approval) {
      return NextResponse.json(
        { error: 'Approval not found' },
        { status: 404 }
      )
    }

    // Verify approver has permission
    if (approval.approverId !== approverId) {
      return NextResponse.json(
        { error: 'Not authorized to approve this request' },
        { status: 403 }
      )
    }

    // Update approval status
    approval.status = action as ApprovalStatus
    approval.approvalDate = new Date().toISOString()
    approval.notes = notes
    
    if (action === 'conditionally_approved' && conditions) {
      approval.conditions = conditions
    }

    // Check if all required approvals are complete
    const allApprovals = projectApprovals.get(approval.projectId) || []
    const allApproved = allApprovals.every(a => 
      a.status === 'approved' || a.status === 'conditionally_approved'
    )

    let projectStatus = 'pending_approval'
    if (allApproved) {
      projectStatus = 'approved'
      // Trigger project deployment or next steps
      await initiateProjectDeployment(approval.projectId)
    } else if (allApprovals.some(a => a.status === 'rejected')) {
      projectStatus = 'rejected'
    }

    // Log approval action
    console.log(`📋 Approval ${action} by ${approval.approverName} for project ${approval.projectId}`)

    return NextResponse.json({
      success: true,
      approval,
      projectStatus,
      allApproved,
      message: `Approval ${action} successfully`
    })

  } catch (error) {
    console.error('Approval action error:', error)
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Add auth validation here instead of HOF wrapper
    const { searchParams } = new URL(request.url)
    
    // Validate query parameters
    const queryParams = Object.fromEntries(searchParams.entries())
    const validationResult = validateRequestBody(approvalFiltersSchema, queryParams)
    
    if (!validationResult.success) {
      return NextResponse.json(createValidationResponse(validationResult.errors), { status: 400 })
    }

    const { projectId, approverId, status, page, limit } = validationResult.data

    let approvals: ProjectApproval[] = []

    if (projectId) {
      approvals = projectApprovals.get(projectId) || []
    } else if (approverId) {
      // Get all approvals for a specific approver
      for (const projectApprovalList of projectApprovals.values()) {
        approvals.push(...projectApprovalList.filter(a => a.approverId === approverId))
      }
    } else {
      // Get all approvals
      for (const projectApprovalList of projectApprovals.values()) {
        approvals.push(...projectApprovalList)
      }
    }

    if (status) {
      approvals = approvals.filter(a => a.status === status)
    }

    // Add project details to approvals
    const approvalsWithDetails = await Promise.all(
      approvals.map(async (approval) => {
        const projectDetails = await getProjectDetails(approval.projectId)
        const budgetBreakdown = await projectCostCalculator.generateBudgetBreakdown(approval.projectId)
        
        return {
          ...approval,
          projectDetails,
          budgetBreakdown
        }
      })
    )

    return NextResponse.json({
      approvals: approvalsWithDetails,
      total: approvalsWithDetails.length
    })

  } catch (error) {
    console.error('Get approvals error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch approvals' },
      { status: 500 }
    )
  }
}

// Helper functions
function determineRequiredApprovers(requestType: string, budgetAmount: number): ApproverType[] {
  const approvers: ApproverType[] = []

  // Always require project manager approval
  approvers.push('project_manager')

  // Budget-based approval requirements
  if (budgetAmount > 100000) {
    approvers.push('admin')
  }
  
  if (budgetAmount > 500000) {
    approvers.push('partner')
    approvers.push('finance')
  }

  if (budgetAmount > 1000000) {
    approvers.push('operator')
  }

  // Request type specific requirements
  if (requestType === 'engineer_deployment') {
    approvers.push('operator')
  }

  if (requestType === 'budget_increase') {
    approvers.push('finance')
    if (budgetAmount > 250000) {
      approvers.push('partner')
    }
  }

  return [...new Set(approvers)] // Remove duplicates
}

async function getApproversByType(approverType: ApproverType) {
  // Mock data - replace with actual database query
  const approvers = {
    operator: [
      { id: 'op-001', name: 'Operations Manager', email: 'operator@humber.com' }
    ],
    partner: [
      { id: 'partner-001', name: 'Partner Admin', email: 'partner@ford.com' }
    ],
    admin: [
      { id: 'admin-001', name: 'System Administrator', email: 'admin@humber.com' }
    ],
    finance: [
      { id: 'finance-001', name: 'Finance Manager', email: 'finance@humber.com' }
    ],
    project_manager: [
      { id: 'pm-001', name: 'Project Manager', email: 'pm@humber.com' }
    ]
  }

  return approvers[approverType] || []
}

function getBudgetLimitForApprover(approverType: ApproverType): number {
  const limits = {
    project_manager: 50000,
    admin: 250000,
    finance: 500000,
    partner: 1000000,
    operator: Number.MAX_SAFE_INTEGER
  }

  return limits[approverType] || 0
}

function getApprovalConditions(requestType: string, budgetAmount: number): string[] {
  const conditions: string[] = []

  if (budgetAmount > 500000) {
    conditions.push('Quarterly budget review required')
    conditions.push('Monthly progress reports mandatory')
  }

  if (requestType === 'engineer_deployment') {
    conditions.push('Travel expenses must be pre-approved')
    conditions.push('Daily time tracking required')
  }

  return conditions
}

async function sendApprovalNotifications(approvals: ProjectApproval[], requestDetails: any) {
  // Mock notification sending - replace with actual email/SMS service
  for (const approval of approvals) {
    console.log(`📧 Sending approval request to ${approval.approverEmail}`, {
      approvalId: approval.id,
      projectId: approval.projectId,
      requestType: requestDetails.requestType,
      budgetAmount: requestDetails.budgetAmount
    })
  }
}

async function findApprovalById(approvalId: string): Promise<ProjectApproval | null> {
  for (const approvalList of projectApprovals.values()) {
    const approval = approvalList.find(a => a.id === approvalId)
    if (approval) return approval
  }
  return null
}

async function initiateProjectDeployment(projectId: string) {
  console.log(`🚀 Initiating project deployment for project ${projectId}`)
  // Implement project deployment logic here
}

async function getProjectDetails(projectId: string) {
  // Mock project details - replace with actual database query
  return {
    id: projectId,
    name: 'GM Assembly Line Automation',
    client: 'General Motors',
    status: 'pending_approval',
    budget: 1200000
  }
}

// Secure approval ID generation moved to secure-token-generator.ts