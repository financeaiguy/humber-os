interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    message: string;
}
interface RateLimitResult {
    allowed: boolean;
    retryAfter?: number;
    remaining?: number;
}
export declare function rateLimitCheck(key: string, config: RateLimitConfig): Promise<RateLimitResult>;
export {};
//# sourceMappingURL=rate-limiting.d.ts.map