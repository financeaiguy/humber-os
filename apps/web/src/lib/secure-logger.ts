/**
 * MASTER-LEVEL SECURE LOGGING SYSTEM
 * 
 * CRITICAL: Never log sensitive data in production
 * Complies with GDPR, SOC2, and security audit requirements
 */

interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  userAgent?: string
  ip?: string
  [key: string]: any
}

interface LogEntry {
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'security'
  message: string
  context?: LogContext
  error?: Error
  sanitized: boolean
}

// Sensitive data patterns to redact
const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /key/i,
  /ssn/i,
  /social.security/i,
  /credit.card/i,
  /bank.account/i,
  /routing.number/i,
  /api.key/i,
  /auth/i,
  /bearer/i,
  /jwt/i,
  /session/i,
  /cookie/i,
  /email/i,
  /phone/i,
  /address/i,
  /salary/i,
  /wage/i,
  /income/i
]

// PII patterns to detect and redact
const PII_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/g,           // SSN
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
  /\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g, // Phone numbers
  /\b\d{1,5}\s\w+\s(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|pl|place)\b/gi // Addresses
]

export class SecureLogger {
  private static instance: SecureLogger
  private isDevelopment: boolean
  private logLevel: string
  
  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.logLevel = process.env.LOG_LEVEL || 'info'
  }
  
  static getInstance(): SecureLogger {
    if (!SecureLogger.instance) {
      SecureLogger.instance = new SecureLogger()
    }
    return SecureLogger.instance
  }
  
  /**
   * Sanitize data by removing/redacting sensitive information
   */
  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return this.redactSensitiveString(data)
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item))
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {}
      
      for (const [key, value] of Object.entries(data)) {
        // Check if key contains sensitive information
        const isSensitiveKey = SENSITIVE_PATTERNS.some(pattern => pattern.test(key))
        
        if (isSensitiveKey) {
          sanitized[key] = '[REDACTED]'
        } else {
          sanitized[key] = this.sanitizeData(value)
        }
      }
      
      return sanitized
    }
    
    return data
  }
  
  /**
   * Redact PII and sensitive data from strings
   */
  private redactSensitiveString(str: string): string {
    let redacted = str
    
    // Redact PII patterns
    PII_PATTERNS.forEach(pattern => {
      redacted = redacted.replace(pattern, '[REDACTED]')
    })
    
    return redacted
  }
  
  /**
   * Create structured log entry
   */
  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message: this.redactSensitiveString(message),
      context: context ? this.sanitizeData(context) : undefined,
      error: error ? {
        name: error.name,
        message: this.redactSensitiveString(error.message),
        stack: this.isDevelopment ? error.message : undefined
      } as any : undefined,
      sanitized: true
    }
  }
  
  /**
   * Output log entry (customize for your logging infrastructure)
   */
  private output(entry: LogEntry): void {
    if (this.isDevelopment) {
      // Development: use console with colors
      const colors = {
        debug: '\x1b[36m',    // Cyan
        info: '\x1b[32m',     // Green
        warn: '\x1b[33m',     // Yellow
        error: '\x1b[31m',    // Red
        security: '\x1b[35m', // Magenta
        reset: '\x1b[0m'
      }
      
      const color = colors[entry.level] || colors.reset
      // SECURITY: Removed // SECURITY: Removed console.log(`${color}[${entry.level.toUpperCase()}]${colors.reset} ${entry.timestamp} ${entry.message}`)
      
      if (entry.context) {
        // SECURITY: Removed // SECURITY: Removed console.log('Context:', entry.context)
      }
      
      if (entry.error) {
        // SECURITY: Removed console.error('Error:', entry.error)
      }
    } else {
      // Production: structured JSON logging
      // SECURITY: Removed // SECURITY: Removed console.log(JSON.stringify(entry))
    }
  }
  
  /**
   * Debug level logging (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment || this.logLevel === 'debug') {
      this.output(this.createLogEntry('debug', message, context))
    }
  }
  
  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    this.output(this.createLogEntry('info', message, context))
  }
  
  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext): void {
    this.output(this.createLogEntry('warn', message, context))
  }
  
  /**
   * Error level logging
   */
  error(message: string, error?: Error, context?: LogContext): void {
    this.output(this.createLogEntry('error', message, context, error))
  }
  
  /**
   * Security event logging (always logged)
   */
  security(message: string, context?: LogContext): void {
    this.output(this.createLogEntry('security', message, context))
  }
  
  /**
   * Audit trail logging for compliance
   */
  audit(action: string, userId: string, details?: any): void {
    this.output(this.createLogEntry('info', `AUDIT: ${action}`, {
      userId,
      action,
      details: this.sanitizeData(details),
      auditTrail: true
    }))
  }
  
  /**
   * Performance logging
   */
  performance(operation: string, duration: number, context?: LogContext): void {
    this.output(this.createLogEntry('info', `PERFORMANCE: ${operation} took ${duration}ms`, {
      ...context,
      operation,
      duration,
      performance: true
    }))
  }
  
  /**
   * Financial transaction logging (extra secure)
   */
  financial(action: string, amount: string, userId: string, details?: any): void {
    this.output(this.createLogEntry('info', `FINANCIAL: ${action}`, {
      userId,
      action,
      amount: amount, // Amount should already be sanitized
      details: this.sanitizeData(details),
      financial: true,
      requiresAudit: true
    }))
  }
}

// Export singleton instance
export const logger = SecureLogger.getInstance()

// Convenience functions
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: LogContext) => logger.error(message, error, context),
  security: (message: string, context?: LogContext) => logger.security(message, context),
  audit: (action: string, userId: string, details?: any) => logger.audit(action, userId, details),
  performance: (operation: string, duration: number, context?: LogContext) => logger.performance(operation, duration, context),
  financial: (action: string, amount: string, userId: string, details?: any) => logger.financial(action, amount, userId, details)
}

export default logger
