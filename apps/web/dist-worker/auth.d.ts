import type { NextAuthConfig } from "next-auth";
import { AuthUser } from "@humber/types";
declare module "next-auth" {
    interface Session {
        user: AuthUser & {
            id: string;
        };
    }
    interface User extends AuthUser {
        id: string;
    }
}
export declare const config: NextAuthConfig;
export declare const handlers: {
    POST: (req: import("next/server").NextRequest) => Promise<Response>;
    GET: (req: import("next/server").NextRequest) => Promise<Response>;
}, auth: ((args_0: import("next").NextApiRequest, args_1: import("next").NextApiResponse) => Promise<import("next-auth").Session | null>) & (() => Promise<import("next-auth").Session | null>) & ((args_0: import("next").GetServerSidePropsContext) => Promise<import("next-auth").Session | null>) & ((args_0: (req: import("next-auth").NextAuthRequest, ctx: import("next-auth/lib/types").AppRouteHandlerFnContext) => ReturnType<import("next-auth/lib/types").AppRouteHandlerFn>) => import("next-auth/lib/types").AppRouteHandlerFn) & ((args_0: import("next-auth/lib").NextAuthMiddleware) => import("next/server").NextMiddleware), signIn: <P extends import("@auth/core/providers").ProviderId, R extends boolean = true>(provider?: P, options?: FormData | ({
    redirectTo?: string;
    redirect?: R;
} & Record<string, any>), authorizationParams?: string[][] | Record<string, string> | string | URLSearchParams) => Promise<R extends false ? any : never>, signOut: <R extends boolean = true>(options?: {
    redirectTo?: string;
    redirect?: R;
}) => Promise<R extends false ? any : never>;
//# sourceMappingURL=auth.d.ts.map