'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import NProgress from 'nprogress'

// Configure NProgress for optimal performance
if (typeof window !== 'undefined') {
  NProgress.configure({
    showSpinner: false,
    trickleSpeed: 100,
    minimum: 0.1,
    easing: 'ease',
    speed: 300
  })
}

// Route-specific loading configurations
const ROUTE_CONFIGS = {
  '/': { preload: true, cache: true },
  '/projects': { preload: true, cache: true },
  '/analytics': { preload: false, cache: true, slowRoute: true },
  '/onboarding': { preload: true, cache: true },
  '/settings': { preload: true, cache: true },
  '/clients': { preload: true, cache: true },
  '/recruits': { preload: true, cache: true },
  '/time': { preload: true, cache: true },
  '/bull-pen': { preload: true, cache: true },
  '/knowledge': { preload: true, cache: true }
}

export function GlobalLoadingIndicator() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isSlowLoading, setIsSlowLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const slowTimeoutRef = useRef<NodeJS.Timeout>()
  const startTimeRef = useRef<number>()

  const handleStart = useCallback(() => {
    startTimeRef.current = Date.now()
    setIsLoading(true)
    setLoadingProgress(0)
    setIsSlowLoading(false)
    
    // Start NProgress
    NProgress.start()
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + Math.random() * 10
      })
    }, 100)
    
    // Detect slow routes
    slowTimeoutRef.current = setTimeout(() => {
      setIsSlowLoading(true)
    }, 1000)
    
    return () => {
      clearInterval(progressInterval)
      if (slowTimeoutRef.current) clearTimeout(slowTimeoutRef.current)
    }
  }, [])

  const handleComplete = useCallback(() => {
    const loadTime = startTimeRef.current ? Date.now() - startTimeRef.current : 0
    
    setLoadingProgress(100)
    
    // Small delay to show completion
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false)
      setIsSlowLoading(false)
      NProgress.done()
    }, loadTime > 2000 ? 200 : 100)
    
    if (slowTimeoutRef.current) clearTimeout(slowTimeoutRef.current)
  }, [])

  useEffect(() => {
    // Route change detection
    handleComplete()

    // Preload common routes for faster navigation
    const routeConfig = ROUTE_CONFIGS[pathname as keyof typeof ROUTE_CONFIGS]
    if (routeConfig?.preload) {
      Object.keys(ROUTE_CONFIGS).forEach(route => {
        if (route !== pathname && ROUTE_CONFIGS[route as keyof typeof ROUTE_CONFIGS]?.preload) {
          router.prefetch(route)
        }
      })
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (slowTimeoutRef.current) clearTimeout(slowTimeoutRef.current)
      handleComplete()
    }
  }, [pathname, searchParams, handleComplete, router])

  return (
    <>
      {/* Enhanced Progress Bar */}
      <style jsx global>{`
        #nprogress {
          pointer-events: none;
        }

        #nprogress .bar {
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%);
          position: fixed;
          z-index: 9999;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.8), 0 0 5px rgba(139, 92, 246, 0.6);
          transition: all 0.3s ease;
        }

        #nprogress .peg {
          display: block;
          position: absolute;
          right: 0px;
          width: 100px;
          height: 100%;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.8), 0 0 5px rgba(59, 130, 246, 0.6);
          opacity: 1;
          transform: rotate(3deg) translate(0px, -4px);
        }

        .slow-loading #nprogress .bar {
          background: linear-gradient(90deg, #f59e0b 0%, #ef4444 50%, #dc2626 100%);
          animation: pulse 1s ease-in-out infinite alternate;
        }

        @keyframes pulse {
          from { box-shadow: 0 0 5px rgba(245, 158, 11, 0.5); }
          to { box-shadow: 0 0 15px rgba(245, 158, 11, 0.8); }
        }
      `}</style>

      {/* Enhanced Page Transition Indicators */}
      <AnimatePresence>
        {isLoading && (
          <>
            {/* Top Progress Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed top-0 left-0 right-0 z-[9998] pointer-events-none ${isSlowLoading ? 'slow-loading' : ''}`}
            >
              <div className="h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
            </motion.div>

            {/* Enhanced Loading Message for Slow Routes */}
            {isSlowLoading && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-6 right-6 z-[9997] pointer-events-none"
              >
                <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-lg px-4 py-2 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-yellow-500 rounded-full animate-pulse" />
                    <span className="text-sm text-slate-300">Loading complex data...</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    This may take a moment
                  </div>
                </div>
              </motion.div>
            )}

            {/* Corner Loading Indicator */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed bottom-6 right-6 z-[9997] pointer-events-none"
            >
              <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-full p-2">
                <div className="h-4 w-4 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export function PageLoadingIndicator({ route }: { route?: string }) {
  const [loadingTip, setLoadingTip] = useState('')

  useEffect(() => {
    const tips = [
      'Loading your dashboard...',
      'Fetching latest data...',
      'Preparing your workspace...',
      'Almost ready...'
    ]
    
    let tipIndex = 0
    const interval = setInterval(() => {
      setLoadingTip(tips[tipIndex % tips.length])
      tipIndex++
    }, 1500)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="flex flex-col items-center max-w-sm mx-auto"
      >
        {/* Enhanced Spinner */}
        <div className="relative mb-6">
          <div className="h-20 w-20 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin" />
          <div className="absolute inset-2">
            <div className="h-12 w-12 rounded-full border-4 border-slate-800 border-r-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
          </div>
        </div>
        
        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <h3 className="text-lg font-semibold text-white mb-2">
            Humber Operations
          </h3>
          <motion.p 
            key={loadingTip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-slate-400"
          >
            {loadingTip || 'Loading...'}
          </motion.p>
        </motion.div>
        
        {/* Progress Dots */}
        <div className="flex space-x-2 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 bg-blue-500 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export function InlineLoadingIndicator({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3'
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full border-slate-700 border-t-blue-500 animate-spin`} />
  )
}

// Skeleton Loading Components for Better Perceived Performance
export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="h-12 w-12 bg-slate-700 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-700 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-700 rounded" />
        <div className="h-3 bg-slate-700 rounded w-5/6" />
        <div className="h-3 bg-slate-700 rounded w-4/6" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6">
      <div className="h-6 bg-slate-700 rounded w-1/4 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 animate-pulse">
            <div className="h-8 w-8 bg-slate-700 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-700 rounded w-3/4" />
              <div className="h-3 bg-slate-700 rounded w-1/2" />
            </div>
            <div className="h-6 w-16 bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 animate-pulse">
      <div className="h-6 bg-slate-700 rounded w-1/3 mb-4" />
      <div className="h-64 bg-slate-700/50 rounded flex items-end justify-between p-4 space-x-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div 
            key={i} 
            className="bg-slate-600 rounded-t" 
            style={{ height: `${Math.random() * 80 + 20}%`, width: '12%' }}
          />
        ))}
      </div>
    </div>
  )
}