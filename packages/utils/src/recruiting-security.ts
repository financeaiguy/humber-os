import type { RecruitData } from './recruiting-types'

// Input sanitization patterns
const HTML_TAG_PATTERN = /<[^>]*>/g
const SCRIPT_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
  /(;|--|\||\/\*|\*\/)/g,
  /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi
]
const XSS_PATTERNS = [
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
  /vbscript:/gi
]

export interface SanitizationOptions {
  maxLength?: number
  allowHtml?: boolean
  preserveNewlines?: boolean
  trimWhitespace?: boolean
}

export class RecruitingSecurity {
  /**
   * Comprehensive input sanitization for recruit data
   */
  static sanitizeInput(input: string, options: SanitizationOptions = {}): string {
    if (!input || typeof input !== 'string') {
      return ''
    }

    let sanitized = input

    // Trim whitespace by default
    if (options.trimWhitespace !== false) {
      sanitized = sanitized.trim()
    }

    // Remove HTML tags unless explicitly allowed
    if (!options.allowHtml) {
      sanitized = sanitized.replace(HTML_TAG_PATTERN, '')
      sanitized = sanitized.replace(SCRIPT_PATTERN, '')
    }

    // Remove XSS attempts
    XSS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '')
    })

    // Remove SQL injection attempts
    SQL_INJECTION_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '')
    })

    // Handle newlines
    if (!options.preserveNewlines) {
      sanitized = sanitized.replace(/[\r\n]/g, ' ')
    }

    // Limit length
    if (options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength)
    }

    // Encode remaining special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')

    return sanitized
  }

  /**
   * Sanitize phone number input
   */
  static sanitizePhone(phone: string): string {
    if (!phone) return ''
    
    // Remove all non-digit characters except +, -, (, ), and spaces
    let sanitized = phone.replace(/[^\d\-\+\(\)\s]/g, '')
    
    // Limit length to reasonable phone number length
    sanitized = sanitized.substring(0, 20)
    
    return sanitized.trim()
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(email: string): string {
    if (!email) return ''
    
    // Basic email sanitization - remove dangerous characters but preserve email format
    let sanitized = email.toLowerCase().trim()
    
    // Remove HTML and script tags
    sanitized = sanitized.replace(HTML_TAG_PATTERN, '')
    sanitized = sanitized.replace(SCRIPT_PATTERN, '')
    
    // Remove XSS attempts
    XSS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '')
    })
    
    // Limit length
    sanitized = sanitized.substring(0, 254) // RFC 5321 limit
    
    return sanitized
  }

  /**
   * Sanitize array of strings (for skills, certifications)
   */
  static sanitizeStringArray(arr: string[], maxItems: number = 50, maxItemLength: number = 100): string[] {
    if (!Array.isArray(arr)) return []
    
    return arr
      .slice(0, maxItems) // Limit number of items
      .map(item => this.sanitizeInput(item, { maxLength: maxItemLength }))
      .filter(item => item.length > 0) // Remove empty items
  }

  /**
   * Comprehensive sanitization of recruit data
   */
  static sanitizeRecruitData(data: Partial<RecruitData>): Partial<RecruitData> {
    const sanitized: Partial<RecruitData> = {}

    // Personal Information
    if (data.firstName) {
      sanitized.firstName = this.sanitizeInput(data.firstName, { maxLength: 50 })
    }
    if (data.lastName) {
      sanitized.lastName = this.sanitizeInput(data.lastName, { maxLength: 50 })
    }
    if (data.email) {
      sanitized.email = this.sanitizeEmail(data.email)
    }
    if (data.phone) {
      sanitized.phone = this.sanitizePhone(data.phone)
    }
    if (data.currentLocation) {
      sanitized.currentLocation = this.sanitizeInput(data.currentLocation, { maxLength: 100 })
    }

    // Professional Information
    if (data.jobTitle) {
      sanitized.jobTitle = this.sanitizeInput(data.jobTitle, { maxLength: 100 })
    }
    if (data.yearsExperience !== undefined) {
      sanitized.yearsExperience = Math.max(0, Math.min(50, Math.floor(data.yearsExperience)))
    }
    if (data.currentCompany) {
      sanitized.currentCompany = this.sanitizeInput(data.currentCompany, { maxLength: 100 })
    }
    if (data.desiredSalary) {
      sanitized.desiredSalary = this.sanitizeInput(data.desiredSalary, { maxLength: 50 })
    }

    // Skills & Education
    if (data.skills) {
      sanitized.skills = this.sanitizeStringArray(data.skills, 20, 50)
    }
    if (data.education) {
      sanitized.education = this.sanitizeInput(data.education, { maxLength: 500 })
    }
    if (data.certifications) {
      sanitized.certifications = this.sanitizeStringArray(data.certifications, 10, 100)
    }

    // Availability
    if (data.availableStartDate) {
      sanitized.availableStartDate = this.sanitizeInput(data.availableStartDate, { maxLength: 20 })
    }
    if (data.workAuthorization) {
      sanitized.workAuthorization = this.sanitizeInput(data.workAuthorization, { maxLength: 50 })
    }
    if (data.willingToRelocate !== undefined) {
      sanitized.willingToRelocate = Boolean(data.willingToRelocate)
    }
    if (data.travelWillingness) {
      sanitized.travelWillingness = this.sanitizeInput(data.travelWillingness, { maxLength: 50 })
    }

    // Recruiting Source
    if (data.source) {
      sanitized.source = this.sanitizeInput(data.source, { maxLength: 100 })
    }
    if (data.recruiterName) {
      sanitized.recruiterName = this.sanitizeInput(data.recruiterName, { maxLength: 100 })
    }
    if (data.recruiterAgency) {
      sanitized.recruiterAgency = this.sanitizeInput(data.recruiterAgency, { maxLength: 100 })
    }
    if (data.notes) {
      sanitized.notes = this.sanitizeInput(data.notes, { 
        maxLength: 2000, 
        preserveNewlines: true 
      })
    }

    return sanitized
  }

  /**
   * Validate recruit data against security rules
   */
  static validateSecureInput(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check for suspicious patterns
    const suspiciousPatterns = [
      { pattern: /<script/gi, message: 'Script tags not allowed' },
      { pattern: /javascript:/gi, message: 'JavaScript URLs not allowed' },
      { pattern: /on\w+\s*=/gi, message: 'Event handlers not allowed' },
      { pattern: /(union|select|insert|delete|drop)\s+/gi, message: 'SQL keywords not allowed' }
    ]

    const checkString = (value: string, fieldName: string) => {
      suspiciousPatterns.forEach(({ pattern, message }) => {
        if (pattern.test(value)) {
          errors.push(`${fieldName}: ${message}`)
        }
      })
    }

    // Check all string fields
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        checkString(value, key)
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'string') {
            checkString(item, `${key}[${index}]`)
          }
        })
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Rate limiting key generation
   */
  static generateRateLimitKey(
    identifier: string, 
    tenantId: string, 
    operation: string = 'recruit'
  ): string {
    return `rate_limit:${operation}:${tenantId}:${identifier}`
  }

  /**
   * Check if input contains potential security threats
   */
  static containsSecurityThreats(input: string): {
    hasThreat: boolean
    threats: string[]
  } {
    const threats: string[] = []

    // Check for XSS
    if (XSS_PATTERNS.some(pattern => pattern.test(input))) {
      threats.push('XSS_ATTEMPT')
    }

    // Check for SQL injection
    if (SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input))) {
      threats.push('SQL_INJECTION_ATTEMPT')
    }

    // Check for path traversal
    if (/\.\.\/|\.\.\\/.test(input)) {
      threats.push('PATH_TRAVERSAL_ATTEMPT')
    }

    // Check for command injection
    if (/[;&|`$(){}[\]\\]/.test(input)) {
      threats.push('COMMAND_INJECTION_ATTEMPT')
    }

    return {
      hasThreat: threats.length > 0,
      threats
    }
  }

  /**
   * Generate secure random ID for recruits
   */
  static generateSecureRecruitId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 15)
    return `rec_${timestamp}_${random}`
  }

  /**
   * Validate file uploads (for future document upload functionality)
   */
  static validateFileUpload(
    filename: string, 
    mimeType: string, 
    size: number
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    // Check file size
    if (size > maxSize) {
      errors.push('File size exceeds 10MB limit')
    }

    // Check MIME type
    if (!allowedTypes.includes(mimeType)) {
      errors.push('File type not allowed')
    }

    // Check filename for suspicious patterns
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.js', '.vbs']
    if (suspiciousExtensions.some(ext => filename.toLowerCase().endsWith(ext))) {
      errors.push('Dangerous file extension detected')
    }

    // Check for path traversal in filename
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      errors.push('Invalid characters in filename')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Rate limiting configuration for recruiting endpoints
export const RECRUITING_RATE_LIMITS = {
  CREATE_RECRUIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 recruits per window
    message: 'Too many recruit submissions. Please wait before adding more.'
  },
  VIEW_RECRUITS: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 views per minute
    message: 'Too many requests. Please slow down.'
  },
  UPDATE_RECRUIT: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10, // 10 updates per 5 minutes
    message: 'Too many updates. Please wait before making more changes.'
  },
  MOVE_TO_ONBOARDING: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // 20 onboarding moves per hour
    message: 'Too many onboarding requests. Please wait before processing more.'
  }
} as const

// Security event types for monitoring
export const SECURITY_EVENT_TYPES = {
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  INVALID_INPUT: 'invalid_input',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  DATA_BREACH_ATTEMPT: 'data_breach_attempt',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  MALICIOUS_FILE_UPLOAD: 'malicious_file_upload'
} as const

export type SecurityEventType = typeof SECURITY_EVENT_TYPES[keyof typeof SECURITY_EVENT_TYPES]
