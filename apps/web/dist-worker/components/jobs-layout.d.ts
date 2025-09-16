interface JobsLayoutProps {
    children: React.ReactNode;
}
export declare function JobsLayout({ children }: JobsLayoutProps): import("react/jsx-runtime").JSX.Element;
export declare function JobsStatCard({ title, value, subtitle, trend }: {
    title: string;
    value: string;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
}): import("react/jsx-runtime").JSX.Element;
export declare function JobsSection({ title, subtitle, action, children }: {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function JobsTable({ headers, children }: {
    headers: string[];
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function JobsButton({ children, variant, size, ...props }: {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    size?: 'small' | 'medium' | 'large';
} & React.ButtonHTMLAttributes<HTMLButtonElement>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=jobs-layout.d.ts.map