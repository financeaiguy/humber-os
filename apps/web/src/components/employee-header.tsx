'use client'

import { useSession } from '@/components/session-context'
import { signOut } from 'next-auth/react'
import { LogOut, User } from 'lucide-react'

export function EmployeeHeader() {
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  if (!session?.user || session.user.role !== 'ENGINEER_EMPLOYEE') {
    return null
  }

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Humber OS
          </h1>
          <div className="h-6 w-px bg-slate-600"></div>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {session.user.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{session.user.name}</p>
              <p className="text-xs text-blue-400">Employee</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  )
}