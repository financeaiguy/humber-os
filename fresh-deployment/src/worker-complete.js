import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

// Durable Objects
class ChatSession {
  constructor(state, env) { this.state = state; this.env = env; }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/websocket') {
      const [client, server] = Object.values(new WebSocketPair());
      server.accept();
      return new Response(null, { status: 101, webSocket: client });
    }
    return new Response('Not found', { status: 404 });
  }
}

class RealtimeConnection {
  constructor(state, env) { this.state = state; this.env = env; }
  async fetch(request) { return new Response('Realtime connection handler', { status: 200 }); }
}

// Main Worker
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle API routes - proxy to backend
    if (url.pathname.startsWith('/api/')) {
      return fetch(`${env.NEXT_PUBLIC_API_URL}${url.pathname}${url.search}`, {
        method: request.method, headers: request.headers, body: request.body
      });
    }
    
    // Handle AI endpoints
    if (url.pathname === '/ai/chat') {
      const { message } = await request.json();
      const response = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
        messages: [{ role: 'user', content: message }]
      });
      return Response.json({ response: response.response });
    }
    
    // Serve the complete Humber Operations frontend
    return new Response(getCompleteHumberApp(env), { 
      headers: { 'Content-Type': 'text/html', 'Cache-Control': 'public, max-age=300', 'Access-Control-Allow-Origin': '*' },
      status: 200 
    });
  },
};

function getCompleteHumberApp(env) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Humber Operations - Complete Platform</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .sidebar-transition { transition: width 0.3s ease-in-out; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; }
        .modal.show { display: flex; align-items: center; justify-content: center; }
    </style>
</head>
<body class="bg-gray-900 text-white">
    <div class="flex h-screen bg-gray-900">
        <!-- Sidebar -->
        <div id="sidebar" class="bg-gray-800 border-r border-gray-700 w-64 sidebar-transition">
            <div class="p-4 border-b border-gray-700">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold text-sm">H</span>
                    </div>
                    <div id="sidebar-text">
                        <h1 class="text-lg font-bold">Humber Operations</h1>
                        <p class="text-xs text-gray-400">Complete Platform</p>
                    </div>
                </div>
            </div>
            
            <nav class="flex-1 p-4 space-y-1">
                <button onclick="showPage('dashboard')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                    <span class="text-xl">📊</span><span class="nav-text font-medium">Dashboard</span>
                </button>
                <button onclick="showPage('bull-pen')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
                    <span class="text-xl">👥</span><span class="nav-text font-medium">Bull Pen</span>
                </button>
                <button onclick="showPage('engineers')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
                    <span class="text-xl">👨‍💻</span><span class="nav-text font-medium">Engineers</span>
                </button>
                <button onclick="showPage('analytics')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
                    <span class="text-xl">📈</span><span class="nav-text font-medium">Analytics</span>
                </button>
                <button onclick="showPage('time')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
                    <span class="text-xl">⏰</span><span class="nav-text font-medium">Time Tracking</span>
                </button>
                <button onclick="showPage('operations')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
                    <span class="text-xl">🔄</span><span class="nav-text font-medium">Operations</span>
                </button>
                <button onclick="showPage('recruits')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
                    <span class="text-xl">👔</span><span class="nav-text font-medium">Recruits</span>
                </button>
                <button onclick="showPage('projects')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
                    <span class="text-xl">📋</span><span class="nav-text font-medium">Projects</span>
                </button>
                <button onclick="showPage('onboarding')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
                    <span class="text-xl">🎓</span><span class="nav-text font-medium">Onboarding</span>
                </button>
                <button onclick="showPage('settings')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
                    <span class="text-xl">⚙️</span><span class="nav-text font-medium">Settings</span>
                </button>
            </nav>
            
            <div class="p-4 border-t border-gray-700">
                <div id="api-status" class="flex items-center space-x-2 p-2 rounded-lg bg-green-900/50">
                    <div class="w-2 h-2 rounded-full bg-green-400"></div>
                    <span class="text-xs font-medium" id="api-status-text">Checking API...</span>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 flex flex-col">
            <header class="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <button onclick="toggleSidebar()" class="p-2 rounded-lg hover:bg-gray-700 transition-colors">
                            <span class="text-xl">☰</span>
                        </button>
                        <h2 id="page-title" class="text-xl font-bold">Dashboard</h2>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="text-sm text-gray-400">Edge Deployed • <span id="current-date"></span></div>
                    </div>
                </div>
            </header>

            <main class="flex-1 overflow-auto p-6 bg-gray-900">
                <div id="page-content">
                    ${getDashboardPage()}
                    ${getBullPenPage()}
                    ${getEngineersPage()}
                    ${getTimeTrackingPage()}
                    ${getAnalyticsPage()}
                    ${getOperationsPage()}
                    ${getRecruitsPage()}
                    ${getProjectsPage()}
                    ${getOnboardingPage()}
                    ${getSettingsPage()}
                </div>
            </main>
        </div>
    </div>
    ${getJavaScriptFunctions()}
</body>
</html>`;
}

function getDashboardPage() {
  return \`<!-- DASHBOARD PAGE -->
  <div id="dashboard-page" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
              <div class="flex items-center justify-between">
                  <div>
                      <p class="text-gray-400 text-sm font-medium">Total Revenue</p>
                      <p class="text-2xl font-bold text-white mt-1">$917,235</p>
                      <p class="text-sm mt-1 text-green-400">+12.5%</p>
                  </div>
                  <div class="p-3 rounded-lg bg-gray-700"><span class="text-2xl">💰</span></div>
              </div>
          </div>
          <div class="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
              <div class="flex items-center justify-between">
                  <div>
                      <p class="text-gray-400 text-sm font-medium">Active Projects</p>
                      <p class="text-2xl font-bold text-white mt-1">15</p>
                      <p class="text-sm mt-1 text-blue-400">+3 this month</p>
                  </div>
                  <div class="p-3 rounded-lg bg-gray-700"><span class="text-2xl">🚀</span></div>
              </div>
          </div>
          <div class="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
              <div class="flex items-center justify-between">
                  <div>
                      <p class="text-gray-400 text-sm font-medium">Engineers</p>
                      <p class="text-2xl font-bold text-white mt-1">48</p>
                      <p class="text-sm mt-1 text-purple-400">+2 this week</p>
                  </div>
                  <div class="p-3 rounded-lg bg-gray-700"><span class="text-2xl">👨‍💻</span></div>
              </div>
          </div>
          <div class="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
              <div class="flex items-center justify-between">
                  <div>
                      <p class="text-gray-400 text-sm font-medium">Hours Tracked</p>
                      <p class="text-2xl font-bold text-white mt-1">1,847</p>
                      <p class="text-sm mt-1 text-orange-400">+156 today</p>
                  </div>
                  <div class="p-3 rounded-lg bg-gray-700"><span class="text-2xl">⏰</span></div>
              </div>
          </div>
      </div>
      
      <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 class="text-lg font-semibold mb-4">Test Cloudflare Services</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onclick="testAI()" class="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-medium transition">🤖 Test Workers AI</button>
              <button onclick="testBackend()" class="bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg font-medium transition">🔗 Test Backend API</button>
              <button onclick="testVectorize()" class="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg font-medium transition">🔍 Test Vectorize</button>
          </div>
          <div id="test-results" class="mt-4 p-4 bg-gray-700 rounded-lg min-h-[100px]">
              <p class="text-gray-400">Click any test button to verify service integration...</p>
          </div>
      </div>
  </div>\`;
}