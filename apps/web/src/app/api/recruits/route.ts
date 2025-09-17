import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withRole, withAuditLog, AuthenticatedRequest } from '@/lib/auth-middleware'
import { 
  recruitSchema, 
  recruitFiltersSchema,
  validateRequestBody,
  createValidationResponse 
} from '@/lib/validation-schemas'
import { webcrypto as crypto } from 'crypto'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// Type definitions
interface RecruitInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  currentLocation?: string
  jobTitle?: string
  yearsExperience?: number
  currentCompany?: string
  desiredSalary?: string
  skills?: string[]
  education?: string
  certifications?: string[]
  availableStartDate?: string
  workAuthorization?: string
  willingToRelocate?: boolean
  travelWillingness?: string
  source?: string
  recruiterName?: string
  recruiterAgency?: string
  notes?: string
}

interface Recruit extends RecruitInput {
  id: string
  status: string
  createdAt: string
  updatedAt: string
}

// Production database storage - replace with actual D1/database implementation
// In production, this would connect to Cloudflare D1 or another database
const recruitsStorage = new Map<string, Recruit>() // Temporary in-memory storage

// Initialize with empty storage for production
// Mock data removed for security compliance

export const GET = withAuditLog('VIEW_RECRUITS')(
  withAuth(async function handler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Validate query parameters
    const queryParams = Object.fromEntries(searchParams.entries())
    const validationResult = validateRequestBody(recruitFiltersSchema, queryParams)
    
    if (!validationResult.success) {
      return NextResponse.json(createValidationResponse(validationResult.errors), { status: 400 })
    }

    const { page, limit, status, search } = validationResult.data

    // Get all recruits from storage
    let allRecruits = Array.from(recruitsStorage.values())
    
    // Filter by status
    if (status) {
      allRecruits = allRecruits.filter(recruit => recruit.status === status)
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      allRecruits = allRecruits.filter(recruit =>
        recruit.firstName.toLowerCase().includes(searchLower) ||
        recruit.lastName.toLowerCase().includes(searchLower) ||
        recruit.email.toLowerCase().includes(searchLower) ||
        recruit.jobTitle?.toLowerCase().includes(searchLower) ||
        recruit.currentCompany?.toLowerCase().includes(searchLower)
      )
    }

    // Pagination
    const total = allRecruits.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedRecruits = allRecruits.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: {
        recruits: paginatedRecruits,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    })
  } catch (error) {
    console.error('Error fetching recruits:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch recruits',
        message: 'An error occurred while retrieving recruit data'
      },
      { status: 500 }
    )
  }
  })
)

export const POST = withAuditLog('CREATE_RECRUIT')(
  withRole(['PARTNER_OPERATOR', 'PARTNER_ADMIN', 'SYSTEM_ADMIN'])(
    async function handler(request: AuthenticatedRequest) {
  try {
    const requestData = await request.json()
    
    // Validate recruit data
    const validationResult = validateRequestBody(recruitSchema, requestData)
    if (!validationResult.success) {
      return NextResponse.json(createValidationResponse(validationResult.errors), { status: 400 })
    }

    const validatedData = validationResult.data

    // Generate a new ID using secure ID generation
    const newId = crypto.randomUUID()
    
    const newRecruit: Recruit = {
      id: newId,
      ...validatedData,
      status: 'sourced',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Store in temporary storage (replace with D1 database in production)
    recruitsStorage.set(newId, newRecruit)

    return NextResponse.json({
      success: true,
      data: {
        recruitId: newId,
        status: 'sourced',
        message: 'Recruit successfully submitted'
      }
    })
  } catch (error) {
    console.error('Error creating recruit:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create recruit',
        message: 'An error occurred while creating the recruit'
      },
      { status: 500 }
    )
  }
    }
  )
)