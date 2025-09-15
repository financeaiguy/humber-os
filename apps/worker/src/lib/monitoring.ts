import type { Env } from '@humber/types';
import { Logger } from '@humber/utils';

// Monitoring and Analytics Configuration
export interface MonitoringConfig {
  enableAnalytics: boolean;
  enableErrorTracking: boolean;
  enablePerformanceMonitoring: boolean;
  sampleRate: number;
}

// Performance Metrics
export interface PerformanceMetrics {
  requestId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  tenantId?: string;
  userId?: string;
  timestamp: number;
}

// Error Tracking
export interface ErrorEvent {
  id: string;
  message: string;
  stack?: string;
  endpoint: string;
  method: string;
  tenantId?: string;
  userId?: string;
  requestBody?: any;
  userAgent?: string;
  ipAddress?: string;
  timestamp: number;
}

// Business Analytics Events
export interface AnalyticsEvent {
  id: string;
  event: string;
  properties: Record<string, any>;
  tenantId?: string;
  userId?: string;
  timestamp: number;
}

export class MonitoringService {
  private logger: Logger;
  private config: MonitoringConfig;
  
  constructor(private env: Env) {
    this.logger = new Logger('monitoring');
    this.config = {
      enableAnalytics: env.ENVIRONMENT !== 'development',
      enableErrorTracking: true,
      enablePerformanceMonitoring: env.ENVIRONMENT === 'production',
      sampleRate: env.ENVIRONMENT === 'production' ? 0.1 : 1.0
    };
  }

  // Track API performance metrics
  async trackPerformance(metrics: PerformanceMetrics): Promise<void> {
    if (!this.config.enablePerformanceMonitoring) return;
    
    try {
      // Store in KV for real-time monitoring
      const key = `metrics:${metrics.tenantId || 'system'}:${Date.now()}`;
      await this.env.KV_CACHE.put(key, JSON.stringify(metrics), {
        expirationTtl: 86400 // 24 hours
      });
      
      // Send to analytics queue for processing
      await this.env.OPERATIONS_QUEUE.send({
        type: 'performance_metric',
        data: metrics
      });
      
      // Log slow requests
      if (metrics.responseTime > 1000) {
        this.logger.warn('Slow request detected', {
          endpoint: metrics.endpoint,
          responseTime: metrics.responseTime,
          tenantId: metrics.tenantId
        });
      }
    } catch (error) {
      this.logger.error('Failed to track performance metrics', error);
    }
  }

  // Track errors and exceptions
  async trackError(error: ErrorEvent): Promise<void> {
    if (!this.config.enableErrorTracking) return;
    
    try {
      // Store error details
      const key = `errors:${error.tenantId || 'system'}:${error.id}`;
      await this.env.KV_CACHE.put(key, JSON.stringify(error), {
        expirationTtl: 604800 // 7 days
      });
      
      // Send to error tracking queue
      await this.env.OPERATIONS_QUEUE.send({
        type: 'error_event',
        data: error
      });
      
      // Log critical errors immediately
      if (error.message.includes('database') || error.message.includes('timeout')) {
        this.logger.error('Critical error detected', {
          errorId: error.id,
          message: error.message,
          endpoint: error.endpoint,
          tenantId: error.tenantId
        });
      }
    } catch (trackingError) {
      this.logger.error('Failed to track error', trackingError);
    }
  }

  // Track business analytics events
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.config.enableAnalytics) return;
    
    try {
      // Sample events based on configuration
      if (Math.random() > this.config.sampleRate) return;
      
      // Store event data
      const key = `events:${event.tenantId || 'system'}:${event.id}`;
      await this.env.KV_CACHE.put(key, JSON.stringify(event), {
        expirationTtl: 2592000 // 30 days
      });
      
      // Send to analytics queue
      await this.env.OPERATIONS_QUEUE.send({
        type: 'analytics_event',
        data: event
      });
      
    } catch (error) {
      this.logger.error('Failed to track analytics event', error);
    }
  }

  // Get system health metrics
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: Record<string, any>;
    timestamp: number;
  }> {
    try {
      const now = Date.now();
      const oneHourAgo = now - 3600000;
      
      // Check recent error rate
      const recentErrors = await this.getRecentErrors(oneHourAgo);
      const errorRate = recentErrors.length;
      
      // Check average response time
      const avgResponseTime = await this.getAverageResponseTime(oneHourAgo);
      
      // Determine health status
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (errorRate > 100 || avgResponseTime > 2000) {
        status = 'unhealthy';
      } else if (errorRate > 50 || avgResponseTime > 1000) {
        status = 'degraded';
      }
      
      return {
        status,
        metrics: {
          errorRate,
          averageResponseTime: avgResponseTime,
          uptime: now,
          environment: this.env.ENVIRONMENT,
          version: this.env.API_VERSION || '1.0.0'
        },
        timestamp: now
      };
    } catch (error) {
      this.logger.error('Failed to get system health', error);
      return {
        status: 'unhealthy',
        metrics: { error: error.message },
        timestamp: Date.now()
      };
    }
  }

  // Helper methods
  private async getRecentErrors(since: number): Promise<ErrorEvent[]> {
    // Implementation would query KV for recent errors
    // For now, return empty array
    return [];
  }
  
  private async getAverageResponseTime(since: number): Promise<number> {
    // Implementation would calculate average from recent metrics
    // For now, return a reasonable default
    return 150; // 150ms average
  }

  // Track specific business events
  async trackCandidateCreated(candidateId: string, tenantId: string): Promise<void> {
    await this.trackEvent({
      id: `candidate_created_${candidateId}_${Date.now()}`,
      event: 'candidate_created',
      properties: { candidateId },
      tenantId,
      timestamp: Date.now()
    });
  }

  async trackDeploymentStarted(deploymentId: string, candidateId: string, tenantId: string, clientName: string): Promise<void> {
    await this.trackEvent({
      id: `deployment_started_${deploymentId}_${Date.now()}`,
      event: 'deployment_started',
      properties: { deploymentId, candidateId, clientName },
      tenantId,
      timestamp: Date.now()
    });
  }

  async trackTimesheetSubmitted(timesheetId: string, candidateId: string, tenantId: string, hoursWorked: number): Promise<void> {
    await this.trackEvent({
      id: `timesheet_submitted_${timesheetId}_${Date.now()}`,
      event: 'timesheet_submitted',
      properties: { timesheetId, candidateId, hoursWorked },
      tenantId,
      timestamp: Date.now()
    });
  }

  async trackReconciliationCompleted(timesheetId: string, tenantId: string, outcome: 'matched' | 'discrepancy' | 'resolved'): Promise<void> {
    await this.trackEvent({
      id: `reconciliation_completed_${timesheetId}_${Date.now()}`,
      event: 'reconciliation_completed',
      properties: { timesheetId, outcome },
      tenantId,
      timestamp: Date.now()
    });
  }
}

// Middleware for automatic performance tracking
export function performanceMiddleware() {
  return async (c: any, next: any) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    
    // Add request ID to context
    c.set('requestId', requestId);
    
    try {
      await next();
    } finally {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Track performance metrics
      const monitoring = new MonitoringService(c.env);
      await monitoring.trackPerformance({
        requestId,
        endpoint: c.req.path,
        method: c.req.method,
        statusCode: c.res.status,
        responseTime,
        tenantId: c.get('tenantId'),
        timestamp: endTime
      });
    }
  };
}

// Error tracking middleware
export function errorTrackingMiddleware() {
  return async (c: any, next: any) => {
    try {
      await next();
    } catch (error) {
      const monitoring = new MonitoringService(c.env);
      await monitoring.trackError({
        id: crypto.randomUUID(),
        message: error.message,
        stack: error.stack,
        endpoint: c.req.path,
        method: c.req.method,
        tenantId: c.get('tenantId'),
        userAgent: c.req.header('user-agent'),
        ipAddress: c.req.header('cf-connecting-ip'),
        timestamp: Date.now()
      });
      
      // Re-throw the error to be handled by the main error handler
      throw error;
    }
  };
}
