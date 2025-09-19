/**
 * Enterprise Logging System
 * Provides structured logging with different levels and transports
 */

import { getConfig } from './secure-config'

export type LogLevel = 'error' | 'warn' | 'info' | 'debug'
export type LogContext = Record<string, any>

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: Error
  userId?: string
  sessionId?: string
  requestId?: string
  component?: string
}

class Logger {
  private static instance: Logger
  private logLevel: LogLevel
  private buffer: LogEntry[] = []
  private maxBufferSize = 100
  private flushInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.logLevel = getConfig('monitoring').logLevel
    this.startFlushInterval()
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private startFlushInterval() {
    // Flush logs every 5 seconds (if setInterval is available)
    if (typeof setInterval !== 'undefined') {
      this.flushInterval = setInterval(() => {
        this.flush()
      }, 5000)
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug']
    const currentLevelIndex = levels.indexOf(this.logLevel)
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex <= currentLevelIndex
  }

  private formatLogEntry(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry
    
    const parts = [
      `[${timestamp}]`,
      `[${level.toUpperCase()}]`,
      entry.component ? `[${entry.component}]` : '',
      message
    ].filter(Boolean)

    if (context && Object.keys(context).length > 0) {
      parts.push(`Context: ${JSON.stringify(context)}`)
    }

    if (error) {
      parts.push('Error: An error occurred')
      if (isDevelopment()) {
        parts.push('Stack: [REDACTED]')
      }
    }

    return parts.join(' ')
  }

  private async sendToMonitoring(entries: LogEntry[]) {
    // Send to monitoring service (Sentry, DataDog, etc.)
    const monitoringConfig = getConfig('monitoring')
    
    if (monitoringConfig.sentryDsn) {
      // Send to Sentry
      try {
        // Implementation would go here
      } catch (error) {
        // Fail silently to avoid logging loops
      }
    }

    if (monitoringConfig.datadogApiKey) {
      // Send to DataDog
      try {
        // Implementation would go here
      } catch (error) {
        // Fail silently
      }
    }
  }

  private async writeToFile(entry: LogEntry) {
    // In development, write to console
    if (process.env.NODE_ENV === 'development') {
      const formatted = this.formatLogEntry(entry)
      
      switch (entry.level) {
        case 'error':
          // SECURITY: console statement removed for production - console.error(formatted)
          break
        case 'warn':
          // SECURITY: console statement removed for production - console.warn(formatted)
          break
        case 'info':
          // SECURITY: console statement removed for production - console.info(formatted)
          break
        case 'debug':
          // SECURITY: console statement removed for production - console.debug(formatted)
          break
      }
    }

    // In production, write to file or external service
    if (process.env.NODE_ENV === 'production') {
      // Add to buffer for batch processing
      this.buffer.push(entry)
      
      // Flush if buffer is full
      if (this.buffer.length >= this.maxBufferSize) {
        await this.flush()
      }
    }
  }

  private async flush() {
    if (this.buffer.length === 0) return

    const entriesToFlush = [...this.buffer]
    this.buffer = []

    try {
      await this.sendToMonitoring(entriesToFlush)
    } catch (error) {
      // Fail silently to avoid logging loops
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      userId: context?.userId,
      sessionId: context?.sessionId,
      requestId: context?.requestId,
      component: context?.component
    }
  }

  error(message: string, error?: Error, context?: LogContext) {
    if (!this.shouldLog('error')) return

    const entry = this.createLogEntry('error', message, context, error)
    this.writeToFile(entry)

    // Error tracking for critical errors
    if (error) {
      this.trackError(error, context)
    }
  }

  warn(message: string, context?: LogContext) {
    if (!this.shouldLog('warn')) return

    const entry = this.createLogEntry('warn', message, context)
    this.writeToFile(entry)
  }

  info(message: string, context?: LogContext) {
    if (!this.shouldLog('info')) return

    const entry = this.createLogEntry('info', message, context)
    this.writeToFile(entry)
  }

  debug(message: string, context?: LogContext) {
    if (!this.shouldLog('debug')) return

    const entry = this.createLogEntry('debug', message, context)
    this.writeToFile(entry)
  }

  // Track errors for monitoring
  private trackError(error: Error, context?: LogContext) {
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Sentry or similar error tracking
    }
  }

  // Audit logging for compliance
  audit(action: string, details: any, userId?: string) {
    const auditEntry = {
      action,
      details,
      userId,
      timestamp: new Date().toISOString(),
      ip: details.ip,
      userAgent: details.userAgent
    }

    // Always log audit events regardless of log level
    this.writeToFile({
      level: 'info',
      message: `AUDIT: ${action}`,
      timestamp: auditEntry.timestamp,
      context: auditEntry,
      userId
    })
  }

  // Performance logging
  performance(operation: string, duration: number, context?: LogContext) {
    if (!this.shouldLog('debug')) return

    this.debug(`Performance: ${operation} took ${duration}ms`, {
      ...context,
      operation,
      duration,
      slow: duration > 1000
    })
  }

  // Security logging
  security(event: string, details: any) {
    this.warn(`SECURITY: ${event}`, {
      ...details,
      securityEvent: true,
      timestamp: new Date().toISOString()
    })
  }

  // Create child logger with context
  child(context: LogContext): LoggerChild {
    return new LoggerChild(this, context)
  }

  // Cleanup
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    this.flush()
  }
}

// Child logger with persistent context
class LoggerChild {
  constructor(
    private parent: Logger,
    private context: LogContext
  ) {}

  error(message: string, error?: Error, additionalContext?: LogContext) {
    this.parent.error(message, error, { ...this.context, ...additionalContext })
  }

  warn(message: string, additionalContext?: LogContext) {
    this.parent.warn(message, { ...this.context, ...additionalContext })
  }

  info(message: string, additionalContext?: LogContext) {
    this.parent.info(message, { ...this.context, ...additionalContext })
  }

  debug(message: string, additionalContext?: LogContext) {
    this.parent.debug(message, { ...this.context, ...additionalContext })
  }
}

// Export singleton instance
export const logger = Logger.getInstance()

// Helper functions for common logging patterns
export const logApiCall = (
  method: string,
  endpoint: string,
  context?: LogContext
) => {
  logger.info(`API Call: ${method} ${endpoint}`, {
    ...context,
    component: 'api',
    method,
    endpoint
  })
}

export const logDatabaseQuery = (
  operation: string,
  table: string,
  duration?: number
) => {
  const message = `Database: ${operation} on ${table}`
  if (duration) {
    logger.performance(message, duration, { component: 'database', operation, table })
  } else {
    logger.debug(message, { component: 'database', operation, table })
  }
}

export const logBusinessEvent = (
  event: string,
  details: any,
  userId?: string
) => {
  logger.info(`Business Event: ${event}`, {
    component: 'business',
    event,
    ...details,
    userId
  })
}

// Cleanup on process exit (only in Node.js runtime)
if (typeof process !== 'undefined' && typeof process.on === 'function') {
  process.on('exit', () => logger.destroy())
  process.on('SIGINT', () => {
    logger.destroy()
    process.exit(0)
  })
  process.on('SIGTERM', () => {
    logger.destroy()
    process.exit(0)
  })
}