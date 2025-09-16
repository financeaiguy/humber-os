import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// Mock data for development
const mockRecruits = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    currentLocation: 'Detroit, MI',
    jobTitle: 'Senior Electrical Engineer',
    yearsExperience: 8,
    currentCompany: 'General Motors',
    desiredSalary: '$95,000',
    skills: ['AutoCAD', 'PLC Programming', 'Industrial Automation'],
    education: 'B.S. Electrical Engineering',
    certifications: ['PE License', 'Six Sigma Green Belt'],
    availableStartDate: '2024-02-15',
    workAuthorization: 'US Citizen',
    willingToRelocate: true,
    travelWillingness: 'Up to 25%',
    source: 'LinkedIn',
    recruiterName: 'Sarah Johnson',
    recruiterAgency: 'TechStaff Solutions',
    status: 'screened',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-12T14:30:00Z',
    notes: 'Strong background in automotive manufacturing'
  },
  {
    id: '2',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    email: 'maria.rodriguez@email.com',
    phone: '(555) 987-6543',
    currentLocation: 'Toledo, OH',
    jobTitle: 'Mechanical Engineer',
    yearsExperience: 6,
    currentCompany: 'Ford Motor Company',
    desiredSalary: '$82,000',
    skills: ['SolidWorks', 'ANSYS', 'Manufacturing Processes'],
    education: 'M.S. Mechanical Engineering',
    certifications: ['SolidWorks Professional', 'Lean Manufacturing'],
    availableStartDate: '2024-03-01',
    workAuthorization: 'US Citizen',
    willingToRelocate: false,
    travelWillingness: 'Up to 10%',
    source: 'Referral',
    recruiterName: 'Mike Chen',
    recruiterAgency: 'Engineering Talent Group',
    status: 'interviewed',
    createdAt: '2024-01-08T09:15:00Z',
    updatedAt: '2024-01-15T11:45:00Z',
    notes: 'Excellent problem-solving skills'
  },
  {
    id: '3',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@email.com',
    phone: '(555) 456-7890',
    currentLocation: 'Grand Rapids, MI',
    jobTitle: 'Software Engineer',
    yearsExperience: 4,
    currentCompany: 'Steelcase',
    desiredSalary: '$75,000',
    skills: ['Python', 'React', 'Industrial IoT'],
    education: 'B.S. Computer Science',
    certifications: ['AWS Cloud Practitioner', 'Scrum Master'],
    availableStartDate: '2024-02-01',
    workAuthorization: 'H1B Visa',
    willingToRelocate: true,
    travelWillingness: 'Up to 50%',
    source: 'Indeed',
    recruiterName: 'Lisa Wang',
    recruiterAgency: 'Tech Recruiting Plus',
    status: 'offer_extended',
    createdAt: '2024-01-05T16:20:00Z',
    updatedAt: '2024-01-18T08:30:00Z',
    notes: 'Strong in automation software development'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let filteredRecruits = [...mockRecruits]

    // Filter by status
    if (status) {
      filteredRecruits = filteredRecruits.filter(recruit => recruit.status === status)
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      filteredRecruits = filteredRecruits.filter(recruit =>
        recruit.firstName.toLowerCase().includes(searchLower) ||
        recruit.lastName.toLowerCase().includes(searchLower) ||
        recruit.email.toLowerCase().includes(searchLower) ||
        recruit.jobTitle.toLowerCase().includes(searchLower) ||
        recruit.currentCompany?.toLowerCase().includes(searchLower)
      )
    }

    // Pagination
    const total = filteredRecruits.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedRecruits = filteredRecruits.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: {
        recruits: paginatedRecruits,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    })
  } catch (error) {
    console.error('Error fetching recruits:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch recruits',
        message: 'An error occurred while retrieving recruit data'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Basic validation
    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'Required fields are missing',
          details: [
            { field: 'firstName', message: 'First name is required' },
            { field: 'lastName', message: 'Last name is required' },
            { field: 'email', message: 'Email is required' }
          ]
        },
        { status: 400 }
      )
    }

    // Generate a new ID (in real app, this would be handled by database)
    const newId = (mockRecruits.length + 1).toString()
    
    const newRecruit = {
      id: newId,
      ...body,
      status: 'sourced',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // In a real app, save to database
    mockRecruits.push(newRecruit)

    return NextResponse.json({
      success: true,
      data: {
        recruitId: newId,
        status: 'sourced',
        message: 'Recruit successfully submitted'
      }
    })
  } catch (error) {
    console.error('Error creating recruit:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create recruit',
        message: 'An error occurred while creating the recruit'
      },
      { status: 500 }
    )
  }
}