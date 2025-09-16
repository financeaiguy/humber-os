'use client'

import { useEffect, useState } from 'react'
import { 
  detectPlatform, 
  isMobile, 
  isIOS, 
  isAndroid, 
  isSafari, 
  isChrome,
  supportsBackdropFilter,
  getViewportHeight 
} from '@/lib/platform'

export function PlatformTest() {
  const [platformInfo, setPlatformInfo] = useState({
    platform: 'unknown',
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
    supportsBackdropFilter: false,
    viewportHeight: '100vh',
    userAgent: '',
    screenSize: { width: 0, height: 0 },
    viewport: { width: 0, height: 0 }
  })

  useEffect(() => {
    const updateInfo = () => {
      setPlatformInfo({
        platform: detectPlatform(),
        isMobile: isMobile(),
        isIOS: isIOS(),
        isAndroid: isAndroid(),
        isSafari: isSafari(),
        isChrome: isChrome(),
        supportsBackdropFilter: supportsBackdropFilter(),
        viewportHeight: getViewportHeight(),
        userAgent: window.navigator.userAgent,
        screenSize: {
          width: window.screen.width,
          height: window.screen.height
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      })
    }

    updateInfo()
    window.addEventListener('resize', updateInfo)
    window.addEventListener('orientationchange', updateInfo)
    
    return () => {
      window.removeEventListener('resize', updateInfo)
      window.removeEventListener('orientationchange', updateInfo)
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 bg-slate-900/95 backdrop-blur-lg border border-slate-700 rounded-lg p-4 text-xs text-white z-50 max-w-xs">
      <h3 className="font-bold mb-2 text-green-400">Platform Info</h3>
      
      <div className="space-y-1">
        <div><strong>Platform:</strong> {platformInfo.platform}</div>
        <div><strong>Mobile:</strong> {platformInfo.isMobile ? '✅' : '❌'}</div>
        <div><strong>iOS:</strong> {platformInfo.isIOS ? '✅' : '❌'}</div>
        <div><strong>Android:</strong> {platformInfo.isAndroid ? '✅' : '❌'}</div>
        <div><strong>Safari:</strong> {platformInfo.isSafari ? '✅' : '❌'}</div>
        <div><strong>Chrome:</strong> {platformInfo.isChrome ? '✅' : '❌'}</div>
        <div><strong>Backdrop Filter:</strong> {platformInfo.supportsBackdropFilter ? '✅' : '❌'}</div>
        
        <div className="mt-2 pt-2 border-t border-slate-600">
          <div><strong>Screen:</strong> {platformInfo.screenSize.width}×{platformInfo.screenSize.height}</div>
          <div><strong>Viewport:</strong> {platformInfo.viewport.width}×{platformInfo.viewport.height}</div>
          <div><strong>VH:</strong> {platformInfo.viewportHeight}</div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-slate-600">
          <div><strong>User Agent:</strong></div>
          <div className="text-xs break-all opacity-70">{platformInfo.userAgent}</div>
        </div>
      </div>
    </div>
  )
}