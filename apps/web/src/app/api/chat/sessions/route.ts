import { NextRequest, NextResponse } from 'next/server'

// Mock conversation data for fallback API
const mockConversations = [
  {
    id: 'session_001',
    title: 'Electrical Safety Protocols Discussion',
    description: 'Detailed conversation about automotive plant safety requirements',
    messageCount: 12,
    lastMessageAt: Date.now() - 300000,
    createdAt: Date.now() - 86400000,
    userId: 'user_current',
    userName: 'You',
    userAvatar: 'YO',
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
    },
    participants: []
  },
  {
    id: 'session_002',
    title: 'Sarah Johnson - Engineer Profile Review',
    messageCount: 8,
    lastMessageAt: Date.now() - 3600000,
    createdAt: Date.now() - 172800000,
    userId: 'user_current',
    userName: 'You',
    userAvatar: 'YO',
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
    id: 'session_003',
    title: 'PLC Programming Best Practices',
    messageCount: 15,
    lastMessageAt: Date.now() - 7200000,
    createdAt: Date.now() - 259200000,
    userId: 'user_002',
    userName: 'John Smith',
    userAvatar: 'JS',
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
    id: 'session_004',
    title: 'Time Tracking System Tutorial',
    messageCount: 6,
    lastMessageAt: Date.now() - 10800000,
    createdAt: Date.now() - 345600000,
    userId: 'user_003',
    userName: 'Mary Johnson',
    userAvatar: 'MJ',
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
    },
    participants: []
  },
  {
    id: 'session_005',
    title: 'Project Budget Analysis - GM Contract',
    description: 'Financial analysis and resource allocation discussion',
    messageCount: 20,
    lastMessageAt: Date.now() - 14400000,
    createdAt: Date.now() - 432000000,
    userId: 'user_004',
    userName: 'Jennifer Davis',
    userAvatar: 'JD',
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const scope = searchParams.get('scope') || 'my'
    const category = searchParams.get('category') || 'all'
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'recent'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Simulate slight delay for realistic API behavior
    await new Promise(resolve => setTimeout(resolve, 100))
    
    let filteredConversations = [...mockConversations]
    
    // Apply scope filter
    if (scope === 'my') {
      filteredConversations = filteredConversations.filter(c => c.userId === 'user_current')
    } else if (scope === 'shared') {
      filteredConversations = filteredConversations.filter(c => c.isShared || c.isPublic)
    }
    // 'all' scope includes all conversations
    
    // Apply category filter
    if (category !== 'all') {
      filteredConversations = filteredConversations.filter(c => c.category === category)
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredConversations = filteredConversations.filter(c => 
        c.title.toLowerCase().includes(searchLower) ||
        c.lastMessage.content.toLowerCase().includes(searchLower) ||
        c.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        (c.description && c.description.toLowerCase().includes(searchLower))
      )
    }
    
    // Apply sorting
    filteredConversations.sort((a, b) => {
      switch (sortBy) {
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
    
    // Apply pagination
    const paginatedConversations = filteredConversations.slice(offset, offset + limit)
    
    console.log(`📊 Next.js API: Returning ${paginatedConversations.length} of ${filteredConversations.length} conversations`)
    
    return NextResponse.json({
      success: true,
      sessions: paginatedConversations,
      totalSessions: filteredConversations.length,
      hasMore: offset + limit < filteredConversations.length,
      filters: {
        scope,
        category,
        search,
        sortBy
      },
      pagination: {
        offset,
        limit,
        total: filteredConversations.length
      },
      source: 'nextjs-api' // Indicator that this came from Next.js API, not worker
    })
    
  } catch (error) {
    console.error('Error in chat sessions API:', error)
    
    return NextResponse.json({
      error: 'Failed to load chat sessions',
      message: 'Unable to retrieve conversations. Please try again.'
    }, { status: 500 })
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse('', {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tenant-ID',
    },
  })
}
