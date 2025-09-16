'use client';
import { useCallback, useRef, useEffect } from 'react';
import { useUserAnalytics } from '@/lib/user-analytics';
export function useWorkflowTracking() {
    const analytics = useUserAnalytics();
    const workflowTimers = useRef({});
    const startWorkflow = useCallback((workflowName) => {
        workflowTimers.current[workflowName] = new Date();
        analytics.trackFeatureUsage('workflow_started', { workflow: workflowName });
    }, [analytics]);
    const completeWorkflow = useCallback((workflowName) => {
        const startTime = workflowTimers.current[workflowName];
        if (startTime) {
            const timeToComplete = new Date().getTime() - startTime.getTime();
            analytics.trackWorkflow(workflowName, timeToComplete);
            delete workflowTimers.current[workflowName];
            analytics.trackFeatureUsage('workflow_completed', {
                workflow: workflowName,
                duration: timeToComplete,
                efficiency: timeToComplete < 60000 ? 'high' : timeToComplete < 300000 ? 'medium' : 'low'
            });
        }
    }, [analytics]);
    const cancelWorkflow = useCallback((workflowName) => {
        analytics.trackFeatureUsage('workflow_cancelled', { workflow: workflowName });
        delete workflowTimers.current[workflowName];
    }, [analytics]);
    return { startWorkflow, completeWorkflow, cancelWorkflow };
}
export function useEngagementTracking() {
    const analytics = useUserAnalytics();
    const trackButtonClick = useCallback((buttonName, context) => {
        analytics.trackFeatureUsage('button_click', { button: buttonName, context });
    }, [analytics]);
    const trackFormSubmission = useCallback((formName, success, errors) => {
        analytics.trackFeatureUsage('form_submission', {
            form: formName,
            success,
            errors,
            errorCount: errors?.length || 0
        });
    }, [analytics]);
    const trackSearchQuery = useCallback((query, results, context) => {
        analytics.trackFeatureUsage('search_query', { query, results, context });
    }, [analytics]);
    const trackFilterUsage = useCallback((filterType, filterValue, resultCount) => {
        analytics.trackFeatureUsage('filter_usage', { filterType, filterValue, resultCount });
    }, [analytics]);
    const trackExportAction = useCallback((exportType, recordCount, format) => {
        analytics.trackDataExport(format, recordCount);
        analytics.trackFeatureUsage('data_export', { exportType, recordCount, format });
    }, [analytics]);
    return {
        trackButtonClick,
        trackFormSubmission,
        trackSearchQuery,
        trackFilterUsage,
        trackExportAction
    };
}
export function useRecruitmentAnalytics() {
    const analytics = useUserAnalytics();
    const { startWorkflow, completeWorkflow } = useWorkflowTracking();
    const trackCandidateViewed = useCallback((candidateId, source) => {
        analytics.trackFeatureUsage('candidate_viewed', { candidateId, source });
    }, [analytics]);
    const trackCandidateStatusChange = useCallback((candidateId, fromStatus, toStatus) => {
        analytics.trackFeatureUsage('candidate_status_change', {
            candidateId,
            fromStatus,
            toStatus,
            statusFlow: `${fromStatus} → ${toStatus}`
        });
    }, [analytics]);
    const trackInterviewScheduled = useCallback((candidateId, interviewType) => {
        analytics.trackFeatureUsage('interview_scheduled', { candidateId, interviewType });
    }, [analytics]);
    const trackOnboardingStarted = useCallback((candidateId) => {
        startWorkflow('employee_onboarding');
        analytics.trackFeatureUsage('onboarding_started', { candidateId });
    }, [analytics, startWorkflow]);
    const trackOnboardingCompleted = useCallback((employeeId) => {
        completeWorkflow('employee_onboarding');
        analytics.trackFeatureUsage('onboarding_completed', { employeeId });
    }, [analytics, completeWorkflow]);
    return {
        trackCandidateViewed,
        trackCandidateStatusChange,
        trackInterviewScheduled,
        trackOnboardingStarted,
        trackOnboardingCompleted
    };
}
export function useProjectAnalytics() {
    const analytics = useUserAnalytics();
    const { trackButtonClick } = useEngagementTracking();
    const trackProjectCreated = useCallback((projectType, clientType, budget) => {
        analytics.trackFeatureUsage('project_created', { projectType, clientType, budget });
    }, [analytics]);
    const trackProjectStatusUpdate = useCallback((projectId, newStatus, completion) => {
        analytics.trackFeatureUsage('project_status_update', {
            projectId,
            newStatus,
            completion,
            milestone: completion >= 100 ? 'completed' : completion >= 75 ? 'near_completion' : completion >= 50 ? 'halfway' : 'started'
        });
    }, [analytics]);
    const trackResourceAssignment = useCallback((projectId, resourceType, count) => {
        analytics.trackFeatureUsage('resource_assignment', { projectId, resourceType, count });
    }, [analytics]);
    const trackBudgetUpdate = useCallback((projectId, newBudget, variance) => {
        analytics.trackFeatureUsage('budget_update', {
            projectId,
            newBudget,
            variance,
            varianceType: variance > 0 ? 'increase' : variance < 0 ? 'decrease' : 'unchanged'
        });
    }, [analytics]);
    const trackDeadlineMissed = useCallback((projectId, daysOverdue) => {
        analytics.trackFeatureUsage('deadline_missed', { projectId, daysOverdue });
    }, [analytics]);
    return {
        trackProjectCreated,
        trackProjectStatusUpdate,
        trackResourceAssignment,
        trackBudgetUpdate,
        trackDeadlineMissed
    };
}
export function useAnalyticsDashboard() {
    const analytics = useUserAnalytics();
    const trackChartInteraction = useCallback((chartType, interactionType, dataPoint) => {
        analytics.trackFeatureUsage('chart_interaction', { chartType, interactionType, dataPoint });
    }, [analytics]);
    const trackReportGenerated = useCallback((reportType, timeRange, filters) => {
        analytics.trackReportGeneration(reportType);
        analytics.trackFeatureUsage('report_generated', { reportType, timeRange, filters });
    }, [analytics]);
    const trackDashboardCustomization = useCallback((customizationType, value) => {
        analytics.trackFeatureUsage('dashboard_customization', { customizationType, value });
    }, [analytics]);
    const trackMetricDrilldown = useCallback((metric, level) => {
        analytics.trackFeatureUsage('metric_drilldown', { metric, level });
    }, [analytics]);
    return {
        trackChartInteraction,
        trackReportGenerated,
        trackDashboardCustomization,
        trackMetricDrilldown
    };
}
export function useEfficiencyMetrics() {
    const analytics = useUserAnalytics();
    const actionTimers = useRef({});
    const startTimedAction = useCallback((actionName) => {
        actionTimers.current[actionName] = new Date();
    }, []);
    const completeTimedAction = useCallback((actionName) => {
        const startTime = actionTimers.current[actionName];
        if (startTime) {
            const duration = new Date().getTime() - startTime.getTime();
            const efficiencyThresholds = {
                'candidate_review': 120000,
                'project_update': 180000,
                'report_generation': 300000,
                'onboarding_step': 600000,
            };
            const threshold = efficiencyThresholds[actionName] || 60000;
            const efficiency = duration < threshold ? 'efficient' : 'needs_improvement';
            analytics.trackFeatureUsage('timed_action_completed', {
                action: actionName,
                duration,
                efficiency,
                threshold
            });
            delete actionTimers.current[actionName];
            return duration;
        }
        return 0;
    }, [analytics]);
    useEffect(() => {
        const productivityTimer = setInterval(() => {
            const report = analytics.getReport();
            const productivityScore = calculateProductivityScore(report);
            analytics.trackFeatureUsage('productivity_snapshot', { score: productivityScore });
        }, 10 * 60 * 1000);
        return () => clearInterval(productivityTimer);
    }, [analytics]);
    return { startTimedAction, completeTimedAction };
}
function calculateProductivityScore(report) {
    let score = 0;
    const sessionHours = (report.userEngagement?.sessionDuration || 0) / (1000 * 60 * 60);
    if (sessionHours >= 2 && sessionHours <= 4)
        score += 25;
    else if (sessionHours >= 1 && sessionHours < 6)
        score += 15;
    else
        score += 5;
    const featureCount = report.userEngagement?.featureAdoption || 0;
    score += Math.min(featureCount * 5, 25);
    const errorRate = report.productivity?.errorRate || 0;
    if (errorRate === 0)
        score += 25;
    else if (errorRate <= 2)
        score += 15;
    else if (errorRate <= 5)
        score += 10;
    else
        score += 0;
    const avgTaskTime = report.productivity?.averageTaskTime || 0;
    if (avgTaskTime > 0 && avgTaskTime < 300000)
        score += 25;
    else if (avgTaskTime < 600000)
        score += 15;
    else
        score += 5;
    return Math.min(score, 100);
}
//# sourceMappingURL=use-business-analytics.js.map