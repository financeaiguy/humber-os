'use client'

import { useState, useEffect } from 'react'

// export const runtime = 'edge'
import { motion, AnimatePresence } from 'framer-motion'
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
  ChevronRight,
  Plus,
  Calendar,
  DollarSign,
  Plane,
  Clock,
  Target,
  Briefcase,
  Star,
  Award,
  Globe,
  ArrowRight,
  Filter,
  Search,
  X,
  Edit3,
  Save,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { BurnRateWidget } from '@/components/burn-rate-widget'
import { BurnRateCalculator, PurchaseOrder, EngineerTimeEntry } from '@/lib/burn-rate-calculator'
import { ProfitDashboard } from '@/components/profit-dashboard'
import { ShopCharge } from '@/lib/profit-calculator'

// Dynamically import modals with proper configuration
const EngineerAllocationModal = dynamic(() => import('@/components/bull-pen/EngineerAllocationModal'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
})
const FlightBookingModal = dynamic(() => import('@/components/bull-pen/FlightBookingModal'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
})
const ExpenseTrackingModal = dynamic(() => import('@/components/bull-pen/ExpenseTrackingModal'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
})
const EngineerProfileModal = dynamic(() => import('@/components/bull-pen/EngineerProfileModal'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
})

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

// Available engineers with detailed profiles
const availableEngineers = [
  {
    id: 'eng-001',
    name: 'Sarah Chen',
    role: 'Senior Controls Engineer',
    category: 'Controls',
    avatar: 'SC',
    location: 'Austin, TX',
    coordinates: { lat: 30.2672, lng: -97.7431 },
    hourlyRate: 125,
    experience: 8,
    skills: ['PLC Programming', 'SCADA', 'HMI Design', 'Industrial Networks'],
    rating: 4.9,
    availability: 'Available',
    visaStatus: 'H1-B Valid',
    lastProject: 'Tesla Gigafactory Austin',
    preferredProjects: ['Automotive', 'Manufacturing'],
    certifications: ['Rockwell Automation', 'Siemens'],
    languages: ['English', 'Mandarin'],
    travelPreferences: {
      maxTravelDistance: 500, // miles
      willingToRelocate: false,
      hasValidPassport: true,
      preferredProjects: ['domestic'],
      maxTravelDuration: 30 // days
    },
    workAuthorization: {
      countries: ['US'],
      restrictions: ['H1-B sponsor required'],
      expirationDate: '2025-12-31'
    }
  },
  {
    id: 'eng-002',
    name: 'Michael Rodriguez',
    role: 'Mechanical Engineer',
    category: 'Mechanical',
    avatar: 'MR',
    location: 'Detroit, MI',
    coordinates: { lat: 42.3314, lng: -83.0458 },
    hourlyRate: 115,
    experience: 6,
    skills: ['AutoCAD', 'SolidWorks', 'FEA Analysis', 'Process Design'],
    rating: 4.7,
    availability: 'Available',
    visaStatus: 'Green Card',
    lastProject: 'Ford Rouge Plant',
    preferredProjects: ['Automotive', 'Aerospace'],
    certifications: ['PE License', 'Six Sigma Black Belt'],
    languages: ['English', 'Spanish'],
    travelPreferences: {
      maxTravelDistance: 800,
      willingToRelocate: true,
      hasValidPassport: true,
      preferredProjects: ['domestic', 'international'],
      maxTravelDuration: 90
    },
    workAuthorization: {
      countries: ['US', 'CA', 'MX'],
      restrictions: [],
      expirationDate: 'permanent'
    }
  },
  {
    id: 'eng-003',
    name: 'Priya Patel',
    role: 'Electrical Engineer',
    category: 'Electrical',
    avatar: 'PP',
    location: 'San Jose, CA',
    hourlyRate: 130,
    experience: 10,
    skills: ['Power Systems', 'Motor Controls', 'VFDs', 'Panel Design'],
    rating: 4.8,
    availability: 'On Project',
    visaStatus: 'Citizen',
    lastProject: 'Apple Park Data Center',
    preferredProjects: ['Tech', 'Manufacturing'],
    certifications: ['IEEE Member', 'NECA Certified'],
    languages: ['English', 'Hindi', 'Gujarati']
  },
  {
    id: 'eng-004',
    name: 'David Kim',
    role: 'Robotics Engineer',
    category: 'Robotics',
    avatar: 'DK',
    location: 'Seattle, WA',
    hourlyRate: 140,
    experience: 12,
    skills: ['ROS', 'Python', 'Computer Vision', 'Machine Learning'],
    rating: 4.9,
    availability: 'Available',
    visaStatus: 'H1-B Valid',
    lastProject: 'Amazon Fulfillment Center',
    preferredProjects: ['Robotics', 'Automation'],
    certifications: ['AWS Certified', 'ROS Industrial'],
    languages: ['English', 'Korean']
  }
]

// Mock Purchase Order Data
const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-001',
    poNumber: 'PO-2024-GM-001',
    clientName: 'General Motors',
    projectName: 'GM Ultium Battery Plant',
    totalBudget: 500000,
    allocatedHours: 4000,
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    projectId: 'proj-001',
    status: 'active'
  },
  {
    id: 'po-002',
    poNumber: 'PO-2024-FORD-002',
    clientName: 'Ford Motor Company',
    projectName: 'Ford F-150 Lightning Assembly',
    totalBudget: 750000,
    allocatedHours: 6000,
    startDate: '2024-01-15',
    endDate: '2024-07-15',
    projectId: 'proj-002',
    status: 'active'
  },
  {
    id: 'po-003',
    poNumber: 'PO-2024-TESLA-003',
    clientName: 'Tesla',
    projectName: 'Tesla Model Y Line Expansion',
    totalBudget: 300000,
    allocatedHours: 2400,
    startDate: '2024-02-01',
    endDate: '2024-05-31',
    projectId: 'proj-003',
    status: 'at_risk'
  }
]

// Mock Shop Charges Data
const mockShopCharges: ShopCharge[] = [
  // GM Project Shop Charges
  {
    id: 'shop-gm-001',
    poId: 'po-001',
    category: 'materials',
    description: 'Electrical components and wiring',
    amount: 12500,
    date: new Date(2024, 0, 15).toISOString(),
    approved: true
  },
  {
    id: 'shop-gm-002',
    poId: 'po-001',
    category: 'equipment',
    description: 'Robotic arm rental',
    amount: 8000,
    date: new Date(2024, 0, 20).toISOString(),
    approved: true
  },
  {
    id: 'shop-gm-003',
    poId: 'po-001',
    category: 'tooling',
    description: 'Specialized tooling for battery assembly',
    amount: 5500,
    date: new Date(2024, 1, 1).toISOString(),
    approved: true
  },
  // Ford Project Shop Charges
  {
    id: 'shop-ford-001',
    poId: 'po-002',
    category: 'materials',
    description: 'Steel and aluminum materials',
    amount: 18000,
    date: new Date(2024, 0, 25).toISOString(),
    approved: true
  },
  {
    id: 'shop-ford-002',
    poId: 'po-002',
    category: 'equipment',
    description: 'CNC machine time',
    amount: 12000,
    date: new Date(2024, 1, 5).toISOString(),
    approved: true
  },
  {
    id: 'shop-ford-003',
    poId: 'po-002',
    category: 'utilities',
    description: 'Power and compressed air usage',
    amount: 3500,
    date: new Date(2024, 1, 10).toISOString(),
    approved: true
  },
  // Tesla Project Shop Charges
  {
    id: 'shop-tesla-001',
    poId: 'po-003',
    category: 'materials',
    description: 'High-voltage electrical systems',
    amount: 25000,
    date: new Date(2024, 1, 15).toISOString(),
    approved: true
  },
  {
    id: 'shop-tesla-002',
    poId: 'po-003',
    category: 'equipment',
    description: 'Testing equipment rental',
    amount: 15000,
    date: new Date(2024, 1, 20).toISOString(),
    approved: true
  },
  {
    id: 'shop-tesla-003',
    poId: 'po-003',
    category: 'consumables',
    description: 'Welding consumables and safety equipment',
    amount: 4500,
    date: new Date(2024, 2, 1).toISOString(),
    approved: true
  }
]

// Mock Expenses Data
const mockExpenses = [
  { id: 'exp-001', poId: 'po-001', amount: 2500, category: 'travel', date: new Date(2024, 0, 10).toISOString() },
  { id: 'exp-002', poId: 'po-001', amount: 1800, category: 'meals', date: new Date(2024, 0, 15).toISOString() },
  { id: 'exp-003', poId: 'po-002', amount: 3200, category: 'travel', date: new Date(2024, 0, 20).toISOString() },
  { id: 'exp-004', poId: 'po-002', amount: 950, category: 'meals', date: new Date(2024, 0, 25).toISOString() },
  { id: 'exp-005', poId: 'po-003', amount: 4500, category: 'travel', date: new Date(2024, 1, 5).toISOString() },
  { id: 'exp-006', poId: 'po-003', amount: 1200, category: 'lodging', date: new Date(2024, 1, 10).toISOString() },
]

// Mock Time Entry Data
const mockTimeEntries: EngineerTimeEntry[] = [
  // GM Project Time Entries
  ...Array.from({ length: 50 }, (_, i) => {
    const engineer = availableEngineers[i % availableEngineers.length] || availableEngineers[0]
    return {
      id: `time-gm-${i}`,
      engineerId: engineer?.id || 'unknown',
      engineerName: engineer?.name || 'Unknown Engineer',
      poId: 'po-001',
      projectId: 'proj-001',
      hours: 8 + Math.random() * 4,
      date: new Date(2024, 0, 1 + i * 2).toISOString(),
      rate: engineer?.hourlyRate || 100,
      approved: true
    }
  }),
  // Ford Project Time Entries
  ...Array.from({ length: 80 }, (_, i) => {
    const engineer = availableEngineers[i % availableEngineers.length] || availableEngineers[0]
    return {
      id: `time-ford-${i}`,
      engineerId: engineer?.id || 'unknown',
      engineerName: engineer?.name || 'Unknown Engineer',
      poId: 'po-002',
      projectId: 'proj-002',
      hours: 7 + Math.random() * 5,
      date: new Date(2024, 0, 15 + i).toISOString(),
      rate: engineer?.hourlyRate || 100,
      approved: true
    }
  }),
  // Tesla Project Time Entries (high burn rate)
  ...Array.from({ length: 60 }, (_, i) => {
    const engineer = availableEngineers[i % availableEngineers.length] || availableEngineers[0]
    return {
      id: `time-tesla-${i}`,
      engineerId: engineer?.id || 'unknown',
      engineerName: engineer?.name || 'Unknown Engineer',
      poId: 'po-003',
      projectId: 'proj-003',
      hours: 10 + Math.random() * 4,
      date: new Date(2024, 1, 1 + i).toISOString(),
      rate: engineer?.hourlyRate || 100,
      approved: true
    }
  })
]

// Active projects with resource needs
const activeProjects = [
  {
    id: 'proj-001',
    name: 'Tesla Model Y Line Expansion',
    client: 'Tesla Motors',
    location: 'Austin, TX',
    startDate: '2024-02-01',
    endDate: '2024-08-15',
    budget: 2500000,
    spent: 1200000,
    urgency: 'High',
    engineersNeeded: {
      Controls: 3,
      Mechanical: 2,
      Electrical: 2,
      Robotics: 1
    },
    currentEngineers: ['eng-001'],
    status: 'Active',
    progress: 45,
    travelRequired: true,
    housingProvided: true
  },
  {
    id: 'proj-002',
    name: 'Ford F-150 Lightning Assembly',
    client: 'Ford Motor Company',
    location: 'Dearborn, MI',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    budget: 4200000,
    spent: 800000,
    urgency: 'Medium',
    engineersNeeded: {
      Controls: 4,
      Mechanical: 5,
      Electrical: 3,
      Piping: 2
    },
    currentEngineers: ['eng-002'],
    status: 'Ramping Up',
    progress: 20,
    travelRequired: true,
    housingProvided: false
  },
  {
    id: 'proj-003',
    name: 'GM Ultium Battery Plant',
    client: 'General Motors',
    location: 'Warren, OH',
    startDate: '2024-03-01',
    endDate: '2024-11-30',
    budget: 3800000,
    spent: 450000,
    urgency: 'Medium',
    engineersNeeded: {
      Controls: 2,
      Electrical: 4,
      Mechanical: 3,
      Robotics: 2
    },
    currentEngineers: [],
    status: 'Planning',
    progress: 5,
    travelRequired: true,
    housingProvided: true
  }
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
  const [activeView, setActiveView] = useState<'engineers' | 'projects' | 'allocation'>('engineers')
  const [selectedEngineer, setSelectedEngineer] = useState<typeof availableEngineers[0] | null>(null)
  const [selectedProject, setSelectedProject] = useState<typeof activeProjects[0] | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('All')
  const [showAllocationModal, setShowAllocationModal] = useState(false)
  const [showFlightModal, setShowFlightModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [engineerActive, setEngineerActive] = useState(true)

  const filteredEngineers = availableEngineers.filter(engineer => {
    const matchesSearch = engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         engineer.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         engineer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === 'All' || engineer.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Resource Allocation Hub</h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Mix and match engineers for projects • Manage travel and expenses</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={() => setShowFlightModal(true)}
            className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
          >
            <Plane className="h-4 w-4 mr-2" />
            <span className="sm:inline">Book Travel</span>
          </Button>
          <Button
            onClick={() => setShowExpenseModal(true)}
            className="bg-green-500 hover:bg-green-600 w-full sm:w-auto"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            <span className="sm:inline">Track Expenses</span>
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center space-x-1 bg-slate-800/50 backdrop-blur-xl rounded-xl p-1 w-full sm:w-fit overflow-x-auto">
        <button
          onClick={() => setActiveView('engineers')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
            activeView === 'engineers'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Engineers</span>
        </button>
        <button
          onClick={() => setActiveView('projects')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
            activeView === 'projects'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Projects</span>
        </button>
        <button
          onClick={() => setActiveView('allocation')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
            activeView === 'allocation'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Target className="h-4 w-4" />
          <span>Allocation Matrix</span>
        </button>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
              onClick={() => setFilterCategory(category.name)}
            >
              <CardHeader className="pb-2">
                <div className={`inline-flex p-3 rounded-lg ${category.bgColor} border ${category.borderColor} mb-2`}>
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-white">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Available</span>
                    <span className="text-xl font-bold text-white">{category.available}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Deployed</span>
                    <span className="text-sm text-slate-200">{category.deployed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Buffered</span>
                    <span className="text-sm text-slate-200">{category.buffered}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Dynamic Content Based on Active View */}
      <AnimatePresence mode="wait">
        {activeView === 'engineers' && (
          <motion.div
            key="engineers"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Search and Filter Bar */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search engineers, skills, or projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Engineer Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredEngineers.map((engineer, index) => (
                <motion.div
                  key={engineer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card 
                    className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300 cursor-pointer h-full"
                    onClick={() => {
                      setSelectedEngineer(engineer)
                      setShowProfileModal(true)
                    }}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{engineer.avatar}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-lg">{engineer.name}</h3>
                            <p className="text-sm text-slate-400">{engineer.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-white">{engineer.rating}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-300">{engineer.location}</span>
                        </div>
                        <Badge 
                          variant={engineer.availability === 'Available' ? 'success' : 'secondary'}
                          className="text-xs"
                        >
                          {engineer.availability}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-medium text-white">${engineer.hourlyRate}/hr</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-slate-300">{engineer.experience}y exp</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400 font-medium mb-2">Key Skills:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {engineer.skills.slice(0, 3).map((skill, i) => (
                            <Badge 
                              key={i} 
                              variant="outline" 
                              className="text-xs text-slate-200 bg-slate-700/50 border-slate-600 hover:bg-slate-700 transition-colors"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {engineer.skills.length > 3 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs text-slate-200 bg-slate-700/50 border-slate-600 hover:bg-slate-700 transition-colors"
                            >
                              +{engineer.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-4">
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-500 hover:bg-blue-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEngineer(engineer)
                            setShowAllocationModal(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Assign to Project
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEngineer(engineer)
                            setShowProfileModal(true)
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeView === 'projects' && (
          <motion.div
            key="projects"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                          <p className="text-slate-400">{project.client}</p>
                        </div>
                        <Badge 
                          variant={
                            project.urgency === 'High' ? 'destructive' :
                            project.urgency === 'Medium' ? 'warning' : 'success'
                          }
                        >
                          {project.urgency} Priority
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-300">{project.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-300">
                            {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Budget</p>
                          <p className="text-lg font-semibold text-white">
                            ${(project.budget / 1000000).toFixed(1)}M
                          </p>
                          <p className="text-xs text-slate-400">
                            ${(project.spent / 1000000).toFixed(1)}M spent ({((project.spent / project.budget) * 100).toFixed(0)}%)
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Progress</p>
                          <p className="text-lg font-semibold text-white">{project.progress}%</p>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-2">Engineers Needed:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(project.engineersNeeded).map(([category, count]) => (
                            <div key={category} className="flex justify-between items-center p-2 bg-slate-900/50 rounded">
                              <span className="text-sm text-slate-300">{category}</span>
                              <Badge variant="outline">{count}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {project.travelRequired && (
                          <Badge variant="outline" className="text-xs">
                            <Plane className="h-3 w-3 mr-1" />
                            Travel Required
                          </Badge>
                        )}
                        {project.housingProvided && (
                          <Badge variant="outline" className="text-xs">
                            Housing Provided
                          </Badge>
                        )}
                      </div>

                      <Button
                        className="w-full bg-green-500 hover:bg-green-600"
                        onClick={() => {
                          setSelectedProject(project)
                          setShowAllocationModal(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Staff Project
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeView === 'allocation' && (
          <motion.div
            key="allocation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl">Resource Allocation Matrix</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Real-time view of engineer-project assignments</CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-3 text-slate-300">Engineer</th>
                        <th className="text-left p-3 text-slate-300">Current Project</th>
                        <th className="text-left p-3 text-slate-300">End Date</th>
                        <th className="text-left p-3 text-slate-300">Next Available</th>
                        <th className="text-left p-3 text-slate-300">Rate</th>
                        <th className="text-left p-3 text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableEngineers.map((engineer) => {
                        const currentProject = activeProjects.find(p => p.currentEngineers.includes(engineer.id))
                        return (
                          <tr key={engineer.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                            <td className="p-3">
                              <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">{engineer.avatar}</span>
                                </div>
                                <div>
                                  <p className="font-medium text-white">{engineer.name}</p>
                                  <p className="text-xs text-slate-400">{engineer.category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              {currentProject ? (
                                <div>
                                  <p className="text-sm font-medium text-white">{currentProject.name}</p>
                                  <p className="text-xs text-slate-400">{currentProject.client}</p>
                                </div>
                              ) : (
                                <Badge variant="success">Available</Badge>
                              )}
                            </td>
                            <td className="p-3">
                              <span className="text-sm text-slate-300">
                                {currentProject ? new Date(currentProject.endDate).toLocaleDateString() : '-'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-sm text-slate-300">
                                {currentProject ? new Date(currentProject.endDate).toLocaleDateString() : 'Now'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-sm font-medium text-green-400">${engineer.hourlyRate}/hr</span>
                            </td>
                            <td className="p-3">
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedEngineer(engineer)
                                    setShowAllocationModal(true)
                                  }}
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-blue-500 hover:bg-blue-600"
                                  onClick={() => setShowFlightModal(true)}
                                >
                                  <Plane className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deployment Readiness Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Deployment Readiness Dashboard</h2>
          <Badge variant="outline" className="text-green-400 border-green-400">
            80% Complete
          </Badge>
        </div>

        {/* Pre-deployment Checklist */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Pre-Deployment Checklist</CardTitle>
            <CardDescription>Complete all items before engineer deployment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: 'tools', label: 'Tool Certification', completed: true, priority: 'medium' },
                { id: 'travel', label: 'Travel Arrangements', completed: true, priority: 'high' },
                { id: 'housing', label: 'Housing Confirmation', completed: true, priority: 'medium' },
                { id: 'credentials', label: 'Site Credentials', completed: false, priority: 'high' },
                { id: 'insurance', label: 'Insurance Verification', completed: false, priority: 'medium' }
              ].map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    item.completed 
                      ? 'bg-green-900/20 border-green-500/30 line-through opacity-60' 
                      : 'bg-slate-700/50 border-slate-600 hover:border-blue-500/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {item.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className={`h-5 w-5 ${item.priority === 'high' ? 'text-red-400' : 'text-yellow-400'}`} />
                    )}
                    <span className={`font-medium ${item.completed ? 'text-slate-400' : 'text-white'}`}>
                      {item.label}
                    </span>
                  </div>
                  <Badge variant={item.priority === 'high' ? 'destructive' : 'warning'} className="text-xs">
                    {item.priority}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Deployment Progress Bar */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Target className="h-8 w-8 text-blue-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">Deployment Readiness</h3>
                  <p className="text-slate-400">Overall progress to go-live</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">80%</div>
                <p className="text-sm text-slate-400">4 of 5 complete</p>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '80%' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Project Management Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              id: 'resource-allocation',
              title: 'Resource Allocation',
              description: 'Manage engineer assignments',
              icon: Users,
              color: 'from-blue-500 to-cyan-600',
              bgColor: 'bg-blue-500/20',
              borderColor: 'border-blue-500/30',
              action: () => setActiveView('allocation'),
              isExternal: false
            },
            {
              id: 'project-dashboard',
              title: 'Project Dashboard',
              description: 'Full project management suite',
              icon: Target,
              color: 'from-green-500 to-emerald-600',
              bgColor: 'bg-green-500/20',
              borderColor: 'border-green-500/30',
              href: '/projects',
              isExternal: true
            },
            {
              id: 'travel-booking',
              title: 'Travel & Expenses',
              description: 'Book flights and track costs',
              icon: Plane,
              color: 'from-purple-500 to-pink-600',
              bgColor: 'bg-purple-500/20',
              borderColor: 'border-purple-500/30',
              action: () => setShowFlightModal(true),
              isExternal: false
            },
            {
              id: 'engineer-profiles',
              title: 'Engineer Profiles',
              description: 'View skills and availability',
              icon: Award,
              color: 'from-yellow-500 to-orange-600',
              bgColor: 'bg-yellow-500/20',
              borderColor: 'border-yellow-500/30',
              action: () => setActiveView('engineers'),
              isExternal: false
            }
          ].map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {card.isExternal ? (
                <Link href={card.href!} className="block h-full">
                  <Card className={`bg-slate-800/50 border-slate-700 hover:${card.borderColor} transition-all duration-300 cursor-pointer group h-full`}>
                    <CardContent className="p-6 text-center space-y-4">
                      <div className={`inline-flex p-4 rounded-xl ${card.bgColor} border ${card.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                        <card.icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{card.description}</p>
                      </div>
                      <div className="flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors">
                        <span className="text-sm font-medium">Open</span>
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card 
                  className={`bg-slate-800/50 border-slate-700 hover:${card.borderColor} transition-all duration-300 cursor-pointer group h-full`}
                  onClick={card.action}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`inline-flex p-4 rounded-xl ${card.bgColor} border ${card.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                      <card.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{card.description}</p>
                    </div>
                    <div className="flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors">
                      <span className="text-sm font-medium">Open</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ))}
        </div>

        {/* Live Project Status Integration */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-blue-800/20 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse" />
                  <span>Live Project Status</span>
                </CardTitle>
                <CardDescription>Real-time updates from your project management system</CardDescription>
              </div>
              <Link href="/projects">
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                  <Briefcase className="h-4 w-4 mr-1" />
                  View All Projects
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeProjects.slice(0, 3).map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${
                        project.urgency === 'High' ? 'bg-red-400' :
                        project.urgency === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'
                      }`} />
                      <span className="text-sm font-medium text-white truncate">{project.client}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {project.status}
                    </Badge>
                  </div>
                  <h4 className="text-white font-medium text-sm mb-2 line-clamp-2">{project.name}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Progress</span>
                      <span className="text-xs font-medium text-white">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          project.urgency === 'High' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                          project.urgency === 'Medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          'bg-gradient-to-r from-green-500 to-blue-500'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Budget Used</span>
                      <span className="text-xs font-medium text-white">
                        {((project.spent / project.budget) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-400">
                          {Object.values(project.engineersNeeded).reduce((a, b) => a + b, 0)} needed
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedProject(project)
                          setShowAllocationModal(true)
                        }}
                        className="text-xs px-2 py-1 h-auto"
                      >
                        Staff
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Burn Rate Tracking Section */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-orange-400" />
                  <span>Purchase Order Burn Rate</span>
                </CardTitle>
                <CardDescription>Real-time tracking of PO utilization and projections</CardDescription>
              </div>
              <Link href="/projects">
                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  View All POs
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockPurchaseOrders.map(po => {
                const poTimeEntries = mockTimeEntries.filter(entry => 
                  entry.poId === po.id
                )
                
                return (
                  <motion.div
                    key={po.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden hover:border-blue-500/50 transition-all"
                  >
                    <div className="p-4 border-b border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">
                          {po.clientName}
                        </h3>
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${po.status === 'active' 
                            ? 'bg-green-900/50 text-green-400 border border-green-500/30' 
                            : po.status === 'at_risk'
                            ? 'bg-red-900/50 text-red-400 border border-red-500/30'
                            : 'bg-gray-900/50 text-gray-400 border border-gray-500/30'
                          }
                        `}>
                          {po.status === 'at_risk' ? 'At Risk' : po.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">
                        {po.poNumber} • {po.projectName}
                      </p>
                    </div>
                    
                    <BurnRateWidget
                      purchaseOrder={po}
                      timeEntries={poTimeEntries}
                      compact={true}
                      showDetails={false}
                      onAlertClick={(alert) => {
                        // SECURITY: console statement removed: console.log('Alert clicked:', alert)
                        // Handle alert click - could open modal or navigate to details
                      }}
                    />
                    
                    <div className="px-4 py-3 bg-slate-900/30 border-t border-slate-700">
                      <button className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        View Detailed Analysis →
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
            
            {mockPurchaseOrders.length === 0 && (
              <div className="bg-slate-900/30 rounded-lg p-8 text-center">
                <p className="text-slate-400">
                  No active purchase orders to track
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profit & Cost Analysis Dashboard */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <span>Profit & Cost Analysis</span>
                </CardTitle>
                <CardDescription>Business profitability metrics with shop floor and manpower breakdown</CardDescription>
              </div>
              <Badge className="bg-green-500/20 text-green-400">
                Live Metrics
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ProfitDashboard 
              purchaseOrders={mockPurchaseOrders}
              timeEntries={mockTimeEntries}
              shopCharges={mockShopCharges}
              expenses={mockExpenses}
            />
          </CardContent>
        </Card>

        {/* Quick Actions Bar */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                <div className="h-6 w-px bg-slate-600" />
                <span className="text-sm text-slate-400">Streamline your workflow</span>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  size="sm"
                  onClick={() => setShowAllocationModal(true)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Assignment
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowFlightModal(true)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Plane className="h-4 w-4 mr-1" />
                  Book Travel
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowExpenseModal(true)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Add Expense
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modals */}
      <EngineerAllocationModal
        isOpen={showAllocationModal}
        onClose={() => {
          setShowAllocationModal(false)
          setSelectedEngineer(null)
          setSelectedProject(null)
        }}
        selectedEngineer={selectedEngineer}
        selectedProject={selectedProject}
        availableEngineers={availableEngineers}
        activeProjects={activeProjects}
      />

      <FlightBookingModal
        isOpen={showFlightModal}
        onClose={() => setShowFlightModal(false)}
        selectedEngineer={selectedEngineer}
      />

      <ExpenseTrackingModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        selectedEngineer={selectedEngineer}
        selectedProject={selectedProject}
        currentProjectPO={selectedProject ? 
          mockPurchaseOrders.find(po => po.projectId === selectedProject.id.toString()) || null : 
          null
        }
        projectTimeEntries={selectedProject ? 
          mockTimeEntries.filter(entry => entry.projectId === selectedProject.id.toString()) : 
          []
        }
      />

      <EngineerProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false)
          setSelectedEngineer(null)
        }}
        engineer={selectedEngineer}
        onAssignToProject={(engineer) => {
          setShowProfileModal(false)
          setSelectedEngineer(engineer as any)
          setShowAllocationModal(true)
        }}
        onMessage={(engineer) => {
          // Handle message functionality
          // SECURITY: console statement removed: console.log('Message engineer:', engineer.name)
        }}
        onVideoCall={(engineer) => {
          // Handle video call functionality
          // SECURITY: console statement removed: console.log('Video call engineer:', engineer.name)
        }}
        currentProjectPO={selectedEngineer && selectedEngineer.availability === 'On Project' ? 
          mockPurchaseOrders.find(po => 
            activeProjects.find(p => p.currentEngineers.includes(selectedEngineer.id) && p.id === po.projectId)
          ) || null : 
          null
        }
        engineerTimeEntries={selectedEngineer ? 
          mockTimeEntries.filter(entry => entry.engineerId === selectedEngineer.id) : 
          []
        }
      />
    </div>
  )
}