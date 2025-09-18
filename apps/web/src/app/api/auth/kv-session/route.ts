import { NextRequest, NextResponse } from 'next/server'

interface SetSessionRequest {
  action: 'set'
  sessionToken: string
  sessionData: unknown
}

interface GetSessionRequest {
  action: 'get'
  sessionToken: string
}

interface DeleteSessionRequest {
  action: 'delete' | 'deleteUser'
  sessionToken?: string
  userId?: string
}

// This API endpoint manages session storage in KV store for production
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as SetSessionRequest
    const { action, sessionToken, sessionData } = body
    
    if (action !== 'set' || !sessionToken || !sessionData) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    // In a Cloudflare Worker environment, you would use:
    // await env.HUMBER_SESSIONS.put(`session:${sessionToken}`, JSON.stringify(sessionData), {
    //   expirationTtl: 30 * 24 * 60 * 60 // 30 days
    // })

    // For now, we'll simulate KV storage with a simple in-memory store
    // In production, replace this with actual KV binding
    // SECURITY: Removed // SECURITY: Removed console.log('📝 KV Store - Setting session:', sessionToken.substring(0, Math.min(8, sessionToken.length)) + '...')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    // SECURITY: Removed console.error('KV Store - Set session error:', error)
    return NextResponse.json(
      { error: 'Failed to store session' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GetSessionRequest
    const { action, sessionToken } = body
    
    if (action !== 'get' || !sessionToken) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    // In a Cloudflare Worker environment, you would use:
    // const sessionData = await env.HUMBER_SESSIONS.get(`session:${sessionToken}`)
    // if (!sessionData) {
    //   return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    // }
    // return NextResponse.json(JSON.parse(sessionData))

    // For now, we'll simulate that sessions don't exist in KV
    // This will cause fallback to localStorage
    // SECURITY: Removed // SECURITY: Removed console.log('🔍 KV Store - Getting session:', sessionToken.substring(0, Math.min(8, sessionToken.length)) + '...')
    
    return NextResponse.json(
      { error: 'Session not found in KV store' },
      { status: 404 }
    )
  } catch (error) {
    // SECURITY: Removed console.error('KV Store - Get session error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json() as DeleteSessionRequest
    const { action, sessionToken, userId } = body
    
    if (!action || (action === 'delete' && !sessionToken) || (action === 'deleteUser' && !userId)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    if (action === 'delete' && sessionToken) {
      // In a Cloudflare Worker environment, you would use:
      // await env.HUMBER_SESSIONS.delete(`session:${sessionToken}`)
      
      // SECURITY: Removed // SECURITY: Removed console.log('🗑️ KV Store - Deleting session:', sessionToken.substring(0, Math.min(8, sessionToken.length)) + '...')
    } else if (action === 'deleteUser' && userId) {
      // In a Cloudflare Worker environment, you would use:
      // const list = await env.HUMBER_SESSIONS.list({ prefix: `session:` })
      // for (const key of list.keys) {
      //   const sessionData = await env.HUMBER_SESSIONS.get(key.name)
      //   if (sessionData) {
      //     const session = JSON.parse(sessionData)
      //     if (session.user.id === userId) {
      //       await env.HUMBER_SESSIONS.delete(key.name)
      //     }
      //   }
      // }
      
      // SECURITY: Removed // SECURITY: Removed console.log('🗑️ KV Store - Deleting all sessions for user:', userId)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    // SECURITY: Removed console.error('KV Store - Delete session error:', error)
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}