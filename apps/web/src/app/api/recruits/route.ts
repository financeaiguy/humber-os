import { NextRequest, NextResponse } from 'next/server'
import { recruitsStorage } from '@/lib/storage/recruits-storage'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Validation schemas
const createRecruitSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  position: z.string().min(1),
  department: z.string().min(1),
  status: z.enum(['pending', 'interviewed', 'offered', 'onboarding', 'onboarded', 'rejected']).optional()
})

const querySchema = z.object({
  limit: z.string().transform(val => Math.min(parseInt(val, 10), 100)).optional(),
  offset: z.string().transform(val => parseInt(val, 10)).optional(),
  status: z.string().optional(),
  department: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['created', 'updated', 'name', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API REQUEST - GET /api/recruits', {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      timestamp: new Date().toISOString()
    })

    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    console.log('📊 Query parameters:', queryParams)
    
    const validation = querySchema.safeParse(queryParams)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: validation.error.flatten()
        },
        { status: 400 }
      )
    }

    const {
      limit = 50,
      offset = 0,
      status,
      department,
      search,
      sortBy = 'updated',
      sortOrder = 'desc'
    } = validation.data

    // Get all recruits
    let recruits = await recruitsStorage.getAllRecruits()

    // Apply filters
    if (status) {
      recruits = recruits.filter(r => r.status === status)
    }

    if (department) {
      recruits = recruits.filter(r => r.department.toLowerCase().includes(department.toLowerCase()))
    }

    if (search) {
      const searchLower = search.toLowerCase()
      recruits = recruits.filter(r => 
        r.firstName.toLowerCase().includes(searchLower) ||
        r.lastName.toLowerCase().includes(searchLower) ||
        r.email.toLowerCase().includes(searchLower) ||
        r.position.toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting
    recruits.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'created':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'updated':
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
          break
        case 'name':
          aValue = `${a.lastName}, ${a.firstName}`.toLowerCase()
          bValue = `${b.lastName}, ${b.firstName}`.toLowerCase()
          break
        case 'status':
          const statusOrder = ['pending', 'interviewed', 'offered', 'onboarding', 'onboarded', 'rejected']
          aValue = statusOrder.indexOf(a.status)
          bValue = statusOrder.indexOf(b.status)
          break
        default:
          aValue = a.updatedAt
          bValue = b.updatedAt
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    const total = recruits.length

    // Apply pagination
    const paginatedRecruits = recruits.slice(offset, offset + limit)

    // Add summary metadata for each recruit
    const enrichedRecruits = paginatedRecruits.map(recruit => ({
      ...recruit,
      metadata: {
        daysSinceCreated: Math.floor((Date.now() - new Date(recruit.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
        daysSinceUpdated: Math.floor((Date.now() - new Date(recruit.updatedAt).getTime()) / (1000 * 60 * 60 * 24)),
        isAnonymized: recruit.firstName?.startsWith('Anonymous_') || recruit.email?.includes('@anonymized.local'),
        hasValidConsent: recruit.consentData?.gdprCompliant || false,
        onboardingProgress: recruit.onboardingData?.onboardingSteps ? {
          completed: recruit.onboardingData.onboardingSteps.filter(s => s.completed).length,
          total: recruit.onboardingData.onboardingSteps.length
        } : null
      }
    }))

    // Calculate summary statistics
    const statusCounts = recruits.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const departmentCounts = recruits.reduce((acc, r) => {
      acc[r.department] = (acc[r.department] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const response = {
      success: true,
      data: {
        recruits: enrichedRecruits,
        pagination: {
          total,
          offset,
          limit,
          hasMore: offset + limit < total,
          currentPage: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(total / limit)
        },
        filters: {
          status,
          department,
          search
        },
        sorting: {
          sortBy,
          sortOrder
        },
        summary: {
          totalRecruits: total,
          statusBreakdown: statusCounts,
          departmentBreakdown: departmentCounts,
          recentActivity: {
            newThisWeek: recruits.filter(r => 
              new Date(r.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
            ).length,
            updatedToday: recruits.filter(r => 
              new Date(r.updatedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
            ).length
          }
        }
      },
      timestamp: new Date().toISOString()
    }

    console.log('✅ API SUCCESS - GET /api/recruits', {
      recruitCount: enrichedRecruits.length,
      totalRecruits: total,
      responseTime: Date.now()
    })

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('❌ API ERROR - GET /api/recruits', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve recruits',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API REQUEST - POST /api/recruits', {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      timestamp: new Date().toISOString()
    })

    // Enhanced validation for request body
    let body
    try {
      body = await request.json()
      console.log('📝 Request body received:', body)
    } catch (error) {
      console.error('❌ Invalid JSON in request body:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON format in request body',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      )
    }
    
    const validation = createRecruitSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid recruit data',
          details: validation.error.flatten()
        },
        { status: 400 }
      )
    }

    // Check for duplicate email
    const existingRecruits = await recruitsStorage.getAllRecruits()
    const duplicateEmail = existingRecruits.find(r => r.email === validation.data.email)
    
    if (duplicateEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already exists',
          duplicateRecruit: {
            id: duplicateEmail.id,
            name: `${duplicateEmail.firstName} ${duplicateEmail.lastName}`,
            status: duplicateEmail.status
          }
        },
        { status: 409 }
      )
    }

    const newRecruit = await recruitsStorage.createRecruit({
      ...validation.data,
      status: validation.data.status || 'pending'
    })

    return NextResponse.json({
      success: true,
      data: {
        recruit: newRecruit,
        message: 'Recruit created successfully',
        nextSteps: getNextStepsForStatus(newRecruit.status)
      },
      timestamp: new Date().toISOString()
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create recruit',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const bulkIds = url.searchParams.get('ids')?.split(',') || []
    const force = url.searchParams.get('force') === 'true'

    if (bulkIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No recruit IDs provided'
        },
        { status: 400 }
      )
    }

    const results = []
    
    for (const recruitId of bulkIds) {
      try {
        const recruit = await recruitsStorage.getRecruit(recruitId.trim())
        
        if (!recruit) {
          results.push({
            id: recruitId,
            success: false,
            error: 'Recruit not found'
          })
          continue
        }

        // Check if recruit can be deleted
        if (!force && (recruit.status === 'onboarding' || recruit.status === 'onboarded')) {
          results.push({
            id: recruitId,
            success: false,
            error: 'Cannot delete active recruit (use force=true or anonymization)'
          })
          continue
        }

        const deleted = await recruitsStorage.deleteRecruit(recruitId.trim())
        
        results.push({
          id: recruitId,
          success: deleted,
          message: deleted ? 'Deleted successfully' : 'Failed to delete'
        })
      } catch (error) {
        results.push({
          id: recruitId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount

    return NextResponse.json({
      success: successCount > 0,
      data: {
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount
        },
        message: `Bulk deletion completed: ${successCount} successful, ${failureCount} failed`
      },
      timestamp: new Date().toISOString()
    }, { status: successCount > 0 ? 200 : 400 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform bulk deletion',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper functions
function getNextStepsForStatus(status: string): string[] {
  const nextSteps: Record<string, string[]> = {
    pending: ['Schedule initial screening call', 'Review resume and qualifications', 'Conduct background check'],
    interviewed: ['Review interview feedback', 'Make hiring decision', 'Prepare job offer or rejection'],
    offered: ['Send offer letter', 'Negotiate terms if needed', 'Prepare onboarding materials'],
    onboarding: ['Complete onboarding checklist', 'Set up workspace and accounts', 'Schedule training sessions'],
    onboarded: ['Monitor performance', 'Provide ongoing support', 'Plan career development'],
    rejected: ['Send rejection notice', 'Consider for future opportunities', 'Maintain candidate relationship']
  }

  return nextSteps[status] || ['Contact HR for next steps']
}