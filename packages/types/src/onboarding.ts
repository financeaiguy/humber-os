import { z } from 'zod';
import { EngineerCategory } from './engineer';

// Location and Address Schema
export const LocationSchema = z.object({
  country: z.string().min(2),
  city: z.string().min(1),
  state: z.string().optional(),
  zipCode: z.string().min(3),
  address: z.string().min(5),
  timezone: z.string().optional(),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional()
});

export type Location = z.infer<typeof LocationSchema>;

// Passport Schema
export const PassportSchema = z.object({
  passportNumber: z.string().min(6),
  issuingCountry: z.string().min(2),
  issueDate: z.string(),
  expirationDate: z.string(),
  documentImageUrl: z.string().url().optional(),
  ocrExtractedData: z.object({
    confidence: z.number().min(0).max(1),
    extractedFields: z.record(z.string(), z.any()),
    processingDate: z.number()
  }).optional()
});

export type Passport = z.infer<typeof PassportSchema>;

// Visa Schema for different countries
export const VisaStatusType = z.enum([
  'citizen',
  'permanent_resident',
  'work_visa',
  'student_visa',
  'tourist_visa',
  'asylum',
  'refugee',
  'pending',
  'expired',
  'none_required'
]);

export const VisaSchema = z.object({
  country: z.enum(['US', 'CA', 'MX', 'OTHER']),
  status: VisaStatusType,
  visaNumber: z.string().optional(),
  issueDate: z.string().optional(),
  expirationDate: z.string().optional(),
  workAuthorized: z.boolean(),
  documentImageUrl: z.string().url().optional(),
  ocrExtractedData: z.object({
    confidence: z.number().min(0).max(1),
    extractedFields: z.record(z.string(), z.any()),
    processingDate: z.number()
  }).optional()
});

export type Visa = z.infer<typeof VisaSchema>;

// Identity Document OCR Schema
export const IdentityDocumentTypeEnum = z.enum([
  'drivers_license',
  'state_id',
  'passport',
  'visa',
  'work_permit',
  'green_card',
  'social_security_card',
  'birth_certificate'
]);

export const OCRExtractedDataSchema = z.object({
  documentType: IdentityDocumentTypeEnum,
  confidence: z.number().min(0).max(1),
  rawText: z.string(),
  extractedFields: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    dateOfBirth: z.string().optional(),
    documentNumber: z.string().optional(),
    issueDate: z.string().optional(),
    expirationDate: z.string().optional(),
    issuingAuthority: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
    sex: z.string().optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
    eyeColor: z.string().optional(),
    restrictions: z.string().optional()
  }),
  processingDate: z.number(),
  originalImageUrl: z.string().url(),
  processedImageUrl: z.string().url().optional(),
  errorLog: z.array(z.string()).optional()
});

export type OCRExtractedData = z.infer<typeof OCRExtractedDataSchema>;
export type IdentityDocumentType = z.infer<typeof IdentityDocumentTypeEnum>;

// Enhanced Onboarding Form Schema
export const OnboardingFormSchema = z.object({
  // Basic Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  dateOfBirth: z.string(),
  
  // Engineer Category
  category: EngineerCategory,
  
  // Location Information
  currentLocation: LocationSchema,
  willingToRelocate: z.boolean(),
  maxTravelDistance: z.number().min(0).optional(), // in miles
  preferredWorkLocations: z.array(z.string()).optional(),
  
  // Passport Information
  passport: PassportSchema,
  
  // Visa Status for Multiple Countries
  visaStatus: z.object({
    us: VisaSchema.optional(),
    canada: VisaSchema.optional(),
    mexico: VisaSchema.optional(),
    other: z.array(VisaSchema).optional()
  }),
  
  // Identity Documents for OCR Processing
  identityDocuments: z.array(z.object({
    documentType: IdentityDocumentTypeEnum,
    imageUrl: z.string().url(),
    uploadDate: z.number(),
    ocrProcessed: z.boolean().default(false),
    ocrData: OCRExtractedDataSchema.optional()
  })),
  
  // Emergency Contact
  emergencyContact: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    relationship: z.string().min(1),
    phone: z.string().min(10),
    email: z.string().email().optional(),
    address: LocationSchema.optional()
  }),
  
  // Skills and Experience
  skills: z.array(z.string()),
  yearsOfExperience: z.number().min(0),
  previousEmployers: z.array(z.object({
    companyName: z.string(),
    position: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    location: z.string()
  })).optional(),
  
  // Availability
  availability: z.object({
    startDate: z.string(),
    endDate: z.string().optional(),
    hoursPerWeek: z.number().min(1).max(80),
    shiftPreference: z.enum(['day', 'night', 'flexible']),
    weekendAvailable: z.boolean()
  }),
  
  // Travel Requirements
  travelRequirements: z.object({
    hasValidDriversLicense: z.boolean(),
    ownVehicle: z.boolean(),
    willTravel: z.boolean(),
    maxTravelDuration: z.number().optional(), // in days
    travelPreferences: z.array(z.enum(['domestic', 'international', 'short_term', 'long_term'])).optional()
  }),
  
  // Form Metadata
  submissionDate: z.number(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  formVersion: z.string().default('1.0')
});

export type OnboardingForm = z.infer<typeof OnboardingFormSchema>;

// Onboarding Status Tracking
export const OnboardingStatus = z.enum([
  'form_pending',      // Link sent, form not completed
  'form_submitted',    // Form completed, pending review
  'documents_processing', // OCR processing documents
  'documents_verified',   // All documents processed and verified
  'background_check',     // Background check in progress
  'visa_verification',    // Visa status verification
  'approval_pending',     // Waiting for final approval
  'approved',            // Onboarding approved
  'rejected',            // Onboarding rejected
  'onboarding_complete'  // Ready for deployment
]);

export type OnboardingStatusType = z.infer<typeof OnboardingStatus>;

// Onboarding Process Schema
export const OnboardingProcessSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  engineerId: z.string().optional(), // Set after approval
  
  // Form Data
  formData: OnboardingFormSchema.optional(),
  
  // Status Tracking
  status: OnboardingStatus,
  currentStep: z.string(),
  completedSteps: z.array(z.string()),
  
  // Document Processing
  documentsStatus: z.object({
    totalDocuments: z.number(),
    processedDocuments: z.number(),
    verifiedDocuments: z.number(),
    failedDocuments: z.number(),
    processingErrors: z.array(z.string())
  }),
  
  // Location-Based Assignment Data
  locationData: z.object({
    primaryLocation: LocationSchema.optional(),
    travelRadius: z.number().optional(),
    nearbyProjects: z.array(z.object({
      projectId: z.string(),
      clientName: z.string(),
      location: z.string(),
      distance: z.number(), // in miles
      travelTime: z.number(), // in minutes
      matchScore: z.number().min(0).max(100)
    })).optional()
  }).optional(),
  
  // Visa and Work Authorization
  workAuthorization: z.object({
    countries: z.array(z.string()),
    restrictions: z.array(z.string()).optional(),
    expirationDates: z.record(z.string(), z.string()).optional()
  }).optional(),
  
  // Onboarding Link
  onboardingLink: z.object({
    token: z.string(),
    expiresAt: z.number(),
    isUsed: z.boolean(),
    sentAt: z.number().optional(),
    completedAt: z.number().optional()
  }),
  
  // Timestamps
  createdAt: z.number(),
  updatedAt: z.number(),
  completedAt: z.number().optional()
});

export type OnboardingProcess = z.infer<typeof OnboardingProcessSchema>;

// OCR Processing Request
export const OCRProcessingRequestSchema = z.object({
  tenantId: z.string(),
  onboardingId: z.string(),
  documentId: z.string(),
  imageUrl: z.string().url(),
  documentType: IdentityDocumentTypeEnum,
  processingOptions: z.object({
    extractText: z.boolean().default(true),
    extractStructuredData: z.boolean().default(true),
    validateDocument: z.boolean().default(true),
    detectForgery: z.boolean().default(true)
  }).optional()
});

export type OCRProcessingRequest = z.infer<typeof OCRProcessingRequestSchema>;

// Project Assignment Logic Input
export const ProjectAssignmentInputSchema = z.object({
  tenantId: z.string(),
  engineerId: z.string(),
  engineerLocation: LocationSchema,
  engineerCategory: EngineerCategory,
  maxTravelDistance: z.number(),
  maxTravelTime: z.number(), // in minutes
  availability: z.object({
    startDate: z.string(),
    endDate: z.string().optional()
  }),
  skills: z.array(z.string()),
  hourlyRate: z.number().optional()
});

export type ProjectAssignmentInput = z.infer<typeof ProjectAssignmentInputSchema>;

// Project Assignment Result
export const ProjectAssignmentResultSchema = z.object({
  engineerId: z.string(),
  suitableProjects: z.array(z.object({
    projectId: z.string(),
    clientName: z.string(),
    projectName: z.string(),
    location: z.string(),
    distance: z.number(),
    travelTime: z.number(),
    matchScore: z.number().min(0).max(100),
    matchReasons: z.array(z.string()),
    estimatedStartDate: z.string(),
    estimatedEndDate: z.string().optional(),
    hourlyRate: z.number()
  })),
  generatedAt: z.number()
});

export type ProjectAssignmentResult = z.infer<typeof ProjectAssignmentResultSchema>;