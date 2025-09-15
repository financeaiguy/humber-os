'use client'

import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Search,
  FileText,
  Video,
  Download,
  Clock,
  User,
  Upload,
  Plus,
  MessageSquare,
  X,
  Send,
  Paperclip
} from 'lucide-react'
import { useState, useRef } from 'react'

const knowledgeArticles = [
  {
    id: 1,
    title: 'Electrical Safety Protocols for Automotive Plants',
    category: 'Safety',
    type: 'document',
    author: 'Sarah Johnson',
    lastUpdated: '2025-01-10',
    readTime: '8 min read',
    tags: ['electrical', 'safety', 'automotive'],
    description: 'Comprehensive guide to electrical safety protocols in automotive manufacturing environments.'
  },
  {
    id: 2,
    title: 'PLC Programming Best Practices',
    category: 'Technical',
    type: 'video',
    author: 'Michael Chen',
    lastUpdated: '2025-01-08',
    readTime: '25 min watch',
    tags: ['plc', 'programming', 'automation'],
    description: 'Video tutorial covering advanced PLC programming techniques and debugging strategies.'
  },
  {
    id: 3,
    title: 'Project Handover Checklist',
    category: 'Process',
    type: 'checklist',
    author: 'Lisa Thompson',
    lastUpdated: '2025-01-05',
    readTime: '5 min read',
    tags: ['project-management', 'handover', 'checklist'],
    description: 'Essential checklist for smooth project handovers to client teams.'
  },
  {
    id: 4,
    title: 'Robotic Welding System Configuration',
    category: 'Technical',
    type: 'document',
    author: 'David Kim',
    lastUpdated: '2025-01-03',
    readTime: '12 min read',
    tags: ['robotics', 'welding', 'configuration'],
    description: 'Step-by-step guide for configuring and calibrating robotic welding systems.'
  },
  {
    id: 5,
    title: 'Client Communication Templates',
    category: 'Communication',
    type: 'template',
    author: 'Emily Rodriguez',
    lastUpdated: '2024-12-28',
    readTime: '3 min read',
    tags: ['communication', 'templates', 'client'],
    description: 'Standard templates for client communications throughout project lifecycle.'
  },
  {
    id: 6,
    title: 'Quality Control Standards',
    category: 'Quality',
    type: 'document',
    author: 'Sarah Johnson',
    lastUpdated: '2024-12-25',
    readTime: '15 min read',
    tags: ['quality', 'standards', 'testing'],
    description: 'Quality control standards and testing procedures for all engineering projects.'
  }
]

const categories = ['All', 'Technical', 'Safety', 'Process', 'Communication', 'Quality']
const types = ['All', 'document', 'video', 'checklist', 'template']

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showChatWidget, setShowChatWidget] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string, sources?: any[]}>>([])
  const [chatInput, setChatInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredArticles = knowledgeArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory
    const matchesType = selectedType === 'All' || article.type === selectedType
    
    return matchesSearch && matchesCategory && matchesType
  })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('metadata', JSON.stringify({
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        category: 'REFERENCE',
        tags: [],
        uploadedBy: 'Current User'
      }))

      // Mock upload (would call actual API)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Reset form
      setShowUploadModal(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Show success message (would refresh document list)
      alert('Document uploaded successfully!')
      
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: chatInput
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')

    // Mock AI response (would call actual chat API)
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `Based on the knowledge base, I can help you with that. Here's what I found relevant to "${chatInput}":\n\n• Electrical safety protocols require proper lockout/tagout procedures\n• PLC programming standards emphasize safety interlocks\n• Project management templates are available for timeline planning\n\nWould you like me to elaborate on any of these topics?`,
        sources: [
          { title: 'Electrical Safety Protocols', relevance: 0.89 },
          { title: 'PLC Programming Standards', relevance: 0.82 }
        ]
      }
      setChatMessages(prev => [...prev, aiResponse])
    }, 1500)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'checklist': return <FileText className="h-4 w-4" />
      case 'template': return <Download className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-500/20 text-red-400'
      case 'checklist': return 'bg-green-500/20 text-green-400'
      case 'template': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-blue-500/20 text-blue-400'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Knowledge Base
          </h1>
          <p className="text-slate-400">
            Access documentation, guides, and resources for engineering projects.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowChatWidget(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Ask AI</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles, guides, and documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            {types.map(type => (
              <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredArticles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600 transition-all duration-300 cursor-pointer group"
          >
            {/* Article Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getTypeColor(article.type)}`}>
                  {getTypeIcon(article.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-400">{article.category}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 mb-4">{article.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-700">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{article.readTime}</span>
                </div>
              </div>
              <span>Updated {article.lastUpdated}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Results */}
      {filteredArticles.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No articles found</h3>
          <p className="text-slate-400">Try adjusting your search terms or filters.</p>
        </motion.div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Upload Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Select File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.csv,.xls,.xlsx,.txt"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Supports: PDF, DOC, DOCX, CSV, XLS, XLSX, TXT (Max 50MB)
                </p>
              </div>
              
              {isUploading && (
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-sm text-white">Processing document...</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Extracting text, generating embeddings, and indexing for search.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Chat Widget */}
      {showChatWidget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl h-[600px] flex flex-col"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Knowledge Assistant</h3>
                  <p className="text-xs text-slate-400">Powered by your document library</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatWidget(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-white mb-2">Ask me anything!</h4>
                  <p className="text-slate-400 text-sm">
                    I can help you find information from your knowledge base including safety protocols, 
                    technical standards, and project guidelines.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                        : 'bg-slate-900/50 text-slate-100 border border-slate-700'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-600">
                          <p className="text-xs text-slate-400 mb-2">Sources:</p>
                          {msg.sources.map((source, idx) => (
                            <div key={idx} className="text-xs text-slate-300 mb-1 flex items-center space-x-2">
                              <Paperclip className="h-3 w-3" />
                              <span>{source.title}</span>
                              <span className="text-slate-500">({Math.round(source.relevance * 100)}% relevant)</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Chat Input */}
            <div className="p-4 border-t border-slate-700">
              <form onSubmit={handleChatSubmit} className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about safety protocols, technical standards, or project guidelines..."
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 pr-12"
                  />
                  <Paperclip className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
