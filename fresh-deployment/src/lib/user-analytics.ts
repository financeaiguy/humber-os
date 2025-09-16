// User Metadata Collection & Analytics System
// Comprehensive tracking for internal business optimization

export interface UserMetadata {
  // Basic Identification
  userId: string
  sessionId: string
  email?: string
  role?: string
  partnerName?: string
  
  // Device & Platform Information
  device: {
    type: 'desktop' | 'tablet' | 'mobile'
    os: string
    browser: string
    version: string
    screenResolution: string
    viewport: string
    touchCapable: boolean
    darkMode: boolean
  }
  
  // Geographic & Network
  location: {
    timezone: string
    locale: string
    country?: string
    region?: string
    connectionType: string
    networkSpeed?: string
  }
  
  // Session Information
  session: {
    startTime: Date
    duration: number
    pageViews: number
    clickCount: number
    scrollDepth: number
    idleTime: number
    exitPage?: string
  }
  
  // Behavioral Analytics
  behavior: {
    mostUsedFeatures: string[]
    averageSessionTime: number
    preferredDesignMode: 'current' | 'jobs' | null
    navigationPatterns: string[]
    errorEncounters: number
    helpRequestCount: number
  }
  
  // Business Intelligence
  business: {
    primaryWorkflow: string[]
    productivityScore: number
    featureAdoptionRate: number
    timeToComplete: Record<string, number>
    dataExportFrequency: number
    reportGenerationCount: number
  }
  
  // Performance Metrics
  performance: {
    loadTimes: Record<string, number>
    errorRate: number
    cacheHitRate: number
    apiResponseTimes: Record<string, number>
  }
}

class UserAnalytics {
  private static instance: UserAnalytics
  private metadata: Partial<UserMetadata> = {}
  private sessionStartTime: Date = new Date()
  private interactions: Array<{ timestamp: Date; action: string; data?: any }> = []
  private isTracking: boolean = true

  static getInstance(): UserAnalytics {
    if (!UserAnalytics.instance) {
      UserAnalytics.instance = new UserAnalytics()
    }
    return UserAnalytics.instance
  }

  // Initialize tracking system
  initialize(userId: string, sessionId: string, userRole?: string): void {
    if (typeof window === 'undefined') return

    this.metadata = {
      userId,
      sessionId,
      role: userRole,
      device: this.getDeviceInfo(),
      location: this.getLocationInfo(),
      session: {
        startTime: this.sessionStartTime,
        duration: 0,
        pageViews: 0,
        clickCount: 0,
        scrollDepth: 0,
        idleTime: 0
      },
      behavior: {
        mostUsedFeatures: [],
        averageSessionTime: 0,
        preferredDesignMode: null,
        navigationPatterns: [],
        errorEncounters: 0,
        helpRequestCount: 0
      },
      business: {
        primaryWorkflow: [],
        productivityScore: 0,
        featureAdoptionRate: 0,
        timeToComplete: {},
        dataExportFrequency: 0,
        reportGenerationCount: 0
      },
      performance: {
        loadTimes: {},
        errorRate: 0,
        cacheHitRate: 0,
        apiResponseTimes: {}
      }
    }

    this.setupEventListeners()
    this.trackPageView()
  }

  // Device and platform detection
  private getDeviceInfo() {
    const ua = navigator.userAgent
    const screen = window.screen
    
    return {
      type: this.getDeviceType(),
      os: this.getOperatingSystem(),
      browser: this.getBrowserInfo(),
      version: this.getBrowserVersion(),
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      touchCapable: 'ontouchstart' in window,
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }

  private getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  private getOperatingSystem(): string {
    const ua = navigator.userAgent
    if (ua.includes('Win')) return 'Windows'
    if (ua.includes('Mac')) return 'macOS'
    if (ua.includes('Linux')) return 'Linux'
    if (ua.includes('Android')) return 'Android'
    if (ua.includes('iOS')) return 'iOS'
    return 'Unknown'
  }

  private getBrowserInfo(): string {
    const ua = navigator.userAgent
    if (ua.includes('Chrome')) return 'Chrome'
    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Safari')) return 'Safari'
    if (ua.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  private getBrowserVersion(): string {
    // Simplified version detection
    const ua = navigator.userAgent
    const match = ua.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/i)
    return match ? match[2] : 'Unknown'
  }

  private getLocationInfo() {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: navigator.language,
      connectionType: this.getConnectionType()
    }
  }

  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    return connection ? connection.effectiveType || 'unknown' : 'unknown'
  }

  // Event tracking setup
  private setupEventListeners(): void {
    // Track clicks
    document.addEventListener('click', (e) => {
      this.trackInteraction('click', {
        element: (e.target as Element)?.tagName,
        className: (e.target as Element)?.className,
        id: (e.target as Element)?.id
      })
      this.incrementCounter('clickCount')
    })

    // Track scroll depth
    let maxScroll = 0
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent
        this.updateSessionData('scrollDepth', maxScroll)
      }
    })

    // Track page visibility for idle time
    let idleStart: Date | null = null
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        idleStart = new Date()
      } else if (idleStart) {
        const idleTime = new Date().getTime() - idleStart.getTime()
        this.updateSessionData('idleTime', (this.metadata.session?.idleTime || 0) + idleTime)
        idleStart = null
      }
    })

    // Track session duration
    setInterval(() => {
      const duration = new Date().getTime() - this.sessionStartTime.getTime()
      this.updateSessionData('duration', duration)
    }, 30000) // Update every 30 seconds

    // Track errors
    window.addEventListener('error', (e) => {
      this.trackError(e.error?.message || 'Unknown error', e.filename, e.lineno)
    })

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.trackError(`Unhandled Promise: ${e.reason}`)
    })
  }

  // Core tracking methods
  trackPageView(page?: string): void {
    const currentPage = page || window.location.pathname
    this.trackInteraction('page_view', { page: currentPage })
    this.incrementCounter('pageViews')
    
    // Track navigation patterns
    if (this.metadata.behavior) {
      this.metadata.behavior.navigationPatterns.push(currentPage)
      // Keep only last 20 pages
      if (this.metadata.behavior.navigationPatterns.length > 20) {
        this.metadata.behavior.navigationPatterns = this.metadata.behavior.navigationPatterns.slice(-20)
      }
    }
  }

  trackFeatureUsage(feature: string, context?: any): void {
    this.trackInteraction('feature_usage', { feature, context })
    
    if (this.metadata.behavior) {
      const features = this.metadata.behavior.mostUsedFeatures
      const index = features.indexOf(feature)
      if (index > -1) {
        features.splice(index, 1)
      }
      features.unshift(feature)
      // Keep top 10 features
      this.metadata.behavior.mostUsedFeatures = features.slice(0, 10)
    }
  }

  trackDesignModeChange(mode: 'current' | 'jobs'): void {
    this.trackInteraction('design_mode_change', { mode })
    if (this.metadata.behavior) {
      this.metadata.behavior.preferredDesignMode = mode
    }
  }

  trackWorkflowCompletion(workflow: string, timeToComplete: number): void {
    this.trackInteraction('workflow_completion', { workflow, timeToComplete })
    
    if (this.metadata.business) {
      this.metadata.business.timeToComplete[workflow] = timeToComplete
      
      // Update primary workflow
      const workflows = this.metadata.business.primaryWorkflow
      const index = workflows.indexOf(workflow)
      if (index > -1) {
        workflows.splice(index, 1)
      }
      workflows.unshift(workflow)
      this.metadata.business.primaryWorkflow = workflows.slice(0, 5)
    }
  }

  trackPerformance(metric: string, value: number): void {
    if (this.metadata.performance) {
      if (metric.includes('load_time')) {
        this.metadata.performance.loadTimes[metric] = value
      } else if (metric.includes('api_response')) {
        this.metadata.performance.apiResponseTimes[metric] = value
      }
    }
  }

  trackError(message: string, file?: string, line?: number): void {
    this.trackInteraction('error', { message, file, line })
    this.incrementCounter('errorEncounters', 'behavior')
  }

  trackDataExport(format: string, size: number): void {
    this.trackInteraction('data_export', { format, size })
    this.incrementCounter('dataExportFrequency', 'business')
  }

  trackReportGeneration(reportType: string): void {
    this.trackInteraction('report_generation', { reportType })
    this.incrementCounter('reportGenerationCount', 'business')
  }

  // Helper methods
  private trackInteraction(action: string, data?: any): void {
    this.interactions.push({
      timestamp: new Date(),
      action,
      data
    })

    // Keep only last 1000 interactions
    if (this.interactions.length > 1000) {
      this.interactions = this.interactions.slice(-1000)
    }
  }

  private incrementCounter(field: string, category: 'session' | 'behavior' | 'business' = 'session'): void {
    const categoryData = this.metadata[category] as any
    if (categoryData && categoryData[field] !== undefined) {
      categoryData[field]++
    }
  }

  private updateSessionData(field: string, value: any): void {
    if (this.metadata.session) {
      (this.metadata.session as any)[field] = value
    }
  }

  // Data retrieval and export
  getMetadata(): UserMetadata | null {
    return this.metadata as UserMetadata
  }

  getInteractions(): Array<{ timestamp: Date; action: string; data?: any }> {
    return [...this.interactions]
  }

  // Generate business intelligence report
  generateBusinessReport(): {
    userEngagement: any
    productivity: any
    technicalHealth: any
    recommendations: string[]
  } {
    const metadata = this.metadata as UserMetadata
    
    return {
      userEngagement: {
        sessionDuration: metadata.session?.duration || 0,
        pageViews: metadata.session?.pageViews || 0,
        featureAdoption: metadata.behavior?.mostUsedFeatures?.length || 0,
        designPreference: metadata.behavior?.preferredDesignMode
      },
      productivity: {
        primaryWorkflows: metadata.business?.primaryWorkflow || [],
        averageTaskTime: this.calculateAverageTaskTime(),
        errorRate: metadata.performance?.errorRate || 0,
        exportFrequency: metadata.business?.dataExportFrequency || 0
      },
      technicalHealth: {
        loadTimes: metadata.performance?.loadTimes || {},
        deviceInfo: metadata.device,
        connectionType: metadata.location?.connectionType
      },
      recommendations: this.generateRecommendations()
    }
  }

  private calculateAverageTaskTime(): number {
    const times = Object.values(this.metadata.business?.timeToComplete || {})
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    const metadata = this.metadata as UserMetadata

    // Performance recommendations
    const avgLoadTime = Object.values(metadata.performance?.loadTimes || {}).reduce((a, b) => a + b, 0) / Object.keys(metadata.performance?.loadTimes || {}).length
    if (avgLoadTime > 2000) {
      recommendations.push('Consider optimizing page load times - average exceeds 2 seconds')
    }

    // Design preference recommendations
    if (metadata.behavior?.preferredDesignMode === 'jobs') {
      recommendations.push('User prefers Jobs-inspired design - consider making it default')
    }

    // Feature usage recommendations
    if ((metadata.behavior?.mostUsedFeatures?.length || 0) < 3) {
      recommendations.push('Low feature adoption - consider user onboarding improvements')
    }

    // Error rate recommendations
    if ((metadata.behavior?.errorEncounters || 0) > 5) {
      recommendations.push('High error rate detected - investigate stability issues')
    }

    return recommendations
  }

  // Privacy and compliance
  anonymizeData(): void {
    if (this.metadata.userId) {
      this.metadata.userId = 'anonymous_' + Math.random().toString(36).substr(2, 9)
    }
    delete this.metadata.email
  }

  clearData(): void {
    this.metadata = {}
    this.interactions = []
  }

  // Data export for analysis
  exportToJSON(): string {
    return JSON.stringify({
      metadata: this.metadata,
      interactions: this.interactions,
      report: this.generateBusinessReport(),
      exportTimestamp: new Date().toISOString()
    }, null, 2)
  }
}

// Initialize global analytics instance
export const userAnalytics = UserAnalytics.getInstance()

// React hook for easy integration
export function useUserAnalytics() {
  return {
    trackPageView: (page?: string) => userAnalytics.trackPageView(page),
    trackFeatureUsage: (feature: string, context?: any) => userAnalytics.trackFeatureUsage(feature, context),
    trackWorkflow: (workflow: string, timeToComplete: number) => userAnalytics.trackWorkflowCompletion(workflow, timeToComplete),
    trackDesignMode: (mode: 'current' | 'jobs') => userAnalytics.trackDesignModeChange(mode),
    trackDataExport: (format: string, size: number) => userAnalytics.trackDataExport(format, size),
    trackReportGeneration: (reportType: string) => userAnalytics.trackReportGeneration(reportType),
    getReport: () => userAnalytics.generateBusinessReport(),
    exportData: () => userAnalytics.exportToJSON()
  }
}

// Automatic initialization helper
export function initializeUserAnalytics(userId: string, sessionId: string, userRole?: string): void {
  if (typeof window !== 'undefined') {
    userAnalytics.initialize(userId, sessionId, userRole)
  }
}