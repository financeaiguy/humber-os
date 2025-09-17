import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withRole, withAuditLog, AuthenticatedRequest } from '@/lib/auth-middleware'
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

// Mock storage - replace with actual database
const accessControls = new Map<string, AccessControlEntry>()
const accessReviews = new Map<string, AccessReview>()

// GET: Retrieve access control matrix
export const GET = withAuditLog('SOC2_ACCESS_CONTROLS_VIEW')(
  withRole(['SYSTEM_ADMIN', 'COMPLIANCE_OFFICER'])(
    withAuth(async function handler(request: AuthenticatedRequest) {
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
    })
  )
)

// POST: Provision new user access
export const POST = withAuditLog('SOC2_ACCESS_PROVISION')(
  withRole(['SYSTEM_ADMIN', 'HR_ADMIN'])(
    withAuth(async function handler(request: AuthenticatedRequest) {
      try {
        const requestData = await request.json()
        
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
          accessGrantedBy: request.auth?.user?.email || 'system',
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
          grantedBy: request.auth?.user?.email
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
    })
  )
)

// PUT: Modify user access
export const PUT = withAuditLog('SOC2_ACCESS_MODIFICATION')(
  withRole(['SYSTEM_ADMIN', 'HR_ADMIN'])(
    withAuth(async function handler(request: AuthenticatedRequest) {
      try {
        const requestData = await request.json()
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

        // Update MFA requirement if access level changed
        if (modifications.accessLevel || modifications.role) {
          accessControl.mfaEnabled = requiresMFA(accessControl.role, accessControl.accessLevel)
        }

        // Update review date if significant changes
        if (modifications.role || modifications.accessLevel) {
          accessControl.reviewDate = calculateNextReviewDate()
          accessControl.reviewStatus = 'pending'
        }

        // Log modification
        console.log(`🔄 SOC 2 Access Modified:`, {
          accessId,
          userId: accessControl.userId,
          modificationReason,
          modifiedBy: request.auth?.user?.email,
          approvedBy,
          originalState: {
            role: originalState.role,
            accessLevel: originalState.accessLevel,
            permissions: originalState.permissions.length
          },
          newState: {
            role: accessControl.role,
            accessLevel: accessControl.accessLevel,
            permissions: accessControl.permissions.length
          }
        })

        return NextResponse.json({
          success: true,
          accessId,
          userId: accessControl.userId,
          modifications: {
            role: accessControl.role,
            accessLevel: accessControl.accessLevel,
            accessStatus: accessControl.accessStatus,
            mfaEnabled: accessControl.mfaEnabled
          },
          reviewRequired: accessControl.reviewStatus === 'pending',
          message: 'User access modified successfully'
        })

      } catch (error) {
        console.error('Access modification error:', error)
        return NextResponse.json(
          { error: 'Failed to modify user access' },
          { status: 500 }
        )
      }
    })
  )
)

// DELETE: Terminate user access
export const DELETE = withAuditLog('SOC2_ACCESS_TERMINATION')(
  withRole(['SYSTEM_ADMIN', 'HR_ADMIN'])(
    withAuth(async function handler(request: AuthenticatedRequest) {
      try {
        const { searchParams } = new URL(request.url)
        const accessId = searchParams.get('accessId')
        const terminationReason = searchParams.get('reason')
        const effectiveDate = searchParams.get('effectiveDate')

        if (!accessId) {
          return NextResponse.json(
            { error: 'Access ID is required' },
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

        // Terminate access
        accessControl.accessStatus = 'terminated'
        const terminationDate = effectiveDate || new Date().toISOString()

        // Execute immediate access revocation
        await executeAccessTermination(accessControl, terminationReason || 'Administrative action')

        console.log(`🚫 SOC 2 Access Terminated:`, {
          accessId,
          userId: accessControl.userId,
          userName: accessControl.userName,
          role: accessControl.role,
          terminationReason,
          terminatedBy: request.auth?.user?.email,
          effectiveDate: terminationDate
        })

        return NextResponse.json({
          success: true,
          accessId,
          userId: accessControl.userId,
          terminationDate,
          accessStatus: 'terminated',
          message: 'User access terminated successfully'
        })

      } catch (error) {
        console.error('Access termination error:', error)
        return NextResponse.json(
          { error: 'Failed to terminate user access' },
          { status: 500 }
        )
      }
    })
  )
)

// Helper functions
function calculateAccessControlCompliance(controls: AccessControlEntry[]) {
  const total = controls.length
  const activeUsers = controls.filter(c => c.accessStatus === 'active').length
  const mfaEnabled = controls.filter(c => c.mfaEnabled).length
  const pendingReviews = controls.filter(c => c.reviewStatus === 'pending').length
  const overduePwdChanges = controls.filter(c => 
    new Date(c.lastPasswordChange) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  ).length

  return {
    totalUsers: total,
    activeUsers,
    mfaComplianceRate: total > 0 ? Math.round((mfaEnabled / total) * 100) : 0,
    pendingReviews,
    overduePasswordChanges: overduePwdChanges,
    accessReviewCompliance: total > 0 ? Math.round(((total - pendingReviews) / total) * 100) : 100,
    overallCompliance: calculateOverallCompliance(controls)
  }
}

function calculateOverallCompliance(controls: AccessControlEntry[]): number {
  if (controls.length === 0) return 100

  let score = 0
  const maxScore = controls.length * 5 // 5 points per user for perfect compliance

  controls.forEach(control => {
    // MFA enabled (1 point)
    if (control.mfaEnabled) score += 1
    
    // Access review up to date (1 point)
    if (control.reviewStatus !== 'pending') score += 1
    
    // Password changed recently (1 point)
    const pwdAge = Date.now() - new Date(control.lastPasswordChange).getTime()
    if (pwdAge < 90 * 24 * 60 * 60 * 1000) score += 1
    
    // No failed login attempts (1 point)
    if (control.failedLoginAttempts === 0) score += 1
    
    // Account not locked (1 point)
    if (!control.accountLockoutStatus) score += 1
  })

  return Math.round((score / maxScore) * 100)
}

function requiresMFA(role: string, accessLevel: string): boolean {
  const privilegedRoles = ['SYSTEM_ADMIN', 'PARTNER_ADMIN', 'COMPLIANCE_OFFICER']
  const privilegedLevels = ['admin', 'super_admin']
  
  return privilegedRoles.includes(role) || privilegedLevels.includes(accessLevel)
}

function calculateNextReviewDate(): string {
  const reviewDate = new Date()
  reviewDate.setDate(reviewDate.getDate() + 90) // Quarterly reviews
  return reviewDate.toISOString()
}

function getComplianceRequirements(role: string, accessLevel: string): string[] {
  const requirements = [
    'Multi-factor authentication required',
    'Password must be changed every 90 days',
    'Access will be reviewed quarterly',
    'All system access is logged and monitored'
  ]

  if (accessLevel === 'admin' || accessLevel === 'super_admin') {
    requirements.push('Privileged access monitoring enabled')
    requirements.push('Administrative actions require approval')
  }

  return requirements
}

async function executeAccessTermination(control: AccessControlEntry, reason: string) {
  // In production, this would:
  // 1. Disable user account in all systems
  // 2. Revoke access tokens and sessions
  // 3. Remove from all groups and roles
  // 4. Archive user data per retention policy
  
  console.log(`🔒 Executing access termination for ${control.userId}:`, {
    reason,
    systemsAffected: control.systemBoundaries,
    dataClassifications: control.dataClassifications
  })
}