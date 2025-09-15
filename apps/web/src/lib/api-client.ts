const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || 'demo-tenant'

interface RequestOptions extends RequestInit {
  params?: Record<string, string>
}

class ApiClient {
  private baseUrl: string
  private tenantId: string

  constructor(baseUrl: string = API_BASE_URL, tenantId: string = TENANT_ID) {
    this.baseUrl = baseUrl
    this.tenantId = tenantId
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, ...init } = options
    
    let url = `${this.baseUrl}${endpoint}`
    if (params) {
      const searchParams = new URLSearchParams(params)
      url += `?${searchParams.toString()}`
    }

    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': this.tenantId,
        ...init.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Bull Pen Dashboard APIs
  async getEngineersByCategory() {
    return this.request<any>('/bull-pen/engineers/by-category')
  }
  
  async getDashboardData() {
    return this.request<any>('/bull-pen/dashboard')
  }
  
  async getSystemHealth() {
    return this.request<any>('/health')
  }
  
  async getSystemMetrics() {
    return this.request<any>('/metrics')
  }

  async getEngineer(id: string) {
    return this.request<any>(`/api/engineers/${id}`)
  }

  async updateEngineerStatus(id: string, active: boolean) {
    return this.request<any>(`/api/engineers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ notActive: !active }),
    })
  }

  // Timesheet Reconciliation APIs
  async getTimesheetsNeedingReview() {
    return this.request<any>('/reconciliation/needs-review')
  }

  async approveTimesheet(timesheetId: string, approvedHours: number, notes: string) {
    return this.request<any>('/reconciliation/human-review', {
      method: 'POST',
      body: JSON.stringify({
        timesheetId,
        reviewedBy: 'current-user', // This would come from auth context
        approvedHours,
        reviewNotes: notes,
        resolution: 'custom',
      }),
    })
  }

  async getReconciliationStats(startDate?: string, endDate?: string) {
    return this.request<any>('/reconciliation/stats', {
      params: { ...(startDate && { startDate }), ...(endDate && { endDate }) },
    })
  }

  // Operations Pipeline APIs
  async getOperationsPipeline() {
    return this.request<any>('/api/operations/pipeline')
  }

  async recruitCandidate(data: any) {
    return this.request<any>('/operations/recruiting-step-1', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async processHiring(candidateId: string, data: any) {
    return this.request<any>('/operations/hiring-vetting-step-2', {
      method: 'POST',
      body: JSON.stringify({ candidateId, ...data }),
    })
  }

  async submitBackgroundCheck(candidateId: string, data: any) {
    return this.request<any>('/operations/background-checks', {
      method: 'POST',
      body: JSON.stringify({ candidateId, ...data }),
    })
  }

  async sendOfferLetter(candidateId: string, data: any) {
    return this.request<any>('/operations/offer-letter-visa', {
      method: 'POST',
      body: JSON.stringify({ candidateId, ...data }),
    })
  }

  async deployCandidate(candidateId: string, data: any) {
    return this.request<any>('/operations/deployment', {
      method: 'POST',
      body: JSON.stringify({ candidateId, ...data }),
    })
  }
}

export const apiClient = new ApiClient()
export default ApiClient