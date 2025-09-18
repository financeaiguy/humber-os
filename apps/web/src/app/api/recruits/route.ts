import { NextRequest, NextResponse } from 'next/server'
import { InputValidator } from '@/lib/input-validator'
import { withKnowledgeSystem, KnowledgeEnhancedResponse } from '@/lib/knowledge-middleware'

// Using nodejs runtime for development to allow localhost connections
// export const runtime = 'edge'  
export const dynamic = 'force-dynamic'

const WORKER_URL = 'http://localhost:8787'
const knowledgeMiddleware = withKnowledgeSystem({
  enableLearning: true,
  trackUserActions: true,
  enableAIInsights: true,
  logLevel: 'basic'
})

async function proxyToWorker(request: NextRequest, method: string) {
  const context = await knowledgeMiddleware.processRequest(
    request,
    'recruits',
    `recruits_${method.toLowerCase()}`,
    { method, url: request.url }
  )

  try {
    const url = new URL(request.url)
    const workerUrl = `${WORKER_URL}${url.pathname}${url.search}`
    
    const headers = new Headers()
    // Copy relevant headers
    request.headers.forEach((value, key) => {
      if (key.toLowerCase().startsWith('content-') || 
          key.toLowerCase() === 'authorization' ||
          key.toLowerCase() === 'x-tenant-id') {
        headers.set(key, value)
      }
    })
    
    // Add default headers for API testing
    if (!headers.has('x-tenant-id')) {
      headers.set('x-tenant-id', 'demo-tenant')
    }
    if (!headers.has('authorization')) {
      headers.set('authorization', 'Bearer test-token-for-api-testing')
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
    // SECURITY: Removed console.error('Error proxying to worker:', error)
    
    const errorResponse: KnowledgeEnhancedResponse = {
      success: false,
      error: 'Failed to connect to worker API',
      message: error instanceof Error ? error.message : 'Unknown error',
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