'use client'

import { useSession } from '@/components/session-context'
import { 
  JobsStatCard, 
  JobsSection, 
  JobsTable, 
  JobsButton 
} from './jobs-layout'
import { 
  TrendingUp, 
  Activity, 
  Users, 
  Clock,
  ChevronRight,
  Plus
} from 'lucide-react'
import { OptimizedLink } from './optimized-link'

// Jobs Philosophy: "Focus means saying no to 1000 good ideas"
// Only show the MOST important metrics
const coreMetrics = [
  {
    title: 'Revenue',
    value: '$917K',
    subtitle: '+12% from last month',
    trend: 'up' as const
  },
  {
    title: 'Active Projects',
    value: '15',
    subtitle: '3 launching this week',
    trend: 'up' as const
  },
  {
    title: 'Team Utilization',
    value: '87%',
    subtitle: 'Above target',
    trend: 'up' as const
  },
  {
    title: 'Client Satisfaction',
    value: '4.8',
    subtitle: 'Out of 5.0',
    trend: 'neutral' as const
  }
]

const recentProjects = [
  { 
    name: 'GM Assembly Line', 
    client: 'General Motors', 
    status: 'In Progress', 
    completion: 65,
    priority: 'high'
  },
  { 
    name: 'Ford Paint Shop', 
    client: 'Ford Motor Co', 
    status: 'In Progress', 
    completion: 40,
    priority: 'medium'
  },
  { 
    name: 'Stellantis QC System', 
    client: 'Stellantis', 
    status: 'Planning', 
    completion: 15,
    priority: 'medium'
  },
  { 
    name: 'HIROTEC Welding', 
    client: 'HIROTEC America', 
    status: 'In Progress', 
    completion: 80,
    priority: 'high'
  }
]

const upcomingTasks = [
  { task: 'GM Project FAT', date: 'Jan 15', priority: 'high' },
  { task: 'Ford Design Review', date: 'Jan 18', priority: 'medium' },
  { task: 'Stellantis Kickoff', date: 'Jan 22', priority: 'low' },
  { task: 'HIROTEC Commissioning', date: 'Jan 25', priority: 'high' }
]

export function JobsDashboard() {
  const { data: session } = useSession()

  return (
    <div className="space-y-12">
      {/* Welcome - Personal, but Minimal */}
      <div className="space-y-2">
        <h1 className="text-display text-4xl font-bold text-black">
          Good {getTimeOfDay()}, {session?.user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-body text-gray-600">
          Here's what's happening with your engineering operations
        </p>
      </div>

      {/* Core Metrics - The "At a Glance" Section */}
      <JobsSection title="At a Glance">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreMetrics.map((metric, index) => (
            <JobsStatCard
              key={index}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              trend={metric.trend}
            />
          ))}
        </div>
      </JobsSection>

      {/* Projects - The Core Business */}
      <JobsSection 
        title="Active Projects"
        subtitle="Your most important work"
        action={
          <OptimizedLink href="/projects">
            <JobsButton variant="secondary">
              View All Projects
              <ChevronRight size={16} className="ml-2" />
            </JobsButton>
          </OptimizedLink>
        }
      >
        <JobsTable headers={['Project', 'Client', 'Status', 'Progress']}>
          {recentProjects.map((project, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="py-4">
                <div className="space-y-1">
                  <p className="text-body font-medium text-black">
                    {project.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      project.priority === 'high' ? 'bg-red-500' :
                      project.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <span className="text-caption text-xs text-gray-500">
                      {project.priority} priority
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-4">
                <p className="text-body text-gray-600">{project.client}</p>
              </td>
              <td className="py-4">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'Planning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {project.status}
                </span>
              </td>
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.completion}%` }}
                    />
                  </div>
                  <span className="text-body text-sm font-medium text-gray-900">
                    {project.completion}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </JobsTable>
      </JobsSection>

      {/* Upcoming - Time-Sensitive Actions */}
      <JobsSection 
        title="This Week"
        subtitle="Your immediate priorities"
      >
        <div className="jobs-card">
          <div className="space-y-4">
            {upcomingTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <p className="text-body font-medium text-black">{task.task}</p>
                </div>
                <p className="text-caption text-gray-500">{task.date}</p>
              </div>
            ))}
          </div>
        </div>
      </JobsSection>

      {/* Quick Actions - Contextual */}
      <JobsSection title="Quick Actions">
        <div className="flex flex-wrap gap-4">
          <OptimizedLink href="/projects/new">
            <JobsButton>
              <Plus size={16} className="mr-2" />
              New Project
            </JobsButton>
          </OptimizedLink>
          <OptimizedLink href="/onboarding">
            <JobsButton variant="secondary">
              <Users size={16} className="mr-2" />
              Onboard Engineer
            </JobsButton>
          </OptimizedLink>
          <OptimizedLink href="/analytics">
            <JobsButton variant="secondary">
              <TrendingUp size={16} className="mr-2" />
              View Analytics
            </JobsButton>
          </OptimizedLink>
        </div>
      </JobsSection>
    </div>
  )
}

// Utility function for personalized greeting
function getTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}