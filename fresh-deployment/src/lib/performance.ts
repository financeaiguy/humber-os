// Advanced Performance Monitoring and Optimization
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private routeTimings: Map<string, number[]> = new Map()
  private preloadedRoutes: Set<string> = new Set()
  private observer: IntersectionObserver | null = null

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Track route navigation timing
  startRouteTimer(route: string): void {
    if (typeof window !== 'undefined') {
      const startTime = performance.now()
      sessionStorage.setItem(`route_start_${route}`, startTime.toString())
    }
  }

  endRouteTimer(route: string): number {
    if (typeof window === 'undefined') return 0

    const startTimeStr = sessionStorage.getItem(`route_start_${route}`)
    if (!startTimeStr) return 0

    const startTime = parseFloat(startTimeStr)
    const endTime = performance.now()
    const duration = endTime - startTime

    // Store timing data
    if (!this.routeTimings.has(route)) {
      this.routeTimings.set(route, [])
    }
    this.routeTimings.get(route)!.push(duration)

    // Clean up
    sessionStorage.removeItem(`route_start_${route}`)

    return duration
  }

  // Get average route timing
  getAverageRouteTime(route: string): number {
    const timings = this.routeTimings.get(route)
    if (!timings || timings.length === 0) return 0
    return timings.reduce((a, b) => a + b, 0) / timings.length
  }

  // Identify slow routes
  getSlowRoutes(threshold: number = 2000): string[] {
    const slowRoutes: string[] = []
    for (const [route, timings] of this.routeTimings.entries()) {
      const avgTime = this.getAverageRouteTime(route)
      if (avgTime > threshold) {
        slowRoutes.push(route)
      }
    }
    return slowRoutes
  }

  // Intelligent preloading based on user behavior
  initIntelligentPreloading(): void {
    if (typeof window === 'undefined' || this.observer) return

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement
          const href = element.getAttribute('data-preload-href')
          if (href && !this.preloadedRoutes.has(href)) {
            this.preloadRoute(href)
          }
        }
      })
    }, {
      rootMargin: '50px'
    })
  }

  // Preload route with intelligent caching
  preloadRoute(href: string): void {
    if (typeof window === 'undefined' || this.preloadedRoutes.has(href)) return

    // For App Router, we'll use native prefetch instead of router.prefetch
    // Create a hidden link and trigger prefetch
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href
    document.head.appendChild(link)
    
    this.preloadedRoutes.add(href)

    // Preload critical resources
    this.preloadCriticalResources(href)
    
    // Clean up the link after a short delay
    setTimeout(() => {
      document.head.removeChild(link)
    }, 100)
  }

  // Preload critical resources for a route
  private preloadCriticalResources(route: string): void {
    const resourceMap: Record<string, string[]> = {
      '/analytics': [
        // Preload chart library chunks
        '/_next/static/chunks/recharts',
        '/_next/static/chunks/analytics'
      ],
      '/projects': [
        '/_next/static/chunks/framer-motion',
        '/_next/static/chunks/projects'
      ],
      '/onboarding': [
        '/_next/static/chunks/onboarding'
      ]
    }

    const resources = resourceMap[route]
    if (resources) {
      resources.forEach(resource => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = resource
        document.head.appendChild(link)
      })
    }
  }

  // Clean up observer
  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }

  // Performance analytics for monitoring
  getPerformanceReport(): {
    routeTimings: Record<string, number>
    slowRoutes: string[]
    preloadedCount: number
    webVitals: any
  } {
    const report: any = {
      routeTimings: {},
      slowRoutes: this.getSlowRoutes(),
      preloadedCount: this.preloadedRoutes.size,
      webVitals: {}
    }

    // Convert Map to object
    for (const [route, timings] of this.routeTimings.entries()) {
      report.routeTimings[route] = this.getAverageRouteTime(route)
    }

    // Get Web Vitals if available
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming
              report.webVitals.loadTime = navEntry.loadEventEnd - navEntry.loadEventStart
              report.webVitals.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart
            }
          }
        })
        observer.observe({ entryTypes: ['navigation'] })
      } catch (e) {
        // Ignore if not supported
      }
    }

    return report
  }
}

// Enhanced route configurations for optimal loading
export const ROUTE_PERFORMANCE_CONFIG = {
  '/': {
    priority: 'high',
    preloadDependencies: ['/projects', '/analytics'],
    cacheStrategy: 'immediate',
    skeletonType: 'dashboard'
  },
  '/projects': {
    priority: 'high',
    preloadDependencies: ['/projects/new'],
    cacheStrategy: 'immediate',
    skeletonType: 'projects'
  },
  '/analytics': {
    priority: 'medium',
    preloadDependencies: [],
    cacheStrategy: 'lazy',
    skeletonType: 'analytics',
    heavyRoute: true,
    loadingTimeout: 5000
  },
  '/onboarding': {
    priority: 'high',
    preloadDependencies: ['/onboarding/new'],
    cacheStrategy: 'immediate',
    skeletonType: 'onboarding'
  },
  '/settings': {
    priority: 'low',
    preloadDependencies: [],
    cacheStrategy: 'lazy',
    skeletonType: 'default'
  }
} as const

// Smart preloading based on user patterns
export function initSmartPreloading(): void {
  if (typeof window === 'undefined') return

  const monitor = PerformanceMonitor.getInstance()
  monitor.initIntelligentPreloading()

  // Preload high-priority routes after initial load
  setTimeout(() => {
    Object.entries(ROUTE_PERFORMANCE_CONFIG).forEach(([route, config]) => {
      if (config.priority === 'high') {
        monitor.preloadRoute(route)
      }
    })
  }, 1000)

  // Preload based on common navigation patterns
  const currentPath = window.location.pathname
  const config = ROUTE_PERFORMANCE_CONFIG[currentPath as keyof typeof ROUTE_PERFORMANCE_CONFIG]
  
  if (config?.preloadDependencies) {
    config.preloadDependencies.forEach(dep => {
      setTimeout(() => monitor.preloadRoute(dep), 500)
    })
  }
}

// Performance optimization utilities
export function optimizeForMobile(): void {
  if (typeof window === 'undefined') return

  // Disable animations on slow devices
  const isSlowDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2
  if (isSlowDevice) {
    document.documentElement.style.setProperty('--animation-duration', '0s')
  }

  // Reduce motion for accessibility
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--animation-duration', '0.1s')
  }
}

// Bundle size optimization
export function shouldLoadFeature(feature: string): boolean {
  const featureFlags = {
    analytics: true,
    charts: true,
    animations: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    fullFeatures: navigator.connection?.effectiveType !== 'slow-2g'
  }

  return featureFlags[feature as keyof typeof featureFlags] ?? true
}