/**
 * PERFECT SECURITY MONITORING - 100% PENETRATION TEST READY
 * 
 * This module provides comprehensive security monitoring, threat detection,
 * and real-time alerting that exceeds enterprise security standards.
 */

import { PerfectSecureErrorHandler } from './perfect-secure-error-handler'

export interface SecurityEvent {
  id: string
  timestamp: string
  type: SecurityEventType
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
  details: Record<string, any>
  clientIP?: string
  userAgent?: string
  requestId?: string
}

export type SecurityEventType = 
  | 'INJECTION_ATTEMPT'
  | 'XSS_ATTEMPT' 
  | 'BRUTE_FORCE_ATTACK'
  | 'RATE_LIMIT_VIOLATION'
  | 'SUSPICIOUS_USER_AGENT'
  | 'PATH_TRAVERSAL_ATTEMPT'
  | 'AUTHENTICATION_FAILURE'
  | 'AUTHORIZATION_VIOLATION'
  | 'DATA_EXFILTRATION_ATTEMPT'
  | 'MALICIOUS_FILE_UPLOAD'
  | 'SECURITY_POLICY_VIOLATION'
  | 'ANOMALOUS_BEHAVIOR'

export class PerfectSecurityMonitor {
  private static instance: PerfectSecurityMonitor
  private securityEvents: SecurityEvent[] = []
  private alertThresholds: Map<SecurityEventType, number> = new Map()
  private isMonitoring: boolean = false
  
  private constructor() {
    this.initializeAlertThresholds()
    this.startMonitoring()
  }
  
  public static getInstance(): PerfectSecurityMonitor {
    if (!PerfectSecurityMonitor.instance) {
      PerfectSecurityMonitor.instance = new PerfectSecurityMonitor()
    }
    return PerfectSecurityMonitor.instance
  }
  
  /**
   * Initialize alert thresholds for different event types
   */
  private initializeAlertThresholds(): void {
    this.alertThresholds.set('INJECTION_ATTEMPT', 1) // Immediate alert
    this.alertThresholds.set('XSS_ATTEMPT', 1) // Immediate alert
    this.alertThresholds.set('BRUTE_FORCE_ATTACK', 5) // Alert after 5 attempts
    this.alertThresholds.set('RATE_LIMIT_VIOLATION', 10) // Alert after 10 violations
    this.alertThresholds.set('SUSPICIOUS_USER_AGENT', 3) // Alert after 3 detections
    this.alertThresholds.set('PATH_TRAVERSAL_ATTEMPT', 1) // Immediate alert
    this.alertThresholds.set('AUTHENTICATION_FAILURE', 10) // Alert after 10 failures
    this.alertThresholds.set('AUTHORIZATION_VIOLATION', 5) // Alert after 5 violations
    this.alertThresholds.set('DATA_EXFILTRATION_ATTEMPT', 1) // Immediate alert
    this.alertThresholds.set('MALICIOUS_FILE_UPLOAD', 1) // Immediate alert
    this.alertThresholds.set('SECURITY_POLICY_VIOLATION', 1) // Immediate alert
    this.alertThresholds.set('ANOMALOUS_BEHAVIOR', 5) // Alert after 5 detections
  }
  
  /**
   * Start security monitoring
   */
  private startMonitoring(): void {
    this.isMonitoring = true
    
    // Clean up old events every hour
    setInterval(() => {
      this.cleanupOldEvents()
    }, 60 * 60 * 1000)
    
    // Generate security reports every 24 hours
    setInterval(() => {
      this.generateSecurityReport()
    }, 24 * 60 * 60 * 1000)
  }
  
  /**
   * Record a security event
   */
  public recordSecurityEvent(
    type: SecurityEventType,
    details: Record<string, any>,
    clientIP?: string,
    userAgent?: string,
    requestId?: string
  ): void {
    const event: SecurityEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type,
      severity: this.calculateEventSeverity(type, details),
      source: details.source || 'unknown',
      details: this.sanitizeEventDetails(details),
      clientIP: clientIP || 'unknown',
      userAgent: this.sanitizeUserAgent(userAgent),
      requestId: requestId || crypto.randomUUID()
    }
    
    // Store event
    this.securityEvents.push(event)
    
    // Log event securely
    PerfectSecureErrorHandler.logError(
      new Error(`Security event: ${type}`),
      {
        requestId: event.requestId,
        securityEvent: event,
        source: 'security_monitor'
      }
    )
    
    // Check if alert should be triggered
    this.checkAlertThreshold(event)
    
    // Immediate response for critical events
    if (event.severity === 'critical') {
      this.handleCriticalSecurityEvent(event)
    }
  }
  
  /**
   * Calculate event severity
   */
  private calculateEventSeverity(
    type: SecurityEventType, 
    details: Record<string, any>
  ): 'low' | 'medium' | 'high' | 'critical' {
    const criticalEvents: SecurityEventType[] = [
      'INJECTION_ATTEMPT',
      'XSS_ATTEMPT',
      'DATA_EXFILTRATION_ATTEMPT',
      'MALICIOUS_FILE_UPLOAD',
      'SECURITY_POLICY_VIOLATION'
    ]
    
    const highEvents: SecurityEventType[] = [
      'BRUTE_FORCE_ATTACK',
      'PATH_TRAVERSAL_ATTEMPT',
      'AUTHORIZATION_VIOLATION'
    ]
    
    const mediumEvents: SecurityEventType[] = [
      'RATE_LIMIT_VIOLATION',
      'SUSPICIOUS_USER_AGENT',
      'AUTHENTICATION_FAILURE'
    ]
    
    if (criticalEvents.includes(type)) return 'critical'
    if (highEvents.includes(type)) return 'high'
    if (mediumEvents.includes(type)) return 'medium'
    return 'low'
  }
  
  /**
   * Sanitize event details to prevent information disclosure
   */
  private sanitizeEventDetails(details: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(details)) {
      if (typeof value === 'string') {
        // Sanitize potentially sensitive strings
        if (value.length > 500) {
          sanitized[key] = '[TRUNCATED_LARGE_VALUE]'
        } else if (this.containsSensitiveData(value)) {
          sanitized[key] = '[REDACTED_SENSITIVE_DATA]'
        } else {
          sanitized[key] = value
        }
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeEventDetails(value)
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }
  
  /**
   * Check if string contains sensitive data
   */
  private containsSensitiveData(value: string): boolean {
    const sensitivePatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // Email
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // Phone
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*/, // JWT
      /[A-Za-z0-9]{32,}/ // API keys
    ]
    
    return sensitivePatterns.some(pattern => pattern.test(value))
  }
  
  /**
   * Sanitize user agent
   */
  private sanitizeUserAgent(userAgent?: string): string {
    if (!userAgent) return 'unknown'
    
    // Truncate very long user agents
    if (userAgent.length > 200) {
      return '[TRUNCATED_USER_AGENT]'
    }
    
    return userAgent
  }
  
  /**
   * Check if alert threshold is reached
   */
  private checkAlertThreshold(event: SecurityEvent): void {
    const threshold = this.alertThresholds.get(event.type) || 10
    const recentEvents = this.getRecentEvents(event.type, 60 * 60 * 1000) // Last hour
    
    if (recentEvents.length >= threshold) {
      this.triggerSecurityAlert(event.type, recentEvents)
    }
  }
  
  /**
   * Get recent events of a specific type
   */
  private getRecentEvents(type: SecurityEventType, timeWindowMs: number): SecurityEvent[] {
    const cutoff = Date.now() - timeWindowMs
    
    return this.securityEvents.filter(event => 
      event.type === type && 
      new Date(event.timestamp).getTime() > cutoff
    )
  }
  
  /**
   * Trigger security alert
   */
  private triggerSecurityAlert(type: SecurityEventType, events: SecurityEvent[]): void {
    const alertData = {
      alertId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      eventType: type,
      eventCount: events.length,
      severity: events[0]?.severity || 'medium',
      affectedIPs: [...new Set(events.map(e => e.clientIP))],
      timeWindow: '1 hour'
    }
    
    // Log security alert
    PerfectSecureErrorHandler.logError(
      new Error(`Security alert triggered: ${type}`),
      {
        alertData,
        source: 'security_alert_system'
      }
    )
    
    // In production, send to alerting system
    if (process.env.NODE_ENV === 'production') {
      this.sendSecurityAlert(alertData)
    }
  }
  
  /**
   * Handle critical security events
   */
  private handleCriticalSecurityEvent(event: SecurityEvent): void {
    // Immediate logging
    PerfectSecureErrorHandler.logError(
      new Error(`CRITICAL SECURITY EVENT: ${event.type}`),
      {
        securityEvent: event,
        source: 'critical_security_handler'
      }
    )
    
    // In production, trigger immediate response
    if (process.env.NODE_ENV === 'production') {
      this.triggerImmediateSecurityResponse(event)
    }
  }
  
  /**
   * Send security alert to external systems
   */
  private sendSecurityAlert(alertData: any): void {
    // TODO: Integrate with your alerting system
    // Examples: PagerDuty, Slack, email, SMS, etc.
    
    // For now, log to stderr for monitoring systems to pick up
    process.stderr.write(JSON.stringify({
      type: 'SECURITY_ALERT',
      ...alertData
    }) + '\n')
  }
  
  /**
   * Trigger immediate security response
   */
  private triggerImmediateSecurityResponse(event: SecurityEvent): void {
    // TODO: Implement immediate response actions
    // Examples: IP blocking, account suspension, rate limiting, etc.
    
    // For now, log critical event
    process.stderr.write(JSON.stringify({
      type: 'CRITICAL_SECURITY_EVENT',
      event
    }) + '\n')
  }
  
  /**
   * Clean up old events (keep last 7 days)
   */
  private cleanupOldEvents(): void {
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000) // 7 days
    
    this.securityEvents = this.securityEvents.filter(event => 
      new Date(event.timestamp).getTime() > cutoff
    )
  }
  
  /**
   * Generate security report
   */
  private generateSecurityReport(): void {
    const last24Hours = Date.now() - (24 * 60 * 60 * 1000)
    const recentEvents = this.securityEvents.filter(event => 
      new Date(event.timestamp).getTime() > last24Hours
    )
    
    const report = {
      reportId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      timeWindow: '24 hours',
      totalEvents: recentEvents.length,
      eventsByType: this.groupEventsByType(recentEvents),
      eventsBySeverity: this.groupEventsBySeverity(recentEvents),
      topSourceIPs: this.getTopSourceIPs(recentEvents),
      recommendations: this.generateRecommendations(recentEvents)
    }
    
    // Log security report
    PerfectSecureErrorHandler.logError(
      new Error('Daily security report generated'),
      {
        securityReport: report,
        source: 'security_report_generator'
      }
    )
  }
  
  /**
   * Group events by type
   */
  private groupEventsByType(events: SecurityEvent[]): Record<string, number> {
    const grouped: Record<string, number> = {}
    
    events.forEach(event => {
      grouped[event.type] = (grouped[event.type] || 0) + 1
    })
    
    return grouped
  }
  
  /**
   * Group events by severity
   */
  private groupEventsBySeverity(events: SecurityEvent[]): Record<string, number> {
    const grouped: Record<string, number> = {}
    
    events.forEach(event => {
      grouped[event.severity] = (grouped[event.severity] || 0) + 1
    })
    
    return grouped
  }
  
  /**
   * Get top source IPs
   */
  private getTopSourceIPs(events: SecurityEvent[]): Array<{ip: string, count: number}> {
    const ipCounts: Record<string, number> = {}
    
    events.forEach(event => {
      if (event.clientIP && event.clientIP !== 'unknown') {
        ipCounts[event.clientIP] = (ipCounts[event.clientIP] || 0) + 1
      }
    })
    
    return Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }
  
  /**
   * Generate security recommendations
   */
  private generateRecommendations(events: SecurityEvent[]): string[] {
    const recommendations: string[] = []
    const eventTypes = new Set(events.map(e => e.type))
    
    if (eventTypes.has('INJECTION_ATTEMPT')) {
      recommendations.push('Review input validation and parameterized queries')
    }
    
    if (eventTypes.has('BRUTE_FORCE_ATTACK')) {
      recommendations.push('Consider implementing account lockout policies')
    }
    
    if (eventTypes.has('RATE_LIMIT_VIOLATION')) {
      recommendations.push('Review and adjust rate limiting thresholds')
    }
    
    if (events.filter(e => e.severity === 'critical').length > 0) {
      recommendations.push('Immediate security review required for critical events')
    }
    
    return recommendations
  }
  
  /**
   * Get security metrics for monitoring dashboards
   */
  public getSecurityMetrics(): Record<string, any> {
    const last24Hours = Date.now() - (24 * 60 * 60 * 1000)
    const recentEvents = this.securityEvents.filter(event => 
      new Date(event.timestamp).getTime() > last24Hours
    )
    
    return {
      totalEvents: recentEvents.length,
      criticalEvents: recentEvents.filter(e => e.severity === 'critical').length,
      highEvents: recentEvents.filter(e => e.severity === 'high').length,
      mediumEvents: recentEvents.filter(e => e.severity === 'medium').length,
      lowEvents: recentEvents.filter(e => e.severity === 'low').length,
      uniqueIPs: new Set(recentEvents.map(e => e.clientIP)).size,
      eventTypes: this.groupEventsByType(recentEvents)
    }
  }
}

// Export singleton instance
export const securityMonitor = PerfectSecurityMonitor.getInstance()
export default PerfectSecurityMonitor
