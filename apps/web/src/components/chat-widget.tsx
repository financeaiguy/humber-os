'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  X, 
  Send, 
  Paperclip,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Users,
  FileText,
  Settings,
  Trash2,
  Copy,
  RefreshCw,
  ChevronDown
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{
    title: string
    relevance: number
  }>
  timestamp: number
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
}

interface ChatWidgetProps {
  isOpen: boolean
  onToggle: () => void
  className?: string
}

export function ChatWidget({ isOpen, onToggle, className = '' }: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null)
  const [showEngineerDropdown, setShowEngineerDropdown] = useState(false)
  const [chatMode, setChatMode] = useState<'documents' | 'engineer' | 'general'>('documents')
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check AI connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('connecting')
        const response = await fetch('http://localhost:8787/health', {
          method: 'GET',
          headers: { 'X-Tenant-ID': 'demo-tenant' }
        })
        
        if (response.ok) {
          setIsConnected(true)
          setConnectionStatus('connected')
        } else {
          setIsConnected(false)
          setConnectionStatus('disconnected')
        }
      } catch (error) {
        // SECURITY: Removed console.error('AI connection check failed:', error)
        setIsConnected(false)
        setConnectionStatus('disconnected')
      }
    }

    checkConnection()
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  // Mock engineers data (would fetch from API)
  const engineers: Engineer[] = [
    {
      id: 'eng_001',
      name: 'Sarah Johnson',
      category: 'ELECTRICAL_ENGINEER',
      status: 'deployed',
      currentProject: 'GM Assembly Line Automation',
      hourlyRate: 85,
      location: 'Detroit, MI',
      skills: ['PLC Programming', 'HMI Design', 'Motor Controls']
    },
    {
      id: 'eng_002', 
      name: 'Michael Chen',
      category: 'MECHANICAL_ENGINEER',
      status: 'available',
      hourlyRate: 80,
      location: 'Dearborn, MI',
      skills: ['CAD Design', 'Manufacturing', 'Quality Control']
    },
    {
      id: 'eng_003',
      name: 'Emily Rodriguez',
      category: 'SOFTWARE_ENGINEER', 
      status: 'deployed',
      currentProject: 'Ford Paint Shop Upgrade',
      hourlyRate: 95,
      location: 'Remote',
      skills: ['React', 'Node.js', 'Database Design']
    },
    {
      id: 'eng_004',
      name: 'David Kim',
      category: 'SYSTEMS_ENGINEER',
      status: 'processing',
      hourlyRate: 88,
      location: 'Grand Rapids, MI',
      skills: ['System Integration', 'Network Design', 'Troubleshooting']
    },
    {
      id: 'eng_005',
      name: 'Lisa Thompson',
      category: 'PROJECT_ENGINEER',
      status: 'available',
      hourlyRate: 75,
      location: 'Troy, MI',
      skills: ['Project Management', 'Timeline Planning', 'Client Relations']
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

      try {
        // Build context based on chat mode
        let contextMessage = input
        if (chatMode === 'engineer' && selectedEngineer) {
          contextMessage = `Context: I'm asking about ${selectedEngineer.name}, a ${selectedEngineer.category} engineer who is currently ${selectedEngineer.status}${selectedEngineer.currentProject ? ` on project: ${selectedEngineer.currentProject}` : ''}. Their skills include: ${selectedEngineer.skills?.join(', ')}. They are located in ${selectedEngineer.location} with an hourly rate of $${selectedEngineer.hourlyRate}.\n\nQuestion: ${input}`
        }

        // Check if AI is connected before making the call
        if (!isConnected) {
          throw new Error('AI models are not connected')
        }

        // Call the chat API
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
        
        const assistantMessage: ChatMessage = {
          id: data.messageId,
          role: 'assistant',
          content: data.content,
          sources: data.sourceDocuments?.map((doc: any) => ({
            title: doc.metadata.documentTitle,
            relevance: doc.score
          })),
          timestamp: Date.now()
        }

        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      // SECURITY: Removed console.error('Chat error:', error)
      
      // Fallback response based on connection status
      const errorContent = !isConnected 
        ? 'AI models are currently offline. Please check your connection and try again. The system uses Llama 4 Scout and 120B parameter open-source models via Cloudflare Workers AI.'
        : 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.'
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: Date.now()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={onToggle}
        className={`fixed bottom-6 right-6 h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 ${className}`}
      >
        <MessageSquare className="h-8 w-8 text-white" />
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl z-50 flex flex-col ${className}`}
      style={{
        width: isMinimized ? 'auto' : '800px',
        height: isMinimized ? 'auto' : '85vh',
        maxWidth: isMinimized ? 'auto' : 'calc(100vw - 2rem)',
        maxHeight: isMinimized ? 'auto' : 'calc(100vh - 2rem)'
      }}
    >
      {/* Enhanced Header */}
      <div className={`p-4 flex-shrink-0 ${isMinimized ? '' : 'border-b border-slate-700/50'}`}>
        <div className={`flex items-center ${isMinimized ? 'space-x-2' : 'justify-between mb-4'}`}>
          {isMinimized ? (
            <>
              <button
                onClick={() => setIsMinimized(false)}
                className="flex items-center space-x-2 hover:bg-slate-700/30 rounded-lg p-2 transition-all group cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="pr-2">
                  <h3 className="text-sm font-semibold text-white whitespace-nowrap">Humber AI</h3>
                </div>
                <Maximize2 className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
              </button>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors ml-1"
                title="Close chat"
              >
                <X className="h-4 w-4 text-slate-400 hover:text-white" />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-white truncate">Humber AI Assistant</h3>
                  <p className="text-xs sm:text-sm text-slate-400 truncate flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                      connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                      'bg-red-400'
                    }`} />
                    {connectionStatus === 'connected' ? (
                      chatMode === 'engineer' && selectedEngineer 
                        ? `Chatting about ${selectedEngineer.name}`
                        : chatMode === 'documents' 
                        ? 'Powered by Llama 4 Scout & 120B OSS'
                        : 'Open-source AI models connected'
                    ) : connectionStatus === 'connecting' ? (
                      'Connecting to AI models...'
                    ) : (
                      'AI models offline'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setMessages([])}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="h-4 w-4 text-slate-400" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <Minimize2 className="h-4 w-4 text-slate-400" />
                </button>
                <button
                  onClick={onToggle}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Chat Mode Selector */}
        {!isMinimized && (
          <div className="flex items-center space-x-1 sm:space-x-3">
            <button
            onClick={() => setChatMode('documents')}
            className={`px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              chatMode === 'documents'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Documents</span>
            <span className="sm:hidden">Docs</span>
          </button>
          <button
            onClick={() => setChatMode('engineer')}
            className={`px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              chatMode === 'engineer'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            <Users className="h-4 w-4 inline mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Bull Pen</span>
            <span className="sm:hidden">Bull Pen</span>
          </button>
          <button
            onClick={() => setChatMode('general')}
            className={`px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              chatMode === 'general'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            <MessageSquare className="h-4 w-4 inline mr-1 sm:mr-2" />
            <span className="hidden sm:inline">General</span>
            <span className="sm:hidden">Gen</span>
          </button>
          </div>
        )}

        {/* Engineer Selector */}
        {!isMinimized && chatMode === 'engineer' && (
          <div className="mt-3 relative">
            <button
              onClick={() => setShowEngineerDropdown(!showEngineerDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white hover:border-slate-500 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {selectedEngineer && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs font-semibold">
                    {selectedEngineer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {selectedEngineer ? selectedEngineer.name : 'Select Engineer from Bull Pen'}
                  </p>
                  {selectedEngineer && (
                    <p className="text-xs text-slate-400">
                      {selectedEngineer.category.replace('_', ' ')} • {selectedEngineer.status}
                    </p>
                  )}
                </div>
              </div>
              <ChevronDown className="h-5 w-5 text-slate-400" />
            </button>
            
            {showEngineerDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto">
                {engineers.map((engineer) => (
                  <button
                    key={engineer.id}
                    onClick={() => {
                      setSelectedEngineer(engineer)
                      setShowEngineerDropdown(false)
                      setMessages([]) // Clear chat when switching engineers
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors border-b border-slate-700 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-semibold">
                        {engineer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">{engineer.name}</p>
                            <p className="text-xs text-slate-400">{engineer.category.replace('_', ' ')}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs px-2 py-1 rounded-full ${
                              engineer.status === 'deployed' ? 'bg-green-500/20 text-green-400' :
                              engineer.status === 'available' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {engineer.status}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">${engineer.hourlyRate}/hr</p>
                          </div>
                        </div>
                        {engineer.currentProject && (
                          <p className="text-xs text-slate-500 mt-1 truncate">📋 {engineer.currentProject}</p>
                        )}
                        {engineer.skills && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {engineer.skills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="text-xs px-2 py-0.5 bg-slate-800/50 text-slate-400 rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Content */}
      {!isMinimized && (
        <div className="flex flex-col flex-1 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">Hi! I'm your Humber AI Assistant</h4>
                  <p className="text-sm text-slate-400 mb-4">
                    {chatMode === 'engineer' && selectedEngineer 
                      ? `I'm ready to help you with questions about ${selectedEngineer.name}. Ask about their skills, availability, projects, or performance.`
                      : chatMode === 'documents'
                      ? 'I can help you find information from your knowledge base including safety protocols, technical standards, and project guidelines.'
                      : 'I can help with general questions about operations, projects, and engineering topics.'}
                  </p>
                  
                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 justify-center">
                    {chatMode === 'engineer' && selectedEngineer ? (
                      <>
                        <button 
                          onClick={() => setInput(`What are ${selectedEngineer.name}'s current skills and expertise?`)}
                          className="px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-600/50 transition-colors text-center"
                        >
                          Skills & Expertise
                        </button>
                        <button 
                          onClick={() => setInput(`What is ${selectedEngineer.name}'s current availability and status?`)}
                          className="px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-600/50 transition-colors text-center"
                        >
                          Availability
                        </button>
                        <button 
                          onClick={() => setInput(`What projects has ${selectedEngineer.name} worked on recently?`)}
                          className="px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-600/50 transition-colors text-center sm:col-span-2"
                        >
                          Project History
                        </button>
                      </>
                    ) : chatMode === 'documents' ? (
                      <>
                        <button 
                          onClick={() => setInput('What are the electrical safety protocols?')}
                          className="px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-600/50 transition-colors text-center"
                        >
                          Safety Protocols
                        </button>
                        <button 
                          onClick={() => setInput('How do I configure PLC systems?')}
                          className="px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-600/50 transition-colors text-center"
                        >
                          PLC Programming
                        </button>
                        <button 
                          onClick={() => setInput('What are the project handover procedures?')}
                          className="px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-600/50 transition-colors text-center sm:col-span-2"
                        >
                          Project Procedures
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => setInput('Show me the current Bull Pen status')}
                          className="px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-600/50 transition-colors text-center"
                        >
                          Bull Pen Status
                        </button>
                        <button 
                          onClick={() => setInput('What are the active projects?')}
                          className="px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-600/50 transition-colors text-center"
                        >
                          Active Projects
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                          : 'bg-slate-900/50 text-slate-100 border border-slate-700/50'
                      }`}>
                        <div className="flex items-start space-x-3">
                          {msg.role === 'assistant' && (
                            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Bot className="h-3 w-3 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-600/50">
                                <p className="text-xs text-slate-400 mb-2 font-medium">Sources:</p>
                                <div className="space-y-1">
                                  {msg.sources.slice(0, 3).map((source, idx) => (
                                    <div key={idx} className="text-xs text-slate-300 flex items-center space-x-2 bg-slate-800/50 rounded-lg px-2 py-1">
                                      <Paperclip className="h-3 w-3 text-slate-400" />
                                      <span className="flex-1 truncate">{source.title}</span>
                                      <span className="text-slate-500 font-medium">{Math.round(source.relevance * 100)}%</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Message Actions */}
                            <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => navigator.clipboard.writeText(msg.content)}
                                className="p-1 hover:bg-slate-700/50 rounded text-slate-400 hover:text-slate-300"
                                title="Copy message"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl px-3 py-2 flex items-center space-x-2">
                        <Bot className="h-4 w-4 text-purple-400" />
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Enhanced Input Area - Fixed at Bottom */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-900/30 mt-auto">
              {/* Selected Engineer Info */}
              {chatMode === 'engineer' && selectedEngineer && (
                <div className="mb-3 p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs font-semibold">
                      {selectedEngineer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{selectedEngineer.name}</p>
                      <p className="text-xs text-slate-400">{selectedEngineer.category.replace('_', ' ')} • {selectedEngineer.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-300">${selectedEngineer.hourlyRate}/hr</p>
                      <p className="text-xs text-slate-400">{selectedEngineer.location}</p>
                    </div>
                  </div>
                  {selectedEngineer.currentProject && (
                    <div className="mt-2 pt-2 border-t border-slate-600/30">
                      <p className="text-xs text-slate-400">Current Project:</p>
                      <p className="text-xs text-slate-300 font-medium">{selectedEngineer.currentProject}</p>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      !isConnected
                        ? 'AI models offline - connecting to Llama 4 Scout and 120B OSS models...'
                        : chatMode === 'engineer' && selectedEngineer
                        ? `Ask about ${selectedEngineer.name}'s skills, availability, projects, or performance...`
                        : chatMode === 'documents'
                        ? 'Ask about safety protocols, technical standards, project guidelines...'
                        : 'Ask about operations, projects, Bull Pen status...'
                    }
                    className="w-full px-4 py-3 text-sm bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 resize-none touch-manipulation"
                    disabled={isLoading || !isConnected}
                    disabled={isLoading}
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit(e)
                      }
                    }}
                  />
                  <div className="absolute bottom-2 right-2 flex items-center space-x-1">
                    <span className="text-xs text-slate-500">Enter to send</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-slate-300"
                      title="Attach file"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-slate-300"
                      title="Refresh"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading || !isConnected}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">Send</span>
                  </button>
                </div>
              </form>
            </div>
        </div>
      )}
    </motion.div>
  )
}
