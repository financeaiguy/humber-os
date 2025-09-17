// @ts-nocheck
// Complete Humber Operations Worker with actual Next.js components
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    // Handle API routes - proxy to backend
    if (url.pathname.startsWith('/api/')) {
      try {
        const backendUrl = `${env.NEXT_PUBLIC_API_URL}${url.pathname}${url.search}`
        const response = await fetch(backendUrl, {
          method: request.method,
          headers: {
            ...request.headers,
            'X-Tenant-ID': env.NEXT_PUBLIC_TENANT_ID || 'tenant-001'
          },
          body: request.method !== 'GET' ? request.body : undefined
        })
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...response.headers,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tenant-ID'
          }
        })
      } catch (error) {
        console.error('API proxy error:', error)
        return Response.json({ 
          error: 'API request failed', 
          message: error.message 
        }, { status: 500 })
      }
    }
    
    // Handle AI endpoints
    if (url.pathname === '/ai/chat') {
      try {
        const { message } = await request.json()
        const response = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
          messages: [
            { role: 'system', content: 'You are a helpful assistant for Humber Operations engineering platform.' },
            { role: 'user', content: message }
          ]
        })
        
        return Response.json({ 
          response: response.response,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error('AI error:', error)
        return Response.json({ 
          error: 'AI request failed', 
          message: error.message 
        }, { status: 500 })
      }
    }
    
    // Handle static assets
    if (url.pathname.startsWith('/static/') || url.pathname.startsWith('/_next/static/')) {
      return new Response('Static asset not found', { status: 404 })
    }
    
    // Health check
    if (url.pathname === '/health') {
      return Response.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: env.ENVIRONMENT || 'development',
        version: env.API_VERSION || '1.0.0'
      })
    }
    
    // Serve the main application
    try {
      // Import the app renderer
      const { renderApp } = await import('./workers-app')
      const html = renderApp(url.pathname)
      
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
      })
    } catch (error) {
      console.error('App render error:', error)
      
      // Fallback HTML
      const fallbackHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Humber Operations</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-900 text-white">
            <div class="min-h-screen flex items-center justify-center">
                <div class="text-center">
                    <h1 class="text-4xl font-bold mb-4">Humber Operations</h1>
                    <p class="text-slate-200 mb-8">Engineering Excellence Platform</p>
                    <div class="space-y-2">
                        <p class="text-red-400">Application Error: ${error.message}</p>
                        <p class="text-sm text-slate-400">Please contact support if this persists.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `
      
      return new Response(fallbackHtml, {
        status: 500,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      })
    }
  }
}

// Export for Durable Objects (if needed)
export class ChatSession {
  constructor(state, env) {
    this.state = state
    this.env = env
  }

  async fetch(request) {
    const url = new URL(request.url)
    
    if (url.pathname === '/websocket') {
      const [client, server] = Object.values(new WebSocketPair())
      server.accept()
      
      server.addEventListener('message', async (event) => {
        const data = JSON.parse(event.data)
        // Handle chat messages here
        server.send(JSON.stringify({
          type: 'response',
          message: `Echo: ${data.message}`,
          timestamp: new Date().toISOString()
        }))
      })
      
      return new Response(null, { status: 101, webSocket: client })
    }
    
    return new Response('Chat session endpoint', { status: 200 })
  }
}

export class RealtimeConnection {
  constructor(state, env) {
    this.state = state
    this.env = env
  }

  async fetch(request) {
    return new Response('Realtime connection handler', { status: 200 })
  }
}
