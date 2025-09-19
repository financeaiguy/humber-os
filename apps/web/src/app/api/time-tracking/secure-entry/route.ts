import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
  try {
    // Development bypass for API testing interface
    const authHeader = request.headers.get('authorization')
    const isDevelopment = process.env.NODE_ENV === 'development'

    if (isDevelopment && authHeader === 'Bearer test-token-for-api-testing') {
      // Allow the request to proceed with mock user context
    } else {
      // Get session for authentication
      const session = await auth()

      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'You must be logged in to submit time entries' },
          { status: 401 }
        )
      }
    }

    // Parse request body
    const body = await request.json()
    const { type, timestamp, photo, metadata } = body

    // Validate required fields
    if (!type || !timestamp || !photo || !metadata) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing required fields: type, timestamp, photo, metadata' },
        { status: 400 }
      )
    }

    // Validate type
    if (!['clock-in', 'clock-out'].includes(type)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid type. Must be clock-in or clock-out' },
        { status: 400 }
      )
    }

    // Validate photo data
    if (!photo.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid photo format. Must be base64 image data' },
        { status: 400 }
      )
    }

    // Check photo size (max 5MB)
    const photoSizeBytes = (photo.length * 3) / 4
    const photoSizeMB = photoSizeBytes / (1024 * 1024)
    if (photoSizeMB > 5) {
      return NextResponse.json(
        { error: 'Bad Request', message: `Photo too large: ${photoSizeMB.toFixed(2)}MB. Maximum 5MB allowed.` },
        { status: 400 }
      )
    }

    // Check if demo mode
    const isDemoMode = process.env.NODE_ENV === 'development' || 
                      request.headers.get('host')?.includes('demo') ||
                      request.headers.get('host')?.includes('pages.dev')

    if (isDemoMode) {
      // Demo mode: Just return success without actual storage
      // SECURITY: console statement removed: console.log(`🎭 DEMO: ${type} submitted for employee ${metadata.employeeId}`)
      // SECURITY: console statement removed: console.log(`📸 Photo size: ${(photoSizeBytes / 1024).toFixed(1)}KB`)
      // SECURITY: console statement removed: console.log(`📍 Location: ${metadata.location ? `${metadata.location.lat}, ${metadata.location.lng}` : 'Not available'}`)
      // SECURITY: console statement removed: console.log(`🔐 Biometric verified: ${metadata.biometricVerified}`)
      
      return NextResponse.json({
        success: true,
        message: `${type} recorded successfully`,
        entryId: `demo_${Date.now()}`,
        timestamp: new Date().toISOString(),
        demo: true
      })
    }

    // Production mode: Here you would:
    // 1. Validate location against authorized work sites
    // 2. Store photo securely (e.g., encrypted cloud storage)
    // 3. Save time entry to database
    // 4. Send notifications if needed
    // 5. Log security events

    // For now, simulate production storage
    const entryId = `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Simulate database save
    const timeEntry = {
      id: entryId,
      employeeId: metadata.employeeId,
      type,
      timestamp,
      location: metadata.location,
      biometricVerified: metadata.biometricVerified,
      deviceFingerprint: metadata.deviceFingerprint,
      photoStoragePath: `time-tracking-photos/${entryId}.jpg`, // Would be actual path
      deviceInfo: metadata.deviceInfo,
      cameraInfo: metadata.cameraInfo,
      createdAt: new Date().toISOString()
    }

    // SECURITY: console statement removed
    // Time entry recorded: id, employeeId, type, timestamp, photoSize, biometricVerified

    return NextResponse.json({
      success: true,
      message: `${type} recorded successfully`,
      entryId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    // SECURITY: console statement removed: console.error('Time tracking API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Failed to process time entry. Please try again.' 
      },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed', message: 'This endpoint only accepts POST requests' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method Not Allowed', message: 'This endpoint only accepts POST requests' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method Not Allowed', message: 'This endpoint only accepts POST requests' },
    { status: 405 }
  )
}