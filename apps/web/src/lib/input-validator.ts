/**
 * CRITICAL INPUT VALIDATION - ACTUALLY INTEGRATED
 * 
 * This validator is used in ALL API endpoints to prevent injection attacks
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  sanitizedValue?: any
  securityThreats?: string[]
}

// Security threat patterns
const SECURITY_PATTERNS = {
  XSS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi
  ],
  SQL_INJECTION: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(;|--|\||\/\*|\*\/)/g,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi
  ],
  COMMAND_INJECTION: [
    /[;&|`$(){}[\]\\]/g,
    /\$\(/g,
    /`.*`/g
  ]
}

export class InputValidator {
  
  static validate(input: any): ValidationResult {
    const errors: string[] = []
    const securityThreats: string[] = []
    
    if (!input) {
      return { isValid: true, errors, sanitizedValue: input, securityThreats }
    }
    
    const stringValue = String(input)
    
    // Check for security threats
    if (SECURITY_PATTERNS.XSS.some(pattern => pattern.test(stringValue))) {
      securityThreats.push('XSS_ATTEMPT')
    }
    
    if (SECURITY_PATTERNS.SQL_INJECTION.some(pattern => pattern.test(stringValue))) {
      securityThreats.push('SQL_INJECTION_ATTEMPT')
    }
    
    if (SECURITY_PATTERNS.COMMAND_INJECTION.some(pattern => pattern.test(stringValue))) {
      securityThreats.push('COMMAND_INJECTION_ATTEMPT')
    }
    
    // Sanitize input
    const sanitized = stringValue
      .replace(/<[^>]*>/g, '') // Remove HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
    
    return {
      isValid: securityThreats.length === 0,
      errors,
      sanitizedValue: sanitized,
      securityThreats
    }
  }
  
  static validateObject(obj: Record<string, any>): {
    isValid: boolean
    errors: Record<string, string[]>
    sanitizedData: Record<string, any>
    securityThreats: string[]
  } {
    const errors: Record<string, string[]> = {}
    const sanitizedData: Record<string, any> = {}
    const allSecurityThreats: string[] = []
    
    for (const [field, value] of Object.entries(obj)) {
      const result = this.validate(value)
      
      if (!result.isValid) {
        errors[field] = result.errors
      }
      
      if (result.securityThreats && result.securityThreats.length > 0) {
        allSecurityThreats.push(...result.securityThreats.map(threat => `${field}: ${threat}`))
      }
      
      sanitizedData[field] = result.sanitizedValue
    }
    
    return {
      isValid: Object.keys(errors).length === 0 && allSecurityThreats.length === 0,
      errors,
      sanitizedData,
      securityThreats: allSecurityThreats
    }
  }
}

export default InputValidator
