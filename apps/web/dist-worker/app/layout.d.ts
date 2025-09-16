import type { Metadata, Viewport } from 'next';
import './globals.css';
import '../styles/jobs-design-system.css';
export declare const runtime = "edge";
export declare const revalidate = 0;
export declare const metadata: Metadata;
export declare const viewport: Viewport;
export default function RootLayout({ children, }: {
    children: React.ReactNode;
}): Promise<import("react/jsx-runtime").JSX.Element>;
//# sourceMappingURL=layout.d.ts.map