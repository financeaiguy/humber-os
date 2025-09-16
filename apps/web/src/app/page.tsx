'use client'

import { motion } from 'framer-motion'
import { useSession } from '@/components/session-context'
import { 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign,
  Activity,
  AlertCircle,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { hasPermission } from '@/lib/permissions'
import { JobsDashboard } from '@/components/jobs-dashboard'
import { useEffect, useState } from 'react'
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
import { ChartWrapper, ENHANCED_TOOLTIP_PROPS, ENHANCED_LEGEND_PROPS } from '@/components/ui/chart-wrapper'

const stats = [
  {
    name: 'Total Revenue',
    value: '$917,235',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600',
  },
  {
    name: 'Active Projects',
    value: '15',
    change: '+3 this month',
    trend: 'up',
    icon: Activity,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    name: 'Billable Hours',
    value: '73%',
    change: '+5.2%',
    trend: 'up',
    icon: Clock,
    color: 'from-purple-500 to-pink-600',
  },
  {
    name: 'Team Members',
    value: '35',
    change: '2 new hires',
    trend: 'up',
    icon: Users,
    color: 'from-orange-500 to-red-600',
  },
]

const recentProjects = [
  { id: 1, name: 'GM Assembly Line Automation', client: 'General Motors', status: 'In Progress', completion: 65 },
  { id: 2, name: 'Ford Paint Shop Upgrade', client: 'Ford', status: 'In Progress', completion: 40 },
  { id: 3, name: 'Stellantis Quality Control', client: 'Stellantis', status: 'Planning', completion: 15 },
  { id: 4, name: 'HIROTEC Welding System', client: 'HIROTEC', status: 'In Progress', completion: 80 },
]

const upcomingDeadlines = [
  { id: 1, task: 'GM Project FAT', date: '2024-01-15', priority: 'high' },
  { id: 2, task: 'Ford Design Review', date: '2024-01-18', priority: 'medium' },
  { id: 3, task: 'Stellantis Kickoff', date: '2024-01-22', priority: 'low' },
  { id: 4, task: 'HIROTEC Commissioning', date: '2024-01-25', priority: 'high' },
]

// Humber Engineering Analytics Data
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

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function HomePage() {
  const { data: session } = useSession()
  const [isJobsMode, setIsJobsMode] = useState(false)

  useEffect(() => {
    // Check for Jobs mode
    const designMode = document.documentElement.getAttribute('data-design-mode')
    setIsJobsMode(designMode === 'jobs')
  }, [])

  if (!session?.user) {
    return <div className="text-white">Loading...</div>
  }

  // Return Jobs-styled dashboard if in Jobs mode
  if (isJobsMode) {
    return <JobsDashboard />
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
          Welcome back, {session.user.name?.split(' ')[0]}
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          {session.user.partnerName} - {session.user.role.replace('_', ' ')}
        </p>
        <p className="text-sm sm:text-base text-slate-400 mt-1">
          Here's what's happening with your automation projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-slate-400 truncate">{stat.name}</p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1 truncate">{stat.change}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${stat.color} flex-shrink-0`}>
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-full animate-shimmer" />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 rounded-xl sm:rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-white">Active Projects</h2>
            <Link href="/projects" className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="bg-slate-900/50 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-slate-900/70 transition-colors">
                <div className="flex items-start sm:items-center justify-between mb-2 gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-white text-sm sm:text-base truncate">{project.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 truncate">{project.client}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    project.status === 'In Progress' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{project.completion}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${project.completion}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl sm:rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-white">Upcoming Deadlines</h2>
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
          </div>
          <div className="space-y-2 sm:space-y-3">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="flex items-center space-x-3 p-2 sm:p-3 rounded-lg hover:bg-slate-900/50 transition-colors">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                  deadline.priority === 'high' 
                    ? 'bg-red-500' 
                    : deadline.priority === 'medium'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-white truncate">{deadline.task}</p>
                  <p className="text-xs text-slate-400">{deadline.date}</p>
                </div>
                {deadline.priority === 'high' && (
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
      >
        {[
          { label: 'Log Time', href: '/time', icon: Clock, color: 'from-blue-500 to-cyan-500', permission: 'canLogTime' },
          { label: 'New Project', href: '/projects/new', icon: Activity, color: 'from-purple-500 to-pink-500', permission: 'canManageProjects' },
          { label: 'Team Report', href: '/team', icon: Users, color: 'from-green-500 to-emerald-500', permission: 'canViewTeam' },
          { label: 'Analytics', href: '/analytics', icon: TrendingUp, color: 'from-orange-500 to-red-500', permission: 'canViewAnalytics' },
        ].filter((action) => hasPermission(session.user.role, action.permission as any)).map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-3 sm:p-4 hover:border-slate-600 transition-all duration-300 touch-manipulation"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
            <div className="flex flex-col sm:flex-row items-center sm:space-x-3 space-y-2 sm:space-y-0">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} flex-shrink-0`}>
                <action.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-white text-center sm:text-left">{action.label}</span>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Visual Analytics Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Engineering Analytics</h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-slate-700 text-white rounded text-sm hover:bg-slate-600 transition-colors">
              6M
            </button>
            <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
              YTD
            </button>
          </div>
        </div>

        {/* Revenue & Projects Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue & Project Volume</h3>
            <ChartWrapper width="100%" height={300}>
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis yAxisId="left" stroke="#9CA3AF" />
                <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                <Tooltip 
                  {...ENHANCED_TOOLTIP_PROPS}
                  formatter={(value, name) => [
                    name === 'revenue' ? `$${(value / 1000).toFixed(0)}K` : value,
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
            </ChartWrapper>
          </div>

          <div className="rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Engineer Utilization by Discipline</h3>
            <ChartWrapper width="100%" height={300}>
              <LineChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
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
                  formatter={(value) => [`${value}%`, '']}
                />
                <Legend />
                <Line type="monotone" dataKey="electrical" stroke="#3B82F6" strokeWidth={2} name="Electrical" />
                <Line type="monotone" dataKey="mechanical" stroke="#10B981" strokeWidth={2} name="Mechanical" />
                <Line type="monotone" dataKey="software" stroke="#F59E0B" strokeWidth={2} name="Software" />
                <Line type="monotone" dataKey="systems" stroke="#EF4444" strokeWidth={2} name="Systems" />
              </LineChart>
            </ChartWrapper>
          </div>
        </div>

        {/* Client Distribution & Project Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Client Revenue Distribution</h3>
            <ChartWrapper width="100%" height={300}>
              <PieChart>
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
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
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
                  formatter={(value) => [`${value}%`, 'Revenue Share']}
                />
                <Legend />
              </PieChart>
            </ChartWrapper>
          </div>

          <div className="rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Project Status Overview</h3>
            <ChartWrapper width="100%" height={300}>
              <BarChart data={projectStatusData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="status" type="category" stroke="#9CA3AF" width={80} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
                  }}
                  formatter={(value) => [value, 'Projects']}
                />
                <Bar dataKey="count" fill="#3B82F6">
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartWrapper>
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Key Performance Indicators</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-900/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">87%</div>
              <div className="text-sm text-slate-400">Overall Utilization</div>
            </div>
            <div className="text-center p-4 bg-slate-900/50 rounded-lg">
              <div className="text-2xl font-bold text-green-400">$6.2M</div>
              <div className="text-sm text-slate-400">YTD Revenue</div>
            </div>
            <div className="text-center p-4 bg-slate-900/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">30</div>
              <div className="text-sm text-slate-400">Active Projects</div>
            </div>
            <div className="text-center p-4 bg-slate-900/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">95%</div>
              <div className="text-sm text-slate-400">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}