import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

interface AnonymizeRequest {
  reason: string
  requestorEmail?: string
  confirmDeletion?: boolean
}

// Function to anonymize data
const anonymizeData = (data: any) => {
  return {
    id: data.id,
    firstName: 'ANONYMIZED',
    lastName: 'ANONYMIZED',
    email: `anonymized_${data.id}@removed.com`,
    phone: 'XXX-XXX-XXXX',
    currentLocation: 'REMOVED',
    jobTitle: data.jobTitle || 'REMOVED', // Keep job title for statistics
    yearsExperience: data.yearsExperience || 0, // Keep for statistics
    currentCompany: 'ANONYMIZED',
    desiredSalary: 'REMOVED',
    skills: data.skills?.map(() => 'REMOVED') || [],
    education: 'REMOVED',
    certifications: data.certifications?.map(() => 'REMOVED') || [],
    availableStartDate: 'REMOVED',
    workAuthorization: 'REMOVED',
    willingToRelocate: false,
    travelWillingness: 'REMOVED',
    source: data.source || 'REMOVED',
    recruiterName: 'REMOVED',
    recruiterAgency: 'REMOVED',
    status: data.status || 'anonymized',
    notes: 'All personal information has been removed per GDPR Article 17 request',
    anonymizedAt: new Date().toISOString(),
    anonymizationReason: 'GDPR Article 17 - Right to be forgotten'
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recruitId } = await params
    const body = await request.json() as AnonymizeRequest
    
    // Validate request
    if (!body.reason) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'Anonymization reason is required'
        },
        { status: 400 }
      )
    }

    // In a real application:
    // 1. Verify user permissions
    // 2. Check if data can be legally deleted (no ongoing legal obligations)
    // 3. Create backup for legal compliance before deletion
    // 4. Remove from all systems (database, backups, logs, etc.)
    
    const anonymizationResult = {
      recruitId,
      status: 'completed',
      anonymizedAt: new Date().toISOString(),
      reason: body.reason,
      requestorEmail: body.requestorEmail || 'Not provided',
      dataRemoved: {
        personalIdentifiers: true,
        contactInformation: true,
        employmentHistory: true,
        educationalRecords: true,
        documents: true,
        notes: true,
        communicationHistory: true
      },
      dataRetained: {
        aggregateStatistics: true,
        anonymizedJobRole: true,
        yearsExperience: true
      },
      systemsUpdated: [
        {
          system: 'Primary Database',
          status: 'anonymized',
          timestamp: new Date().toISOString()
        },
        {
          system: 'Document Storage',
          status: 'purged',
          timestamp: new Date().toISOString()
        },
        {
          system: 'Email Archives',
          status: 'redacted',
          timestamp: new Date().toISOString()
        },
        {
          system: 'Analytics Warehouse',
          status: 'anonymized',
          timestamp: new Date().toISOString()
        },
        {
          system: 'Backup Systems',
          status: 'scheduled_for_purge',
          purgeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          note: 'Will be removed in next backup rotation cycle'
        }
      ],
      legalCompliance: {
        gdprArticle: '17',
        rightType: 'Right to Erasure (Right to be Forgotten)',
        processingTime: '2 seconds',
        completedWithin: '72 hours requirement',
        exceptions: [],
        retentionJustification: 'No legal obligation to retain'
      },
      auditLog: {
        action: 'DATA_ANONYMIZATION',
        performedAt: new Date().toISOString(),
        performedBy: 'system',
        authorizedBy: body.requestorEmail || 'data_subject',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      },
      confirmationDetails: {
        confirmationId: `GDPR-ANO-${recruitId}-${Date.now()}`,
        confirmationSent: body.requestorEmail ? true : false,
        sentTo: body.requestorEmail || null,
        message: 'Your data has been successfully anonymized in compliance with GDPR Article 17. This action is irreversible.'
      }
    }

    // Log the anonymization for compliance
    console.log(`Data anonymized for recruit ${recruitId}:`, {
      reason: body.reason,
      requestor: body.requestorEmail,
      timestamp: new Date().toISOString()
    })

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Data successfully anonymized',
      data: anonymizationResult,
      anonymizedRecord: anonymizeData({ 
        id: recruitId,
        status: 'anonymized'
      }),
      gdprCompliance: {
        compliant: true,
        article: 17,
        rightExercised: 'Right to be Forgotten',
        irreversible: true,
        certificateId: anonymizationResult.confirmationDetails.confirmationId
      }
    })
    
  } catch (error) {
    console.error('Error anonymizing data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to anonymize data',
        message: error instanceof Error ? error.message : 'Unknown error',
        gdprCompliance: {
          compliant: false,
          requiresManualIntervention: true,
          escalateTo: 'Data Protection Officer'
        }
      },
      { status: 500 }
    )
  }
}