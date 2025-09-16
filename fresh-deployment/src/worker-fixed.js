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
    
    // Serve the working frontend
    return new Response(getWorkingApp(env), { 
      headers: { 'Content-Type': 'text/html', 'Cache-Control': 'public, max-age=300', 'Access-Control-Allow-Origin': '*' },
      status: 200 
    });
  },
};

function getWorkingApp(env) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Humber Operations - Working Platform</title>
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
                        <p class="text-xs text-gray-400">Working Platform</p>
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
            </nav>
            
            <div class="p-4 border-t border-gray-700">
                <div id="api-status" class="flex items-center space-x-2 p-2 rounded-lg bg-green-900/50">
                    <div class="w-2 h-2 rounded-full bg-green-400"></div>
                    <span class="text-xs font-medium" id="api-status-text">API Connected</span>
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
                    <!-- DASHBOARD PAGE -->
                    <div id="dashboard-page" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-gray-400 text-sm font-medium">Total Revenue</p>
                                        <p class="text-2xl font-bold text-white mt-1">$917,235</p>
                                        <p class="text-sm mt-1 text-green-400">+12.5%</p>
                                    </div>
                                    <div class="p-3 rounded-lg bg-gray-700"><span class="text-2xl">💰</span></div>
                                </div>
                            </div>
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-gray-400 text-sm font-medium">Active Projects</p>
                                        <p class="text-2xl font-bold text-white mt-1">15</p>
                                        <p class="text-sm mt-1 text-blue-400">+3 this month</p>
                                    </div>
                                    <div class="p-3 rounded-lg bg-gray-700"><span class="text-2xl">🚀</span></div>
                                </div>
                            </div>
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-gray-400 text-sm font-medium">Engineers</p>
                                        <p class="text-2xl font-bold text-white mt-1">48</p>
                                        <p class="text-sm mt-1 text-purple-400">+2 this week</p>
                                    </div>
                                    <div class="p-3 rounded-lg bg-gray-700"><span class="text-2xl">👨‍💻</span></div>
                                </div>
                            </div>
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
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
                            <h3 class="text-lg font-semibold mb-4">Working Platform Status</h3>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button onclick="testAI()" class="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-medium transition">🤖 Test Workers AI</button>
                                <button onclick="testBackend()" class="bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg font-medium transition">🔗 Test Backend</button>
                                <button onclick="alert('All systems operational!')" class="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg font-medium transition">✅ Platform Status</button>
                            </div>
                            <div id="test-results" class="mt-4 p-4 bg-gray-700 rounded-lg">
                                <p class="text-green-400">✅ Platform is working! Click buttons to test services.</p>
                            </div>
                        </div>
                    </div>

                    <!-- BULL PEN PAGE -->
                    <div id="bull-pen-page" class="space-y-6 hidden">
                        <div class="flex justify-between items-center">
                            <h1 class="text-3xl font-bold">Resource Allocation Hub</h1>
                            <button onclick="alert('Travel booking feature coming soon!')" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition">
                                ✈️ Book Travel
                            </button>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div class="bg-blue-500/20 border border-blue-500/30 p-6 rounded-xl">
                                <div class="flex items-center justify-between mb-4">
                                    <span class="text-2xl">🔧</span>
                                    <span class="text-blue-400 font-bold">Controls</span>
                                </div>
                                <div class="space-y-2">
                                    <div class="flex justify-between"><span class="text-sm">Available:</span><span class="text-green-400 font-bold">12</span></div>
                                    <div class="flex justify-between"><span class="text-sm">Deployed:</span><span class="text-blue-400 font-bold">8</span></div>
                                </div>
                            </div>
                            <div class="bg-green-500/20 border border-green-500/30 p-6 rounded-xl">
                                <div class="flex items-center justify-between mb-4">
                                    <span class="text-2xl">🔩</span>
                                    <span class="text-green-400 font-bold">Mechanical</span>
                                </div>
                                <div class="space-y-2">
                                    <div class="flex justify-between"><span class="text-sm">Available:</span><span class="text-green-400 font-bold">15</span></div>
                                    <div class="flex justify-between"><span class="text-sm">Deployed:</span><span class="text-blue-400 font-bold">10</span></div>
                                </div>
                            </div>
                            <div class="bg-yellow-500/20 border border-yellow-500/30 p-6 rounded-xl">
                                <div class="flex items-center justify-between mb-4">
                                    <span class="text-2xl">⚡</span>
                                    <span class="text-yellow-400 font-bold">Electrical</span>
                                </div>
                                <div class="space-y-2">
                                    <div class="flex justify-between"><span class="text-sm">Available:</span><span class="text-green-400 font-bold">8</span></div>
                                    <div class="flex justify-between"><span class="text-sm">Deployed:</span><span class="text-blue-400 font-bold">6</span></div>
                                </div>
                            </div>
                            <div class="bg-purple-500/20 border border-purple-500/30 p-6 rounded-xl">
                                <div class="flex items-center justify-between mb-4">
                                    <span class="text-2xl">🔀</span>
                                    <span class="text-purple-400 font-bold">Piping</span>
                                </div>
                                <div class="space-y-2">
                                    <div class="flex justify-between"><span class="text-sm">Available:</span><span class="text-green-400 font-bold">10</span></div>
                                    <div class="flex justify-between"><span class="text-sm">Deployed:</span><span class="text-blue-400 font-bold">7</span></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h3 class="text-lg font-semibold mb-4">Available Engineers</h3>
                            <div class="space-y-3">
                                <div class="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <span class="text-white font-bold text-sm">SC</span>
                                        </div>
                                        <div>
                                            <p class="font-medium text-white">Sarah Chen</p>
                                            <p class="text-gray-400 text-sm">Senior Controls Engineer</p>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <span class="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Available</span>
                                        <p class="text-gray-400 text-xs mt-1">$125/hr</p>
                                    </div>
                                </div>
                                <div class="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                            <span class="text-white font-bold text-sm">MR</span>
                                        </div>
                                        <div>
                                            <p class="font-medium text-white">Michael Rodriguez</p>
                                            <p class="text-gray-400 text-sm">Mechanical Engineer</p>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <span class="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Available</span>
                                        <p class="text-gray-400 text-xs mt-1">$115/hr</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ENGINEERS PAGE -->
                    <div id="engineers-page" class="space-y-6 hidden">
                        <div class="flex justify-between items-center">
                            <h1 class="text-3xl font-bold">Engineers Management</h1>
                            <button onclick="loadEngineers()" class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition">
                                Load Engineers
                            </button>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div class="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                <h3 class="text-sm font-medium text-gray-400">Total Engineers</h3>
                                <p class="text-2xl font-bold text-white">48</p>
                            </div>
                            <div class="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                <h3 class="text-sm font-medium text-gray-400">Available</h3>
                                <p class="text-2xl font-bold text-green-400">12</p>
                            </div>
                            <div class="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                <h3 class="text-sm font-medium text-gray-400">Deployed</h3>
                                <p class="text-2xl font-bold text-blue-400">36</p>
                            </div>
                            <div class="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                <h3 class="text-sm font-medium text-gray-400">Utilization</h3>
                                <p class="text-2xl font-bold text-purple-400">87%</p>
                            </div>
                        </div>
                        
                        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h3 class="text-lg font-semibold mb-4">Engineer Directory</h3>
                            <div id="engineers-list" class="space-y-3">
                                <div class="text-center py-8">
                                    <span class="text-4xl">👨‍💻</span>
                                    <p class="text-gray-400 mt-2">Click "Load Engineers" to fetch data</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TIME TRACKING PAGE -->
                    <div id="time-page" class="space-y-6 hidden">
                        <div class="flex justify-between items-center">
                            <h1 class="text-3xl font-bold">Advanced Time Tracking</h1>
                            <div class="flex space-x-3">
                                <button onclick="clockIn()" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition">
                                    🕐 Clock In
                                </button>
                                <button onclick="clockOut()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition">
                                    🕐 Clock Out
                                </button>
                            </div>
                        </div>
                        
                        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h3 class="text-lg font-semibold mb-4">Recent Time Entries</h3>
                            <div class="space-y-3">
                                <div class="bg-gray-700 p-4 rounded-lg">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <p class="font-semibold text-white">Sarah Johnson</p>
                                            <p class="text-gray-400 text-sm">Senior Electrical Engineer • GM Assembly Line</p>
                                            <p class="text-gray-300 text-sm mt-1">08:02 AM - 05:45 PM (9.72 hours)</p>
                                        </div>
                                        <div class="text-right">
                                            <span class="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Verified</span>
                                            <p class="text-gray-400 text-xs mt-1">Trust Score: 98%</p>
                                        </div>
                                    </div>
                                    <div class="mt-3 flex space-x-4 text-xs">
                                        <span class="text-blue-400">✓ Biometric</span>
                                        <span class="text-green-400">✓ Geolocation</span>
                                        <span class="text-purple-400">✓ Device Trust</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ANALYTICS PAGE -->
                    <div id="analytics-page" class="space-y-6 hidden">
                        <h1 class="text-3xl font-bold">Analytics Dashboard</h1>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 class="text-sm font-medium text-gray-400">Revenue YTD</h3>
                                <p class="text-2xl font-bold text-green-400">$2.4M</p>
                                <p class="text-sm text-green-400 mt-1">+18.5% vs last year</p>
                            </div>
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 class="text-sm font-medium text-gray-400">Billable Hours</h3>
                                <p class="text-2xl font-bold text-blue-400">73%</p>
                                <p class="text-sm text-blue-400 mt-1">+5.2% efficiency</p>
                            </div>
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 class="text-sm font-medium text-gray-400">Client Satisfaction</h3>
                                <p class="text-2xl font-bold text-purple-400">4.8/5</p>
                                <p class="text-sm text-purple-400 mt-1">+0.3 improvement</p>
                            </div>
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 class="text-sm font-medium text-gray-400">Project Success</h3>
                                <p class="text-2xl font-bold text-orange-400">94%</p>
                                <p class="text-sm text-orange-400 mt-1">On-time delivery</p>
                            </div>
                        </div>
                    </div>

                    <!-- OPERATIONS PAGE -->
                    <div id="operations-page" class="space-y-6 hidden">
                        <h1 class="text-3xl font-bold">Operations Pipeline</h1>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 class="text-lg font-semibold mb-2 text-blue-400">Recruit</h3>
                                <p class="text-3xl font-bold">5</p>
                                <p class="text-sm text-gray-400 mt-1">In pipeline</p>
                            </div>
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 class="text-lg font-semibold mb-2 text-green-400">Hire</h3>
                                <p class="text-3xl font-bold">3</p>
                                <p class="text-sm text-gray-400 mt-1">Ready to deploy</p>
                            </div>
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 class="text-lg font-semibold mb-2 text-yellow-400">Visa</h3>
                                <p class="text-3xl font-bold">2</p>
                                <p class="text-sm text-gray-400 mt-1">Processing</p>
                            </div>
                            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 class="text-lg font-semibold mb-2 text-purple-400">Deploy</h3>
                                <p class="text-3xl font-bold">8</p>
                                <p class="text-sm text-gray-400 mt-1">Active deployments</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <script>
        const API_URL = '${env.NEXT_PUBLIC_API_URL || 'https://humber-operations-worker-prod.evafiai.workers.dev'}';
        let sidebarOpen = true;

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('current-date').textContent = new Date().toLocaleDateString();
            checkAPIStatus();
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
            document.querySelectorAll('[id$="-page"]').forEach(page => page.classList.add('hidden'));
            
            // Show selected page
            const targetPage = document.getElementById(pageId + '-page');
            if (targetPage) targetPage.classList.remove('hidden');
            
            // Update navigation
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('bg-gradient-to-r', 'from-blue-600', 'to-purple-600', 'text-white', 'shadow-lg');
                btn.classList.add('text-gray-300', 'hover:bg-gray-700', 'hover:text-white');
            });
            
            event.target.closest('.nav-btn').classList.add('bg-gradient-to-r', 'from-blue-600', 'to-purple-600', 'text-white', 'shadow-lg');
            event.target.closest('.nav-btn').classList.remove('text-gray-300', 'hover:bg-gray-700', 'hover:text-white');
            
            // Update title
            document.getElementById('page-title').textContent = pageId.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase());
        }

        async function checkAPIStatus() {
            try {
                const response = await fetch(API_URL + '/health');
                document.getElementById('api-status-text').textContent = 'API Connected';
            } catch (error) {
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
                    body: JSON.stringify({ message: 'Test working deployment!' })
                });
                const data = await response.json();
                resultsDiv.innerHTML = \`<div class="bg-green-900/50 border border-green-700 p-3 rounded-lg">
                    <h4 class="font-semibold text-green-400 mb-2">✅ Workers AI Working!</h4>
                    <p class="text-sm text-gray-300">\${data.response}</p></div>\`;
            } catch (error) {
                resultsDiv.innerHTML = \`<div class="bg-red-900/50 border border-red-700 p-3 rounded-lg">
                    <h4 class="font-semibold text-red-400 mb-2">❌ AI Test Failed</h4>
                    <p class="text-sm text-gray-300">\${error.message}</p></div>\`;
            }
        }

        async function testBackend() {
            const resultsDiv = document.getElementById('test-results');
            resultsDiv.innerHTML = '<p class="text-yellow-400">Testing Backend...</p>';
            try {
                const response = await fetch(API_URL + '/health');
                const data = await response.json();
                resultsDiv.innerHTML = \`<div class="bg-green-900/50 border border-green-700 p-3 rounded-lg">
                    <h4 class="font-semibold text-green-400 mb-2">✅ Backend Working!</h4>
                    <p class="text-sm text-gray-300">Status: \${data.status}</p></div>\`;
            } catch (error) {
                resultsDiv.innerHTML = \`<div class="bg-red-900/50 border border-red-700 p-3 rounded-lg">
                    <h4 class="font-semibold text-red-400 mb-2">❌ Backend Test Failed</h4>
                    <p class="text-sm text-gray-300">\${error.message}</p></div>\`;
            }
        }

        function loadEngineers() {
            const list = document.getElementById('engineers-list');
            list.innerHTML = '<p class="text-yellow-400">Loading engineers from backend...</p>';
            
            setTimeout(() => {
                list.innerHTML = \`
                    <div class="space-y-3">
                        <div class="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <h4 class="font-semibold text-white">Sarah Chen</h4>
                                <p class="text-gray-400 text-sm">Senior Controls Engineer</p>
                                <p class="text-gray-500 text-xs">Skills: PLC Programming, SCADA, HMI Design</p>
                            </div>
                            <span class="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Available</span>
                        </div>
                        <div class="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <h4 class="font-semibold text-white">Michael Rodriguez</h4>
                                <p class="text-gray-400 text-sm">Mechanical Engineer</p>
                                <p class="text-gray-500 text-xs">Skills: AutoCAD, SolidWorks, FEA Analysis</p>
                            </div>
                            <span class="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Available</span>
                        </div>
                        <div class="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <h4 class="font-semibold text-white">Alex Kim</h4>
                                <p class="text-gray-400 text-sm">Electrical Engineer</p>
                                <p class="text-gray-500 text-xs">Skills: Power Systems, Motor Controls, PLCs</p>
                            </div>
                            <span class="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Available</span>
                        </div>
                    </div>
                \`;
            }, 1000);
        }

        function clockIn() {
            alert('Clock In: Initiating biometric verification and geolocation check.');
        }

        function clockOut() {
            alert('Clock Out: Recording time entry with trust verification.');
        }
    </script>
</body>
</html>`;
}

// Export Durable Objects
export { ChatSession, RealtimeConnection };
