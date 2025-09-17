'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { ProfessionalChat } from '@/components/professional-chat'
import { useSession } from '@/components/session-context'

interface LayoutClientProps {
  children: React.ReactNode
}

export function LayoutClient({ children }: LayoutClientProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  
  // Check if current path is an auth page
  const isAuthPage = pathname.startsWith('/auth')
  
  // Don't show sidebar or chat on auth pages
  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {session && <Sidebar />}
      <main className={`flex-1 overflow-auto ${session ? 'lg:ml-64' : ''}`}>
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
      
      {/* Professional AI Chat - only show when authenticated */}
      {session && (
        <ProfessionalChat 
          isOpen={isChatOpen} 
          onToggle={() => setIsChatOpen(!isChatOpen)}
        />
      )}
    </div>
  )
}
