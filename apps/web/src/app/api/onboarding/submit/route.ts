import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const onboardingData = await request.json()

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate a mock onboarding ID
    const onboardingId = `onb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Mock response
    const response = {
      success: true,
      data: {
        onboardingId,
        status: 'submitted',
        phase: 1,
        nextSteps: [
          'Document verification in progress',
          'Background check initiated',
          'Legal review scheduled'
        ],
        estimatedProcessingTime: '3-5 business days'
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error submitting onboarding data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to submit onboarding data'
    }, { status: 500 })
  }
}