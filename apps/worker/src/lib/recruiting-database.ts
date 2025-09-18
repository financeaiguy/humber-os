import type { D1Database } from '@cloudflare/workers-types'
import { RecruitingEncryption } from '@humber/utils/recruiting-encryption'
import { RecruitingAuditLogger, type AuditContext } from '@humber/utils/recruiting-audit'
import { RecruitingSecurity } from '@humber/utils/recruiting-security'
import { 
  RecruitingError, 
  RECRUITING_ERROR_CODES,
  type RecruitData, 
  type RecruitRecord, 
  type RecruitStatus,
  type RecruitSearchParams,
  type ConsentRecord
} from '@humber/utils/recruiting-types'

export interface DatabaseConfig {
  encryptionKey: string
  auditingEnabled: boolean
  retentionEnabled: boolean
}

export class RecruitingDatabase {
  private encryption: RecruitingEncryption
  private auditLogger: RecruitingAuditLogger
  
  constructor(
    private db: D1Database,
    private config: DatabaseConfig
  ) {
    this.encryption = new RecruitingEncryption(config.encryptionKey)
    this.auditLogger = new RecruitingAuditLogger(db)
  }

  /**
   * Create a new recruit with full compliance and security
   */
  async createRecruit(
    recruitData: RecruitData,
    context: AuditContext
  ): Promise<{ recruitId: string; status: string }> {
    try {
      // 1. Sanitize input data
      const sanitizedData = RecruitingSecurity.sanitizeRecruitData(recruitData)
      
      // 2. Validate sanitized data
      const validation = RecruitingSecurity.validateSecureInput(sanitizedData)
      if (!validation.isValid) {
        throw new RecruitingError(
          'Input validation failed',
          RECRUITING_ERROR_CODES.VALIDATION_FAILED,
          400,
          validation.errors
        )
      }

      // 3. Check for duplicate email
      const emailHash = this.encryption.createSearchableHash(sanitizedData.email!)
      const existingRecruit = await this.db
        .prepare('SELECT id FROM recruits WHERE email_hash = ? AND tenant_id = ?')
        .bind(emailHash, context.tenantId)
        .first()

      if (existingRecruit) {
        throw new RecruitingError(
          'Email already exists in system',
          RECRUITING_ERROR_CODES.DUPLICATE_EMAIL,
          409
        )
      }

      // 4. Generate secure recruit ID
      const recruitId = RecruitingSecurity.generateSecureRecruitId()

      // 5. Encrypt PII data
      const encryptedData = this.encryption.encryptRecruitData(sanitizedData)

      // 6. Prepare database record
      const timestamp = Date.now()
      const dbRecord = {
        id: recruitId,
        tenant_id: context.tenantId,
        
        // Encrypted PII
        first_name_encrypted: encryptedData.firstName_encrypted,
        last_name_encrypted: encryptedData.lastName_encrypted,
        email_encrypted: encryptedData.email_encrypted,
        phone_encrypted: encryptedData.phone_encrypted || null,
        current_location_encrypted: encryptedData.currentLocation_encrypted,
        
        // Searchable hashes
        email_hash: encryptedData.email_hash,
        phone_hash: encryptedData.phone_hash || null,
        
        // Non-PII data
        job_title: sanitizedData.jobTitle!,
        years_experience: sanitizedData.yearsExperience!,
        current_company: sanitizedData.currentCompany || null,
        desired_salary: sanitizedData.desiredSalary || null,
        skills: JSON.stringify(sanitizedData.skills || []),
        education: sanitizedData.education || null,
        certifications: JSON.stringify(sanitizedData.certifications || []),
        
        // Availability
        available_start_date: sanitizedData.availableStartDate!,
        work_authorization: sanitizedData.workAuthorization!,
        willing_to_relocate: sanitizedData.willingToRelocate ? 1 : 0,
        travel_willingness: sanitizedData.travelWillingness!,
        
        // Source
        source: sanitizedData.source!,
        recruiter_name: sanitizedData.recruiterName || null,
        recruiter_agency: sanitizedData.recruiterAgency || null,
        notes: sanitizedData.notes || null,
        
        // Status and consent
        status: 'sourced' as RecruitStatus,
        privacy_consent_given: 1, // Required for processing
        privacy_consent_date: timestamp,
        privacy_consent_version: '1.0',
        data_processing_consent: 1,
        marketing_consent: 0,
        biometric_consent: 0,
        
        // Data retention
        retention_period: 365, // 1 year default
        deletion_scheduled_date: timestamp + (365 * 24 * 60 * 60 * 1000),
        anonymized: 0,
        
        // Audit
        created_by: context.userId,
        created_at: timestamp,
        updated_at: timestamp
      }

      // 7. Insert into database
      await this.db
        .prepare(`
          INSERT INTO recruits (
            id, tenant_id,
            first_name_encrypted, last_name_encrypted, email_encrypted, 
            phone_encrypted, current_location_encrypted,
            email_hash, phone_hash,
            job_title, years_experience, current_company, desired_salary,
            skills, education, certifications,
            available_start_date, work_authorization, willing_to_relocate, travel_willingness,
            source, recruiter_name, recruiter_agency, notes,
            status, privacy_consent_given, privacy_consent_date, privacy_consent_version,
            data_processing_consent, marketing_consent, biometric_consent,
            retention_period, deletion_scheduled_date, anonymized,
            created_by, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          dbRecord.id, dbRecord.tenant_id,
          dbRecord.first_name_encrypted, dbRecord.last_name_encrypted, dbRecord.email_encrypted,
          dbRecord.phone_encrypted, dbRecord.current_location_encrypted,
          dbRecord.email_hash, dbRecord.phone_hash,
          dbRecord.job_title, dbRecord.years_experience, dbRecord.current_company, dbRecord.desired_salary,
          dbRecord.skills, dbRecord.education, dbRecord.certifications,
          dbRecord.available_start_date, dbRecord.work_authorization, dbRecord.willing_to_relocate, dbRecord.travel_willingness,
          dbRecord.source, dbRecord.recruiter_name, dbRecord.recruiter_agency, dbRecord.notes,
          dbRecord.status, dbRecord.privacy_consent_given, dbRecord.privacy_consent_date, dbRecord.privacy_consent_version,
          dbRecord.data_processing_consent, dbRecord.marketing_consent, dbRecord.biometric_consent,
          dbRecord.retention_period, dbRecord.deletion_scheduled_date, dbRecord.anonymized,
          dbRecord.created_by, dbRecord.created_at, dbRecord.updated_at
        )
        .run()

      // 8. Create consent records
      await this.createConsentRecord({
        recruit_id: recruitId,
        tenant_id: context.tenantId,
        consent_type: 'privacy',
        consent_given: 1,
        consent_version: '1.0',
        consent_text: 'I consent to the processing of my personal data for recruitment purposes',
        purpose_specification: 'Candidate recruitment and evaluation',
        data_categories: JSON.stringify(['personal_data', 'professional_data']),
        processing_activities: JSON.stringify(['recruitment', 'evaluation', 'communication']),
        retention_period: 365,
        opt_in_method: 'web_form',
        ip_address: context.ipAddress,
        user_agent: context.userAgent,
        consent_date: timestamp
      })

      // 9. Create data retention record
      await this.createRetentionRecord(recruitId, context.tenantId, 'active_recruitment')

      // 10. Log audit event
      if (this.config.auditingEnabled) {
        await this.auditLogger.logRecruitCreation(recruitId, sanitizedData, context)
      }

      return {
        recruitId,
        status: 'sourced'
      }

    } catch (error) {
      if (error instanceof RecruitingError) {
        throw error
      }
      
      // SECURITY: Removed console.error('Database error creating recruit:', error)
      throw new RecruitingError(
        'Failed to create recruit',
        RECRUITING_ERROR_CODES.INTERNAL_ERROR,
        500
      )
    }
  }

  /**
   * Get recruits with decryption and audit logging
   */
  async getRecruits(
    params: RecruitSearchParams,
    context: AuditContext
  ): Promise<{ recruits: RecruitData[]; total: number }> {
    try {
      // Build query with filters
      let query = `
        SELECT * FROM recruits 
        WHERE tenant_id = ? AND anonymized = 0
      `
      const bindings: any[] = [context.tenantId]

      // Add filters
      if (params.status && params.status.length > 0) {
        const statusPlaceholders = params.status.map(() => '?').join(',')
        query += ` AND status IN (${statusPlaceholders})`
        bindings.push(...params.status)
      }

      if (params.workAuthorization && params.workAuthorization.length > 0) {
        const authPlaceholders = params.workAuthorization.map(() => '?').join(',')
        query += ` AND work_authorization IN (${authPlaceholders})`
        bindings.push(...params.workAuthorization)
      }

      if (params.experienceMin !== undefined) {
        query += ` AND years_experience >= ?`
        bindings.push(params.experienceMin)
      }

      if (params.experienceMax !== undefined) {
        query += ` AND years_experience <= ?`
        bindings.push(params.experienceMax)
      }

      if (params.dateRange) {
        const startDate = new Date(params.dateRange.start).getTime()
        const endDate = new Date(params.dateRange.end).getTime()
        query += ` AND created_at BETWEEN ? AND ?`
        bindings.push(startDate, endDate)
      }

      // Add sorting - SECURE: Whitelist allowed columns and orders
      const allowedSortColumns = ['created_at', 'updated_at', 'first_name', 'last_name', 'status', 'years_experience']
      const allowedSortOrders = ['asc', 'desc']
      
      const sortBy = allowedSortColumns.includes(params.sortBy) ? params.sortBy : 'created_at'
      const sortOrder = allowedSortOrders.includes(params.sortOrder) ? params.sortOrder : 'desc'
      
      query += ` ORDER BY ${sortBy} ${sortOrder}`

      // Add pagination
      const page = params.page || 1
      const limit = Math.min(params.limit || 10, 100) // Max 100 per page
      const offset = (page - 1) * limit
      query += ` LIMIT ? OFFSET ?`
      bindings.push(limit, offset)

      // Execute query
      const result = await this.db.prepare(query).bind(...bindings).all()
      const records = result.results as RecruitRecord[]

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total FROM recruits 
        WHERE tenant_id = ? AND anonymized = 0
      `
      const countBindings = [context.tenantId]

      // Apply same filters to count query
      if (params.status && params.status.length > 0) {
        const statusPlaceholders = params.status.map(() => '?').join(',')
        countQuery += ` AND status IN (${statusPlaceholders})`
        countBindings.push(...params.status)
      }

      const countResult = await this.db.prepare(countQuery).bind(...countBindings).first()
      const total = countResult?.total || 0

      // Decrypt and transform records
      const recruits: RecruitData[] = []
      for (const record of records) {
        try {
          const decryptedData = this.encryption.decryptRecruitData(record)
          
          recruits.push({
            firstName: decryptedData.firstName,
            lastName: decryptedData.lastName,
            email: decryptedData.email,
            phone: decryptedData.phone,
            currentLocation: decryptedData.currentLocation,
            jobTitle: record.job_title,
            yearsExperience: record.years_experience,
            currentCompany: record.current_company || undefined,
            desiredSalary: record.desired_salary || undefined,
            skills: record.skills ? JSON.parse(record.skills) : [],
            education: record.education || undefined,
            certifications: record.certifications ? JSON.parse(record.certifications) : [],
            availableStartDate: record.available_start_date,
            workAuthorization: record.work_authorization,
            willingToRelocate: record.willing_to_relocate === 1,
            travelWillingness: record.travel_willingness,
            source: record.source,
            recruiterName: record.recruiter_name || undefined,
            recruiterAgency: record.recruiter_agency || undefined,
            notes: record.notes || undefined
          })

          // Log PII access
          if (this.config.auditingEnabled) {
            await this.auditLogger.logRecruitView(
              record.id,
              Object.keys(record),
              context
            )
          }

        } catch (decryptionError) {
          // SECURITY: Removed console.error(`Failed to decrypt recruit ${record.id}:`, decryptionError)
          // Skip corrupted records
        }
      }

      return { recruits, total }

    } catch (error) {
      // SECURITY: Removed console.error('Database error getting recruits:', error)
      throw new RecruitingError(
        'Failed to retrieve recruits',
        RECRUITING_ERROR_CODES.INTERNAL_ERROR,
        500
      )
    }
  }

  /**
   * Move recruit to onboarding with status validation
   */
  async moveRecruitToOnboarding(
    recruitId: string,
    onboardingId: string,
    context: AuditContext
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Get current recruit
      const recruit = await this.db
        .prepare('SELECT * FROM recruits WHERE id = ? AND tenant_id = ?')
        .bind(recruitId, context.tenantId)
        .first() as RecruitRecord

      if (!recruit) {
        throw new RecruitingError(
          'Recruit not found',
          RECRUITING_ERROR_CODES.RECRUIT_NOT_FOUND,
          404
        )
      }

      // 2. Validate status transition
      if (recruit.status !== 'accepted') {
        throw new RecruitingError(
          `Cannot move recruit to onboarding. Current status: ${recruit.status}. Must be 'accepted'.`,
          RECRUITING_ERROR_CODES.INVALID_STATUS_TRANSITION,
          400
        )
      }

      // 3. Update recruit status
      const timestamp = Date.now()
      await this.db
        .prepare(`
          UPDATE recruits 
          SET status = ?, onboarding_id = ?, updated_by = ?, updated_at = ?
          WHERE id = ? AND tenant_id = ?
        `)
        .bind('onboarding', onboardingId, context.userId, timestamp, recruitId, context.tenantId)
        .run()

      // 4. Update retention policy (longer retention for onboarding)
      await this.updateRetentionPolicy(recruitId, context.tenantId, 'completed_hire')

      // 5. Log audit event
      if (this.config.auditingEnabled) {
        await this.auditLogger.logEvent({
          eventType: 'UPDATE',
          recruitId,
          actionDescription: `Moved recruit to onboarding (${onboardingId})`,
          affectedFields: ['status', 'onboarding_id'],
          sensitiveDataAccessed: false,
          legalBasis: 'legitimate_interests',
          processingPurpose: 'Employee onboarding process',
          result: 'success',
          metadata: { onboardingId, oldStatus: recruit.status, newStatus: 'onboarding' }
        }, context)
      }

      // Decrypt name for response message
      const decryptedData = this.encryption.decryptRecruitData(recruit)

      return {
        success: true,
        message: `${decryptedData.firstName} ${decryptedData.lastName} has been moved to onboarding`
      }

    } catch (error) {
      if (error instanceof RecruitingError) {
        throw error
      }
      
      // SECURITY: Removed console.error('Database error moving recruit to onboarding:', error)
      throw new RecruitingError(
        'Failed to move recruit to onboarding',
        RECRUITING_ERROR_CODES.INTERNAL_ERROR,
        500
      )
    }
  }

  /**
   * Create consent record for GDPR compliance
   */
  private async createConsentRecord(consent: Omit<ConsentRecord, 'id'>): Promise<void> {
    const consentId = `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await this.db
      .prepare(`
        INSERT INTO recruiting_consent_records (
          id, recruit_id, tenant_id, consent_type, consent_given, consent_version,
          consent_text, purpose_specification, data_categories, processing_activities,
          retention_period, opt_in_method, ip_address, user_agent, consent_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        consentId, consent.recruit_id, consent.tenant_id, consent.consent_type,
        consent.consent_given, consent.consent_version, consent.consent_text,
        consent.purpose_specification, consent.data_categories, consent.processing_activities,
        consent.retention_period, consent.opt_in_method, consent.ip_address,
        consent.user_agent, consent.consent_date
      )
      .run()
  }

  /**
   * Create data retention record
   */
  private async createRetentionRecord(
    recruitId: string,
    tenantId: string,
    category: 'active_recruitment' | 'completed_hire' | 'rejected_candidate' | 'legal_hold'
  ): Promise<void> {
    const retentionId = `retention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const timestamp = Date.now()
    
    const retentionPeriods = {
      active_recruitment: 365,
      completed_hire: 2555, // 7 years
      rejected_candidate: 90,
      legal_hold: -1 // Indefinite
    }
    
    const retentionDays = retentionPeriods[category]
    const scheduledDeletion = retentionDays === -1 ? -1 : timestamp + (retentionDays * 24 * 60 * 60 * 1000)

    await this.db
      .prepare(`
        INSERT INTO recruiting_data_retention (
          id, recruit_id, tenant_id, retention_category, retention_period_days,
          legal_basis, scheduled_deletion_date, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        retentionId, recruitId, tenantId, category, retentionDays,
        'legitimate_interests', scheduledDeletion, timestamp, timestamp
      )
      .run()
  }

  /**
   * Update retention policy when recruit status changes
   */
  private async updateRetentionPolicy(
    recruitId: string,
    tenantId: string,
    newCategory: 'active_recruitment' | 'completed_hire' | 'rejected_candidate' | 'legal_hold'
  ): Promise<void> {
    const timestamp = Date.now()
    const retentionPeriods = {
      active_recruitment: 365,
      completed_hire: 2555,
      rejected_candidate: 90,
      legal_hold: -1
    }
    
    const retentionDays = retentionPeriods[newCategory]
    const scheduledDeletion = retentionDays === -1 ? -1 : timestamp + (retentionDays * 24 * 60 * 60 * 1000)

    await this.db
      .prepare(`
        UPDATE recruiting_data_retention 
        SET retention_category = ?, retention_period_days = ?, scheduled_deletion_date = ?, updated_at = ?
        WHERE recruit_id = ? AND tenant_id = ?
      `)
      .bind(newCategory, retentionDays, scheduledDeletion, timestamp, recruitId, tenantId)
      .run()
  }

  /**
   * Anonymize recruit data for GDPR compliance
   */
  async anonymizeRecruit(
    recruitId: string,
    reason: string,
    context: AuditContext
  ): Promise<void> {
    try {
      const recruit = await this.db
        .prepare('SELECT * FROM recruits WHERE id = ? AND tenant_id = ?')
        .bind(recruitId, context.tenantId)
        .first() as RecruitRecord

      if (!recruit) {
        throw new RecruitingError(
          'Recruit not found',
          RECRUITING_ERROR_CODES.RECRUIT_NOT_FOUND,
          404
        )
      }

      // Anonymize the data
      const anonymizedData = this.encryption.anonymizeRecruitData(recruit)
      const timestamp = Date.now()

      await this.db
        .prepare(`
          UPDATE recruits 
          SET first_name_encrypted = ?, last_name_encrypted = ?, email_encrypted = ?,
              phone_encrypted = ?, current_location_encrypted = ?,
              email_hash = ?, phone_hash = ?, anonymized = 1, updated_at = ?
          WHERE id = ? AND tenant_id = ?
        `)
        .bind(
          anonymizedData.first_name_encrypted,
          anonymizedData.last_name_encrypted,
          anonymizedData.email_encrypted,
          anonymizedData.phone_encrypted,
          anonymizedData.current_location_encrypted,
          anonymizedData.email_hash,
          anonymizedData.phone_hash,
          timestamp,
          recruitId,
          context.tenantId
        )
        .run()

      // Log anonymization
      if (this.config.auditingEnabled) {
        await this.auditLogger.logDataAnonymization(recruitId, reason, context)
      }

    } catch (error) {
      if (error instanceof RecruitingError) {
        throw error
      }
      
      // SECURITY: Removed console.error('Database error anonymizing recruit:', error)
      throw new RecruitingError(
        'Failed to anonymize recruit',
        RECRUITING_ERROR_CODES.INTERNAL_ERROR,
        500
      )
    }
  }
}
