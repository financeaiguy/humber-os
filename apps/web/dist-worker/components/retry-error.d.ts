interface RetryErrorProps {
    error: Error | string;
    onRetry?: () => void | Promise<void>;
    showDetails?: boolean;
    variant?: 'inline' | 'full' | 'compact';
    maxRetries?: number;
}
export declare function RetryError({ error, onRetry, showDetails, variant, maxRetries }: RetryErrorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=retry-error.d.ts.map