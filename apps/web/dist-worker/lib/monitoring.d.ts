interface LogContext {
    userId?: string;
    tenantId?: string;
    action?: string;
    metadata?: Record<string, any>;
}
export declare class Logger {
    private static instance;
    private isDevelopment;
    private isProduction;
    private constructor();
    static getInstance(): Logger;
    private getRequestContext;
    private formatMessage;
    info(message: string, context?: LogContext): Promise<void>;
    warn(message: string, context?: LogContext): Promise<void>;
    error(message: string, error?: Error, context?: LogContext): Promise<void>;
    audit(action: string, context?: LogContext): Promise<void>;
}
export declare const logger: Logger;
export declare class PerformanceMonitor {
    private static timers;
    static start(label: string): void;
    static end(label: string, metadata?: Record<string, any>): number | undefined;
    static measure<T>(label: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T>;
}
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
export declare function getHealthStatus(): Promise<HealthStatus>;
export {};
//# sourceMappingURL=monitoring.d.ts.map