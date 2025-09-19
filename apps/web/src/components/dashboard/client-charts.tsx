'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart
} from 'recharts'

// Data
const revenueData = [
  { month: 'Jan', revenue: 850000, projects: 12, utilization: 78 },
  { month: 'Feb', revenue: 920000, projects: 14, utilization: 82 },
  { month: 'Mar', revenue: 1150000, projects: 16, utilization: 85 },
  { month: 'Apr', revenue: 980000, projects: 13, utilization: 79 },
  { month: 'May', revenue: 1200000, projects: 18, utilization: 88 },
  { month: 'Jun', revenue: 1350000, projects: 20, utilization: 92 }
]

const utilizationData = [
  { day: 'Mon', electrical: 85, mechanical: 78, software: 92, systems: 88 },
  { day: 'Tue', electrical: 88, mechanical: 82, software: 89, systems: 85 },
  { day: 'Wed', electrical: 92, mechanical: 85, software: 94, systems: 90 },
  { day: 'Thu', electrical: 87, mechanical: 80, software: 91, systems: 87 },
  { day: 'Fri', electrical: 83, mechanical: 77, software: 88, systems: 84 },
  { day: 'Sat', electrical: 45, mechanical: 40, software: 52, systems: 48 },
  { day: 'Sun', electrical: 25, mechanical: 22, software: 30, systems: 28 }
]

const clientDistribution = [
  { name: 'General Motors', value: 35, color: '#3B82F6' },
  { name: 'Ford', value: 28, color: '#10B981' },
  { name: 'Stellantis', value: 22, color: '#F59E0B' },
  { name: 'HIROTEC', value: 15, color: '#EF4444' }
]

const projectStatusData = [
  { status: 'Planning', count: 3, color: '#F59E0B' },
  { status: 'In Progress', count: 12, color: '#3B82F6' },
  { status: 'Testing', count: 5, color: '#8B5CF6' },
  { status: 'Deployed', count: 8, color: '#10B981' },
  { status: 'On Hold', count: 2, color: '#EF4444' }
]

const ENHANCED_TOOLTIP_PROPS = {
  contentStyle: {
    backgroundColor: '#0F172A',
    border: '2px solid #3B82F6',
    borderRadius: '8px',
    color: '#F9FAFB',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.9)',
    padding: '10px 14px'
  },
  labelStyle: {
    color: '#94A3B8',
    fontWeight: 600,
    marginBottom: '4px'
  }
}

const ENHANCED_LEGEND_PROPS = {
  wrapperStyle: {
    color: '#E2E8F0',
    fontSize: '14px',
    paddingTop: '16px'
  }
}

const AXIS_STYLE = {
  stroke: '#E2E8F0',
  fontSize: 12,
  fill: '#E2E8F0'
}

const GRID_STYLE = {
  stroke: '#64748B',
  strokeDasharray: '3 3'
}

export function RevenueChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-[300px] bg-transparent">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={revenueData} style={{ backgroundColor: 'transparent' }}>
          <CartesianGrid {...GRID_STYLE} />
          <XAxis dataKey="month" {...AXIS_STYLE} />
          <YAxis yAxisId="left" {...AXIS_STYLE} />
          <YAxis yAxisId="right" orientation="right" {...AXIS_STYLE} />
          <Tooltip
            {...ENHANCED_TOOLTIP_PROPS}
            formatter={(value: any, name: any) => [
              name === 'revenue' ? `$${(Number(value) / 1000).toFixed(0)}K` : value,
              name === 'revenue' ? 'Revenue' : 'Projects'
            ]}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="#3B82F6"
            fill="url(#revenueGradient)"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="projects"
            stroke="#10B981"
            strokeWidth={3}
          />
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export function UtilizationChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-[300px] bg-transparent">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={utilizationData} style={{ backgroundColor: 'transparent' }}>
          <CartesianGrid {...GRID_STYLE} />
          <XAxis dataKey="day" {...AXIS_STYLE} />
          <YAxis {...AXIS_STYLE} domain={[0, 100]} />
          <Tooltip
            {...ENHANCED_TOOLTIP_PROPS}
            formatter={(value) => [`${value}%`, '']}
          />
          <Legend {...ENHANCED_LEGEND_PROPS} />
          <Line type="monotone" dataKey="electrical" stroke="#3B82F6" strokeWidth={2} name="Electrical" />
          <Line type="monotone" dataKey="mechanical" stroke="#10B981" strokeWidth={2} name="Mechanical" />
          <Line type="monotone" dataKey="software" stroke="#F59E0B" strokeWidth={2} name="Software" />
          <Line type="monotone" dataKey="systems" stroke="#EF4444" strokeWidth={2} name="Systems" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ClientDistributionChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-[300px] bg-transparent">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart style={{ backgroundColor: 'transparent' }}>
          <Pie
            data={clientDistribution}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={60}
            paddingAngle={2}
            dataKey="value"
          >
            {clientDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            {...ENHANCED_TOOLTIP_PROPS}
            formatter={(value) => [`${value}%`, 'Revenue Share']}
          />
          <Legend {...ENHANCED_LEGEND_PROPS} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ProjectStatusChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-[300px] bg-transparent">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={projectStatusData} layout="horizontal" style={{ backgroundColor: 'transparent' }}>
          <CartesianGrid {...GRID_STYLE} />
          <XAxis type="number" {...AXIS_STYLE} />
          <YAxis dataKey="status" type="category" {...AXIS_STYLE} width={80} />
          <Tooltip
            {...ENHANCED_TOOLTIP_PROPS}
            formatter={(value) => [value, 'Projects']}
          />
          <Bar dataKey="count" fill="#3B82F6">
            {projectStatusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}