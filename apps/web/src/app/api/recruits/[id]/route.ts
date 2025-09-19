import { NextRequest, NextResponse } from 'next/server'
import { recruitsStorage } from '@/lib/storage/recruits-storage'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Validation schemas
const updateRecruitSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(['pending', 'interviewed', 'offered', 'onboarding', 'onboarded', 'rejected']).optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recruitId } = await params
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

    // Calculate additional metadata
    const daysSinceCreated = Math.floor((Date.now() - new Date(recruit.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    const daysSinceUpdated = Math.floor((Date.now() - new Date(recruit.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
    
    // Calculate onboarding progress if applicable
    let onboardingProgress = null
    if (recruit.onboardingData?.onboardingSteps) {
      const completedSteps = recruit.onboardingData.onboardingSteps.filter(s => s.completed).length
      const totalSteps = recruit.onboardingData.onboardingSteps.length
      onboardingProgress = {
        completedSteps,
        totalSteps,
        percentage: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
        currentStep: recruit.onboardingData.onboardingSteps.find(s => !s.completed)?.step || 'Completed',
        estimatedCompletion: recruit.status === 'onboarded' 
          ? recruit.onboardingData.onboardingDate 
          : new Date(Date.now() + (totalSteps - completedSteps) * 24 * 60 * 60 * 1000).toISOString()
      }
    }

    // GDPR compliance status
    const gdprStatus = {
      hasValidConsent: recruit.consentData?.gdprCompliant || false,
      consentTypes: recruit.consentData?.consents?.map(c => ({
        type: c.type,
        given: c.given,
        timestamp: c.timestamp
      })) || [],
      dataRetentionCompliant: true,
      auditTrailAvailable: true
    }

    const response = {
      success: true,
      data: {
        ...recruit,
        metadata: {
          daysSinceCreated,
          daysSinceUpdated,
          isAnonymized: recruit.firstName?.startsWith('Anonymous_') || recruit.email?.includes('@anonymized.local'),
          canBeAnonymized: recruit.status !== 'onboarding' && recruit.status !== 'onboarded',
          canBeOffboarded: recruit.status === 'onboarded'
        },
        onboardingProgress,
        gdprStatus,
        availableActions: getAvailableActions(recruit)
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve recruit',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recruitId } = await params
    const body = await request.json()
    
    const validation = updateRecruitSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid update data',
          details: validation.error.flatten()
        },
        { status: 400 }
      )
    }

    const existingRecruit = await recruitsStorage.getRecruit(recruitId)
    if (!existingRecruit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Recruit not found'
        },
        { status: 404 }
      )
    }

    // Validate status transitions
    if (body.status && !isValidStatusTransition(existingRecruit.status, body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status transition from ${existingRecruit.status} to ${body.status}`
        },
        { status: 400 }
      )
    }

    const updatedRecruit = await recruitsStorage.updateRecruit(recruitId, validation.data)

    if (!updatedRecruit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update recruit'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        recruit: updatedRecruit,
        changedFields: Object.keys(validation.data),
        message: 'Recruit updated successfully'
      },
      timestamp: new Date().toISOString()
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update recruit',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recruitId } = await params
    const url = new URL(request.url)
    const force = url.searchParams.get('force') === 'true'

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

    // Check if recruit can be deleted
    if (!force && (recruit.status === 'onboarding' || recruit.status === 'onboarded')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete active recruit. Use anonymization or set force=true query parameter.',
          suggestion: 'Use anonymization endpoint for GDPR compliance'
        },
        { status: 400 }
      )
    }

    const deleted = await recruitsStorage.deleteRecruit(recruitId)

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete recruit'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        recruitId,
        deletedAt: new Date().toISOString(),
        message: 'Recruit deleted successfully',
        gdprNote: 'For GDPR compliance, consider using anonymization instead of deletion'
      },
      timestamp: new Date().toISOString()
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete recruit',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper functions
function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const validTransitions: Record<string, string[]> = {
    pending: ['interviewed', 'rejected'],
    interviewed: ['offered', 'rejected'],
    offered: ['onboarding', 'rejected'],
    onboarding: ['onboarded'],
    onboarded: [], // No automatic transitions from onboarded
    rejected: [] // No transitions from rejected
  }

  return validTransitions[currentStatus]?.includes(newStatus) || currentStatus === newStatus
}

function getAvailableActions(recruit: any): string[] {
  const actions = ['view', 'edit']

  switch (recruit.status) {
    case 'pending':
      actions.push('schedule_interview', 'reject')
      break
    case 'interviewed':
      actions.push('make_offer', 'reject')
      break
    case 'offered':
      actions.push('start_onboarding', 'reject')
      break
    case 'onboarding':
      actions.push('complete_onboarding', 'view_onboarding_progress')
      break
    case 'onboarded':
      actions.push('start_offboarding', 'view_full_profile')
      break
    case 'rejected':
      actions.push('anonymize', 'delete')
      break
  }

  // Always available if not active
  if (recruit.status !== 'onboarding' && recruit.status !== 'onboarded') {
    actions.push('anonymize', 'delete')
  }

  // GDPR actions
  actions.push('view_audit_trail', 'export_data', 'manage_consent')

  return [...new Set(actions)] // Remove duplicates
}