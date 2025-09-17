'use client'

export const runtime = 'edge'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

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
  return (
    <Suspense fallback={
      <div className="w-full space-y-6 p-4">
        <div className="animate-pulse bg-slate-700 rounded-xl h-[200px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-700 rounded-xl h-[120px]" />
          ))}
        </div>
      </div>
    }>
      <OptimizedKPIDashboard />
    </Suspense>
  )
}