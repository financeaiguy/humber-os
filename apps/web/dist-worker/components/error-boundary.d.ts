import React, { Component, ErrorInfo, ReactNode } from 'react';
interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}
interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    showDetails: boolean;
    retryCount: number;
}
export declare class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props);
    static getDerivedStateFromError(error: Error): Partial<State>;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    handleReset: () => void;
    render(): string | number | bigint | boolean | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | import("react/jsx-runtime").JSX.Element | null | undefined;
}
export declare function withErrorBoundary<P extends object>(Component: React.ComponentType<P>, fallback?: ReactNode): (props: P) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=error-boundary.d.ts.map