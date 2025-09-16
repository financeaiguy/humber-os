'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { detectPlatform, isMobile, isIOS, isAndroid, isSafari, isChrome, supportsBackdropFilter, getViewportHeight } from '@/lib/platform';
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
    });
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
            });
        };
        updateInfo();
        window.addEventListener('resize', updateInfo);
        window.addEventListener('orientationchange', updateInfo);
        return () => {
            window.removeEventListener('resize', updateInfo);
            window.removeEventListener('orientationchange', updateInfo);
        };
    }, []);
    return (_jsxs("div", { className: "fixed top-4 right-4 bg-slate-900/95 backdrop-blur-lg border border-slate-700 rounded-lg p-4 text-xs text-white z-50 max-w-xs", children: [_jsx("h3", { className: "font-bold mb-2 text-green-400", children: "Platform Info" }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { children: [_jsx("strong", { children: "Platform:" }), " ", platformInfo.platform] }), _jsxs("div", { children: [_jsx("strong", { children: "Mobile:" }), " ", platformInfo.isMobile ? '✅' : '❌'] }), _jsxs("div", { children: [_jsx("strong", { children: "iOS:" }), " ", platformInfo.isIOS ? '✅' : '❌'] }), _jsxs("div", { children: [_jsx("strong", { children: "Android:" }), " ", platformInfo.isAndroid ? '✅' : '❌'] }), _jsxs("div", { children: [_jsx("strong", { children: "Safari:" }), " ", platformInfo.isSafari ? '✅' : '❌'] }), _jsxs("div", { children: [_jsx("strong", { children: "Chrome:" }), " ", platformInfo.isChrome ? '✅' : '❌'] }), _jsxs("div", { children: [_jsx("strong", { children: "Backdrop Filter:" }), " ", platformInfo.supportsBackdropFilter ? '✅' : '❌'] }), _jsxs("div", { className: "mt-2 pt-2 border-t border-slate-600", children: [_jsxs("div", { children: [_jsx("strong", { children: "Screen:" }), " ", platformInfo.screenSize.width, "\u00D7", platformInfo.screenSize.height] }), _jsxs("div", { children: [_jsx("strong", { children: "Viewport:" }), " ", platformInfo.viewport.width, "\u00D7", platformInfo.viewport.height] }), _jsxs("div", { children: [_jsx("strong", { children: "VH:" }), " ", platformInfo.viewportHeight] })] }), _jsxs("div", { className: "mt-2 pt-2 border-t border-slate-600", children: [_jsx("div", { children: _jsx("strong", { children: "User Agent:" }) }), _jsx("div", { className: "text-xs break-all opacity-70", children: platformInfo.userAgent })] })] })] }));
}
//# sourceMappingURL=platform-test.js.map