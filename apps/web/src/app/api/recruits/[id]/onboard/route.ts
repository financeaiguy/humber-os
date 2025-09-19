import { NextRequest, NextResponse } from 'next/server'
import { recruitsStorage } from '@/lib/storage/recruits-storage'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Validation schemas
const onboardingSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  startDate: z.string().optional(),
  salary: z.string().optional(),
  location: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  onboardingSteps: z.array(z.object({
    step: z.string(),
    completed: z.boolean(),
    completedAt: z.string().optional()
  })).optional()
})

const stepUpdateSchema = z.object({
  step: z.string(),
  completed: z.boolean()
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recruitId } = await params
    const body = await request.json()
    
    // Check if this is a step update or full onboarding update
    const isStepUpdate = body.step !== undefined && body.completed !== undefined
    
    if (isStepUpdate) {
      // Handle individual step completion
      const validation = stepUpdateSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid step update data',
            details: validation.error.flatten()
          },
          { status: 400 }
        )
      }

      const recruit = await recruitsStorage.getRecruit(recruitId)
      if (!recruit) {
        return NextResponse.json(
          {
            success: false,
            error: 'Recruit not found'
          },
          { status: 404 }
        )
      }

      // Update the specific step
      const steps = recruit.onboardingData?.onboardingSteps || []
      const stepIndex = steps.findIndex(s => s.step === body.step)
      
      if (stepIndex >= 0) {
        steps[stepIndex] = {
          ...steps[stepIndex],
          completed: body.completed,
          completedAt: body.completed ? new Date().toISOString() : undefined
        }
      }

      const updatedRecruit = await recruitsStorage.updateOnboarding(recruitId, {
        onboardingSteps: steps
      })

      // Check if all steps are completed
      const allCompleted = steps.every(s => s.completed)
      if (allCompleted && updatedRecruit) {
        await recruitsStorage.completeOnboarding(recruitId)
      }

      return NextResponse.json({
        success: true,
        data: {
          id: recruitId,
          step: body.step,
          completed: body.completed,
          allStepsCompleted: allCompleted,
          message: allCompleted ? 'Onboarding completed successfully' : 'Step updated successfully'
        },
        timestamp: new Date().toISOString()
      }, { status: 200 })
    } else {
      // Handle full onboarding data update
      const validation = onboardingSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid onboarding data',
            details: validation.error.flatten()
          },
          { status: 400 }
        )
      }

      const recruit = await recruitsStorage.getRecruit(recruitId)
      if (!recruit) {
        return NextResponse.json(
          {
            success: false,
            error: 'Recruit not found'
          },
          { status: 404 }
        )
      }

      // Update recruit basic info if provided
      const updates: any = {}
      if (body.firstName) updates.firstName = body.firstName
      if (body.lastName) updates.lastName = body.lastName
      if (body.email) updates.email = body.email
      if (body.phone) updates.phone = body.phone
      if (body.position) updates.position = body.position
      if (body.department) updates.department = body.department

      // Update recruit if there are basic updates
      if (Object.keys(updates).length > 0) {
        await recruitsStorage.updateRecruit(recruitId, updates)
      }

      // Prepare onboarding data
      const onboardingData: any = {
        startDate: body.startDate || recruit.onboardingData?.startDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        salary: body.salary || recruit.onboardingData?.salary || 'To be determined',
        location: body.location || recruit.onboardingData?.location || 'Main Office',
        certifications: body.certifications || recruit.onboardingData?.certifications || [],
        skills: body.skills || recruit.onboardingData?.skills || [],
        onboardingSteps: body.onboardingSteps || recruit.onboardingData?.onboardingSteps || [
          { step: 'Document Verification', completed: false },
          { step: 'Background Check', completed: false },
          { step: 'IT Equipment Setup', completed: false },
          { step: 'Safety Training', completed: false },
          { step: 'Team Introduction', completed: false }
        ]
      }

      const updatedRecruit = await recruitsStorage.updateOnboarding(recruitId, onboardingData)

      if (!updatedRecruit) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to update onboarding data'
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          id: recruitId,
          status: updatedRecruit.status,
          onboardingDate: updatedRecruit.onboardingData?.onboardingDate,
          details: {
            firstName: updatedRecruit.firstName,
            lastName: updatedRecruit.lastName,
            email: updatedRecruit.email,
            phone: updatedRecruit.phone,
            position: updatedRecruit.position,
            department: updatedRecruit.department,
            ...updatedRecruit.onboardingData
          },
          message: 'Onboarding process initiated successfully'
        },
        timestamp: new Date().toISOString()
      }, { status: 200 })
    }
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
    const recruit = await recruitsStorage.getRecruit(recruitId)

    if (!recruit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Recruit not found'
        },
        { status: 404 }
      )
    }

    const onboardingData = recruit.onboardingData || {
      startDate: null,
      salary: null,
      location: null,
      certifications: [],
      skills: [],
      onboardingSteps: []
    }

    const completedSteps = onboardingData.onboardingSteps?.filter(s => s.completed).length || 0
    const totalSteps = onboardingData.onboardingSteps?.length || 0
    const currentStep = onboardingData.onboardingSteps?.find(s => !s.completed)
    const nextSteps = onboardingData.onboardingSteps?.filter(s => !s.completed).map(s => s.step) || []

    return NextResponse.json({
      success: true,
      data: {
        id: recruitId,
        status: recruit.status,
        firstName: recruit.firstName,
        lastName: recruit.lastName,
        email: recruit.email,
        position: recruit.position,
        department: recruit.department,
        onboardingStatus: recruit.status === 'onboarded' ? 'completed' : recruit.status === 'onboarding' ? 'in_progress' : 'pending',
        onboardingData,
        progress: {
          completedSteps,
          totalSteps,
          percentage: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
          currentStep: currentStep?.step || (recruit.status === 'onboarded' ? 'Completed' : 'Not started'),
          nextSteps
        },
        estimatedCompletion: recruit.status === 'onboarded' 
          ? recruit.onboardingData?.onboardingDate 
          : new Date(Date.now() + (totalSteps - completedSteps) * 24 * 60 * 60 * 1000).toISOString()
      },
      timestamp: new Date().toISOString()
    }, { status: 200 })
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recruitId = params.id
    const { action } = await request.json()

    if (action === 'complete') {
      const updatedRecruit = await recruitsStorage.completeOnboarding(recruitId)
      
      if (!updatedRecruit) {
        return NextResponse.json(
          {
            success: false,
            error: 'Recruit not found'
          },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          id: recruitId,
          status: updatedRecruit.status,
          onboardingDate: updatedRecruit.onboardingData?.onboardingDate,
          message: 'Onboarding completed successfully'
        },
        timestamp: new Date().toISOString()
      }, { status: 200 })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action'
      },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update onboarding',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}