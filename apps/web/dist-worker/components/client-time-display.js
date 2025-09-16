'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
export function ClientTimeDisplay({ className, dateClassName }) {
    const [currentTime, setCurrentTime] = useState(null);
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        setCurrentTime(new Date());
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    if (!mounted || !currentTime) {
        return (_jsxs("div", { children: [_jsx("p", { className: className, children: "--:--:-- --" }), _jsx("p", { className: dateClassName, children: "Loading..." })] }));
    }
    return (_jsxs("div", { children: [_jsx("p", { className: className, children: currentTime.toLocaleTimeString() }), _jsx("p", { className: dateClassName, children: currentTime.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) })] }));
}
//# sourceMappingURL=client-time-display.js.map