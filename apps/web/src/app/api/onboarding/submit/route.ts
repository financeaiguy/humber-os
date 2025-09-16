import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Onboarding submission schema
const OnboardingSubmissionSchema = z.object({
  // Basic Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  currentLocation: z.string().min(1, 'Current location is required'),
  desiredSalary: z.number().min(0, 'Salary must be positive'),
  availableStartDate: z.string().min(1, 'Start date is required'),
  
  // Onboarding Specific Fields
  recruitmentDate: z.string().min(1, 'Recruitment date is required'),
  visaStatus: z.enum(['US_CITIZEN', 'PERMANENT_RESIDENT', 'H1B', 'L1', 'TN', 'F1_OPT', 'OTHER'], {
    errorMap: () => ({ message: 'Please select a valid visa status' })
  }),
  travelLimitations: z.string(),
  specialtyKeywords: z.array(z.string()).min(1, 'At least one specialty keyword is required'),
  legalIdentifier: z.object({
    type: z.enum(['SSN', 'TIN', 'ITIN', 'EIN']),
    number: z.string().min(9, 'Legal identifier number is required')
  }),
  totalExperience: z.number().min(0, 'Experience must be positive'),
  employeeType: z.enum(['full-time', 'contractor', 'part-time', 'intern']),
  
  // Optional fields
  recruitId: z.string().optional(),
  tenantId: z.string().optional(),
  phase: z.number().default(1)
})

type OnboardingSubmission = z.infer<typeof OnboardingSubmissionSchema>

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate submission data
    const validation = OnboardingSubmissionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.error.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      }, { status: 400 })
    }

    const onboardingData: OnboardingSubmission = validation.data

    // TODO: Replace with actual database integration
    // For now, simulate different scenarios for testing

    // Simulate validation errors for specific test cases
    if (onboardingData.email.includes('invalid')) {
      return NextResponse.json({
        success: false,
        error: 'Email already exists in system',
        details: [{ field: 'email', message: 'This email is already registered' }]
      }, { status: 409 })
    }

    if (onboardingData.legalIdentifier.number.includes('999')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid legal identifier',
        details: [{ field: 'legalIdentifier.number', message: 'This identifier is invalid or already in use' }]
      }, { status: 400 })
    }

    // Simulate server error for testing
    if (onboardingData.lastName.toLowerCase() === 'error') {
      throw new Error('Database connection failed')
    }

    // Generate onboarding ID
    const onboardingId = `onb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // TODO: Save to database
    // const savedOnboarding = await db.onboarding.create({ data: onboardingData })

    // TODO: Trigger automated workflows
    // - Send welcome email
    // - Create employee record
    // - Generate compliance checklist
    // - Notify HR team
    // - Schedule background check (if required)

    console.log('Onboarding submission processed:', {
      onboardingId,
      name: `${onboardingData.firstName} ${onboardingData.lastName}`,
      email: onboardingData.email,
      phase: onboardingData.phase
    })

    return NextResponse.json({
      success: true,
      data: {
        onboardingId,
        status: 'submitted',
        phase: onboardingData.phase,
        nextSteps: [
          'Background check initiated',
          'Welcome email sent',
          'HR team notified',
          'Document verification scheduled'
        ],
        estimatedProcessingTime: '2-3 business days'
      }
    })

  } catch (error) {
    console.error('Error processing onboarding submission:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

// GET endpoint for retrieving onboarding status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const onboardingId = searchParams.get('onboardingId')

  if (!onboardingId) {
    return NextResponse.json({
      success: false,
      error: 'onboardingId parameter is required'
    }, { status: 400 })
  }

  try {
    // TODO: Fetch from database
    // const onboarding = await db.onboarding.findUnique({ where: { id: onboardingId } })

    // Mock response for now
    return NextResponse.json({
      success: true,
      data: {
        onboardingId,
        status: 'in_progress',
        phase: 1,
        completedSteps: [
          'Application submitted',
          'Initial review completed'
        ],
        pendingSteps: [
          'Background check',
          'Document verification',
          'IT setup'
        ],
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching onboarding status:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch onboarding status'
    }, { status: 500 })
  }
}