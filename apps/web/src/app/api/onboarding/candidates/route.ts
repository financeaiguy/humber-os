import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

interface OnboardingCandidate {
  id: string
  name: string
  email: string
  role: string
  status: 'vetting' | 'offer_letter' | 'legal' | 'immigration' | 'final_review' | 'completed'
  phase: number
  progress: number
  startDate: string
  lastUpdate: string
  assignedTo?: string
  location?: string
  documents?: {
    resume?: boolean
    offer?: boolean
    background?: boolean
    i9?: boolean
    visa?: boolean
  }
  recruiter?: string
  priority?: 'high' | 'medium' | 'normal'
  estimatedCompletion?: string
  notes?: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const userRole = session.user.role

    // Mock candidates data - in production, this would come from your database
    let candidates: OnboardingCandidate[] = [
      {
        id: '1',
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        role: 'Senior DevOps Engineer',
        status: 'offer_letter',
        phase: 2,
        progress: 35,
        startDate: '2024-01-20',
        lastUpdate: '2 hours ago',
        location: 'Seattle, WA',
        assignedTo: 'tech-corp-123',
        recruiter: 'TechTalent Global',
        priority: 'high',
        estimatedCompletion: '2024-02-15',
        documents: { 
          resume: true, 
          offer: false, 
          background: true,
          i9: false,
          visa: false
        },
        notes: 'Experienced engineer with strong Kubernetes background'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        role: 'Cloud Platform Engineer',
        status: 'immigration',
        phase: 4,
        progress: 75,
        startDate: '2024-01-15',
        lastUpdate: '1 day ago',
        location: 'Austin, TX',
        assignedTo: 'enterprise-solutions-456',
        recruiter: 'Engineering Elite',
        priority: 'medium',
        estimatedCompletion: '2024-02-10',
        documents: { 
          resume: true, 
          offer: true, 
          background: true,
          i9: true,
          visa: false
        },
        notes: 'Waiting for work authorization documents'
      },
      {
        id: '3',
        name: 'David Kim',
        email: 'david.kim@example.com',
        role: 'Site Reliability Engineer',
        status: 'vetting',
        phase: 1,
        progress: 20,
        startDate: '2024-01-25',
        lastUpdate: '30 minutes ago',
        location: 'New York, NY',
        assignedTo: 'fintech-startup-789',
        recruiter: 'TechTalent Global',
        priority: 'normal',
        estimatedCompletion: '2024-02-20',
        documents: { 
          resume: true,
          offer: false,
          background: false,
          i9: false,
          visa: false
        },
        notes: 'Background check in progress'
      },
      {
        id: '4',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@example.com',
        role: 'Infrastructure Engineer',
        status: 'legal',
        phase: 3,
        progress: 60,
        startDate: '2024-01-18',
        lastUpdate: '4 hours ago',
        location: 'Denver, CO',
        assignedTo: 'healthcare-tech-101',
        recruiter: 'Elite Engineering',
        priority: 'high',
        estimatedCompletion: '2024-02-12',
        documents: { 
          resume: true, 
          offer: true, 
          background: true,
          i9: false,
          visa: false
        },
        notes: 'Contract review in final stages'
      },
      {
        id: '5',
        name: 'Alex Rivera',
        email: 'alex.rivera@example.com',
        role: 'Platform Engineer',
        status: 'completed',
        phase: 6,
        progress: 100,
        startDate: '2024-01-10',
        lastUpdate: 'Completed',
        location: 'Chicago, IL',
        assignedTo: 'manufacturing-corp-202',
        recruiter: 'TechTalent Global',
        priority: 'normal',
        estimatedCompletion: '2024-02-05',
        documents: { 
          resume: true, 
          offer: true, 
          background: true,
          i9: true,
          visa: true
        },
        notes: 'Successfully onboarded and deployed'
      },
      {
        id: '6',
        name: 'James Wilson',
        email: 'james.wilson@example.com',
        role: 'Security Engineer',
        status: 'final_review',
        phase: 5,
        progress: 90,
        startDate: '2024-01-12',
        lastUpdate: '6 hours ago',
        location: 'San Francisco, CA',
        assignedTo: 'cyber-security-303',
        recruiter: 'SecureTech Recruiting',
        priority: 'high',
        estimatedCompletion: '2024-02-08',
        documents: { 
          resume: true, 
          offer: true, 
          background: true,
          i9: true,
          visa: false
        },
        notes: 'Final security clearance verification pending'
      },
      {
        id: '7',
        name: 'Lisa Thompson',
        email: 'lisa.thompson@example.com',
        role: 'Database Engineer',
        status: 'offer_letter',
        phase: 2,
        progress: 40,
        startDate: '2024-01-22',
        lastUpdate: '1 hour ago',
        location: 'Portland, OR',
        assignedTo: 'data-analytics-404',
        recruiter: 'DataPro Staffing',
        priority: 'medium',
        estimatedCompletion: '2024-02-18',
        documents: { 
          resume: true, 
          offer: false, 
          background: true,
          i9: false,
          visa: false
        },
        notes: 'Offer letter under review by candidate'
      }
    ]

    // Filter based on user role
    if (userRole === 'ENGINEER_EMPLOYEE') {
      // Engineers only see their own onboarding
      candidates = candidates.filter(c => c.email === session.user.email)
      
      // If engineer not found, create their own record
      if (candidates.length === 0) {
        candidates = [{
          id: 'self',
          name: session.user.name || 'Your Onboarding',
          email: session.user.email,
          role: 'Engineer',
          status: 'vetting',
          phase: 1,
          progress: 15,
          startDate: new Date().toISOString().split('T')[0],
          lastUpdate: 'Just started',
          location: 'Remote',
          documents: { resume: true },
          notes: 'Your onboarding journey has begun'
        }]
      }
    } else if (userRole === 'CUSTOMER') {
      // Customers see engineers assigned to them
      const orgId = session.user.organizationId
      candidates = candidates.filter(c => c.assignedTo === orgId)
    }
    // Operators and admins see all candidates

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      candidates = candidates.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.role.toLowerCase().includes(searchLower) ||
        c.location?.toLowerCase().includes(searchLower) ||
        c.recruiter?.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (status && status !== 'all') {
      candidates = candidates.filter(c => c.status === status)
    }

    // Add real-time simulation - randomly update some progress values
    candidates = candidates.map(c => ({
      ...c,
      progress: Math.min(100, c.progress + Math.floor(Math.random() * 3))
    }))

    return NextResponse.json({
      candidates,
      total: candidates.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Failed to fetch onboarding candidates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only operators and admins can create new candidates
    if (!['PARTNER_OPERATOR', 'PARTNER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const candidateData = await request.json()
    
    // Validate required fields
    const required = ['name', 'email', 'role', 'startDate', 'location']
    for (const field of required) {
      if (!candidateData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create new candidate record
    const newCandidate: OnboardingCandidate = {
      id: `candidate_${Date.now()}`,
      name: candidateData.name,
      email: candidateData.email,
      role: candidateData.role,
      status: 'vetting',
      phase: 1,
      progress: 0,
      startDate: candidateData.startDate,
      lastUpdate: 'Just created',
      location: candidateData.location,
      assignedTo: candidateData.assignedTo,
      recruiter: candidateData.recruiter,
      priority: candidateData.priority || 'normal',
      documents: {
        resume: false,
        offer: false,
        background: false,
        i9: false,
        visa: false
      },
      notes: candidateData.notes || 'New candidate added to onboarding pipeline'
    }

    // In production, save to database
    // await saveCandidate(newCandidate)

    return NextResponse.json({
      success: true,
      candidate: newCandidate,
      message: 'Candidate added successfully'
    })

  } catch (error) {
    console.error('Failed to create candidate:', error)
    return NextResponse.json(
      { error: 'Failed to create candidate' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { candidateId, updates } = await request.json()
    
    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      )
    }

    // Engineers can only update their own records
    if (session.user.role === 'ENGINEER_EMPLOYEE' && candidateId !== 'self') {
      const candidate = await getCandidateById(candidateId)
      if (candidate?.email !== session.user.email) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }

    // Validate status transitions
    const validStatuses = ['vetting', 'offer_letter', 'legal', 'immigration', 'final_review', 'completed']
    if (updates.status && !validStatuses.includes(updates.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // In production, update database
    const updatedCandidate = {
      ...updates,
      lastUpdate: new Date().toISOString(),
      id: candidateId
    }

    return NextResponse.json({
      success: true,
      candidate: updatedCandidate,
      message: 'Candidate updated successfully'
    })

  } catch (error) {
    console.error('Failed to update candidate:', error)
    return NextResponse.json(
      { error: 'Failed to update candidate' },
      { status: 500 }
    )
  }
}

// Helper function - in production this would query your database
async function getCandidateById(id: string) {
  // Mock implementation
  return { id, email: 'mock@example.com' }
}