import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '../styles/jobs-design-system.css'
import { LayoutClient } from '@/components/layout-client'
import { SessionProvider } from '@/components/session-context'
import { auth } from '@/auth'
import { ErrorBoundary } from '@/components/error-boundary'
import { GlobalLoadingIndicator } from '@/components/global-loading'
import { LoadingProvider } from '@/components/route-loading'
import { Suspense } from 'react'
import { PageLoadingIndicator } from '@/components/global-loading'
import { ContinuousLearningProvider } from '@/components/continuous-learning-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
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
    index: false, // Internal tool
    follow: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <ErrorBoundary>
          <SessionProvider session={session}>
            <ContinuousLearningProvider>
              <LoadingProvider>
                <LayoutClient>
                  <Suspense fallback={<PageLoadingIndicator />}>
                    <GlobalLoadingIndicator />
                    {children}
                  </Suspense>
                </LayoutClient>
              </LoadingProvider>
            </ContinuousLearningProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}