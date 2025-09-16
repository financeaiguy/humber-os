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
    
    // Serve the Humber Operations frontend directly
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
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
    </style>
</head>
<body class="bg-gray-900 text-white">
    <div id="root"></div>

    <script>
        // Pure vanilla JavaScript - no React/Babel needed
        
        const API_URL = '${env.NEXT_PUBLIC_API_URL || 'https://humber-operations-worker-prod.evafiai.workers.dev'}';

        function App() {
            const [currentPage, setCurrentPage] = useState('dashboard');
            const [sidebarOpen, setSidebarOpen] = useState(true);
            const [apiStatus, setApiStatus] = useState('checking');

            useEffect(() => {
                checkAPIStatus();
                setInterval(checkAPIStatus, 30000);
            }, []);

            async function checkAPIStatus() {
                try {
                    const response = await fetch(\`\${API_URL}/health\`);
                    setApiStatus(response.ok ? 'connected' : 'error');
                } catch (error) {
                    setApiStatus('error');
                }
            }

            const navigation = [
                { name: 'Dashboard', id: 'dashboard', icon: '📊' },
                { name: 'Bull Pen', id: 'bull-pen', icon: '👥' },
                { name: 'Engineers', id: 'engineers', icon: '👨‍💻' },
                { name: 'Analytics', id: 'analytics', icon: '📈' },
                { name: 'Time Tracking', id: 'time', icon: '⏰' },
                { name: 'Operations', id: 'operations', icon: '🔄' },
                { name: 'Recruits', id: 'recruits', icon: '👔' },
                { name: 'Projects', id: 'projects', icon: '📋' },
                { name: 'Onboarding', id: 'onboarding', icon: '🎓' },
                { name: 'Settings', id: 'settings', icon: '⚙️' },
            ];

            return (
                <div className="flex h-screen bg-gray-900">
                    {/* Sidebar */}
                    <div className={\`bg-gray-800 border-r border-gray-700 transition-all duration-300 \${sidebarOpen ? 'w-64' : 'w-16'}\`}>
                        <div className="p-4 border-b border-gray-700">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">H</span>
                                </div>
                                {sidebarOpen && (
                                    <div>
                                        <h1 className="text-lg font-bold">Humber Operations</h1>
                                        <p className="text-xs text-gray-400">Cloudflare Workers</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <nav className="flex-1 p-4 space-y-1">
                            {navigation.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setCurrentPage(item.id)}
                                    className={\`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 \${
                                        currentPage === item.id 
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }\`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    {sidebarOpen && <span className="font-medium">{item.name}</span>}
                                </button>
                            ))}
                        </nav>
                        
                        <div className="p-4 border-t border-gray-700">
                            <div className={\`flex items-center space-x-2 p-2 rounded-lg \${
                                apiStatus === 'connected' ? 'bg-green-900/50' : 'bg-red-900/50'
                            }\`}>
                                <div className={\`w-2 h-2 rounded-full \${
                                    apiStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                                }\`}></div>
                                {sidebarOpen && (
                                    <span className="text-xs font-medium">
                                        {apiStatus === 'connected' ? 'API Connected' : 'API Disconnected'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col">
                        {/* Header */}
                        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => setSidebarOpen(!sidebarOpen)}
                                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        <span className="text-xl">☰</span>
                                    </button>
                                    <h2 className="text-xl font-bold capitalize">
                                        {currentPage.replace('-', ' ')}
                                    </h2>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-sm text-gray-400">
                                        Edge Deployed • {new Date().toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Content */}
                        <main className="flex-1 overflow-auto p-6 bg-gray-900">
                            <PageRenderer page={currentPage} apiUrl={API_URL} />
                        </main>
                    </div>
                </div>
            );
        }

        function PageRenderer({ page, apiUrl }) {
            switch (page) {
                case 'dashboard':
                    return <Dashboard apiUrl={apiUrl} />;
                case 'bull-pen':
                    return <BullPen apiUrl={apiUrl} />;
                case 'engineers':
                    return <Engineers apiUrl={apiUrl} />;
                case 'analytics':
                    return <Analytics apiUrl={apiUrl} />;
                case 'time':
                    return <TimeTracking apiUrl={apiUrl} />;
                case 'operations':
                    return <Operations apiUrl={apiUrl} />;
                case 'recruits':
                    return <Recruits apiUrl={apiUrl} />;
                case 'projects':
                    return <Projects apiUrl={apiUrl} />;
                case 'onboarding':
                    return <Onboarding apiUrl={apiUrl} />;
                case 'settings':
                    return <Settings apiUrl={apiUrl} />;
                default:
                    return <Dashboard apiUrl={apiUrl} />;
            }
        }

        function Dashboard({ apiUrl }) {
            const stats = [
                { name: 'Total Revenue', value: '$917,235', change: '+12.5%', icon: '💰', color: 'text-green-400' },
                { name: 'Active Projects', value: '15', change: '+3 this month', icon: '🚀', color: 'text-blue-400' },
                { name: 'Engineers', value: '48', change: '+2 this week', icon: '👨‍💻', color: 'text-purple-400' },
                { name: 'Hours Tracked', value: '1,847', change: '+156 today', icon: '⏰', color: 'text-orange-400' }
            ];

            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat) => (
                            <div key={stat.name} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">{stat.name}</p>
                                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                                        <p className={\`text-sm mt-1 \${stat.color}\`}>{stat.change}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-gray-700">
                                        <span className="text-2xl">{stat.icon}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <span className="mr-2 text-blue-400">📊</span>
                                Recent Activity
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { action: 'New engineer onboarded', time: '2 hours ago', type: 'success' },
                                    { action: 'Project milestone completed', time: '4 hours ago', type: 'info' },
                                    { action: 'Background check completed', time: '6 hours ago', type: 'success' },
                                    { action: 'Client meeting scheduled', time: '8 hours ago', type: 'warning' }
                                ].map((activity, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                                        <div className={\`w-2 h-2 rounded-full \${
                                            activity.type === 'success' ? 'bg-green-400' :
                                            activity.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                                        }\`}></div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{activity.action}</p>
                                            <p className="text-xs text-gray-400">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <span className="mr-2 text-green-400">💚</span>
                                System Health
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { service: 'Workers AI', status: 'operational', color: 'text-green-400' },
                                    { service: 'Vectorize', status: 'operational', color: 'text-green-400' },
                                    { service: 'D1 Databases', status: 'operational', color: 'text-green-400' },
                                    { service: 'R2 Storage', status: 'operational', color: 'text-green-400' },
                                    { service: 'Backend API', status: 'operational', color: 'text-green-400' }
                                ].map((service) => (
                                    <div key={service.service} className="flex justify-between items-center p-2">
                                        <span className="text-sm font-medium">{service.service}</span>
                                        <span className={\`text-sm font-semibold \${service.color}\`}>✓ {service.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        function BullPen({ apiUrl }) {
            const [engineers, setEngineers] = useState([]);
            const [loading, setLoading] = useState(false);

            async function loadEngineers() {
                setLoading(true);
                try {
                    const response = await fetch(\`\${apiUrl}/bull-pen/engineers\`, {
                        headers: { 'X-Tenant-ID': 'tenant-001' }
                    });
                    const data = await response.json();
                    setEngineers(data.engineers || []);
                } catch (error) {
                    console.error('Error:', error);
                } finally {
                    setLoading(false);
                }
            }

            return (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Bull Pen Dashboard</h1>
                        <button
                            onClick={loadEngineers}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg font-medium transition"
                        >
                            {loading ? 'Loading...' : 'Load Engineers'}
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <h3 className="text-lg font-semibold mb-2 text-green-400">Available</h3>
                            <p className="text-3xl font-bold">12</p>
                            <p className="text-sm text-gray-400 mt-1">Ready for deployment</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <h3 className="text-lg font-semibold mb-2 text-blue-400">Deployed</h3>
                            <p className="text-3xl font-bold">36</p>
                            <p className="text-sm text-gray-400 mt-1">Currently working</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <h3 className="text-lg font-semibold mb-2 text-purple-400">Utilization</h3>
                            <p className="text-3xl font-bold">87%</p>
                            <p className="text-sm text-gray-400 mt-1">Efficiency rate</p>
                        </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold mb-4">Engineer Allocation</h3>
                        <div className="space-y-3">
                            {engineers.length > 0 ? engineers.map((engineer, index) => (
                                <div key={index} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold">{engineer.name || \`Engineer \${index + 1}\`}</h4>
                                        <p className="text-gray-400 text-sm">{engineer.role || 'Software Engineer'}</p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs bg-green-900 text-green-300">
                                        {engineer.status || 'Available'}
                                    </span>
                                </div>
                            )) : (
                                <div className="text-center py-8">
                                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-400">No engineers loaded</p>
                                    <p className="text-sm text-gray-500">Click "Load Engineers" to fetch from backend</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        function Engineers({ apiUrl }) {
            return (
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Engineers Management</h1>
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <p className="text-gray-300">Comprehensive engineer management with profiles, skills, and assignments.</p>
                    </div>
                </div>
            );
        }

        function Analytics({ apiUrl }) {
            const chartData = [
                { name: 'Jan', revenue: 4000, projects: 24 },
                { name: 'Feb', revenue: 3000, projects: 13 },
                { name: 'Mar', revenue: 2000, projects: 18 },
                { name: 'Apr', revenue: 2780, projects: 39 },
                { name: 'May', revenue: 1890, projects: 48 },
                { name: 'Jun', revenue: 2390, projects: 38 }
            ];

            return (
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="name" stroke="#9CA3AF" />
                                        <YAxis stroke="#9CA3AF" />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#1F2937', 
                                                border: '1px solid #374151',
                                                borderRadius: '8px'
                                            }} 
                                        />
                                        <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold mb-4">Project Activity</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="name" stroke="#9CA3AF" />
                                        <YAxis stroke="#9CA3AF" />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#1F2937', 
                                                border: '1px solid #374151',
                                                borderRadius: '8px'
                                            }} 
                                        />
                                        <Area type="monotone" dataKey="projects" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        function TimeTracking({ apiUrl }) {
            return (
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Time Tracking</h1>
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <p className="text-gray-300">Advanced time tracking with biometric verification and real-time monitoring.</p>
                    </div>
                </div>
            );
        }

        function Operations({ apiUrl }) {
            return (
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Operations Pipeline</h1>
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <p className="text-gray-300">Complete operations workflow: Recruiting → Vetting → Deployment.</p>
                    </div>
                </div>
            );
        }

        function Recruits({ apiUrl }) {
            return (
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Recruits Management</h1>
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <p className="text-gray-300">Recruitment pipeline with candidate tracking and assessment.</p>
                    </div>
                </div>
            );
        }

        function Projects({ apiUrl }) {
            return (
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Projects</h1>
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <p className="text-gray-300">Project management with engineer assignments and progress tracking.</p>
                    </div>
                </div>
            );
        }

        function Onboarding({ apiUrl }) {
            return (
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Onboarding</h1>
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <p className="text-gray-300">Streamlined employee onboarding with document management and progress tracking.</p>
                    </div>
                </div>
            );
        }

        function Settings({ apiUrl }) {
            return (
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <p className="text-gray-300">System configuration, user preferences, and integration settings.</p>
                    </div>
                </div>
            );
        }

        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>`;
}

// AI Handler
async function handleAI(request, env) {
  const url = new URL(request.url);
  
  if (url.pathname === '/ai/chat') {
    const { message } = await request.json();
    
    const response = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [
        { role: 'system', content: 'You are a helpful assistant for Humber Operations.' },
        { role: 'user', content: message }
      ]
    });
    
    return Response.json({ response: response.response });
  }
  
  return new Response('AI endpoint not found', { status: 404 });
}

// Export Durable Objects
export { ChatSession, RealtimeConnection };
