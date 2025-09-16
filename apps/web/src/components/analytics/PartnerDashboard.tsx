'use client'

import { useSession } from 'next-auth/react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { ChartWrapper, ENHANCED_TOOLTIP_PROPS, ENHANCED_LEGEND_PROPS } from '@/components/ui/chart-wrapper'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  Clock,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

// Mock data based on partner organization
const getPartnerData = (partnerId: string, partnerName: string) => {
  const baseData = {
    'partner-gm': {
      revenue: { current: 2100000, previous: 1850000, growth: 13.5 },
      utilization: { current: 89, previous: 82, growth: 8.5 },
      engineers: { total: 125, deployed: 118, available: 5, processing: 2 },
      projects: { active: 12, completed: 28, success_rate: 95.2 }
    },
    'partner-ford': {
      revenue: { current: 1850000, previous: 1620000, growth: 14.2 },
      utilization: { current: 85, previous: 78, growth: 9.0 },
      engineers: { total: 98, deployed: 89, available: 7, processing: 2 },
      projects: { active: 9, completed: 22, success_rate: 93.8 }
    },
    'partner-stellantis': {
      revenue: { current: 1650000, previous: 1450000, growth: 13.8 },
      utilization: { current: 87, previous: 80, growth: 8.8 },
      engineers: { total: 88, deployed: 82, available: 4, processing: 2 },
      projects: { active: 8, completed: 19, success_rate: 94.1 }
    },
    'partner-hirotec': {
      revenue: { current: 950000, previous: 820000, growth: 15.9 },
      utilization: { current: 91, previous: 84, growth: 8.3 },
      engineers: { total: 52, deployed: 49, available: 2, processing: 1 },
      projects: { active: 6, completed: 15, success_rate: 96.7 }
    }
  }

  return baseData[partnerId as keyof typeof baseData] || baseData['partner-gm']
}

const getPartnerProjects = (partnerName: string) => [
  { name: `${partnerName} Assembly Line`, progress: 85, status: 'In Progress', budget: 450000, spent: 380000 },
  { name: `${partnerName} Quality Control`, progress: 62, status: 'In Progress', budget: 320000, spent: 198000 },
  { name: `${partnerName} Paint Shop`, progress: 95, status: 'Near Completion', budget: 280000, spent: 266000 },
  { name: `${partnerName} Robotics`, progress: 28, status: 'Planning', budget: 380000, spent: 106000 },
]

const monthlyTrend = [
  { month: 'Jul', revenue: 820000, engineers: 45, utilization: 78 },
  { month: 'Aug', revenue: 890000, engineers: 48, utilization: 82 },
  { month: 'Sep', revenue: 950000, engineers: 52, utilization: 85 },
  { month: 'Oct', revenue: 1020000, engineers: 55, utilization: 87 },
  { month: 'Nov', revenue: 1180000, engineers: 58, utilization: 89 },
  { month: 'Dec', revenue: 1350000, engineers: 62, utilization: 91 }
]

const engineerSpecialties = [
  { name: 'Electrical', value: 35, color: '#3B82F6' },
  { name: 'Mechanical', value: 28, color: '#10B981' },
  { name: 'Software', value: 22, color: '#8B5CF6' },
  { name: 'Systems', value: 15, color: '#F59E0B' }
]

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B']

interface MetricCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ElementType
  color: string
}

function MetricCard({ title, value, change, icon: Icon, color }: MetricCardProps) {
  const isPositive = change > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span className="text-sm">{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
        </div>
      </div>
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  )
}

export default function PartnerDashboard() {
  const { data: session } = useSession()
  
  if (!session?.user) {
    return <div className="text-white">Loading...</div>
  }

  const partnerData = getPartnerData(session.user.partnerId, session.user.partnerName)
  const projects = getPartnerProjects(session.user.partnerName)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          {session.user.partnerName} Analytics
        </h1>
        <p className="text-slate-400">
          Comprehensive overview of your engineering operations and performance metrics.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Monthly Revenue"
          value={`$${(partnerData.revenue.current / 1000).toFixed(0)}K`}
          change={partnerData.revenue.growth}
          icon={DollarSign}
          color="from-green-500 to-emerald-600"
        />
        <MetricCard
          title="Engineer Utilization"
          value={`${partnerData.utilization.current}%`}
          change={partnerData.utilization.growth}
          icon={Clock}
          color="from-blue-500 to-cyan-600"
        />
        <MetricCard
          title="Active Engineers"
          value={`${partnerData.engineers.deployed}/${partnerData.engineers.total}`}
          change={8.2}
          icon={Users}
          color="from-purple-500 to-pink-600"
        />
        <MetricCard
          title="Project Success Rate"
          value={`${partnerData.projects.success_rate}%`}
          change={2.1}
          icon={CheckCircle}
          color="from-orange-500 to-red-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Utilization Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Revenue & Utilization Trend</h3>
          <ChartWrapper width="100%" height={300}>
            <AreaChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis yAxisId="revenue" orientation="left" stroke="#94a3b8" />
              <YAxis yAxisId="utilization" orientation="right" stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                  zIndex: 9999,
                  position: 'relative',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
                }}
                wrapperStyle={{
                  zIndex: 9999,
                  position: 'relative'
                }}
              />
              <Legend />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
                name="Revenue ($)"
              />
              <Line
                yAxisId="utilization"
                type="monotone"
                dataKey="utilization"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                name="Utilization (%)"
              />
            </AreaChart>
          </ChartWrapper>
        </motion.div>

        {/* Engineer Specialties Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Engineer Specialties</h3>
          <ChartWrapper width="100%" height={300}>
            <PieChart>
              <Pie
                data={engineerSpecialties}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {engineerSpecialties.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                  zIndex: 9999,
                  position: 'relative',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
                }}
                wrapperStyle={{
                  zIndex: 9999,
                  position: 'relative'
                }}
              />
            </PieChart>
          </ChartWrapper>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {engineerSpecialties.map((specialty, index) => (
              <div key={specialty.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: specialty.color }}
                />
                <span className="text-sm text-slate-300">{specialty.name}: {specialty.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Active Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Active Projects</h3>
        <div className="space-y-4">
          {projects.map((project, index) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-white">{project.name}</h4>
                  <p className="text-sm text-slate-400">{project.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">${(project.spent / 1000).toFixed(0)}K / ${(project.budget / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-slate-400">{((project.spent / project.budget) * 100).toFixed(1)}% of budget</p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      project.progress > 90 ? 'bg-green-500' :
                      project.progress > 60 ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <TrendingUp className="h-6 w-6 text-green-400" />
            <h4 className="font-semibold text-white">Revenue Growth</h4>
          </div>
          <p className="text-2xl font-bold text-green-400 mb-2">+{partnerData.revenue.growth.toFixed(1)}%</p>
          <p className="text-sm text-slate-300">Monthly revenue increased significantly driven by higher utilization rates and project expansions.</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Activity className="h-6 w-6 text-blue-400" />
            <h4 className="font-semibold text-white">Operational Efficiency</h4>
          </div>
          <p className="text-2xl font-bold text-blue-400 mb-2">{partnerData.utilization.current}%</p>
          <p className="text-sm text-slate-300">Engineer utilization exceeds industry average by 12%, indicating optimal resource allocation.</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="h-6 w-6 text-purple-400" />
            <h4 className="font-semibold text-white">Risk Assessment</h4>
          </div>
          <p className="text-2xl font-bold text-purple-400 mb-2">Low</p>
          <p className="text-sm text-slate-300">All projects on track with minimal risk factors. Strong performance across all metrics.</p>
        </div>
      </motion.div>
    </div>
  )
}