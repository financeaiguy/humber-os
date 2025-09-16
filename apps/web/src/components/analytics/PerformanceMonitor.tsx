'use client';

import { useEffect, useState } from 'react';

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<{
    loadTime: number;
    renderTime: number;
    domContentLoaded: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const navigation = entries.find((entry) => entry.entryType === 'navigation') as PerformanceNavigationTiming;
        
        if (navigation) {
          setMetrics({
            loadTime: Math.round(navigation.loadEventEnd - navigation.navigationStart),
            renderTime: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
            domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart)
          });
        }
      });

      observer.observe({ entryTypes: ['navigation'] });

      return () => observer.disconnect();
    }
  }, []);

  if (!metrics || process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900/90 backdrop-blur text-xs text-white p-2 rounded border border-slate-700 z-50">
      <div>Load: {metrics.loadTime}ms</div>
      <div>Render: {metrics.renderTime}ms</div>
      <div>DOMContentLoaded: {metrics.domContentLoaded}ms</div>
    </div>
  );
}