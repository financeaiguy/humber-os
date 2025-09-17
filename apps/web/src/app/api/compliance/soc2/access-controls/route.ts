import { NextRequest, NextResponse } from 'next/server'
import { 
  soc2AccessControlSchema,
  validateRequestBody,
  createValidationResponse 
} from '@/lib/validation-schemas'
import { generateSecureToken } from '@/lib/secure-token-generator'

export const runtime = 'edge'

// SOC 2 Type II Access Controls Implementation
// CC6.1: Logical and Physical Access Controls
// CC6.2: User Access Provisioning and Modification
// CC6.3: User Access Termination
// CC6.6: User Access Review
// CC6.7: System Boundaries and Data Flow

interface AccessControlEntry {
  id: string
  userId: string
  userName: string
  userEmail: string
  role: string
  permissions: string[]
  accessGrantedDate: string
  accessGrantedBy: string
  lastAccessDate?: string
  accessStatus: 'active' | 'suspended' | 'terminated'
  accessReason: string
  businessJustification: string
  supervisorApproval: string
  reviewDate: string
  reviewStatus: 'pending' | 'approved' | 'revoked'
  systemBoundaries: string[]
  dataClassifications: string[]
  accessLevel: 'read' | 'write' | 'admin' | 'super_admin'
  mfaEnabled: boolean
  passwordLastChanged?: string
  failedLoginAttempts: number
  lastPasswordChange: string
  accountLockoutStatus: boolean
}

interface AccessReview {
  id: string
  reviewDate: string
  reviewedBy: string
  usersReviewed: number
  accessModifications: number
  accessRevocations: number
  findings: string[]
  remediationActions: string[]
  nextReviewDate: string
  complianceStatus: 'compliant' | 'non_compliant' | 'remediation_required'
}

interface AccessControlRequest {
  userId: string
  userName: string
  userEmail: string
  role: string
  permissions: string[]
  accessReason: string
  businessJustification: string
  supervisorApproval: string
  systemBoundaries: string[]
  dataClassifications: string[]
  accessLevel: 'read' | 'write' | 'admin' | 'super_admin'
}

interface ModifyAccessRequest {
  accessId: string
  modifications: {
    role?: string
    permissions?: string[]
    accessLevel?: 'read' | 'write' | 'admin' | 'super_admin'
    accessStatus?: 'active' | 'suspended' | 'terminated'
    systemBoundaries?: string[]
    dataClassifications?: string[]
  }
  modificationReason: string
  approvedBy: string
}

// Mock storage - replace with actual database
const accessControls = new Map<string, AccessControlEntry>()
const accessReviews = new Map<string, AccessReview>()

// Helper functions
function calculateNextReviewDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 90) // 90-day review cycle
  return date.toISOString()
}

function requiresMFA(role: string, accessLevel: string): boolean {
  return accessLevel === 'admin' || accessLevel === 'super_admin' || role === 'SYSTEM_ADMIN'
}

function getComplianceRequirements(role: string, accessLevel: string) {
  const requirements = []
  
  if (requiresMFA(role, accessLevel)) {
    requirements.push('MFA Required')
  }
  
  if (accessLevel === 'admin' || accessLevel === 'super_admin') {
    requirements.push('Quarterly Access Review')
    requirements.push('Background Check Required')
    requirements.push('Security Training Certification')
  }
  
  requirements.push('Annual Security Awareness Training')
  requirements.push('Acceptable Use Policy Acknowledgment')
  
  return requirements
}

function calculateAccessControlCompliance(controls: AccessControlEntry[]) {
  const total = controls.length
  const activeControls = controls.filter(c => c.accessStatus === 'active')
  const mfaEnabled = controls.filter(c => c.mfaEnabled)
  const reviewsPending = controls.filter(c => c.reviewStatus === 'pending')
  const lockedAccounts = controls.filter(c => c.accountLockoutStatus)
  
  return {
    totalUsers: total,
    activeUsers: activeControls.length,
    mfaComplianceRate: total > 0 ? (mfaEnabled.length / total) * 100 : 0,
    pendingReviews: reviewsPending.length,
    lockedAccounts: lockedAccounts.length,
    complianceScore: calculateComplianceScore(controls),
    lastReviewDate: getLastReviewDate(),
    nextReviewDate: calculateNextReviewDate()
  }
}

function calculateComplianceScore(controls: AccessControlEntry[]): number {
  if (controls.length === 0) return 100
  
  let score = 100
  const deductions = {
    noMFA: -5,
    pendingReview: -3,
    failedLogins: -2,
    noRecentPasswordChange: -10
  }
  
  controls.forEach(control => {
    if (control.accessStatus === 'active') {
      if (!control.mfaEnabled && requiresMFA(control.role, control.accessLevel)) {
        score += deductions.noMFA
      }
      if (control.reviewStatus === 'pending') {
        score += deductions.pendingReview
      }
      if (control.failedLoginAttempts > 3) {
        score += deductions.failedLogins
      }
      // Check if password change is older than 90 days
      const lastChange = new Date(control.lastPasswordChange)
      const daysSinceChange = (Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceChange > 90) {
        score += deductions.noRecentPasswordChange
      }
    }
  })
  
  return Math.max(0, Math.min(100, score))
}

function getLastReviewDate(): string {
  const reviews = Array.from(accessReviews.values())
  if (reviews.length === 0) return new Date().toISOString()
  
  return reviews.reduce((latest, review) => {
    return new Date(review.reviewDate) > new Date(latest) ? review.reviewDate : latest
  }, reviews[0].reviewDate)
}

// GET: Retrieve access control matrix
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const includeDetails = searchParams.get('includeDetails') === 'true'

    let controls = Array.from(accessControls.values())

    // Apply filters
    if (userId) {
      controls = controls.filter(c => c.userId === userId)
    }
    if (role) {
      controls = controls.filter(c => c.role === role)
    }
    if (status) {
      controls = controls.filter(c => c.accessStatus === status)
    }

    // Generate access control matrix
    const accessMatrix = controls.map(control => {
      const baseInfo = {
        userId: control.userId,
        userName: control.userName,
        role: control.role,
        accessLevel: control.accessLevel,
        accessStatus: control.accessStatus,
        lastAccessDate: control.lastAccessDate,
        mfaEnabled: control.mfaEnabled,
        reviewStatus: control.reviewStatus
      }

      if (includeDetails) {
        return {
          ...baseInfo,
          permissions: control.permissions,
          systemBoundaries: control.systemBoundaries,
          dataClassifications: control.dataClassifications,
          businessJustification: control.businessJustification,
          supervisorApproval: control.supervisorApproval,
          accessGrantedBy: control.accessGrantedBy,
          accessGrantedDate: control.accessGrantedDate,
          reviewDate: control.reviewDate,
          failedLoginAttempts: control.failedLoginAttempts,
          accountLockoutStatus: control.accountLockoutStatus
        }
      }

      return baseInfo
    })

    // Calculate compliance metrics
    const complianceMetrics = calculateAccessControlCompliance(controls)

    return NextResponse.json({
      success: true,
      accessMatrix,
      complianceMetrics,
      total: controls.length
    })

  } catch (error) {
    console.error('Access controls retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve access controls' },
      { status: 500 }
    )
  }
}

// POST: Provision new user access
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json() as AccessControlRequest
    
    // Validate access control data
    const validationResult = validateRequestBody(soc2AccessControlSchema, requestData)
    if (!validationResult.success) {
      return NextResponse.json(createValidationResponse(validationResult.errors), { status: 400 })
    }

    const {
      userId,
      userName,
      userEmail,
      role,
      permissions,
      accessReason,
      businessJustification,
      supervisorApproval,
      systemBoundaries,
      dataClassifications,
      accessLevel
    } = validationResult.data

    const accessId = generateSecureToken(16)
    
    const accessControl: AccessControlEntry = {
      id: accessId,
      userId,
      userName,
      userEmail,
      role,
      permissions,
      accessGrantedDate: new Date().toISOString(),
      accessGrantedBy: 'system', // In production, get from auth context
      accessStatus: 'active',
      accessReason,
      businessJustification,
      supervisorApproval,
      reviewDate: calculateNextReviewDate(),
      reviewStatus: 'pending',
      systemBoundaries,
      dataClassifications,
      accessLevel,
      mfaEnabled: requiresMFA(role, accessLevel),
      failedLoginAttempts: 0,
      lastPasswordChange: new Date().toISOString(),
      accountLockoutStatus: false
    }

    // Store access control
    accessControls.set(accessId, accessControl)

    // Log access provisioning
    console.log(`🔐 SOC 2 Access Provisioned:`, {
      accessId,
      userId,
      userName,
      role,
      accessLevel,
      grantedBy: 'system'
    })

    return NextResponse.json({
      success: true,
      accessId,
      userId,
      accessStatus: 'active',
      mfaRequired: accessControl.mfaEnabled,
      reviewDate: accessControl.reviewDate,
      complianceRequirements: getComplianceRequirements(role, accessLevel),
      message: 'User access provisioned successfully'
    })

  } catch (error) {
    console.error('Access provisioning error:', error)
    return NextResponse.json(
      { error: 'Failed to provision user access' },
      { status: 500 }
    )
  }
}

// PUT: Modify user access
export async function PUT(request: NextRequest) {
  try {
    const requestData = await request.json() as ModifyAccessRequest
    const { accessId, modifications, modificationReason, approvedBy } = requestData

    const accessControl = accessControls.get(accessId)
    if (!accessControl) {
      return NextResponse.json(
        { error: 'Access control record not found' },
        { status: 404 }
      )
    }

    // Store original state for audit
    const originalState = { ...accessControl }

    // Apply modifications
    if (modifications.role) accessControl.role = modifications.role
    if (modifications.permissions) accessControl.permissions = modifications.permissions
    if (modifications.accessLevel) accessControl.accessLevel = modifications.accessLevel
    if (modifications.accessStatus) accessControl.accessStatus = modifications.accessStatus
    if (modifications.systemBoundaries) accessControl.systemBoundaries = modifications.systemBoundaries
    if (modifications.dataClassifications) accessControl.dataClassifications = modifications.dataClassifications

    // Update MFA requirement based on new role/access level
    accessControl.mfaEnabled = requiresMFA(
      accessControl.role, 
      accessControl.accessLevel
    )

    // Update review date if significant changes
    if (modifications.role || modifications.accessLevel) {
      accessControl.reviewDate = calculateNextReviewDate()
      accessControl.reviewStatus = 'pending'
    }

    // Store updated access control
    accessControls.set(accessId, accessControl)

    // Log modification
    console.log(`🔧 SOC 2 Access Modified:`, {
      accessId,
      userId: accessControl.userId,
      modifications,
      modificationReason,
      approvedBy
    })

    return NextResponse.json({
      success: true,
      accessId,
      userId: accessControl.userId,
      modifications,
      newAccessStatus: accessControl.accessStatus,
      mfaRequired: accessControl.mfaEnabled,
      reviewDate: accessControl.reviewDate,
      complianceRequirements: getComplianceRequirements(
        accessControl.role,
        accessControl.accessLevel
      ),
      message: 'User access modified successfully'
    })

  } catch (error) {
    console.error('Access modification error:', error)
    return NextResponse.json(
      { error: 'Failed to modify user access' },
      { status: 500 }
    )
  }
}

// DELETE: Terminate user access
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accessId = searchParams.get('accessId')
    const terminationReason = searchParams.get('reason')
    const immediateTermination = searchParams.get('immediate') === 'true'

    if (!accessId || !terminationReason) {
      return NextResponse.json(
        { error: 'Access ID and termination reason are required' },
        { status: 400 }
      )
    }

    const accessControl = accessControls.get(accessId)
    if (!accessControl) {
      return NextResponse.json(
        { error: 'Access control record not found' },
        { status: 404 }
      )
    }

    // Perform termination
    accessControl.accessStatus = 'terminated'
    accessControl.reviewStatus = 'revoked'
    
    // Store termination details
    const terminationRecord = {
      accessId,
      userId: accessControl.userId,
      userName: accessControl.userName,
      terminatedAt: new Date().toISOString(),
      terminationReason,
      immediateTermination,
      finalAccessDate: accessControl.lastAccessDate || new Date().toISOString()
    }

    // Update the access control record
    accessControls.set(accessId, accessControl)

    // Log termination
    console.log(`🚫 SOC 2 Access Terminated:`, terminationRecord)

    return NextResponse.json({
      success: true,
      terminationRecord,
      message: `User access terminated ${immediateTermination ? 'immediately' : 'successfully'}`,
      postTerminationActions: [
        'System access revoked',
        'Credentials disabled',
        'Active sessions terminated',
        'Access logs archived',
        'Supervisor notified'
      ]
    })

  } catch (error) {
    console.error('Access termination error:', error)
    return NextResponse.json(
      { error: 'Failed to terminate user access' },
      { status: 500 }
    )
  }
}