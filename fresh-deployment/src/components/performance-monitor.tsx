'use client'

import { useEffect, useState } from 'react'
import { PerformanceMonitor } from '@/lib/performance'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react'

interface PerformanceData {
  routeTimings: Record<string, number>
  slowRoutes: string[]
  preloadedCount: number
  currentRoute: string
  loadTime: number
}

export function PerformanceDevPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [isProduction, setIsProduction] = useState(false)

  useEffect(() => {
    setIsProduction(process.env.NODE_ENV === 'production')
    
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const monitor = PerformanceMonitor.getInstance()
        const report = monitor.getPerformanceReport()
        setPerformanceData({
          ...report,
          currentRoute: window.location.pathname,
          loadTime: performance.now()
        })
      }, 2000)

      // Toggle with Ctrl+Shift+P
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
          setIsOpen(prev => !prev)
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => {
        clearInterval(interval)
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [])

  if (isProduction || !performanceData) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed top-4 right-4 z-[9999] w-80 bg-slate-900/95 backdrop-blur-lg border border-slate-700 rounded-lg shadow-2xl"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-400" />
                Performance Monitor
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {/* Current Route Performance */}
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center text-sm text-slate-300 mb-2">
                  <Zap className="h-4 w-4 mr-2" />
                  Current Route: {performanceData.currentRoute}
                </div>
                <div className="text-xs text-slate-400">
                  Avg Load Time: {performanceData.routeTimings[performanceData.currentRoute]?.toFixed(0) || 'N/A'}ms
                </div>
              </div>

              {/* Route Timings */}
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center text-sm text-slate-300 mb-2">
                  <Clock className="h-4 w-4 mr-2" />
                  Route Performance
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {Object.entries(performanceData.routeTimings).map(([route, time]) => (
                    <div key={route} className="flex justify-between text-xs">
                      <span className="text-slate-400 truncate">{route}</span>
                      <span className={`${time > 2000 ? 'text-red-400' : time > 1000 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {time.toFixed(0)}ms
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimizations */}
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center text-sm text-slate-300 mb-2">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Optimizations
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Preloaded Routes</span>
                    <span className="text-green-400">{performanceData.preloadedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Slow Routes</span>
                    <span className={performanceData.slowRoutes.length > 0 ? 'text-red-400' : 'text-green-400'}>
                      {performanceData.slowRoutes.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Slow Routes Alert */}
              {performanceData.slowRoutes.length > 0 && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                  <div className="text-sm text-red-400 mb-1">Slow Routes Detected:</div>
                  {performanceData.slowRoutes.map(route => (
                    <div key={route} className="text-xs text-red-300">{route}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 text-xs text-slate-500 text-center">
              Press Ctrl+Shift+P to toggle
            </div>
          </div>
        </motion.div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-[9999] w-12 h-12 bg-slate-900/90 backdrop-blur-lg border border-slate-700 rounded-full flex items-center justify-center hover:bg-slate-800/90 transition-colors"
        >
          <Activity className="h-5 w-5 text-green-400" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

// Production performance tracking (lightweight)
export function ProductionPerformanceTracker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return

    const monitor = PerformanceMonitor.getInstance()
    
    // Track page load performance
    const trackPageLoad = () => {
      const loadTime = performance.now()
      const route = window.location.pathname
      
      // Send to analytics (implement your analytics service here)
      if (loadTime > 3000) {
        console.warn(`Slow page load detected: ${route} (${loadTime.toFixed(0)}ms)`)
      }
    }

    // Track on load
    if (document.readyState === 'complete') {
      trackPageLoad()
    } else {
      window.addEventListener('load', trackPageLoad)
    }

    return () => {
      window.removeEventListener('load', trackPageLoad)
    }
  }, [])

  return null
}