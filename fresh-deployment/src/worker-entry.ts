import { NextRequest, NextResponse } from 'next/server'

// Import your Next.js app entry point
import { handler as nextHandler } from './.next/server/middleware'

export interface Env {
  // Bindings
  AI: Ai
  KV_TENANT_CACHE: KVNamespace
  KV_CACHE: KVNamespace
  KV_SESSIONS: KVNamespace
  DB_MASTER: D1Database
  DB_ENGINEER_001: D1Database
  DB_ENGINEER_002: D1Database
  DB_ENGINEER_003: D1Database
  VECTORIZE_INDEX: VectorizeIndex
  DOCUMENTS: R2Bucket
  ASSETS: R2Bucket
  
  // Environment Variables
  ENVIRONMENT: string
  API_VERSION: string
  LOG_LEVEL: string
  NEXTAUTH_URL: string
  NEXTAUTH_SECRET: string
  NEXT_PUBLIC_API_URL: string
  NEXT_PUBLIC_TENANT_ID: string
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Convert standard Request to NextRequest
      const nextRequest = new NextRequest(request)
      
      // Set environment variables for Next.js
      process.env.NEXTAUTH_URL = env.NEXTAUTH_URL
      process.env.NEXTAUTH_SECRET = env.NEXTAUTH_SECRET
      process.env.NEXT_PUBLIC_API_URL = env.NEXT_PUBLIC_API_URL
      process.env.NEXT_PUBLIC_TENANT_ID = env.NEXT_PUBLIC_TENANT_ID
      
      // Make bindings available globally for Next.js app
      globalThis.cloudflare = {
        env,
        ctx,
        caches,
        cf: request.cf
      }
      
      // Handle the request with Next.js
      const response = await nextHandler(nextRequest)
      
      return response
    } catch (error) {
      console.error('Worker error:', error)
      return new Response('Internal Server Error', { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      })
    }
  }
}
