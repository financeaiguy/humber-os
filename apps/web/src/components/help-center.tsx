'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle,
  X,
  Search,
  Book,
  Play,
  Clock,
  Users,
  Zap,
  Shield,
  DollarSign,
  FileText,
  MessageCircle,
  ChevronRight,
  Star,
  CheckCircle
} from 'lucide-react'
import { UserRole, WorkflowType } from '@humber/types'
import { useWalkthrough } from '@/lib/walkthrough-manager'
import { SmartTooltip, FeatureIntro } from './ui/smart-tooltip'

interface HelpCenterProps {
  isOpen: boolean
  onClose: () => void
  userRole: UserRole
  currentPage: string
}

export function HelpCenter({ isOpen, onClose, userRole, currentPage }: HelpCenterProps) {
  const [activeTab, setActiveTab] = useState<'quick-help' | 'tutorials' | 'search'>('quick-help')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFeatureIntro, setShowFeatureIntro] = useState(false)
  const { startWalkthrough, getRecommendations, getContextualHelp } = useWalkthrough()

  const quickHelpItems = [
    {
      icon: Clock,
      title: 'How do I track my time?',
      description: 'Learn the simple 3-step process to clock in and out',
      action: () => startWalkthrough?.('TIMESHEET'),
      difficulty: 'BEGINNER',
      time: '3 min',
      roles: ['ENGINEER', 'NEW_USER']
    },
    {
      icon: Users,
      title: 'How do I manage my team?',
      description: 'Use the Bull Pen to see and deploy your engineers',
      action: () => startWalkthrough?.('DASHBOARD_TOUR'),
      difficulty: 'BEGINNER',
      time: '5 min',
      roles: ['MANAGER']
    },
    {
      icon: FileText,
      title: 'How do I generate reports?',
      description: 'Create professional PDFs with one click',
      action: () => startWalkthrough?.('REPORTING'),
      difficulty: 'BEGINNER',
      time: '4 min',
      roles: ['ACCOUNTANT', 'MANAGER']
    },
    {
      icon: MessageCircle,
      title: 'How does the AI chat work?',
      description: 'Get help from your intelligent assistant',
      action: () => startWalkthrough?.('CHAT_ASSISTANCE'),
      difficulty: 'BEGINNER',
      time: '4 min',
      roles: ['NEW_USER', 'ENGINEER', 'MANAGER']
    },
    {
      icon: Shield,
      title: 'Why do I need biometric verification?',
      description: 'Understanding security and compliance requirements',
      action: () => setShowFeatureIntro(true),
      difficulty: 'BEGINNER',
      time: '2 min',
      roles: ['ENGINEER', 'NEW_USER']
    },
    {
      icon: DollarSign,
      title: 'How do I understand the financials?',
      description: 'Reading revenue, costs, and profit charts',
      action: () => startWalkthrough?.('BILLING'),
      difficulty: 'INTERMEDIATE',
      time: '5 min',
      roles: ['ACCOUNTANT', 'MANAGER']
    }
  ]

  const tutorials = [
    {
      id: 'onboarding',
      title: '🏠 Getting Started Tour',
      description: 'Perfect for first-time users - covers all the basics',
      difficulty: 'BEGINNER',
      time: '5 min',
      steps: 4,
      roles: ['NEW_USER'],
      action: () => startWalkthrough?.('ONBOARDING')
    },
    {
      id: 'timesheet',
      title: '⏰ Time Tracking Mastery',
      description: 'Learn secure time tracking with biometric verification',
      difficulty: 'BEGINNER',
      time: '3 min',
      steps: 4,
      roles: ['ENGINEER', 'NEW_USER'],
      action: () => startWalkthrough?.('TIMESHEET')
    },
    {
      id: 'recruiting',
      title: '👥 Hiring Process Guide',
      description: 'Complete walkthrough of the recruitment workflow',
      difficulty: 'INTERMEDIATE',
      time: '7 min',
      steps: 5,
      roles: ['RECRUITER', 'MANAGER'],
      action: () => startWalkthrough?.('RECRUITING')
    },
    {
      id: 'reporting',
      title: '📊 Report Generation Magic',
      description: 'Create professional reports and automate delivery',
      difficulty: 'BEGINNER',
      time: '4 min',
      steps: 4,
      roles: ['ACCOUNTANT', 'MANAGER'],
      action: () => startWalkthrough?.('REPORTING')
    },
    {
      id: 'documents',
      title: '📚 Knowledge Base Setup',
      description: 'Upload documents and train your AI assistant',
      difficulty: 'BEGINNER',
      time: '3 min',
      steps: 3,
      roles: ['MANAGER', 'ADMIN'],
      action: () => startWalkthrough?.('DOCUMENT_UPLOAD')
    },
    {
      id: 'chat',
      title: '🤖 AI Assistant Mastery',
      description: 'Get the most out of your intelligent helper',
      difficulty: 'BEGINNER',
      time: '4 min',
      steps: 4,
      roles: ['NEW_USER', 'ENGINEER', 'MANAGER'],
      action: () => startWalkthrough?.('CHAT_ASSISTANCE')
    }
  ]

  const searchableContent = [
    { term: 'clock in time tracking', content: 'Use the time tracking section to clock in with biometric verification' },
    { term: 'upload documents knowledge base', content: 'Go to Knowledge section and drag/drop your files' },
    { term: 'generate reports pdf', content: 'Use the Reports section to create automated PDFs' },
    { term: 'add engineer recruit hire', content: 'Use the Operations workflow to add new candidates' },
    { term: 'bull pen team management', content: 'Bull Pen shows all engineers and their deployment status' },
    { term: 'chat ai assistant help', content: 'Click the chat bubble to ask questions and get help' },
    { term: 'biometric fingerprint face scan', content: 'Security feature that uses your unique biometric data for verification' },
    { term: 'location gps verification', content: 'Automatic location checking to ensure you\'re at the right work site' },
    { term: 'notifications email sms alerts', content: 'System sends automatic alerts for important events' },
    { term: 'compliance audit trail legal', content: 'All actions are logged for legal compliance and audit purposes' }
  ]

  const filteredQuickHelp = quickHelpItems.filter(item => 
    item.roles.includes(userRole) || item.roles.includes('NEW_USER')
  )

  const filteredTutorials = tutorials.filter(tutorial => 
    tutorial.roles.includes(userRole) || tutorial.roles.includes('NEW_USER')
  )

  const filteredSearch = searchableContent.filter(item =>
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'text-green-400 bg-green-400/10'
      case 'INTERMEDIATE': return 'text-yellow-400 bg-yellow-400/10'
      case 'ADVANCED': return 'text-red-400 bg-red-400/10'
      default: return 'text-blue-400 bg-blue-400/10'
    }
  }

  if (!isOpen) return null

  return (
    <>
      <AnimatePresence>
        <motion.div
          key="help-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          onClick={onClose}
        />
        
        <motion.div
          key="help-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-600 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Help Center</h2>
                  <p className="text-sm text-slate-400">
                    Designed for {userRole.toLowerCase().replace('_', ' ')} users
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contextual help banner */}
            <div className="p-4 bg-blue-500/10 border-b border-slate-600">
              <p className="text-sm text-blue-200">
                <strong>Current page:</strong> {getContextualHelp(currentPage)}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-600">
              {[
                { id: 'quick-help', label: 'Quick Help', icon: Zap },
                { id: 'tutorials', label: 'Tutorials', icon: Play },
                { id: 'search', label: 'Search', icon: Search }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 px-6 py-4 transition-colors
                    ${activeTab === tab.id 
                      ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {activeTab === 'quick-help' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    🚀 Quick Help for {userRole.toLowerCase().replace('_', ' ')} Users
                  </h3>
                  
                  {filteredQuickHelp.map((item, index) => (
                    <div
                      key={index}
                      className="group p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg border border-slate-600/50 hover:border-slate-500 transition-all cursor-pointer"
                      onClick={item.action}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                          <item.icon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1">{item.title}</h4>
                          <p className="text-sm text-slate-300 mb-2">{item.description}</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(item.difficulty)}`}>
                              {item.difficulty}
                            </span>
                            <span className="text-xs text-slate-400">{item.time}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'tutorials' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    🎓 Interactive Tutorials
                  </h3>
                  
                  {filteredTutorials.map((tutorial, index) => (
                    <div
                      key={tutorial.id}
                      className="group p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg border border-slate-600/50 hover:border-slate-500 transition-all cursor-pointer"
                      onClick={tutorial.action}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                          <Play className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1">{tutorial.title}</h4>
                          <p className="text-sm text-slate-300 mb-2">{tutorial.description}</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(tutorial.difficulty)}`}>
                              {tutorial.difficulty}
                            </span>
                            <span className="text-xs text-slate-400">{tutorial.time}</span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-400">{tutorial.steps} steps</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'search' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search for help... (e.g., 'how to clock in', 'upload documents')"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  
                  {searchQuery && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white">
                        Search Results for "{searchQuery}"
                      </h3>
                      
                      {filteredSearch.length > 0 ? (
                        filteredSearch.map((result, index) => (
                          <div
                            key={index}
                            className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50"
                          >
                            <p className="text-white font-medium mb-1 capitalize">
                              {result.term.replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-sm text-slate-300">{result.content}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Book className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                          <p className="text-slate-400">
                            No results found. Try searching for "time tracking", "reports", or "chat"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!searchQuery && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        💡 Popular Help Topics
                      </h3>
                      
                      {[
                        'How to clock in and out',
                        'Upload documents to knowledge base',
                        'Generate timesheet reports',
                        'Use AI chat assistant',
                        'Manage engineer deployments',
                        'Understanding biometric security'
                      ].map((topic, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchQuery(topic)}
                          className="block w-full text-left p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg border border-slate-600/50 hover:border-slate-500 transition-all"
                        >
                          <span className="text-white">{topic}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-600 bg-slate-800/50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Need more help? Ask the AI chat assistant! 💬
                </p>
                <div className="flex gap-2">
                  <SmartTooltip
                    id="help-center-tip"
                    title="💡 Pro Tip"
                    content="You can access help anytime by pressing F1 or clicking the help icon in the top-right corner!"
                    type="TIP"
                    placement="TOP"
                    userRole={userRole}
                  >
                    <button className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors">
                      Pro Tips
                    </button>
                  </SmartTooltip>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Feature Introduction Modal */}
      {showFeatureIntro && (
        <FeatureIntro
          title="🔐 Biometric Security Explained"
          description="Understanding why we use fingerprint and face scanning for time tracking"
          benefits={[
            'Prevents time theft and buddy punching',
            'Ensures accurate billing to clients',
            'Meets legal compliance requirements',
            'Same technology as your smartphone',
            'Quick and convenient - takes 2 seconds'
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
    </>
  )
}

// Global help trigger component
export function GlobalHelpTrigger() {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>('NEW_USER')
  const [currentPage, setCurrentPage] = useState('/')

  useEffect(() => {
    // Get user role from session or localStorage
    const savedRole = localStorage.getItem('userRole') as UserRole || 'NEW_USER'
    setUserRole(savedRole)
    
    // Track current page
    setCurrentPage(window.location.pathname)
    
    // Keyboard shortcut
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F1' || (e.ctrlKey && e.key === 'h')) {
        e.preventDefault()
        setIsHelpOpen(true)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <>
      {/* Help trigger button */}
      <SmartTooltip
        id="global-help-trigger"
        title="🆘 Need Help?"
        content="Click here or press F1 to open the help center. Get tutorials, tips, and guided walkthroughs!"
        type="HELP"
        placement="BOTTOM_LEFT"
        userRole={userRole}
      >
        <button
          onClick={() => setIsHelpOpen(true)}
          className="fixed bottom-6 right-6 z-[9998] p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-2xl transition-all hover:scale-110"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </SmartTooltip>

      {/* Help Center Modal */}
      <HelpCenter
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        userRole={userRole}
        currentPage={currentPage}
      />
    </>
  )
}
