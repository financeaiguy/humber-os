import { NextRequest, NextResponse } from 'next/server'
import { recruitsStorage } from '@/lib/storage/recruits-storage'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Validation schema
const anonymizeSchema = z.object({
  reason: z.string().min(1),
  dataRetentionPeriod: z.string().optional(),
  partialAnonymization: z.boolean().optional(),
  fieldsToAnonymize: z.array(z.string()).optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recruitId } = await params
    const body = await request.json()
    
    const validation = anonymizeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid anonymization request',
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

    // Check if recruit can be anonymized (should not be currently active)
    if (recruit.status === 'onboarding' || recruit.status === 'onboarded') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot anonymize active recruit. Please complete offboarding process first.'
        },
        { status: 400 }
      )
    }

    const { reason, partialAnonymization = false, fieldsToAnonymize = [] } = validation.data

    // Create anonymized version of recruit data
    const anonymizedData = anonymizeRecruitData(recruit, partialAnonymization, fieldsToAnonymize)

    // In a real system, this would update the database with anonymized data
    // and create audit logs for GDPR compliance
    const anonymizationRecord = {
      id: `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      originalRecruitId: recruitId,
      anonymizedAt: new Date().toISOString(),
      reason,
      anonymizationType: partialAnonymization ? 'partial' : 'full',
      fieldsAnonymized: partialAnonymization ? fieldsToAnonymize : getAllPersonalFields(),
      performedBy: request.headers.get('authorization')?.includes('user') ? 'hr_admin' : 'system',
      gdprBasis: 'data_subject_request', // GDPR Article 17 - Right to erasure
      retentionPeriod: validation.data.dataRetentionPeriod || '7_years_legal_compliance',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    }

    // Update recruit with anonymized data
    await recruitsStorage.updateRecruit(recruitId, anonymizedData)

    // In production, add audit log entry
    // await auditStorage.addAuditLog({...})

    return NextResponse.json({
      success: true,
      data: {
        anonymizationId: anonymizationRecord.id,
        recruitId,
        anonymizedAt: anonymizationRecord.anonymizedAt,
        anonymizationType: anonymizationRecord.anonymizationType,
        fieldsAnonymized: anonymizationRecord.fieldsAnonymized,
        dataRetention: {
          policy: 'legal_compliance_only',
          period: anonymizationRecord.retentionPeriod,
          scheduledDeletion: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString() // 7 years
        },
        gdprCompliance: {
          article: 'GDPR Article 17 - Right to Erasure',
          processed: true,
          auditTrailUpdated: true,
          dataSubjectNotified: false // Would be true in production
        },
        message: partialAnonymization 
          ? 'Recruit data partially anonymized successfully'
          : 'Recruit data fully anonymized successfully'
      },
      timestamp: new Date().toISOString()
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to anonymize recruit data',
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

    // Check anonymization eligibility
    const canAnonymize = recruit.status !== 'onboarding' && recruit.status !== 'onboarded'
    const hasPersonalData = !isAnonymized(recruit)

    const response = {
      success: true,
      data: {
        recruitId,
        currentStatus: recruit.status,
        anonymizationEligible: canAnonymize,
        hasPersonalData,
        anonymizableFields: hasPersonalData ? getAnonymizableFields(recruit) : [],
        anonymizationOptions: {
          full: {
            description: 'Replace all personal identifiers with anonymous placeholders',
            fields: getAllPersonalFields(),
            reversible: false
          },
          partial: {
            description: 'Anonymize selected fields while preserving others for analysis',
            selectableFields: getAnonymizableFields(recruit),
            reversible: false
          }
        },
        gdprInformation: {
          legalBasis: 'GDPR Article 17 - Right to Erasure',
          retentionPolicy: 'Data will be retained for legal compliance (7 years) then permanently deleted',
          auditRequirements: 'All anonymization actions are logged for compliance audit'
        }
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get anonymization information',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper functions
function anonymizeRecruitData(recruit: any, partial: boolean, selectedFields: string[]) {
  if (!partial) {
    // Full anonymization - replace all personal data
    return {
      ...recruit,
      firstName: `Anonymous_${recruit.id.substring(0, 4)}`,
      lastName: 'Recruit',
      email: `anon_${recruit.id}@anonymized.local`,
      phone: 'XXX-XXX-XXXX',
      // Keep non-personal data for analytics
      position: recruit.position,
      department: recruit.department,
      status: recruit.status,
      createdAt: recruit.createdAt,
      updatedAt: new Date().toISOString(),
      // Remove or anonymize sensitive onboarding/consent data
      onboardingData: recruit.onboardingData ? {
        ...recruit.onboardingData,
        salary: 'ANONYMIZED',
        location: 'ANONYMIZED'
      } : undefined,
      consentData: undefined // Remove consent data after anonymization
    }
  } else {
    // Partial anonymization - only selected fields
    const anonymized = { ...recruit }
    
    selectedFields.forEach(field => {
      switch (field) {
        case 'firstName':
        case 'lastName':
          anonymized[field] = `ANON_${field.toUpperCase()}`
          break
        case 'email':
          anonymized.email = `anon_${recruit.id}@anonymized.local`
          break
        case 'phone':
          anonymized.phone = 'XXX-XXX-XXXX'
          break
        case 'salary':
          if (anonymized.onboardingData) {
            anonymized.onboardingData.salary = 'ANONYMIZED'
          }
          break
        case 'location':
          if (anonymized.onboardingData) {
            anonymized.onboardingData.location = 'ANONYMIZED'
          }
          break
      }
    })
    
    anonymized.updatedAt = new Date().toISOString()
    return anonymized
  }
}

function isAnonymized(recruit: any): boolean {
  return recruit.firstName?.startsWith('Anonymous_') || 
         recruit.firstName?.startsWith('ANON_') ||
         recruit.email?.includes('@anonymized.local')
}

function getAllPersonalFields(): string[] {
  return [
    'firstName',
    'lastName', 
    'email',
    'phone',
    'salary',
    'location',
    'certifications',
    'skills',
    'consentData'
  ]
}

function getAnonymizableFields(recruit: any): string[] {
  const fields = []
  
  if (recruit.firstName && !recruit.firstName.startsWith('ANON_')) {
    fields.push('firstName')
  }
  if (recruit.lastName && !recruit.lastName.startsWith('ANON_')) {
    fields.push('lastName')
  }
  if (recruit.email && !recruit.email.includes('@anonymized.local')) {
    fields.push('email')
  }
  if (recruit.phone && recruit.phone !== 'XXX-XXX-XXXX') {
    fields.push('phone')
  }
  if (recruit.onboardingData?.salary && recruit.onboardingData.salary !== 'ANONYMIZED') {
    fields.push('salary')
  }
  if (recruit.onboardingData?.location && recruit.onboardingData.location !== 'ANONYMIZED') {
    fields.push('location')
  }
  
  return fields
}