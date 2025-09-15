'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { ChatWidget } from '@/components/chat-widget'

interface LayoutClientProps {
  children: React.ReactNode
}

export function LayoutClient({ children }: LayoutClientProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Sidebar />
      <main className="flex-1 lg:ml-64 overflow-auto">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
      
      {/* Global Chat Widget */}
      <ChatWidget 
        isOpen={isChatOpen} 
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </div>
  )
}
