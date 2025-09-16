import { ReactNode } from 'react';
interface LoadingContextType {
    isRouteLoading: boolean;
    setRouteLoading: (loading: boolean) => void;
    routeLoadingMessage: string;
    setRouteLoadingMessage: (message: string) => void;
}
export declare function useRouteLoading(): LoadingContextType;
interface LoadingProviderProps {
    children: ReactNode;
}
export declare function LoadingProvider({ children }: LoadingProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function DashboardSkeleton(): import("react/jsx-runtime").JSX.Element;
export declare function ProjectsSkeleton(): import("react/jsx-runtime").JSX.Element;
export declare function AnalyticsSkeleton(): import("react/jsx-runtime").JSX.Element;
export declare function OnboardingSkeleton(): import("react/jsx-runtime").JSX.Element;
export declare function getRouteSkeleton(pathname: string): import("react/jsx-runtime").JSX.Element;
interface RouteSkeletonProps {
    pathname: string;
    show: boolean;
}
export declare function RouteSkeleton({ pathname, show }: RouteSkeletonProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=route-loading.d.ts.map