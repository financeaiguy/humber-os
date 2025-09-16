import { z } from 'zod'

// API Response Types
const ApiSuccessResponse = z.object({
  success: z.literal(true),
  data: z.any()
})

const ApiErrorResponse = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string().optional(),
  details: z.array(z.object({
    field: z.string(),
    message: z.string()
  })).optional()
})

const ApiResponse = z.union([ApiSuccessResponse, ApiErrorResponse])

// Recruit Types
export interface RecruitData {
  firstName: string
  lastName: string
  email: string
  phone: string
  currentLocation: string
  jobTitle: string
  yearsExperience: number
  currentCompany?: string
  desiredSalary?: string
  skills: string[]
  education?: string
  certifications: string[]
  availableStartDate: string
  workAuthorization: string
  willingToRelocate: boolean
  travelWillingness: string
  source: string
  recruiterName?: string
  recruiterAgency?: string
  notes?: string
}

export interface Recruit extends RecruitData {
  id: string
  status: 'sourced' | 'screened' | 'interviewed' | 'offer_extended' | 'accepted' | 'rejected'
  createdAt: string
  updatedAt: string
}

// Custom Error Classes
export class ApiValidationError extends Error {
  constructor(
    message: string,
    public details: Array<{ field: string; message: string }>
  ) {
    super(message)
    this.name = 'ApiValidationError'
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// API Request Helper
async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dev-token-123', // Default development token
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()
    
    // Validate response structure
    const validatedResponse = ApiResponse.parse(data)
    
    if (!validatedResponse.success) {
      if (validatedResponse.details) {
        throw new ApiValidationError(validatedResponse.error, validatedResponse.details)
      } else {
        throw new ApiError(
          validatedResponse.message || validatedResponse.error,
          response.status
        )
      }
    }

    // Validate and return the data
    return schema.parse(validatedResponse.data)
    
  } catch (error) {
    if (error instanceof ApiValidationError || error instanceof ApiError) {
      throw error
    }
    
    // Handle network errors or JSON parsing errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network error. Please check your connection.', 0)
    }
    
    throw new ApiError('An unexpected error occurred.', 500)
  }
}

// API Functions
export const recruitsApi = {
  // Submit a new recruit
  async submitRecruit(recruitData: RecruitData) {
    const schema = z.object({
      recruitId: z.string(),
      status: z.string(),
      message: z.string()
    })

    return apiRequest('/api/recruits', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer dev-token-123', // Development token
      },
      body: JSON.stringify(recruitData),
    }, schema)
  },

  // Get recruits with pagination and filters
  async getRecruits(params: {
    page?: number
    limit?: number
    status?: string
    search?: string
  } = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.status) queryParams.append('status', params.status)
    if (params.search) queryParams.append('search', params.search)

    const schema = z.object({
      recruits: z.array(z.any()), // We'll type this more strictly later
      pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number()
      })
    })

    return apiRequest(`/api/recruits?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer dev-token-123', // Development token
      }
    }, schema)
  },

  // Move recruit to onboarding
  async moveToOnboarding(recruitId: string) {
    const schema = z.object({
      onboardingId: z.string(),
      message: z.string()
    })

    return apiRequest(`/api/recruits/${recruitId}/onboard`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer dev-token-123', // Development token
      },
    }, schema)
  },

  // Update recruit status
  async updateRecruitStatus(recruitId: string, status: Recruit['status']) {
    const schema = z.object({
      recruitId: z.string(),
      status: z.string(),
      message: z.string()
    })

    return apiRequest(`/api/recruits/${recruitId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer dev-token-123', // Development token
      },
      body: JSON.stringify({ status }),
    }, schema)
  }
}

// Helper Functions
export function getFieldErrors(error: ApiValidationError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  
  error.details.forEach(detail => {
    fieldErrors[detail.field] = detail.message
  })
  
  return fieldErrors
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiValidationError) {
    return error.message
  }
  
  if (error instanceof ApiError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}
