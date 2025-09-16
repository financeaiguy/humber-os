import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { renderToString } from 'react-dom/server';
import { SimpleDashboard, SimpleBullPen, SimpleTimeTracking, SimpleAnalytics, SimpleRecruits, SimpleProjects, SimpleOnboarding, SimpleSettings } from './simplified-components';
function SessionProvider({ children, session }) {
    return _jsx(_Fragment, { children: children });
}
const CSS_STYLES = `
/* Critical CSS will be injected here during build */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: #0f172a; color: white; }
.bg-slate-900 { background-color: #0f172a; }
.bg-slate-800 { background-color: #1e293b; }
.bg-slate-700 { background-color: #334155; }
.text-white { color: #ffffff; }
.text-slate-200 { color: #e2e8f0; }
.text-slate-400 { color: #94a3b8; }
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.rounded-xl { border-radius: 0.75rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.space-y-6 > * + * { margin-top: 1.5rem; }
.border { border-width: 1px; }
.border-slate-700 { border-color: #334155; }
.max-w-7xl { max-width: 80rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.h-16 { height: 4rem; }
.min-h-screen { min-height: 100vh; }
@media (min-width: 640px) {
  .sm\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
  .sm\\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
}
@media (min-width: 1024px) {
  .lg\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
  .lg\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
  .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
`;
const createMockSession = () => ({
    user: {
        id: '1',
        name: 'Demo User',
        email: 'demo@humber.com',
        role: 'partner_admin',
        partnerId: 'partner-001',
        partnerName: 'Demo Partner'
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
});
function getPageComponent(pathname) {
    switch (pathname) {
        case '/bull-pen':
            return SimpleBullPen;
        case '/time':
            return SimpleTimeTracking;
        case '/analytics':
            return SimpleAnalytics;
        case '/recruits':
            return SimpleRecruits;
        case '/projects':
            return SimpleProjects;
        case '/onboarding':
            return SimpleOnboarding;
        case '/settings':
            return SimpleSettings;
        default:
            return SimpleDashboard;
    }
}
function AppShell({ children, pathname }) {
    const navItems = [
        { href: '/', label: 'Dashboard', active: pathname === '/' },
        { href: '/bull-pen', label: 'Bull Pen', active: pathname === '/bull-pen' },
        { href: '/time', label: 'Time Tracking', active: pathname === '/time' },
        { href: '/analytics', label: 'Analytics', active: pathname === '/analytics' },
        { href: '/recruits', label: 'Recruits', active: pathname === '/recruits' },
        { href: '/projects', label: 'Projects', active: pathname === '/projects' },
        { href: '/onboarding', label: 'Onboarding', active: pathname === '/onboarding' },
        { href: '/settings', label: 'Settings', active: pathname === '/settings' }
    ];
    return (_jsxs("div", { className: "min-h-screen bg-slate-900", children: [_jsx("nav", { className: "bg-slate-800 border-b border-slate-700", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsx("div", { className: "flex items-center justify-between h-16", children: _jsxs("div", { className: "flex items-center", children: [_jsx("h1", { className: "text-white font-bold text-xl", children: "Humber Operations" }), _jsx("div", { className: "hidden md:block ml-10", children: _jsx("div", { className: "flex items-baseline space-x-4", children: navItems.map((item) => (_jsx("a", { href: item.href, className: `px-3 py-2 rounded-md text-sm font-medium transition-colors ${item.active
                                                ? 'bg-slate-700 text-white'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-700'}`, children: item.label }, item.href))) }) })] }) }) }) }), _jsx("main", { className: "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8", children: _jsx("div", { className: "px-4 py-6 sm:px-0", children: children }) })] }));
}
function renderApp(pathname, env) {
    const PageComponent = getPageComponent(pathname);
    const mockSession = createMockSession();
    if (typeof globalThis !== 'undefined') {
        ;
        globalThis.cloudflare = { env };
    }
    const appHTML = renderToString(_jsx(SessionProvider, { session: mockSession, children: _jsx(AppShell, { pathname: pathname, children: _jsx(PageComponent, {}) }) }));
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Humber Operations - ${pathname === '/' ? 'Dashboard' : pathname.slice(1).replace('-', ' ')}</title>
    <style>${CSS_STYLES}</style>
    <script>
      window.HUMBER_CONFIG = {
        apiUrl: '${env.NEXT_PUBLIC_API_URL}',
        tenantId: '${env.NEXT_PUBLIC_TENANT_ID}',
        environment: '${env.ENVIRONMENT}'
      };
    </script>
</head>
<body>
    <div id="root">${appHTML}</div>
    <script>
      // Add interactive behaviors
      document.addEventListener('DOMContentLoaded', function() {
        console.log('Humber Operations App Initialized');
        
        // Handle navigation
        document.querySelectorAll('nav a').forEach(link => {
          link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href !== window.location.pathname) {
              window.location.href = href;
            }
          });
        });

        // Add loading states
        document.querySelectorAll('button').forEach(button => {
          button.addEventListener('click', function() {
            if (!this.disabled) {
              this.style.opacity = '0.6';
              setTimeout(() => {
                this.style.opacity = '1';
              }, 1000);
            }
          });
        });
      });
    </script>
</body>
</html>`;
}
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        try {
            if (url.pathname.startsWith('/api/')) {
                const backendUrl = `${env.NEXT_PUBLIC_API_URL}${url.pathname}${url.search}`;
                const response = await fetch(backendUrl, {
                    method: request.method,
                    headers: {
                        ...request.headers,
                        'X-Tenant-ID': env.NEXT_PUBLIC_TENANT_ID,
                        'User-Agent': 'Humber-Frontend-Worker/1.0'
                    },
                    body: request.method !== 'GET' ? request.body : undefined
                });
                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: {
                        'Content-Type': response.headers.get('Content-Type') || 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tenant-ID'
                    }
                });
            }
            if (url.pathname === '/ai/chat') {
                const { message } = await request.json();
                const aiResponse = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant for Humber Operations engineering platform.' },
                        { role: 'user', content: message }
                    ]
                });
                return Response.json({
                    response: aiResponse.response,
                    timestamp: new Date().toISOString(),
                    model: '@cf/meta/llama-2-7b-chat-int8'
                });
            }
            if (url.pathname === '/health') {
                return Response.json({
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    environment: env.ENVIRONMENT,
                    version: env.API_VERSION,
                    bindings: {
                        ai: !!env.AI,
                        kv: !!env.KV_CACHE,
                        d1: !!env.DB_MASTER,
                        vectorize: !!env.VECTORIZE_INDEX,
                        r2: !!env.DOCUMENTS
                    }
                });
            }
            const html = renderApp(url.pathname, env);
            return new Response(html, {
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Cache-Control': 'public, max-age=300, s-maxage=3600',
                    'X-Frame-Options': 'DENY',
                    'X-Content-Type-Options': 'nosniff',
                    'X-XSS-Protection': '1; mode=block',
                    'Referrer-Policy': 'strict-origin-when-cross-origin'
                }
            });
        }
        catch (error) {
            console.error('Worker error:', error);
            const errorHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Humber Operations - Error</title>
            <style>${CSS_STYLES}</style>
        </head>
        <body>
            <div class="min-h-screen flex items-center justify-center bg-slate-900">
                <div class="text-center">
                    <h1 class="text-4xl font-bold mb-4 text-white">Humber Operations</h1>
                    <p class="text-slate-200 mb-8">Engineering Excellence Platform</p>
                    <div class="bg-slate-800 border border-slate-700 rounded-xl p-6">
                        <p class="text-red-400 mb-2">Application Error</p>
                        <p class="text-sm text-slate-400">${error instanceof Error ? error.message : 'Unknown error occurred'}</p>
                        <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `;
            return new Response(errorHtml, {
                status: 500,
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
        }
    }
};
//# sourceMappingURL=worker-entry.js.map