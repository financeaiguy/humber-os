import { NextRequest, NextResponse } from 'next/server'
import { InputValidator } from '@/lib/input-validator'
import { withKnowledgeSystem, KnowledgeEnhancedResponse } from '@/lib/knowledge-middleware'
import { getConfig } from '@/lib/secure-config'
import { logger, logApiCall } from '@/lib/logger'

// Using nodejs runtime for development to allow localhost connections
// export const runtime = 'edge'  
export const dynamic = 'force-dynamic'

// Initialize knowledge middleware with fallback
let knowledgeMiddleware: any
try {
  knowledgeMiddleware = withKnowledgeSystem({
    enableLearning: true,
    trackUserActions: true,
    enableAIInsights: true,
    logLevel: 'basic'
  })
} catch (error) {
  // Fallback for development
  knowledgeMiddleware = {
    processRequest: async () => ({
      sessionId: 'dev-session',
      currentPage: 'recruits',
      currentFeature: 'recruits',
      userRole: 'user',
      timestamp: new Date().toISOString(),
      environment: 'development'
    }),
    analyzeBusinessProcess: async () => {},
    enrichResponse: async (data: any) => data
  }
}

async function proxyToWorker(request: NextRequest, method: string) {
  const context = await knowledgeMiddleware.processRequest(
    request,
    'recruits',
    `recruits_${method.toLowerCase()}`,
    { method, url: request.url }
  )

  try {
    const url = new URL(request.url)
    const apiConfig = getConfig('api')
    const workerUrl = `${apiConfig.workerUrl}${url.pathname}${url.search}`
    
    // Log the API call
    logApiCall(method, url.pathname, { sessionId: context.sessionId })
    
    const headers = new Headers()
    // Copy relevant headers
    request.headers.forEach((value, key) => {
      if (key.toLowerCase().startsWith('content-') || 
          key.toLowerCase() === 'authorization' ||
          key.toLowerCase() === 'x-tenant-id') {
        headers.set(key, value)
      }
    })
    
    // Only add tenant ID header if not present (no default auth tokens)
    if (!headers.has('x-tenant-id')) {
      headers.set('x-tenant-id', request.headers.get('x-tenant-id') || 'default')
    }

    const response = await fetch(workerUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' ? await request.text() : undefined,
    })

    const responseData = await response.text()
    let parsedData

    try {
      parsedData = JSON.parse(responseData)
    } catch {
      parsedData = { data: responseData }
    }

    // Analyze the recruits operation for business insights
    if (parsedData.success !== false) {
      await knowledgeMiddleware.analyzeBusinessProcess(
        `recruit_management_${method.toLowerCase()}`,
        parsedData,
        context
      )
    }

    // Enrich response with AI insights
    const enrichedResponse = await knowledgeMiddleware.enrichResponse(
      parsedData,
      context,
      `recruits_${method.toLowerCase()}`
    )
    
    return new NextResponse(JSON.stringify(enrichedResponse), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    logger.error('Error proxying to worker', error as Error, { 
      component: 'recruits-api',
      method,
      sessionId: context.sessionId 
    })
    
    // Fallback to mock data for development
    if (method === 'GET') {
      const mockRecruits = [
        {
          id: 'recruit_001',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com',
          phone: '+1 (555) 123-4567',
          currentLocation: 'Detroit, MI',
          jobTitle: 'Software Engineer',
          yearsExperience: 5,
          skills: ['JavaScript', 'React', 'Node.js'],
          status: 'screened',
          createdAt: '2025-01-15T10:00:00Z',
          updatedAt: '2025-01-15T10:00:00Z'
        },
        {
          id: 'recruit_002',
          firstName: 'Maria',
          lastName: 'Garcia',
          email: 'maria.garcia@example.com',
          phone: '+1 (555) 234-5678',
          currentLocation: 'Chicago, IL',
          jobTitle: 'Controls Engineer',
          yearsExperience: 8,
          skills: ['PLC Programming', 'HMI Design', 'AutoCAD'],
          status: 'accepted',
          createdAt: '2025-01-12T14:30:00Z',
          updatedAt: '2025-01-16T09:15:00Z'
        }
      ]

      const fallbackResponse = {
        success: true,
        data: {
          recruits: mockRecruits,
          pagination: {
            page: 1,
            limit: 20,
            total: mockRecruits.length,
            totalPages: 1
          }
        },
        _metadata: {
          processedAt: new Date().toISOString(),
          sessionId: context.sessionId,
          source: 'fallback-mock-data'
        }
      }

      return NextResponse.json(fallbackResponse, { status: 200 })
    }
    
    const errorResponse: KnowledgeEnhancedResponse = {
      success: false,
      error: 'Failed to connect to worker API',
      message: 'Request processing failed',
      _metadata: {
        processedAt: new Date().toISOString(),
        sessionId: context.sessionId,
        knowledgeSystem: 'humber-nervous-system-v1'
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return proxyToWorker(request, 'GET')
}

export async function POST(request: NextRequest) {
  return proxyToWorker(request, 'POST')
}

export async function PUT(request: NextRequest) {
  return proxyToWorker(request, 'PUT')
}

export async function DELETE(request: NextRequest) {
  return proxyToWorker(request, 'DELETE')
}

export async function PATCH(request: NextRequest) {
  return proxyToWorker(request, 'PATCH')
}