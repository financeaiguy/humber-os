import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const recruitId = params.id

    // Mock successful onboarding response
    const response = {
      success: true,
      data: {
        id: recruitId,
        status: 'onboarded',
        onboardingDate: new Date().toISOString(),
        details: {
          firstName: body.firstName || 'John',
          lastName: body.lastName || 'Smith',
          email: body.email || `john.smith${recruitId}@example.com`,
          phone: body.phone || '(555) 123-4567',
          position: body.position || 'Senior Mechanical Engineer',
          department: body.department || 'Engineering',
          startDate: body.startDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          salary: body.salary || '$85,000',
          location: body.location || 'Detroit, MI',
          certifications: body.certifications || ['ABC Manufacturing', 'PLC Programming'],
          skills: body.skills || ['AutoCAD', 'SolidWorks', 'ANSYS'],
          onboardingSteps: [
            { step: 'Document Verification', completed: true },
            { step: 'Background Check', completed: true },
            { step: 'IT Equipment Setup', completed: false },
            { step: 'Safety Training', completed: false },
            { step: 'Team Introduction', completed: false }
          ]
        },
        message: 'Candidate accepted offer, ready for onboarding'
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process onboarding',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recruitId = params.id

    // Mock get onboarding status response
    const response = {
      success: true,
      data: {
        id: recruitId,
        onboardingStatus: 'in_progress',
        completedSteps: 2,
        totalSteps: 5,
        estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        currentStep: 'IT Equipment Setup',
        nextSteps: ['Safety Training', 'Team Introduction']
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get onboarding status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}