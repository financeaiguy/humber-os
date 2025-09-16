'use client'

import { useCallback, useRef, useEffect } from 'react'
import { useUserAnalytics } from '@/lib/user-analytics'

// Business-focused analytics hooks for Humber Operations

export function useWorkflowTracking() {
  const analytics = useUserAnalytics()
  const workflowTimers = useRef<Record<string, Date>>({})

  const startWorkflow = useCallback((workflowName: string) => {
    workflowTimers.current[workflowName] = new Date()
    analytics.trackFeatureUsage('workflow_started', { workflow: workflowName })
  }, [analytics])

  const completeWorkflow = useCallback((workflowName: string) => {
    const startTime = workflowTimers.current[workflowName]
    if (startTime) {
      const timeToComplete = new Date().getTime() - startTime.getTime()
      analytics.trackWorkflow(workflowName, timeToComplete)
      delete workflowTimers.current[workflowName]
      
      // Track business efficiency metrics
      analytics.trackFeatureUsage('workflow_completed', { 
        workflow: workflowName,
        duration: timeToComplete,
        efficiency: timeToComplete < 60000 ? 'high' : timeToComplete < 300000 ? 'medium' : 'low'
      })
    }
  }, [analytics])

  const cancelWorkflow = useCallback((workflowName: string) => {
    analytics.trackFeatureUsage('workflow_cancelled', { workflow: workflowName })
    delete workflowTimers.current[workflowName]
  }, [analytics])

  return { startWorkflow, completeWorkflow, cancelWorkflow }
}

export function useEngagementTracking() {
  const analytics = useUserAnalytics()
  
  const trackButtonClick = useCallback((buttonName: string, context?: any) => {
    analytics.trackFeatureUsage('button_click', { button: buttonName, context })
  }, [analytics])

  const trackFormSubmission = useCallback((formName: string, success: boolean, errors?: string[]) => {
    analytics.trackFeatureUsage('form_submission', { 
      form: formName, 
      success, 
      errors,
      errorCount: errors?.length || 0
    })
  }, [analytics])

  const trackSearchQuery = useCallback((query: string, results: number, context?: string) => {
    analytics.trackFeatureUsage('search_query', { query, results, context })
  }, [analytics])

  const trackFilterUsage = useCallback((filterType: string, filterValue: any, resultCount: number) => {
    analytics.trackFeatureUsage('filter_usage', { filterType, filterValue, resultCount })
  }, [analytics])

  const trackExportAction = useCallback((exportType: string, recordCount: number, format: string) => {
    analytics.trackDataExport(format, recordCount)
    analytics.trackFeatureUsage('data_export', { exportType, recordCount, format })
  }, [analytics])

  return {
    trackButtonClick,
    trackFormSubmission,
    trackSearchQuery,
    trackFilterUsage,
    trackExportAction
  }
}

export function useRecruitmentAnalytics() {
  const analytics = useUserAnalytics()
  const { startWorkflow, completeWorkflow } = useWorkflowTracking()

  const trackCandidateViewed = useCallback((candidateId: string, source: string) => {
    analytics.trackFeatureUsage('candidate_viewed', { candidateId, source })
  }, [analytics])

  const trackCandidateStatusChange = useCallback((candidateId: string, fromStatus: string, toStatus: string) => {
    analytics.trackFeatureUsage('candidate_status_change', { 
      candidateId, 
      fromStatus, 
      toStatus,
      statusFlow: `${fromStatus} → ${toStatus}`
    })
  }, [analytics])

  const trackInterviewScheduled = useCallback((candidateId: string, interviewType: string) => {
    analytics.trackFeatureUsage('interview_scheduled', { candidateId, interviewType })
  }, [analytics])

  const trackOnboardingStarted = useCallback((candidateId: string) => {
    startWorkflow('employee_onboarding')
    analytics.trackFeatureUsage('onboarding_started', { candidateId })
  }, [analytics, startWorkflow])

  const trackOnboardingCompleted = useCallback((employeeId: string) => {
    completeWorkflow('employee_onboarding')
    analytics.trackFeatureUsage('onboarding_completed', { employeeId })
  }, [analytics, completeWorkflow])

  return {
    trackCandidateViewed,
    trackCandidateStatusChange,
    trackInterviewScheduled,
    trackOnboardingStarted,
    trackOnboardingCompleted
  }
}

export function useProjectAnalytics() {
  const analytics = useUserAnalytics()
  const { trackButtonClick } = useEngagementTracking()

  const trackProjectCreated = useCallback((projectType: string, clientType: string, budget?: number) => {
    analytics.trackFeatureUsage('project_created', { projectType, clientType, budget })
  }, [analytics])

  const trackProjectStatusUpdate = useCallback((projectId: string, newStatus: string, completion: number) => {
    analytics.trackFeatureUsage('project_status_update', { 
      projectId, 
      newStatus, 
      completion,
      milestone: completion >= 100 ? 'completed' : completion >= 75 ? 'near_completion' : completion >= 50 ? 'halfway' : 'started'
    })
  }, [analytics])

  const trackResourceAssignment = useCallback((projectId: string, resourceType: string, count: number) => {
    analytics.trackFeatureUsage('resource_assignment', { projectId, resourceType, count })
  }, [analytics])

  const trackBudgetUpdate = useCallback((projectId: string, newBudget: number, variance: number) => {
    analytics.trackFeatureUsage('budget_update', { 
      projectId, 
      newBudget, 
      variance,
      varianceType: variance > 0 ? 'increase' : variance < 0 ? 'decrease' : 'unchanged'
    })
  }, [analytics])

  const trackDeadlineMissed = useCallback((projectId: string, daysOverdue: number) => {
    analytics.trackFeatureUsage('deadline_missed', { projectId, daysOverdue })
  }, [analytics])

  return {
    trackProjectCreated,
    trackProjectStatusUpdate,
    trackResourceAssignment,
    trackBudgetUpdate,
    trackDeadlineMissed
  }
}

export function useAnalyticsDashboard() {
  const analytics = useUserAnalytics()

  const trackChartInteraction = useCallback((chartType: string, interactionType: string, dataPoint?: any) => {
    analytics.trackFeatureUsage('chart_interaction', { chartType, interactionType, dataPoint })
  }, [analytics])

  const trackReportGenerated = useCallback((reportType: string, timeRange: string, filters?: any) => {
    analytics.trackReportGeneration(reportType)
    analytics.trackFeatureUsage('report_generated', { reportType, timeRange, filters })
  }, [analytics])

  const trackDashboardCustomization = useCallback((customizationType: string, value: any) => {
    analytics.trackFeatureUsage('dashboard_customization', { customizationType, value })
  }, [analytics])

  const trackMetricDrilldown = useCallback((metric: string, level: number) => {
    analytics.trackFeatureUsage('metric_drilldown', { metric, level })
  }, [analytics])

  return {
    trackChartInteraction,
    trackReportGenerated,
    trackDashboardCustomization,
    trackMetricDrilldown
  }
}

// Hook for tracking business efficiency metrics
export function useEfficiencyMetrics() {
  const analytics = useUserAnalytics()
  const actionTimers = useRef<Record<string, Date>>({})

  const startTimedAction = useCallback((actionName: string) => {
    actionTimers.current[actionName] = new Date()
  }, [])

  const completeTimedAction = useCallback((actionName: string) => {
    const startTime = actionTimers.current[actionName]
    if (startTime) {
      const duration = new Date().getTime() - startTime.getTime()
      
      // Track efficiency based on action type
      const efficiencyThresholds: Record<string, number> = {
        'candidate_review': 120000, // 2 minutes
        'project_update': 180000,   // 3 minutes
        'report_generation': 300000, // 5 minutes
        'onboarding_step': 600000,  // 10 minutes
      }

      const threshold = efficiencyThresholds[actionName] || 60000
      const efficiency = duration < threshold ? 'efficient' : 'needs_improvement'

      analytics.trackFeatureUsage('timed_action_completed', {
        action: actionName,
        duration,
        efficiency,
        threshold
      })

      delete actionTimers.current[actionName]
      return duration
    }
    return 0
  }, [analytics])

  // Track user productivity patterns
  useEffect(() => {
    const productivityTimer = setInterval(() => {
      const report = analytics.getReport()
      
      // Calculate productivity score based on various factors
      const productivityScore = calculateProductivityScore(report)
      analytics.trackFeatureUsage('productivity_snapshot', { score: productivityScore })
    }, 10 * 60 * 1000) // Every 10 minutes

    return () => clearInterval(productivityTimer)
  }, [analytics])

  return { startTimedAction, completeTimedAction }
}

// Calculate productivity score based on user behavior
function calculateProductivityScore(report: any): number {
  let score = 0
  
  // Factor 1: Session duration (optimal: 2-4 hours)
  const sessionHours = (report.userEngagement?.sessionDuration || 0) / (1000 * 60 * 60)
  if (sessionHours >= 2 && sessionHours <= 4) score += 25
  else if (sessionHours >= 1 && sessionHours < 6) score += 15
  else score += 5

  // Factor 2: Feature adoption
  const featureCount = report.userEngagement?.featureAdoption || 0
  score += Math.min(featureCount * 5, 25)

  // Factor 3: Error rate (lower is better)
  const errorRate = report.productivity?.errorRate || 0
  if (errorRate === 0) score += 25
  else if (errorRate <= 2) score += 15
  else if (errorRate <= 5) score += 10
  else score += 0

  // Factor 4: Task completion efficiency
  const avgTaskTime = report.productivity?.averageTaskTime || 0
  if (avgTaskTime > 0 && avgTaskTime < 300000) score += 25 // Under 5 minutes
  else if (avgTaskTime < 600000) score += 15 // Under 10 minutes
  else score += 5

  return Math.min(score, 100)
}