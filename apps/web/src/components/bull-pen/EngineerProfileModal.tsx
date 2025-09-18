'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  MapPin, 
  Star, 
  DollarSign, 
  Clock, 
  Award, 
  Globe, 
  Calendar, 
  Briefcase,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  AlertTriangle,
  Plane,
  Home,
  Languages,
  Shield,
  Target,
  TrendingUp,
  Activity,
  Edit3,
  Save,
  Camera,
  MessageCircle,
  Video
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EngineerDeploymentSchedule from './EngineerDeploymentSchedule'
import { BurnRateWidget } from '@/components/burn-rate-widget'
import { BurnRateCalculator, PurchaseOrder, EngineerTimeEntry } from '@/lib/burn-rate-calculator'
import { Progress } from '@/components/ui/progress'

interface Engineer {
  id: string
  name: string
  role: string
  category: string
  avatar: string
  location: string
  coordinates?: { lat: number; lng: number }
  hourlyRate: number
  experience: number
  skills: string[]
  rating: number
  availability: string
  visaStatus: string
  lastProject: string
  preferredProjects: string[]
  certifications: string[]
  languages: string[]
  travelPreferences?: {
    maxTravelDistance: number
    willingToRelocate: boolean
    hasValidPassport: boolean
    preferredProjects: string[]
    maxTravelDuration: number
  }
  workAuthorization?: {
    countries: string[]
    restrictions: string[]
    expirationDate: string
  }
}

interface EngineerProfileModalProps {
  isOpen: boolean
  onClose: () => void
  engineer: Engineer | null
  onAssignToProject?: (engineer: Engineer) => void
  onMessage?: (engineer: Engineer) => void
  onVideoCall?: (engineer: Engineer) => void
  currentProjectPO?: PurchaseOrder | null
  engineerTimeEntries?: EngineerTimeEntry[]
}

export default function EngineerProfileModal({ 
  isOpen, 
  onClose, 
  engineer, 
  onAssignToProject,
  onMessage,
  onVideoCall,
  currentProjectPO,
  engineerTimeEntries = []
}: EngineerProfileModalProps) {
  const [activeTab, setActiveTab] = useState('deployment') // Default to deployment tab for rapid deployment focus
  const [isEditing, setIsEditing] = useState(false)

  if (!engineer) return null

  const getAvailabilityColor = (availability: string) => {
    switch (availability.toLowerCase()) {
      case 'available': return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'on project': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'unavailable': return 'text-red-400 bg-red-400/10 border-red-400/20'
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20'
    }
  }

  const getVisaStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'citizen': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'green card': return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'h1-b valid': return 'text-purple-400 bg-purple-400/10 border-purple-400/20'
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20'
    }
  }

  // Mock project history data
  const projectHistory = [
    {
      id: 1,
      name: engineer.lastProject,
      client: 'Tesla Motors',
      duration: '6 months',
      role: 'Lead Engineer',
      startDate: '2023-08-01',
      endDate: '2024-02-01',
      rating: 4.9,
      feedback: 'Exceptional performance, exceeded all expectations'
    },
    {
      id: 2,
      name: 'Ford Lightning Assembly Line',
      client: 'Ford Motor Company',
      duration: '4 months',
      role: 'Senior Engineer',
      startDate: '2023-03-01',
      endDate: '2023-07-01',
      rating: 4.8,
      feedback: 'Strong technical skills and great team collaboration'
    }
  ]

  // Mock performance metrics
  const performanceMetrics = {
    projectsCompleted: 12,
    onTimeDelivery: 96,
    clientSatisfaction: 4.8,
    revenueGenerated: 850000,
    billableHours: 1840,
    utilizationRate: 94
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-slate-800 rounded-2xl border border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-2xl font-bold">{engineer.avatar}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h2 className="text-2xl font-bold">{engineer.name}</h2>
                      <div className="flex items-center space-x-1">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="font-semibold">{engineer.rating}</span>
                      </div>
                    </div>
                    <p className="text-blue-100 text-lg mb-2">{engineer.role}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{engineer.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">${engineer.hourlyRate}/hr</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{engineer.experience}y exp</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => onMessage?.(engineer)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => onVideoCall?.(engineer)}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Status Badges */}
              <div className="flex items-center space-x-3 mt-4">
                <Badge className={`${getAvailabilityColor(engineer.availability)} border`}>
                  {engineer.availability}
                </Badge>
                <Badge className={`${getVisaStatusColor(engineer.visaStatus)} border`}>
                  {engineer.visaStatus}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  {engineer.category}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6 bg-slate-700/50">
                  <TabsTrigger value="deployment">Deployment</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="skills">Skills & Certs</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="travel">Travel/Auth</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                {/* Deployment Tab - MOST IMPORTANT FOR RAPID DEPLOYMENT */}
                <TabsContent value="deployment" className="space-y-6">
                  <EngineerDeploymentSchedule 
                    engineer={{
                      id: engineer.id,
                      name: engineer.name,
                      role: engineer.role,
                      hourlyRate: engineer.hourlyRate,
                      location: engineer.location
                    }}
                  />
                </TabsContent>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center space-x-2">
                          <User className="h-5 w-5" />
                          <span>Contact Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-300">{engineer.name.toLowerCase().replace(' ', '.')}@humberops.com</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-300">+1 (555) 0{Math.floor(Math.random() * 99 + 10)}-{Math.floor(Math.random() * 8999 + 1000)}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Globe className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-300">linkedin.com/in/{engineer.name.toLowerCase().replace(' ', '')}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Languages className="h-4 w-4 text-slate-400" />
                          <div className="flex flex-wrap gap-1">
                            {engineer.languages.map((lang, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Current Status */}
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center space-x-2">
                          <Activity className="h-5 w-5" />
                          <span>Current Status</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Availability</span>
                          <Badge className={getAvailabilityColor(engineer.availability)}>
                            {engineer.availability}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Last Project</span>
                          <span className="text-white">{engineer.lastProject}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Utilization Rate</span>
                          <span className="text-white">{performanceMetrics.utilizationRate}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Current Rate</span>
                          <span className="text-green-400 font-semibold">${engineer.hourlyRate}/hr</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* PO Burn Rate Section - Only show if engineer is on a project with PO */}
                  {currentProjectPO && engineer.availability === 'On Project' && (
                    <Card className="bg-gradient-to-r from-slate-700/30 to-blue-700/20 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5 text-orange-400" />
                          <span>Purchase Order Burn Rate</span>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {currentProjectPO.poNumber}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const metrics = BurnRateCalculator.calculateBurnRate(
                            currentProjectPO,
                            engineerTimeEntries
                          )
                          const engineerMetrics = metrics.topEngineers.find(
                            e => e.engineerId === engineer.id
                          )
                          
                          return (
                            <div className="space-y-4">
                              {/* Engineer's Contribution */}
                              <div className="p-3 bg-slate-800/50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-slate-400">Your Contribution</span>
                                  <span className="text-sm font-medium text-white">
                                    {engineerMetrics ? 
                                      `${engineerMetrics.totalHours.toFixed(0)} hrs / $${engineerMetrics.totalCost.toLocaleString()}` : 
                                      '0 hrs / $0'
                                    }
                                  </span>
                                </div>
                                {engineerMetrics && (
                                  <div className="text-xs text-slate-500">
                                    Weekly Avg: {engineerMetrics.weeklyAverage.toFixed(1)} hrs
                                  </div>
                                )}
                              </div>
                              
                              {/* Overall PO Status */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-800/50 rounded-lg p-3">
                                  <div className="text-xs text-slate-400 mb-1">PO Consumed</div>
                                  <div className="flex items-center space-x-2">
                                    <Progress value={metrics.percentConsumed} className="flex-1 h-2" />
                                    <span className="text-sm font-medium text-white">
                                      {metrics.percentConsumed.toFixed(0)}%
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="bg-slate-800/50 rounded-lg p-3">
                                  <div className="text-xs text-slate-400 mb-1">Time Remaining</div>
                                  <div className="text-sm font-medium text-white">
                                    {metrics.weeksRemaining === Infinity ? 
                                      '∞ weeks' : 
                                      `${metrics.weeksRemaining.toFixed(1)} weeks`
                                    }
                                  </div>
                                </div>
                              </div>
                              
                              {/* Alerts */}
                              {metrics.alerts.length > 0 && (
                                <div className="space-y-2">
                                  {metrics.alerts.map((alert, i) => (
                                    <div key={i} className={`p-2 rounded-lg flex items-center space-x-2 ${
                                      alert.alertType === 'critical' ? 'bg-red-500/20 text-red-400' :
                                      alert.alertType === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                      'bg-gray-500/20 text-gray-400'
                                    }`}>
                                      <AlertTriangle className="h-4 w-4" />
                                      <span className="text-xs">{alert.message}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* View Full Report Link */}
                              <div className="pt-2 border-t border-slate-700">
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-blue-400 hover:text-blue-300 p-0"
                                  onClick={() => setActiveTab('projects')}
                                >
                                  View Full PO Report →
                                </Button>
                              </div>
                            </div>
                          )
                        })()}
                      </CardContent>
                    </Card>
                  )}

                  {/* Skills Overview */}
                  <Card className="bg-slate-700/30 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <span>Key Skills</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {engineer.skills.map((skill, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary" 
                            className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Preferred Projects */}
                  <Card className="bg-slate-700/30 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <Briefcase className="h-5 w-5" />
                        <span>Preferred Projects</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {engineer.preferredProjects.map((project, i) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className="text-slate-300 border-slate-600"
                          >
                            {project}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Skills & Certifications Tab */}
                <TabsContent value="skills" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center space-x-2">
                          <Target className="h-5 w-5" />
                          <span>Technical Skills</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {engineer.skills.map((skill, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-slate-300">{skill}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 h-2 bg-slate-600 rounded-full">
                                  <div 
                                    className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                    style={{ width: `${Math.floor(Math.random() * 30 + 70)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-400">{Math.floor(Math.random() * 3 + 8)}/10</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center space-x-2">
                          <Award className="h-5 w-5" />
                          <span>Certifications</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {engineer.certifications.map((cert, i) => (
                            <div key={i} className="flex items-center space-x-3">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              <span className="text-slate-300">{cert}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Project History Tab */}
                <TabsContent value="projects" className="space-y-6">
                  {projectHistory.map((project, i) => (
                    <Card key={project.id} className="bg-slate-700/30 border-slate-600">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-white">{project.name}</CardTitle>
                            <p className="text-slate-400">{project.client}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-white font-semibold">{project.rating}</span>
                            </div>
                            <p className="text-slate-400 text-sm">{project.duration}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Role</p>
                            <p className="text-slate-300">{project.role}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Start Date</p>
                            <p className="text-slate-300">{new Date(project.startDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">End Date</p>
                            <p className="text-slate-300">{new Date(project.endDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {/* PO Burn Rate for this project */}
                        {(() => {
                          // Find matching PO for this project - check both client name and project name
                          let projectPO = null
                          
                          // First try to match by client name
                          if (currentProjectPO && (
                            project.name.toLowerCase().includes(currentProjectPO.clientName.toLowerCase()) ||
                            currentProjectPO.clientName.toLowerCase().includes(project.client.toLowerCase()) ||
                            project.client.toLowerCase().includes(currentProjectPO.clientName.toLowerCase())
                          )) {
                            projectPO = currentProjectPO
                          }
                          
                          // If no currentProjectPO, create a mock one for demo
                          if (!projectPO && (project.client === 'Tesla Motors' || project.client === 'Ford Motor Company')) {
                            projectPO = {
                              id: `mock-po-${project.id}`,
                              poNumber: project.client === 'Tesla Motors' ? 'PO-2024-TESLA-001' : 'PO-2024-FORD-001',
                              clientName: project.client,
                              projectName: project.name,
                              totalBudget: project.client === 'Tesla Motors' ? 500000 : 750000,
                              allocatedHours: project.client === 'Tesla Motors' ? 4000 : 6000,
                              startDate: project.startDate,
                              endDate: project.endDate,
                              projectId: project.id.toString(),
                              status: 'active' as const
                            }
                          }
                          
                          // Get engineer's time entries (create mock data for demo)
                          let projectTimeEntries = engineerTimeEntries.filter(entry => 
                            entry.engineerId === engineer.id
                          )
                          
                          // If no real time entries, create mock data for demo
                          if (projectTimeEntries.length === 0 && projectPO) {
                            const mockHours = project.client === 'Tesla Motors' ? 120 : 80
                            projectTimeEntries = [{
                              id: `mock-entry-${engineer.id}-${project.id}`,
                              engineerId: engineer.id,
                              engineerName: engineer.name,
                              projectId: project.id.toString(),
                              poId: projectPO.id,
                              hours: mockHours,
                              date: new Date().toISOString(),
                              rate: engineer.hourlyRate,
                              approved: true
                            }]
                          }
                          
                          if (projectPO && projectTimeEntries.length > 0) {
                            const metrics = BurnRateCalculator.calculateBurnRate(projectPO, projectTimeEntries)
                            const engineerMetrics = metrics.topEngineers.find(e => e.engineerId === engineer.id)
                            
                            return (
                              <div className="bg-gradient-to-r from-slate-800/50 to-orange-800/20 rounded-lg p-3 border border-orange-500/20">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <TrendingUp className="h-4 w-4 text-orange-400" />
                                    <p className="text-xs font-medium text-orange-300">PO Burn Rate</p>
                                  </div>
                                  <Badge variant="outline" className="text-xs text-orange-400 border-orange-500/30">
                                    {projectPO.poNumber}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                  <div>
                                    <p className="text-xs text-slate-400">Your Hours</p>
                                    <p className="text-sm font-medium text-white">
                                      {engineerMetrics ? engineerMetrics.totalHours.toFixed(0) : '0'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-400">Your Cost</p>
                                    <p className="text-sm font-medium text-white">
                                      ${engineerMetrics ? engineerMetrics.totalCost.toLocaleString() : '0'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-400">PO Status</p>
                                    <p className={`text-sm font-medium ${
                                      metrics.burnRateStatus === 'healthy' ? 'text-green-400' :
                                      metrics.burnRateStatus === 'warning' ? 'text-yellow-400' :
                                      metrics.burnRateStatus === 'critical' ? 'text-orange-400' :
                                      'text-red-400'
                                    }`}>
                                      {metrics.percentConsumed.toFixed(0)}%
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="mb-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-slate-400">PO Consumption</span>
                                    <span className="text-xs text-slate-300">{metrics.percentConsumed.toFixed(1)}%</span>
                                  </div>
                                  <Progress value={metrics.percentConsumed} className="h-1.5" />
                                </div>
                                
                                {engineerMetrics && (
                                  <div className="text-xs text-slate-400">
                                    Weekly avg: {engineerMetrics.weeklyAverage.toFixed(1)} hrs • 
                                    Remaining: {metrics.weeksRemaining === Infinity ? '∞' : metrics.weeksRemaining.toFixed(1)} weeks
                                  </div>
                                )}
                                
                                {metrics.alerts.length > 0 && (
                                  <div className="mt-2 flex items-center space-x-1">
                                    <AlertTriangle className="h-3 w-3 text-yellow-400" />
                                    <span className="text-xs text-yellow-400">
                                      {metrics.alerts[0].message}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )
                          }
                          
                          // Always show burn rate section for Tesla and Ford projects
                          return (
                            <div className="bg-gradient-to-r from-slate-800/50 to-blue-800/20 rounded-lg p-3 border border-blue-500/20">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <TrendingUp className="h-4 w-4 text-blue-400" />
                                  <p className="text-xs font-medium text-blue-300">
                                    {projectPO ? 'PO Burn Rate' : 'Project Info'}
                                  </p>
                                </div>
                                {projectPO && (
                                  <Badge variant="outline" className="text-xs text-blue-400 border-blue-500/30">
                                    {projectPO.poNumber}
                                  </Badge>
                                )}
                              </div>
                              
                              {projectPO ? (
                                <div>
                                  <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
                                    <div>
                                      <p className="text-slate-400">Budget</p>
                                      <p className="text-white font-medium">${(projectPO.totalBudget / 1000).toFixed(0)}K</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-400">Hours</p>
                                      <p className="text-white font-medium">{projectPO.allocatedHours}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-400">Status</p>
                                      <p className="text-green-400 font-medium">Active</p>
                                    </div>
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    Click "Assign to Project" to see full burn rate metrics
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-slate-400">
                                  No active purchase order for this project
                                </div>
                              )}
                            </div>
                          )
                        })()}
                        
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <p className="text-xs text-slate-500 mb-1">Client Feedback</p>
                          <p className="text-slate-300 italic">"{project.feedback}"</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Travel & Work Authorization Tab */}
                <TabsContent value="travel" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {engineer.travelPreferences && (
                      <Card className="bg-slate-700/30 border-slate-600">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center space-x-2">
                            <Plane className="h-5 w-5" />
                            <span>Travel Preferences</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Max Travel Distance</span>
                            <span className="text-white">{engineer.travelPreferences.maxTravelDistance} miles</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Willing to Relocate</span>
                            <Badge variant={engineer.travelPreferences.willingToRelocate ? "success" : "secondary"}>
                              {engineer.travelPreferences.willingToRelocate ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Valid Passport</span>
                            <Badge variant={engineer.travelPreferences.hasValidPassport ? "success" : "destructive"}>
                              {engineer.travelPreferences.hasValidPassport ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Max Travel Duration</span>
                            <span className="text-white">{engineer.travelPreferences.maxTravelDuration} days</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {engineer.workAuthorization && (
                      <Card className="bg-slate-700/30 border-slate-600">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center space-x-2">
                            <Shield className="h-5 w-5" />
                            <span>Work Authorization</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-slate-400 mb-2">Authorized Countries</p>
                            <div className="flex flex-wrap gap-1">
                              {engineer.workAuthorization.countries.map((country, i) => (
                                <Badge key={i} variant="outline" className="text-slate-300 border-slate-600">
                                  {country}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Status</span>
                            <Badge className={getVisaStatusColor(engineer.visaStatus)}>
                              {engineer.visaStatus}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Expires</span>
                            <span className="text-white">{engineer.workAuthorization.expirationDate}</span>
                          </div>
                          {engineer.workAuthorization.restrictions.length > 0 && (
                            <div>
                              <p className="text-slate-400 mb-2">Restrictions</p>
                              <div className="space-y-1">
                                {engineer.workAuthorization.restrictions.map((restriction, i) => (
                                  <div key={i} className="flex items-center space-x-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                                    <span className="text-slate-300 text-sm">{restriction}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{performanceMetrics.projectsCompleted}</p>
                        <p className="text-xs text-slate-400">Projects Completed</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardContent className="p-4 text-center">
                        <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{performanceMetrics.onTimeDelivery}%</p>
                        <p className="text-xs text-slate-400">On-Time Delivery</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardContent className="p-4 text-center">
                        <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{performanceMetrics.clientSatisfaction}</p>
                        <p className="text-xs text-slate-400">Client Satisfaction</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardContent className="p-4 text-center">
                        <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">${(performanceMetrics.revenueGenerated / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-slate-400">Revenue Generated</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardContent className="p-4 text-center">
                        <Activity className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{performanceMetrics.billableHours}</p>
                        <p className="text-xs text-slate-400">Billable Hours</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-700/30 border-slate-600">
                      <CardContent className="p-4 text-center">
                        <Target className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{performanceMetrics.utilizationRate}%</p>
                        <p className="text-xs text-slate-400">Utilization Rate</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Footer Actions */}
            <div className="bg-slate-900/50 border-t border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge className={getAvailabilityColor(engineer.availability)} variant="outline">
                    {engineer.availability}
                  </Badge>
                  <span className="text-slate-400 text-sm">
                    Last updated: {new Date().toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    onClick={() => onAssignToProject?.(engineer)}
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Assign to Project
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}