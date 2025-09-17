import { NextRequest, NextResponse } from 'next/server'

// This endpoint is deprecated - use NextAuth signOut instead
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Deprecated endpoint', 
      message: 'Use NextAuth signOut instead' 
    },
    { status: 410 }
  )
}

export async function GET() {
  return NextResponse.json(
    { 
      error: 'Deprecated endpoint', 
      message: 'Use NextAuth signOut instead' 
    },
    { status: 410 }
  )
}