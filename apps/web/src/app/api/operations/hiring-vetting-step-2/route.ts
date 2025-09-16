import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Basic validation
    if (!body.candidateId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'Candidate ID is required'
        },
        { status: 400 }
      )
    }

    // Mock processing - in real app, this would handle vetting step 2
    const result = {
      candidateId: body.candidateId,
      interviewScore: body.interviewScore || 85,
      technicalScore: body.technicalScore || 90,
      decision: body.decision || 'proceed',
      notes: body.notes || 'Strong candidate',
      processedAt: new Date().toISOString(),
      nextStep: 'background-checks'
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Vetting step 2 completed successfully'
    })
  } catch (error) {
    console.error('Error processing vetting step 2:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal error',
        message: 'An error occurred while processing your request',
        requestId: Date.now().toString()
      },
      { status: 500 }
    )
  }
}