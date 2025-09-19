import { headers } from 'next/headers';

interface LogContext {
  userId?: string;
  tenantId?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export class Logger {
  private static instance: Logger;
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private async getRequestContext(): Promise<Partial<LogContext>> {
    try {
      const headersList = await headers();
      return {
        tenantId: headersList.get('x-tenant-id') || undefined,
      };
    } catch {
      return {};
    }
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const requestContext = context || {};
    
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...requestContext,
      environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
    });
  }

  async info(message: string, context?: LogContext) {
    const requestContext = await this.getRequestContext();
    const fullContext = { ...requestContext, ...context };
    
    if (this.isDevelopment) {
      // SECURITY: console statement removed: console.log(message, fullContext);
    } else {
      // SECURITY: console statement removed: console.log(this.formatMessage('INFO', message, fullContext));
    }
  }

  async warn(message: string, context?: LogContext) {
    const requestContext = await this.getRequestContext();
    const fullContext = { ...requestContext, ...context };
    
    if (this.isDevelopment) {
      // SECURITY: console statement removed: console.warn(message, fullContext);
    } else {
      // SECURITY: console statement removed: console.warn(this.formatMessage('WARN', message, fullContext));
    }
  }

  async error(message: string, error?: Error, context?: LogContext) {
    const requestContext = await this.getRequestContext();
    const fullContext = {
      ...requestContext,
      ...context,
      error: error ? {
        message: 'An error occurred',
        stack: '[REDACTED]',
        name: error.name,
      } : undefined,
    };
    
    if (this.isDevelopment) {
      // SECURITY: console statement removed: console.error(message, error, fullContext);
    } else {
      // SECURITY: console statement removed: console.error(this.formatMessage('ERROR', message, fullContext));
    }

    // Send to error tracking in production
    if (this.isProduction && typeof window !== 'undefined') {
      // This would integrate with Sentry or similar
      // if (window.Sentry) {
      //   window.Sentry.captureException(error, { extra: fullContext });
      // }
    }
  }

  async audit(action: string, context?: LogContext) {
    const requestContext = await this.getRequestContext();
    const auditContext = {
      ...requestContext,
      ...context,
      action,
      timestamp: new Date().toISOString(),
    };
    
    // In production, this would send to audit log storage
    if (this.isProduction) {
      // SECURITY: console statement removed: console.log(this.formatMessage('AUDIT', `Audit: ${action}`, auditContext));
      // Send to audit storage service
    } else {
      // SECURITY: console statement removed: console.log('AUDIT:', action, auditContext);
    }
  }
}

export const logger = Logger.getInstance();

// Performance monitoring
export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  static start(label: string) {
    this.timers.set(label, performance.now());
  }

  static end(label: string, metadata?: Record<string, any>) {
    const startTime = this.timers.get(label);
    if (!startTime) {
      // SECURITY: console statement removed: console.warn(`Timer ${label} was not started`);
      return;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);

    logger.info(`Performance: ${label}`, {
      action: 'performance',
      metadata: {
        ...metadata,
        duration: `${duration.toFixed(2)}ms`,
        label,
      },
    });

    return duration;
  }

  static async measure<T>(
    label: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label, { ...metadata, status: 'success' });
      return result;
    } catch (error) {
      this.end(label, { ...metadata, status: 'error', error: String(error) });
      throw error;
    }
  }
}

// Health check endpoint data
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database?: boolean;
    api?: boolean;
    auth?: boolean;
  };
  version: string;
  environment: string;
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const checks: HealthStatus['checks'] = {};
  
  // Check database connectivity
  try {
    // This would check actual database connection
    checks.database = true;
  } catch {
    checks.database = false;
  }

  // Check API connectivity
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      checks.api = response.ok;
    }
  } catch {
    checks.api = false;
  }

  // Check auth service
  try {
    // This would check auth service health
    checks.auth = true;
  } catch {
    checks.auth = false;
  }

  const allHealthy = Object.values(checks).every(check => check !== false);
  const someHealthy = Object.values(checks).some(check => check === true);

  return {
    status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
    version: process.env.npm_package_version || 'unknown',
    environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  };
}