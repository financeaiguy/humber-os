import { NextRequest } from 'next/server'
import { knowledgeNervousSystem, LearningContext } from './knowledge-nervous-system'

export interface KnowledgeMiddlewareOptions {
  enableLearning?: boolean
  trackUserActions?: boolean
  enableAIInsights?: boolean
  logLevel?: 'none' | 'basic' | 'detailed'
}

export class KnowledgeMiddleware {
  private static instance: KnowledgeMiddleware
  private options: KnowledgeMiddlewareOptions

  constructor(options: KnowledgeMiddlewareOptions = {}) {
    this.options = {
      enableLearning: true,
      trackUserActions: true,
      enableAIInsights: true,
      logLevel: 'basic',
      ...options
    }
  }

  static getInstance(options?: KnowledgeMiddlewareOptions): KnowledgeMiddleware {
    if (!KnowledgeMiddleware.instance) {
      KnowledgeMiddleware.instance = new KnowledgeMiddleware(options)
    }
    return KnowledgeMiddleware.instance
  }

  async processRequest(
    request: NextRequest,
    endpoint: string,
    action: string,
    data?: any
  ): Promise<LearningContext> {
    const context: LearningContext = {
      sessionId: request.headers.get('x-session-id') || 'anonymous',
      currentPage: this.extractPageFromUrl(request.url),
      currentFeature: endpoint,
      userRole: request.headers.get('x-user-role') || 'user',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV as any || 'development'
    }

    if (this.options.trackUserActions) {
      await this.trackUserAction(action, data, context)
    }

    if (this.options.logLevel === 'detailed') {
      // SECURITY: console statement removed
      // Knowledge Middleware endpoint action: context, data keys
    }

    return context
  }

  async trackUserAction(action: string, data: any, context: LearningContext) {
    if (!this.options.enableLearning) return

    try {
      const actionData = {
        type: action,
        endpoint: context.currentFeature,
        data: this.sanitizeData(data),
        timestamp: context.timestamp,
        sessionId: context.sessionId,
        userRole: context.userRole
      }

      await knowledgeNervousSystem.learnFromUserAction(actionData, context)
    } catch (error) {
      // SECURITY: console statement removed: console.error('Failed to track user action:', error)
    }
  }

  async analyzeBusinessProcess(
    processName: string,
    processData: any,
    context: LearningContext
  ): Promise<any> {
    if (!this.options.enableAIInsights) return null

    try {
      const analysisPrompt = `Analyze the business process "${processName}" with the following data and provide insights on efficiency, compliance, and optimization opportunities.`
      
      return await knowledgeNervousSystem.queryAI(analysisPrompt, {
        ...context,
        processData: this.sanitizeData(processData)
      })
    } catch (error) {
      // SECURITY: console statement removed: console.error('Failed to analyze business process:', error)
      return null
    }
  }

  async generateInsights(
    operation: string,
    results: any,
    context: LearningContext
  ): Promise<any[]> {
    if (!this.options.enableAIInsights) return []

    try {
      const insights = await knowledgeNervousSystem.generateInsights({
        operation,
        results: this.sanitizeData(results),
        context
      })

      return insights || []
    } catch (error) {
      // SECURITY: console statement removed: console.error('Failed to generate insights:', error)
      return []
    }
  }

  async enrichResponse(
    baseResponse: any,
    context: LearningContext,
    operation: string
  ): Promise<any> {
    const enrichedResponse = { ...baseResponse }

    if (this.options.enableAIInsights) {
      try {
        const insights = await this.generateInsights(operation, baseResponse, context)
        if (insights.length > 0) {
          enrichedResponse._aiInsights = insights
        }

        const recommendations = await knowledgeNervousSystem.getRecommendations(context)
        if (recommendations.length > 0) {
          enrichedResponse._recommendations = recommendations
        }
      } catch (error) {
        // SECURITY: console statement removed: console.error('Failed to enrich response:', error)
      }
    }

    enrichedResponse._metadata = {
      processedAt: new Date().toISOString(),
      sessionId: context.sessionId,
      knowledgeSystem: 'humber-nervous-system-v1'
    }

    return enrichedResponse
  }

  private extractPageFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathSegments = urlObj.pathname.split('/').filter(Boolean)
      
      if (pathSegments[0] === 'api') {
        return pathSegments[1] || 'api'
      }
      
      return pathSegments[0] || 'home'
    } catch {
      return 'unknown'
    }
  }

  private sanitizeData(data: any): any {
    if (!data) return data

    const sanitized = JSON.parse(JSON.stringify(data))
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization']
    
    const removeSensitiveFields = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj
      
      if (Array.isArray(obj)) {
        return obj.map(removeSensitiveFields)
      }
      
      const cleaned = {}
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          cleaned[key] = '[REDACTED]'
        } else {
          cleaned[key] = removeSensitiveFields(value)
        }
      }
      
      return cleaned
    }

    return removeSensitiveFields(sanitized)
  }
}

// Convenience function for middleware usage
export function withKnowledgeSystem(options?: KnowledgeMiddlewareOptions) {
  return KnowledgeMiddleware.getInstance(options)
}

// Type helpers for API routes
export interface EnhancedNextRequest extends NextRequest {
  knowledgeContext?: LearningContext
}

export interface KnowledgeEnhancedResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
  _aiInsights?: any[]
  _recommendations?: any[]
  _metadata?: {
    processedAt: string
    sessionId: string
    knowledgeSystem: string
  }
}