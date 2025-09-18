import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Get specific offboarding request implementation
    return NextResponse.json({
      success: true,
      offboarding: {
        id,
        type: 'PROJECT_COMPLETION',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      message: 'Offboarding request retrieved successfully'
    })
  } catch (error) {
    // SECURITY: Removed console.error('Get offboarding error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve offboarding request' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const updates = await request.json()
    
    // Update offboarding request implementation
    return NextResponse.json({
      success: true,
      offboarding: {
        id,
        ...updates,
        updatedAt: new Date().toISOString()
      },
      message: 'Offboarding request updated successfully'
    })
  } catch (error) {
    // SECURITY: Removed console.error('Update offboarding error:', error)
    return NextResponse.json(
      { error: 'Failed to update offboarding request' },
      { status: 500 }
    )
  }
}