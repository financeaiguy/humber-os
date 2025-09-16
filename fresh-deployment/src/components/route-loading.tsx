'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { SkeletonCard, SkeletonTable, SkeletonChart } from './global-loading'

interface LoadingContextType {
  isRouteLoading: boolean
  setRouteLoading: (loading: boolean) => void
  routeLoadingMessage: string
  setRouteLoadingMessage: (message: string) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function useRouteLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useRouteLoading must be used within a LoadingProvider')
  }
  return context
}

interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isRouteLoading, setIsRouteLoading] = useState(false)
  const [routeLoadingMessage, setRouteLoadingMessage] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  const setRouteLoading = (loading: boolean) => {
    setIsRouteLoading(loading)
    if (!loading) {
      setRouteLoadingMessage('')
    }
  }

  useEffect(() => {
    // Auto-complete loading on route change
    setRouteLoading(false)
  }, [pathname])

  return (
    <LoadingContext.Provider 
      value={{ 
        isRouteLoading, 
        setRouteLoading, 
        routeLoadingMessage, 
        setRouteLoadingMessage 
      }}
    >
      {children}
    </LoadingContext.Provider>
  )
}

// Route-specific skeleton components
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="animate-pulse">
        <div className="h-8 bg-slate-700 rounded w-1/3 mb-4" />
        <div className="h-4 bg-slate-700 rounded w-2/3" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
            <div className="h-8 bg-slate-700 rounded w-1/2" />
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SkeletonChart />
        <SkeletonChart />
      </div>
      
      <SkeletonTable rows={6} />
    </div>
  )
}

export function ProjectsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-pulse">
        <div>
          <div className="h-8 bg-slate-700 rounded w-64 mb-2" />
          <div className="h-4 bg-slate-700 rounded w-80" />
        </div>
        <div className="h-10 bg-slate-700 rounded w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
            <div className="h-6 bg-slate-700 rounded w-1/2" />
          </div>
        ))}
      </div>
      
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="animate-pulse">
        <div className="h-8 bg-slate-700 rounded w-1/4 mb-4" />
        <div className="h-4 bg-slate-700 rounded w-1/2" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <SkeletonChart />
        <SkeletonChart />
        <SkeletonChart />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SkeletonChart />
        <SkeletonTable rows={8} />
      </div>
    </div>
  )
}

export function OnboardingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-pulse">
        <div>
          <div className="h-8 bg-slate-700 rounded w-56 mb-2" />
          <div className="h-4 bg-slate-700 rounded w-96" />
        </div>
        <div className="h-10 bg-slate-700 rounded w-48" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
            <div className="h-6 bg-slate-700 rounded w-1/2" />
          </div>
        ))}
      </div>
      
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-12 w-12 bg-slate-700 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-700 rounded w-1/2" />
              </div>
            </div>
            <div className="h-2 bg-slate-700 rounded mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-slate-700/50 rounded" />
              <div className="h-16 bg-slate-700/50 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Route-specific skeleton mapper
export function getRouteSkeleton(pathname: string) {
  switch (pathname) {
    case '/':
      return <DashboardSkeleton />
    case '/projects':
      return <ProjectsSkeleton />
    case '/analytics':
      return <AnalyticsSkeleton />
    case '/onboarding':
      return <OnboardingSkeleton />
    default:
      return (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )
  }
}

interface RouteSkeletonProps {
  pathname: string
  show: boolean
}

export function RouteSkeleton({ pathname, show }: RouteSkeletonProps) {
  return (
    <AnimatePresence>
      {show && (
        <div className="min-h-screen">
          {getRouteSkeleton(pathname)}
        </div>
      )}
    </AnimatePresence>
  )
}