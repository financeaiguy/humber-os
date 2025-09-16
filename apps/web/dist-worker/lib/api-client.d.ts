declare class ApiClient {
    private baseUrl;
    private tenantId;
    constructor(baseUrl?: string, tenantId?: string);
    private request;
    getEngineersByCategory(): Promise<any>;
    getDashboardData(): Promise<any>;
    getSystemHealth(): Promise<any>;
    getSystemMetrics(): Promise<any>;
    getEngineer(id: string): Promise<any>;
    updateEngineerStatus(id: string, active: boolean): Promise<any>;
    getTimesheetsNeedingReview(): Promise<any>;
    approveTimesheet(timesheetId: string, approvedHours: number, notes: string): Promise<any>;
    getReconciliationStats(startDate?: string, endDate?: string): Promise<any>;
    getOperationsPipeline(): Promise<any>;
    recruitCandidate(data: any): Promise<any>;
    processHiring(candidateId: string, data: any): Promise<any>;
    submitBackgroundCheck(candidateId: string, data: any): Promise<any>;
    sendOfferLetter(candidateId: string, data: any): Promise<any>;
    deployCandidate(candidateId: string, data: any): Promise<any>;
}
export declare const apiClient: ApiClient;
export default ApiClient;
//# sourceMappingURL=api-client.d.ts.map