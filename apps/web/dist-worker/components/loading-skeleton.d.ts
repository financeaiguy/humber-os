interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'card';
    width?: string | number;
    height?: string | number;
    count?: number;
}
export declare function Skeleton({ className, variant, width, height, count }: SkeletonProps): import("react/jsx-runtime").JSX.Element;
export declare function TableSkeleton({ rows, columns }: {
    rows?: number;
    columns?: number;
}): import("react/jsx-runtime").JSX.Element;
export declare function CardSkeleton({ count }: {
    count?: number;
}): import("react/jsx-runtime").JSX.Element;
export declare function PageSkeleton(): import("react/jsx-runtime").JSX.Element;
export declare function FormSkeleton(): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=loading-skeleton.d.ts.map