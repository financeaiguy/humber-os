// Session storage adapter for development (localStorage) and production (KV store)

interface SessionData {
  user: any
  expires: string
  sessionToken: string
}

class SessionStorage {
  private isProduction(): boolean {
    return process.env.NODE_ENV === 'production' || 
           typeof window !== 'undefined' && (
             window.location.hostname.includes('pages.dev') ||
             window.location.hostname.includes('workers.dev')
           )
  }

  private isClient(): boolean {
    return typeof window !== 'undefined'
  }

  async setSession(sessionToken: string, sessionData: SessionData): Promise<void> {
    if (this.isProduction()) {
      // Use KV store for production
      await this.setKVSession(sessionToken, sessionData)
    } else {
      // Use localStorage for development
      this.setLocalSession(sessionToken, sessionData)
    }
  }

  async getSession(sessionToken: string): Promise<SessionData | null> {
    if (this.isProduction()) {
      // Use KV store for production
      return await this.getKVSession(sessionToken)
    } else {
      // Use localStorage for development
      return this.getLocalSession(sessionToken)
    }
  }

  async deleteSession(sessionToken: string): Promise<void> {
    if (this.isProduction()) {
      // Use KV store for production
      await this.deleteKVSession(sessionToken)
    } else {
      // Use localStorage for development
      this.deleteLocalSession(sessionToken)
    }
  }

  async deleteUserSessions(userId: string): Promise<void> {
    if (this.isProduction()) {
      // Use KV store for production
      await this.deleteKVUserSessions(userId)
    } else {
      // Use localStorage for development
      this.deleteLocalUserSessions(userId)
    }
  }

  // localStorage methods for development
  private setLocalSession(sessionToken: string, sessionData: SessionData): void {
    if (!this.isClient()) return
    
    try {
      const key = `humber-session-${sessionToken}`
      localStorage.setItem(key, JSON.stringify(sessionData))
      
      // Also store the session token for the user for easy cleanup
      const userSessionsKey = `humber-user-sessions-${sessionData.user.id}`
      const existingSessions = JSON.parse(localStorage.getItem(userSessionsKey) || '[]')
      if (!existingSessions.includes(sessionToken)) {
        existingSessions.push(sessionToken)
        localStorage.setItem(userSessionsKey, JSON.stringify(existingSessions))
      }
      
      console.log('✅ Session stored in localStorage:', sessionToken.substring(0, 8) + '...')
    } catch (error) {
      console.error('❌ Failed to store session in localStorage:', error)
    }
  }

  private getLocalSession(sessionToken: string): SessionData | null {
    if (!this.isClient()) return null
    
    try {
      const key = `humber-session-${sessionToken}`
      const data = localStorage.getItem(key)
      
      if (!data) return null
      
      const sessionData = JSON.parse(data) as SessionData
      
      // Check if session has expired
      if (new Date(sessionData.expires) < new Date()) {
        this.deleteLocalSession(sessionToken)
        return null
      }
      
      console.log('✅ Session retrieved from localStorage:', sessionToken.substring(0, 8) + '...')
      return sessionData
    } catch (error) {
      console.error('❌ Failed to retrieve session from localStorage:', error)
      return null
    }
  }

  private deleteLocalSession(sessionToken: string): void {
    if (!this.isClient()) return
    
    try {
      const key = `humber-session-${sessionToken}`
      localStorage.removeItem(key)
      console.log('🗑️ Session deleted from localStorage:', sessionToken.substring(0, 8) + '...')
    } catch (error) {
      console.error('❌ Failed to delete session from localStorage:', error)
    }
  }

  private deleteLocalUserSessions(userId: string): void {
    if (!this.isClient()) return
    
    try {
      const userSessionsKey = `humber-user-sessions-${userId}`
      const sessionTokens = JSON.parse(localStorage.getItem(userSessionsKey) || '[]')
      
      // Delete each session
      sessionTokens.forEach((token: string) => {
        this.deleteLocalSession(token)
      })
      
      // Delete the user sessions list
      localStorage.removeItem(userSessionsKey)
      console.log('🗑️ All sessions deleted for user:', userId)
    } catch (error) {
      console.error('❌ Failed to delete user sessions from localStorage:', error)
    }
  }

  // KV store methods for production
  private async setKVSession(sessionToken: string, sessionData: SessionData): Promise<void> {
    try {
      // In a Cloudflare Worker environment, we'd have access to the KV binding
      // For now, we'll use the API approach
      const response = await fetch('/api/auth/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set',
          sessionToken,
          sessionData
        })
      })
      
      if (!response.ok) {
        throw new Error(`KV storage failed: ${response.statusText}`)
      }
      
      console.log('✅ Session stored in KV store:', sessionToken.substring(0, 8) + '...')
    } catch (error) {
      console.error('❌ Failed to store session in KV store:', error)
      // Fallback to localStorage
      this.setLocalSession(sessionToken, sessionData)
    }
  }

  private async getKVSession(sessionToken: string): Promise<SessionData | null> {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get',
          sessionToken
        })
      })
      
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`KV retrieval failed: ${response.statusText}`)
      }
      
      const sessionData = await response.json()
      console.log('✅ Session retrieved from KV store:', sessionToken.substring(0, 8) + '...')
      return sessionData
    } catch (error) {
      console.error('❌ Failed to retrieve session from KV store:', error)
      // Fallback to localStorage
      return this.getLocalSession(sessionToken)
    }
  }

  private async deleteKVSession(sessionToken: string): Promise<void> {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          sessionToken
        })
      })
      
      if (!response.ok) {
        throw new Error(`KV deletion failed: ${response.statusText}`)
      }
      
      console.log('🗑️ Session deleted from KV store:', sessionToken.substring(0, 8) + '...')
    } catch (error) {
      console.error('❌ Failed to delete session from KV store:', error)
      // Fallback to localStorage
      this.deleteLocalSession(sessionToken)
    }
  }

  private async deleteKVUserSessions(userId: string): Promise<void> {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteUser',
          userId
        })
      })
      
      if (!response.ok) {
        throw new Error(`KV user session deletion failed: ${response.statusText}`)
      }
      
      console.log('🗑️ All sessions deleted for user from KV store:', userId)
    } catch (error) {
      console.error('❌ Failed to delete user sessions from KV store:', error)
      // Fallback to localStorage
      this.deleteLocalUserSessions(userId)
    }
  }

  // Helper method to clean up expired sessions
  async cleanupExpiredSessions(): Promise<void> {
    if (!this.isProduction() && this.isClient()) {
      // Clean localStorage in development
      try {
        const keys = Object.keys(localStorage)
        const sessionKeys = keys.filter(key => key.startsWith('humber-session-'))
        
        sessionKeys.forEach(key => {
          try {
            const data = localStorage.getItem(key)
            if (data) {
              const sessionData = JSON.parse(data)
              if (new Date(sessionData.expires) < new Date()) {
                localStorage.removeItem(key)
                console.log('🧹 Cleaned expired session:', key)
              }
            }
          } catch (error) {
            // Remove corrupted session data
            localStorage.removeItem(key)
          }
        })
      } catch (error) {
        console.error('❌ Failed to cleanup expired sessions:', error)
      }
    }
  }
}

export const sessionStorage = new SessionStorage()

// Auto-cleanup expired sessions on startup
if (typeof window !== 'undefined') {
  setTimeout(() => {
    sessionStorage.cleanupExpiredSessions()
  }, 1000)
}