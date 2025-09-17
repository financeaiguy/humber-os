import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const WORKER_URL = process.env.WORKER_URL || 'http://localhost:8788'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const workerUrl = `${WORKER_URL}/notifications/analytics${url.search}`
    
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
      method: 'GET',
      headers,
    })

    const responseData = await response.text()
    
    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    })
  } catch (error) {
    console.error('Error proxying to worker:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to connect to worker API',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}