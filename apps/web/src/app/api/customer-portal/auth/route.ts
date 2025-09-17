import { NextRequest, NextResponse } from 'next/server'
import { CustomerPortalSession } from '@/types/invoicing'

// Mock storage - replace with actual database/KV storage
const portalSessions = new Map<string, CustomerPortalSession>()
const customerInvoices = new Map<string, string[]>() // email -> invoice IDs

export async function POST(request: NextRequest) {
  try {
    const { email, invoiceId } = await request.json()
    
    if (!email || !invoiceId) {
      return NextResponse.json(
        { error: 'Email and invoice ID are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if the customer has access to this invoice
    const hasAccess = await validateCustomerInvoiceAccess(email, invoiceId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied. Invoice not found or not associated with this email.' },
        { status: 403 }
      )
    }

    // Generate access token and create session
    const sessionId = generateSecureToken()
    const accessToken = generateSecureToken()
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours

    const session: CustomerPortalSession = {
      sessionId,
      clientEmail: email,
      accessibleInvoices: await getCustomerInvoices(email),
      loginTime: new Date().toISOString(),
      expiryTime,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    }

    // Store session
    portalSessions.set(sessionId, session)

    // Create magic link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const magicLink = `${baseUrl}/customer-portal?token=${accessToken}&session=${sessionId}`

    // In production, send this via email
    console.log('🔐 Customer Portal Access:', { email, magicLink, expiryTime })

    return NextResponse.json({
      success: true,
      message: 'Access link generated successfully',
      accessToken,
      sessionId,
      expiryTime,
      magicLink // Remove this in production, send via email instead
    })

  } catch (error) {
    console.error('Customer portal auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session')
    const token = searchParams.get('token')

    if (!sessionId || !token) {
      return NextResponse.json(
        { error: 'Session ID and token are required' },
        { status: 400 }
      )
    }

    const session = portalSessions.get(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Check if session has expired
    if (new Date() > new Date(session.expiryTime)) {
      portalSessions.delete(sessionId)
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      valid: true,
      session: {
        clientEmail: session.clientEmail,
        accessibleInvoices: session.accessibleInvoices,
        expiryTime: session.expiryTime
      }
    })

  } catch (error) {
    console.error('Session validation error:', error)
    return NextResponse.json(
      { error: 'Session validation failed' },
      { status: 500 }
    )
  }
}

// Helper functions
async function validateCustomerInvoiceAccess(email: string, invoiceId: string): Promise<boolean> {
  // Mock validation - replace with actual database check
  const mockCustomerInvoices = {
    'customer@gm.com': ['inv-001', 'inv-002', 'inv-003'],
    'partner@ford.com': ['inv-004', 'inv-005'],
    'finance@stellantis.com': ['inv-006']
  }
  
  const customerInvoices = mockCustomerInvoices[email as keyof typeof mockCustomerInvoices] || []
  return customerInvoices.includes(invoiceId)
}

async function getCustomerInvoices(email: string): Promise<string[]> {
  // Mock data - replace with actual database query
  const mockCustomerInvoices = {
    'customer@gm.com': ['inv-001', 'inv-002', 'inv-003'],
    'partner@ford.com': ['inv-004', 'inv-005'],
    'finance@stellantis.com': ['inv-006']
  }
  
  return mockCustomerInvoices[email as keyof typeof mockCustomerInvoices] || []
}

function generateSecureToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}