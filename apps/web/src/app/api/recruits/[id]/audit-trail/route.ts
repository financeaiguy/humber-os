import { NextRequest, NextResponse } from 'next/server'
import { recruitsStorage } from '@/lib/storage/recruits-storage'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Validation schemas
const auditQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  action: z.string().optional(),
  limit: z.string().transform(val => parseInt(val, 10)).optional(),
  offset: z.string().transform(val => parseInt(val, 10)).optional()
})

// Mock audit trail storage (in production, this would be a database)
class AuditTrailStorage {
  private static instance: AuditTrailStorage
  private auditLogs: Map<string, AuditLogEntry[]> = new Map()

  private constructor() {
    this.initializeSampleData()
  }

  static getInstance(): AuditTrailStorage {
    if (!AuditTrailStorage.instance) {
      AuditTrailStorage.instance = new AuditTrailStorage()
    }
    return AuditTrailStorage.instance
  }

  private initializeSampleData() {
    // Sample audit trail for rec_123
    const sampleLogs: AuditLogEntry[] = [
      {
        id: 'audit_001',
        recruitId: 'rec_123',
        action: 'data_access',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'hr_manager_001',
        actorType: 'user',
        details: {
          type: 'profile_view',
          fields: ['firstName', 'lastName', 'email', 'position'],
          reason: 'Initial screening review'
        },
        ipAddress: '192.168.1.10',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        gdprBasis: 'legitimate_interest',
        dataCategories: ['personal_data', 'professional_data']
      },
      {
        id: 'audit_002',
        recruitId: 'rec_123',
        action: 'consent_given',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'rec_123',
        actorType: 'data_subject',
        details: {
          consentType: 'privacy',
          consentText: 'I consent to the processing of my personal data for recruitment purposes',
          consentVersion: '1.0'
        },
        ipAddress: '203.0.113.45',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        gdprBasis: 'consent',
        dataCategories: ['personal_data']
      },
      {
        id: 'audit_003',
        recruitId: 'rec_123',
        action: 'data_modification',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'system_automated',
        actorType: 'system',
        details: {
          type: 'status_update',
          previousValue: 'interviewed',
          newValue: 'offered',
          reason: 'Interview process completed successfully'
        },
        ipAddress: '127.0.0.1',
        userAgent: 'System/1.0',
        gdprBasis: 'legitimate_interest',
        dataCategories: ['recruitment_status']
      },
      {
        id: 'audit_004',
        recruitId: 'rec_123',
        action: 'data_export',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'hr_admin_002',
        actorType: 'user',
        details: {
          exportFormat: 'PDF',
          exportedFields: ['all_personal_data'],
          reason: 'Data subject access request (GDPR Article 15)'
        },
        ipAddress: '192.168.1.25',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        gdprBasis: 'data_subject_request',
        dataCategories: ['personal_data', 'professional_data', 'consent_data']
      },
      {
        id: 'audit_005',
        recruitId: 'rec_123',
        action: 'onboarding_started',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'hr_coordinator_003',
        actorType: 'user',
        details: {
          onboardingSteps: ['Document Verification', 'Background Check', 'IT Setup'],
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        ipAddress: '192.168.1.15',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        gdprBasis: 'contract_performance',
        dataCategories: ['employment_data']
      },
      {
        id: 'audit_006',
        recruitId: 'rec_123',
        action: 'consent_verification',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'compliance_officer_001',
        actorType: 'user',
        details: {
          verificationType: 'routine_audit',
          consentStatus: 'valid',
          complianceCheck: 'passed'
        },
        ipAddress: '192.168.1.30',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        gdprBasis: 'compliance_monitoring',
        dataCategories: ['consent_data']
      }
    ]

    this.auditLogs.set('rec_123', sampleLogs)
    
    // Sample logs for rec_456
    this.auditLogs.set('rec_456', [
      {
        id: 'audit_101',
        recruitId: 'rec_456',
        action: 'data_access',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'hr_manager_001',
        actorType: 'user',
        details: {
          type: 'profile_view',
          fields: ['firstName', 'lastName', 'email', 'position'],
          reason: 'Post-interview evaluation'
        },
        ipAddress: '192.168.1.10',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        gdprBasis: 'legitimate_interest',
        dataCategories: ['personal_data', 'professional_data']
      }
    ])
  }

  async getAuditTrail(
    recruitId: string,
    filters: {
      startDate?: string
      endDate?: string
      action?: string
      limit?: number
      offset?: number
    } = {}
  ): Promise<{ logs: AuditLogEntry[], total: number }> {
    let logs = this.auditLogs.get(recruitId) || []

    // Apply filters
    if (filters.startDate) {
      const startDate = new Date(filters.startDate)
      logs = logs.filter(log => new Date(log.timestamp) >= startDate)
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate)
      logs = logs.filter(log => new Date(log.timestamp) <= endDate)
    }

    if (filters.action) {
      logs = logs.filter(log => log.action === filters.action)
    }

    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const total = logs.length
    
    // Apply pagination
    const offset = filters.offset || 0
    const limit = filters.limit || 50
    logs = logs.slice(offset, offset + limit)

    return { logs, total }
  }

  async addAuditLog(log: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    const auditLog: AuditLogEntry = {
      ...log,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString()
    }

    const existingLogs = this.auditLogs.get(log.recruitId) || []
    existingLogs.push(auditLog)
    this.auditLogs.set(log.recruitId, existingLogs)

    return auditLog
  }
}

interface AuditLogEntry {
  id: string
  recruitId: string
  action: string
  timestamp: string
  actor: string
  actorType: 'user' | 'system' | 'data_subject'
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  gdprBasis: string
  dataCategories: string[]
}

const auditStorage = AuditTrailStorage.getInstance()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recruitId } = await params
    const url = new URL(request.url)
    
    // Parse query parameters
    const queryParams = Object.fromEntries(url.searchParams.entries())
    const validation = auditQuerySchema.safeParse(queryParams)
    
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: validation.error.flatten()
        },
        { status: 400 }
      )
    }

    const filters = validation.data

    // Check if recruit exists
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

    const { logs, total } = await auditStorage.getAuditTrail(recruitId, filters)

    // Calculate summary statistics
    const actionCounts = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const gdprBasisCounts = logs.reduce((acc, log) => {
      acc[log.gdprBasis] = (acc[log.gdprBasis] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const response = {
      success: true,
      data: {
        recruitId,
        recruitName: `${recruit.firstName} ${recruit.lastName}`,
        auditTrail: {
          logs,
          pagination: {
            total,
            offset: filters.offset || 0,
            limit: filters.limit || 50,
            hasMore: total > (filters.offset || 0) + logs.length
          },
          summary: {
            totalEntries: total,
            dateRange: {
              earliest: logs.length > 0 ? logs[logs.length - 1].timestamp : null,
              latest: logs.length > 0 ? logs[0].timestamp : null
            },
            actionBreakdown: actionCounts,
            gdprBasisBreakdown: gdprBasisCounts,
            complianceStatus: {
              gdprCompliant: true,
              lastAuditDate: new Date().toISOString(),
              retentionPeriod: '7 years',
              dataSubjectRights: {
                accessRequests: logs.filter(l => l.action === 'data_export').length,
                consentUpdates: logs.filter(l => l.action.includes('consent')).length
              }
            }
          }
        }
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve audit trail',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recruitId } = await params
    const body = await request.json()

    // Validate required fields
    if (!body.action || !body.actor || !body.actorType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: action, actor, actorType'
        },
        { status: 400 }
      )
    }

    // Check if recruit exists
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
    const auditLog = await auditStorage.addAuditLog({
      recruitId,
      action: body.action,
      actor: body.actor,
      actorType: body.actorType,
      details: body.details || {},
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      gdprBasis: body.gdprBasis || 'legitimate_interest',
      dataCategories: body.dataCategories || ['general_data']
    })

    return NextResponse.json({
      success: true,
      data: {
        auditLogId: auditLog.id,
        message: 'Audit log entry created successfully',
        auditLog
      },
      timestamp: new Date().toISOString()
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create audit log entry',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}