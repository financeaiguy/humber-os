import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
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

// Mock users data (in production, this would come from a database)
const mockUsers = [
  {
    id: "1",
    email: "admin@gm.com",
    password: "$2b$10$JQ4aMHxZVK8IC3fIbmRWYe1tBG7LRNtmDCY.mvbQdo5g1Qt.stl5a", // password123
    name: "GM Admin",
    role: "PARTNER_ADMIN" as UserRole,
    partnerId: "partner-gm",
    partnerName: "General Motors",
    isActive: true,
  },
  {
    id: "2",
    email: "operator@ford.com",
    password: "$2b$10$JQ4aMHxZVK8IC3fIbmRWYe1tBG7LRNtmDCY.mvbQdo5g1Qt.stl5a", // password123
    name: "Ford Operator",
    role: "PARTNER_OPERATOR" as UserRole,
    partnerId: "partner-ford",
    partnerName: "Ford Motor Company",
    isActive: true,
  },
  {
    id: "3",
    email: "engineer@stellantis.com",
    password: "$2b$10$JQ4aMHxZVK8IC3fIbmRWYe1tBG7LRNtmDCY.mvbQdo5g1Qt.stl5a", // password123
    name: "Stellantis Engineer",
    role: "ENGINEER_EMPLOYEE" as UserRole,
    partnerId: "partner-stellantis",
    partnerName: "Stellantis",
    isActive: true,
  },
  {
    id: "4",
    email: "admin@hirotec.com",
    password: "$2b$10$JQ4aMHxZVK8IC3fIbmRWYe1tBG7LRNtmDCY.mvbQdo5g1Qt.stl5a", // password123
    name: "HIROTEC Admin",
    role: "PARTNER_ADMIN" as UserRole,
    partnerId: "partner-hirotec",
    partnerName: "HIROTEC America",
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
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/")
      const isAuthRoute = nextUrl.pathname.startsWith("/auth")
      
      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl))
        }
        return true
      }
      
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      }
      
      return true
    },
    jwt({ token, user }) {
      if (user) {
        // Initial sign in
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.partnerId = user.partnerId
        token.partnerName = user.partnerName
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

        const isValidPassword = await compare(credentials.password as string, user.password)
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET,
  debug: false, // Set to true if you need to debug auth issues
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)