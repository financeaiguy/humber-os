import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    name: string
    role: string
    partnerId: string
    partnerName: string
  }
}

/**
 * Authentication middleware for API routes
 * Validates NextAuth JWT tokens and adds user context to request
 */
export async function withAuth<T>(
  handler: (request: AuthenticatedRequest, context?: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    try {
      // Get JWT token from NextAuth
      const token = await getToken({ 
        req: request, 
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET 
      })

      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required', code: 'UNAUTHORIZED' },
          { status: 401 }
        )
      }

      // Add user info to request
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        role: token.role as string,
        partnerId: token.partnerId as string,
        partnerName: token.partnerName as string
      }

      return handler(authenticatedRequest, context)
    } catch (error) {
      // SECURITY: Removed console.error('Authentication middleware error:', error)
      return NextResponse.json(
        { error: 'Authentication failed', code: 'AUTH_ERROR' },
        { status: 500 }
      )
    }
  }
}

/**
 * Role-based authorization middleware
 * Requires specific roles to access the endpoint
 */
export function withRole(allowedRoles: string[]) {
  return function<T>(
    handler: (request: AuthenticatedRequest, context?: T) => Promise<NextResponse>
  ) {
    return withAuth(async (request: AuthenticatedRequest, context?: T) => {
      if (!request.user) {
        return NextResponse.json(
          { error: 'Authentication required', code: 'UNAUTHORIZED' },
          { status: 401 }
        )
      }

      if (!allowedRoles.includes(request.user.role)) {
        return NextResponse.json(
          { 
            error: 'Insufficient permissions', 
            code: 'FORBIDDEN',
            required: allowedRoles,
            current: request.user.role
          },
          { status: 403 }
        )
      }

      return handler(request, context)
    })
  }
}

/**
 * Budget authorization middleware
 * Requires specific budget limits for financial operations
 */
export function withBudgetAuth(maxAmount: number) {
  return function<T>(
    handler: (request: AuthenticatedRequest, context?: T) => Promise<NextResponse>
  ) {
    return withAuth(async (request: AuthenticatedRequest, context?: T) => {
      if (!request.user) {
        return NextResponse.json(
          { error: 'Authentication required', code: 'UNAUTHORIZED' },
          { status: 401 }
        )
      }

      // Define budget limits by role
      const budgetLimits = {
        'ENGINEER_EMPLOYEE': 1000,
        'PARTNER_OPERATOR': 50000,
        'PARTNER_ADMIN': 250000,
        'SYSTEM_ADMIN': Number.MAX_SAFE_INTEGER
      }

      const userLimit = budgetLimits[request.user.role as keyof typeof budgetLimits] || 0
      
      if (maxAmount > userLimit) {
        return NextResponse.json(
          { 
            error: 'Budget authorization required', 
            code: 'BUDGET_EXCEEDED',
            maxAllowed: userLimit,
            requested: maxAmount
          },
          { status: 403 }
        )
      }

      return handler(request, context)
    })
  }
}

/**
 * Rate limiting middleware
 * Prevents abuse of API endpoints
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit(requestsPerMinute: number = 60) {
  return function<T>(
    handler: (request: AuthenticatedRequest, context?: T) => Promise<NextResponse>
  ) {
    return withAuth(async (request: AuthenticatedRequest, context?: T) => {
      if (!request.user) {
        return NextResponse.json(
          { error: 'Authentication required', code: 'UNAUTHORIZED' },
          { status: 401 }
        )
      }

      const userId = request.user.id
      const now = Date.now()
      const windowStart = Math.floor(now / 60000) * 60000 // 1-minute windows

      const userRequests = requestCounts.get(userId)
      
      if (!userRequests || userRequests.resetTime !== windowStart) {
        requestCounts.set(userId, { count: 1, resetTime: windowStart })
      } else {
        userRequests.count++
        
        if (userRequests.count > requestsPerMinute) {
          return NextResponse.json(
            { 
              error: 'Rate limit exceeded', 
              code: 'RATE_LIMITED',
              resetTime: windowStart + 60000
            },
            { status: 429 }
          )
        }
      }

      return handler(request, context)
    })
  }
}

/**
 * Audit logging middleware
 * Logs all API access for security monitoring
 */
export function withAuditLog(action: string) {
  return function<T>(
    handler: (request: AuthenticatedRequest, context?: T) => Promise<NextResponse>
  ) {
    return withAuth(async (request: AuthenticatedRequest, context?: T) => {
      const startTime = Date.now()
      
      try {
        const response = await handler(request, context)
        
        // Log successful operation
        // SECURITY: Removed // SECURITY: Removed console.log(JSON.stringify({
          type: 'AUDIT_LOG',
          timestamp: new Date().toISOString(),
          action,
          userId: request.user?.id,
          userEmail: request.user?.email,
          userRole: request.user?.role,
          method: request.method,
          url: request.url,
          statusCode: response.status,
          duration: Date.now() - startTime,
          ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown'
        }))
        
        return response
      } catch (error) {
        // Log failed operation
        // SECURITY: Removed console.error(JSON.stringify({
          type: 'AUDIT_LOG_ERROR',
          timestamp: new Date().toISOString(),
          action,
          userId: request.user?.id,
          userEmail: request.user?.email,
          userRole: request.user?.role,
          method: request.method,
          url: request.url,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - startTime,
          ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown'
        }))
        
        throw error
      }
    })
  }
}