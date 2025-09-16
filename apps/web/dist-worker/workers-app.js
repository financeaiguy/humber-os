import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { renderToString } from 'react-dom/server';
import HomePage from './app/page';
import BullPenPage from './app/bull-pen/page';
import TimePage from './app/time/page';
import AnalyticsPage from './app/analytics/page';
import RecruitsPage from './app/recruits/page';
import ProjectsPage from './app/projects/page';
import OnboardingPage from './app/onboarding/page';
import SettingsPage from './app/settings/page';
import { SessionProvider } from './components/session-context';
const mockSession = {
    user: {
        id: '1',
        name: 'Demo User',
        email: 'demo@humber.com',
        role: 'partner_admin',
        partnerId: 'partner-001',
        partnerName: 'Demo Partner'
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};
function WorkersApp({ pathname }) {
    let PageComponent = HomePage;
    switch (pathname) {
        case '/bull-pen':
            PageComponent = BullPenPage;
            break;
        case '/time':
            PageComponent = TimePage;
            break;
        case '/analytics':
            PageComponent = AnalyticsPage;
            break;
        case '/recruits':
            PageComponent = RecruitsPage;
            break;
        case '/projects':
            PageComponent = ProjectsPage;
            break;
        case '/onboarding':
            PageComponent = OnboardingPage;
            break;
        case '/settings':
            PageComponent = SettingsPage;
            break;
        default:
            PageComponent = HomePage;
    }
    return (_jsx(SessionProvider, { session: mockSession, children: _jsxs("div", { className: "min-h-screen bg-slate-900", children: [_jsx("nav", { className: "bg-slate-800 border-b border-slate-700", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsx("div", { className: "flex items-center justify-between h-16", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("h1", { className: "text-white font-bold text-xl", children: "Humber Operations" }) }), _jsx("div", { className: "hidden md:block", children: _jsxs("div", { className: "ml-10 flex items-baseline space-x-4", children: [_jsx("a", { href: "/", className: "text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium", children: "Dashboard" }), _jsx("a", { href: "/bull-pen", className: "text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium", children: "Bull Pen" }), _jsx("a", { href: "/time", className: "text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium", children: "Time Tracking" }), _jsx("a", { href: "/analytics", className: "text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium", children: "Analytics" }), _jsx("a", { href: "/recruits", className: "text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium", children: "Recruits" }), _jsx("a", { href: "/projects", className: "text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium", children: "Projects" }), _jsx("a", { href: "/onboarding", className: "text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium", children: "Onboarding" }), _jsx("a", { href: "/settings", className: "text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium", children: "Settings" })] }) })] }) }) }) }), _jsx("main", { className: "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8", children: _jsx("div", { className: "px-4 py-6 sm:px-0", children: _jsx(PageComponent, {}) }) })] }) }));
}
export function renderApp(pathname) {
    const appHTML = renderToString(_jsx(WorkersApp, { pathname: pathname }));
    return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Humber Operations - Engineering Excellence</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@19.0.0/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@19.0.0/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/framer-motion@12.23.12/dist/framer-motion.js"></script>
    <script src="https://unpkg.com/recharts@3.2.0/lib/index.js"></script>
    <script src="https://unpkg.com/lucide-react@0.544.0/dist/esm/icons.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        .animate-shimmer { animation: shimmer 2s infinite; }
        @keyframes shimmer { 
            0% { transform: translateX(-100%) skewX(-12deg); }
            100% { transform: translateX(200%) skewX(-12deg); }
        }
    </style>
</head>
<body class="bg-slate-900 text-white">
    <div id="root">${appHTML}</div>
    <script>
        // Hydrate the React app
        const { hydrateRoot } = ReactDOM;
        const { motion } = FramerMotion;
        
        // Global API configuration
        window.HUMBER_CONFIG = {
            apiUrl: '${process.env.NEXT_PUBLIC_API_URL || 'https://humber-operations-worker-prod.evafiai.workers.dev'}',
            tenantId: '${process.env.NEXT_PUBLIC_TENANT_ID || 'tenant-001'}'
        };
        
        // Initialize the app when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initApp);
        } else {
            initApp();
        }
        
        function initApp() {
            // Add interactive behaviors here
            console.log('Humber Operations App Initialized');
            
            // Add click handlers for navigation
            document.querySelectorAll('nav a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const href = e.target.getAttribute('href');
                    if (href) {
                        window.location.href = href;
                    }
                });
            });
        }
    </script>
</body>
</html>`;
}
//# sourceMappingURL=workers-app.js.map