import { z } from 'zod'

// API Response schemas
const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.array(z.object({
    field: z.string(),
    message: z.string()
  })).optional()
})

const RecruitmentDataSchema = z.object({
  success: z.literal(true),
  data: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    currentLocation: z.string(),
    desiredSalary: z.number(),
    availableStartDate: z.string(),
    totalExperience: z.number(),
    recruitmentDate: z.string(),
    skills: z.array(z.string()),
    visaStatus: z.string().optional(),
    previousEmployment: z.array(z.object({
      company: z.string(),
      role: z.string(),
      duration: z.string()
    })).optional()
  })
})

const OnboardingSubmissionResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    onboardingId: z.string(),
    status: z.string(),
    phase: z.number(),
    nextSteps: z.array(z.string()),
    estimatedProcessingTime: z.string()
  })
})

type ApiError = z.infer<typeof ApiErrorSchema>
type RecruitmentData = z.infer<typeof RecruitmentDataSchema>
type OnboardingSubmissionResponse = z.infer<typeof OnboardingSubmissionResponseSchema>

// Custom error classes
export class ApiValidationError extends Error {
  constructor(public details: Array<{ field: string; message: string }>) {
    super('Validation failed')
    this.name = 'ApiValidationError'
  }
}

export class ApiNetworkError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ApiNetworkError'
  }
}

export class ApiServerError extends Error {
  constructor(message: string, public status: number) {
    super(message)
    this.name = 'ApiServerError'
  }
}

// Retry configuration
interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2
}

// Retry with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = defaultRetryConfig
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry for validation errors or client errors (4xx)
      if (error instanceof ApiValidationError || 
          (error instanceof ApiServerError && error.status >= 400 && error.status < 500)) {
        throw error
      }
      
      // If this was the last attempt, throw the error
      if (attempt === config.maxAttempts) {
        throw error
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelay
      )
      
      console.warn(`API attempt ${attempt} failed, retrying in ${delay}ms:`, error.message)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

// Generic API client
async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    const data = await response.json()

    if (!response.ok) {
      // Try to parse as API error
      const errorResult = ApiErrorSchema.safeParse(data)
      if (errorResult.success) {
        if (errorResult.data.details) {
          throw new ApiValidationError(errorResult.data.details)
        }
        throw new ApiServerError(errorResult.data.error, response.status)
      }
      
      throw new ApiNetworkError(`HTTP ${response.status}: ${response.statusText}`, response.status)
    }

    // Validate response schema
    const result = schema.safeParse(data)
    if (!result.success) {
      console.error('Invalid API response schema:', result.error)
      throw new ApiServerError('Invalid response format from server', 500)
    }

    return result.data
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiNetworkError('Network connection failed')
    }
    throw error
  }
}

// API functions
export const onboardingApi = {
  // Fetch recruitment data with retry logic
  async fetchRecruitmentData(recruitId: string, tenantId?: string): Promise<RecruitmentData['data']> {
    return withRetry(async () => {
      const response = await apiRequest(
        '/api/onboarding/recruitment-data',
        {
          method: 'POST',
          body: JSON.stringify({ recruitId, tenantId })
        },
        RecruitmentDataSchema
      )
      return response.data
    })
  },

  // Submit onboarding data with validation
  async submitOnboarding(data: any): Promise<OnboardingSubmissionResponse['data']> {
    return withRetry(async () => {
      const response = await apiRequest(
        '/api/onboarding/submit',
        {
          method: 'POST',
          body: JSON.stringify(data)
        },
        OnboardingSubmissionResponseSchema
      )
      return response.data
    }, {
      ...defaultRetryConfig,
      maxAttempts: 2 // Fewer retries for submissions to avoid duplicates
    })
  },

  // Get onboarding status
  async getOnboardingStatus(onboardingId: string): Promise<any> {
    return withRetry(async () => {
      const response = await apiRequest(
        `/api/onboarding/submit?onboardingId=${onboardingId}`,
        { method: 'GET' },
        z.object({
          success: z.literal(true),
          data: z.object({
            onboardingId: z.string(),
            status: z.string(),
            phase: z.number(),
            completedSteps: z.array(z.string()),
            pendingSteps: z.array(z.string()),
            lastUpdated: z.string()
          })
        })
      )
      return response.data
    })
  }
}

// Error helper functions
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiValidationError) {
    return error.details.length > 0 
      ? error.details.map(d => d.message).join(', ')
      : 'Please check your input and try again'
  }
  
  if (error instanceof ApiNetworkError) {
    return 'Network connection failed. Please check your internet connection and try again.'
  }
  
  if (error instanceof ApiServerError) {
    return error.message || 'Server error occurred. Please try again later.'
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred. Please try again.'
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof ApiValidationError) {
    return error.details.reduce((acc, detail) => {
      acc[detail.field] = detail.message
      return acc
    }, {} as Record<string, string>)
  }
  return {}
}