import { z } from 'zod';
import { EngineerCategory } from './engineer';

// Operations Flow Stages - 4 main stages as per requirements
export const OperationStage = z.enum([
  'RECRUITING',     // Initial candidate sourcing and screening
  'HIRING',         // Vetting, interviews, and selection
  'VISA',           // Visa processing and offer letter
  'DEPLOYMENT'      // Final deployment to client
]);

export type OperationStage = z.infer<typeof OperationStage>;

// Candidate Status - Enhanced with clear progression
export const CandidateStatus = z.enum([
  // Recruiting Stage
  'recruiting',
  'recruiting_completed',
  
  // Hiring Stage  
  'vetting',
  'interviewing',
  'hiring_decision',
  
  // Checks and Verification
  'drug_test',
  'background_check', 
  'certification_check',
  'ssn_verification',
  
  // Visa and Offer Stage
  'offer_sent',
  'offer_accepted',
  'visa_processing',
  'visa_approved',
  
  // Deployment Stage
  'ready_for_deployment',
  'deployed',
  
  // Terminal States
  'rejected',
  'withdrawn',
  'terminated'
]);

export type CandidateStatus = z.infer<typeof CandidateStatus>;

// Pass/Fail Deployment Tracking
export const DeploymentOutcome = z.enum(['pass', 'fail']);
export type DeploymentOutcome = z.infer<typeof DeploymentOutcome>;

export const DeploymentTrackingSchema = z.object({
  candidateId: z.string(),
  tenantId: z.string(),
  deploymentId: z.string(),
  clientName: z.string(),
  projectName: z.string(),
  startDate: z.string(),
  plannedEndDate: z.string(),
  actualEndDate: z.string().optional(),
  outcome: DeploymentOutcome.optional(),
  failureReason: z.string().optional(),
  performanceRating: z.number().min(1).max(5).optional(),
  clientFeedback: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.number(),
  updatedAt: z.number()
});

export type DeploymentTracking = z.infer<typeof DeploymentTrackingSchema>;

export const RecruitingStep1Schema = z.object({
  tenantId: z.string(),
  candidateId: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  resume: z.string().optional(),
  position: z.string().optional(),
  source: z.string().optional(),
});

export type RecruitingStep1Input = z.infer<typeof RecruitingStep1Schema>;

export const HiringVettingStep2Schema = z.object({
  tenantId: z.string(),
  candidateId: z.string(),
  interviewScore: z.number().min(0).max(100).optional(),
  technicalScore: z.number().min(0).max(100).optional(),
  culturalFitScore: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  decision: z.enum(['proceed', 'reject', 'hold']),
});

export type HiringVettingStep2Input = z.infer<typeof HiringVettingStep2Schema>;

export const BackgroundCheckSchema = z.object({
  tenantId: z.string(),
  candidateId: z.string(),
  drugTestCompleted: z.boolean(),
  drugTestResult: z.enum(['pass', 'fail', 'pending']).optional(),
  backgroundCheckCompleted: z.boolean(),
  backgroundCheckResult: z.enum(['clear', 'flagged', 'pending']).optional(),
  certificationVerified: z.boolean(),
  certificationDetails: z.string().optional(),
  ssnVerified: z.boolean(),
  ssnDetails: z.string().optional(),
});

export type BackgroundCheckInput = z.infer<typeof BackgroundCheckSchema>;

export const OfferLetterVisaSchema = z.object({
  tenantId: z.string(),
  candidateId: z.string(),
  offerAmount: z.number().positive(),
  startDate: z.string(),
  position: z.string(),
  location: z.string(),
  visaRequired: z.boolean(),
  visaType: z.string().optional(),
  visaStatus: z.enum(['not_required', 'pending', 'approved', 'denied']).optional(),
});

export type OfferLetterVisaInput = z.infer<typeof OfferLetterVisaSchema>;

export const DeploymentSchema = z.object({
  tenantId: z.string(),
  candidateId: z.string(),
  deploymentDate: z.string(),
  clientName: z.string(),
  projectName: z.string(),
  location: z.string(),
  duration: z.string().optional(),
  notes: z.string().optional(),
});

export type DeploymentInput = z.infer<typeof DeploymentSchema>;