import { headers } from 'next/headers';
export class Logger {
    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development';
        this.isProduction = process.env.NODE_ENV === 'production';
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    async getRequestContext() {
        try {
            const headersList = await headers();
            return {
                tenantId: headersList.get('x-tenant-id') || undefined,
            };
        }
        catch {
            return {};
        }
    }
    formatMessage(level, message, context) {
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
    async info(message, context) {
        const requestContext = await this.getRequestContext();
        const fullContext = { ...requestContext, ...context };
        if (this.isDevelopment) {
            console.log(message, fullContext);
        }
        else {
            console.log(this.formatMessage('INFO', message, fullContext));
        }
    }
    async warn(message, context) {
        const requestContext = await this.getRequestContext();
        const fullContext = { ...requestContext, ...context };
        if (this.isDevelopment) {
            console.warn(message, fullContext);
        }
        else {
            console.warn(this.formatMessage('WARN', message, fullContext));
        }
    }
    async error(message, error, context) {
        const requestContext = await this.getRequestContext();
        const fullContext = {
            ...requestContext,
            ...context,
            error: error ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
            } : undefined,
        };
        if (this.isDevelopment) {
            console.error(message, error, fullContext);
        }
        else {
            console.error(this.formatMessage('ERROR', message, fullContext));
        }
        if (this.isProduction && typeof window !== 'undefined') {
        }
    }
    async audit(action, context) {
        const requestContext = await this.getRequestContext();
        const auditContext = {
            ...requestContext,
            ...context,
            action,
            timestamp: new Date().toISOString(),
        };
        if (this.isProduction) {
            console.log(this.formatMessage('AUDIT', `Audit: ${action}`, auditContext));
        }
        else {
            console.log('AUDIT:', action, auditContext);
        }
    }
}
export const logger = Logger.getInstance();
export class PerformanceMonitor {
    static start(label) {
        this.timers.set(label, performance.now());
    }
    static end(label, metadata) {
        const startTime = this.timers.get(label);
        if (!startTime) {
            console.warn(`Timer ${label} was not started`);
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
    static async measure(label, fn, metadata) {
        this.start(label);
        try {
            const result = await fn();
            this.end(label, { ...metadata, status: 'success' });
            return result;
        }
        catch (error) {
            this.end(label, { ...metadata, status: 'error', error: String(error) });
            throw error;
        }
    }
}
PerformanceMonitor.timers = new Map();
export async function getHealthStatus() {
    const checks = {};
    try {
        checks.database = true;
    }
    catch {
        checks.database = false;
    }
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (apiUrl) {
            const response = await fetch(`${apiUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000),
            });
            checks.api = response.ok;
        }
    }
    catch {
        checks.api = false;
    }
    try {
        checks.auth = true;
    }
    catch {
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
//# sourceMappingURL=monitoring.js.map