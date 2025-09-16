import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Inter } from 'next/font/google';
import './globals.css';
import '../styles/jobs-design-system.css';
import { LayoutClient } from '@/components/layout-client';
import { SessionProvider } from '@/components/session-context';
import { auth } from '@/auth';
import { ErrorBoundary } from '@/components/error-boundary';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
const GlobalLoadingIndicator = dynamic(() => import('@/components/global-loading').then(mod => ({ default: mod.GlobalLoadingIndicator })), {
    loading: () => null
});
const LoadingProvider = dynamic(() => import('@/components/route-loading').then(mod => ({ default: mod.LoadingProvider })), {
    loading: () => null
});
const ContinuousLearningProvider = dynamic(() => import('@/components/continuous-learning-provider').then(mod => ({ default: mod.ContinuousLearningProvider })), {
    loading: () => null
});
const inter = Inter({ subsets: ['latin'] });
export const runtime = 'edge';
export const revalidate = 0;
export const metadata = {
    title: 'Humber - Engineering Operations',
    description: 'Elegant engineering staffing automation designed for professionals',
    keywords: ['engineering', 'automation', 'staffing', 'operations'],
    authors: [{ name: 'Humber Operations' }],
    openGraph: {
        title: 'Humber - Engineering Operations',
        description: 'Elegant engineering staffing automation designed for professionals',
        type: 'website',
    },
    robots: {
        index: false,
        follow: false,
    },
};
export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#000000' },
    ],
};
export default async function RootLayout({ children, }) {
    const session = await auth();
    return (_jsx("html", { lang: "en", children: _jsx("body", { className: inter.className, children: _jsx(ErrorBoundary, { children: _jsx(SessionProvider, { session: session, children: _jsx(ContinuousLearningProvider, { children: _jsx(LoadingProvider, { children: _jsx(LayoutClient, { children: _jsxs(Suspense, { fallback: _jsx("div", { children: "Loading..." }), children: [_jsx(GlobalLoadingIndicator, {}), children] }) }) }) }) }) }) }) }));
}
//# sourceMappingURL=layout.js.map