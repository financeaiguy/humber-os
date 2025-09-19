import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withAuditLog, AuthenticatedRequest } from '@/lib/auth-middleware'
import { 
  gdprConsentSchema,
  validateRequestBody,
  createValidationResponse 
} from '@/lib/validation-schemas'
import { generateSecureToken } from '@/lib/secure-token-generator'

export const runtime = 'edge'

// GDPR Consent Management System
// Article 7: Conditions for consent
// Article 8: Conditions applicable to child's consent
// Article 13: Information to be provided where personal data are collected from the data subject
// Article 14: Information to be provided where personal data have not been obtained from the data subject

interface ConsentRecord {
  id: string
  userId: string
  email: string
  consentType: 'marketing' | 'analytics' | 'functional' | 'necessary' | 'biometric' | 'profiling'
  purpose: string
  legalBasis: string
  consentGiven: boolean
  consentDate: string
  withdrawalDate?: string
  ipAddress: string
  userAgent: string
  consentMethod: 'explicit' | 'opt_in' | 'granular' | 'bundled'
  dataRetentionPeriod: string
  thirdPartySharing: boolean
  consentVersion: string
  renewalRequired: boolean
  renewalDate?: string
}

interface ConsentWithdrawal {
  consentId: string
  withdrawalDate: string
  withdrawalMethod: 'user_request' | 'admin_action' | 'automatic_expiry'
  reason?: string
  ipAddress: string
  confirmed: boolean
}

// Mock storage - replace with actual database
const consentRecords = new Map<string, ConsentRecord>()
const consentWithdrawals = new Map<string, ConsentWithdrawal>()

// POST: Record new consent
export const POST = withAuditLog('GDPR_CONSENT_RECORD')(
  async function handler(request: NextRequest) {
    try {
      const requestData = await request.json()
      
      // Validate consent data
      const validationResult = validateRequestBody(gdprConsentSchema, requestData)
      if (!validationResult.success) {
        return NextResponse.json(createValidationResponse(validationResult.errors), { status: 400 })
      }

      const { 
        userId, 
        email, 
        consentType, 
        purpose, 
        consentGiven, 
        consentMethod,
        dataRetentionPeriod,
        thirdPartySharing
      } = validationResult.data

      const consentId = generateSecureToken(16)
      
      const consentRecord: ConsentRecord = {
        id: consentId,
        userId,
        email,
        consentType,
        purpose,
        legalBasis: getLegalBasisForConsentType(consentType),
        consentGiven,
        consentDate: new Date().toISOString(),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        consentMethod,
        dataRetentionPeriod,
        thirdPartySharing: thirdPartySharing || false,
        consentVersion: '1.0',
        renewalRequired: requiresRenewal(consentType),
        renewalDate: calculateRenewalDate(consentType)
      }

      // Store consent record
      consentRecords.set(consentId, consentRecord)

      // Log consent action
      // SECURITY: console statement removed
      // GDPR Consent action: consentId, userId, email, consentType, purpose, legalBasis

      return NextResponse.json({
        success: true,
        consentId,
        status: consentGiven ? 'consent_granted' : 'consent_denied',
        legalBasis: consentRecord.legalBasis,
        dataRetentionPeriod,
        renewalRequired: consentRecord.renewalRequired,
        renewalDate: consentRecord.renewalDate,
        message: 'Consent recorded successfully'
      })

    } catch (error) {
      // SECURITY: console statement removed: console.error('Consent recording error:', error)
      return NextResponse.json(
        { error: 'Failed to record consent' },
        { status: 500 }
      )
    }
  }
)

// GET: Retrieve consent records
export const GET = withAuditLog('GDPR_CONSENT_VIEW')(
  withAuth(async function handler(request: AuthenticatedRequest) {
    try {
      const { searchParams } = new URL(request.url)
      const userId = searchParams.get('userId')
      const email = searchParams.get('email')
      const consentType = searchParams.get('consentType')

      let consents = Array.from(consentRecords.values())

      // Filter by parameters
      if (userId) {
        consents = consents.filter(c => c.userId === userId)
      }
      if (email) {
        consents = consents.filter(c => c.email === email)
      }
      if (consentType) {
        consents = consents.filter(c => c.consentType === consentType)
      }

      // Add withdrawal information
      const consentsWithStatus = consents.map(consent => {
        const withdrawal = Array.from(consentWithdrawals.values())
          .find(w => w.consentId === consent.id)
        
        return {
          ...consent,
          isActive: consent.consentGiven && !withdrawal,
          withdrawalInfo: withdrawal
        }
      })

      return NextResponse.json({
        success: true,
        consents: consentsWithStatus,
        total: consentsWithStatus.length
      })

    } catch (error) {
      // SECURITY: console statement removed: console.error('Consent retrieval error:', error)
      return NextResponse.json(
        { error: 'Failed to retrieve consent records' },
        { status: 500 }
      )
    }
  })
)

// PUT: Withdraw consent
export const PUT = withAuditLog('GDPR_CONSENT_WITHDRAWAL')(
  async function handler(request: NextRequest) {
    try {
      const requestData = await request.json() as { consentId: string; withdrawalMethod: string; reason?: string; userId?: string }
      const { consentId, withdrawalMethod, reason, userId } = requestData

      if (!consentId) {
        return NextResponse.json(
          { error: 'Consent ID is required' },
          { status: 400 }
        )
      }

      const consentRecord = consentRecords.get(consentId)
      if (!consentRecord) {
        return NextResponse.json(
          { error: 'Consent record not found' },
          { status: 404 }
        )
      }

      // Verify user has permission to withdraw this consent
      if (userId && consentRecord.userId !== userId) {
        return NextResponse.json(
          { error: 'Not authorized to withdraw this consent' },
          { status: 403 }
        )
      }

      const withdrawal: ConsentWithdrawal = {
        consentId,
        withdrawalDate: new Date().toISOString(),
        withdrawalMethod: (withdrawalMethod || 'user_request') as 'user_request' | 'admin_action' | 'automatic_expiry',
        reason,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        confirmed: true
      }

      // Record withdrawal
      consentWithdrawals.set(consentId, withdrawal)

      // Update consent record
      consentRecord.withdrawalDate = withdrawal.withdrawalDate

      // Execute data processing changes based on withdrawal
      await processConsentWithdrawal(consentRecord, withdrawal)

      // SECURITY: console statement removed
      // GDPR Consent Withdrawn: consentId, userId, email, consentType, withdrawalMethod

      return NextResponse.json({
        success: true,
        withdrawalId: consentId,
        withdrawalDate: withdrawal.withdrawalDate,
        message: 'Consent withdrawn successfully',
        dataProcessingChanges: getDataProcessingChanges(consentRecord.consentType)
      })

    } catch (error) {
      // SECURITY: console statement removed: console.error('Consent withdrawal error:', error)
      return NextResponse.json(
        { error: 'Failed to withdraw consent' },
        { status: 500 }
      )
    }
  }
)

// DELETE: Delete consent record (admin only)
export const DELETE = withAuditLog('GDPR_CONSENT_DELETE')(
  withAuth(async function handler(request: AuthenticatedRequest) {
    try {
      const { searchParams } = new URL(request.url)
      const consentId = searchParams.get('consentId')

      if (!consentId) {
        return NextResponse.json(
          { error: 'Consent ID is required' },
          { status: 400 }
        )
      }

      const consentRecord = consentRecords.get(consentId)
      if (!consentRecord) {
        return NextResponse.json(
          { error: 'Consent record not found' },
          { status: 404 }
        )
      }

      // Remove consent record and any associated withdrawals
      consentRecords.delete(consentId)
      consentWithdrawals.delete(consentId)

      // SECURITY: console statement removed
      // GDPR Consent Record Deleted: consentId, userId, email, consentType

      return NextResponse.json({
        success: true,
        message: 'Consent record deleted successfully'
      })

    } catch (error) {
      // SECURITY: console statement removed: console.error('Consent deletion error:', error)
      return NextResponse.json(
        { error: 'Failed to delete consent record' },
        { status: 500 }
      )
    }
  })
)

// Helper functions
function getLegalBasisForConsentType(consentType: string): string {
  const legalBases = {
    necessary: 'GDPR Article 6(1)(b) - Performance of contract',
    functional: 'GDPR Article 6(1)(f) - Legitimate interests',
    analytics: 'GDPR Article 6(1)(a) - Consent',
    marketing: 'GDPR Article 6(1)(a) - Consent',
    biometric: 'GDPR Article 9(2)(a) - Explicit consent for special categories',
    profiling: 'GDPR Article 22 - Automated decision-making and profiling'
  }
  return legalBases[consentType as keyof typeof legalBases] || 'GDPR Article 6(1)(a) - Consent'
}

function requiresRenewal(consentType: string): boolean {
  // Marketing and analytics consent should be renewed periodically
  return ['marketing', 'analytics', 'profiling'].includes(consentType)
}

function calculateRenewalDate(consentType: string): string | undefined {
  if (!requiresRenewal(consentType)) return undefined
  
  const renewalDate = new Date()
  renewalDate.setFullYear(renewalDate.getFullYear() + 2) // Renew every 2 years
  return renewalDate.toISOString()
}

async function processConsentWithdrawal(consent: ConsentRecord, withdrawal: ConsentWithdrawal) {
  switch (consent.consentType) {
    case 'marketing':
      await stopMarketingCommunications(consent.email)
      break
    case 'analytics':
      await disableAnalyticsTracking(consent.userId)
      break
    case 'profiling':
      await deleteUserProfile(consent.userId)
      break
    case 'biometric':
      await deleteBiometricData(consent.userId)
      break
  }
}

function getDataProcessingChanges(consentType: string): string[] {
  const changes = {
    marketing: [
      'Marketing emails will be stopped',
      'Promotional notifications disabled',
      'Third-party marketing data sharing stopped'
    ],
    analytics: [
      'Analytics tracking disabled',
      'Behavioral data collection stopped',
      'Usage statistics anonymized'
    ],
    profiling: [
      'User profiling stopped',
      'Automated decision-making disabled',
      'Recommendation algorithms disabled'
    ],
    biometric: [
      'Biometric data will be deleted',
      'Biometric authentication disabled',
      'Facial recognition data removed'
    ]
  }
  return changes[consentType as keyof typeof changes] || ['Data processing updated per withdrawal']
}

async function stopMarketingCommunications(email: string) {
  // SECURITY: console statement removed: console.log(`📧 Stopping marketing communications for ${email}`)
}

async function disableAnalyticsTracking(userId: string) {
  // SECURITY: console statement removed: console.log(`📊 Disabling analytics tracking for user ${userId}`)
}

async function deleteUserProfile(userId: string) {
  // SECURITY: console statement removed: console.log(`👤 Deleting user profile data for ${userId}`)
}

async function deleteBiometricData(userId: string) {
  // SECURITY: console statement removed: console.log(`🔒 Deleting biometric data for user ${userId}`)
}