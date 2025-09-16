'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { ResponsiveContainer } from 'recharts';
export function ChartWrapper({ children, width = "100%", height = 300, className = "" }) {
    return (_jsx("div", { className: `relative overflow-visible ${className}`, style: {
            zIndex: 1,
            position: 'relative'
        }, children: _jsx(ResponsiveContainer, { width: width, height: height, style: {
                position: 'relative',
                zIndex: 1
            }, children: children }) }));
}
export const ENHANCED_TOOLTIP_PROPS = {
    contentStyle: {
        backgroundColor: '#1e293b !important',
        background: '#1e293b !important',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#F9FAFB',
        zIndex: 9999,
        position: 'relative',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: '10px'
    },
    itemStyle: {
        color: '#F9FAFB'
    },
    labelStyle: {
        color: '#F9FAFB',
        fontWeight: 600
    },
    wrapperStyle: {
        zIndex: 9999,
        position: 'relative',
        outline: 'none'
    },
    cursor: {
        stroke: '#334155',
        strokeWidth: 1,
        strokeDasharray: '3 3'
    },
    allowEscapeViewBox: { x: false, y: false },
    animationDuration: 0
};
export const ENHANCED_LEGEND_PROPS = {
    wrapperStyle: {
        color: '#E2E8F0',
        fontSize: '14px',
        paddingTop: '16px'
    }
};
export const AXIS_STYLE = {
    stroke: '#E2E8F0',
    fontSize: 12,
    fill: '#E2E8F0'
};
export const GRID_STYLE = {
    stroke: '#64748B',
    strokeDasharray: '3 3'
};
//# sourceMappingURL=chart-wrapper.js.map