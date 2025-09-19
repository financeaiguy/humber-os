'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Users, 
  Globe, 
  Share2, 
  Clock, 
  User,
  Bot,
  Trash2,
  Pin,
  Star,
  MoreVertical,
  Calendar,
  Tag,
  Archive,
  Download,
  Eye,
  MessageCircle,
  ChevronDown,
  Plus,
  Sparkles,
  BookOpen,
  Lock,
  Unlock,
  Copy,
  Edit3,
  X
} from 'lucide-react'

interface ChatSession {
  id: string
  title: string
  description?: string
  messageCount: number
  lastMessageAt: number
  createdAt: number
  userId: string
  userName: string
  userAvatar?: string
  tenantId: string
  isShared: boolean
  isPublic: boolean
  isPinned: boolean
  isStarred: boolean
  tags: string[]
  category: 'documents' | 'engineer' | 'general' | 'help'
  lastMessage: {
    role: 'user' | 'assistant'
    content: string
    timestamp: number
  }
  participants?: Array<{
    id: string
    name: string
    role: string
    avatar?: string
  }>
}

interface ConversationHistoryProps {
  isOpen: boolean
  onClose: () => void
  onSelectConversation: (sessionId: string) => void
}

export function ComprehensiveChatHistory({ isOpen, onClose, onSelectConversation }: ConversationHistoryProps) {
  const [activeTab, setActiveTab] = useState<'my-conversations' | 'all-conversations' | 'shared-conversations'>('my-conversations')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'most-active' | 'alphabetical'>('recent')
  const [showFilters, setShowFilters] = useState(false)
  const [conversations, setConversations] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedConversations, setSelectedConversations] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [isUsingMockData, setIsUsingMockData] = useState(false)

  // Fetch conversations from API with robust error handling
  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true)
      try {
        const scope = activeTab === 'my-conversations' ? 'my' : 
                     activeTab === 'shared-conversations' ? 'shared' : 'all'
        
        const params = new URLSearchParams({
          scope,
          category: selectedCategory,
          search: searchQuery,
          sortBy,
          limit: '50',
          offset: '0'
        })

        // Try multiple possible API endpoints
        const possibleEndpoints = [
          `http://localhost:8787/chat/sessions?${params}`, // Primary worker
          `/api/chat/sessions?${params}`,                  // Next.js fallback
          `http://127.0.0.1:8787/chat/sessions?${params}` // Alternative localhost
        ]

        let response: Response | null = null
        let lastError: Error | null = null

        for (const endpoint of possibleEndpoints) {
          try {
            console.log(`Trying API endpoint: ${endpoint}`)
            response = await fetch(endpoint, {
              headers: {
                'Content-Type': 'application/json',
                'X-Tenant-ID': 'demo-tenant',
                'Authorization': 'Bearer test-token-for-worker-api'
              },
              signal: AbortSignal.timeout(5000) // 5 second timeout
            })

            if (response.ok) {
              console.log(`✅ Successfully connected to: ${endpoint}`)
              break
            } else {
              console.warn(`❌ Failed to connect to ${endpoint}: ${response.status} ${response.statusText}`)
              response = null
            }
          } catch (fetchError) {
            console.warn(`❌ Network error for ${endpoint}:`, fetchError)
            lastError = fetchError as Error
            response = null
            continue
          }
        }

        if (response?.ok) {
          const data = await response.json() as { 
            sessions: ChatSession[]
            success: boolean
          }
          console.log(`📊 Loaded ${data.sessions?.length || 0} conversations from API`)
          setConversations(data.sessions || [])
          setIsUsingMockData(false)
        } else {
          console.warn('⚠️ All API endpoints failed, falling back to mock data')
          console.warn('Last error:', lastError?.message || 'Unknown error')
          console.warn('💡 Make sure the worker is running: cd apps/worker && npm run dev')
          
          // Fallback to mock data with filtering applied client-side
          const mockData = getMockConversations()
          const filteredMockData = applyClientSideFilters(mockData, {
            scope,
            category: selectedCategory,
            search: searchQuery,
            sortBy
          })
          setConversations(filteredMockData)
          setIsUsingMockData(true)
        }
      } catch (error) {
        console.error('🚨 Unexpected error in fetchConversations:', error)
        // Final fallback
        const mockData = getMockConversations()
        setConversations(mockData)
        setIsUsingMockData(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [activeTab, selectedCategory, searchQuery, sortBy])

  // Client-side filtering for mock data when API is unavailable
  const applyClientSideFilters = (conversations: ChatSession[], filters: {
    scope: string;
    category: string;
    search: string;
    sortBy: string;
  }) => {
    let filtered = [...conversations]

    // Apply scope filter
    if (filters.scope === 'my') {
      filtered = filtered.filter(c => c.userId === 'user_current')
    } else if (filters.scope === 'shared') {
      filtered = filtered.filter(c => c.isShared || c.isPublic)
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(c => c.category === filters.category)
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchLower) ||
        c.lastMessage.content.toLowerCase().includes(searchLower) ||
        c.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        (c.description && c.description.toLowerCase().includes(searchLower))
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'recent':
          return b.lastMessageAt - a.lastMessageAt
        case 'oldest':
          return a.createdAt - b.createdAt
        case 'most-active':
          return b.messageCount - a.messageCount
        case 'alphabetical':
          return a.title.localeCompare(b.title)
        default:
          return b.lastMessageAt - a.lastMessageAt
      }
    })

    return filtered
  }

  const getMockConversations = (): ChatSession[] => [
      {
        id: 'conv_001',
        title: 'Electrical Safety Protocols Discussion',
        description: 'Detailed conversation about automotive plant safety requirements',
        messageCount: 12,
        lastMessageAt: Date.now() - 300000, // 5 mins ago
        createdAt: Date.now() - 86400000, // 1 day ago
        userId: 'user_current',
        userName: 'You',
        tenantId: 'demo-tenant',
        isShared: false,
        isPublic: false,
        isPinned: true,
        isStarred: false,
        tags: ['safety', 'electrical', 'protocols'],
        category: 'documents',
        lastMessage: {
          role: 'assistant',
          content: 'The lockout/tagout procedures must be followed strictly according to OSHA standards...',
          timestamp: Date.now() - 300000
        }
      },
      {
        id: 'conv_002',
        title: 'Sarah Johnson - Engineer Profile Review',
        messageCount: 8,
        lastMessageAt: Date.now() - 3600000, // 1 hour ago
        createdAt: Date.now() - 172800000, // 2 days ago
        userId: 'user_current',
        userName: 'You',
        tenantId: 'demo-tenant',
        isShared: true,
        isPublic: false,
        isPinned: false,
        isStarred: true,
        tags: ['engineer', 'profile', 'deployment'],
        category: 'engineer',
        lastMessage: {
          role: 'user',
          content: 'What projects has Sarah worked on recently?',
          timestamp: Date.now() - 3600000
        },
        participants: [
          { id: 'user_002', name: 'John Smith', role: 'Project Manager', avatar: 'JS' },
          { id: 'user_003', name: 'Mary Johnson', role: 'Engineering Lead', avatar: 'MJ' }
        ]
      },
      {
        id: 'conv_003',
        title: 'PLC Programming Best Practices',
        messageCount: 15,
        lastMessageAt: Date.now() - 7200000, // 2 hours ago
        createdAt: Date.now() - 259200000, // 3 days ago
        userId: 'user_002',
        userName: 'John Smith',
        tenantId: 'demo-tenant',
        isShared: true,
        isPublic: true,
        isPinned: false,
        isStarred: false,
        tags: ['plc', 'programming', 'automation'],
        category: 'documents',
        lastMessage: {
          role: 'assistant',
          content: 'Here are the structured programming practices recommended for industrial PLCs...',
          timestamp: Date.now() - 7200000
        },
        participants: [
          { id: 'user_004', name: 'Jennifer Davis', role: 'Quality Manager', avatar: 'JD' },
          { id: 'user_005', name: 'Michael Wilson', role: 'Deployment Lead', avatar: 'MW' }
        ]
      },
      {
        id: 'conv_004',
        title: 'Time Tracking System Tutorial',
        messageCount: 6,
        lastMessageAt: Date.now() - 10800000, // 3 hours ago
        createdAt: Date.now() - 345600000, // 4 days ago
        userId: 'user_003',
        userName: 'Mary Johnson',
        tenantId: 'demo-tenant',
        isShared: false,
        isPublic: true,
        isPinned: false,
        isStarred: false,
        tags: ['tutorial', 'time-tracking', 'help'],
        category: 'help',
        lastMessage: {
          role: 'assistant',
          content: 'To enable biometric authentication, navigate to Settings > Security...',
          timestamp: Date.now() - 10800000
        }
      },
      {
        id: 'conv_005',
        title: 'Project Budget Analysis - GM Contract',
        description: 'Financial analysis and resource allocation discussion',
        messageCount: 20,
        lastMessageAt: Date.now() - 14400000, // 4 hours ago
        createdAt: Date.now() - 432000000, // 5 days ago
        userId: 'user_004',
        userName: 'Jennifer Davis',
        tenantId: 'demo-tenant',
        isShared: true,
        isPublic: false,
        isPinned: true,
        isStarred: true,
        tags: ['budget', 'gm', 'analysis', 'resources'],
        category: 'general',
        lastMessage: {
          role: 'user',
          content: 'Can you break down the hourly rates by engineering category?',
          timestamp: Date.now() - 14400000
        },
        participants: [
          { id: 'user_006', name: 'Sarah Martinez', role: 'Client Success', avatar: 'SM' },
          { id: 'user_007', name: 'David Thompson', role: 'Technical Lead', avatar: 'DT' }
        ]
      }
    ]

  // Since filtering and sorting is now handled by the API, just use conversations directly
  const filteredConversations = conversations

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'documents': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'engineer': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'general': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'help': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documents': return BookOpen
      case 'engineer': return Users
      case 'general': return MessageSquare
      case 'help': return Sparkles
      default: return MessageCircle
    }
  }

  const toggleConversationSelection = (convId: string) => {
    setSelectedConversations(prev => 
      prev.includes(convId) 
        ? prev.filter(id => id !== convId)
        : [...prev, convId]
    )
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl h-[90vh] bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-white">Conversation History</h1>
                  {isUsingMockData && (
                    <div className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-xs font-medium">
                      📡 Demo Mode
                    </div>
                  )}
                  {!isUsingMockData && !isLoading && (
                    <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-xs font-medium">
                      🟢 Live API
                    </div>
                  )}
                </div>
                <p className="text-slate-400">
                  {isUsingMockData 
                    ? 'Showing demo data - start worker with "cd apps/worker && npm run dev" for live data'
                    : 'Manage and explore all your AI conversations'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-xl border transition-all ${
                  showFilters 
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' 
                    : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-slate-400 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-slate-800/50 rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setActiveTab('my-conversations')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                activeTab === 'my-conversations'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-white/90 hover:text-white hover:bg-gray-700/70 border border-gray-500 bg-gray-700/40'
              }`}
            >
              <User className="h-4 w-4" />
              <span>My Conversations</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'my-conversations' ? 'bg-blue-500/30' : 'bg-slate-600'
              }`}>
                {conversations.filter(c => c.userId === 'user_current').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('all-conversations')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                activeTab === 'all-conversations'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'text-white/90 hover:text-white hover:bg-gray-700/70 border border-gray-500 bg-gray-700/40'
              }`}
            >
              <Globe className="h-4 w-4" />
              <span>All Conversations</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'all-conversations' ? 'bg-green-500/30' : 'bg-slate-600'
              }`}>
                {conversations.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('shared-conversations')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                activeTab === 'shared-conversations'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-white/90 hover:text-white hover:bg-gray-700/70 border border-gray-500 bg-gray-700/40'
              }`}
            >
              <Share2 className="h-4 w-4" />
              <span>Shared Conversations</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'shared-conversations' ? 'bg-purple-500/30' : 'bg-slate-600'
              }`}>
                {conversations.filter(c => c.isShared || c.isPublic).length}
              </span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-white/10 bg-slate-800/30"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center space-x-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search conversations, messages, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="all">All Categories</option>
                    <option value="documents">Documents</option>
                    <option value="engineer">Engineer</option>
                    <option value="general">General</option>
                    <option value="help">Help</option>
                  </select>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="oldest">Oldest First</option>
                    <option value="most-active">Most Active</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Actions */}
        {selectedConversations.length > 0 && (
          <div className="px-6 py-3 bg-blue-500/10 border-b border-blue-500/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-300">
                {selectedConversations.length} conversation{selectedConversations.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1.5 bg-green-500/20 text-green-300 text-xs rounded-lg hover:bg-green-500/30 transition-colors">
                  <Share2 className="h-3 w-3 mr-1" />
                  Share
                </button>
                <button className="px-3 py-1.5 bg-orange-500/20 text-orange-300 text-xs rounded-lg hover:bg-orange-500/30 transition-colors">
                  <Archive className="h-3 w-3 mr-1" />
                  Archive
                </button>
                <button className="px-3 py-1.5 bg-red-500/20 text-red-300 text-xs rounded-lg hover:bg-red-500/30 transition-colors">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedConversations([])}
                  className="px-3 py-1.5 bg-slate-500/20 text-slate-300 text-xs rounded-lg hover:bg-slate-500/30 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-slate-400">Loading conversations...</p>
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <MessageSquare className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No conversations found</h3>
                <p className="text-slate-400 mb-6">
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Try adjusting your filters or search terms.'
                    : 'Start a conversation to see your history here.'
                  }
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Conversation
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 h-full overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredConversations.map((conversation, index) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white/5 border rounded-2xl p-5 hover:bg-white/10 transition-all duration-200 cursor-pointer group relative ${
                      selectedConversations.includes(conversation.id) 
                        ? 'border-blue-500/50 bg-blue-500/10 ring-2 ring-blue-500/20' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey) {
                        toggleConversationSelection(conversation.id)
                      } else {
                        onSelectConversation(conversation.id)
                        onClose()
                      }
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getCategoryColor(conversation.category)}`}>
                          {(() => {
                            const Icon = getCategoryIcon(conversation.category)
                            return <Icon className="h-5 w-5" />
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-white truncate text-sm">
                              {conversation.title}
                            </h3>
                            {conversation.isPinned && <Pin className="h-3 w-3 text-yellow-400 flex-shrink-0" />}
                            {conversation.isStarred && <Star className="h-3 w-3 text-yellow-400 flex-shrink-0" />}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-slate-400">
                            <span>{conversation.userName}</span>
                            <span>•</span>
                            <span>{conversation.messageCount} messages</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {conversation.isPublic && (
                          <div className="p-1 bg-green-500/20 rounded">
                            <Unlock className="h-3 w-3 text-green-400" />
                          </div>
                        )}
                        {conversation.isShared && !conversation.isPublic && (
                          <div className="p-1 bg-blue-500/20 rounded">
                            <Users className="h-3 w-3 text-blue-400" />
                          </div>
                        )}
                        {!conversation.isShared && !conversation.isPublic && (
                          <div className="p-1 bg-slate-500/20 rounded">
                            <Lock className="h-3 w-3 text-slate-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {conversation.description && (
                      <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                        {conversation.description}
                      </p>
                    )}

                    {/* Last Message */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-1">
                        {conversation.lastMessage.role === 'user' ? (
                          <User className="h-3 w-3 text-blue-400" />
                        ) : (
                          <Bot className="h-3 w-3 text-purple-400" />
                        )}
                        <span className="text-xs text-slate-500 capitalize">
                          {conversation.lastMessage.role}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(conversation.lastMessage.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">
                        {conversation.lastMessage.content}
                      </p>
                    </div>

                    {/* Tags */}
                    {conversation.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {conversation.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded-full border border-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                        {conversation.tags.length > 3 && (
                          <span className="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded-full border border-slate-600">
                            +{conversation.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Participants */}
                    {conversation.participants && conversation.participants.length > 0 && (
                      <div className="flex items-center space-x-2 mb-4">
                        <Users className="h-3 w-3 text-slate-400" />
                        <div className="flex -space-x-1">
                          {conversation.participants.slice(0, 3).map((participant) => (
                            <div
                              key={participant.id}
                              className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white border-2 border-slate-800"
                              title={participant.name}
                            >
                              {participant.avatar}
                            </div>
                          ))}
                          {conversation.participants.length > 3 && (
                            <div className="h-6 w-6 rounded-full bg-slate-600 flex items-center justify-center text-xs text-slate-300 border-2 border-slate-800">
                              +{conversation.participants.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">
                          {conversation.participants.length} participant{conversation.participants.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(conversation.lastMessageAt).toLocaleDateString()}</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 hover:bg-white/10 rounded">
                          <MoreVertical className="h-3 w-3 text-slate-400" />
                        </button>
                      </div>
                    </div>

                    {/* Selection checkbox */}
                    <div className={`absolute top-3 left-3 transition-opacity ${
                      selectedConversations.includes(conversation.id) || selectedConversations.length > 0
                        ? 'opacity-100' 
                        : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                        selectedConversations.includes(conversation.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-slate-400 hover:border-slate-300'
                      }`}>
                        {selectedConversations.includes(conversation.id) && (
                          <div className="h-2 w-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-slate-800/30">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <div>
              Showing {filteredConversations.length} of {conversations.length} conversations
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 hover:text-white transition-colors">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-white transition-colors">
                <Archive className="h-4 w-4" />
                <span>Archive Old</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
