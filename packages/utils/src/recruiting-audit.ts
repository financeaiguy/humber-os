import type { D1Database } from '@cloudflare/workers-types'
import { SENSITIVE_RECRUIT_FIELDS, type PIIField } from './recruiting-encryption'

export interface AuditContext {
  userId: string
  tenantId: string
  userRole?: string
  ipAddress?: string
  userAgent?: string
  endpoint?: string
  requestId?: string
}

export interface RecruitingAuditEvent {
  eventType: 'CREATE' | 'UPDATE' | 'VIEW' | 'DELETE' | 'EXPORT' | 'ANONYMIZE' | 'CONSENT_GIVEN' | 'CONSENT_WITHDRAWN'
  recruitId?: string
  actionDescription: string
  affectedFields?: string[]
  sensitiveDataAccessed?: boolean
  piiFieldsAccessed?: PIIField[]
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests'
  processingPurpose: string
  result: 'success' | 'failure' | 'partial'
  errorCode?: string
  errorMessage?: string
  retentionCategory?: 'operational' | 'legal_hold' | 'investigation'
  metadata?: Record<string, any>
}

export class RecruitingAuditLogger {
  constructor(private db: D1Database) {}

  /**
   * Log a recruiting audit event for GDPR/CCPA compliance
   */
  async logEvent(event: RecruitingAuditEvent, context: AuditContext): Promise<string> {
    const eventId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const timestamp = Date.now()

    try {
      await this.db
        .prepare(`
          INSERT INTO recruiting_audit_log (
            id, tenant_id, recruit_id, event_type, action_description,
            user_id, user_role, ip_address, user_agent,
            affected_fields, sensitive_data_accessed, pii_fields_accessed,
            legal_basis, processing_purpose,
            result, error_code, error_message,
            retention_category, event_timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          eventId,
          context.tenantId,
          event.recruitId || null,
          event.eventType,
          event.actionDescription,
          context.userId,
          context.userRole || null,
          context.ipAddress || null,
          context.userAgent || null,
          event.affectedFields ? JSON.stringify(event.affectedFields) : null,
          event.sensitiveDataAccessed ? 1 : 0,
          event.piiFieldsAccessed ? JSON.stringify(event.piiFieldsAccessed) : null,
          event.legalBasis,
          event.processingPurpose,
          event.result,
          event.errorCode || null,
          event.errorMessage || null,
          event.retentionCategory || 'operational',
          timestamp
        )
        .run()

      return eventId
    } catch (error) {
      // Critical: audit logging must not fail silently
      console.error('CRITICAL: Audit logging failed:', error)
      throw new Error(`Audit logging failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Log recruit creation with full compliance tracking
   */
  async logRecruitCreation(
    recruitId: string,
    recruitData: any,
    context: AuditContext
  ): Promise<string> {
    const piiFields = SENSITIVE_RECRUIT_FIELDS.filter(field => recruitData[field])
    
    return this.logEvent({
      eventType: 'CREATE',
      recruitId,
      actionDescription: `Created new recruit record: ${recruitData.firstName} ${recruitData.lastName}`,
      affectedFields: Object.keys(recruitData),
      sensitiveDataAccessed: true,
      piiFieldsAccessed: piiFields,
      legalBasis: 'legitimate_interests', // Recruitment is legitimate business interest
      processingPurpose: 'Candidate recruitment and evaluation for employment opportunities',
      result: 'success',
      metadata: {
        source: recruitData.source,
        jobTitle: recruitData.jobTitle,
        workAuthorization: recruitData.workAuthorization
      }
    }, context)
  }

  /**
   * Log recruit data access/viewing
   */
  async logRecruitView(
    recruitId: string,
    fieldsAccessed: string[],
    context: AuditContext
  ): Promise<string> {
    const piiFields = SENSITIVE_RECRUIT_FIELDS.filter(field => 
      fieldsAccessed.includes(field) || fieldsAccessed.includes(`${field}_encrypted`)
    )

    return this.logEvent({
      eventType: 'VIEW',
      recruitId,
      actionDescription: `Accessed recruit record data`,
      affectedFields: fieldsAccessed,
      sensitiveDataAccessed: piiFields.length > 0,
      piiFieldsAccessed: piiFields,
      legalBasis: 'legitimate_interests',
      processingPurpose: 'Candidate evaluation and recruitment management',
      result: 'success'
    }, context)
  }

  /**
   * Log recruit data updates
   */
  async logRecruitUpdate(
    recruitId: string,
    updatedFields: string[],
    oldData: any,
    newData: any,
    context: AuditContext
  ): Promise<string> {
    const piiFields = SENSITIVE_RECRUIT_FIELDS.filter(field => updatedFields.includes(field))

    return this.logEvent({
      eventType: 'UPDATE',
      recruitId,
      actionDescription: `Updated recruit record fields: ${updatedFields.join(', ')}`,
      affectedFields: updatedFields,
      sensitiveDataAccessed: piiFields.length > 0,
      piiFieldsAccessed: piiFields,
      legalBasis: 'legitimate_interests',
      processingPurpose: 'Maintaining accurate candidate information for recruitment',
      result: 'success',
      metadata: {
        changedFields: updatedFields.reduce((acc, field) => {
          acc[field] = {
            oldValue: oldData[field] ? '[REDACTED]' : null,
            newValue: newData[field] ? '[REDACTED]' : null,
            changed: oldData[field] !== newData[field]
          }
          return acc
        }, {} as Record<string, any>)
      }
    }, context)
  }

  /**
   * Log consent events (GDPR Article 7)
   */
  async logConsentEvent(
    recruitId: string,
    consentType: 'privacy' | 'data_processing' | 'marketing' | 'biometric',
    consentGiven: boolean,
    consentVersion: string,
    context: AuditContext
  ): Promise<string> {
    return this.logEvent({
      eventType: consentGiven ? 'CONSENT_GIVEN' : 'CONSENT_WITHDRAWN',
      recruitId,
      actionDescription: `${consentGiven ? 'Granted' : 'Withdrew'} ${consentType} consent (v${consentVersion})`,
      affectedFields: [`${consentType}_consent`],
      sensitiveDataAccessed: false,
      legalBasis: 'consent',
      processingPurpose: 'Consent management for data processing compliance',
      result: 'success',
      metadata: {
        consentType,
        consentVersion,
        consentGiven,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    }, context)
  }

  /**
   * Log data anonymization (GDPR Article 17)
   */
  async logDataAnonymization(
    recruitId: string,
    reason: string,
    context: AuditContext
  ): Promise<string> {
    return this.logEvent({
      eventType: 'ANONYMIZE',
      recruitId,
      actionDescription: `Anonymized recruit data: ${reason}`,
      affectedFields: [...SENSITIVE_RECRUIT_FIELDS],
      sensitiveDataAccessed: true,
      piiFieldsAccessed: [...SENSITIVE_RECRUIT_FIELDS],
      legalBasis: 'legal_obligation',
      processingPurpose: 'Data anonymization for privacy compliance',
      result: 'success',
      retentionCategory: 'operational',
      metadata: {
        anonymizationReason: reason,
        originalDataRetained: false
      }
    }, context)
  }

  /**
   * Log data export (GDPR Article 15 - Right of Access)
   */
  async logDataExport(
    recruitId: string,
    exportedFields: string[],
    exportFormat: 'json' | 'pdf' | 'csv',
    context: AuditContext
  ): Promise<string> {
    const piiFields = SENSITIVE_RECRUIT_FIELDS.filter(field => exportedFields.includes(field))

    return this.logEvent({
      eventType: 'EXPORT',
      recruitId,
      actionDescription: `Exported recruit data in ${exportFormat} format`,
      affectedFields: exportedFields,
      sensitiveDataAccessed: piiFields.length > 0,
      piiFieldsAccessed: piiFields,
      legalBasis: 'legal_obligation',
      processingPurpose: 'Data portability compliance - subject access request',
      result: 'success',
      metadata: {
        exportFormat,
        exportedFieldCount: exportedFields.length,
        piiFieldCount: piiFields.length
      }
    }, context)
  }

  /**
   * Log security events
   */
  async logSecurityEvent(
    eventType: 'rate_limit_exceeded' | 'invalid_input' | 'unauthorized_access' | 'data_breach_attempt',
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: {
      attackVector?: string
      blocked?: boolean
      dataAccessed?: boolean
      piiExposed?: boolean
      recordsAffected?: number
      mitigationAction?: string
    },
    context: AuditContext
  ): Promise<string> {
    const eventId = `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const timestamp = Date.now()

    try {
      await this.db
        .prepare(`
          INSERT INTO recruiting_security_events (
            id, tenant_id, event_type, severity,
            ip_address, user_agent, user_id, endpoint,
            attack_vector, blocked, data_accessed, pii_exposed, records_affected,
            mitigation_action, detected_at, metadata
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          eventId,
          context.tenantId,
          eventType,
          severity,
          context.ipAddress || null,
          context.userAgent || null,
          context.userId || null,
          context.endpoint || null,
          details.attackVector || null,
          details.blocked ? 1 : 0,
          details.dataAccessed ? 1 : 0,
          details.piiExposed ? 1 : 0,
          details.recordsAffected || 0,
          details.mitigationAction || null,
          timestamp,
          JSON.stringify(details)
        )
        .run()

      return eventId
    } catch (error) {
      console.error('CRITICAL: Security event logging failed:', error)
      throw new Error(`Security event logging failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get audit trail for a specific recruit (GDPR Article 15)
   */
  async getRecruitAuditTrail(recruitId: string, tenantId: string): Promise<any[]> {
    try {
      const result = await this.db
        .prepare(`
          SELECT 
            id, event_type, action_description, user_id, user_role,
            ip_address, affected_fields, sensitive_data_accessed, pii_fields_accessed,
            legal_basis, processing_purpose, result, event_timestamp,
            retention_category
          FROM recruiting_audit_log 
          WHERE recruit_id = ? AND tenant_id = ?
          ORDER BY event_timestamp DESC
        `)
        .bind(recruitId, tenantId)
        .all()

      return result.results || []
    } catch (error) {
      console.error('Failed to retrieve audit trail:', error)
      throw new Error('Failed to retrieve audit trail')
    }
  }

  /**
   * Get compliance report for GDPR/CCPA audits
   */
  async getComplianceReport(tenantId: string, startDate: number, endDate: number): Promise<{
    totalEvents: number
    eventsByType: Record<string, number>
    sensitiveDataAccess: number
    consentEvents: number
    dataExports: number
    securityEvents: number
    piiProcessingActivities: Array<{
      purpose: string
      legalBasis: string
      eventCount: number
      lastProcessed: number
    }>
  }> {
    try {
      // Get basic statistics
      const statsResult = await this.db
        .prepare(`
          SELECT 
            COUNT(*) as total_events,
            SUM(CASE WHEN sensitive_data_accessed = 1 THEN 1 ELSE 0 END) as sensitive_access,
            SUM(CASE WHEN event_type IN ('CONSENT_GIVEN', 'CONSENT_WITHDRAWN') THEN 1 ELSE 0 END) as consent_events,
            SUM(CASE WHEN event_type = 'EXPORT' THEN 1 ELSE 0 END) as data_exports
          FROM recruiting_audit_log 
          WHERE tenant_id = ? AND event_timestamp BETWEEN ? AND ?
        `)
        .bind(tenantId, startDate, endDate)
        .first()

      // Get events by type
      const eventTypesResult = await this.db
        .prepare(`
          SELECT event_type, COUNT(*) as count
          FROM recruiting_audit_log 
          WHERE tenant_id = ? AND event_timestamp BETWEEN ? AND ?
          GROUP BY event_type
        `)
        .bind(tenantId, startDate, endDate)
        .all()

      // Get PII processing activities
      const piiActivitiesResult = await this.db
        .prepare(`
          SELECT 
            processing_purpose, legal_basis, 
            COUNT(*) as event_count,
            MAX(event_timestamp) as last_processed
          FROM recruiting_audit_log 
          WHERE tenant_id = ? AND event_timestamp BETWEEN ? AND ? AND sensitive_data_accessed = 1
          GROUP BY processing_purpose, legal_basis
          ORDER BY event_count DESC
        `)
        .bind(tenantId, startDate, endDate)
        .all()

      // Get security events count
      const securityEventsResult = await this.db
        .prepare(`
          SELECT COUNT(*) as security_events
          FROM recruiting_security_events 
          WHERE tenant_id = ? AND detected_at BETWEEN ? AND ?
        `)
        .bind(tenantId, startDate, endDate)
        .first()

      const eventsByType = (eventTypesResult.results || []).reduce((acc: Record<string, number>, row: any) => {
        acc[row.event_type] = row.count
        return acc
      }, {})

      return {
        totalEvents: statsResult?.total_events || 0,
        eventsByType,
        sensitiveDataAccess: statsResult?.sensitive_access || 0,
        consentEvents: statsResult?.consent_events || 0,
        dataExports: statsResult?.data_exports || 0,
        securityEvents: securityEventsResult?.security_events || 0,
        piiProcessingActivities: (piiActivitiesResult.results || []).map((row: any) => ({
          purpose: row.processing_purpose,
          legalBasis: row.legal_basis,
          eventCount: row.event_count,
          lastProcessed: row.last_processed
        }))
      }
    } catch (error) {
      console.error('Failed to generate compliance report:', error)
      throw new Error('Failed to generate compliance report')
    }
  }
}

// Utility functions
export function createAuditContext(
  userId: string,
  tenantId: string,
  request?: Request,
  additionalContext?: Partial<AuditContext>
): AuditContext {
  return {
    userId,
    tenantId,
    userRole: additionalContext?.userRole,
    ipAddress: request?.headers.get('CF-Connecting-IP') || request?.headers.get('X-Forwarded-For') || additionalContext?.ipAddress,
    userAgent: request?.headers.get('User-Agent') || additionalContext?.userAgent,
    endpoint: request?.url || additionalContext?.endpoint,
    requestId: additionalContext?.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export function shouldLogPIIAccess(fields: string[]): boolean {
  return fields.some(field => 
    SENSITIVE_RECRUIT_FIELDS.includes(field as PIIField) || 
    SENSITIVE_RECRUIT_FIELDS.some(piiField => field.includes(piiField))
  )
}
