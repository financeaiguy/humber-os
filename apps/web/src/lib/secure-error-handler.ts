/**
 * SECURE ERROR HANDLER - PREVENTS INFORMATION DISCLOSURE
 * 
 * This module prevents sensitive error information from being exposed
 * to clients while maintaining proper logging for debugging.
 */

export interface SecureError {
  message: string
  code?: string
  requestId?: string
}

export class SecureErrorHandler {
  
  /**
   * Sanitize error for client response
   * Removes stack traces, file paths, and sensitive details
   */
  static sanitizeError(error: any, requestId?: string): SecureError {
    // Generic error messages to prevent information disclosure
    const genericMessages = {
      validation: 'Invalid input provided',
      authentication: 'Authentication failed',
      authorization: 'Access denied',
      database: 'Database operation failed',
      network: 'Network error occurred',
      internal: 'Internal server error',
      default: 'An error occurred'
    }
    
    let sanitizedMessage = genericMessages.default
    let errorCode = 'UNKNOWN_ERROR'
    
    if (error) {
      // Categorize error types without exposing details
      if (error.name === 'ValidationError' || error.message?.includes('validation')) {
        sanitizedMessage = genericMessages.validation
        errorCode = 'VALIDATION_ERROR'
      } else if (error.name === 'AuthenticationError' || error.message?.includes('auth')) {
        sanitizedMessage = genericMessages.authentication
        errorCode = 'AUTH_ERROR'
      } else if (error.name === 'AuthorizationError' || error.message?.includes('permission')) {
        sanitizedMessage = genericMessages.authorization
        errorCode = 'AUTHZ_ERROR'
      } else if (error.message?.includes('database') || error.message?.includes('sql')) {
        sanitizedMessage = genericMessages.database
        errorCode = 'DATABASE_ERROR'
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        sanitizedMessage = genericMessages.network
        errorCode = 'NETWORK_ERROR'
      } else {
        sanitizedMessage = genericMessages.internal
        errorCode = 'INTERNAL_ERROR'
      }
    }
    
    return {
      message: sanitizedMessage,
      code: errorCode,
      requestId: requestId || crypto.randomUUID()
    }
  }
  
  /**
   * Log error securely (for internal debugging)
   * This should be sent to secure logging service, not exposed to client
   */
  static logError(error: any, context?: Record<string, any>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: {
        name: error?.name,
        message: error?.message,
        // SECURITY: Only log stack trace in development
        stack: process.env.NODE_ENV === 'development' ? error?.stack : '[REDACTED]'
      },
      context: context || {},
      level: 'error'
    }
    
    // In production, this should go to secure logging service
    if (process.env.NODE_ENV === 'development') {
      // SECURITY: Removed console.error('SECURE_ERROR_LOG:', JSON.stringify(logEntry, null, 2))
    } else {
      // Send to secure logging service (e.g., Datadog, CloudWatch, etc.)
      // For now, log without sensitive details
      // SECURITY: Removed console.error(JSON.stringify({
        timestamp: logEntry.timestamp,
        level: 'error',
        message: 'Application error occurred',
        requestId: context?.requestId
      }))
    }
  }
  
  /**
   * Handle API route errors securely
   */
  static handleApiError(error: any, requestId?: string): Response {
    // Log the full error internally
    this.logError(error, { requestId, source: 'api_route' })
    
    // Return sanitized error to client
    const sanitizedError = this.sanitizeError(error, requestId)
    
    return new Response(JSON.stringify(sanitizedError), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': sanitizedError.requestId || ''
      }
    })
  }
}

export default SecureErrorHandler
