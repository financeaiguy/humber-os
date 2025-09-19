import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
import { AuthUser, UserRole } from "@humber/types"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: AuthUser & {
      id: string
    }
  }
  
  interface User extends AuthUser {
    id: string
  }
}

// Mock users data with plaintext passwords for demo (in production, use proper hashing)
const mockUsers = [
  // Original accounts
  {
    id: "1",
    email: "admin@example.com",
    password: "admin123",
    name: "System Administrator",
    role: "PARTNER_ADMIN" as UserRole,
    partnerId: "humber-operations",
    partnerName: "Humber Operations",
    isActive: true,
  },
  {
    id: "2",
    email: "engineer@example.com",
    password: "engineer123",
    name: "Engineering Manager",
    role: "PARTNER_ADMIN" as UserRole,
    partnerId: "humber-engineering",
    partnerName: "Humber Engineering",
    isActive: true,
  },
  {
    id: "3",
    email: "operator@example.com",
    password: "operator123",
    name: "Operations Manager",
    role: "PARTNER_OPERATOR" as UserRole,
    partnerId: "humber-operations",
    partnerName: "Humber Operations",
    isActive: true,
  },
  {
    id: "4",
    email: "customer@example.com",
    password: "customer123",
    name: "GM Client Manager",
    role: "PARTNER_OPERATOR" as UserRole,
    partnerId: "client-gm",
    partnerName: "General Motors",
    isActive: true,
  },
  {
    id: "5",
    email: "partner@example.com",
    password: "partner123",
    name: "Ford Partnership Manager",
    role: "PARTNER_ADMIN" as UserRole,
    partnerId: "partner-ford",
    partnerName: "Ford Motor Company",
    isActive: true,
  },
  {
    id: "6",
    email: "employee@example.com",
    password: "employee123",
    name: "Field Engineer",
    role: "ENGINEER_EMPLOYEE" as UserRole,
    partnerId: "humber-operations",
    partnerName: "Humber Operations",
    isActive: true,
  },
  // New demo accounts
  {
    id: "7",
    email: "demo.admin@example.com",
    password: "demo123",
    name: "Demo Administrator",
    role: "PARTNER_ADMIN" as UserRole,
    partnerId: "demo-operations",
    partnerName: "Demo Operations",
    isActive: true,
  },
  {
    id: "8",
    email: "demo.engineer@example.com",
    password: "demo123",
    name: "Demo Engineer",
    role: "PARTNER_ADMIN" as UserRole,
    partnerId: "demo-engineering",
    partnerName: "Demo Engineering",
    isActive: true,
  },
  {
    id: "9",
    email: "demo.operator@example.com",
    password: "demo123",
    name: "Demo Operator",
    role: "PARTNER_OPERATOR" as UserRole,
    partnerId: "demo-operations",
    partnerName: "Demo Operations",
    isActive: true,
  },
  {
    id: "10",
    email: "demo.customer@example.com",
    password: "demo123",
    name: "Demo Customer",
    role: "PARTNER_OPERATOR" as UserRole,
    partnerId: "demo-client",
    partnerName: "Demo Client Company",
    isActive: true,
  },
  {
    id: "11",
    email: "demo.partner@example.com",
    password: "demo123",
    name: "Demo Partner",
    role: "PARTNER_ADMIN" as UserRole,
    partnerId: "demo-partner",
    partnerName: "Demo Partner Company",
    isActive: true,
  },
  {
    id: "12",
    email: "demo.employee@example.com",
    password: "demo123",
    name: "Demo Employee",
    role: "ENGINEER_EMPLOYEE" as UserRole,
    partnerId: "demo-operations",
    partnerName: "Demo Operations",
    isActive: true,
  },
]

export const config: NextAuthConfig = {
  theme: {
    logo: "/logo.png",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  useSecureCookies: false,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
      const isAuthRoute = nextUrl.pathname.startsWith("/auth")
      
      // Always allow API auth routes to prevent blocking NextAuth
      if (isApiAuthRoute) {
        return true
      }
      
      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl))
        }
        return true
      }
      
      // Allow public routes (/, /auth/*, etc.)
      const publicRoutes = ['/']
      const isPublicRoute = publicRoutes.some(route => nextUrl.pathname === route || nextUrl.pathname.startsWith(route + '/'))
      
      if (isPublicRoute) {
        return true
      }
      
      // For protected routes, require authentication
      if (isLoggedIn) return true
      return false // Redirect unauthenticated users to login page
    },
    jwt({ token, user }) {
      if (user) {
        // Initial sign in - simple token setup
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.partnerId = user.partnerId
        token.partnerName = user.partnerName
        
        // SECURITY: console statement removed: console.log('✅ JWT created for user:', user.email)
      }
      
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as UserRole
        session.user.partnerId = token.partnerId as string
        session.user.partnerName = token.partnerName as string
      }
      return session
    },
    signIn({ user }) {
      // Log successful sign-ins
      // SECURITY: console statement removed: console.log('✅ User signed in:', user.email)
      return true
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = mockUsers.find(u => u.email === credentials.email)
        if (!user || !user.isActive) {
          return null
        }

        // Simple password comparison for demo (in production, use bcrypt)
        const isValidPassword = credentials.password === user.password
        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          partnerId: user.partnerId,
          partnerName: user.partnerName,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days for now to reduce complexity
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "humber-nextjs-cloudflare-pages-production-secret-2024",
  debug: process.env.NODE_ENV === 'development', // Only debug in development
  trustHost: true, // Required for Cloudflare Pages
  basePath: "/api/auth", // Explicitly set the base path
}

const nextAuth = NextAuth(config)
export const handlers = nextAuth.handlers
export const auth = nextAuth.auth
export const signIn = nextAuth.signIn
export const signOut = nextAuth.signOut