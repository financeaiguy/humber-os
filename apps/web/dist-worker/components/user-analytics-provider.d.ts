import { ReactNode } from 'react';
interface UserAnalyticsProviderProps {
    children: ReactNode;
    userId?: string;
    userRole?: string;
}
export declare function UserAnalyticsProvider({ children, userId, userRole }: UserAnalyticsProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function AnalyticsDebugPanel(): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=user-analytics-provider.d.ts.map