import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ 
      status: 'ok', 
      message: 'NextAuth API routes are working',
      timestamp: new Date().toISOString(),
      url: request.url
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'NextAuth API test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
