import { z } from 'zod'

// Base recruit data interface
export interface RecruitData {
  firstName: string
  lastName: string
  email: string
  phone?: string
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

// Database recruit record with encryption
export interface RecruitRecord {
  id: string
  tenant_id: string
  
  // Encrypted PII fields
  first_name_encrypted: string
  last_name_encrypted: string
  email_encrypted: string
  phone_encrypted?: string
  current_location_encrypted: string
  
  // Searchable hashes
  email_hash: string
  phone_hash?: string
  
  // Non-PII professional data
  job_title: string
  years_experience: number
  current_company?: string
  desired_salary?: string
  skills?: string // JSON array
  education?: string
  certifications?: string // JSON array
  
  // Availability
  available_start_date: string
  work_authorization: string
  willing_to_relocate: number // SQLite boolean
  travel_willingness: string
  
  // Source
  source: string
  recruiter_name?: string
  recruiter_agency?: string
  notes?: string
  
  // Status
  status: RecruitStatus
  onboarding_id?: string
  
  // Consent & Privacy
  privacy_consent_given: number
  privacy_consent_date?: number
  privacy_consent_version?: string
  data_processing_consent: number
  marketing_consent: number
  biometric_consent: number
  
  // Data retention
  retention_period?: number
  deletion_scheduled_date?: number
  anonymized: number
  
  // Audit
  created_by: string
  created_at: number
  updated_by?: string
  updated_at: number
}

export type RecruitStatus = 
  | 'sourced'
  | 'screened' 
  | 'interviewed'
  | 'offer_extended'
  | 'accepted'
  | 'rejected'
  | 'onboarding'

export interface ConsentRecord {
  id: string
  recruit_id: string
  tenant_id: string
  consent_type: 'privacy' | 'data_processing' | 'marketing' | 'biometric'
  consent_given: number
  consent_version: string
  consent_text: string
  purpose_specification: string
  data_categories: string // JSON array
  processing_activities: string // JSON array
  retention_period?: number
  opt_in_method?: string
  ip_address?: string
  user_agent?: string
  withdrawal_date?: number
  withdrawal_method?: string
  consent_date: number
  expiry_date?: number
}

// Validation schemas
export const RecruitDataSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email format').max(254),
  phone: z.string().max(20).optional(),
  currentLocation: z.string().min(1, 'Current location is required').max(100),
  jobTitle: z.string().min(1, 'Job title is required').max(100),
  yearsExperience: z.number().min(0).max(50),
  currentCompany: z.string().max(100).optional(),
  desiredSalary: z.string().max(50).optional(),
  skills: z.array(z.string().max(50)).max(20),
  education: z.string().max(500).optional(),
  certifications: z.array(z.string().max(100)).max(10),
  availableStartDate: z.string().min(1, 'Available start date is required'),
  workAuthorization: z.string().min(1, 'Work authorization is required').max(50),
  willingToRelocate: z.boolean(),
  travelWillingness: z.string().max(50),
  source: z.string().min(1, 'Recruiting source is required').max(100),
  recruiterName: z.string().max(100).optional(),
  recruiterAgency: z.string().max(100).optional(),
  notes: z.string().max(2000).optional()
})

export const RecruitStatusSchema = z.enum([
  'sourced',
  'screened', 
  'interviewed',
  'offer_extended',
  'accepted',
  'rejected',
  'onboarding'
])

export const ConsentTypeSchema = z.enum([
  'privacy',
  'data_processing', 
  'marketing',
  'biometric'
])

// API response types
export interface CreateRecruitResponse {
  success: boolean
  data?: {
    recruitId: string
    status: string
    message: string
  }
  error?: string
  details?: Array<{ field: string; message: string }>
}

export interface GetRecruitsResponse {
  success: boolean
  data?: {
    recruits: RecruitData[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  error?: string
}

export interface MoveToOnboardingResponse {
  success: boolean
  data?: {
    onboardingId: string
    recruitId: string
    status: string
    message: string
    nextSteps: string[]
  }
  error?: string
}

// Search and filtering types
export interface RecruitSearchParams {
  query?: string
  status?: RecruitStatus[]
  skills?: string[]
  workAuthorization?: string[]
  location?: string
  experienceMin?: number
  experienceMax?: number
  source?: string[]
  dateRange?: {
    start: string
    end: string
  }
  sortBy?: 'created_at' | 'updated_at' | 'firstName' | 'yearsExperience'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Analytics types
export interface RecruitingMetrics {
  totalRecruits: number
  recruitsByStatus: Record<RecruitStatus, number>
  recruitsBySource: Record<string, number>
  conversionRates: {
    sourcedToScreened: number
    screenedToInterviewed: number
    interviewedToOffered: number
    offeredToAccepted: number
    acceptedToOnboarded: number
  }
  averageTimeToHire: number
  topSkills: Array<{ skill: string; count: number }>
  geographicDistribution: Record<string, number>
  consentCompliance: {
    totalWithConsent: number
    totalWithoutConsent: number
    consentRate: number
  }
}

// Compliance types
export interface DataSubjectRequest {
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection'
  recruitId: string
  requestorEmail: string
  verificationToken: string
  requestDate: number
  processedDate?: number
  status: 'pending' | 'verified' | 'processing' | 'completed' | 'rejected'
  responseData?: any
}

export interface RetentionPolicy {
  category: 'active_recruitment' | 'completed_hire' | 'rejected_candidate' | 'legal_hold'
  retentionPeriodDays: number
  legalBasis: string
  autoDelete: boolean
  anonymizeBeforeDelete: boolean
}

// Error types
export class RecruitingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message)
    this.name = 'RecruitingError'
  }
}

export const RECRUITING_ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  RECRUIT_NOT_FOUND: 'RECRUIT_NOT_FOUND',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  ENCRYPTION_FAILED: 'ENCRYPTION_FAILED',
  CONSENT_REQUIRED: 'CONSENT_REQUIRED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const

export type RecruitingErrorCode = typeof RECRUITING_ERROR_CODES[keyof typeof RECRUITING_ERROR_CODES]
