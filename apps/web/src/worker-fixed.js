import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

// Durable Objects
class ChatSession {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

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
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    return new Response('Realtime connection handler', { status: 200 });
  }
}

// Main Worker
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle API routes - proxy to backend
    if (url.pathname.startsWith('/api/')) {
      return fetch(`${env.NEXT_PUBLIC_API_URL}${url.pathname}${url.search}`, {
        method: request.method,
        headers: request.headers,
        body: request.body
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
    
    // Serve the Humber Operations frontend
    return new Response(getHumberApp(env), { 
      headers: { 
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*'
      },
      status: 200 
    });
  },
};

function getHumberApp(env) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Humber Operations - Full Platform</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .sidebar-transition { transition: width 0.3s ease-in-out; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
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
                        <p class="text-xs text-gray-400">Cloudflare Workers</p>
                    </div>
                </div>
            </div>
            
            <nav class="flex-1 p-4 space-y-1">
                <button onclick="showPage('dashboard')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                    <span class="text-xl">📊</span>
                    <span class="nav-text font-medium">Dashboard</span>
                </button>
                <button onclick="showPage('bull-pen')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
                    <span class="text-xl">👥</span>
                    <span class="nav-text font-medium">Bull Pen</span>
                </button>
                <button onclick="showPage('engineers')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
                    <span class="text-xl">👨‍💻</span>
                    <span class="nav-text font-medium">Engineers</span>
                </button>
                <button onclick="showPage('analytics')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
                    <span class="text-xl">📈</span>
                    <span class="nav-text font-medium">Analytics</span>
                </button>
                <button onclick="showPage('time')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
                    <span class="text-xl">⏰</span>
                    <span class="nav-text font-medium">Time Tracking</span>
                </button>
                <button onclick="showPage('operations')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
                    <span class="text-xl">🔄</span>
                    <span class="nav-text font-medium">Operations</span>
                </button>
                <button onclick="showPage('recruits')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
                    <span class="text-xl">👔</span>
                    <span class="nav-text font-medium">Recruits</span>
                </button>
                <button onclick="showPage('projects')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
                    <span class="text-xl">📋</span>
                    <span class="nav-text font-medium">Projects</span>
                </button>
                <button onclick="showPage('onboarding')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
                    <span class="text-xl">🎓</span>
                    <span class="nav-text font-medium">Onboarding</span>
                </button>
                <button onclick="showPage('settings')" class="nav-btn w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition">
                    <span class="text-xl">⚙️</span>
                    <span class="nav-text font-medium">Settings</span>
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
            <!-- Header -->
            <header class="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <button onclick="toggleSidebar()" class="p-2 rounded-lg hover:bg-gray-700 transition-colors">
                            <span class="text-xl">☰</span>
                        </button>
                        <h2 id="page-title" class="text-xl font-bold">Dashboard</h2>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="text-sm text-gray-400">
                            Edge Deployed • <span id="current-date"></span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Content -->
            <main class="flex-1 overflow-auto p-6 bg-gray-900">
                <div id="page-content">
                    <!-- Dashboard Content -->
                    <div id="dashboard-page" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-gray-400 text-sm font-medium">Total Revenue</p>
                                        <p class="text-2xl font-bold text-white mt-1">$917,235</p>
                                        <p class="text-sm mt-1 text-green-400">+12.5%</p>
                                    </div>
                                    <div class="p-3 rounded-lg bg-gray-700">
                                        <span class="text-2xl">💰</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-gray-400 text-sm font-medium">Active Projects</p>
                                        <p class="text-2xl font-bold text-white mt-1">15</p>
                                        <p class="text-sm mt-1 text-blue-400">+3 this month</p>
                                    </div>
                                    <div class="p-3 rounded-lg bg-gray-700">
                                        <span class="text-2xl">🚀</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-gray-400 text-sm font-medium">Engineers</p>
                                        <p class="text-2xl font-bold text-white mt-1" id="engineer-count">48</p>
                                        <p class="text-sm mt-1 text-purple-400">+2 this week</p>
                                    </div>
                                    <div class="p-3 rounded-lg bg-gray-700">
                                        <span class="text-2xl">👨‍💻</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-gray-400 text-sm font-medium">Hours Tracked</p>
                                        <p class="text-2xl font-bold text-white mt-1">1,847</p>
                                        <p class="text-sm mt-1 text-orange-400">+156 today</p>
                                    </div>
                                    <div class="p-3 rounded-lg bg-gray-700">
                                        <span class="text-2xl">⏰</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 class="text-lg font-semibold mb-4 flex items-center">
                                    <span class="mr-2 text-blue-400">📊</span>
                                    Recent Activity
                                </h3>
                                <div class="space-y-3">
                                    <div class="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                                        <div class="w-2 h-2 rounded-full bg-green-400"></div>
                                        <div class="flex-1">
                                            <p class="font-medium text-sm">New engineer onboarded</p>
                                            <p class="text-xs text-gray-400">2 hours ago</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                                        <div class="w-2 h-2 rounded-full bg-blue-400"></div>
                                        <div class="flex-1">
                                            <p class="font-medium text-sm">Project milestone completed</p>
                                            <p class="text-xs text-gray-400">4 hours ago</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                                        <div class="w-2 h-2 rounded-full bg-green-400"></div>
                                        <div class="flex-1">
                                            <p class="font-medium text-sm">Background check completed</p>
                                            <p class="text-xs text-gray-400">6 hours ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 class="text-lg font-semibold mb-4 flex items-center">
                                    <span class="mr-2 text-green-400">💚</span>
                                    System Health
                                </h3>
                                <div class="space-y-3">
                                    <div class="flex justify-between items-center p-2">
                                        <span class="text-sm font-medium">Workers AI</span>
                                        <span class="text-sm font-semibold text-green-400">✓ operational</span>
                                    </div>
                                    <div class="flex justify-between items-center p-2">
                                        <span class="text-sm font-medium">Vectorize</span>
                                        <span class="text-sm font-semibold text-green-400">✓ operational</span>
                                    </div>
                                    <div class="flex justify-between items-center p-2">
                                        <span class="text-sm font-medium">D1 Databases</span>
                                        <span class="text-sm font-semibold text-green-400">✓ operational</span>
                                    </div>
                                    <div class="flex justify-between items-center p-2">
                                        <span class="text-sm font-medium">R2 Storage</span>
                                        <span class="text-sm font-semibold text-green-400">✓ operational</span>
                                    </div>
                                    <div class="flex justify-between items-center p-2">
                                        <span class="text-sm font-medium">Backend API</span>
                                        <span id="backend-status" class="text-sm font-semibold text-yellow-400">⏳ checking</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <h3 class="text-lg font-semibold mb-4">Test Cloudflare Services</h3>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button onclick="testAI()" class="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-medium transition">
                                    🤖 Test Workers AI
                                </button>
                                <button onclick="testBackend()" class="bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg font-medium transition">
                                    🔗 Test Backend API
                                </button>
                                <button onclick="testVectorize()" class="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg font-medium transition">
                                    🔍 Test Vectorize
                                </button>
                            </div>
                            <div id="test-results" class="mt-4 p-4 bg-gray-700 rounded-lg min-h-[100px]">
                                <p class="text-gray-400">Click any test button to verify service integration...</p>
                            </div>
                        </div>
                    </div>

                    <!-- Bull Pen Page -->
                    <div id="bull-pen-page" class="space-y-6 hidden">
                        <div class="flex justify-between items-center">
                            <h1 class="text-3xl font-bold">Bull Pen Dashboard</h1>
                            <button onclick="loadEngineers()" class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition">
                                Load Engineers
                            </button>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 class="text-lg font-semibold mb-2 text-green-400">Available</h3>
                                <p class="text-3xl font-bold">12</p>
                                <p class="text-sm text-gray-400 mt-1">Ready for deployment</p>
                            </div>
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 class="text-lg font-semibold mb-2 text-blue-400">Deployed</h3>
                                <p class="text-3xl font-bold">36</p>
                                <p class="text-sm text-gray-400 mt-1">Currently working</p>
                            </div>
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 class="text-lg font-semibold mb-2 text-purple-400">Utilization</h3>
                                <p class="text-3xl font-bold">87%</p>
                                <p class="text-sm text-gray-400 mt-1">Efficiency rate</p>
                            </div>
                        </div>
                        
                        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h3 class="text-lg font-semibold mb-4">Engineer Allocation</h3>
                            <div id="engineers-list" class="space-y-3">
                                <div class="text-center py-8">
                                    <span class="text-4xl">👥</span>
                                    <p class="text-gray-400 mt-2">No engineers loaded</p>
                                    <p class="text-sm text-gray-500">Click "Load Engineers" to fetch from backend</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Other Pages -->
                    <div id="engineers-page" class="space-y-6 hidden">
                        <h1 class="text-3xl font-bold">Engineers Management</h1>
                        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <p class="text-gray-300">Comprehensive engineer management with profiles, skills, and assignments.</p>
                        </div>
                    </div>

                    <div id="analytics-page" class="space-y-6 hidden">
                        <h1 class="text-3xl font-bold">Analytics Dashboard</h1>
                        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <p class="text-gray-300">Advanced analytics with interactive charts and KPI tracking.</p>
                        </div>
                    </div>

                    <div id="time-page" class="space-y-6 hidden">
                        <h1 class="text-3xl font-bold">Time Tracking</h1>
                        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <p class="text-gray-300">Advanced time tracking with biometric verification and real-time monitoring.</p>
                        </div>
                    </div>

                    <div id="operations-page" class="space-y-6 hidden">
                        <h1 class="text-3xl font-bold">Operations Pipeline</h1>
                        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <p class="text-gray-300">Complete operations workflow: Recruiting → Vetting → Deployment.</p>
                        </div>
                    </div>

                    <div id="recruits-page" class="space-y-6 hidden">
                        <h1 class="text-3xl font-bold">Recruits Management</h1>
                        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <p class="text-gray-300">Recruitment pipeline with candidate tracking and assessment.</p>
                        </div>
                    </div>

                    <div id="projects-page" class="space-y-6 hidden">
                        <h1 class="text-3xl font-bold">Projects</h1>
                        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <p class="text-gray-300">Project management with engineer assignments and progress tracking.</p>
                        </div>
                    </div>

                    <div id="onboarding-page" class="space-y-6 hidden">
                        <h1 class="text-3xl font-bold">Onboarding</h1>
                        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <p class="text-gray-300">Streamlined employee onboarding with document management and progress tracking.</p>
                        </div>
                    </div>

                    <div id="settings-page" class="space-y-6 hidden">
                        <h1 class="text-3xl font-bold">Settings</h1>
                        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <p class="text-gray-300">System configuration, user preferences, and integration settings.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <script>
        const API_URL = '${env.NEXT_PUBLIC_API_URL || 'https://humber-operations-worker-prod.evafiai.workers.dev'}';
        let sidebarOpen = true;
        let currentPage = 'dashboard';

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('current-date').textContent = new Date().toLocaleDateString();
            checkAPIStatus();
            setInterval(checkAPIStatus, 30000);
        });

        function toggleSidebar() {
            sidebarOpen = !sidebarOpen;
            const sidebar = document.getElementById('sidebar');
            const sidebarTexts = document.querySelectorAll('.nav-text, #sidebar-text, #api-status-text');
            
            if (sidebarOpen) {
                sidebar.classList.remove('w-16');
                sidebar.classList.add('w-64');
                sidebarTexts.forEach(el => el.style.display = 'block');
            } else {
                sidebar.classList.remove('w-64');
                sidebar.classList.add('w-16');
                sidebarTexts.forEach(el => el.style.display = 'none');
            }
        }

        function showPage(pageId) {
            // Hide all pages
            document.querySelectorAll('[id$="-page"]').forEach(page => {
                page.classList.add('hidden');
            });
            
            // Show selected page
            const targetPage = document.getElementById(pageId + '-page');
            if (targetPage) {
                targetPage.classList.remove('hidden');
            }
            
            // Update navigation
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('bg-gradient-to-r', 'from-blue-600', 'to-purple-600', 'text-white', 'shadow-lg');
                btn.classList.add('text-gray-300', 'hover:bg-gray-700', 'hover:text-white');
            });
            
            event.target.closest('.nav-btn').classList.add('bg-gradient-to-r', 'from-blue-600', 'to-purple-600', 'text-white', 'shadow-lg');
            event.target.closest('.nav-btn').classList.remove('text-gray-300', 'hover:bg-gray-700', 'hover:text-white');
            
            // Update title
            document.getElementById('page-title').textContent = pageId.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase());
            currentPage = pageId;
        }

        async function checkAPIStatus() {
            try {
                const response = await fetch(API_URL + '/health');
                const data = await response.json();
                
                document.getElementById('backend-status').innerHTML = '<span class="text-green-400">✓ operational</span>';
                document.getElementById('api-status').className = 'flex items-center space-x-2 p-2 rounded-lg bg-green-900/50';
                document.getElementById('api-status-text').textContent = 'API Connected';
            } catch (error) {
                document.getElementById('backend-status').innerHTML = '<span class="text-red-400">✗ error</span>';
                document.getElementById('api-status').className = 'flex items-center space-x-2 p-2 rounded-lg bg-red-900/50';
                document.getElementById('api-status-text').textContent = 'API Error';
            }
        }

        async function testAI() {
            const resultsDiv = document.getElementById('test-results');
            resultsDiv.innerHTML = '<p class="text-yellow-400">Testing Workers AI...</p>';
            
            try {
                const response = await fetch('/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: 'Hello from Humber Operations frontend!' })
                });
                const data = await response.json();
                resultsDiv.innerHTML = \`
                    <div class="bg-green-900/50 border border-green-700 p-3 rounded-lg">
                        <h4 class="font-semibold text-green-400 mb-2">✅ Workers AI Test Successful</h4>
                        <p class="text-sm text-gray-300">\${data.response}</p>
                    </div>
                \`;
            } catch (error) {
                resultsDiv.innerHTML = \`
                    <div class="bg-red-900/50 border border-red-700 p-3 rounded-lg">
                        <h4 class="font-semibold text-red-400 mb-2">❌ Workers AI Test Failed</h4>
                        <p class="text-sm text-gray-300">\${error.message}</p>
                    </div>
                \`;
            }
        }

        async function testBackend() {
            const resultsDiv = document.getElementById('test-results');
            resultsDiv.innerHTML = '<p class="text-yellow-400">Testing Backend API...</p>';
            
            try {
                const response = await fetch(API_URL + '/health');
                const data = await response.json();
                resultsDiv.innerHTML = \`
                    <div class="bg-green-900/50 border border-green-700 p-3 rounded-lg">
                        <h4 class="font-semibold text-green-400 mb-2">✅ Backend API Test Successful</h4>
                        <p class="text-sm text-gray-300">Status: \${data.status}</p>
                        <p class="text-sm text-gray-400">Timestamp: \${data.timestamp}</p>
                    </div>
                \`;
            } catch (error) {
                resultsDiv.innerHTML = \`
                    <div class="bg-red-900/50 border border-red-700 p-3 rounded-lg">
                        <h4 class="font-semibold text-red-400 mb-2">❌ Backend API Test Failed</h4>
                        <p class="text-sm text-gray-300">\${error.message}</p>
                    </div>
                \`;
            }
        }

        async function testVectorize() {
            const resultsDiv = document.getElementById('test-results');
            resultsDiv.innerHTML = '<p class="text-yellow-400">Testing Vectorize Search...</p>';
            
            try {
                const response = await fetch('/search/documents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: 'test search query', limit: 3 })
                });
                const data = await response.json();
                resultsDiv.innerHTML = \`
                    <div class="bg-green-900/50 border border-green-700 p-3 rounded-lg">
                        <h4 class="font-semibold text-green-400 mb-2">✅ Vectorize Test Successful</h4>
                        <p class="text-sm text-gray-300">Found \${data.results?.matches?.length || 0} results</p>
                    </div>
                \`;
            } catch (error) {
                resultsDiv.innerHTML = \`
                    <div class="bg-red-900/50 border border-red-700 p-3 rounded-lg">
                        <h4 class="font-semibold text-red-400 mb-2">❌ Vectorize Test Failed</h4>
                        <p class="text-sm text-gray-300">\${error.message}</p>
                    </div>
                \`;
            }
        }

        async function loadEngineers() {
            const engineersList = document.getElementById('engineers-list');
            engineersList.innerHTML = '<p class="text-yellow-400">Loading engineers...</p>';
            
            try {
                const response = await fetch(API_URL + '/engineers', {
                    headers: { 'X-Tenant-ID': 'tenant-001' }
                });
                const data = await response.json();
                
                if (data.engineers && data.engineers.length > 0) {
                    engineersList.innerHTML = data.engineers.map((engineer, index) => \`
                        <div class="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <h4 class="font-semibold">\${engineer.name || 'Engineer ' + (index + 1)}</h4>
                                <p class="text-gray-400 text-sm">\${engineer.role || 'Software Engineer'}</p>
                            </div>
                            <span class="px-3 py-1 rounded-full text-xs bg-green-900 text-green-300">
                                \${engineer.status || 'Available'}
                            </span>
                        </div>
                    \`).join('');
                } else {
                    engineersList.innerHTML = \`
                        <div class="text-center py-8">
                            <span class="text-4xl">👥</span>
                            <p class="text-gray-400 mt-2">No engineers found</p>
                            <p class="text-sm text-gray-500">Response: \${JSON.stringify(data)}</p>
                        </div>
                    \`;
                }
            } catch (error) {
                engineersList.innerHTML = \`
                    <div class="text-center py-8">
                        <span class="text-4xl">❌</span>
                        <p class="text-red-400 mt-2">Error loading engineers</p>
                        <p class="text-sm text-gray-500">\${error.message}</p>
                    </div>
                \`;
            }
        }
    </script>
</body>
</html>`;
}

// Export Durable Objects
export { ChatSession, RealtimeConnection };
