'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot,
  User,
  Sparkles,
  FileText,
  Users,
  Settings,
  Trash2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Zap,
  Brain,
  Search,
  Clock,
  ChevronDown,
  Plus,
  Maximize2,
  Minimize2,
  History,
  Upload,
  Paperclip,
  Image,
  File,
  Share2,
  Check,
  HelpCircle,
  BookOpen,
  Play,
  Pause,
  Save,
  MessageCircle
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{
    title: string
    relevance: number
    type: string
  }>
  timestamp: number
  isStreaming?: boolean
}

interface Engineer {
  id: string
  name: string
  category: string
  status: string
  currentProject?: string
  hourlyRate?: number
  location?: string
  skills?: string[]
  avatar?: string
}

interface ProfessionalChatProps {
  isOpen: boolean
  onToggle: () => void
}

export function ProfessionalChat({ isOpen, onToggle }: ProfessionalChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null)
  const [showEngineerDropdown, setShowEngineerDropdown] = useState(false)
  const [chatMode, setChatMode] = useState<'documents' | 'engineer' | 'general' | 'help'>('documents')
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedShareUsers, setSelectedShareUsers] = useState<string[]>([])
  const [shareMessage, setShareMessage] = useState('')
  const [chatSessions, setChatSessions] = useState<Array<{id: string, title: string, lastMessage: string, timestamp: number, engineerId?: string}>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock Humber users for sharing
  const humberUsers = [
    { id: 'user_001', name: 'John Smith', role: 'Project Manager', email: 'john.smith@humber.com', avatar: 'JS' },
    { id: 'user_002', name: 'Mary Johnson', role: 'Engineering Lead', email: 'mary.johnson@humber.com', avatar: 'MJ' },
    { id: 'user_003', name: 'Robert Chen', role: 'Operations Manager', email: 'robert.chen@humber.com', avatar: 'RC' },
    { id: 'user_004', name: 'Jennifer Davis', role: 'Quality Manager', email: 'jennifer.davis@humber.com', avatar: 'JD' },
    { id: 'user_005', name: 'Michael Wilson', role: 'Deployment Lead', email: 'michael.wilson@humber.com', avatar: 'MW' },
    { id: 'user_006', name: 'Sarah Martinez', role: 'Client Success', email: 'sarah.martinez@humber.com', avatar: 'SM' },
    { id: 'user_007', name: 'David Thompson', role: 'Technical Lead', email: 'david.thompson@humber.com', avatar: 'DT' },
    { id: 'user_008', name: 'Lisa Anderson', role: 'HR Manager', email: 'lisa.anderson@humber.com', avatar: 'LA' }
  ]

  // Mock engineers data
  const engineers: Engineer[] = [
    {
      id: 'eng_001',
      name: 'Sarah Johnson',
      category: 'ELECTRICAL_ENGINEER',
      status: 'deployed',
      currentProject: 'GM Assembly Line Automation',
      hourlyRate: 85,
      location: 'Detroit, MI',
      skills: ['PLC Programming', 'HMI Design', 'Motor Controls', 'SCADA Systems'],
      avatar: 'SJ'
    },
    {
      id: 'eng_002', 
      name: 'Michael Chen',
      category: 'MECHANICAL_ENGINEER',
      status: 'available',
      hourlyRate: 80,
      location: 'Dearborn, MI',
      skills: ['CAD Design', 'Manufacturing', 'Quality Control', 'Lean Six Sigma'],
      avatar: 'MC'
    },
    {
      id: 'eng_003',
      name: 'Emily Rodriguez',
      category: 'SOFTWARE_ENGINEER', 
      status: 'deployed',
      currentProject: 'Ford Paint Shop Upgrade',
      hourlyRate: 95,
      location: 'Remote',
      skills: ['React', 'Node.js', 'Database Design', 'Cloud Architecture'],
      avatar: 'ER'
    },
    {
      id: 'eng_004',
      name: 'David Kim',
      category: 'SYSTEMS_ENGINEER',
      status: 'processing',
      hourlyRate: 88,
      location: 'Grand Rapids, MI',
      skills: ['System Integration', 'Network Design', 'Troubleshooting', 'DevOps'],
      avatar: 'DK'
    },
    {
      id: 'eng_005',
      name: 'Lisa Thompson',
      category: 'PROJECT_ENGINEER',
      status: 'available',
      hourlyRate: 75,
      location: 'Troy, MI',
      skills: ['Project Management', 'Timeline Planning', 'Client Relations', 'Agile'],
      avatar: 'LT'
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-start new conversation when selecting engineer
  useEffect(() => {
    if (selectedEngineer && chatMode === 'engineer') {
      // Save current session if has messages
      if (messages.length > 0) {
        const newSession = {
          id: Date.now().toString(),
          title: messages[0]?.content.substring(0, 50) + '...' || 'New Conversation',
          lastMessage: messages[messages.length - 1]?.content.substring(0, 100) + '...' || '',
          timestamp: Date.now(),
          engineerId: selectedEngineer.id
        }
        setChatSessions(prev => [newSession, ...prev])
      }
      
      // Start fresh conversation
      setMessages([])
      
      // Auto-send welcome message
      setTimeout(() => {
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Hi! I'm ready to help you with questions about ${selectedEngineer.name}.\n\n**${selectedEngineer.name}** is a ${selectedEngineer.category.replace('_', ' ')} currently ${selectedEngineer.status}${selectedEngineer.currentProject ? ` on the "${selectedEngineer.currentProject}" project` : ''}.\n\nKey details:\n• Location: ${selectedEngineer.location}\n• Hourly Rate: $${selectedEngineer.hourlyRate}\n• Skills: ${selectedEngineer.skills?.join(', ')}\n\nWhat would you like to know about ${selectedEngineer.name}?`,
          timestamp: Date.now()
        }
        setMessages([welcomeMessage])
      }, 500)
    }
  }, [selectedEngineer, chatMode])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Add file message to chat
    const fileMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `📎 Uploaded: ${file.name} (${Math.round(file.size / 1024)}KB)`,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, fileMessage])

    // Mock processing response
    setTimeout(() => {
      const responseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've received your file "${file.name}". I can help you analyze this document or answer questions about its content. What would you like to know?`,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, responseMessage])
    }, 1000)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setShowFileUpload(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Focus back to input
    setTimeout(() => inputRef.current?.focus(), 100)

    try {
      // Build enhanced context
      let contextMessage = input
      if (chatMode === 'engineer' && selectedEngineer) {
        contextMessage = `Engineer Context: ${selectedEngineer.name} (${selectedEngineer.category}) - Status: ${selectedEngineer.status}, Rate: $${selectedEngineer.hourlyRate}/hr, Location: ${selectedEngineer.location}, Skills: ${selectedEngineer.skills?.join(', ')}${selectedEngineer.currentProject ? `, Current Project: ${selectedEngineer.currentProject}` : ''}.\n\nUser Question: ${input}`
      }

      const response = await fetch('http://localhost:8787/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': 'demo-tenant'
        },
        body: JSON.stringify({
          message: contextMessage,
          useRAG: chatMode === 'documents',
          maxDocuments: 5,
          engineerContext: selectedEngineer
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Simulate streaming effect
        const assistantMessage: ChatMessage = {
          id: data.messageId,
          role: 'assistant',
          content: '',
          sources: data.sourceDocuments?.map((doc: any) => ({
            title: doc.metadata?.documentTitle || doc.documentTitle,
            relevance: doc.score,
            type: doc.metadata?.category || 'document'
          })),
          timestamp: Date.now(),
          isStreaming: true
        }

        setMessages(prev => [...prev, assistantMessage])

        // Simulate streaming text
        const words = data.content.split(' ')
        for (let i = 0; i < words.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 30))
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: words.slice(0, i + 1).join(' '), isStreaming: i < words.length - 1 }
              : msg
          ))
        }
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: Date.now()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ELECTRICAL_ENGINEER': return 'from-blue-500 to-cyan-500'
      case 'MECHANICAL_ENGINEER': return 'from-green-500 to-emerald-500'
      case 'SOFTWARE_ENGINEER': return 'from-purple-500 to-pink-500'
      case 'SYSTEMS_ENGINEER': return 'from-orange-500 to-red-500'
      case 'PROJECT_ENGINEER': return 'from-indigo-500 to-purple-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'available': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'processing': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="fixed bottom-8 right-8 h-16 w-16 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
      >
        <MessageSquare className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
        <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full animate-pulse"></div>
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.9 }}
      className={`fixed bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl z-50 overflow-hidden transition-all duration-300 ${
        isMinimized 
          ? 'bottom-8 right-8 w-80 h-16' 
          : 'inset-0 flex flex-col'
      }`}
      style={{ 
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Minimized State */}
      {isMinimized && (
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Humber AI</h3>
              <p className="text-xs text-slate-400">Ready to help</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Expand chat"
            >
              <Maximize2 className="h-4 w-4 text-slate-400 hover:text-white transition-colors" />
            </button>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Close chat"
            >
              <X className="h-4 w-4 text-slate-400 hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      )}

      {/* Chat History Sidebar */}
      {showHistory && !isMinimized && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-80 border-r border-white/10 bg-slate-900/30 flex flex-col"
        >
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">Chat History</h3>
            <button
              onClick={() => {
                setMessages([])
                setSelectedEngineer(null)
              }}
              className="w-full p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-white hover:from-purple-500/30 hover:to-pink-500/30 transition-all flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Conversation</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chatSessions.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No chat history yet</p>
              </div>
            ) : (
              chatSessions.map((session, index) => (
                <motion.button
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="w-full text-left p-3 hover:bg-white/5 rounded-xl transition-colors border border-white/5 hover:border-white/20"
                >
                  <p className="text-sm font-medium text-white truncate">{session.title}</p>
                  <p className="text-xs text-slate-400 truncate mt-1">{session.lastMessage}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">
                      {new Date(session.timestamp).toLocaleDateString()}
                    </span>
                    {session.engineerId && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                        Engineer
                      </span>
                    )}
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Professional Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-slate-900/50 to-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-400 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Humber AI Assistant</h1>
              <p className="text-slate-400">
                {chatMode === 'engineer' && selectedEngineer 
                  ? `Specialized context for ${selectedEngineer.name}`
                  : chatMode === 'documents' 
                  ? 'Powered by your knowledge base & RAG'
                  : chatMode === 'help'
                  ? 'Interactive help & guided tutorials'
                  : 'General operations assistant'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-3 hover:bg-white/10 rounded-xl transition-colors group"
              title="Chat history"
            >
              <History className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 hover:bg-white/10 rounded-xl transition-colors group"
              title="Settings"
            >
              <Settings className="h-5 w-5 text-slate-400 group-hover:text-white group-hover:rotate-90 transition-all" />
            </button>
            <button
              onClick={() => setMessages([])}
              className="p-3 hover:bg-white/10 rounded-xl transition-colors group"
              title="Clear conversation"
            >
              <Trash2 className="h-5 w-5 text-slate-400 group-hover:text-red-400 transition-colors" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-3 hover:bg-white/10 rounded-xl transition-colors group"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? (
                <Maximize2 className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
              ) : (
                <Minimize2 className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
              )}
            </button>
            <button
              onClick={onToggle}
              className="p-3 hover:bg-white/10 rounded-xl transition-colors group"
              title="Close chat"
            >
              <X className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Advanced Mode Selector */}
        <div className="mt-6 flex items-center space-x-3">
          <div className="flex bg-slate-800/50 rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setChatMode('documents')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                chatMode === 'documents'
                  ? 'bg-blue-500/20 text-blue-300 shadow-lg border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Knowledge Base</span>
            </button>
            <button
              onClick={() => setChatMode('engineer')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                chatMode === 'engineer'
                  ? 'bg-green-500/20 text-green-300 shadow-lg border border-green-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Bull Pen</span>
            </button>
            <button
              onClick={() => setChatMode('general')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                chatMode === 'general'
                  ? 'bg-purple-500/20 text-purple-300 shadow-lg border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Brain className="h-4 w-4" />
              <span>Operations</span>
            </button>
            <button
              onClick={() => setChatMode('help')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                chatMode === 'help'
                  ? 'bg-orange-500/20 text-orange-300 shadow-lg border border-orange-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              <span>Help Center</span>
            </button>
          </div>
          
          {/* Engineer Selector */}
          {chatMode === 'engineer' && (
            <div className="relative flex-1">
              <button
                onClick={() => setShowEngineerDropdown(!showEngineerDropdown)}
                className="w-full flex items-center justify-between px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  {selectedEngineer ? (
                    <>
                      <div className={`h-8 w-8 rounded-lg bg-gradient-to-r ${getCategoryColor(selectedEngineer.category)} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                        {selectedEngineer.avatar}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">{selectedEngineer.name}</p>
                        <p className="text-xs text-slate-400">{selectedEngineer.category.replace('_', ' ')}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-gray-500 to-slate-500 flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm">Choose an engineer from Bull Pen</span>
                    </>
                  )}
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showEngineerDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showEngineerDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-20 max-h-80 overflow-y-auto"
                  >
                    {engineers.map((engineer, index) => (
                      <motion.button
                        key={engineer.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          setSelectedEngineer(engineer)
                          setShowEngineerDropdown(false)
                          setMessages([])
                        }}
                        className="w-full text-left px-4 py-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`h-12 w-12 rounded-xl bg-gradient-to-r ${getCategoryColor(engineer.category)} flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform`}>
                            {engineer.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                                {engineer.name}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(engineer.status)}`}>
                                  {engineer.status}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">${engineer.hourlyRate}/hr</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 mb-2">{engineer.category.replace('_', ' ')} • {engineer.location}</p>
                            {engineer.currentProject && (
                              <p className="text-xs text-slate-500 mb-2 bg-slate-800/50 rounded px-2 py-1">
                                📋 {engineer.currentProject}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1">
                              {engineer.skills?.slice(0, 4).map((skill, idx) => (
                                <span key={idx} className="text-xs px-2 py-0.5 bg-slate-800/50 text-slate-400 rounded border border-white/5">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Chat Content */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-2xl">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Hi! I'm your Humber AI Assistant
                  </h2>
                  <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">
                    {chatMode === 'engineer' && selectedEngineer 
                      ? `I'm ready to help you with questions about ${selectedEngineer.name}. Ask about their skills, availability, projects, or performance metrics.`
                      : chatMode === 'documents'
                      ? 'I can help you find information from your knowledge base including safety protocols, technical standards, and project guidelines.'
                      : chatMode === 'help'
                      ? 'Welcome to the Help Center! Get interactive tutorials, feature explanations, and step-by-step guidance for using Humber OS.'
                      : 'I can help with operations, project management, and engineering questions.'}
                  </p>
                  
                  {/* Enhanced Quick Actions */}
                  <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                    {chatMode === 'engineer' && selectedEngineer ? (
                      <>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInput(`What are ${selectedEngineer.name}'s current skills and areas of expertise?`)}
                          className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl text-left hover:border-blue-400/40 transition-all group"
                        >
                          <Zap className="h-5 w-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">Skills & Expertise</p>
                          <p className="text-xs text-slate-400">Technical capabilities</p>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInput(`What is ${selectedEngineer.name}'s current availability and deployment status?`)}
                          className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl text-left hover:border-green-400/40 transition-all group"
                        >
                          <Clock className="h-5 w-5 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">Availability</p>
                          <p className="text-xs text-slate-400">Current status</p>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInput(`What projects has ${selectedEngineer.name} worked on and what's their performance history?`)}
                          className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl text-left hover:border-purple-400/40 transition-all group"
                        >
                          <FileText className="h-5 w-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">Project History</p>
                          <p className="text-xs text-slate-400">Past deployments</p>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInput(`How can I optimize ${selectedEngineer.name}'s deployment and utilization?`)}
                          className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl text-left hover:border-orange-400/40 transition-all group"
                        >
                          <Search className="h-5 w-5 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">Optimization</p>
                          <p className="text-xs text-slate-400">Performance tips</p>
                        </motion.button>
                      </>
                    ) : chatMode === 'documents' ? (
                      <>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInput('What are the electrical safety protocols for automotive plants?')}
                          className="p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl text-left hover:border-red-400/40 transition-all group"
                        >
                          <Zap className="h-5 w-5 text-red-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">Safety Protocols</p>
                          <p className="text-xs text-slate-400">Electrical safety</p>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInput('How do I configure and program PLC systems?')}
                          className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl text-left hover:border-blue-400/40 transition-all group"
                        >
                          <Settings className="h-5 w-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">PLC Programming</p>
                          <p className="text-xs text-slate-400">Configuration guide</p>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInput('What are the project handover procedures and checklists?')}
                          className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl text-left hover:border-green-400/40 transition-all group"
                        >
                          <FileText className="h-5 w-5 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">Project Procedures</p>
                          <p className="text-xs text-slate-400">Handover process</p>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInput('What are the quality control standards and testing procedures?')}
                          className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl text-left hover:border-purple-400/40 transition-all group"
                        >
                          <Search className="h-5 w-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">Quality Standards</p>
                          <p className="text-xs text-slate-400">Testing procedures</p>
                        </motion.button>
                      </>
                    ) : chatMode === 'help' ? (
                      <>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInput('Show me how to navigate the dashboard')}
                          className="p-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl text-left hover:border-orange-400/40 transition-all group"
                        >
                          <BookOpen className="h-5 w-5 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">Dashboard Guide</p>
                          <p className="text-xs text-slate-400">Learn navigation</p>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInput('How do I onboard a new engineer?')}
                          className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl text-left hover:border-green-400/40 transition-all group"
                        >
                          <Users className="h-5 w-5 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">Onboarding</p>
                          <p className="text-xs text-slate-400">Step-by-step guide</p>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInput('Show me time tracking tutorials')}
                          className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl text-left hover:border-blue-400/40 transition-all group"
                        >
                          <Clock className="h-5 w-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">Time Tracking</p>
                          <p className="text-xs text-slate-400">Usage tutorials</p>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInput('What keyboard shortcuts are available?')}
                          className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl text-left hover:border-purple-400/40 transition-all group"
                        >
                          <Zap className="h-5 w-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">Shortcuts</p>
                          <p className="text-xs text-slate-400">Quick actions</p>
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInput('Show me the current Bull Pen status and engineer availability')}
                          className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl text-left hover:border-green-400/40 transition-all group"
                        >
                          <Users className="h-5 w-5 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">Bull Pen Status</p>
                          <p className="text-xs text-slate-400">Engineer availability</p>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInput('What are the active projects and their current status?')}
                          className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl text-left hover:border-blue-400/40 transition-all group"
                        >
                          <FileText className="h-5 w-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">Active Projects</p>
                          <p className="text-xs text-slate-400">Current status</p>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInput('Show me performance metrics and analytics')}
                          className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl text-left hover:border-purple-400/40 transition-all group"
                        >
                          <Search className="h-5 w-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">Analytics</p>
                          <p className="text-xs text-slate-400">Performance data</p>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInput('Help me with timesheet reconciliation and billing')}
                          className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl text-left hover:border-orange-400/40 transition-all group"
                        >
                          <Clock className="h-5 w-5 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">Timesheets</p>
                          <p className="text-xs text-slate-400">Reconciliation</p>
                        </motion.button>
                      </>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                        {msg.role === 'assistant' && (
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="h-7 w-7 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-xs font-medium text-slate-400">Humber AI</span>
                            {msg.isStreaming && (
                              <div className="flex space-x-1">
                                <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
                                <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className={`rounded-2xl px-6 py-4 shadow-lg ${
                          msg.role === 'user' 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                            : 'bg-white/5 text-slate-100 border border-white/10 backdrop-blur-sm'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <p className="text-xs font-medium text-slate-300 mb-3 flex items-center">
                                <FileText className="h-3 w-3 mr-1" />
                                Sources ({msg.sources.length})
                              </p>
                              <div className="space-y-2">
                                {msg.sources.map((source, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-colors group cursor-pointer"
                                  >
                                    <div className="flex items-center space-x-2 flex-1">
                                      <div className="h-6 w-6 rounded bg-blue-500/20 flex items-center justify-center">
                                        <FileText className="h-3 w-3 text-blue-400" />
                                      </div>
                                      <span className="text-xs text-slate-300 truncate group-hover:text-white transition-colors">
                                        {source.title}
                                      </span>
                                    </div>
                                    <span className="text-xs font-medium text-slate-400 bg-white/5 px-2 py-1 rounded">
                                      {Math.round(source.relevance * 100)}%
                                    </span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Message Actions */}
                          {msg.role === 'assistant' && (
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                              <div className="flex items-center space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                  title="Good response"
                                >
                                  <ThumbsUp className="h-3 w-3 text-slate-400 group-hover:text-green-400 transition-colors" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                  title="Poor response"
                                >
                                  <ThumbsDown className="h-3 w-3 text-slate-400 group-hover:text-red-400 transition-colors" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => navigator.clipboard.writeText(msg.content)}
                                  className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                  title="Copy response"
                                >
                                  <Copy className="h-3 w-3 text-slate-400 group-hover:text-blue-400 transition-colors" />
                                </motion.button>
                              </div>
                              <span className="text-xs text-slate-500">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="h-7 w-7 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-300">Thinking</span>
                          <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Professional Input Area */}
            <div className="p-6 border-t border-white/10 bg-gradient-to-r from-slate-900/30 to-slate-800/30 flex-shrink-0">
              {/* Selected Engineer Context */}
              {chatMode === 'engineer' && selectedEngineer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-r ${getCategoryColor(selectedEngineer.category)} flex items-center justify-center text-white font-bold shadow-lg`}>
                      {selectedEngineer.avatar}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white">{selectedEngineer.name}</h4>
                      <p className="text-xs text-slate-400">{selectedEngineer.category.replace('_', ' ')} • {selectedEngineer.status}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-slate-300">${selectedEngineer.hourlyRate}/hr</span>
                        <span className="text-xs text-slate-300">{selectedEngineer.location}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedEngineer(null)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>
                  {selectedEngineer.currentProject && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-slate-400">Current Project:</p>
                      <p className="text-xs font-medium text-slate-300">{selectedEngineer.currentProject}</p>
                    </div>
                  )}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      chatMode === 'engineer' && selectedEngineer
                        ? `Ask about ${selectedEngineer.name}'s skills, availability, projects, or performance...`
                        : chatMode === 'documents'
                        ? 'Ask about safety protocols, technical standards, project guidelines...'
                        : chatMode === 'help'
                        ? 'Ask for help with features, tutorials, shortcuts, or step-by-step guides...'
                        : 'Ask about operations, projects, Bull Pen status, or any engineering topic...'
                    }
                    className="w-full px-6 py-4 text-base bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all duration-200"
                    disabled={isLoading}
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit(e)
                      }
                    }}
                  />
                  <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                    <span className="text-xs text-slate-500">⌘ + Enter to send</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 hover:bg-white/10 rounded-xl transition-colors group"
                        title="Upload file (PDF, DOC, images)"
                      >
                        <Paperclip className="h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                      </motion.button>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowShareModal(!showShareModal)}
                      className="p-3 hover:bg-white/10 rounded-xl transition-colors group"
                      title="Share conversation with team"
                    >
                      <Share2 className="h-5 w-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
                    </motion.button>
                    
                    <div className="h-6 w-px bg-white/10"></div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                      <span className="text-xs text-slate-400">AI Online</span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 shadow-lg"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                    <span className="font-medium">Send Message</span>
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Share Conversation Modal */}
      {showShareModal && !isMinimized && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10"
          onClick={() => setShowShareModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 p-6 w-[480px] max-h-[600px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Share2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Share Conversation</h3>
                  <p className="text-xs text-slate-400">Share this chat with your team members</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              {/* Add message */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Add a message (optional)</label>
                <textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Hey team, check out this conversation about..."
                  className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 resize-none"
                  rows={3}
                />
              </div>

              {/* User selection */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <label className="text-sm font-medium text-slate-300 mb-2 block">Select team members</label>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                  {humberUsers.map((user) => (
                    <motion.button
                      key={user.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        setSelectedShareUsers(prev => 
                          prev.includes(user.id) 
                            ? prev.filter(id => id !== user.id)
                            : [...prev, user.id]
                        )
                      }}
                      className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between ${
                        selectedShareUsers.includes(user.id)
                          ? 'bg-purple-500/20 border-purple-500/40 shadow-lg'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                          selectedShareUsers.includes(user.id)
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                            : 'bg-gradient-to-r from-slate-600 to-slate-700'
                        }`}>
                          {user.avatar}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.role} • {user.email}</p>
                        </div>
                      </div>
                      {selectedShareUsers.includes(user.id) && (
                        <div className="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Selected count */}
              {selectedShareUsers.length > 0 && (
                <div className="text-xs text-slate-400 text-center">
                  {selectedShareUsers.length} {selectedShareUsers.length === 1 ? 'person' : 'people'} selected
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Here you would normally send the share request to your backend
                    console.log('Sharing with:', selectedShareUsers, 'Message:', shareMessage)
                    alert(`Conversation shared with ${selectedShareUsers.length} team member${selectedShareUsers.length === 1 ? '' : 's'}!`)
                    setShowShareModal(false)
                    setSelectedShareUsers([])
                    setShareMessage('')
                  }}
                  disabled={selectedShareUsers.length === 0}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share Conversation</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Settings Panel */}
      {showSettings && !isMinimized && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10"
          onClick={() => setShowSettings(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Chat Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Chat Mode Settings */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Default Chat Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'documents', label: 'Documents', icon: FileText, desc: 'RAG-powered responses' },
                    { id: 'engineer', label: 'Engineer', icon: User, desc: 'Engineer-specific help' },
                    { id: 'general', label: 'General', icon: MessageCircle, desc: 'General assistance' },
                    { id: 'help', label: 'Help', icon: HelpCircle, desc: 'System guidance' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setChatMode(mode.id as any)}
                      className={`p-3 rounded-xl border transition-all ${
                        chatMode === mode.id
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-slate-600 hover:border-slate-500 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <mode.icon className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-xs font-medium">{mode.label}</div>
                      <div className="text-xs opacity-70">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Settings */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  AI Response Settings
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Response Length</label>
                    <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                      <option value="concise">Concise (Quick answers)</option>
                      <option value="detailed" selected>Detailed (Comprehensive)</option>
                      <option value="extensive">Extensive (Very thorough)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Technical Level</label>
                    <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                      <option value="basic">Basic (Simple explanations)</option>
                      <option value="intermediate" selected>Intermediate (Technical details)</option>
                      <option value="expert">Expert (Advanced technical)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* RAG Settings */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Knowledge Base Settings
                </label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Use RAG Knowledge Base</span>
                    <button
                      onClick={() => {/* Toggle RAG */}}
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors"
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Max Documents to Reference</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      defaultValue="5"
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>1</span>
                      <span>5 (current)</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Notification Preferences
                </label>
                <div className="space-y-3">
                  {[
                    { id: 'sound', label: 'Sound notifications', enabled: true },
                    { id: 'desktop', label: 'Desktop notifications', enabled: false },
                    { id: 'typing', label: 'Show typing indicators', enabled: true },
                    { id: 'timestamps', label: 'Show message timestamps', enabled: true }
                  ].map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{setting.label}</span>
                      <button
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          setting.enabled ? 'bg-blue-600' : 'bg-slate-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data & Privacy */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Data & Privacy
                </label>
                <div className="space-y-3">
                  <button className="w-full text-left px-3 py-2 bg-slate-700/50 rounded-lg text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                    Export Chat History
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-slate-700/50 rounded-lg text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                    Clear All Data
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 hover:bg-red-500/20 transition-colors">
                    Delete Account Data
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-slate-700">
                <button
                  onClick={() => {
                    // Save settings
                    setShowSettings(false)
                    // Show success message
                    console.log('Settings saved')
                  }}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* File Upload Modal */}
      {showFileUpload && !isMinimized && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10"
          onClick={() => setShowFileUpload(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 p-6 w-96"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Upload File</h3>
              <button
                onClick={() => setShowFileUpload(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer group"
              >
                <Upload className="h-8 w-8 text-slate-400 group-hover:text-purple-400 mx-auto mb-3 transition-colors" />
                <p className="text-sm font-medium text-white mb-1">Click to upload file</p>
                <p className="text-xs text-slate-400">PDF, DOC, DOCX, TXT, CSV, XLSX, Images</p>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <button className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors group">
                  <File className="h-5 w-5 text-red-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-red-300">PDF</span>
                </button>
                <button className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors group">
                  <FileText className="h-5 w-5 text-blue-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-blue-300">DOC</span>
                </button>
                <button className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors group">
                  <Image className="h-5 w-5 text-green-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-green-300">IMG</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </div>
    </motion.div>
  )
}
