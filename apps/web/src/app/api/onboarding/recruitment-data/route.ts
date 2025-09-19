import { NextRequest, NextResponse } from 'next/server'

// Mock recruitment data
const mockRecruitmentData = {
  'rec_123': {
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@example.com',
    phone: '+1 (555) 123-4567',
    currentLocation: 'Detroit, MI',
    desiredSalary: 95000,
    availableStartDate: '2025-01-20',
    totalExperience: 8,
    recruitmentDate: '2024-12-15',
    skills: ['Mechanical Design', 'CAD Software', 'Project Management', 'Manufacturing'],
    visaStatus: 'US Citizen',
    previousEmployment: [
      {
        company: 'Ford Motor Company',
        role: 'Senior Mechanical Engineer',
        duration: '2020-2024'
      },
      {
        company: 'General Electric',
        role: 'Mechanical Engineer',
        duration: '2017-2020'
      }
    ]
  },
  'rec_456': {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 987-6543',
    currentLocation: 'Chicago, IL',
    desiredSalary: 88000,
    availableStartDate: '2025-01-22',
    totalExperience: 6,
    recruitmentDate: '2024-12-10',
    skills: ['Controls Engineering', 'PLC Programming', 'SCADA Systems', 'Industrial Automation'],
    visaStatus: 'H1-B',
    previousEmployment: [
      {
        company: 'Rockwell Automation',
        role: 'Controls Engineer',
        duration: '2018-2024'
      }
    ]
  }
}

export async function POST(request: NextRequest) {
  try {
    const { recruitId, tenantId } = await request.json()

    // Simulate a slight delay for realism
    await new Promise(resolve => setTimeout(resolve, 300))

    // Get recruitment data
    const recruitData = mockRecruitmentData[recruitId as keyof typeof mockRecruitmentData]

    if (!recruitData) {
      return NextResponse.json({
        success: false,
        error: 'Recruitment record not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: recruitData
    })
  } catch (error) {
    console.error('Error fetching recruitment data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch recruitment data'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recruitId = searchParams.get('recruitId')

    if (!recruitId) {
      return NextResponse.json({
        success: false,
        error: 'recruitId is required'
      }, { status: 400 })
    }

    const recruitData = mockRecruitmentData[recruitId as keyof typeof mockRecruitmentData]

    if (!recruitData) {
      return NextResponse.json({
        success: false,
        error: 'Recruitment record not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: recruitData
    })
  } catch (error) {
    console.error('Error fetching recruitment data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch recruitment data'
    }, { status: 500 })
  }
}