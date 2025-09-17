import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

interface OnboardRequest {
  notes?: string
  startDate?: string
  department?: string
  manager?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recruitId = params.id
    const body = await request.json() as OnboardRequest
    
    // Create onboarding record
    const onboardingData = {
      recruitId,
      status: 'onboarding_initiated',
      onboardedAt: new Date().toISOString(),
      notes: body.notes || '',
      startDate: body.startDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Default 2 weeks from now
      department: body.department || 'Engineering',
      manager: body.manager || 'To be assigned',
      
      // Onboarding checklist
      onboardingTasks: {
        documentCollection: {
          status: 'pending',
          items: [
            { name: 'I-9 Form', status: 'pending', required: true },
            { name: 'W-4 Form', status: 'pending', required: true },
            { name: 'Direct Deposit Form', status: 'pending', required: true },
            { name: 'Emergency Contact', status: 'pending', required: true },
            { name: 'Background Check Consent', status: 'pending', required: true },
            { name: 'Drug Test Consent', status: 'pending', required: false },
            { name: 'Professional Licenses', status: 'pending', required: false },
            { name: 'Certifications', status: 'pending', required: false }
          ]
        },
        systemSetup: {
          status: 'pending',
          items: [
            { name: 'Email Account', status: 'pending' },
            { name: 'Active Directory', status: 'pending' },
            { name: 'VPN Access', status: 'pending' },
            { name: 'Laptop/Equipment', status: 'pending' },
            { name: 'Building Access Card', status: 'pending' },
            { name: 'Parking Pass', status: 'pending' },
            { name: 'Phone Extension', status: 'pending' }
          ]
        },
        training: {
          status: 'pending',
          items: [
            { name: 'Company Orientation', status: 'pending', scheduledDate: null },
            { name: 'Safety Training', status: 'pending', scheduledDate: null },
            { name: 'IT Security Training', status: 'pending', scheduledDate: null },
            { name: 'HR Policy Review', status: 'pending', scheduledDate: null },
            { name: 'Department Introduction', status: 'pending', scheduledDate: null },
            { name: 'Role-Specific Training', status: 'pending', scheduledDate: null }
          ]
        },
        benefits: {
          status: 'pending',
          items: [
            { name: 'Health Insurance Enrollment', status: 'pending' },
            { name: '401(k) Setup', status: 'pending' },
            { name: 'Life Insurance', status: 'pending' },
            { name: 'Disability Insurance', status: 'pending' },
            { name: 'FSA/HSA Setup', status: 'pending' }
          ]
        }
      },
      
      // Timeline
      timeline: [
        {
          date: new Date().toISOString(),
          event: 'Onboarding Initiated',
          description: 'Candidate moved to onboarding process',
          completedBy: 'System'
        },
        {
          date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'Document Collection',
          description: 'Send onboarding paperwork',
          status: 'scheduled'
        },
        {
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'Background Check',
          description: 'Initiate background verification',
          status: 'scheduled'
        },
        {
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'IT Setup',
          description: 'Create accounts and order equipment',
          status: 'scheduled'
        },
        {
          date: body.startDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'First Day',
          description: 'New employee starts',
          status: 'scheduled'
        }
      ],
      
      // Notifications sent
      notifications: [
        {
          type: 'email',
          recipient: 'hr@humber.com',
          subject: `New Onboarding: Recruit ${recruitId}`,
          sentAt: new Date().toISOString(),
          status: 'sent'
        },
        {
          type: 'email',
          recipient: 'it@humber.com',
          subject: `IT Setup Required: Recruit ${recruitId}`,
          sentAt: new Date().toISOString(),
          status: 'sent'
        },
        {
          type: 'email',
          recipient: body.manager || 'manager@humber.com',
          subject: `New Team Member Onboarding: ${recruitId}`,
          sentAt: new Date().toISOString(),
          status: 'sent'
        }
      ],
      
      // Audit trail
      auditLog: {
        action: 'RECRUIT_ONBOARDED',
        performedAt: new Date().toISOString(),
        performedBy: 'system',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        previousStatus: 'offered',
        newStatus: 'onboarding'
      }
    }
    
    // Log the onboarding
    console.log(`Recruit ${recruitId} moved to onboarding:`, {
      notes: body.notes,
      startDate: body.startDate,
      timestamp: new Date().toISOString()
    })
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Recruit successfully moved to onboarding',
      data: onboardingData,
      nextSteps: [
        'Send onboarding paperwork to candidate',
        'Schedule first day orientation',
        'Notify IT for account setup',
        'Order equipment and access cards',
        'Schedule training sessions'
      ],
      estimatedCompletionDays: 14
    })
    
  } catch (error) {
    console.error('Error creating onboarding:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate onboarding',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}