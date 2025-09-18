import { NextRequest, NextResponse } from 'next/server'
import { withKnowledgeSystem, KnowledgeEnhancedResponse } from '@/lib/knowledge-middleware'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const knowledgeMiddleware = withKnowledgeSystem({
  enableLearning: true,
  trackUserActions: true,
  enableAIInsights: true,
  logLevel: 'detailed'
})

export async function POST(request: NextRequest) {
  const context = await knowledgeMiddleware.processRequest(
    request,
    'operations-deployment',
    'candidate_deployment',
    {}
  )

  try {
    const body: any = await request.json()
    
    // Track the deployment request
    await knowledgeMiddleware.trackUserAction('deployment_request', body, context)
    
    // Basic validation
    if (!body.candidateId) {
      const errorResponse: KnowledgeEnhancedResponse = {
        success: false,
        error: 'Validation failed',
        message: 'Candidate ID is required',
        _metadata: {
          processedAt: new Date().toISOString(),
          sessionId: context.sessionId,
          knowledgeSystem: 'humber-nervous-system-v1'
        }
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Mock processing - in real app, this would deploy candidate to client project
    const result = {
      candidateId: body.candidateId,
      clientId: body.clientId || 'client_001',
      projectId: body.projectId || 'project_123',
      deploymentDate: body.deploymentDate || new Date().toISOString().split('T')[0],
      onboardingCompleted: true,
      accessGranted: true,
      equipmentAssigned: true,
      processedAt: new Date().toISOString(),
      status: 'deployed'
    }

    // Analyze the deployment process for optimization opportunities
    await knowledgeMiddleware.analyzeBusinessProcess(
      'candidate_deployment_process',
      { requestData: body, result },
      context
    )

    // Track successful deployment
    await knowledgeMiddleware.trackUserAction('deployment_success', result, context)

    // Enrich response with AI insights about deployment efficiency
    const baseResponse = {
      success: true,
      data: result,
      message: 'Candidate successfully deployed to client project'
    }

    const enrichedResponse = await knowledgeMiddleware.enrichResponse(
      baseResponse,
      context,
      'candidate_deployment'
    )

    return NextResponse.json(enrichedResponse)
  } catch (error) {
    // SECURITY: Removed console.error('Error processing deployment:', error)
    
    // Track deployment failure for learning
    await knowledgeMiddleware.trackUserAction('deployment_failure', { error: error.message }, context)
    
    const errorResponse: KnowledgeEnhancedResponse = {
      success: false,
      error: 'Internal error',
      message: 'An error occurred while processing your request',
      requestId: Date.now().toString(),
      _metadata: {
        processedAt: new Date().toISOString(),
        sessionId: context.sessionId,
        knowledgeSystem: 'humber-nervous-system-v1'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}