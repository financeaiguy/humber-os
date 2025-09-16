'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const OnboardingTrackerClient = dynamic(
  () => import('./OnboardingTrackerClient').then(mod => ({ default: mod.OnboardingTrackerClient })),
  {
    ssr: false,
    loading: () => (
      <div className="relative">
        <div className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin mr-2" />
          <span className="text-white">Loading onboarding pipeline...</span>
        </div>
      </div>
    )
  }
)

export function OnboardingTracker() {
  return <OnboardingTrackerClient />
}