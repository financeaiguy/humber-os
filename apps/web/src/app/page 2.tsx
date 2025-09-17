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

export default function HomePage() {
  const { data: session } = useSession()

  if (!session?.user) {
    return <div className="text-white">Loading...</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {session.user.name?.split(' ')[0]}
        </h1>
        <p className="text-slate-400">
          {session.user.partnerName} - {session.user.role.replace('_', ' ')}
        </p>
        <p className="text-slate-400 mt-1">
          Here's what's happening with your automation projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{stat.name}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-full animate-shimmer" />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Active Projects</h2>
            <Link href="/projects" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="bg-slate-900/50 rounded-xl p-4 hover:bg-slate-900/70 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-white">{project.name}</h3>
                    <p className="text-sm text-slate-400">{project.client}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
          className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Upcoming Deadlines</h2>
            <Calendar className="h-5 w-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-900/50 transition-colors">
                <div className={`h-2 w-2 rounded-full ${
                  deadline.priority === 'high' 
                    ? 'bg-red-500' 
                    : deadline.priority === 'medium'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{deadline.task}</p>
                  <p className="text-xs text-slate-400">{deadline.date}</p>
                </div>
                {deadline.priority === 'high' && (
                  <AlertCircle className="h-4 w-4 text-red-400" />
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
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
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
            className="group relative overflow-hidden rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4 hover:border-slate-600 transition-all duration-300"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color}`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-white">{action.label}</span>
            </div>
          </Link>
        ))}
      </motion.div>
    </div>
  )
}