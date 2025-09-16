import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Request schema
const RecruitmentDataRequestSchema = z.object({
  recruitId: z.string().min(1, 'Recruit ID is required'),
  tenantId: z.string().optional()
})

// Response schema
const RecruitmentDataResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    currentLocation: z.string(),
    desiredSalary: z.number(),
    availableStartDate: z.string(),
    totalExperience: z.number(),
    recruitmentDate: z.string(),
    skills: z.array(z.string()),
    visaStatus: z.string().optional(),
    previousEmployment: z.array(z.object({
      company: z.string(),
      role: z.string(),
      duration: z.string()
    })).optional()
  }).optional(),
  error: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request
    const validatedRequest = RecruitmentDataRequestSchema.safeParse(body)
    if (!validatedRequest.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: validatedRequest.error.issues
      }, { status: 400 })
    }

    const { recruitId } = validatedRequest.data

    // TODO: Replace with actual database/recruitment system integration
    // For now, simulate different scenarios based on recruitId
    if (recruitId === 'not_found_123') {
      return NextResponse.json({
        success: false,
        error: 'Recruit not found in recruitment system'
      }, { status: 404 })
    }

    if (recruitId === 'network_error_123') {
      // Simulate network error
      throw new Error('Connection timeout to recruitment service')
    }

    // Simulate successful data fetch
    const mockData = {
      firstName: recruitId.includes('sarah') ? 'Sarah' : recruitId.includes('michael') ? 'Michael' : 'John',
      lastName: recruitId.includes('sarah') ? 'Johnson' : recruitId.includes('michael') ? 'Chen' : 'Smith',
      email: `${recruitId.includes('sarah') ? 'sarah.johnson' : recruitId.includes('michael') ? 'michael.chen' : 'john.smith'}@email.com`,
      phone: '+1 (555) 123-4567',
      currentLocation: recruitId.includes('sarah') ? 'Chicago, IL' : recruitId.includes('michael') ? 'Detroit, MI' : 'Dallas, TX',
      desiredSalary: recruitId.includes('sarah') ? 92000 : recruitId.includes('michael') ? 98000 : 85000,
      availableStartDate: '2025-02-01',
      totalExperience: recruitId.includes('sarah') ? 5 : recruitId.includes('michael') ? 8 : 7,
      recruitmentDate: '2025-01-15',
      skills: recruitId.includes('sarah') 
        ? ['Controls Engineering', 'PLC Programming', 'SCADA'] 
        : recruitId.includes('michael') 
          ? ['Mechanical Design', 'AutoCAD', 'SolidWorks', 'Project Management']
          : ['Electrical Engineering', 'Circuit Design', 'Troubleshooting'],
      visaStatus: 'US_CITIZEN',
      previousEmployment: [
        {
          company: 'Previous Engineering Corp',
          role: 'Senior Engineer',
          duration: '3 years'
        }
      ]
    }

    // Validate response data
    const validatedResponse = RecruitmentDataResponseSchema.safeParse({
      success: true,
      data: mockData
    })

    if (!validatedResponse.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid response data structure'
      }, { status: 500 })
    }

    return NextResponse.json(validatedResponse.data)

  } catch (error) {
    console.error('Error fetching recruitment data:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const recruitId = searchParams.get('recruitId')
  const tenantId = searchParams.get('tenantId')

  if (!recruitId) {
    return NextResponse.json({
      success: false,
      error: 'recruitId parameter is required'
    }, { status: 400 })
  }

  // Convert GET to POST format for consistency
  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ recruitId, tenantId })
  }))
}