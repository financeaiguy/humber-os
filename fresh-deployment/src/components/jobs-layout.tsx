'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from '@/components/session-context'
import Link from 'next/link'
import { 
  Home, 
  Briefcase, 
  Users, 
  BarChart3, 
  Settings,
  Menu,
  X
} from 'lucide-react'

// Jobs' Rule: Never more than 5-7 primary navigation items
const coreNavigation = [
  { name: 'Overview', href: '/', icon: Home },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'Team', href: '/recruits', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface JobsLayoutProps {
  children: React.ReactNode
}

export function JobsLayout({ children }: JobsLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Don't show navigation on auth pages
  if (pathname.startsWith('/auth')) {
    return (
      <div className="jobs-layout min-h-screen bg-slate-950">
        {children}
      </div>
    )
  }

  return (
    <div className="jobs-layout bg-slate-950">
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-slate-800 border border-slate-600 rounded-lg shadow-md text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        jobs-sidebar fixed inset-y-0 left-0 z-40 
        transform transition-transform duration-300 ease-out
        md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="mb-8">
          <h1 className="text-display text-2xl font-bold text-black">
            Humber
          </h1>
          <p className="text-caption text-gray-500 mt-1">
            Engineering Operations
          </p>
        </div>

        {/* Navigation */}
        <nav className="jobs-nav">
          {coreNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`jobs-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={18} />
                <span className="text-body">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Section - Minimal */}
        {session?.user && (
          <div className="mt-auto pt-8 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {session.user.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body text-sm font-medium text-black truncate">
                  {session.user.name}
                </p>
                <p className="text-caption text-xs text-gray-500 truncate">
                  {session.user.partnerName}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="jobs-main md:ml-60">
        <div className="jobs-fade-in">
          {children}
        </div>
      </main>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

// Jobs-inspired Dashboard Components
export function JobsStatCard({ 
  title, 
  value, 
  subtitle, 
  trend 
}: { 
  title: string
  value: string
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="jobs-card">
      <div className="space-y-2">
        <p className="text-caption text-gray-500">{title}</p>
        <p className="text-display text-3xl font-bold text-black">{value}</p>
        {subtitle && (
          <p className={`text-body text-sm ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-500'
          }`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

export function JobsSection({ 
  title, 
  subtitle, 
  action,
  children 
}: { 
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading text-2xl font-semibold text-black">
            {title}
          </h2>
          {subtitle && (
            <p className="text-body text-gray-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function JobsTable({ 
  headers, 
  children 
}: { 
  headers: string[]
  children: React.ReactNode
}) {
  return (
    <div className="jobs-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {headers.map((header, index) => (
                <th 
                  key={index}
                  className="text-caption text-left py-3 px-0 text-gray-500 font-medium"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function JobsButton({ 
  children, 
  variant = 'primary',
  size = 'medium',
  ...props 
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'small' | 'medium' | 'large'
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClass = variant === 'primary' ? 'jobs-button' : 'jobs-button-secondary'
  const sizeClass = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg'
  }[size]
  
  return (
    <button 
      className={`${baseClass} ${sizeClass} jobs-focus`}
      {...props}
    >
      {children}
    </button>
  )
}