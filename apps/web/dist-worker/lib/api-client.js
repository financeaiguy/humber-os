const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || 'demo-tenant';
class ApiClient {
    constructor(baseUrl = API_BASE_URL, tenantId = TENANT_ID) {
        this.baseUrl = baseUrl;
        this.tenantId = tenantId;
    }
    async request(endpoint, options = {}) {
        const { params, ...init } = options;
        let url = `${this.baseUrl}${endpoint}`;
        if (params) {
            const searchParams = new URLSearchParams(params);
            url += `?${searchParams.toString()}`;
        }
        const response = await fetch(url, {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-ID': this.tenantId,
                ...init.headers,
            },
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return response.json();
    }
    async getEngineersByCategory() {
        return this.request('/bull-pen/engineers/by-category');
    }
    async getDashboardData() {
        return this.request('/bull-pen/dashboard');
    }
    async getSystemHealth() {
        return this.request('/health');
    }
    async getSystemMetrics() {
        return this.request('/metrics');
    }
    async getEngineer(id) {
        return this.request(`/api/engineers/${id}`);
    }
    async updateEngineerStatus(id, active) {
        return this.request(`/api/engineers/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ notActive: !active }),
        });
    }
    async getTimesheetsNeedingReview() {
        return this.request('/reconciliation/needs-review');
    }
    async approveTimesheet(timesheetId, approvedHours, notes) {
        return this.request('/reconciliation/human-review', {
            method: 'POST',
            body: JSON.stringify({
                timesheetId,
                reviewedBy: 'current-user',
                approvedHours,
                reviewNotes: notes,
                resolution: 'custom',
            }),
        });
    }
    async getReconciliationStats(startDate, endDate) {
        return this.request('/reconciliation/stats', {
            params: { ...(startDate && { startDate }), ...(endDate && { endDate }) },
        });
    }
    async getOperationsPipeline() {
        return this.request('/api/operations/pipeline');
    }
    async recruitCandidate(data) {
        return this.request('/operations/recruiting-step-1', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async processHiring(candidateId, data) {
        return this.request('/operations/hiring-vetting-step-2', {
            method: 'POST',
            body: JSON.stringify({ candidateId, ...data }),
        });
    }
    async submitBackgroundCheck(candidateId, data) {
        return this.request('/operations/background-checks', {
            method: 'POST',
            body: JSON.stringify({ candidateId, ...data }),
        });
    }
    async sendOfferLetter(candidateId, data) {
        return this.request('/operations/offer-letter-visa', {
            method: 'POST',
            body: JSON.stringify({ candidateId, ...data }),
        });
    }
    async deployCandidate(candidateId, data) {
        return this.request('/operations/deployment', {
            method: 'POST',
            body: JSON.stringify({ candidateId, ...data }),
        });
    }
}
export const apiClient = new ApiClient();
export default ApiClient;
//# sourceMappingURL=api-client.js.map