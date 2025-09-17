import { z } from 'zod'

// Base schemas for common field types
export const emailSchema = z.string().email('Invalid email format')
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format').optional()
export const currencySchema = z.string().regex(/^[A-Z]{3}$/, 'Currency must be 3-letter ISO code').default('USD')
export const positiveNumberSchema = z.number().positive('Must be a positive number')
export const dateStringSchema = z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')

// Expense validation schemas
export const travelExpenseSchema = z.object({
  engineerId: z.string().min(1, 'Engineer ID is required'),
  engineerName: z.string().min(1, 'Engineer name is required'),
  expenseType: z.enum(['airfare', 'hotel', 'meals', 'mileage', 'parking', 'fuel', 'other']),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  amount: positiveNumberSchema,
  currency: currencySchema,
  date: dateStringSchema,
  location: z.string().min(1, 'Location is required'),
  receipt: z.string().url('Receipt must be a valid URL').optional(),
  mileage: z.number().positive().optional(),
  mileageRate: z.number().positive().optional(),
  reimbursable: z.boolean().default(true),
  billableToClient: z.boolean().default(false),
  projectId: z.string().min(1, 'Project ID is required')
})

export const miscExpenseSchema = z.object({
  engineerId: z.string().min(1, 'Engineer ID is required'),
  engineerName: z.string().min(1, 'Engineer name is required'),
  category: z.enum(['office_supplies', 'software', 'hardware', 'communication', 'training', 'other']),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  amount: positiveNumberSchema,
  currency: currencySchema,
  date: dateStringSchema,
  receipt: z.string().url('Receipt must be a valid URL').optional(),
  reimbursable: z.boolean().default(true),
  billableToClient: z.boolean().default(false),
  taxDeductible: z.boolean().default(false),
  projectId: z.string().min(1, 'Project ID is required')
})

export const expenseApprovalSchema = z.object({
  expenseId: z.string().min(1, 'Expense ID is required'),
  action: z.enum(['approve', 'reject']),
  approverId: z.string().min(1, 'Approver ID is required'),
  notes: z.string().max(1000, 'Notes too long').optional()
})

// Project approval validation schemas
export const projectApprovalRequestSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  requestType: z.enum(['engineer_deployment', 'budget_increase', 'scope_change', 'timeline_extension']),
  requesterId: z.string().min(1, 'Requester ID is required'),
  requesterName: z.string().min(1, 'Requester name is required'),
  budgetAmount: positiveNumberSchema,
  deploymentDetails: z.object({
    engineers: z.array(z.object({
      id: z.string(),
      name: z.string(),
      role: z.string(),
      hourlyRate: positiveNumberSchema,
      estimatedHours: positiveNumberSchema
    })).min(1, 'At least one engineer is required'),
    location: z.string().min(1, 'Location is required'),
    startDate: dateStringSchema,
    endDate: dateStringSchema,
    travelRequired: z.boolean(),
    accommodationNeeds: z.string().optional()
  }).optional()
})

export const projectApprovalActionSchema = z.object({
  approvalId: z.string().min(1, 'Approval ID is required'),
  action: z.enum(['approved', 'rejected', 'conditionally_approved']),
  approverId: z.string().min(1, 'Approver ID is required'),
  notes: z.string().max(1000, 'Notes too long').optional(),
  conditions: z.array(z.string()).optional()
})

// Customer portal validation schemas
export const customerPortalAuthSchema = z.object({
  email: emailSchema,
  invoiceId: z.string().min(1, 'Invoice ID is required')
})

export const customerPortalSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  token: z.string().min(1, 'Token is required')
})

// Recruit validation schemas
export const recruitSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: emailSchema,
  phone: phoneSchema,
  currentLocation: z.string().max(100, 'Location too long').optional(),
  jobTitle: z.string().max(100, 'Job title too long').optional(),
  yearsExperience: z.number().min(0, 'Experience cannot be negative').max(50, 'Experience too high').optional(),
  currentCompany: z.string().max(100, 'Company name too long').optional(),
  desiredSalary: z.string().max(50, 'Salary string too long').optional(),
  skills: z.array(z.string().max(50, 'Skill name too long')).max(20, 'Too many skills listed').optional(),
  education: z.string().max(200, 'Education description too long').optional(),
  certifications: z.array(z.string().max(100, 'Certification name too long')).max(10, 'Too many certifications').optional(),
  availableStartDate: dateStringSchema.optional(),
  workAuthorization: z.enum(['US Citizen', 'Green Card', 'H1B Visa', 'F1 OPT', 'Other']).optional(),
  willingToRelocate: z.boolean().optional(),
  travelWillingness: z.enum(['None', 'Up to 10%', 'Up to 25%', 'Up to 50%', 'Up to 75%', 'Up to 100%']).optional(),
  source: z.string().max(50, 'Source too long').optional(),
  recruiterName: z.string().max(100, 'Recruiter name too long').optional(),
  recruiterAgency: z.string().max(100, 'Agency name too long').optional(),
  notes: z.string().max(1000, 'Notes too long').optional()
})

// Invoice validation schemas
export const invoiceCreateSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  clientEmail: emailSchema,
  engineerDeployments: z.array(z.object({
    engineerId: z.string(),
    engineerName: z.string(),
    role: z.string(),
    hourlyRate: positiveNumberSchema,
    hoursWorked: positiveNumberSchema,
    startDate: dateStringSchema,
    endDate: dateStringSchema
  })).min(1, 'At least one engineer deployment is required'),
  softCosts: z.object({
    management: positiveNumberSchema.default(0),
    insurance: positiveNumberSchema.default(0),
    overhead: positiveNumberSchema.default(0),
    profitMargin: z.number().min(0).max(100, 'Profit margin cannot exceed 100%').default(0)
  }).optional(),
  hardCosts: z.object({
    equipment: positiveNumberSchema.default(0),
    materials: positiveNumberSchema.default(0),
    software: positiveNumberSchema.default(0),
    infrastructure: positiveNumberSchema.default(0)
  }).optional(),
  paymentTerms: z.enum(['net_15', 'net_30', 'net_45', 'net_60']).default('net_30'),
  dueDate: dateStringSchema.optional()
})

// Security and rate limiting schemas
export const rateLimitBypassSchema = z.object({
  bypassCode: z.string().min(32, 'Bypass code must be at least 32 characters'),
  reason: z.string().min(10, 'Reason must be provided').max(200, 'Reason too long')
})

// Query parameter validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20)
})

export const dateRangeSchema = z.object({
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional()
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate)
  }
  return true
}, 'Start date must be before or equal to end date')

export const expenseFiltersSchema = z.object({
  engineerId: z.string().optional(),
  projectId: z.string().optional(),
  type: z.enum(['travel', 'misc']).optional(),
  status: z.enum(['approved', 'pending', 'rejected']).optional(),
  ...dateRangeSchema.shape,
  ...paginationSchema.shape
})

export const approvalFiltersSchema = z.object({
  projectId: z.string().optional(),
  approverId: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'conditionally_approved']).optional(),
  ...paginationSchema.shape
})

export const recruitFiltersSchema = z.object({
  status: z.enum(['sourced', 'screened', 'interviewed', 'offer_extended', 'hired', 'rejected']).optional(),
  search: z.string().max(100, 'Search term too long').optional(),
  ...paginationSchema.shape
})

// Validation helper function
export function validateRequestBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, errors: result.error }
}

// Validation middleware helper
export function createValidationResponse(errors: z.ZodError) {
  return {
    success: false,
    error: 'Validation failed',
    message: 'Please check the following validation errors',
    details: errors.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))
  }
}