'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { initializeUserAnalytics, userAnalytics } from '@/lib/user-analytics'

interface UserAnalyticsProviderProps {
  children: ReactNode
  userId?: string
  userRole?: string
}

export function UserAnalyticsProvider({ 
  children, 
  userId, 
  userRole 
}: UserAnalyticsProviderProps) {
  const pathname = usePathname()
  const initialized = useRef(false)
  const sessionId = useRef<string>()

  // Initialize analytics on mount
  useEffect(() => {
    if (typeof window === 'undefined' || initialized.current) return

    // Generate unique session ID
    sessionId.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Initialize tracking
    if (userId) {
      initializeUserAnalytics(userId, sessionId.current, userRole)
      initialized.current = true
      
      // SECURITY: console statement removed
      // User Analytics initialized for: userId, userRole, sessionId
    }
  }, [userId, userRole])

  // Track page changes
  useEffect(() => {
    if (initialized.current && pathname) {
      userAnalytics.trackPageView(pathname)
      
      // Track specific feature usage based on route
      const featureMap: Record<string, string> = {
        '/': 'dashboard',
        '/projects': 'project_management',
        '/analytics': 'analytics_dashboard',
        '/onboarding': 'employee_onboarding',
        '/recruits': 'recruitment_management',
        '/bull-pen': 'candidate_pool',
        '/clients': 'client_management',
        '/settings': 'user_settings',
        '/time': 'time_tracking'
      }
      
      const feature = featureMap[pathname]
      if (feature) {
        userAnalytics.trackFeatureUsage(feature, { route: pathname })
      }
    }
  }, [pathname])

  // Track performance metrics
  useEffect(() => {
    if (typeof window === 'undefined' || !initialized.current) return

    // Track page load performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          userAnalytics.trackPerformance('page_load_time', navEntry.loadEventEnd - navEntry.fetchStart)
          userAnalytics.trackPerformance('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart)
        }
        
        if (entry.entryType === 'paint') {
          userAnalytics.trackPerformance(`${entry.name}_time`, entry.startTime)
        }
      }
    })

    try {
      observer.observe({ entryTypes: ['navigation', 'paint'] })
    } catch (e) {
      // Performance Observer not supported
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  // Export analytics data periodically (for internal business use)
  useEffect(() => {
    if (typeof window === 'undefined' || !initialized.current) return

    const exportInterval = setInterval(() => {
      const report = userAnalytics.generateBusinessReport()
      
      // Store in localStorage for admin access (internal tool)
      localStorage.setItem('humber_analytics_report', JSON.stringify({
        ...report,
        timestamp: new Date().toISOString(),
        userId,
        sessionId: sessionId.current
      }))
    }, 5 * 60 * 1000) // Every 5 minutes

    return () => clearInterval(exportInterval)
  }, [userId])

  // Track when user becomes idle/active
  useEffect(() => {
    if (typeof window === 'undefined' || !initialized.current) return

    let idleTimer: NodeJS.Timeout
    let isIdle = false

    const resetIdleTimer = () => {
      clearTimeout(idleTimer)
      if (isIdle) {
        isIdle = false
        userAnalytics.trackFeatureUsage('user_active')
      }
      
      idleTimer = setTimeout(() => {
        isIdle = true
        userAnalytics.trackFeatureUsage('user_idle')
      }, 5 * 60 * 1000) // 5 minutes
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, { passive: true })
    })

    resetIdleTimer()

    return () => {
      clearTimeout(idleTimer)
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer)
      })
    }
  }, [])

  return <>{children}</>
}

// Admin component for viewing analytics (development only)
export function AnalyticsDebugPanel() {
  if (process.env.NODE_ENV === 'production') return null

  const handleExportData = () => {
    const data = userAnalytics.exportToJSON()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `humber-analytics-${new Date().toISOString()}.json`
    a.click()
  }

  const handleViewReport = () => {
    const report = userAnalytics.generateBusinessReport()
    // SECURITY: console statement removedtable(report)
    alert('Analytics report logged to console')
  }

  const handleClearData = () => {
    userAnalytics.clearData()
    localStorage.removeItem('humber_analytics_report')
    alert('Analytics data cleared')
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg text-xs space-y-2">
      <div className="font-bold">Analytics Debug</div>
      <div className="space-x-2">
        <button 
          onClick={handleViewReport}
          className="bg-blue-600 px-2 py-1 rounded hover:bg-blue-700"
        >
          View Report
        </button>
        <button 
          onClick={handleExportData}
          className="bg-green-600 px-2 py-1 rounded hover:bg-green-700"
        >
          Export Data
        </button>
        <button 
          onClick={handleClearData}
          className="bg-red-600 px-2 py-1 rounded hover:bg-red-700"
        >
          Clear Data
        </button>
      </div>
    </div>
  )
}