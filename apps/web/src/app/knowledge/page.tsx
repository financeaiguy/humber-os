'use client'

import { chatEvents } from '@/lib/chat-events'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Search,
  FileText,
  Video,
  Download,
  Clock,
  User,
  Upload,
  MessageSquare,
  X,
  Grid,
  List,
  Filter,
  SortAsc,
  Eye,
  Share2,
  Bookmark,
  Tag,
  Folder,
  File,
  FileImage,
  FileVideo,
  MoreVertical,
  Edit3,
  Trash2,
  Archive,
  Brain,
  Zap,
  TrendingUp,
  Database,
  Cpu,
  Activity,
  Target
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { ContinuousLearningPanel } from '@/components/knowledge-base/continuous-learning-panel'
import { DocumentViewer } from '@/components/knowledge-base/document-viewer'
import { continuousLearning } from '@/lib/continuous-learning'
import { knowledgeNervousSystem, askAI, learnFromUserAction, addDocument } from '@/lib/knowledge-nervous-system'
import { api, useAPIService } from '@/lib/api-integration-service'

const mockDocuments = [
  {
    id: '1',
    title: 'Electrical Safety Protocols v2.3',
    type: 'pdf' as const,
    size: 2456789,
    url: '/docs/electrical-safety-v2.3.pdf',
    content: 'Comprehensive electrical safety protocols for automotive manufacturing environments including lockout/tagout procedures, PPE requirements, hazard identification, emergency response protocols, and regulatory compliance guidelines.',
    metadata: {
      author: 'Sarah Johnson',
      createdAt: '2025-01-10T10:00:00Z',
      updatedAt: '2025-01-15T14:30:00Z',
      tags: ['electrical', 'safety', 'automotive', 'protocols', 'manufacturing'],
      category: 'Safety Standards',
      description: 'Updated electrical safety protocols incorporating latest OSHA requirements and industry best practices.',
      version: 3,
      status: 'approved' as const,
      accessLevel: 'internal' as const,
      downloadCount: 247,
      viewCount: 1203,
      rating: 4.8,
      comments: 15
    },
    aiAnalysis: {
      summary: 'Comprehensive safety document covering electrical hazard prevention, lockout/tagout procedures, and emergency response protocols.',
      keyTopics: ['Lockout/Tagout', 'PPE Requirements', 'Emergency Response', 'Risk Assessment', 'Training Requirements'],
      relatedDocuments: ['general-safety-handbook', 'emergency-procedures', 'training-manual'],
      extractedData: {
        procedures: 15,
        checklistItems: 42,
        emergencyContacts: 8
      },
      sentiment: 'neutral' as const,
      complexity: 'medium' as const,
      completeness: 95
    }
  },
  {
    id: '2',
    title: 'PLC Programming Standards Manual',
    type: 'docx' as const,
    size: 1234567,
    url: '/docs/plc-programming-standards.docx',
    content: 'Standardized PLC programming guidelines covering naming conventions, code structure, documentation requirements, testing procedures, and version control practices for industrial automation systems.',
    metadata: {
      author: 'Michael Chen',
      createdAt: '2025-01-08T09:15:00Z',
      updatedAt: '2025-01-12T16:45:00Z',
      tags: ['plc', 'programming', 'automation', 'standards', 'controls'],
      category: 'Technical Standards',
      description: 'Coding standards and best practices for PLC programming across all automation projects.',
      version: 2,
      status: 'approved' as const,
      accessLevel: 'internal' as const,
      downloadCount: 156,
      viewCount: 892,
      rating: 4.6,
      comments: 8
    },
    aiAnalysis: {
      summary: 'Technical standards document outlining PLC programming conventions, naming standards, and code organization principles.',
      keyTopics: ['Naming Conventions', 'Code Structure', 'Documentation', 'Testing Procedures', 'Version Control'],
      relatedDocuments: ['automation-guidelines', 'hmi-standards', 'testing-procedures'],
      extractedData: {
        codeExamples: 23,
        standards: 31,
        bestPractices: 18
      },
      sentiment: 'positive' as const,
      complexity: 'high' as const,
      completeness: 88
    }
  },
  {
    id: '3',
    title: 'Project Handover Checklist Template',
    type: 'xlsx' as const,
    size: 567890,
    url: '/docs/project-handover-checklist.xlsx',
    metadata: {
      author: 'Lisa Thompson',
      createdAt: '2025-01-05T13:20:00Z',
      updatedAt: '2025-01-10T11:30:00Z',
      tags: ['project', 'handover', 'checklist', 'quality', 'process'],
      category: 'Process Templates',
      description: 'Comprehensive checklist ensuring smooth project transitions from engineering to client teams.',
      version: 4,
      status: 'approved' as const,
      accessLevel: 'public' as const,
      downloadCount: 89,
      viewCount: 445,
      rating: 4.9,
      comments: 3
    },
    aiAnalysis: {
      summary: 'Structured checklist template covering all aspects of project handover including documentation, training, and sign-offs.',
      keyTopics: ['Documentation Review', 'Training Completion', 'System Testing', 'Client Sign-off', 'Support Transition'],
      relatedDocuments: ['quality-standards', 'training-templates', 'client-communication'],
      extractedData: {
        checklistItems: 67,
        phases: 5,
        signOffs: 12
      },
      sentiment: 'positive' as const,
      complexity: 'low' as const,
      completeness: 100
    }
  },
  {
    id: '4',
    title: 'Robotic Welding System Configuration Guide',
    type: 'pdf' as const,
    size: 3456789,
    url: '/docs/robotic-welding-config.pdf',
    content: 'Detailed configuration procedures for robotic welding systems including calibration steps, programming interfaces, safety interlocks, and maintenance schedules.',
    metadata: {
      author: 'David Kim',
      createdAt: '2025-01-03T14:45:00Z',
      updatedAt: '2025-01-08T09:20:00Z',
      tags: ['robotics', 'welding', 'configuration', 'automation', 'manufacturing'],
      category: 'Technical Procedures',
      description: 'Step-by-step guide for configuring and calibrating robotic welding systems.',
      version: 1,
      status: 'review' as const,
      accessLevel: 'internal' as const,
      downloadCount: 67,
      viewCount: 234,
      rating: 4.4,
      comments: 5
    },
    aiAnalysis: {
      summary: 'Comprehensive configuration guide for robotic welding systems covering setup, calibration, and maintenance procedures.',
      keyTopics: ['System Configuration', 'Calibration Procedures', 'Safety Protocols', 'Maintenance Schedules', 'Programming'],
      relatedDocuments: ['robotic-systems-manual', 'welding-standards', 'safety-protocols'],
      extractedData: {
        configurationSteps: 34,
        safetyChecks: 18,
        maintenanceItems: 25
      },
      sentiment: 'neutral' as const,
      complexity: 'high' as const,
      completeness: 82
    }
  },
  {
    id: '5',
    title: 'Quality Control Testing Videos',
    type: 'video' as const,
    size: 125000000,
    url: '/videos/quality-control-training.mp4',
    metadata: {
      author: 'Emily Rodriguez',
      createdAt: '2024-12-28T11:15:00Z',
      updatedAt: '2025-01-02T16:30:00Z',
      tags: ['quality', 'testing', 'training', 'video', 'procedures'],
      category: 'Training Materials',
      description: 'Video series covering quality control testing procedures and equipment operation.',
      version: 1,
      status: 'approved' as const,
      accessLevel: 'public' as const,
      downloadCount: 34,
      viewCount: 567,
      rating: 4.7,
      comments: 12
    },
    aiAnalysis: {
      summary: 'Video training series demonstrating quality control testing procedures and equipment operation techniques.',
      keyTopics: ['Testing Procedures', 'Equipment Operation', 'Quality Standards', 'Visual Inspection', 'Documentation'],
      relatedDocuments: ['quality-standards', 'testing-equipment-manual', 'inspection-checklist'],
      extractedData: {
        videoSegments: 8,
        procedures: 12,
        equipmentTypes: 6
      },
      sentiment: 'positive' as const,
      complexity: 'medium' as const,
      completeness: 90
    }
  },
  {
    id: '6',
    title: 'Client Communication Templates Package',
    type: 'docx' as const,
    size: 890123,
    url: '/docs/client-communication-templates.docx',
    content: 'Collection of standardized templates for client communications including project status reports, change requests, milestone notifications, and issue escalation procedures.',
    metadata: {
      author: 'Sarah Johnson',
      createdAt: '2024-12-25T09:30:00Z',
      updatedAt: '2024-12-30T14:15:00Z',
      tags: ['communication', 'templates', 'client', 'reports', 'documentation'],
      category: 'Communication Tools',
      description: 'Standard templates for professional client communications throughout project lifecycle.',
      version: 2,
      status: 'approved' as const,
      accessLevel: 'internal' as const,
      downloadCount: 145,
      viewCount: 678,
      rating: 4.5,
      comments: 7
    },
    aiAnalysis: {
      summary: 'Professional communication templates for client interactions covering project updates, status reports, and milestone communications.',
      keyTopics: ['Project Updates', 'Status Reports', 'Milestone Communications', 'Professional Writing', 'Client Relations'],
      relatedDocuments: ['project-management-guide', 'communication-standards', 'client-handbook'],
      extractedData: {
        templates: 15,
        communicationTypes: 8,
        examples: 22
      },
      sentiment: 'positive' as const,
      complexity: 'low' as const,
      completeness: 94
    }
  }
]

const categories = ['All', 'Safety Standards', 'Technical Standards', 'Process Templates', 'Technical Procedures', 'Training Materials', 'Communication Tools']
const types = ['All', 'pdf', 'docx', 'xlsx', 'video', 'image', 'other']
const viewModes = ['grid', 'list'] as const
const sortOptions = [
  { value: 'updated', label: 'Last Updated' },
  { value: 'created', label: 'Date Created' },
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'File Size' },
  { value: 'downloads', label: 'Downloads' },
  { value: 'rating', label: 'Rating' }
]

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [sortBy, setSortBy] = useState('updated')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showDocumentViewer, setShowDocumentViewer] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [knowledgeStats, setKnowledgeStats] = useState<any>(null)
  const [aiInsights, setAiInsights] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadKnowledgeData()
  }, [])

  const loadKnowledgeData = async () => {
    try {
      // Use integrated API service for better tracking and AI insights
      try {
        const stats = await knowledgeNervousSystem.getKnowledgeStats()
        setKnowledgeStats(stats)
      } catch (statsError) {
        // Set default stats if loading fails
        setKnowledgeStats({
          totalNodes: 156,
          totalRelationships: 324,
          modelsActive: 3,
          averageConfidence: 0.85
        })
      }
      
      // Get AI insights using the knowledge nervous system
      try {
        const insights = await knowledgeNervousSystem.getInsights({
          sessionId: 'knowledge-session',
          currentPage: 'knowledge',
          currentFeature: 'knowledge-management',
          userRole: 'engineer',
          timestamp: new Date().toISOString(),
          environment: 'development'
        })
        setAiInsights(insights)
      } catch (insightsError) {
        // Set demo insights if loading fails
        setAiInsights([
          {
            id: 'demo-1',
            type: 'pattern',
            content: { pattern: 'Users frequently search for safety protocols during project setup', summary: 'High engagement with safety documentation' },
            confidence: 0.89
          },
          {
            id: 'demo-2', 
            type: 'trend',
            content: { pattern: 'Document upload patterns show peak activity on Mondays', summary: 'Weekly workflow optimization opportunity' },
            confidence: 0.76
          }
        ])
      }
      
      // Get recommendations using the knowledge nervous system
      try {
        const recs = await knowledgeNervousSystem.getRecommendations({
          sessionId: 'knowledge-session',
          currentPage: 'knowledge',
          currentFeature: 'knowledge-management', 
          userRole: 'engineer',
          timestamp: new Date().toISOString(),
          environment: 'development'
        })
        setRecommendations(recs)
      } catch (recsError) {
        // Set demo recommendations if loading fails
        setRecommendations([
          {
            id: 'rec-1',
            title: 'Update electrical safety protocols to latest standards',
            source: 'Compliance Analysis',
            priority: 'High'
          },
          {
            id: 'rec-2',
            title: 'Create template for project handover checklists',
            source: 'Workflow Optimization',
            priority: 'Medium'
          }
        ])
      }
    } catch (error) {
      // SECURITY: console statement removed: console.error('Failed to load knowledge data:', error)
    }
  }

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.metadata.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || doc.metadata.category === selectedCategory
    const matchesType = selectedType === 'All' || doc.type === selectedType
    
    return matchesSearch && matchesCategory && matchesType
  }).sort((a, b) => {
    switch (sortBy) {
      case 'updated':
        return new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
      case 'created':
        return new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()
      case 'name':
        return a.title.localeCompare(b.title)
      case 'size':
        return b.size - a.size
      case 'downloads':
        return b.metadata.downloadCount - a.metadata.downloadCount
      case 'rating':
        return b.metadata.rating - a.metadata.rating
      default:
        return 0
    }
  })

  // Learn from search interactions
  const handleSearch = async (value: string) => {
    setSearchTerm(value)
    if (value) {
      await learnFromUserAction({
        type: 'knowledge_search',
        query: value,
        resultsCount: filteredDocuments.length,
        timestamp: new Date().toISOString()
      }, {
        currentPage: 'knowledge',
        currentFeature: 'search'
      })
      
      continuousLearning.learn({
        type: 'knowledge_search',
        query: value,
        resultsCount: filteredDocuments.length,
        timestamp: new Date().toISOString()
      }, 'interaction')
    }
  }

  // Learn from category selection
  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category)
    await learnFromUserAction({
      type: 'knowledge_filter',
      filterType: 'category',
      value: category,
      timestamp: new Date().toISOString()
    }, {
      currentPage: 'knowledge',
      currentFeature: 'filter'
    })
    
    continuousLearning.learn({
      type: 'knowledge_filter',
      filterType: 'category',
      value: category,
      timestamp: new Date().toISOString()
    }, 'interaction')
  }

  // Learn from type selection
  const handleTypeChange = async (type: string) => {
    setSelectedType(type)
    await learnFromUserAction({
      type: 'knowledge_filter',
      filterType: 'type',
      value: type,
      timestamp: new Date().toISOString()
    }, {
      currentPage: 'knowledge',
      currentFeature: 'filter'
    })
    
    continuousLearning.learn({
      type: 'knowledge_filter',
      filterType: 'type',
      value: type,
      timestamp: new Date().toISOString()
    }, 'interaction')
  }

  // Learn from document views
  const handleDocumentClick = async (document: any) => {
    setSelectedDocument(document)
    setShowDocumentViewer(true)
    
    await learnFromUserAction({
      type: 'document_view',
      documentId: document.id,
      title: document.title,
      category: document.metadata.category,
      tags: document.metadata.tags,
      timestamp: new Date().toISOString()
    }, {
      currentPage: 'knowledge',
      currentFeature: 'document-viewer'
    })
    
    continuousLearning.learn({
      type: 'article_view',
      articleId: document.id,
      title: document.title,
      category: document.metadata.category,
      tags: document.metadata.tags,
      timestamp: new Date().toISOString()
    }, 'document')
  }

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
      
      // Learn from document upload
      await addDocument({
        title: file.name.replace(/\.[^/.]+$/, ''),
        type: file.type,
        size: file.size,
        category: 'REFERENCE',
        tags: [],
        timestamp: new Date().toISOString()
      }, {
        currentPage: 'knowledge',
        currentFeature: 'document-upload'
      })
      
      continuousLearning.learn({
        type: 'document_upload',
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        category: 'REFERENCE',
        timestamp: new Date().toISOString()
      }, 'document')
      
      // Reset form
      setShowUploadModal(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Show success message (would refresh document list)
      alert('Document uploaded successfully!')
      
    } catch (error) {
      // SECURITY: console statement removed: console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }


  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <FileVideo className="h-4 w-4" />
      case 'image': return <FileImage className="h-4 w-4" />
      case 'pdf':
      case 'doc':
      case 'docx': return <FileText className="h-4 w-4" />
      case 'xlsx':
      case 'csv': return <File className="h-4 w-4" />
      default: return <File className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400'
      case 'review': return 'bg-yellow-500/20 text-yellow-400'
      case 'draft': return 'bg-blue-500/20 text-blue-400'
      case 'archived': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-500/20 text-red-400'
      case 'image': return 'bg-green-500/20 text-green-400'
      case 'pdf': return 'bg-red-500/20 text-red-400'
      case 'docx': 
      case 'doc': return 'bg-blue-500/20 text-blue-400'
      case 'xlsx':
      case 'csv': return 'bg-green-500/20 text-green-400'
      default: return 'bg-purple-500/20 text-purple-400'
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
            Access documentation, guides, and resources powered by AI. The central nervous system for Humber OS.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              showAIPanel 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
            }`}
          >
            <Brain className="h-4 w-4" />
            <span>AI Insights</span>
          </button>
          <button
            onClick={() => chatEvents.openChat()}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300"
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
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents, guides, and resources..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            {types.map(type => (
              <option key={type} value={type}>{type === 'All' ? 'All Types' : type.toUpperCase()}</option>
            ))}
          </select>
          
          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900/50 border border-slate-600 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-l-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-r-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* AI Insights Panel */}
      <AnimatePresence>
        {showAIPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-400" />
                AI Knowledge Insights
              </h3>
              <button
                onClick={() => setShowAIPanel(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Knowledge Stats */}
              {knowledgeStats && (
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <h4 className="text-lg font-medium text-white mb-3 flex items-center">
                    <Database className="h-4 w-4 mr-2 text-blue-400" />
                    Knowledge Base
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Documents:</span>
                      <span className="text-white font-medium">{knowledgeStats.totalNodes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Relationships:</span>
                      <span className="text-white font-medium">{knowledgeStats.totalRelationships}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">AI Models Active:</span>
                      <span className="text-white font-medium">{knowledgeStats.modelsActive}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Confidence:</span>
                      <span className="text-green-400 font-medium">{Math.round(knowledgeStats.averageConfidence * 100)}%</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* AI Insights */}
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h4 className="text-lg font-medium text-white mb-3 flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                  Latest Insights
                </h4>
                <div className="space-y-2">
                  {aiInsights.slice(0, 3).map((insight, index) => (
                    <div key={insight.id} className="p-2 bg-slate-700/50 rounded-lg">
                      <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                        {insight.type}
                      </div>
                      <div className="text-sm text-slate-300">
                        {insight.content.pattern || insight.content.summary || 'AI learning pattern detected'}
                      </div>
                      <div className="text-xs text-blue-400 mt-1">
                        Confidence: {Math.round(insight.confidence * 100)}%
                      </div>
                    </div>
                  ))}
                  {aiInsights.length === 0 && (
                    <div className="text-sm text-slate-400 text-center py-2">
                      Learning from your interactions...
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recommendations */}
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h4 className="text-lg font-medium text-white mb-3 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-green-400" />
                  Recommendations
                </h4>
                <div className="space-y-2">
                  {recommendations.slice(0, 3).map((rec, index) => (
                    <div key={rec.id} className="p-2 bg-slate-700/50 rounded-lg">
                      <div className="text-sm text-slate-300 mb-1">
                        {rec.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        From: {rec.source}
                      </div>
                      <div className="text-xs text-purple-400 mt-1">
                        Priority: {rec.priority}
                      </div>
                    </div>
                  ))}
                  {recommendations.length === 0 && (
                    <div className="text-sm text-slate-400 text-center py-2">
                      No recommendations yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continuous Learning Panel */}
      <ContinuousLearningPanel />

      {/* Documents Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDocuments.map((document, index) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              onClick={() => handleDocumentClick(document)}
              className="rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600 transition-all duration-300 cursor-pointer group"
            >
              {/* Document Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(document.type)}`}>
                    {getTypeIcon(document.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                      {document.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-slate-400 mt-1">
                      <span>{document.metadata.category}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(document.metadata.status)}`}>
                        {document.metadata.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-1 hover:bg-slate-700 rounded transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-300 mb-4 line-clamp-3">{document.metadata.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-400">{document.metadata.viewCount}</div>
                  <div className="text-xs text-slate-400">Views</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-400">{document.metadata.downloadCount}</div>
                  <div className="text-xs text-slate-400">Downloads</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-400">{document.metadata.rating}</div>
                  <div className="text-xs text-slate-400">Rating</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {document.metadata.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full">
                    #{tag}
                  </span>
                ))}
                {document.metadata.tags.length > 3 && (
                  <span className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-full">
                    +{document.metadata.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-700">
                <div className="flex items-center space-x-2">
                  <User className="h-3 w-3" />
                  <span>{document.metadata.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>{formatFileSize(document.size)}</span>
                  <span>•</span>
                  <span>v{document.metadata.version}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((document, index) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              onClick={() => handleDocumentClick(document)}
              className="rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4 hover:border-slate-600 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${getTypeColor(document.type)}`}>
                  {getTypeIcon(document.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {document.title}
                      </h3>
                      <p className="text-sm text-slate-300 mt-1 line-clamp-2">
                        {document.metadata.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2">
                        <span>{document.metadata.category}</span>
                        <span>•</span>
                        <span>{document.metadata.author}</span>
                        <span>•</span>
                        <span>{formatFileSize(document.size)}</span>
                        <span>•</span>
                        <span>v{document.metadata.version}</span>
                        <span className={`px-2 py-0.5 rounded-full ${getStatusColor(document.metadata.status)}`}>
                          {document.metadata.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-center">
                      <div>
                        <div className="text-sm font-bold text-blue-400">{document.metadata.viewCount}</div>
                        <div className="text-xs text-slate-400">Views</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-green-400">{document.metadata.downloadCount}</div>
                        <div className="text-xs text-slate-400">Downloads</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-yellow-400">{document.metadata.rating}</div>
                        <div className="text-xs text-slate-400">Rating</div>
                      </div>
                      <button className="p-2 hover:bg-slate-700 rounded transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-3">
                    {document.metadata.tags.slice(0, 5).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                    {document.metadata.tags.length > 5 && (
                      <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-xs rounded-full">
                        +{document.metadata.tags.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* No Results */}
      {filteredDocuments.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No documents found</h3>
          <p className="text-slate-400">Try adjusting your search terms or filters.</p>
        </motion.div>
      )}

      {/* Document Viewer */}
      <DocumentViewer
        isOpen={showDocumentViewer}
        onClose={() => {
          setShowDocumentViewer(false)
          setSelectedDocument(null)
        }}
        document={selectedDocument}
        documents={filteredDocuments}
        onDocumentChange={(doc) => setSelectedDocument(doc)}
      />

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
                  accept=".pdf,.doc,.docx,.csv,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.mp4,.mov"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Supports: PDF, DOC, DOCX, CSV, XLS, XLSX, TXT, Images, Videos (Max 50MB)
                </p>
              </div>
              
              {isUploading && (
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-sm text-white">Processing document...</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Extracting text, generating embeddings, analyzing content, and integrating with AI nervous system.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

    </div>
  )
}