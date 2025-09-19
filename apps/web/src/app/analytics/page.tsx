'use client'

import { Suspense, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { NervousSystemDashboard } from '@/components/nervous-system/system-dashboard'
import { useAnalyticsNervousSystem } from '@/hooks/use-nervous-system'
import { useWalkthrough } from '@/lib/walkthrough-manager'
import { SimpleTooltip } from '@/components/walkthrough/SimpleTooltip'
import { Brain, Activity, TrendingUp, Zap, HelpCircle } from 'lucide-react'

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
  const pathname = usePathname()
  const {
    getSimplePageGuide,
    isFirstTimeVisit,
    markPageAsVisited,
    resetPageVisits
  } = useWalkthrough()

  const [currentTooltipStep, setCurrentTooltipStep] = useState(0)
  const [showTooltips, setShowTooltips] = useState(false)
  const [pageGuide, setPageGuide] = useState<any>(null)

  useEffect(() => {
    const guide = getSimplePageGuide(pathname)
    setPageGuide(guide)

    if (guide && isFirstTimeVisit('analytics')) {
      setShowTooltips(true)
    }
  }, [pathname, getSimplePageGuide, isFirstTimeVisit])

  const handleTooltipNext = () => {
    if (pageGuide && currentTooltipStep < pageGuide.steps.length - 1) {
      setCurrentTooltipStep(currentTooltipStep + 1)
    } else {
      handleTooltipComplete()
    }
  }

  const handleTooltipPrevious = () => {
    if (currentTooltipStep > 0) {
      setCurrentTooltipStep(currentTooltipStep - 1)
    }
  }

  const handleTooltipComplete = () => {
    setShowTooltips(false)
    markPageAsVisited('analytics')
  }

  const handleResetTutorial = () => {
    resetPageVisits()
    setCurrentTooltipStep(0)
    setShowTooltips(true)
  }

  const currentStep = pageGuide?.steps[currentTooltipStep]

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
            <button
              onClick={handleResetTutorial}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1 transition-colors"
              title="Show Tutorial Again"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm">Tutorial</span>
            </button>
          </div>
        </div>
      </div>

      {/* Nervous System Dashboard */}
      <div data-tour="nervous-system" className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6 relative">
        <div className="flex items-center space-x-3 mb-6">
          <Activity className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Nervous System Status</h2>
            <p className="text-sm text-slate-400">Real-time AI intelligence and learning capabilities</p>
          </div>
        </div>
        <div data-tour="ai-models">
          <NervousSystemDashboard />
        </div>

        {/* Tooltip for nervous system */}
        {showTooltips && currentStep?.selector === '[data-tour="nervous-system"]' && (
          <SimpleTooltip
            title={currentStep.title}
            description={currentStep.description}
            position="bottom"
            isVisible={true}
            onClose={handleTooltipComplete}
            onNext={handleTooltipNext}
            onPrevious={currentTooltipStep > 0 ? handleTooltipPrevious : undefined}
            currentStep={currentTooltipStep + 1}
            totalSteps={pageGuide?.steps.length || 1}
            showResetButton={true}
            onReset={handleResetTutorial}
          />
        )}
      </div>

      {/* Business Analytics */}
      <div data-tour="performance-metrics" className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-6 relative">
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

        {/* Tooltip for AI models */}
        {showTooltips && currentStep?.selector === '[data-tour="ai-models"]' && (
          <SimpleTooltip
            title={currentStep.title}
            description={currentStep.description}
            position="top"
            isVisible={true}
            onClose={handleTooltipComplete}
            onNext={handleTooltipNext}
            onPrevious={currentTooltipStep > 0 ? handleTooltipPrevious : undefined}
            currentStep={currentTooltipStep + 1}
            totalSteps={pageGuide?.steps.length || 1}
          />
        )}

        {/* Tooltip for performance metrics */}
        {showTooltips && currentStep?.selector === '[data-tour="performance-metrics"]' && (
          <SimpleTooltip
            title={currentStep.title}
            description={currentStep.description}
            position="top"
            isVisible={true}
            onClose={handleTooltipComplete}
            onNext={handleTooltipNext}
            onPrevious={currentTooltipStep > 0 ? handleTooltipPrevious : undefined}
            currentStep={currentTooltipStep + 1}
            totalSteps={pageGuide?.steps.length || 1}
          />
        )}
      </div>
    </div>
  )
}