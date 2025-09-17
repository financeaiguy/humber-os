'use client'

import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { sessionStorage } from '@/lib/session-storage'

export function SessionManager() {
  const { data: session, status, update } = useSession()

  useEffect(() => {
    // Set up session monitoring and cleanup
    const sessionInterval = setInterval(async () => {
      if (session?.user && status === 'authenticated') {
        try {
          // Clean up any expired sessions
          await sessionStorage.cleanupExpiredSessions()
          
          // Update session to extend it (every 6 hours)
          await update()
          
          console.log('🔄 Session refreshed for:', session.user.email)
        } catch (error) {
          console.error('❌ Session refresh failed:', error)
        }
      }
    }, 6 * 60 * 60 * 1000) // Every 6 hours

    // Initial cleanup
    sessionStorage.cleanupExpiredSessions()

    return () => {
      clearInterval(sessionInterval)
    }
  }, [session, status, update])

  // Handle session expiration
  useEffect(() => {
    if (status === 'unauthenticated') {
      // Clean up any remaining session data
      sessionStorage.cleanupExpiredSessions()
    }
  }, [status])

  return null // This is a utility component with no UI
}

// Hook for manual session management
export function useSessionPersistence() {
  const { data: session, status } = useSession()

  const extendSession = async () => {
    if (session?.user) {
      try {
        // Update session in our storage
        const sessionToken = `humber_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
        const sessionData = {
          user: session.user,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          sessionToken
        }
        await sessionStorage.setSession(sessionToken, sessionData)
        console.log('✅ Session manually extended')
        return true
      } catch (error) {
        console.error('❌ Manual session extension failed:', error)
        return false
      }
    }
    return false
  }

  const clearAllSessions = async () => {
    if (session?.user?.id) {
      try {
        await sessionStorage.deleteUserSessions(session.user.id)
        await signOut({ callbackUrl: '/auth/signin' })
        console.log('✅ All sessions cleared')
        return true
      } catch (error) {
        console.error('❌ Session cleanup failed:', error)
        return false
      }
    }
    return false
  }

  return {
    session,
    status,
    extendSession,
    clearAllSessions,
    isAuthenticated: status === 'authenticated'
  }
}