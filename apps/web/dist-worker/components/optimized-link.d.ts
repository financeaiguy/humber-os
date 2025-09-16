import { ReactNode } from 'react';
interface OptimizedLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
    prefetch?: boolean;
    showSkeleton?: boolean;
    loadingMessage?: string;
    replace?: boolean;
    onClick?: () => void;
}
export declare function OptimizedLink({ href, children, className, prefetch, showSkeleton, loadingMessage, replace, onClick }: OptimizedLinkProps): import("react/jsx-runtime").JSX.Element;
export declare function DashboardLink({ children, className }: {
    children: ReactNode;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function ProjectsLink({ children, className }: {
    children: ReactNode;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function AnalyticsLink({ children, className }: {
    children: ReactNode;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function OnboardingLink({ children, className }: {
    children: ReactNode;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function useFastNavigation(): {
    navigate: (href: string, options?: {
        replace?: boolean;
        loadingMessage?: string;
        prefetch?: boolean;
    }) => void;
};
export {};
//# sourceMappingURL=optimized-link.d.ts.map