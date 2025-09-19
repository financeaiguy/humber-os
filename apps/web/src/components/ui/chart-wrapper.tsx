'use client'

import React from 'react'
import { ResponsiveContainer } from 'recharts'

interface ChartWrapperProps {
  children: React.ReactNode
  width?: string | number
  height?: string | number
  className?: string
}

export function ChartWrapper({
  children,
  width = "100%",
  height = 300,
  className = ""
}: ChartWrapperProps) {
  return (
    <div
      className={`relative overflow-visible ${className}`}
      style={{
        zIndex: 1,
        position: 'relative',
        backgroundColor: 'transparent'
      }}
    >
      <ResponsiveContainer
        width={width}
        height={height}
        style={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'transparent'
        }}
      >
        <div style={{ backgroundColor: 'transparent', width: '100%', height: '100%' }}>
          {children}
        </div>
      </ResponsiveContainer>
    </div>
  )
}

// Enhanced Tooltip props for consistent styling
export const ENHANCED_TOOLTIP_PROPS = {
  contentStyle: {
    backgroundColor: '#020617 !important',
    background: '#020617 !important',
    border: '2px solid #3B82F6',
    borderRadius: '8px',
    color: '#F9FAFB',
    zIndex: 9999,
    position: 'relative' as const,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    padding: '12px 16px'
  },
  itemStyle: {
    color: '#F9FAFB',
    fontWeight: 500
  },
  labelStyle: {
    color: '#94A3B8',
    fontWeight: 600,
    marginBottom: '4px'
  },
  wrapperStyle: {
    zIndex: 9999,
    position: 'relative' as const,
    outline: 'none'
  },
  cursor: {
    stroke: '#3B82F6',
    strokeWidth: 2,
    strokeDasharray: '3 3'
  },
  allowEscapeViewBox: { x: false, y: false },
  animationDuration: 0
}

// Enhanced Legend props for consistent styling
export const ENHANCED_LEGEND_PROPS = {
  wrapperStyle: { 
    color: '#E2E8F0', // Much brighter slate-200
    fontSize: '14px',
    paddingTop: '16px'
  }
}

// Chart axis style overrides
export const AXIS_STYLE = {
  stroke: '#E2E8F0', // Bright slate-200 for visibility
  fontSize: 12,
  fill: '#E2E8F0'
}

// Grid style overrides  
export const GRID_STYLE = {
  stroke: '#64748B', // slate-500 for better visibility
  strokeDasharray: '3 3'
}
