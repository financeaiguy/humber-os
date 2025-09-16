export declare function useWorkflowTracking(): {
    startWorkflow: (workflowName: string) => void;
    completeWorkflow: (workflowName: string) => void;
    cancelWorkflow: (workflowName: string) => void;
};
export declare function useEngagementTracking(): {
    trackButtonClick: (buttonName: string, context?: any) => void;
    trackFormSubmission: (formName: string, success: boolean, errors?: string[]) => void;
    trackSearchQuery: (query: string, results: number, context?: string) => void;
    trackFilterUsage: (filterType: string, filterValue: any, resultCount: number) => void;
    trackExportAction: (exportType: string, recordCount: number, format: string) => void;
};
export declare function useRecruitmentAnalytics(): {
    trackCandidateViewed: (candidateId: string, source: string) => void;
    trackCandidateStatusChange: (candidateId: string, fromStatus: string, toStatus: string) => void;
    trackInterviewScheduled: (candidateId: string, interviewType: string) => void;
    trackOnboardingStarted: (candidateId: string) => void;
    trackOnboardingCompleted: (employeeId: string) => void;
};
export declare function useProjectAnalytics(): {
    trackProjectCreated: (projectType: string, clientType: string, budget?: number) => void;
    trackProjectStatusUpdate: (projectId: string, newStatus: string, completion: number) => void;
    trackResourceAssignment: (projectId: string, resourceType: string, count: number) => void;
    trackBudgetUpdate: (projectId: string, newBudget: number, variance: number) => void;
    trackDeadlineMissed: (projectId: string, daysOverdue: number) => void;
};
export declare function useAnalyticsDashboard(): {
    trackChartInteraction: (chartType: string, interactionType: string, dataPoint?: any) => void;
    trackReportGenerated: (reportType: string, timeRange: string, filters?: any) => void;
    trackDashboardCustomization: (customizationType: string, value: any) => void;
    trackMetricDrilldown: (metric: string, level: number) => void;
};
export declare function useEfficiencyMetrics(): {
    startTimedAction: (actionName: string) => void;
    completeTimedAction: (actionName: string) => number;
};
//# sourceMappingURL=use-business-analytics.d.ts.map