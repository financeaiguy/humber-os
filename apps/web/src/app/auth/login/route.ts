import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, tenantId } = await request.json()
    
    // Mock authentication - replace with actual authentication logic
    const validCredentials = [
      { email: 'admin@example.com', password: 'admin123', tenantId: 'demo-tenant' },
      { email: 'user@example.com', password: 'user123', tenantId: 'demo-tenant' },
      { email: 'test@example.com', password: 'test123', tenantId: 'demo-tenant' }
    ]
    
    const user = validCredentials.find(
      cred => cred.email === email && cred.password === password && cred.tenantId === tenantId
    )
    
    if (!user) {
      return NextResponse.json(
        { 
          error: 'Authentication failed',
          message: 'Invalid email or password'
        },
        { status: 401 }
      )
    }
    
    // Generate mock tokens
    const accessToken = `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const refreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return NextResponse.json({
      success: true,
      user: {
        id: `user_${email.split('@')[0]}`,
        email,
        tenantId,
        role: email.includes('admin') ? 'admin' : 'user'
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 3600
      },
      message: 'Authentication successful'
    })
    
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Internal error',
        message: 'An error occurred processing your request'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed', message: 'This endpoint only accepts POST requests' },
    { status: 405 }
  )
}