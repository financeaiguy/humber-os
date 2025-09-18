import { knowledgeNervousSystem, LearningContext } from './knowledge-nervous-system'
import { KnowledgeEnhancedResponse } from './knowledge-middleware'

export interface APICallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  enableLearning?: boolean
  feature?: string
  operation?: string
}

export interface APIResponse<T = any> extends KnowledgeEnhancedResponse {
  data?: T
}

export class APIIntegrationService {
  private static instance: APIIntegrationService
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  static getInstance(): APIIntegrationService {
    if (!APIIntegrationService.instance) {
      APIIntegrationService.instance = new APIIntegrationService()
    }
    return APIIntegrationService.instance
  }

  async makeAPICall<T = any>(
    endpoint: string,
    options: APICallOptions = {}
  ): Promise<APIResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      enableLearning = true,
      feature = 'unknown',
      operation = method.toLowerCase()
    } = options

    const context: LearningContext = {
      sessionId: this.generateSessionId(),
      currentPage: this.extractPageFromEndpoint(endpoint),
      currentFeature: feature,
      userRole: 'user', // This would be determined from auth context
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV as any || 'development'
    }

    try {
      // Track API call initiation
      if (enableLearning) {
        await this.trackAPICall('api_call_initiated', {
          endpoint,
          method,
          operation
        }, context)
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          ...this.defaultHeaders,
          ...headers,
          'x-session-id': context.sessionId,
          'x-user-role': context.userRole,
          'x-knowledge-enabled': enableLearning.toString()
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      const data = await response.json() as APIResponse<T>

      // Track successful API call
      if (enableLearning && response.ok) {
        await this.trackAPICall('api_call_success', {
          endpoint,
          method,
          statusCode: response.status,
          hasAIInsights: !!data._aiInsights,
          hasRecommendations: !!data._recommendations
        }, context)
      }

      // Track failed API call
      if (enableLearning && !response.ok) {
        await this.trackAPICall('api_call_failure', {
          endpoint,
          method,
          statusCode: response.status,
          error: data.error || 'Unknown error'
        }, context)
      }

      return {
        ...data,
        _metadata: {
          ...data._metadata,
          clientProcessedAt: new Date().toISOString(),
          endpoint,
          method
        }
      }

    } catch (error) {
      console.error('API call failed:', error)

      // Track API call error
      if (enableLearning) {
        await this.trackAPICall('api_call_error', {
          endpoint,
          method,
          error: error instanceof Error ? error.message : 'Network error'
        }, context)
      }

      return {
        success: false,
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Failed to make API call',
        _metadata: {
          processedAt: new Date().toISOString(),
          sessionId: context.sessionId,
          knowledgeSystem: 'humber-nervous-system-v1',
          clientProcessedAt: new Date().toISOString(),
          endpoint,
          method
        }
      }
    }
  }

  // Specific methods for different operations
  async getRecruits(filters?: any): Promise<APIResponse<any[]>> {
    return this.makeAPICall('/api/recruits', {
      method: 'GET',
      feature: 'recruits-management',
      operation: 'list_recruits'
    })
  }

  async createRecruit(recruitData: any): Promise<APIResponse<any>> {
    return this.makeAPICall('/api/recruits', {
      method: 'POST',
      body: recruitData,
      feature: 'recruits-management',
      operation: 'create_recruit'
    })
  }

  async deployCandidate(deploymentData: any): Promise<APIResponse<any>> {
    return this.makeAPICall('/api/operations/deployment', {
      method: 'POST',
      body: deploymentData,
      feature: 'operations-deployment',
      operation: 'deploy_candidate'
    })
  }

  async createApprovalRequest(approvalData: any): Promise<APIResponse<any>> {
    return this.makeAPICall('/api/projects/approvals', {
      method: 'POST',
      body: approvalData,
      feature: 'project-approvals',
      operation: 'create_approval'
    })
  }

  async processApproval(approvalId: string, action: string, notes?: string): Promise<APIResponse<any>> {
    return this.makeAPICall('/api/projects/approvals', {
      method: 'PUT',
      body: { approvalId, action, notes },
      feature: 'project-approvals',
      operation: 'process_approval'
    })
  }

  async searchKnowledge(query: string, filters?: any): Promise<APIResponse<any[]>> {
    const searchParams = new URLSearchParams({ q: query, ...filters })
    return this.makeAPICall(`/api/knowledge/documents?${searchParams}`, {
      method: 'GET',
      feature: 'knowledge-search',
      operation: 'search_documents'
    })
  }

  async uploadDocument(file: File, metadata: any): Promise<APIResponse<any>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('metadata', JSON.stringify(metadata))

    // Special handling for file uploads
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge/documents`, {
        method: 'POST',
        headers: {
          'x-session-id': this.generateSessionId(),
          'x-user-role': 'user',
          'x-knowledge-enabled': 'true'
        },
        body: formData,
      })

      return response.json()
    } catch (error) {
      return {
        success: false,
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Failed to upload document',
        _metadata: {
          processedAt: new Date().toISOString(),
          sessionId: this.generateSessionId(),
          knowledgeSystem: 'humber-nervous-system-v1'
        }
      }
    }
  }

  async getAIInsights(context: Partial<LearningContext>): Promise<any[]> {
    try {
      const fullContext: LearningContext = {
        sessionId: this.generateSessionId(),
        currentPage: 'insights',
        currentFeature: 'ai-insights',
        userRole: 'user',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV as any || 'development',
        ...context
      }

      return await knowledgeNervousSystem.generateInsights({
        operation: 'get_insights',
        context: fullContext
      })
    } catch (error) {
      console.error('Failed to get AI insights:', error)
      return []
    }
  }

  async getRecommendations(context: Partial<LearningContext>): Promise<any[]> {
    try {
      const fullContext: LearningContext = {
        sessionId: this.generateSessionId(),
        currentPage: 'recommendations',
        currentFeature: 'ai-recommendations',
        userRole: 'user',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV as any || 'development',
        ...context
      }

      return await knowledgeNervousSystem.getRecommendations(fullContext)
    } catch (error) {
      console.error('Failed to get recommendations:', error)
      return []
    }
  }

  private async trackAPICall(action: string, data: any, context: LearningContext) {
    try {
      await knowledgeNervousSystem.learnFromUserAction({
        type: action,
        ...data,
        timestamp: new Date().toISOString()
      }, context)
    } catch (error) {
      console.error('Failed to track API call:', error)
    }
  }

  private generateSessionId(): string {
    return typeof window !== 'undefined' 
      ? window.sessionStorage?.getItem('session-id') || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      : `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private extractPageFromEndpoint(endpoint: string): string {
    const segments = endpoint.split('/').filter(Boolean)
    if (segments[0] === 'api') {
      return segments[1] || 'api'
    }
    return segments[0] || 'home'
  }
}

// Singleton instance
export const apiService = APIIntegrationService.getInstance()

// React hook for using the API service
export function useAPIService() {
  return apiService
}

// Convenience functions for common operations
export const api = {
  recruits: {
    list: (filters?: any) => apiService.getRecruits(filters),
    create: (data: any) => apiService.createRecruit(data),
    deploy: (data: any) => apiService.deployCandidate(data)
  },
  projects: {
    requestApproval: (data: any) => apiService.createApprovalRequest(data),
    processApproval: (id: string, action: string, notes?: string) => 
      apiService.processApproval(id, action, notes)
  },
  knowledge: {
    search: (query: string, filters?: any) => apiService.searchKnowledge(query, filters),
    upload: (file: File, metadata: any) => apiService.uploadDocument(file, metadata),
    insights: (context?: Partial<LearningContext>) => apiService.getAIInsights(context),
    recommendations: (context?: Partial<LearningContext>) => apiService.getRecommendations(context)
  }
}