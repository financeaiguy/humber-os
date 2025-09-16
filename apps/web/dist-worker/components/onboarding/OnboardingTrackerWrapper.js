'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
const OnboardingTrackerClient = dynamic(() => import('./OnboardingTrackerClient').then(mod => ({ default: mod.OnboardingTrackerClient })), {
    ssr: false,
    loading: () => (_jsx("div", { className: "relative", children: _jsxs("div", { className: "w-full px-4 py-3 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 flex items-center justify-center", children: [_jsx(Loader2, { className: "w-5 h-5 text-blue-400 animate-spin mr-2" }), _jsx("span", { className: "text-white", children: "Loading onboarding pipeline..." })] }) }))
});
export function OnboardingTracker() {
    return _jsx(OnboardingTrackerClient, {});
}
//# sourceMappingURL=OnboardingTrackerWrapper.js.map