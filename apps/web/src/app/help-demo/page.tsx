'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  Users, 
  DollarSign, 
  FileText, 
  MessageCircle,
  Shield,
  BarChart3,
  Settings,
  Play
} from 'lucide-react'
import { SmartTooltip, HelpButton, FeatureIntro } from '@/components/ui/smart-tooltip'
import { HelpCenter } from '@/components/help-center'
import { UserRole } from '@humber/types'
import { useWalkthrough } from '@/lib/walkthrough-manager'

export default function HelpDemoPage() {
  const [userRole, setUserRole] = useState<UserRole>('NEW_USER')
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [showFeatureIntro, setShowFeatureIntro] = useState(false)
  const { startWalkthrough } = useWalkthrough()

  const demoFeatures = [
    {
      icon: Clock,
      title: 'Time Tracking',
      description: 'Clock in and out with biometric verification',
      tooltipContent: 'Use your fingerprint or face scan to track work hours. It\'s like unlocking your phone but for work! The system automatically knows if you\'re at the right location.',
      role: 'ENGINEER' as UserRole,
      difficulty: 'BEGINNER'
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Manage engineers and deployments',
      tooltipContent: 'The Bull Pen shows all your engineers like a sports team roster. Green means available, yellow means busy, red means unavailable. Click to deploy them to projects!',
      role: 'MANAGER' as UserRole,
      difficulty: 'INTERMEDIATE'
    },
    {
      icon: DollarSign,
      title: 'Financial Reports',
      description: 'Generate revenue and cost analysis',
      tooltipContent: 'Create beautiful PDF reports automatically. Choose your date range, select report type, and click generate. The system does all the math and formatting for you!',
      role: 'ACCOUNTANT' as UserRole,
      difficulty: 'BEGINNER'
    },
    {
      icon: FileText,
      title: 'Document Upload',
      description: 'Add files to the knowledge base',
      tooltipContent: 'Drag and drop your company documents here. The AI will read them and can answer questions about them later. It\'s like having a super-smart filing cabinet!',
      role: 'MANAGER' as UserRole,
      difficulty: 'BEGINNER'
    },
    {
      icon: MessageCircle,
      title: 'AI Chat Assistant',
      description: 'Get help from your intelligent helper',
      tooltipContent: 'Ask questions in plain English! "How many hours did John work?" or "What are our safety protocols?" The AI knows everything about your company.',
      role: 'NEW_USER' as UserRole,
      difficulty: 'BEGINNER'
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'Understand system security features',
      tooltipContent: 'All actions are logged for legal compliance. Biometric verification prevents fraud. Location tracking ensures accurate billing. It\'s like having a security guard for your data!',
      role: 'ADMIN' as UserRole,
      difficulty: 'INTERMEDIATE'
    }
  ]

  const roleColors = {
    'NEW_USER': 'from-blue-500 to-cyan-500',
    'ENGINEER': 'from-green-500 to-emerald-500',
    'MANAGER': 'from-purple-500 to-violet-500',
    'RECRUITER': 'from-orange-500 to-amber-500',
    'ACCOUNTANT': 'from-red-500 to-rose-500',
    'ADMIN': 'from-gray-500 to-slate-500',
    'CLIENT': 'from-indigo-500 to-blue-500',
    'VIEWER': 'from-gray-400 to-gray-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎓 Interactive Help System Demo
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Experience our intelligent tooltip and walkthrough system designed for 9th-grade simplicity
          </p>
          
          {/* Role Selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <span className="text-sm text-slate-400 mr-4">Select your role:</span>
            {Object.keys(roleColors).map(role => (
              <button
                key={role}
                onClick={() => setUserRole(role as UserRole)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${userRole === role 
                    ? `bg-gradient-to-r ${roleColors[role as UserRole]} text-white` 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }
                `}
              >
                {role.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {demoFeatures.map((feature, index) => (
            <SmartTooltip
              key={feature.title}
              id={`demo-${feature.title.toLowerCase().replace(' ', '-')}`}
              title={`${feature.title} (${feature.difficulty})`}
              content={feature.tooltipContent}
              type="FEATURE"
              placement="TOP"
              userRole={userRole}
              trigger="hover"
              hasAction={true}
              actionText="Start Tutorial"
              onAction={() => {
                if (feature.title === 'Time Tracking') startWalkthrough?.('TIMESHEET')
                else if (feature.title === 'Team Management') startWalkthrough?.('DASHBOARD_TOUR')
                else if (feature.title === 'Financial Reports') startWalkthrough?.('REPORTING')
                else if (feature.title === 'Document Upload') startWalkthrough?.('DOCUMENT_UPLOAD')
                else if (feature.title === 'AI Chat Assistant') startWalkthrough?.('CHAT_ASSISTANCE')
                else setShowFeatureIntro(true)
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  p-6 rounded-xl border border-slate-600/50 backdrop-blur-xl cursor-pointer
                  transition-all duration-300 hover:scale-105 hover:border-slate-500
                  ${userRole === feature.role || userRole === 'NEW_USER'
                    ? 'bg-slate-700/50 hover:bg-slate-700/70' 
                    : 'bg-slate-800/30 opacity-60'
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`
                    p-3 rounded-lg bg-gradient-to-r ${roleColors[feature.role]}
                  `}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                      {feature.difficulty}
                    </span>
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Role indicator */}
                <div className="mt-4 pt-4 border-t border-slate-600/50">
                  <span className="text-xs text-slate-400">
                    Best for: <span className="text-slate-300">{feature.role.replace('_', ' ')}</span>
                  </span>
                </div>
              </motion.div>
            </SmartTooltip>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Open Help Center
          </button>
          
          <button
            onClick={() => startWalkthrough?.('ONBOARDING')}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <Play className="w-5 h-5" />
            Start Onboarding Tour
          </button>
          
          <button
            onClick={() => setShowFeatureIntro(true)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            Feature Introduction
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-slate-600/50">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            🎯 How to Test the Help System
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">📱 Interactive Elements</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <strong>Hover</strong> over any feature card to see smart tooltips
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <strong>Click</strong> "Start Tutorial" in tooltips for guided tours
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <strong>Press F1</strong> or click help button for assistance
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <strong>Change roles</strong> to see different help content
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">🧠 Smart Features</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <strong>Role-based content</strong> - Only see relevant help
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <strong>Progress tracking</strong> - System remembers what you've learned
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <strong>Contextual help</strong> - Different help for each page
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <strong>9th-grade language</strong> - Simple explanations for everything
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-blue-200 text-center">
              <strong>💡 Pro Tip:</strong> The help system learns from your role and shows only relevant information. 
              New users get more detailed explanations, while experienced users get quick tips!
            </p>
          </div>
        </div>

        {/* Simple Tooltip Examples */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            🎨 Tooltip Examples by User Role
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Engineer Example */}
            <SmartTooltip
              id="engineer-example"
              title="⏰ For Engineers"
              content="This button starts your work timer. Just like clocking in at any job, but with fingerprint security to make sure it's really you!"
              type="PROCESS"
              placement="TOP"
              userRole="ENGINEER"
              hasAction={true}
              actionText="Learn More"
              onAction={() => startWalkthrough?.('TIMESHEET')}
            >
              <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-center cursor-pointer hover:bg-green-500/30 transition-colors">
                <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-white font-medium">Clock In</p>
                <p className="text-xs text-green-300">Hover me!</p>
              </div>
            </SmartTooltip>

            {/* Manager Example */}
            <SmartTooltip
              id="manager-example"
              title="👥 For Managers"
              content="The Bull Pen shows your team like a sports roster. See who's available (green), busy (yellow), or deployed (blue). Click an engineer to assign them to projects!"
              type="FEATURE"
              placement="TOP"
              userRole="MANAGER"
              hasAction={true}
              actionText="Take Tour"
              onAction={() => startWalkthrough?.('DASHBOARD_TOUR')}
            >
              <div className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg text-center cursor-pointer hover:bg-purple-500/30 transition-colors">
                <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-white font-medium">Team View</p>
                <p className="text-xs text-purple-300">Hover me!</p>
              </div>
            </SmartTooltip>

            {/* Accountant Example */}
            <SmartTooltip
              id="accountant-example"
              title="💰 For Accountants"
              content="Generate professional financial reports with one click! Choose timesheet summary, profit analysis, or client billing. The system creates beautiful PDFs automatically."
              type="PROCESS"
              placement="TOP"
              userRole="ACCOUNTANT"
              hasAction={true}
              actionText="Learn Reports"
              onAction={() => startWalkthrough?.('REPORTING')}
            >
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-center cursor-pointer hover:bg-red-500/30 transition-colors">
                <DollarSign className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-white font-medium">Reports</p>
                <p className="text-xs text-red-300">Hover me!</p>
              </div>
            </SmartTooltip>

            {/* New User Example */}
            <SmartTooltip
              id="new-user-example"
              title="🤖 For Everyone"
              content="Your AI assistant knows everything about the company! Ask questions like 'How do I submit my timesheet?' or 'What are our safety rules?' It's like having a super-smart coworker!"
              type="HELP"
              placement="TOP"
              userRole="NEW_USER"
              hasAction={true}
              actionText="Try Chat"
              onAction={() => startWalkthrough?.('CHAT_ASSISTANCE')}
            >
              <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg text-center cursor-pointer hover:bg-blue-500/30 transition-colors">
                <MessageCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-white font-medium">AI Chat</p>
                <p className="text-xs text-blue-300">Hover me!</p>
              </div>
            </SmartTooltip>
          </div>
        </div>

        {/* Simple Language Examples */}
        <div className="mt-12 bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-slate-600/50">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            🗣️ Simple Language Examples
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">❌ Complex Technical Terms</h3>
              <div className="space-y-3">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-300 text-sm">"Implement biometric authentication protocols"</p>
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-300 text-sm">"Execute timesheet reconciliation procedures"</p>
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-300 text-sm">"Configure multi-tenant RAG architecture"</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">✅ 9th Grade Simple</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-300 text-sm">"Use your fingerprint to clock in - like unlocking your phone!"</p>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-300 text-sm">"Check if engineer hours match client hours - like balancing a checkbook"</p>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-300 text-sm">"Upload documents so the AI can read them and answer questions"</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Button Examples */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">
            🔘 Interactive Help Buttons
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 p-4 bg-slate-700/30 rounded-lg">
              <span className="text-white">Time Tracking</span>
              <HelpButton 
                content="Clock in when you start work, clock out when you finish. The system uses your fingerprint or face scan to make sure it's really you - just like unlocking your phone!"
                title="⏰ Time Tracking Help"
                placement="TOP"
              />
            </div>
            
            <div className="flex items-center gap-2 p-4 bg-slate-700/30 rounded-lg">
              <span className="text-white">Bull Pen</span>
              <HelpButton 
                content="Think of this like a sports team roster. Green players are available, yellow are busy, blue are deployed to games (projects). Click to assign them!"
                title="🏟️ Bull Pen Explained"
                placement="TOP"
              />
            </div>
            
            <div className="flex items-center gap-2 p-4 bg-slate-700/30 rounded-lg">
              <span className="text-white">Reports</span>
              <HelpButton 
                content="Create professional reports automatically! Choose what you want to see (timesheet, money, performance) and the system makes a beautiful PDF for you."
                title="📊 Report Generation"
                placement="TOP"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Help Center Modal */}
      <HelpCenter
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        userRole={userRole}
        currentPage="/help-demo"
      />

      {/* Feature Introduction Modal */}
      {showFeatureIntro && (
        <FeatureIntro
          title="🔐 Security Features Explained"
          description="Understanding why we use advanced security in simple terms"
          benefits={[
            'Prevents employees from clocking in for each other',
            'Ensures accurate billing to clients',
            'Meets legal requirements for time tracking',
            'Uses the same technology as your smartphone',
            'Takes only 2 seconds to verify'
          ]}
          difficulty="BEGINNER"
          estimatedTime="2 minutes"
          onStartTour={() => {
            setShowFeatureIntro(false)
            startWalkthrough?.('TIMESHEET')
          }}
          onDismiss={() => setShowFeatureIntro(false)}
        />
      )}
    </div>
  )
}
