import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const WORKER_URL = 'http://localhost:8787'

async function proxyToWorker(request: NextRequest, id: string) {
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
      body: request.method !== 'GET' && request.method !== 'DELETE' ? await request.text() : undefined,
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyToWorker(request, id)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyToWorker(request, id)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyToWorker(request, id)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyToWorker(request, id)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToWorker(request, params.id)
}