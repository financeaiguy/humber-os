'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Target,
  PlayCircle,
  CheckCircle,
  PauseCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  Users,
  FileText,
  Send,
  Clock,
  TrendingUp,
  Award,
  Settings,
  MessageSquare,
  Phone,
  Video,
  Plus,
  Edit,
  Save,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ProjectActionPanelProps {
  project: any
  onUpdateStatus: (projectId: string, status: string) => void
  onSubmitBid: (projectId: string, bidData: any) => void
  onStartProject: (projectId: string) => void
  onCompleteProject: (projectId: string) => void
}

export default function ProjectActionPanel({ 
  project, 
  onUpdateStatus, 
  onSubmitBid, 
  onStartProject, 
  onCompleteProject 
}: ProjectActionPanelProps) {
  const [activeAction, setActiveAction] = useState('overview')
  const [bidAmount, setBidAmount] = useState('')
  const [bidNotes, setBidNotes] = useState('')

  const getActionsByStatus = (status: string) => {
    switch (status) {
      case 'bidding':
        return [
          { id: 'submit_bid', label: 'Submit Bid', icon: Target, color: 'bg-purple-600 hover:bg-purple-700' },
          { id: 'request_info', label: 'Request Info', icon: MessageSquare, color: 'bg-blue-600 hover:bg-blue-700' },
          { id: 'schedule_meeting', label: 'Schedule Meeting', icon: Calendar, color: 'bg-green-600 hover:bg-green-700' }
        ]
      case 'planning':
        return [
          { id: 'start_project', label: 'Start Project', icon: PlayCircle, color: 'bg-green-600 hover:bg-green-700' },
          { id: 'assign_team', label: 'Assign Team', icon: Users, color: 'bg-blue-600 hover:bg-blue-700' },
          { id: 'create_timeline', label: 'Create Timeline', icon: Calendar, color: 'bg-purple-600 hover:bg-purple-700' }
        ]
      case 'in_progress':
        return [
          { id: 'update_progress', label: 'Update Progress', icon: TrendingUp, color: 'bg-blue-600 hover:bg-blue-700' },
          { id: 'add_milestone', label: 'Add Milestone', icon: Award, color: 'bg-purple-600 hover:bg-purple-700' },
          { id: 'pause_project', label: 'Pause Project', icon: PauseCircle, color: 'bg-orange-600 hover:bg-orange-700' },
          { id: 'complete_project', label: 'Mark Complete', icon: CheckCircle, color: 'bg-green-600 hover:bg-green-700' }
        ]
      case 'completed':
        return [
          { id: 'generate_report', label: 'Generate Report', icon: FileText, color: 'bg-blue-600 hover:bg-blue-700' },
          { id: 'archive_project', label: 'Archive Project', icon: Settings, color: 'bg-slate-600 hover:bg-slate-700' },
          { id: 'client_feedback', label: 'Get Feedback', icon: MessageSquare, color: 'bg-green-600 hover:bg-green-700' }
        ]
      default:
        return []
    }
  }

  const handleActionClick = (actionId: string) => {
    switch (actionId) {
      case 'submit_bid':
        setActiveAction('bidding')
        break
      case 'start_project':
        onStartProject(project.id)
        onUpdateStatus(project.id, 'in_progress')
        break
      case 'complete_project':
        onCompleteProject(project.id)
        onUpdateStatus(project.id, 'completed')
        break
      case 'pause_project':
        onUpdateStatus(project.id, 'on_hold')
        break
      default:
        // SECURITY: console statement removed: console.log('Action clicked:', actionId)
    }
  }

  const handleSubmitBid = () => {
    if (bidAmount && bidNotes) {
      onSubmitBid(project.id, {
        amount: parseFloat(bidAmount),
        notes: bidNotes,
        submittedAt: new Date().toISOString()
      })
      setBidAmount('')
      setBidNotes('')
      setActiveAction('overview')
    }
  }

  const actions = getActionsByStatus(project.status)

  return (
    <div className="space-y-6">
      <Tabs value={activeAction} onValueChange={setActiveAction} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-700/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="bidding">Bidding</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Quick Actions for {project.status.replace('_', ' ')} Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {actions.map((action) => {
                  const IconComponent = action.icon
                  return (
                    <Button
                      key={action.id}
                      onClick={() => handleActionClick(action.id)}
                      className={`${action.color} text-white justify-start h-auto p-4`}
                    >
                      <IconComponent className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">{action.label}</div>
                        <div className="text-xs opacity-80">
                          {action.id === 'submit_bid' && 'Submit your competitive bid'}
                          {action.id === 'start_project' && 'Begin project execution'}
                          {action.id === 'complete_project' && 'Mark project as finished'}
                          {action.id === 'update_progress' && 'Update completion status'}
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Status-specific information */}
          {project.status === 'bidding' && (
            <Card className="bg-purple-900/20 border-purple-600/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Target className="h-6 w-6 text-purple-400" />
                  <div>
                    <h3 className="text-white font-semibold">Bidding Phase</h3>
                    <p className="text-purple-200 text-sm">
                      This project is open for bidding. Submit your competitive proposal to win the contract.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {project.status === 'in_progress' && (
            <Card className="bg-blue-900/20 border-blue-600/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <PlayCircle className="h-6 w-6 text-blue-400" />
                  <div>
                    <h3 className="text-white font-semibold">Project Active</h3>
                    <p className="text-blue-200 text-sm">
                      Project is currently in progress. Monitor milestones and update progress regularly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {actions.map((action) => {
              const IconComponent = action.icon
              return (
                <Card key={action.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${action.color.replace('hover:', '')}`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{action.label}</h3>
                          <p className="text-slate-400 text-sm">
                            {action.id === 'submit_bid' && 'Submit your competitive bid for this project'}
                            {action.id === 'start_project' && 'Begin project execution and assign resources'}
                            {action.id === 'complete_project' && 'Mark project as completed and generate final report'}
                            {action.id === 'update_progress' && 'Update project completion percentage and milestones'}
                            {action.id === 'assign_team' && 'Assign engineers and team members to this project'}
                            {action.id === 'pause_project' && 'Temporarily pause project execution'}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleActionClick(action.id)}
                        className={action.color}
                        size="sm"
                      >
                        Execute
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Bidding Tab */}
        <TabsContent value="bidding" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Submit Bid for {project.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bid Amount ($)
                </label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your bid amount"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Proposal Notes
                </label>
                <textarea
                  value={bidNotes}
                  onChange={(e) => setBidNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your approach, timeline, and key differentiators..."
                />
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Bid Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Project Budget Range</span>
                    <span className="text-white">${(project.budget * 0.8).toLocaleString()} - ${(project.budget * 1.2).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Your Bid</span>
                    <span className="text-white">${bidAmount ? parseFloat(bidAmount).toLocaleString() : '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Competitiveness</span>
                    <span className={`${bidAmount && parseFloat(bidAmount) < project.budget ? 'text-green-400' : 'text-orange-400'}`}>
                      {bidAmount && parseFloat(bidAmount) < project.budget ? 'Competitive' : 'Above Average'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleSubmitBid}
                  disabled={!bidAmount || !bidNotes}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Bid
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveAction('overview')}
                  className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Resource Management */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2" />
                  Resource Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button size="sm" className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Engineers
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Resources
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Budget Tracking
                </Button>
              </CardContent>
            </Card>

            {/* Communication */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Communication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button size="sm" className="w-full justify-start bg-green-600 hover:bg-green-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Team Chat
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                  <Phone className="h-4 w-4 mr-2" />
                  Client Call
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                  <Video className="h-4 w-4 mr-2" />
                  Video Meeting
                </Button>
              </CardContent>
            </Card>

            {/* Progress Tracking */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Progress Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button size="sm" className="w-full justify-start bg-purple-600 hover:bg-purple-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Update Progress
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                  <Award className="h-4 w-4 mr-2" />
                  Add Milestone
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            {/* Quality & Compliance */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Quality & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button size="sm" className="w-full justify-start bg-orange-600 hover:bg-orange-700">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Quality Check
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Compliance Report
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Checkpoint
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
