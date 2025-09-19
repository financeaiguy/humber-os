import { NextRequest, NextResponse } from 'next/server'

// Simple proxy endpoint for testing API without CORS issues
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, method = 'GET', data } = body

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    }

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(url, options)
    const responseData = await response.json()

    return NextResponse.json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      data: responseData
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Proxy request failed'
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    }
  })
}