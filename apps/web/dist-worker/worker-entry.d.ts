interface Env {
    AI: Ai;
    KV_TENANT_CACHE: KVNamespace;
    KV_CACHE: KVNamespace;
    KV_SESSIONS: KVNamespace;
    DB_MASTER: D1Database;
    DB_ENGINEER_001: D1Database;
    DB_ENGINEER_002: D1Database;
    DB_ENGINEER_003: D1Database;
    VECTORIZE_INDEX: VectorizeIndex;
    DOCUMENTS: R2Bucket;
    ASSETS: R2Bucket;
    ENVIRONMENT: string;
    API_VERSION: string;
    LOG_LEVEL: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_TENANT_ID: string;
}
declare const _default: {
    fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>;
};
export default _default;
//# sourceMappingURL=worker-entry.d.ts.map