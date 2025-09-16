'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar,
  Clock,
  MapPin,
  Building,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Plane,
  Car,
  Home,
  Users,
  FileText,
  Shield,
  DollarSign,
  Briefcase,
  AlertCircle,
  TrendingUp,
  Target,
  Navigation
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface WeekSchedule {
  weekStarting: string
  assignments: {
    day: string
    client: string
    location: string
    project: string
    hours: number
    travelRequired: boolean
    status: 'confirmed' | 'tentative' | 'pending'
  }[]
}

interface DeploymentRequirement {
  id: string
  requirement: string
  status: 'complete' | 'in-progress' | 'pending' | 'blocked'
  priority: 'critical' | 'high' | 'medium' | 'low'
  dueDate?: string
}

interface EngineerDeploymentScheduleProps {
  engineer: {
    id: string
    name: string
    role: string
    hourlyRate: number
    location: string
  }
  currentWeek?: WeekSchedule
  upcomingWeeks?: WeekSchedule[]
  deploymentRequirements?: DeploymentRequirement[]
}

export default function EngineerDeploymentSchedule({ 
  engineer, 
  currentWeek,
  upcomingWeeks = [],
  deploymentRequirements = []
}: EngineerDeploymentScheduleProps) {
  const [selectedWeek, setSelectedWeek] = useState(0)

  // Mock data for current week split schedule
  const mockCurrentWeek: WeekSchedule = currentWeek || {
    weekStarting: '2024-01-15',
    assignments: [
      { day: 'Monday', client: 'Ford', location: 'Dearborn, MI', project: 'F-150 Lightning', hours: 8, travelRequired: false, status: 'confirmed' },
      { day: 'Tuesday', client: 'Ford', location: 'Dearborn, MI', project: 'F-150 Lightning', hours: 8, travelRequired: false, status: 'confirmed' },
      { day: 'Wednesday', client: 'GM', location: 'Warren, MI', project: 'Ultium Battery', hours: 8, travelRequired: true, status: 'confirmed' },
      { day: 'Thursday', client: 'GM', location: 'Warren, MI', project: 'Ultium Battery', hours: 8, travelRequired: false, status: 'confirmed' },
      { day: 'Friday', client: 'GM', location: 'Warren, MI', project: 'Ultium Battery', hours: 8, travelRequired: false, status: 'confirmed' },
    ]
  }

  // Mock deployment requirements
  const mockRequirements: DeploymentRequirement[] = deploymentRequirements.length > 0 ? deploymentRequirements : [
    { id: '1', requirement: 'Background Check - Ford', status: 'complete', priority: 'critical' },
    { id: '2', requirement: 'Background Check - GM', status: 'complete', priority: 'critical' },
    { id: '3', requirement: 'Safety Training - Ford Plant', status: 'complete', priority: 'high' },
    { id: '4', requirement: 'Safety Training - GM Facility', status: 'in-progress', priority: 'high', dueDate: '2024-01-14' },
    { id: '5', requirement: 'Badge Access - Ford', status: 'complete', priority: 'critical' },
    { id: '6', requirement: 'Badge Access - GM', status: 'pending', priority: 'critical', dueDate: '2024-01-15' },
    { id: '7', requirement: 'NDA Signed - Both Clients', status: 'complete', priority: 'critical' },
    { id: '8', requirement: 'Tool Certification', status: 'complete', priority: 'medium' },
    { id: '9', requirement: 'Travel Arrangements', status: 'complete', priority: 'high' },
    { id: '10', requirement: 'Housing Confirmation', status: 'complete', priority: 'medium' }
  ]

  // Calculate weekly metrics
  const weeklyMetrics = {
    totalHours: mockCurrentWeek.assignments.reduce((sum, a) => sum + a.hours, 0),
    clientCount: new Set(mockCurrentWeek.assignments.map(a => a.client)).size,
    travelDays: mockCurrentWeek.assignments.filter(a => a.travelRequired).length,
    revenue: mockCurrentWeek.assignments.reduce((sum, a) => sum + (a.hours * engineer.hourlyRate), 0)
  }

  // Group requirements by status
  const requirementsByStatus = {
    critical: mockRequirements.filter(r => r.priority === 'critical'),
    pending: mockRequirements.filter(r => r.status === 'pending' || r.status === 'blocked'),
    complete: mockRequirements.filter(r => r.status === 'complete')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'tentative': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'pending': return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20'
    }
  }

  const getRequirementStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'in-progress': return <Clock className="h-4 w-4 text-yellow-400" />
      case 'pending': return <AlertCircle className="h-4 w-4 text-orange-400" />
      case 'blocked': return <AlertTriangle className="h-4 w-4 text-red-400" />
      default: return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Deployment Status Header */}
      <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-white text-xl">Split-Week Deployment Schedule</CardTitle>
              <p className="text-slate-300 mt-1">Multiple client assignments this week</p>
            </div>
            <Badge variant="outline" className="bg-green-400/10 text-green-400 border-green-400/30">
              Active Deployment
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-slate-400 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Total Hours</span>
              </div>
              <p className="text-2xl font-bold text-white">{weeklyMetrics.totalHours}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-slate-400 mb-1">
                <Building className="h-4 w-4" />
                <span className="text-xs">Clients</span>
              </div>
              <p className="text-2xl font-bold text-white">{weeklyMetrics.clientCount}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-slate-400 mb-1">
                <Car className="h-4 w-4" />
                <span className="text-xs">Travel Days</span>
              </div>
              <p className="text-2xl font-bold text-white">{weeklyMetrics.travelDays}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-slate-400 mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">Weekly Revenue</span>
              </div>
              <p className="text-2xl font-bold text-green-400">${weeklyMetrics.revenue.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Week Schedule */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>This Week's Schedule</span>
            <Badge variant="outline" className="ml-auto">
              Week of {new Date(mockCurrentWeek.weekStarting).toLocaleDateString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockCurrentWeek.assignments.map((assignment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-700/30 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant="outline" className="text-white">
                        {assignment.day}
                      </Badge>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                      {assignment.travelRequired && (
                        <Badge variant="outline" className="text-orange-400 border-orange-400/30">
                          <Car className="h-3 w-3 mr-1" />
                          Travel
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Client</p>
                        <p className="text-white font-medium flex items-center space-x-2">
                          <Building className="h-4 w-4 text-slate-400" />
                          <span>{assignment.client}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Location</p>
                        <p className="text-slate-300 flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>{assignment.location}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Project</p>
                        <p className="text-slate-300 flex items-center space-x-2">
                          <Briefcase className="h-4 w-4 text-slate-400" />
                          <span>{assignment.project}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-white">{assignment.hours}h</p>
                    <p className="text-xs text-slate-400">${assignment.hours * engineer.hourlyRate}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Weekly Summary */}
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm text-slate-400">Week Summary</p>
                  <p className="text-white">
                    {weeklyMetrics.clientCount} clients • {weeklyMetrics.totalHours} hours • ${weeklyMetrics.revenue.toLocaleString()} revenue
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Requirements Checklist */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Deployment Requirements</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-400/10 text-green-400 border-green-400/30">
                {requirementsByStatus.complete.length}/{mockRequirements.length} Complete
              </Badge>
              {requirementsByStatus.pending.length > 0 && (
                <Badge variant="outline" className="bg-orange-400/10 text-orange-400 border-orange-400/30">
                  {requirementsByStatus.pending.length} Pending
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Critical/Pending Items Alert */}
          {requirementsByStatus.pending.length > 0 && (
            <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5" />
                <div>
                  <p className="text-orange-400 font-medium">Action Required</p>
                  <p className="text-sm text-slate-300 mt-1">
                    {requirementsByStatus.pending.length} requirement{requirementsByStatus.pending.length > 1 ? 's' : ''} pending completion before deployment
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Requirements List */}
          <div className="space-y-2">
            {mockRequirements.map((req) => (
              <div 
                key={req.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  req.status === 'complete' 
                    ? 'bg-slate-700/20 border-slate-700' 
                    : 'bg-slate-700/40 border-slate-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {getRequirementStatusIcon(req.status)}
                  <div>
                    <p className={`${req.status === 'complete' ? 'text-slate-400 line-through' : 'text-white'}`}>
                      {req.requirement}
                    </p>
                    {req.dueDate && req.status !== 'complete' && (
                      <p className="text-xs text-orange-400 mt-1">
                        Due: {new Date(req.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <Badge className={`${getPriorityColor(req.priority)} border`}>
                  {req.priority}
                </Badge>
              </div>
            ))}
          </div>

          {/* Deployment Readiness Score */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Deployment Readiness</p>
                <div className="flex items-center space-x-3">
                  <div className="text-3xl font-bold text-white">
                    {Math.round((requirementsByStatus.complete.length / mockRequirements.length) * 100)}%
                  </div>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full">
                    <div 
                      className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${(requirementsByStatus.complete.length / mockRequirements.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button variant="outline" className="justify-start">
          <Navigation className="h-4 w-4 mr-2" />
          Get Directions
        </Button>
        <Button variant="outline" className="justify-start">
          <FileText className="h-4 w-4 mr-2" />
          View Contracts
        </Button>
        <Button variant="outline" className="justify-start">
          <Users className="h-4 w-4 mr-2" />
          Contact Clients
        </Button>
        <Button variant="outline" className="justify-start">
          <Plane className="h-4 w-4 mr-2" />
          Travel Details
        </Button>
      </div>
    </div>
  )
}