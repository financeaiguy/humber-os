'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState, useCallback } from 'react'
import { useRouteLoading, getRouteSkeleton } from './route-loading'
import { motion, AnimatePresence } from 'framer-motion'

interface OptimizedLinkProps {
  href: string
  children: ReactNode
  className?: string
  prefetch?: boolean
  showSkeleton?: boolean
  loadingMessage?: string
  replace?: boolean
  onClick?: () => void
}

export function OptimizedLink({ 
  href, 
  children, 
  className = '', 
  prefetch = true,
  showSkeleton = true,
  loadingMessage,
  replace = false,
  onClick
}: OptimizedLinkProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { setRouteLoading, setRouteLoadingMessage } = useRouteLoading()
  const [isNavigating, setIsNavigating] = useState(false)
  const [showSkeletonState, setShowSkeletonState] = useState(false)

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Validate href is a string
    if (typeof href !== 'string') {
      // SECURITY: console statement removed: console.warn('OptimizedLink: href must be a string, received:', typeof href, href)
      e.preventDefault()
      return
    }
    
    // Don't navigate if it's the current page
    if (href === pathname) {
      e.preventDefault()
      return
    }

    // Call custom onClick if provided
    if (onClick) {
      onClick()
    }

    // Start loading state
    setIsNavigating(true)
    setRouteLoading(true)
    
    if (loadingMessage) {
      setRouteLoadingMessage(loadingMessage)
    }

    // Show skeleton loading for better UX
    if (showSkeleton) {
      setShowSkeletonState(true)
    }

    // Navigate - ensure href is a valid string
    const targetHref = typeof href === 'string' ? href : String(href)
    if (replace) {
      router.replace(targetHref)
    } else {
      router.push(targetHref)
    }
  }, [href, pathname, onClick, setRouteLoading, setRouteLoadingMessage, loadingMessage, showSkeleton, replace, router])

  // Cleanup on route change
  useEffect(() => {
    if (pathname === href) {
      setIsNavigating(false)
      setShowSkeletonState(false)
    }
  }, [pathname, href])

  return (
    <>
      <Link 
        href={href} 
        className={className}
        prefetch={prefetch}
        onClick={handleClick}
      >
        {children}
      </Link>
      
      {/* Route-specific skeleton overlay */}
      <AnimatePresence>
        {showSkeletonState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-sm"
          >
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
              {getRouteSkeleton(href)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Specialized navigation components for common use cases
export function DashboardLink({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <OptimizedLink 
      href="/" 
      className={className}
      loadingMessage="Loading dashboard..."
    >
      {children}
    </OptimizedLink>
  )
}

export function ProjectsLink({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <OptimizedLink 
      href="/projects" 
      className={className}
      loadingMessage="Loading projects..."
    >
      {children}
    </OptimizedLink>
  )
}

export function AnalyticsLink({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <OptimizedLink 
      href="/analytics" 
      className={className}
      loadingMessage="Loading analytics data..."
      showSkeleton={true}
    >
      {children}
    </OptimizedLink>
  )
}

export function OnboardingLink({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <OptimizedLink 
      href="/onboarding" 
      className={className}
      loadingMessage="Loading onboarding..."
    >
      {children}
    </OptimizedLink>
  )
}

// Fast navigation hook for programmatic navigation
export function useFastNavigation() {
  const router = useRouter()
  const { setRouteLoading, setRouteLoadingMessage } = useRouteLoading()

  const navigate = useCallback((href: string, options?: {
    replace?: boolean
    loadingMessage?: string
    prefetch?: boolean
  }) => {
    const { replace = false, loadingMessage, prefetch = true } = options || {}
    
    // Start loading state
    setRouteLoading(true)
    if (loadingMessage) {
      setRouteLoadingMessage(loadingMessage)
    }

    // Prefetch if requested
    if (prefetch) {
      router.prefetch(href)
    }

    // Navigate - ensure href is a valid string
    const targetHref = typeof href === 'string' ? href : String(href)
    if (replace) {
      router.replace(targetHref)
    } else {
      router.push(targetHref)
    }
  }, [router, setRouteLoading, setRouteLoadingMessage])

  return { navigate }
}