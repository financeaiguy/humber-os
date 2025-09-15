'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Wrench, 
  Zap, 
  GitBranch, 
  Cpu,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

// Engineer categories with icons and colors
const categories = [
  { 
    name: 'Controls', 
    icon: Cpu, 
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    available: 12,
    deployed: 8,
    buffered: 2
  },
  { 
    name: 'Mechanical', 
    icon: Wrench, 
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    available: 15,
    deployed: 10,
    buffered: 3
  },
  { 
    name: 'Electrical', 
    icon: Zap, 
    color: 'from-yellow-500 to-orange-600',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    available: 8,
    deployed: 6,
    buffered: 1
  },
  { 
    name: 'Piping', 
    icon: GitBranch, 
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    available: 10,
    deployed: 7,
    buffered: 2
  },
  { 
    name: 'Robotics', 
    icon: Cpu, 
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    available: 5,
    deployed: 3,
    buffered: 1
  },
]

// Mock data for timesheet reconciliation
const timesheetDiscrepancies = [
  {
    id: 1,
    engineerName: 'John Smith',
    engineerHours: 45,
    customerHours: 40,
    difference: 5,
    weekEnding: '2024-01-12',
    status: 'needs_review',
    customer: 'Tesla Motors'
  },
  {
    id: 2,
    engineerName: 'Sarah Johnson',
    engineerHours: 38,
    customerHours: 42,
    difference: -4,
    weekEnding: '2024-01-12',
    status: 'needs_review',
    customer: 'Ford Manufacturing'
  },
  {
    id: 3,
    engineerName: 'Mike Davis',
    engineerHours: 50,
    customerHours: 50,
    difference: 0,
    weekEnding: '2024-01-12',
    status: 'auto_reconciled',
    customer: 'General Motors'
  },
]

// Mock pipeline data
const pipelineStages = [
  { name: 'Recruit', count: 5, icon: Users },
  { name: 'Hire', count: 3, icon: FileText },
  { name: 'Visa', count: 2, icon: FileText },
  { name: 'Deploy', count: 8, icon: CheckCircle },
]

export default function BullPenDashboard() {
  const [engineerActive, setEngineerActive] = useState(true)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Bull Pen Dashboard</h1>
        <p className="text-slate-400 mt-1">Manage your engineering workforce and operations</p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all cursor-pointer">
              <CardHeader className="pb-2">
                <div className={`inline-flex p-3 rounded-lg ${category.bgColor} border ${category.borderColor} mb-2`}>
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-white">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Available</span>
                    <span className="text-xl font-bold text-white">{category.available}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Deployed</span>
                    <span className="text-sm text-slate-300">{category.deployed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Buffered</span>
                    <span className="text-sm text-slate-300">{category.buffered}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Engineer Profile Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Engineer Profile</CardTitle>
          <CardDescription>View and manage engineer details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <span className="text-white font-bold">JS</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">John Smith</h3>
                    <p className="text-sm text-slate-400">Controls Engineer</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Active</span>
                  <Switch
                    checked={engineerActive}
                    onCheckedChange={setEngineerActive}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">Location:</span>
                  <span className="text-white">Austin, TX</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">Visa Status:</span>
                  <Badge variant="success">H1-B Valid</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">ID Number:</span>
                  <span className="text-white font-mono">ENG-2024-0142</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Deployment History</h4>
              <div className="space-y-2">
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-white">Tesla Gigafactory</p>
                      <p className="text-xs text-slate-400">Jan 2024 - Present</p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-white">Ford Assembly Plant</p>
                      <p className="text-xs text-slate-400">Sep 2023 - Dec 2023</p>
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timesheet Reconciliation Panel */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Timesheet Reconciliation</CardTitle>
              <CardDescription>Review and approve timesheet discrepancies</CardDescription>
            </div>
            <Badge variant="warning" className="text-lg px-3 py-1">
              <AlertCircle className="h-4 w-4 mr-1" />
              2 Pending Review
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timesheetDiscrepancies.map((timesheet) => (
              <div
                key={timesheet.id}
                className={`p-4 rounded-lg border ${
                  timesheet.status === 'needs_review' 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : 'bg-slate-900/50 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-white">{timesheet.engineerName}</h4>
                      <span className="text-xs text-slate-400">|</span>
                      <span className="text-sm text-slate-400">{timesheet.customer}</span>
                      <span className="text-xs text-slate-400">|</span>
                      <span className="text-sm text-slate-400">Week ending {timesheet.weekEnding}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-xs text-slate-400">Employee Hours:</span>
                        <span className="ml-2 font-mono text-white">{timesheet.engineerHours}h</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Customer Hours:</span>
                        <span className="ml-2 font-mono text-white">{timesheet.customerHours}h</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Difference:</span>
                        <span className={`ml-2 font-mono font-bold ${
                          timesheet.difference !== 0 ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {timesheet.difference > 0 ? '+' : ''}{timesheet.difference}h
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {timesheet.status === 'needs_review' ? (
                      <>
                        <Button size="sm" variant="outline">Reject</Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                      </>
                    ) : (
                      <Badge variant="success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Auto-Reconciled
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Operations Pipeline View */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Operations Pipeline</CardTitle>
          <CardDescription>Track engineers through the hiring and deployment process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {pipelineStages.map((stage, index) => (
              <div key={stage.name} className="flex items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                        <stage.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{stage.count}</span>
                      </div>
                    </div>
                    <span className="mt-2 text-sm font-medium text-white">{stage.name}</span>
                  </div>
                </motion.div>
                {index < pipelineStages.length - 1 && (
                  <ChevronRight className="h-8 w-8 text-slate-600 mx-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}