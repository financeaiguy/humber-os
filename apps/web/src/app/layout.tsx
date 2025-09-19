import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '../styles/jobs-design-system.css'
import { LayoutClient } from '@/components/layout-client'
import { SessionProvider } from '@/components/session-context'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

// Removed edge runtime to fix webpack compatibility issues
// // export const runtime = 'edge'
export const revalidate = 0

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // For static export, we can't use server-side auth
  // Session will be handled client-side
  
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <SessionProvider>
          <LayoutClient>
            <Suspense fallback={<div>Loading...</div>}>
              {children}
            </Suspense>
          </LayoutClient>
        </SessionProvider>
      </body>
    </html>
  )
}