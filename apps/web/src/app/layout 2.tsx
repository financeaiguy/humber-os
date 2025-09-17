import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LayoutClient } from '@/components/layout-client'
import { SessionProvider } from '@/components/session-context'
import { auth } from '@/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Humber OS - Internal Operations Platform',
  description: 'Streamline your automation business operations',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <LayoutClient>
            {children}
          </LayoutClient>
        </SessionProvider>
      </body>
    </html>
  )
}