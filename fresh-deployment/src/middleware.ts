import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/signin", "/auth/signup", "/auth/error"]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // If the user is logged in and trying to access auth pages, redirect to home
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // If the user is not logged in and trying to access protected routes
  if (!isLoggedIn && !isPublicRoute && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}