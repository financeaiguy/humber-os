import React from 'react'
import { renderToString } from 'react-dom/server'
import HomePage from './app/page'
import BullPenPage from './app/bull-pen/page'
import TimePage from './app/time/page'
import AnalyticsPage from './app/analytics/page'
import RecruitsPage from './app/recruits/page'
import ProjectsPage from './app/projects/page'
import OnboardingPage from './app/onboarding/page'
import SettingsPage from './app/settings/page'
import { SessionProvider } from './components/session-context'

// Mock session for server rendering
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
}

interface WorkersAppProps {
  pathname: string
}

function WorkersApp({ pathname }: WorkersAppProps) {
  let PageComponent = HomePage
  
  switch (pathname) {
    case '/bull-pen':
      PageComponent = BullPenPage
      break
    case '/time':
      PageComponent = TimePage
      break
    case '/analytics':
      PageComponent = AnalyticsPage
      break
    case '/recruits':
      PageComponent = RecruitsPage
      break
    case '/projects':
      PageComponent = ProjectsPage
      break
    case '/onboarding':
      PageComponent = OnboardingPage
      break
    case '/settings':
      PageComponent = SettingsPage
      break
    default:
      PageComponent = HomePage
  }

  return (
    <SessionProvider session={mockSession}>
      <div className="min-h-screen bg-slate-900">
        <nav className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-white font-bold text-xl">Humber Operations</h1>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    <a href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Dashboard
                    </a>
                    <a href="/bull-pen" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Bull Pen
                    </a>
                    <a href="/time" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Time Tracking
                    </a>
                    <a href="/analytics" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Analytics
                    </a>
                    <a href="/recruits" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Recruits
                    </a>
                    <a href="/projects" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Projects
                    </a>
                    <a href="/onboarding" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Onboarding
                    </a>
                    <a href="/settings" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Settings
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <PageComponent />
          </div>
        </main>
      </div>
    </SessionProvider>
  )
}

export function renderApp(pathname: string): string {
  const appHTML = renderToString(<WorkersApp pathname={pathname} />)
  
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
</html>`
}
