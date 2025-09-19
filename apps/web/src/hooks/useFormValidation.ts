import { useState, useCallback } from 'react'
import { z } from 'zod'

// Validation schema for onboarding form
const OnboardingValidationSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^[\+]?[\d\s\(\)\-\.]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits'),
  
  currentLocation: z.string()
    .min(1, 'Current location is required')
    .max(100, 'Location must be less than 100 characters'),
  
  desiredSalary: z.number()
    .min(0, 'Salary must be positive')
    .max(1000000, 'Salary seems unrealistic')
    .optional()
    .or(z.literal('')),
  
  availableStartDate: z.string()
    .min(1, 'Available start date is required')
    .refine((date) => {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    }, 'Start date cannot be in the past'),
  
  recruitmentDate: z.string()
    .min(1, 'Recruitment date is required'),
  
  visaStatus: z.enum(['US_CITIZEN', 'PERMANENT_RESIDENT', 'H1B', 'L1', 'TN', 'F1_OPT', 'OTHER'], {
    errorMap: () => ({ message: 'Please select a visa status' })
  }),
  
  travelLimitations: z.string()
    .max(500, 'Travel limitations must be less than 500 characters'),
  
  specialtyKeywords: z.array(z.string())
    .min(1, 'Please add at least one specialty keyword')
    .max(10, 'Maximum 10 specialty keywords allowed'),
  
  legalIdentifier: z.object({
    type: z.enum(['SSN', 'TIN', 'ITIN', 'EIN'], {
      errorMap: () => ({ message: 'Please select an identifier type' })
    }),
    number: z.string()
      .min(1, 'Legal identifier number is required')
      .regex(/^[\d\-]+$/, 'Legal identifier can only contain numbers and hyphens')
      .refine((value, ctx) => {
        const type = ctx.path.length > 1 ? ctx.path[ctx.path.length - 2] : null
        if (type === 'SSN' && !value.match(/^\d{3}-?\d{2}-?\d{4}$/)) {
          return false
        }
        if ((type === 'TIN' || type === 'EIN') && !value.match(/^\d{2}-?\d{7}$/)) {
          return false
        }
        if (type === 'ITIN' && !value.match(/^9\d{2}-?\d{2}-?\d{4}$/)) {
          return false
        }
        return true
      }, 'Please enter a valid identifier number for the selected type')
  }),
  
  totalExperience: z.number()
    .min(0, 'Experience must be 0 or greater')
    .max(50, 'Experience seems unrealistic')
    .int('Experience must be a whole number'),
  
  employeeType: z.enum(['full-time', 'contractor', 'part-time', 'intern'], {
    errorMap: () => ({ message: 'Please select an employee type' })
  })
})

type ValidationErrors = Record<string, string>
type OnboardingData = z.infer<typeof OnboardingValidationSchema>

interface UseFormValidationReturn {
  errors: ValidationErrors
  isValid: boolean
  validateField: (field: string, value: any, data?: any) => string | null
  validateForm: (data: any) => boolean
  clearErrors: () => void
  clearFieldError: (field: string) => void
  setFieldError: (field: string, error: string) => void
}

export function useFormValidation(): UseFormValidationReturn {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validateField = useCallback((field: string, value: any, fullData?: any): string | null => {
    try {
      // Get the field schema
      const fieldSchema = OnboardingValidationSchema.shape[field as keyof typeof OnboardingValidationSchema.shape]
      
      if (!fieldSchema) {
        // SECURITY: console statement removed: console.warn(`No validation schema found for field: ${field}`)
        return null
      }

      // For nested objects, handle specially
      if (field.includes('.')) {
        const [parentField, childField] = field.split('.')
        const parentSchema = OnboardingValidationSchema.shape[parentField as keyof typeof OnboardingValidationSchema.shape]
        
        if (parentSchema && 'shape' in parentSchema) {
          const childSchema = (parentSchema as any).shape[childField]
          if (childSchema) {
            childSchema.parse(value)
          }
        }
      } else {
        // Special handling for fields that depend on other fields
        if (field === 'legalIdentifier') {
          OnboardingValidationSchema.shape.legalIdentifier.parse(value)
        } else {
          fieldSchema.parse(value)
        }
      }

      return null
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues[0]?.message || 'Validation failed'
      }
      return 'Validation error'
    }
  }, [])

  const validateForm = useCallback((data: any): boolean => {
    try {
      OnboardingValidationSchema.parse(data)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationErrors = {}
        error.issues.forEach((issue) => {
          const fieldPath = issue.path.join('.')
          newErrors[fieldPath] = issue.message
        })
        setErrors(newErrors)
        return false
      }
      return false
    }
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }))
  }, [])

  const isValid = Object.keys(errors).length === 0

  return {
    errors,
    isValid,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    setFieldError
  }
}

// Helper function to get user-friendly field names
export function getFieldDisplayName(field: string): string {
  const fieldNames: Record<string, string> = {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone Number',
    currentLocation: 'Current Location',
    desiredSalary: 'Desired Salary',
    availableStartDate: 'Available Start Date',
    recruitmentDate: 'Recruitment Date',
    visaStatus: 'Visa Status',
    travelLimitations: 'Travel Limitations',
    specialtyKeywords: 'Specialty Keywords',
    'legalIdentifier.type': 'Legal Identifier Type',
    'legalIdentifier.number': 'Legal Identifier Number',
    totalExperience: 'Total Experience',
    employeeType: 'Employee Type'
  }
  
  return fieldNames[field] || field
}

// Helper function to format legal identifier based on type
export function formatLegalIdentifier(type: string, value: string): string {
  const cleaned = value.replace(/\D/g, '')
  
  switch (type) {
    case 'SSN':
      if (cleaned.length >= 9) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`
      }
      return cleaned
    case 'TIN':
    case 'EIN':
      if (cleaned.length >= 9) {
        return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 9)}`
      }
      return cleaned
    case 'ITIN':
      if (cleaned.length >= 9 && cleaned.startsWith('9')) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`
      }
      return cleaned
    default:
      return value
  }
}