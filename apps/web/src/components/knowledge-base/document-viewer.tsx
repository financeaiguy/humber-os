'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Eye, 
  Share2, 
  Bookmark, 
  Clock, 
  User, 
  Tag,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Heart,
  MessageSquare,
  Edit3,
  Trash2,
  Archive,
  Upload,
  FileImage,
  FileVideo,
  File,
  Folder,
  Grid,
  List,
  Filter,
  SortAsc,
  MoreVertical
} from 'lucide-react'

interface Document {
  id: string
  title: string
  type: 'pdf' | 'doc' | 'docx' | 'xlsx' | 'csv' | 'txt' | 'image' | 'video' | 'audio' | 'other'
  size: number
  url: string
  preview?: string
  content?: string
  metadata: {
    author: string
    createdAt: string
    updatedAt: string
    tags: string[]
    category: string
    description: string
    version: number
    status: 'draft' | 'review' | 'approved' | 'archived'
    accessLevel: 'public' | 'internal' | 'restricted' | 'confidential'
    downloadCount: number
    viewCount: number
    rating: number
    comments: number
  }
  aiAnalysis?: {
    summary: string
    keyTopics: string[]
    relatedDocuments: string[]
    extractedData: any
    sentiment: 'positive' | 'neutral' | 'negative'
    complexity: 'low' | 'medium' | 'high'
    completeness: number
  }
}

interface DocumentViewerProps {
  isOpen: boolean
  onClose: () => void
  document?: Document | null
  documents: Document[]
  onDocumentChange?: (doc: Document) => void
}

const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Electrical Safety Protocols v2.3',
    type: 'pdf',
    size: 2456789,
    url: '/docs/electrical-safety-v2.3.pdf',
    preview: '/previews/electrical-safety.jpg',
    content: 'Comprehensive electrical safety protocols for automotive manufacturing...',
    metadata: {
      author: 'Sarah Johnson',
      createdAt: '2025-01-10T10:00:00Z',
      updatedAt: '2025-01-15T14:30:00Z',
      tags: ['electrical', 'safety', 'automotive', 'protocols', 'manufacturing'],
      category: 'Safety Standards',
      description: 'Updated electrical safety protocols incorporating latest OSHA requirements and industry best practices.',
      version: 3,
      status: 'approved',
      accessLevel: 'internal',
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
      sentiment: 'neutral',
      complexity: 'medium',
      completeness: 95
    }
  },
  {
    id: '2',
    title: 'PLC Programming Standards',
    type: 'docx',
    size: 1234567,
    url: '/docs/plc-programming-standards.docx',
    content: 'Standardized PLC programming guidelines and best practices...',
    metadata: {
      author: 'Michael Chen',
      createdAt: '2025-01-08T09:15:00Z',
      updatedAt: '2025-01-12T16:45:00Z',
      tags: ['plc', 'programming', 'automation', 'standards', 'controls'],
      category: 'Technical Standards',
      description: 'Coding standards and best practices for PLC programming across all automation projects.',
      version: 2,
      status: 'approved',
      accessLevel: 'internal',
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
      sentiment: 'positive',
      complexity: 'high',
      completeness: 88
    }
  },
  {
    id: '3',
    title: 'Project Handover Checklist',
    type: 'xlsx',
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
      status: 'approved',
      accessLevel: 'public',
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
      sentiment: 'positive',
      complexity: 'low',
      completeness: 100
    }
  }
]

export function DocumentViewer({ isOpen, onClose, document: initialDocument, documents, onDocumentChange }: DocumentViewerProps) {
  const [currentDocument, setCurrentDocument] = useState<Document | null>(initialDocument || null)
  const [viewMode, setViewMode] = useState<'preview' | 'content' | 'metadata' | 'analysis'>('preview')
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (initialDocument) {
      setCurrentDocument(initialDocument)
    }
  }, [initialDocument])

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'doc':
      case 'docx':
        return <FileText className="h-6 w-6" />
      case 'image':
        return <FileImage className="h-6 w-6" />
      case 'video':
        return <FileVideo className="h-6 w-6" />
      default:
        return <File className="h-6 w-6" />
    }
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

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'public': return 'bg-green-500/20 text-green-400'
      case 'internal': return 'bg-blue-500/20 text-blue-400'
      case 'restricted': return 'bg-yellow-500/20 text-yellow-400'
      case 'confidential': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const handleDownload = () => {
    if (currentDocument) {
      // Mock download
      console.log('Downloading:', currentDocument.title)
      // In real implementation, would trigger actual download
      const link = document.createElement('a')
      link.href = currentDocument.url
      link.download = currentDocument.title
      link.click()
    }
  }

  const handleShare = () => {
    if (currentDocument) {
      navigator.clipboard.writeText(`${window.location.origin}/documents/${currentDocument.id}`)
      // Show toast notification
    }
  }

  const navigateDocument = (direction: 'prev' | 'next') => {
    if (!currentDocument || !documents.length) return
    
    const currentIndex = documents.findIndex(doc => doc.id === currentDocument.id)
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    
    if (newIndex >= documents.length) newIndex = 0
    if (newIndex < 0) newIndex = documents.length - 1
    
    const newDocument = documents[newIndex]
    setCurrentDocument(newDocument)
    onDocumentChange?.(newDocument)
  }

  if (!isOpen || !currentDocument) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full h-full flex"
        >
          {/* Document Content Area */}
          <div className="flex-1 flex flex-col bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
                
                <div className="flex items-center space-x-3">
                  <div className="text-blue-400">
                    {getFileIcon(currentDocument.type)}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white truncate max-w-md">
                      {currentDocument.title}
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <span>{formatFileSize(currentDocument.size)}</span>
                      <span>•</span>
                      <span>{currentDocument.metadata.author}</span>
                      <span>•</span>
                      <span>v{currentDocument.metadata.version}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      viewMode === 'preview' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setViewMode('content')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      viewMode === 'content' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Content
                  </button>
                  <button
                    onClick={() => setViewMode('metadata')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      viewMode === 'metadata' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setViewMode('analysis')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      viewMode === 'analysis' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    AI Analysis
                  </button>
                </div>

                <div className="h-6 w-px bg-slate-600" />

                <button
                  onClick={() => navigateDocument('prev')}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Previous document"
                >
                  <ChevronLeft className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  onClick={() => navigateDocument('next')}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Next document"
                >
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                <div className="h-6 w-px bg-slate-600" />

                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-2 rounded-lg transition-colors ${
                    isBookmarked ? 'text-yellow-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-700'
                  }`}
                  title="Bookmark"
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Share"
                >
                  <Share2 className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  onClick={handleDownload}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Toolbar */}
            {viewMode === 'preview' && (
              <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800/50">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setZoom(Math.max(25, zoom - 25))}
                    className="p-1 hover:bg-slate-700 rounded transition-colors"
                  >
                    <ZoomOut className="h-4 w-4 text-slate-400" />
                  </button>
                  <span className="text-sm text-slate-400 min-w-[60px] text-center">{zoom}%</span>
                  <button
                    onClick={() => setZoom(Math.min(200, zoom + 25))}
                    className="p-1 hover:bg-slate-700 rounded transition-colors"
                  >
                    <ZoomIn className="h-4 w-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => setRotation((rotation + 90) % 360)}
                    className="p-1 hover:bg-slate-700 rounded transition-colors ml-2"
                  >
                    <RotateCw className="h-4 w-4 text-slate-400" />
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-400">Page</span>
                    <input
                      type="number"
                      value={currentPage}
                      onChange={(e) => setCurrentPage(Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      min="1"
                      max={totalPages}
                    />
                    <span className="text-sm text-slate-400">of {totalPages}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6">
              {viewMode === 'preview' && (
                <div className="flex justify-center">
                  <div
                    className="bg-white rounded-lg shadow-lg max-w-4xl"
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                      transformOrigin: 'center'
                    }}
                  >
                    {currentDocument.preview ? (
                      <img
                        src={currentDocument.preview}
                        alt={currentDocument.title}
                        className="w-full h-auto rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-96 flex items-center justify-center bg-slate-100 rounded-lg">
                        <div className="text-center">
                          {getFileIcon(currentDocument.type)}
                          <p className="mt-2 text-slate-600">Preview not available</p>
                          <p className="text-sm text-slate-500">Download to view content</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {viewMode === 'content' && (
                <div className="max-w-4xl mx-auto">
                  <div className="prose prose-invert max-w-none">
                    {currentDocument.content ? (
                      <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">
                        {currentDocument.content}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">Content not available</h3>
                        <p className="text-slate-400">This document type doesn't support text preview.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {viewMode === 'metadata' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Basic Info */}
                  <div className="bg-slate-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Document Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-400">Title</label>
                        <p className="text-white">{currentDocument.title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-400">Type</label>
                        <p className="text-white uppercase">{currentDocument.type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-400">Size</label>
                        <p className="text-white">{formatFileSize(currentDocument.size)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-400">Version</label>
                        <p className="text-white">v{currentDocument.metadata.version}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-400">Status</label>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(currentDocument.metadata.status)}`}>
                          {currentDocument.metadata.status}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-400">Access Level</label>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${getAccessLevelColor(currentDocument.metadata.accessLevel)}`}>
                          {currentDocument.metadata.accessLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Author & Dates */}
                  <div className="bg-slate-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Author & Timeline</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-400">Author</label>
                        <p className="text-white">{currentDocument.metadata.author}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-400">Created</label>
                        <p className="text-white">{new Date(currentDocument.metadata.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-400">Last Updated</label>
                        <p className="text-white">{new Date(currentDocument.metadata.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Categories & Tags */}
                  <div className="bg-slate-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Classification</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-400">Category</label>
                        <p className="text-white">{currentDocument.metadata.category}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-400">Description</label>
                        <p className="text-white">{currentDocument.metadata.description}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-400">Tags</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {currentDocument.metadata.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="bg-slate-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{currentDocument.metadata.viewCount}</div>
                        <div className="text-sm text-slate-400">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{currentDocument.metadata.downloadCount}</div>
                        <div className="text-sm text-slate-400">Downloads</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">{currentDocument.metadata.rating}</div>
                        <div className="text-sm text-slate-400">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{currentDocument.metadata.comments}</div>
                        <div className="text-sm text-slate-400">Comments</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {viewMode === 'analysis' && currentDocument.aiAnalysis && (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* AI Summary */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-purple-400" />
                      AI Summary
                    </h3>
                    <p className="text-slate-300 leading-relaxed">{currentDocument.aiAnalysis.summary}</p>
                  </div>

                  {/* Key Topics */}
                  <div className="bg-slate-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Key Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentDocument.aiAnalysis.keyTopics.map(topic => (
                        <span key={topic} className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-800/50 rounded-xl p-6 text-center">
                      <div className="text-2xl font-bold text-green-400 mb-2">
                        {currentDocument.aiAnalysis.sentiment.charAt(0).toUpperCase() + currentDocument.aiAnalysis.sentiment.slice(1)}
                      </div>
                      <div className="text-sm text-slate-400">Sentiment</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-6 text-center">
                      <div className="text-2xl font-bold text-yellow-400 mb-2">
                        {currentDocument.aiAnalysis.complexity.charAt(0).toUpperCase() + currentDocument.aiAnalysis.complexity.slice(1)}
                      </div>
                      <div className="text-sm text-slate-400">Complexity</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-6 text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-2">
                        {currentDocument.aiAnalysis.completeness}%
                      </div>
                      <div className="text-sm text-slate-400">Completeness</div>
                    </div>
                  </div>

                  {/* Extracted Data */}
                  <div className="bg-slate-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Extracted Data</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(currentDocument.aiAnalysis.extractedData).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-xl font-bold text-blue-400">{value as any}</div>
                          <div className="text-sm text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Related Documents */}
                  <div className="bg-slate-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Related Documents</h3>
                    <div className="space-y-2">
                      {currentDocument.aiAnalysis.relatedDocuments.map(docId => (
                        <div key={docId} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors cursor-pointer">
                          <FileText className="h-4 w-4 text-blue-400" />
                          <span className="text-slate-300 capitalize">{docId.replace(/-/g, ' ')}</span>
                          <ExternalLink className="h-3 w-3 text-slate-500 ml-auto" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}