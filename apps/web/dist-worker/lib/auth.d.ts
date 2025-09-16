import { NextRequest } from 'next/server';
interface Session {
    userId: string;
    tenantId: string;
    userRole: string;
    role?: string;
    email: string;
}
export declare function getSession(request: NextRequest): Promise<Session | null>;
export {};
//# sourceMappingURL=auth.d.ts.map