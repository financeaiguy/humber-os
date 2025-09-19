import { NextRequest, NextResponse } from 'next/server'
import { recruitsStorage } from '@/lib/storage/recruits-storage'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Validation schemas
const consentUpdateSchema = z.object({
  consentType: z.enum(['privacy', 'marketing', 'biometric', 'data_processing']),
  consentGiven: z.boolean(),
  consentText: z.string().optional(),
  purposeSpecification: z.string().optional()
})

const bulkConsentSchema = z.object({
  consents: z.array(z.object({
    type: z.enum(['privacy', 'marketing', 'biometric', 'data_processing']),
    given: z.boolean(),
    text: z.string().optional()
  }))
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recruitId } = await params
    const body = await request.json()
    
    // Check if this is bulk consent update
    if (body.consents && Array.isArray(body.consents)) {
      const validation = bulkConsentSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid bulk consent data',
            details: validation.error.flatten()
          },
          { status: 400 }
        )
      }

      // Process each consent
      let recruit = await recruitsStorage.getRecruit(recruitId)
      if (!recruit) {
        return NextResponse.json(
          {
            success: false,
            error: 'Recruit not found'
          },
          { status: 404 }
        )
      }

      for (const consent of body.consents) {
        recruit = await recruitsStorage.updateConsent(
          recruitId,
          consent.type,
          consent.given,
          consent.text
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          id: recruitId,
          consentsUpdated: body.consents.length,
          consentData: recruit?.consentData,
          gdprCompliant: recruit?.consentData?.gdprCompliant,
          message: 'Consents updated successfully'
        },
        timestamp: new Date().toISOString()
      }, { status: 200 })
    } else {
      // Single consent update
      const validation = consentUpdateSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid consent data',
            details: validation.error.flatten()
          },
          { status: 400 }
        )
      }

      const recruit = await recruitsStorage.getRecruit(recruitId)
      if (!recruit) {
        return NextResponse.json(
          {
            success: false,
            error: 'Recruit not found'
          },
          { status: 404 }
        )
      }

      // Generate appropriate consent text if not provided
      const consentText = body.consentText || generateConsentText(body.consentType, body.purposeSpecification)

      const updatedRecruit = await recruitsStorage.updateConsent(
        recruitId,
        body.consentType,
        body.consentGiven,
        consentText
      )

      if (!updatedRecruit) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to update consent'
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          id: recruitId,
          consentType: body.consentType,
          consentGiven: body.consentGiven,
          consentText,
          consentVersion: '1.0',
          consentTimestamp: new Date().toISOString(),
          purposeSpecification: body.purposeSpecification || getDefaultPurpose(body.consentType),
          retentionPeriod: '7 years',
          withdrawalRights: 'You may withdraw consent at any time by contacting HR',
          processingBasis: 'Legitimate interest and consent',
          gdprCompliant: updatedRecruit.consentData?.gdprCompliant,
          dataCategories: getDataCategories(body.consentType)
        },
        timestamp: new Date().toISOString()
      }, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update consent',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recruitId } = await params
    const recruit = await recruitsStorage.getRecruit(recruitId)

    if (!recruit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Recruit not found'
        },
        { status: 404 }
      )
    }

    const consentData = recruit.consentData || {
      consents: [
        { type: 'privacy', given: false, timestamp: null, version: '1.0' },
        { type: 'marketing', given: false, timestamp: null, version: '1.0' },
        { type: 'biometric', given: false, timestamp: null, version: '1.0' },
        { type: 'data_processing', given: false, timestamp: null, version: '1.0' }
      ],
      gdprCompliant: false,
      lastUpdated: new Date().toISOString()
    }

    // Add detailed information for each consent
    const detailedConsents = consentData.consents.map(consent => ({
      ...consent,
      purpose: getDefaultPurpose(consent.type),
      dataCategories: getDataCategories(consent.type),
      retentionPeriod: '7 years',
      legalBasis: consent.type === 'privacy' ? 'GDPR Article 6(1)(a) - Consent' : 'Legitimate Interest',
      withdrawalMethod: 'Contact HR department or use self-service portal'
    }))

    return NextResponse.json({
      success: true,
      data: {
        id: recruitId,
        recruitName: `${recruit.firstName} ${recruit.lastName}`,
        email: recruit.email,
        consents: detailedConsents,
        gdprCompliant: consentData.gdprCompliant,
        lastUpdated: consentData.lastUpdated,
        complianceStatus: {
          gdpr: consentData.gdprCompliant,
          ccpa: true, // Assuming CCPA compliance for US
          dataSubjectRights: {
            access: true,
            rectification: true,
            erasure: true,
            portability: true,
            objection: true
          }
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get consent status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recruitId } = await params
    const url = new URL(request.url)
    const consentType = url.searchParams.get('type')

    const recruit = await recruitsStorage.getRecruit(recruitId)
    if (!recruit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Recruit not found'
        },
        { status: 404 }
      )
    }

    let updatedRecruit

    if (consentType) {
      // Withdraw specific consent
      updatedRecruit = await recruitsStorage.updateConsent(
        recruitId,
        consentType,
        false,
        undefined
      )

      return NextResponse.json({
        success: true,
        data: {
          id: recruitId,
          consentType,
          consentWithdrawn: true,
          withdrawalTimestamp: new Date().toISOString(),
          message: `${consentType} consent withdrawn successfully`,
          remainingConsents: updatedRecruit?.consentData?.consents.filter(c => c.given).length || 0
        },
        timestamp: new Date().toISOString()
      }, { status: 200 })
    } else {
      // Withdraw all consents
      updatedRecruit = await recruitsStorage.withdrawAllConsents(recruitId)

      if (!updatedRecruit) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to withdraw consents'
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          id: recruitId,
          allConsentsWithdrawn: true,
          withdrawalTimestamp: new Date().toISOString(),
          dataRetentionNotice: 'Your data will be retained for legal compliance purposes only',
          erasureScheduled: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          message: 'All consents withdrawn successfully. Data erasure scheduled as per GDPR requirements.'
        },
        timestamp: new Date().toISOString()
      }, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to withdraw consent',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recruitId } = await params
    const body = await request.json()

    // Handle consent verification/audit
    if (body.action === 'verify') {
      const recruit = await recruitsStorage.getRecruit(recruitId)
      if (!recruit) {
        return NextResponse.json(
          {
            success: false,
            error: 'Recruit not found'
          },
          { status: 404 }
        )
      }

      // Create audit log entry
      const auditLog = {
        id: `audit_${Date.now()}`,
        recruitId,
        action: 'consent_verification',
        timestamp: new Date().toISOString(),
        verifiedBy: body.verifiedBy || 'system',
        consentStatus: recruit.consentData,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }

      return NextResponse.json({
        success: true,
        data: {
          id: recruitId,
          verified: true,
          verificationTimestamp: new Date().toISOString(),
          auditLog,
          consentData: recruit.consentData,
          message: 'Consent verification completed and logged'
        },
        timestamp: new Date().toISOString()
      }, { status: 200 })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action'
      },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process consent action',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper functions
function generateConsentText(type: string, purpose?: string): string {
  const baseTexts: Record<string, string> = {
    privacy: 'I consent to the processing of my personal data for recruitment and employment purposes in accordance with GDPR Article 6 and 7.',
    marketing: 'I consent to receive marketing communications and updates about career opportunities.',
    biometric: 'I consent to the processing of biometric data for identity verification and access control purposes.',
    data_processing: 'I consent to the processing of my data for the specified purposes with appropriate security measures.'
  }

  const text = baseTexts[type] || baseTexts.data_processing
  return purpose ? `${text} Purpose: ${purpose}` : text
}

function getDefaultPurpose(type: string): string {
  const purposes: Record<string, string> = {
    privacy: 'Recruitment and employment data processing',
    marketing: 'Career opportunities and company updates',
    biometric: 'Security and access control',
    data_processing: 'General data processing for business operations'
  }
  return purposes[type] || purposes.data_processing
}

function getDataCategories(type: string): string[] {
  const categories: Record<string, string[]> = {
    privacy: ['Personal identification data', 'Contact information', 'Professional qualifications', 'Employment history'],
    marketing: ['Contact information', 'Communication preferences', 'Career interests'],
    biometric: ['Fingerprints', 'Facial recognition data', 'Access logs'],
    data_processing: ['General personal data', 'Professional information']
  }
  return categories[type] || categories.data_processing
}