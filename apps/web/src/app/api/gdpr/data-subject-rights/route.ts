import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withAuditLog, AuthenticatedRequest } from '@/lib/auth-middleware'
import { 
  gdprDataRequestSchema,
  gdprConsentSchema,
  validateRequestBody,
  createValidationResponse 
} from '@/lib/validation-schemas'
import { anonymizePersonalData } from '@/lib/gdpr-utils'
import { generateSecureToken } from '@/lib/secure-token-generator'

export const runtime = 'edge'

// GDPR Data Subject Rights Implementation
// Article 15: Right of access
// Article 16: Right to rectification
// Article 17: Right to erasure ("right to be forgotten")
// Article 18: Right to restriction of processing
// Article 20: Right to data portability
// Article 21: Right to object

interface DataSubjectRequest {
  id: string
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection'
  subjectEmail: string
  subjectId?: string
  verificationToken: string
  status: 'pending_verification' | 'verified' | 'processing' | 'completed' | 'rejected'
  requestDate: string
  completionDate?: string
  requestDetails?: Record<string, any>
  verificationMethod: 'email' | 'identity_document' | 'two_factor'
  processingNotes?: string[]
  dataExported?: boolean
  dataDeleted?: boolean
}

// Mock storage - replace with actual database
const dataSubjectRequests = new Map<string, DataSubjectRequest>()
const consentRecords = new Map<string, any>()

// POST: Submit new data subject rights request
export async function POST(request: NextRequest) {
  try {
    // TODO: Add audit logging here instead of HOF wrapper
      const requestData = await request.json()
      
      // Validate request data
      const validationResult = validateRequestBody(gdprDataRequestSchema, requestData)
      if (!validationResult.success) {
        return NextResponse.json(createValidationResponse(validationResult.errors), { status: 400 })
      }

      const { requestType, subjectEmail, subjectId, requestDetails, verificationMethod } = validationResult.data

      // Generate secure request ID and verification token
      const requestId = generateSecureToken(16)
      const verificationToken = generateSecureToken(32)

      const newRequest: DataSubjectRequest = {
        id: requestId,
        requestType,
        subjectEmail,
        subjectId,
        verificationToken,
        status: 'pending_verification',
        requestDate: new Date().toISOString(),
        requestDetails,
        verificationMethod: verificationMethod || 'email',
        processingNotes: [`Request submitted via API at ${new Date().toISOString()}`]
      }

      // Store request
      dataSubjectRequests.set(requestId, newRequest)

      // Send verification email/SMS based on method
      await sendVerificationNotification(newRequest)

      return NextResponse.json({
        success: true,
        requestId,
        status: 'pending_verification',
        message: `GDPR ${requestType} request submitted successfully. Please check your ${verificationMethod} for verification instructions.`,
        estimatedProcessingTime: getEstimatedProcessingTime(requestType),
        legalBasis: getGdprLegalBasis(requestType)
      })

    } catch (error) {
      // SECURITY: console statement removed: console.error('GDPR request submission error:', error)
      return NextResponse.json(
        { error: 'Failed to submit GDPR request' },
        { status: 500 }
      )
    }
  }

// GET: Check status of data subject rights request
export async function GET(request: NextRequest) {
  try {
    // TODO: Add audit logging here instead of HOF wrapper
      const { searchParams } = new URL(request.url)
      const requestId = searchParams.get('requestId')
      const verificationToken = searchParams.get('token')

      if (!requestId) {
        return NextResponse.json(
          { error: 'Request ID is required' },
          { status: 400 }
        )
      }

      const gdprRequest = dataSubjectRequests.get(requestId)
      if (!gdprRequest) {
        return NextResponse.json(
          { error: 'Request not found' },
          { status: 404 }
        )
      }

      // Verify token for non-public status checks
      if (verificationToken && gdprRequest.verificationToken !== verificationToken) {
        return NextResponse.json(
          { error: 'Invalid verification token' },
          { status: 403 }
        )
      }

      return NextResponse.json({
        success: true,
        request: {
          id: gdprRequest.id,
          requestType: gdprRequest.requestType,
          status: gdprRequest.status,
          requestDate: gdprRequest.requestDate,
          completionDate: gdprRequest.completionDate,
          estimatedCompletionDate: calculateEstimatedCompletion(gdprRequest),
          processingNotes: gdprRequest.processingNotes?.slice(-3) // Last 3 notes only
        }
      })

    } catch (error) {
      // SECURITY: console statement removed: console.error('GDPR status check error:', error)
      return NextResponse.json(
        { error: 'Failed to check request status' },
        { status: 500 }
      )
    }
  }

// PUT: Process data subject rights request (admin only)
export async function PUT(request: NextRequest) {
  try {
    // TODO: Add auth and audit logging here instead of HOF wrapper
      const requestData = await request.json()
      const { requestId, action, processingNote, adminId } = requestData

      const gdprRequest = dataSubjectRequests.get(requestId)
      if (!gdprRequest) {
        return NextResponse.json(
          { error: 'Request not found' },
          { status: 404 }
        )
      }

      // Update request status based on action
      switch (action) {
        case 'verify':
          gdprRequest.status = 'verified'
          gdprRequest.processingNotes?.push(`Verified by admin ${adminId} at ${new Date().toISOString()}`)
          break

        case 'start_processing':
          gdprRequest.status = 'processing'
          gdprRequest.processingNotes?.push(`Processing started by ${adminId} at ${new Date().toISOString()}`)
          break

        case 'complete':
          gdprRequest.status = 'completed'
          gdprRequest.completionDate = new Date().toISOString()
          gdprRequest.processingNotes?.push(`Completed by ${adminId} at ${new Date().toISOString()}`)
          
          // Execute the actual data operation
          await executeDataSubjectRequest(gdprRequest)
          break

        case 'reject':
          gdprRequest.status = 'rejected'
          gdprRequest.completionDate = new Date().toISOString()
          gdprRequest.processingNotes?.push(`Rejected by ${adminId}: ${processingNote}`)
          break
      }

      if (processingNote) {
        gdprRequest.processingNotes?.push(`Note: ${processingNote}`)
      }

      return NextResponse.json({
        success: true,
        request: gdprRequest,
        message: `Request ${action} successfully`
      })

    } catch (error) {
      // SECURITY: console statement removed: console.error('GDPR request processing error:', error)
      return NextResponse.json(
        { error: 'Failed to process GDPR request' },
        { status: 500 }
      )
    }
  }

// Helper functions
async function sendVerificationNotification(request: DataSubjectRequest) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/gdpr/verify?requestId=${request.id}&token=${request.verificationToken}`
  
  // SECURITY: console statement removed
  // GDPR Verification: verificationMethod, email, requestType, verificationUrl, requestId
  
  // In production, send actual email/SMS
}

function getEstimatedProcessingTime(requestType: string): string {
  const timeframes = {
    access: '1 month',
    rectification: '1 month',
    erasure: '1 month without undue delay',
    portability: '1 month',
    restriction: 'Without undue delay',
    objection: 'Without undue delay'
  }
  return timeframes[requestType as keyof typeof timeframes] || '1 month'
}

function getGdprLegalBasis(requestType: string): string {
  const legalBasis = {
    access: 'GDPR Article 15 - Right of access by the data subject',
    rectification: 'GDPR Article 16 - Right to rectification',
    erasure: 'GDPR Article 17 - Right to erasure (right to be forgotten)',
    portability: 'GDPR Article 20 - Right to data portability',
    restriction: 'GDPR Article 18 - Right to restriction of processing',
    objection: 'GDPR Article 21 - Right to object'
  }
  return legalBasis[requestType as keyof typeof legalBasis] || 'GDPR compliance'
}

function calculateEstimatedCompletion(request: DataSubjectRequest): string {
  const requestDate = new Date(request.requestDate)
  const completionDate = new Date(requestDate)
  completionDate.setDate(completionDate.getDate() + 30) // GDPR requires response within 1 month
  return completionDate.toISOString()
}

async function executeDataSubjectRequest(request: DataSubjectRequest) {
  switch (request.requestType) {
    case 'access':
      // Export all personal data
      await exportPersonalData(request.subjectEmail, request.id)
      request.dataExported = true
      break

    case 'erasure':
      // Delete all personal data
      await deletePersonalData(request.subjectEmail, request.id)
      request.dataDeleted = true
      break

    case 'portability':
      // Export data in machine-readable format
      await exportPortableData(request.subjectEmail, request.id)
      request.dataExported = true
      break

    case 'rectification':
      // Update personal data as requested
      await rectifyPersonalData(request.subjectEmail, request.requestDetails)
      break

    case 'restriction':
      // Mark data for restricted processing
      await restrictDataProcessing(request.subjectEmail)
      break

    case 'objection':
      // Stop processing personal data
      await stopDataProcessing(request.subjectEmail)
      break
  }
}

async function exportPersonalData(email: string, requestId: string) {
  // SECURITY: console statement removed: console.log(`📋 Exporting personal data for ${email} (Request: ${requestId})`)
  // Implementation would export all personal data to secure file
}

async function deletePersonalData(email: string, requestId: string) {
  // SECURITY: console statement removed: console.log(`🗑️ Deleting personal data for ${email} (Request: ${requestId})`)
  // Implementation would anonymize/delete all personal data
}

async function exportPortableData(email: string, requestId: string) {
  // SECURITY: console statement removed: console.log(`📦 Exporting portable data for ${email} (Request: ${requestId})`)
  // Implementation would export data in machine-readable format (JSON/XML)
}

async function rectifyPersonalData(email: string, corrections: any) {
  // SECURITY: console statement removed: console.log(`✏️ Rectifying personal data for ${email}`, corrections)
  // Implementation would update personal data as requested
}

async function restrictDataProcessing(email: string) {
  // SECURITY: console statement removed: console.log(`⛔ Restricting data processing for ${email}`)
  // Implementation would mark data for restricted processing only
}

async function stopDataProcessing(email: string) {
  // SECURITY: console statement removed: console.log(`🛑 Stopping data processing for ${email}`)
  // Implementation would stop all non-essential processing
}