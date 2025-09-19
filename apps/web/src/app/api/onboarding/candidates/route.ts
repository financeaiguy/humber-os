import { NextRequest, NextResponse } from 'next/server'

// Mock data matching the OnboardingCandidate interface
const mockCandidates = [
  {
    id: 'cand_001',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    role: 'Senior Mechanical Engineer',
    status: 'vetting' as const,
    phase: 1,
    progress: 45,
    startDate: '2025-01-20',
    lastUpdate: new Date().toISOString(),
    assignedTo: 'TechTalent Global',
    location: 'Detroit, MI',
    documents: {
      resume: true,
      offer: false,
      background: true,
      i9: false,
      visa: false
    },
    recruiter: 'TechTalent Global',
    priority: 'high' as const,
    estimatedCompletion: '2025-01-25',
    notes: 'Fast-track candidate with excellent background'
  },
  {
    id: 'cand_002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: 'Controls Engineer',
    status: 'offer_letter' as const,
    phase: 2,
    progress: 70,
    startDate: '2025-01-22',
    lastUpdate: new Date().toISOString(),
    assignedTo: 'Engineering Elite',
    location: 'Chicago, IL',
    documents: {
      resume: true,
      offer: true,
      background: true,
      i9: false,
      visa: false
    },
    recruiter: 'Engineering Elite',
    priority: 'medium' as const,
    estimatedCompletion: '2025-01-28',
    notes: 'Pending offer letter acceptance'
  },
  {
    id: 'cand_003',
    name: 'David Rodriguez',
    email: 'david.rodriguez@example.com',
    role: 'Software Engineer',
    status: 'legal' as const,
    phase: 3,
    progress: 85,
    startDate: '2025-01-15',
    lastUpdate: new Date().toISOString(),
    assignedTo: 'Legal Team',
    location: 'Austin, TX',
    documents: {
      resume: true,
      offer: true,
      background: true,
      i9: true,
      visa: false
    },
    recruiter: 'Tech Recruiters Inc',
    priority: 'normal' as const,
    estimatedCompletion: '2025-01-24',
    notes: 'Legal review in progress'
  },
  {
    id: 'cand_004',
    name: 'Emily Zhang',
    email: 'emily.zhang@example.com',
    role: 'Project Manager',
    status: 'immigration' as const,
    phase: 4,
    progress: 90,
    startDate: '2025-01-10',
    lastUpdate: new Date().toISOString(),
    assignedTo: 'Immigration Services',
    location: 'San Francisco, CA',
    documents: {
      resume: true,
      offer: true,
      background: true,
      i9: true,
      visa: true
    },
    recruiter: 'Global Talent Solutions',
    priority: 'high' as const,
    estimatedCompletion: '2025-01-23',
    notes: 'Visa processing in final stages'
  },
  {
    id: 'cand_005',
    name: 'Robert Kim',
    email: 'robert.kim@example.com',
    role: 'Quality Assurance Engineer',
    status: 'final_review' as const,
    phase: 5,
    progress: 95,
    startDate: '2025-01-08',
    lastUpdate: new Date().toISOString(),
    assignedTo: 'HR Manager',
    location: 'Seattle, WA',
    documents: {
      resume: true,
      offer: true,
      background: true,
      i9: true,
      visa: true
    },
    recruiter: 'Premier Staffing',
    priority: 'medium' as const,
    estimatedCompletion: '2025-01-21',
    notes: 'Final documentation review'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let filteredCandidates = [...mockCandidates]

    // Filter by status
    if (status && status !== 'all') {
      filteredCandidates = filteredCandidates.filter(candidate =>
        candidate.status === status
      )
    }

    // Filter by search term
    if (search) {
      const searchTerm = search.toLowerCase()
      filteredCandidates = filteredCandidates.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm) ||
        candidate.role.toLowerCase().includes(searchTerm) ||
        candidate.email.toLowerCase().includes(searchTerm) ||
        (candidate.location && candidate.location.toLowerCase().includes(searchTerm))
      )
    }

    return NextResponse.json({
      candidates: filteredCandidates,
      total: filteredCandidates.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching candidates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const candidateData = await request.json()

    // Create new candidate with generated ID
    const newCandidate = {
      id: `cand_${Date.now()}`,
      name: candidateData.name || '',
      email: candidateData.email || '',
      role: candidateData.role || '',
      status: candidateData.status || 'vetting',
      phase: candidateData.phase || 1,
      progress: candidateData.progress || 0,
      startDate: candidateData.startDate || new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString(),
      assignedTo: candidateData.assignedTo || '',
      location: candidateData.location || '',
      documents: candidateData.documents || {
        resume: false,
        offer: false,
        background: false,
        i9: false,
        visa: false
      },
      recruiter: candidateData.recruiter || '',
      priority: candidateData.priority || 'normal',
      estimatedCompletion: candidateData.estimatedCompletion || '',
      notes: candidateData.notes || ''
    }

    // In a real app, you would save to database here
    mockCandidates.unshift(newCandidate)

    return NextResponse.json({
      candidate: newCandidate,
      message: 'Candidate added successfully'
    })
  } catch (error) {
    console.error('Error adding candidate:', error)
    return NextResponse.json(
      { error: 'Failed to add candidate' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { candidateId, updates } = await request.json()

    const candidateIndex = mockCandidates.findIndex(c => c.id === candidateId)
    if (candidateIndex === -1) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }

    // Update candidate
    mockCandidates[candidateIndex] = {
      ...mockCandidates[candidateIndex],
      ...updates,
      lastUpdate: new Date().toISOString()
    }

    return NextResponse.json({
      candidate: mockCandidates[candidateIndex],
      message: 'Candidate updated successfully'
    })
  } catch (error) {
    console.error('Error updating candidate:', error)
    return NextResponse.json(
      { error: 'Failed to update candidate' },
      { status: 500 }
    )
  }
}