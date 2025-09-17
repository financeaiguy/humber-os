'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/sidebar'
import { SessionManager } from '@/components/session-manager'
import dynamic from 'next/dynamic'

// Lazy load heavy components
import { ProfessionalChat } from '@/components/professional-chat'
// import { GlobalHelpTrigger } from '@/components/help-center'
import { EmployeeHeader } from '@/components/employee-header'
import { useSession } from '@/components/session-context'
import { getPlatformClasses } from '@/lib/platform'
import { PlatformTest } from '@/components/platform-test'
import { DesignToggle } from '@/components/design-toggle'
import { JobsLayout } from '@/components/jobs-layout'
// import { UserAnalyticsProvider, AnalyticsDebugPanel } from '@/components/user-analytics-provider'
// Performance monitoring disabled for now
// import { PerformanceMonitor, initSmartPreloading, optimizeForMobile } from '@/lib/performance'
// import { ProductionPerformanceTracker } from '@/components/performance-monitor'

interface LayoutClientProps {
  children: React.ReactNode
}

export function LayoutClient({ children }: LayoutClientProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [platformClasses, setPlatformClasses] = useState('')
  const [isJobsMode, setIsJobsMode] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()
  
  // Check if current path is an auth page
  const isAuthPage = pathname.startsWith('/auth')
  
  // Set platform classes and check design mode
  useEffect(() => {
    setPlatformClasses(getPlatformClasses())
    
    // Check for Jobs mode - but disable it for operational and auth pages
    const designMode = document.documentElement.getAttribute('data-design-mode')
    const operationalPages = ['/bull-pen', '/onboarding', '/time', '/analytics', '/projects']
    const isOperationalPage = operationalPages.some(page => pathname.startsWith(page))
    
    setIsJobsMode(designMode === 'jobs' && !isOperationalPage && !isAuthPage)
  }, [pathname, isAuthPage])
  
  // Don't show sidebar or chat on auth pages
  if (isAuthPage) {
    return <>{children}</>
  }
  
  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }
  
  // Show authentication required message if not authenticated
  if (status === 'unauthenticated' || !session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Authentication Required</h1>
            <p className="text-slate-400">Please sign in to access the dashboard.</p>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-lg rounded-xl border border-slate-700/50 p-6">
            <Link 
              href="/auth/signin"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              Sign In
            </Link>
            
            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <p className="text-sm text-slate-500 mb-3">Development credentials:</p>
              <div className="space-y-1 text-xs text-slate-400">
                <div>• Partner Admin: partner@ford.com / partner123</div>
                <div>• Engineer: employee@humber.com / employee123</div>
                <div>• Operator: operator@humber.com / operator123</div>
              </div>
            </div>
          </div>
          
          <footer className="text-center mt-8 text-xs text-slate-500">
            © 2024 Humber Operations - Engineering Staffing Solutions
          </footer>
        </div>
      </div>
    )
  }
  
  // Use Jobs layout if in Jobs mode
  if (isJobsMode) {
    return (
      <>
        <JobsLayout>{children}</JobsLayout>
        <DesignToggle />
      </>
    )
  }

  // Check if user should have sidebar (not employee role)
  const isEmployee = session?.user?.role === 'ENGINEER_EMPLOYEE'
  const shouldShowSidebar = session && !isEmployee

  return (
    <div className={`flex flex-col min-h-screen bg-slate-950 ${platformClasses}`}>
      {/* Session Manager - handles persistent login */}
      <SessionManager />
      
      <div className="flex flex-1">
        {shouldShowSidebar && <Sidebar />}
        <main className={`flex-1 flex flex-col ${shouldShowSidebar ? 'lg:ml-64' : ''}`}>
          {isEmployee && <EmployeeHeader />}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 !bg-slate-950">
            {children}
          </div>
        </main>
      </div>
      
      {/* Compact Professional Footer */}
      <footer className="bg-slate-900/80 backdrop-blur-xl border-t border-slate-700/30 mt-auto">
        <div className={`px-4 py-3 ${shouldShowSidebar ? 'lg:ml-64' : ''}`}>
          {/* Main footer content */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-2">
            <span className="text-xs text-slate-500">
              © 2024 Humber Operations - Engineering Staffing Solutions
            </span>
            <div className="flex items-center space-x-3">
              {/* LinkedIn */}
              <a 
                href="https://linkedin.com/company/humber-operations" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-blue-400 transition-colors"
                title="Follow us on LinkedIn"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              
              {/* Twitter/X */}
              <a 
                href="https://twitter.com/humberops" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-blue-400 transition-colors"
                title="Follow us on X (Twitter)"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              
              {/* Instagram */}
              <a 
                href="https://instagram.com/humberoperations" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-pink-400 transition-colors"
                title="Follow us on Instagram"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              
              {/* YouTube */}
              <a 
                href="https://youtube.com/@humberoperations" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-red-400 transition-colors"
                title="Subscribe to our YouTube"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              
              {/* GitHub */}
              <a 
                href="https://github.com/humber-operations" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-gray-300 transition-colors"
                title="View our open source projects"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-500">v1.0</span>
            </div>
          </div>
          
          {/* Legal links */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-700/30 text-xs">
            <Link href="/privacy" className="text-slate-500 hover:text-blue-400 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/terms" className="text-slate-500 hover:text-blue-400 transition-colors">
              Terms & Conditions
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/biometric-consent" className="text-slate-500 hover:text-blue-400 transition-colors">
              Biometric Consent
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/employee-handbook" className="text-slate-500 hover:text-blue-400 transition-colors">
              Employee Handbook
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/compliance" className="text-slate-500 hover:text-blue-400 transition-colors">
              Compliance
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/licensing" className="text-slate-500 hover:text-blue-400 transition-colors">
              Licensing
            </Link>
            <span className="text-slate-700">•</span>
            <a href="mailto:legal@humberops.com" className="text-slate-500 hover:text-blue-400 transition-colors">
              Legal Contact
            </a>
          </div>
        </div>
      </footer>
      
      {/* Professional AI Chat - only show when authenticated */}
      {session && (
        <ProfessionalChat 
          isOpen={isChatOpen} 
          onToggle={() => setIsChatOpen(!isChatOpen)}
        />
      )}

      {/* Global Help System - integrated into chat widget */}
      {/* <GlobalHelpTrigger /> */}
      
      {/* Platform Test Component - for development only */}
      {false && <PlatformTest />}
      
      {/* Performance monitoring disabled */}
      
      {/* Design Mode Toggle - temporarily disabled */}
      {false && <DesignToggle />}
      
      {/* Analytics Debug Panel - disabled */}
      {/* <AnalyticsDebugPanel /> */}
      </div>
  )
}
