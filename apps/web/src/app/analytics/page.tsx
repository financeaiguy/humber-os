'use client'

import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  PieChart, 
  DollarSign,
  Clock,
  Users,
  Target
} from 'lucide-react'

const analyticsData = {
  revenue: {
    current: 917235,
    previous: 821450,
    growth: 11.6,
    trend: 'up'
  },
  utilization: {
    current: 73,
    previous: 68,
    growth: 5,
    trend: 'up'
  },
  projects: {
    completed: 42,
    active: 15,
    pipeline: 8,
    successRate: 93.3
  },
  engineers: {
    total: 35,
    deployed: 26,
    available: 7,
    processing: 2
  }
}

const monthlyRevenue = [
  { month: 'Aug', revenue: 785000 },
  { month: 'Sep', revenue: 821450 },
  { month: 'Oct', revenue: 856200 },
  { month: 'Nov', revenue: 892100 },
  { month: 'Dec', revenue: 917235 },
  { month: 'Jan', revenue: 945000 }
]

const projectsByCategory = [
  { category: 'Electrical', count: 12, percentage: 35 },
  { category: 'Mechanical', count: 8, percentage: 24 },
  { category: 'Software', count: 7, percentage: 21 },
  { category: 'Systems', count: 5, percentage: 15 },
  { category: 'Project Mgmt', count: 3, percentage: 9 }
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-slate-400">
          Track performance metrics and business insights.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className={`flex items-center space-x-1 ${analyticsData.revenue.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              {analyticsData.revenue.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="text-sm">+{analyticsData.revenue.growth}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Revenue</p>
            <p className="text-2xl font-bold text-white">${analyticsData.revenue.current.toLocaleString()}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className={`flex items-center space-x-1 ${analyticsData.utilization.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              {analyticsData.utilization.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="text-sm">+{analyticsData.utilization.growth}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-400">Utilization Rate</p>
            <p className="text-2xl font-bold text-white">{analyticsData.utilization.current}%</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="text-green-400">
              <span className="text-sm">{analyticsData.projects.successRate}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-400">Success Rate</p>
            <p className="text-2xl font-bold text-white">{analyticsData.projects.completed}</p>
            <p className="text-xs text-slate-500">Projects Completed</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-400">Team Deployment</p>
            <p className="text-2xl font-bold text-white">{analyticsData.engineers.deployed}/{analyticsData.engineers.total}</p>
            <p className="text-xs text-slate-500">Engineers Active</p>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Revenue Trend</h2>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {monthlyRevenue.map((item, index) => (
              <div key={item.month} className="flex items-center justify-between">
                <span className="text-sm text-slate-400 w-12">{item.month}</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.revenue / 1000000) * 100}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                    />
                  </div>
                </div>
                <span className="text-sm text-white font-medium w-20 text-right">
                  ${(item.revenue / 1000).toFixed(0)}k
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Projects by Category */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Projects by Category</h2>
            <PieChart className="h-5 w-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {projectsByCategory.map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${getCategoryColor(category.category)}`} />
                  <span className="text-sm text-slate-300">{category.category}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-400">{category.count} projects</span>
                  <span className="text-sm font-medium text-white w-12 text-right">{category.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">93.3%</div>
            <p className="text-sm text-slate-400">Project Success Rate</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">180</div>
            <p className="text-sm text-slate-400">Avg Deployment Days</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">4.7</div>
            <p className="text-sm text-slate-400">Client Satisfaction</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function getCategoryColor(category: string) {
  switch (category) {
    case 'ELECTRICAL_ENGINEER':
    case 'Electrical': return 'from-blue-500 to-cyan-500'
    case 'MECHANICAL_ENGINEER':
    case 'Mechanical': return 'from-green-500 to-emerald-500'
    case 'SOFTWARE_ENGINEER':
    case 'Software': return 'from-purple-500 to-pink-500'
    case 'SYSTEMS_ENGINEER':
    case 'Systems': return 'from-orange-500 to-red-500'
    case 'PROJECT_ENGINEER':
    case 'Project Mgmt': return 'from-indigo-500 to-purple-500'
    default: return 'from-gray-500 to-slate-500'
  }
}
