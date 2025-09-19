import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth"

export default auth((req) => {
  const { pathname } = req.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/error',
    '/api/auth',
    '/privacy',
    '/terms',
    '/_next',
    '/favicon.ico',
    '/camera-test.html',
    '/test-camera'
  ]

  // Skip all middleware processing for NextAuth routes and return with minimal headers
  if (pathname.startsWith('/api/auth/')) {
    const response = NextResponse.next()
    
    // Set minimal headers for auth routes to prevent blocking
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    
    // Remove strict CSP for auth routes
    response.headers.delete('Content-Security-Policy')
    response.headers.delete('X-Frame-Options')
    response.headers.delete('Strict-Transport-Security')
    
    return response
  }
  
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // If not authenticated and trying to access protected route
  if (!req.auth && !isPublicRoute) {
    const signInUrl = new URL('/api/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }
  
  // Add security headers to all responses (except test routes)
  const response = NextResponse.next()

  // Skip all security headers for camera test routes
  if (pathname.includes('camera-test') || pathname.includes('test-camera')) {
    // Allow all permissions for testing
    response.headers.set('Permissions-Policy', 'camera=*, geolocation=*, microphone=*')
    return response
  }

  // COMPREHENSIVE SECURITY HEADERS
  
  // Prevent clickjacking attacks
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Enable XSS protection (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // TEMPORARILY REMOVED ALL Permissions-Policy to test camera access
  // response.headers.set('Permissions-Policy', ...)
  
  // Strict Transport Security (HTTPS only)
  response.headers.set('Strict-Transport-Security', 
    'max-age=31536000; includeSubDomains; preload'
  )
  
  // Prevent DNS prefetching
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  
  // Disable Adobe Flash and PDF plugins
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  
      // Perfect Content Security Policy - Production Ready
      const isDev = process.env.NODE_ENV === 'development'
      const cspHeader = [
        "default-src 'self'",
        isDev 
          ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" 
          : "script-src 'self' 'strict-dynamic'",
        isDev 
          ? "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"
          : "style-src 'self' https://fonts.googleapis.com",
        "img-src 'self' data: https://fonts.gstatic.com blob:",
        "font-src 'self' https://fonts.gstatic.com",
        isDev 
          ? "connect-src 'self' https: wss: ws: localhost:* http://localhost:*"
          : "connect-src 'self' https:",
        "media-src 'self' blob: data:",
        "object-src 'none'",
        "child-src 'none'",
        "frame-src 'none'",
        "worker-src 'self'",
        "manifest-src 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "upgrade-insecure-requests",
        "block-all-mixed-content",
        isDev ? "" : "require-trusted-types-for 'script'"
      ].filter(Boolean).join('; ')
  
  response.headers.set('Content-Security-Policy', cspHeader)
  
  // CORS Security (restrictive)
  const origin = req.nextUrl.origin
  const allowedOrigins = [
    'https://humber-nextjs-app.pages.dev',
    'https://e9adc50a.humber-nextjs-app.pages.dev',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002'
  ]
  
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 
    'Content-Type, Authorization, X-Requested-With, X-API-Key'
  )
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Max-Age', '86400') // 24 hours
  
  // Cache control for API routes
  if (pathname.includes('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
  }
  
  // Security headers
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive')
  response.headers.set('Expect-CT', 'max-age=86400, enforce')
  response.headers.set('Feature-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), ambient-light-sensor=()') 
  response.headers.set('NEL', '{"report_to":"default","max_age":31536000,"include_subdomains":true}')
  response.headers.set('Report-To', '{"group":"default","max_age":31536000,"endpoints":[{"url":"https://reports.example.com/nel"}],"include_subdomains":true}')
  
  return response
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (icons, images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}