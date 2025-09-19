import { useState, useEffect, useCallback } from 'react'
import { knowledgeNervousSystem, LearningContext } from '@/lib/knowledge-nervous-system'
import { api } from '@/lib/api-integration-service'

export interface NervousSystemState {
  isConnected: boolean
  insights: any[]
  recommendations: any[]
  stats: any
  isLoading: boolean
  error: string | null
}

export interface UseNervousSystemOptions {
  page: string
  feature: string
  userRole?: string
  autoLoad?: boolean
  enableLearning?: boolean
}

export function useNervousSystem(options: UseNervousSystemOptions) {
  const {
    page,
    feature,
    userRole = 'user',
    autoLoad = true,
    enableLearning = true
  } = options

  const [state, setState] = useState<NervousSystemState>({
    isConnected: false,
    insights: [],
    recommendations: [],
    stats: {},
    isLoading: false,
    error: null
  })

  const context: LearningContext = {
    sessionId: generateSessionId(),
    currentPage: page,
    currentFeature: feature,
    userRole,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV as any || 'development'
  }

  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const [insights, recommendations, stats] = await Promise.all([
        api.knowledge.insights(context),
        api.knowledge.recommendations(context),
        knowledgeNervousSystem.getKnowledgeStats()
      ])

      setState({
        isConnected: true,
        insights: insights || [],
        recommendations: recommendations || [],
        stats: stats || {},
        isLoading: false,
        error: null
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to connect to nervous system'
      }))
    }
  }, [page, feature, userRole])

  const trackAction = useCallback(async (action: string, data?: any) => {
    if (!enableLearning) return

    try {
      await knowledgeNervousSystem.learnFromInteraction({
        type: action,
        ...data,
        timestamp: new Date().toISOString()
      }, context)
    } catch (error) {
      // SECURITY: console statement removed: console.error('Failed to track action:', error)
    }
  }, [enableLearning, page, feature, userRole])

  const askAI = useCallback(async (question: string, contextData?: any) => {
    try {
      const enrichedContext = {
        ...context,
        ...contextData
      }

      const response = await knowledgeNervousSystem.queryAI(question, enrichedContext)
      
      // Track the AI interaction
      await trackAction('ai_query', { question, response })
      
      return response
    } catch (error) {
      // SECURITY: console statement removed: console.error('Failed to query AI:', error)
      return null
    }
  }, [trackAction, page, feature, userRole])

  const analyzeProcess = useCallback(async (processName: string, processData: any) => {
    try {
      const analysis = await knowledgeNervousSystem.analyzeBusinessProcess(
        processName,
        processData,
        context
      )

      // Track the process analysis
      await trackAction('process_analysis', { processName, analysis })

      return analysis
    } catch (error) {
      // SECURITY: console statement removed: console.error('Failed to analyze process:', error)
      return null
    }
  }, [trackAction, page, feature, userRole])

  const optimizeWorkflow = useCallback(async (workflowData: any) => {
    try {
      const optimization = await knowledgeNervousSystem.optimizeWorkflow(workflowData, context)
      
      // Track workflow optimization
      await trackAction('workflow_optimization', { workflow: workflowData, optimization })
      
      return optimization
    } catch (error) {
      // SECURITY: console statement removed: console.error('Failed to optimize workflow:', error)
      return null
    }
  }, [trackAction, page, feature, userRole])

  const addKnowledge = useCallback(async (knowledge: any) => {
    try {
      await knowledgeNervousSystem.learnFromDocument(knowledge, context)
      
      // Track knowledge addition
      await trackAction('knowledge_added', { knowledge })
      
      // Reload data to get updated insights
      await loadData()
    } catch (error) {
      // SECURITY: console statement removed: console.error('Failed to add knowledge:', error)
    }
  }, [loadData, trackAction])

  const getSmartSuggestions = useCallback(async (inputData: any) => {
    try {
      const suggestions = await knowledgeNervousSystem.getSmartSuggestions(inputData, context)
      
      // Track suggestion request
      await trackAction('suggestions_requested', { inputData, suggestions })
      
      return suggestions
    } catch (error) {
      // SECURITY: console statement removed: console.error('Failed to get suggestions:', error)
      return []
    }
  }, [trackAction, page, feature, userRole])

  const predictOutcome = useCallback(async (scenarioData: any) => {
    try {
      const prediction = await knowledgeNervousSystem.predictOutcome(scenarioData, context)
      
      // Track prediction request
      await trackAction('prediction_requested', { scenario: scenarioData, prediction })
      
      return prediction
    } catch (error) {
      // SECURITY: console statement removed: console.error('Failed to predict outcome:', error)
      return null
    }
  }, [trackAction, page, feature, userRole])

  // Auto-load data on mount
  useEffect(() => {
    if (autoLoad) {
      loadData()
    }
  }, [autoLoad, loadData])

  // Track page visit
  useEffect(() => {
    trackAction('page_visit', { page, feature })
  }, [page, feature, trackAction])

  return {
    // State
    ...state,
    
    // Context
    context,
    
    // Core functions
    loadData,
    trackAction,
    askAI,
    
    // Business intelligence functions
    analyzeProcess,
    optimizeWorkflow,
    predictOutcome,
    getSmartSuggestions,
    
    // Knowledge management
    addKnowledge,
    
    // Utilities
    refresh: loadData,
    isReady: state.isConnected && !state.isLoading,
    hasInsights: state.insights.length > 0,
    hasRecommendations: state.recommendations.length > 0
  }
}

// Helper function to generate session ID
function generateSessionId(): string {
  if (typeof window !== 'undefined') {
    let sessionId = window.sessionStorage?.getItem('humber-session-id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      window.sessionStorage?.setItem('humber-session-id', sessionId)
    }
    return sessionId
  }
  return `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Hook for specific page contexts
export function useRecruitsNervousSystem() {
  return useNervousSystem({
    page: 'recruits',
    feature: 'recruits-management'
  })
}

export function useProjectsNervousSystem() {
  return useNervousSystem({
    page: 'projects',
    feature: 'project-management'
  })
}

export function useOperationsNervousSystem() {
  return useNervousSystem({
    page: 'operations',
    feature: 'operations-management'
  })
}

export function useAnalyticsNervousSystem() {
  return useNervousSystem({
    page: 'analytics',
    feature: 'business-analytics'
  })
}

export function useKnowledgeNervousSystem() {
  return useNervousSystem({
    page: 'knowledge',
    feature: 'knowledge-management'
  })
}

// Global nervous system hook that can be used anywhere
export function useGlobalNervousSystem() {
  return useNervousSystem({
    page: 'global',
    feature: 'system-wide',
    autoLoad: false // Don't auto-load for global context
  })
}