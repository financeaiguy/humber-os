'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { NervousSystemDashboard } from '@/components/nervous-system/system-dashboard'
import { useAnalyticsNervousSystem } from '@/hooks/use-nervous-system'
import { Brain, Activity, TrendingUp, Zap } from 'lucide-react'

// Lazy load the dashboard for better performance
const OptimizedKPIDashboard = dynamic(
  () => import('@/components/analytics/OptimizedKPIDashboard'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full space-y-6 p-4">
        <div className="animate-pulse bg-slate-700 rounded-xl h-[200px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-700 rounded-xl h-[120px]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-700 rounded-xl h-[350px]" />
          ))}
        </div>
      </div>
    )
  }
)

export default function AnalyticsPage() {
  const { isReady, hasInsights, trackAction } = useAnalyticsNervousSystem()

  return (
    <div className="min-h-screen bg-slate-950 p-8 space-y-8">
      {/* Page Header with Nervous System Integration */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics & Intelligence</h1>
            <p className="text-blue-100 mt-2">
              AI-powered insights and business intelligence powered by Humber Nervous System
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6" />
              <span className="font-medium">
                {isReady ? 'AI Connected' : 'Connecting...'}
              </span>
            </div>
            {hasInsights && (
              <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-1">
                <Zap className="w-4 h-4" />
                <span className="text-sm">Smart Insights Available</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nervous System Dashboard */}
      <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Activity className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Nervous System Status</h2>
            <p className="text-sm text-slate-400">Real-time AI intelligence and learning capabilities</p>
          </div>
        </div>
        <NervousSystemDashboard />
      </div>

      {/* Business Analytics */}
      <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="w-6 h-6 text-green-400" />
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Business Intelligence</h2>
            <p className="text-sm text-slate-400">Comprehensive KPIs and performance metrics</p>
          </div>
        </div>
        
        <Suspense fallback={
          <div className="w-full space-y-6">
            <div className="animate-pulse bg-slate-700 rounded-xl h-[200px]" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-700 rounded-xl h-[120px]" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-700 rounded-xl h-[350px]" />
              ))}
            </div>
          </div>
        }>
          <OptimizedKPIDashboard />
        </Suspense>
      </div>
    </div>
  )
}