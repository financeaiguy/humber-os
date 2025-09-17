import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// Mock audit trail data
const generateAuditTrail = (recruitId: string) => {
  const now = new Date()
  const createdDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  const screenedDate = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000) // 25 days ago
  const interviewedDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
  const lastViewedDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago

  return {
    recruitId,
    gdprCompliant: true,
    dataRetentionDays: 365,
    auditEvents: [
      {
        id: '1',
        action: 'RECORD_CREATED',
        performedBy: 'sarah.johnson@techstaff.com',
        performedByRole: 'Recruiter',
        timestamp: createdDate.toISOString(),
        details: 'Recruit profile created',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: '2',
        action: 'PROFILE_UPDATED',
        performedBy: 'sarah.johnson@techstaff.com',
        performedByRole: 'Recruiter',
        timestamp: new Date(createdDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        details: 'Updated skills and certifications',
        changedFields: ['skills', 'certifications'],
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: '3',
        action: 'STATUS_CHANGED',
        performedBy: 'mike.chen@humber.com',
        performedByRole: 'Hiring Manager',
        timestamp: screenedDate.toISOString(),
        details: 'Status changed from sourced to screened',
        previousValue: 'sourced',
        newValue: 'screened',
        ipAddress: '10.0.0.45',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        id: '4',
        action: 'DOCUMENT_UPLOADED',
        performedBy: 'sarah.johnson@techstaff.com',
        performedByRole: 'Recruiter',
        timestamp: new Date(screenedDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        details: 'Resume uploaded',
        documentType: 'resume',
        documentName: 'john_smith_resume.pdf',
        documentSize: '245KB',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: '5',
        action: 'PROFILE_VIEWED',
        performedBy: 'jennifer.wu@humber.com',
        performedByRole: 'HR Manager',
        timestamp: interviewedDate.toISOString(),
        details: 'Profile accessed for review',
        ipAddress: '10.0.0.78',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: '6',
        action: 'STATUS_CHANGED',
        performedBy: 'jennifer.wu@humber.com',
        performedByRole: 'HR Manager',
        timestamp: new Date(interviewedDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        details: 'Status changed from screened to interviewed',
        previousValue: 'screened',
        newValue: 'interviewed',
        ipAddress: '10.0.0.78',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: '7',
        action: 'NOTE_ADDED',
        performedBy: 'mike.chen@humber.com',
        performedByRole: 'Hiring Manager',
        timestamp: new Date(interviewedDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        details: 'Interview feedback added',
        notePreview: 'Strong technical skills, good cultural fit...',
        ipAddress: '10.0.0.45',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        id: '8',
        action: 'PROFILE_EXPORTED',
        performedBy: 'admin@humber.com',
        performedByRole: 'System Administrator',
        timestamp: lastViewedDate.toISOString(),
        details: 'Profile data exported for reporting',
        exportFormat: 'JSON',
        ipAddress: '10.0.0.1',
        userAgent: 'Humber-Reporting-Service/1.0'
      },
      {
        id: '9',
        action: 'PROFILE_VIEWED',
        performedBy: 'sarah.johnson@techstaff.com',
        performedByRole: 'Recruiter',
        timestamp: new Date(lastViewedDate.getTime() + 12 * 60 * 60 * 1000).toISOString(),
        details: 'Profile accessed',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: '10',
        action: 'AUDIT_TRAIL_ACCESSED',
        performedBy: 'compliance@humber.com',
        performedByRole: 'Compliance Officer',
        timestamp: now.toISOString(),
        details: 'Audit trail accessed for GDPR compliance review',
        gdprArticle: '15',
        ipAddress: '10.0.0.200',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    ],
    dataAccessHistory: {
      totalAccesses: 15,
      uniqueUsers: 5,
      lastAccessed: now.toISOString(),
      accessByRole: {
        'Recruiter': 6,
        'Hiring Manager': 4,
        'HR Manager': 3,
        'System Administrator': 1,
        'Compliance Officer': 1
      }
    },
    dataLocations: [
      {
        system: 'Primary Database',
        location: 'US-East-1',
        encrypted: true,
        backupFrequency: 'Daily'
      },
      {
        system: 'Document Storage',
        location: 'US-West-2',
        encrypted: true,
        backupFrequency: 'Weekly'
      },
      {
        system: 'Analytics Warehouse',
        location: 'EU-Central-1',
        encrypted: true,
        backupFrequency: 'Monthly',
        anonymized: true
      }
    ],
    consentHistory: [
      {
        version: '1.0',
        consentedAt: createdDate.toISOString(),
        consentedBy: 'john.smith@email.com',
        purposes: ['recruitment', 'processing', 'storage'],
        withdrawable: true,
        expiresAt: new Date(now.getTime() + 335 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    retentionPolicy: {
      currentPolicy: 'GDPR_STANDARD',
      retentionPeriod: '365 days',
      deleteAfter: new Date(createdDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      legalBasis: 'Legitimate interest for recruitment purposes',
      exceptions: []
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recruitId = params.id
    
    // In a real application, verify user permissions here
    // Check if the user has rights to access this audit trail
    
    // Generate audit trail
    const auditTrail = generateAuditTrail(recruitId)
    
    // Log this access to the audit trail (in real app, save to database)
    console.log(`Audit trail accessed for recruit ${recruitId}`)
    
    return NextResponse.json({
      success: true,
      data: auditTrail,
      gdprCompliance: {
        article: 15,
        rightType: 'Right of Access',
        requestedAt: new Date().toISOString(),
        providedWithin: '30 days',
        dataPortable: true
      }
    })
  } catch (error) {
    console.error('Error generating audit trail:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate audit trail',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}