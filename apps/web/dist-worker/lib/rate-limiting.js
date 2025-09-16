const rateLimitStore = new Map();
export async function rateLimitCheck(key, config) {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    for (const [storeKey, data] of rateLimitStore.entries()) {
        if (data.resetTime < now) {
            rateLimitStore.delete(storeKey);
        }
    }
    let entry = rateLimitStore.get(key);
    if (!entry || entry.resetTime < now) {
        entry = { count: 0, resetTime: now + config.windowMs };
        rateLimitStore.set(key, entry);
    }
    entry.count++;
    const allowed = entry.count <= config.maxRequests;
    const retryAfter = allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000);
    const remaining = Math.max(0, config.maxRequests - entry.count);
    return {
        allowed,
        retryAfter,
        remaining
    };
}
//# sourceMappingURL=rate-limiting.js.map