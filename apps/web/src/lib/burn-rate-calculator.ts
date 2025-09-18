export interface PurchaseOrder {
  id: string
  poNumber: string
  clientName: string
  projectName?: string
  totalBudget: number
  allocatedHours: number
  startDate: string
  endDate: string
  projectId: string
  status: 'active' | 'paused' | 'completed' | 'at_risk'
}

export interface EngineerTimeEntry {
  id: string
  engineerId: string
  engineerName: string
  projectId?: string
  poId?: string
  hours: number
  date: string
  rate: number
  description?: string
  approved: boolean
}

export interface BurnRateMetrics {
  poId: string
  poNumber: string
  totalBudget: number
  allocatedHours: number
  consumedHours: number
  consumedBudget: number
  remainingHours: number
  remainingBudget: number
  percentConsumed: number
  weeklyAverageHours: number
  weeklyAverageCost: number
  weeksRemaining: number
  projectedCompletionDate: string
  burnRateStatus: 'healthy' | 'warning' | 'critical' | 'exhausted'
  engineerCount: number
  topEngineers: Array<{
    engineerId: string
    engineerName: string
    totalHours: number
    totalCost: number
    weeklyAverage: number
  }>
  weeklyTrend: Array<{
    weekStartDate: string
    hours: number
    cost: number
    engineerCount: number
  }>
  projectedOverrun: number | null
  recommendedAction: string
  alerts: BurnRateAlert[]
}

export interface BurnRateAlert {
  id: string
  poId: string
  alertType: 'warning' | 'critical' | 'exhausted'
  message: string
  threshold: number
  currentValue: number
  createdAt: string
  acknowledged: boolean
}

export class BurnRateCalculator {
  private static readonly WARNING_THRESHOLD = 0.75 // 75% consumed
  private static readonly CRITICAL_THRESHOLD = 0.90 // 90% consumed
  private static readonly WEEKS_FOR_AVERAGE = 4 // Use last 4 weeks for averaging

  static calculateBurnRate(
    po: PurchaseOrder,
    timeEntries: EngineerTimeEntry[]
  ): BurnRateMetrics {
    // Filter entries for this PO
    const poEntries = timeEntries.filter(entry => entry.poId && entry.poId === po.id && entry.approved)
    
    // Calculate consumed hours and budget
    const consumedHours = poEntries.reduce((sum, entry) => sum + entry.hours, 0)
    const consumedBudget = poEntries.reduce((sum, entry) => sum + (entry.hours * entry.rate), 0)
    
    // Calculate remaining
    const remainingHours = Math.max(0, po.allocatedHours - consumedHours)
    const remainingBudget = Math.max(0, po.totalBudget - consumedBudget)
    const percentConsumed = po.allocatedHours > 0 ? (consumedHours / po.allocatedHours) * 100 : 0
    
    // Calculate weekly averages
    const weeklyData = this.calculateWeeklyData(poEntries)
    const recentWeeks = weeklyData.slice(-this.WEEKS_FOR_AVERAGE)
    const weeklyAverageHours = recentWeeks.length > 0
      ? recentWeeks.reduce((sum, week) => sum + week.hours, 0) / recentWeeks.length
      : 0
    const weeklyAverageCost = recentWeeks.length > 0
      ? recentWeeks.reduce((sum, week) => sum + week.cost, 0) / recentWeeks.length
      : 0
    
    // Calculate weeks remaining based on burn rate
    const weeksRemaining = weeklyAverageHours > 0
      ? Math.max(0, remainingHours / weeklyAverageHours)
      : Infinity
    
    // Calculate projected completion date
    const projectedCompletionDate = this.calculateProjectedCompletionDate(weeksRemaining)
    
    // Determine burn rate status
    const burnRateStatus = this.determineBurnRateStatus(percentConsumed, remainingHours)
    
    // Get top engineers
    const topEngineers = this.calculateTopEngineers(poEntries)
    
    // Calculate projected overrun
    const projectedOverrun = this.calculateProjectedOverrun(
      weeklyAverageCost,
      weeksRemaining,
      remainingBudget
    )
    
    // Generate recommended action
    const recommendedAction = this.generateRecommendedAction(
      burnRateStatus,
      percentConsumed,
      weeksRemaining,
      projectedOverrun
    )
    
    // Count unique engineers
    const engineerCount = new Set(poEntries.map(e => e.engineerId)).size
    
    return {
      poId: po.id,
      poNumber: po.poNumber,
      totalBudget: po.totalBudget,
      allocatedHours: po.allocatedHours,
      consumedHours,
      consumedBudget,
      remainingHours,
      remainingBudget,
      percentConsumed,
      weeklyAverageHours,
      weeklyAverageCost,
      weeksRemaining,
      projectedCompletionDate,
      burnRateStatus,
      engineerCount,
      topEngineers,
      weeklyTrend: weeklyData,
      projectedOverrun,
      recommendedAction,
      alerts: this.generateAlerts(po, percentConsumed, weeksRemaining)
    }
  }

  private static calculateWeeklyData(entries: EngineerTimeEntry[]) {
    const weeklyMap = new Map<string, {
      hours: number
      cost: number
      engineers: Set<string>
    }>()
    
    entries.forEach(entry => {
      const weekStart = this.getWeekStartDate(new Date(entry.date))
      const weekKey = weekStart.toISOString().split('T')[0]
      
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, {
          hours: 0,
          cost: 0,
          engineers: new Set()
        })
      }
      
      const week = weeklyMap.get(weekKey)!
      week.hours += entry.hours
      week.cost += entry.hours * entry.rate
      week.engineers.add(entry.engineerId)
    })
    
    return Array.from(weeklyMap.entries())
      .map(([weekStartDate, data]) => ({
        weekStartDate,
        hours: data.hours,
        cost: data.cost,
        engineerCount: data.engineers.size
      }))
      .sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate))
  }

  private static getWeekStartDate(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
    return new Date(d.setDate(diff))
  }

  private static calculateTopEngineers(entries: EngineerTimeEntry[]) {
    const engineerMap = new Map<string, {
      engineerId: string
      engineerName: string
      totalHours: number
      totalCost: number
      dates: Date[]
    }>()
    
    entries.forEach(entry => {
      if (!engineerMap.has(entry.engineerId)) {
        engineerMap.set(entry.engineerId, {
          engineerId: entry.engineerId,
          engineerName: entry.engineerName,
          totalHours: 0,
          totalCost: 0,
          dates: []
        })
      }
      
      const engineer = engineerMap.get(entry.engineerId)!
      engineer.totalHours += entry.hours
      engineer.totalCost += entry.hours * entry.rate
      engineer.dates.push(new Date(entry.date))
    })
    
    return Array.from(engineerMap.values())
      .map(engineer => {
        const firstDate = new Date(Math.min(...engineer.dates.map(d => d.getTime())))
        const lastDate = new Date(Math.max(...engineer.dates.map(d => d.getTime())))
        const weeks = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
        
        return {
          engineerId: engineer.engineerId,
          engineerName: engineer.engineerName,
          totalHours: engineer.totalHours,
          totalCost: engineer.totalCost,
          weeklyAverage: engineer.totalHours / weeks
        }
      })
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 5) // Top 5 engineers
  }

  private static generateAlerts(
    po: PurchaseOrder,
    percentConsumed: number,
    weeksRemaining: number
  ): BurnRateAlert[] {
    const alerts: BurnRateAlert[] = []
    const now = new Date().toISOString()
    
    if (percentConsumed >= this.CRITICAL_THRESHOLD * 100) {
      alerts.push({
        id: `alert-${po.id}-critical`,
        poId: po.id,
        alertType: 'critical',
        message: `Critical: PO ${po.poNumber} is ${percentConsumed.toFixed(1)}% consumed`,
        threshold: this.CRITICAL_THRESHOLD * 100,
        currentValue: percentConsumed,
        createdAt: now,
        acknowledged: false
      })
    } else if (percentConsumed >= this.WARNING_THRESHOLD * 100) {
      alerts.push({
        id: `alert-${po.id}-warning`,
        poId: po.id,
        alertType: 'warning',
        message: `Warning: PO ${po.poNumber} is ${percentConsumed.toFixed(1)}% consumed`,
        threshold: this.WARNING_THRESHOLD * 100,
        currentValue: percentConsumed,
        createdAt: now,
        acknowledged: false
      })
    }
    
    if (weeksRemaining < 4 && percentConsumed < 90) {
      alerts.push({
        id: `alert-${po.id}-timeline`,
        poId: po.id,
        alertType: 'warning',
        message: `Only ${weeksRemaining.toFixed(1)} weeks remaining at current burn rate`,
        threshold: 4,
        currentValue: weeksRemaining,
        createdAt: now,
        acknowledged: false
      })
    }
    
    return alerts
  }

  private static calculateProjectedCompletionDate(weeksRemaining: number): string {
    if (weeksRemaining === Infinity) {
      return 'Unknown'
    }
    
    const date = new Date()
    date.setDate(date.getDate() + (weeksRemaining * 7))
    return date.toISOString().split('T')[0]
  }

  private static determineBurnRateStatus(
    percentConsumed: number,
    remainingHours: number
  ): BurnRateMetrics['burnRateStatus'] {
    if (remainingHours <= 0) return 'exhausted'
    if (percentConsumed >= this.CRITICAL_THRESHOLD * 100) return 'critical'
    if (percentConsumed >= this.WARNING_THRESHOLD * 100) return 'warning'
    return 'healthy'
  }

  private static calculateProjectedOverrun(
    weeklyAverageCost: number,
    weeksRemaining: number,
    remainingBudget: number
  ): number | null {
    if (weeklyAverageCost === 0 || weeksRemaining === Infinity) {
      return null
    }
    
    const projectedRemainingCost = weeklyAverageCost * weeksRemaining
    return Math.max(0, projectedRemainingCost - remainingBudget)
  }

  private static generateRecommendedAction(
    status: BurnRateMetrics['burnRateStatus'],
    percentConsumed: number,
    weeksRemaining: number,
    projectedOverrun: number | null
  ): string {
    switch (status) {
      case 'exhausted':
        return 'URGENT: Purchase order exhausted. Request additional budget or pause work immediately.'
      
      case 'critical':
        if (projectedOverrun && projectedOverrun > 0) {
          return `CRITICAL: ${percentConsumed.toFixed(1)}% consumed. Projected overrun of $${projectedOverrun.toLocaleString()}. Consider reducing team size or negotiating budget increase.`
        }
        return `CRITICAL: ${percentConsumed.toFixed(1)}% consumed with ${weeksRemaining.toFixed(1)} weeks of work remaining. Immediate action required.`
      
      case 'warning':
        return `WARNING: ${percentConsumed.toFixed(1)}% of budget consumed. Monitor closely and consider adjusting resource allocation.`
      
      case 'healthy':
        if (weeksRemaining < 4) {
          return `Healthy burn rate but approaching project end. Begin planning for project completion or extension.`
        }
        return `Burn rate is healthy. Continue monitoring weekly trends.`
    }
  }

  static formatBurnRateDisplay(metrics: BurnRateMetrics): {
    primaryMetric: string
    secondaryMetric: string
    trend: 'up' | 'down' | 'stable'
    color: string
  } {
    const trendDirection = this.calculateTrendDirection(metrics.weeklyTrend)
    
    return {
      primaryMetric: `${metrics.remainingHours.toFixed(0)} hrs remaining`,
      secondaryMetric: `${metrics.weeksRemaining === Infinity ? '∞' : metrics.weeksRemaining.toFixed(1)} weeks at current rate`,
      trend: trendDirection,
      color: this.getStatusColor(metrics.burnRateStatus)
    }
  }

  private static calculateTrendDirection(weeklyTrend: BurnRateMetrics['weeklyTrend']): 'up' | 'down' | 'stable' {
    if (weeklyTrend.length < 2) return 'stable'
    
    const recent = weeklyTrend.slice(-2)
    const change = recent[1].hours - recent[0].hours
    const percentChange = Math.abs(change / recent[0].hours)
    
    if (percentChange < 0.1) return 'stable'
    return change > 0 ? 'up' : 'down'
  }

  private static getStatusColor(status: BurnRateMetrics['burnRateStatus']): string {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'critical': return 'text-orange-500'
      case 'exhausted': return 'text-red-500'
    }
  }
}