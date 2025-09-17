import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withRole, withAuditLog, AuthenticatedRequest } from '@/lib/auth-middleware'
import { generateSecureToken } from '@/lib/secure-token-generator'

export const runtime = 'edge'

// SOC 2 Type II Audit Trail Implementation
// CC5.2: Control Activities - Monitoring Controls
// CC7.2: System Monitoring
// CC8.1: Change Management

interface AuditEvent {
  id: string
  timestamp: string
  eventType: 'user_action' | 'system_event' | 'security_event' | 'data_access' | 'configuration_change'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  userEmail?: string
  ipAddress: string
  userAgent: string
  action: string
  resource: string
  details: Record<string, any>
  outcome: 'success' | 'failure' | 'warning'
  riskLevel: number // 1-10 scale
  complianceCategory: string[]
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted'
  retentionPeriod: string
  archived: boolean
}

interface SecurityIncident {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed'
  detectedDate: string
  reportedBy: string
  assignedTo?: string
  affectedSystems: string[]
  affectedUsers: string[]
  rootCause?: string
  remedationSteps: string[]
  preventiveActions: string[]
  complianceImpact: string[]
  estimatedImpact: string
  actualImpact?: string
  resolutionDate?: string
  lessons_learned?: string[]
}

interface ComplianceReport {
  id: string
  reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'incident'
  reportDate: string
  reportPeriod: { start: string; end: string }
  generatedBy: string
  totalEvents: number
  securityEvents: number
  failedLogins: number
  privilegedAccess: number
  dataAccess: number
  configurationChanges: number
  complianceViolations: number
  riskScore: number
  recommendations: string[]
  summary: string
  attachments: string[]
}

// Mock storage - replace with actual database
const auditEvents = new Map<string, AuditEvent>()
const securityIncidents = new Map<string, SecurityIncident>()
const complianceReports = new Map<string, ComplianceReport>()

// GET: Retrieve audit trail
export const GET = withAuditLog('SOC2_AUDIT_TRAIL_VIEW')(
  withRole(['SYSTEM_ADMIN', 'COMPLIANCE_OFFICER', 'SECURITY_OFFICER'])(
    withAuth(async function handler(request: AuthenticatedRequest) {
      try {
        const { searchParams } = new URL(request.url)
        const eventType = searchParams.get('eventType')
        const severity = searchParams.get('severity')
        const userId = searchParams.get('userId')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '100')
        const includeDetails = searchParams.get('includeDetails') === 'true'

        let events = Array.from(auditEvents.values())

        // Apply filters
        if (eventType) {
          events = events.filter(e => e.eventType === eventType)
        }
        if (severity) {
          events = events.filter(e => e.severity === severity)
        }
        if (userId) {
          events = events.filter(e => e.userId === userId)
        }
        if (startDate) {
          events = events.filter(e => new Date(e.timestamp) >= new Date(startDate))
        }
        if (endDate) {
          events = events.filter(e => new Date(e.timestamp) <= new Date(endDate))
        }

        // Sort by timestamp (most recent first)
        events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        // Pagination
        const total = events.length
        const startIndex = (page - 1) * limit
        const paginatedEvents = events.slice(startIndex, startIndex + limit)

        // Prepare response data
        const responseEvents = paginatedEvents.map(event => {
          const baseEvent = {
            id: event.id,
            timestamp: event.timestamp,
            eventType: event.eventType,
            severity: event.severity,
            userId: event.userId,
            userEmail: event.userEmail,
            action: event.action,
            resource: event.resource,
            outcome: event.outcome,
            riskLevel: event.riskLevel,
            complianceCategory: event.complianceCategory
          }

          if (includeDetails) {
            return {
              ...baseEvent,
              ipAddress: event.ipAddress,
              userAgent: event.userAgent,
              details: event.details,
              dataClassification: event.dataClassification
            }
          }

          return baseEvent
        })

        // Generate audit trail analytics
        const analytics = generateAuditAnalytics(events)

        return NextResponse.json({
          success: true,
          events: responseEvents,
          analytics,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        })

      } catch (error) {
        console.error('Audit trail retrieval error:', error)
        return NextResponse.json(
          { error: 'Failed to retrieve audit trail' },
          { status: 500 }
        )
      }
    })
  )
)

// POST: Create audit event (internal system use)
export const POST = withAuditLog('SOC2_AUDIT_EVENT_CREATE')(
  withAuth(async function handler(request: AuthenticatedRequest) {
    try {
      const requestData = await request.json()
      
      const {
        eventType,
        severity,
        action,
        resource,
        details,
        outcome,
        dataClassification,
        complianceCategory
      } = requestData

      const eventId = generateSecureToken(16)
      
      const auditEvent: AuditEvent = {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType,
        severity,
        userId: request.auth?.user?.id,
        userEmail: request.auth?.user?.email,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        action,
        resource,
        details: details || {},
        outcome,
        riskLevel: calculateRiskLevel(eventType, severity, outcome),
        complianceCategory: complianceCategory || ['audit_trail'],
        dataClassification,
        retentionPeriod: calculateRetentionPeriod(eventType, severity),
        archived: false
      }

      // Store audit event
      auditEvents.set(eventId, auditEvent)

      // Check for security incidents
      if (auditEvent.riskLevel >= 7) {
        await createSecurityIncident(auditEvent)
      }

      return NextResponse.json({
        success: true,
        eventId,
        timestamp: auditEvent.timestamp,
        riskLevel: auditEvent.riskLevel,
        message: 'Audit event recorded successfully'
      })

    } catch (error) {
      console.error('Audit event creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create audit event' },
        { status: 500 }
      )
    }
  })
)

// PUT: Update audit event (for incident resolution)
export const PUT = withAuditLog('SOC2_AUDIT_EVENT_UPDATE')(
  withRole(['SYSTEM_ADMIN', 'SECURITY_OFFICER'])(
    withAuth(async function handler(request: AuthenticatedRequest) {
      try {
        const requestData = await request.json()
        const { eventId, updates, updateReason } = requestData

        const auditEvent = auditEvents.get(eventId)
        if (!auditEvent) {
          return NextResponse.json(
            { error: 'Audit event not found' },
            { status: 404 }
          )
        }

        // Store original state for audit
        const originalState = { ...auditEvent }

        // Apply updates
        if (updates.severity) auditEvent.severity = updates.severity
        if (updates.outcome) auditEvent.outcome = updates.outcome
        if (updates.details) auditEvent.details = { ...auditEvent.details, ...updates.details }
        if (updates.complianceCategory) auditEvent.complianceCategory = updates.complianceCategory

        // Recalculate risk level if severity or outcome changed
        if (updates.severity || updates.outcome) {
          auditEvent.riskLevel = calculateRiskLevel(auditEvent.eventType, auditEvent.severity, auditEvent.outcome)
        }

        // Log the update as a new audit event
        const updateEvent: AuditEvent = {
          id: generateSecureToken(16),
          timestamp: new Date().toISOString(),
          eventType: 'system_event',
          severity: 'medium',
          userId: request.auth?.user?.id,
          userEmail: request.auth?.user?.email,
          ipAddress: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          action: 'audit_event_update',
          resource: `audit_event:${eventId}`,
          details: {
            originalState,
            updates,
            updateReason
          },
          outcome: 'success',
          riskLevel: 3,
          complianceCategory: ['audit_trail', 'incident_management'],
          retentionPeriod: '7_years',
          archived: false
        }

        auditEvents.set(updateEvent.id, updateEvent)

        return NextResponse.json({
          success: true,
          eventId,
          updates: {
            severity: auditEvent.severity,
            outcome: auditEvent.outcome,
            riskLevel: auditEvent.riskLevel
          },
          message: 'Audit event updated successfully'
        })

      } catch (error) {
        console.error('Audit event update error:', error)
        return NextResponse.json(
          { error: 'Failed to update audit event' },
          { status: 500 }
        )
      }
    })
  )
)

// Helper functions
function calculateRiskLevel(eventType: string, severity: string, outcome: string): number {
  let risk = 1

  // Base risk by event type
  const eventRisk = {
    security_event: 6,
    data_access: 4,
    configuration_change: 5,
    user_action: 2,
    system_event: 3
  }
  risk += eventRisk[eventType as keyof typeof eventRisk] || 2

  // Severity multiplier
  const severityMultiplier = {
    low: 1,
    medium: 1.5,
    high: 2,
    critical: 3
  }
  risk *= severityMultiplier[severity as keyof typeof severityMultiplier] || 1

  // Outcome modifier
  if (outcome === 'failure') risk += 2
  if (outcome === 'warning') risk += 1

  return Math.min(Math.round(risk), 10)
}

function calculateRetentionPeriod(eventType: string, severity: string): string {
  // Critical security events: 7 years
  if (severity === 'critical' || eventType === 'security_event') {
    return '7_years'
  }
  
  // High severity or data access: 3 years
  if (severity === 'high' || eventType === 'data_access') {
    return '3_years'
  }
  
  // Default: 1 year
  return '1_year'
}

function generateAuditAnalytics(events: AuditEvent[]) {
  const total = events.length
  const last24h = events.filter(e => 
    new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length
  
  const byType = events.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const bySeverity = events.reduce((acc, event) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const failures = events.filter(e => e.outcome === 'failure').length
  const highRiskEvents = events.filter(e => e.riskLevel >= 7).length
  const avgRiskLevel = events.reduce((sum, e) => sum + e.riskLevel, 0) / (total || 1)

  return {
    totalEvents: total,
    eventsLast24h: last24h,
    eventsByType: byType,
    eventsBySeverity: bySeverity,
    failureRate: total > 0 ? Math.round((failures / total) * 100) : 0,
    highRiskEvents,
    averageRiskLevel: Math.round(avgRiskLevel * 10) / 10,
    complianceScore: calculateComplianceScore(events)
  }
}

function calculateComplianceScore(events: AuditEvent[]): number {
  if (events.length === 0) return 100

  const criticalFailures = events.filter(e => 
    e.severity === 'critical' && e.outcome === 'failure'
  ).length
  
  const highRiskEvents = events.filter(e => e.riskLevel >= 8).length
  
  // Start with perfect score and deduct for issues
  let score = 100
  score -= criticalFailures * 10 // -10 points per critical failure
  score -= highRiskEvents * 5   // -5 points per high risk event
  
  return Math.max(score, 0)
}

async function createSecurityIncident(auditEvent: AuditEvent) {
  const incidentId = generateSecureToken(16)
  
  const incident: SecurityIncident = {
    id: incidentId,
    title: `High Risk Event: ${auditEvent.action}`,
    description: `Automatically created from audit event ${auditEvent.id}`,
    severity: auditEvent.severity as any,
    status: 'open',
    detectedDate: auditEvent.timestamp,
    reportedBy: 'System',
    affectedSystems: [auditEvent.resource],
    affectedUsers: auditEvent.userId ? [auditEvent.userId] : [],
    remedationSteps: [],
    preventiveActions: [],
    complianceImpact: auditEvent.complianceCategory,
    estimatedImpact: 'Under investigation'
  }

  securityIncidents.set(incidentId, incident)
  
  console.log(`🚨 Security Incident Created:`, {
    incidentId,
    auditEventId: auditEvent.id,
    severity: incident.severity,
    riskLevel: auditEvent.riskLevel
  })
}