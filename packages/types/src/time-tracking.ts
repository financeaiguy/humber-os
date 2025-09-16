import { z } from 'zod';

// Biometric Authentication Types
export const BiometricType = z.enum([
  'FINGERPRINT',
  'FACE_ID',
  'VOICE',
  'IRIS',
  'PALM',
  'WEBAUTHN'
]);

export type BiometricType = z.infer<typeof BiometricType>;

// Device Trust Levels
export const DeviceTrustLevel = z.enum([
  'TRUSTED',      // Registered company device
  'VERIFIED',     // Known device, biometric verified
  'UNVERIFIED',   // Unknown device
  'BLOCKED'       // Explicitly blocked device
]);

export type DeviceTrustLevel = z.infer<typeof DeviceTrustLevel>;

// Geolocation Verification
export const GeolocationVerificationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number(),
  altitude: z.number().optional(),
  altitudeAccuracy: z.number().optional(),
  heading: z.number().optional(),
  speed: z.number().optional(),
  timestamp: z.number(),
  
  // Verification status
  isWithinWorkLocation: z.boolean(),
  distanceFromWorkSite: z.number(), // meters
  workSiteId: z.string().optional(),
  workSiteName: z.string().optional(),
  
  // Privacy and compliance
  consentGiven: z.boolean(),
  accuracyLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  source: z.enum(['GPS', 'NETWORK', 'PASSIVE'])
});

export type GeolocationVerification = z.infer<typeof GeolocationVerificationSchema>;

// Device Information
export const DeviceInfoSchema = z.object({
  deviceId: z.string(),
  deviceName: z.string().optional(),
  deviceType: z.enum(['MOBILE', 'TABLET', 'DESKTOP', 'WEARABLE']),
  
  // Hardware fingerprinting
  userAgent: z.string(),
  screenResolution: z.string(),
  timezone: z.string(),
  language: z.string(),
  platform: z.string(),
  
  // Browser/app info
  browserName: z.string().optional(),
  browserVersion: z.string().optional(),
  appVersion: z.string().optional(),
  
  // Security features
  hasSecureElement: z.boolean().default(false),
  supportsBiometrics: z.boolean().default(false),
  supportsWebAuthn: z.boolean().default(false),
  
  // Trust status
  trustLevel: DeviceTrustLevel,
  lastVerified: z.number(),
  registeredAt: z.number(),
  
  // Network info
  ipAddress: z.string().optional(),
  networkType: z.enum(['WIFI', 'CELLULAR', 'ETHERNET', 'UNKNOWN']).optional()
});

export type DeviceInfo = z.infer<typeof DeviceInfoSchema>;

// Biometric Authentication
export const BiometricAuthSchema = z.object({
  type: BiometricType,
  
  // WebAuthn data
  credentialId: z.string().optional(),
  publicKey: z.string().optional(),
  signature: z.string().optional(),
  challenge: z.string().optional(),
  
  // Biometric quality scores
  qualityScore: z.number().min(0).max(100).optional(),
  confidenceLevel: z.number().min(0).max(100).optional(),
  
  // Verification result
  verified: z.boolean(),
  verificationTime: z.number(),
  failureReason: z.string().optional(),
  
  // Liveness detection (anti-spoofing)
  livenessDetected: z.boolean().default(false),
  livenessScore: z.number().min(0).max(100).optional(),
  
  // Template data (encrypted)
  templateHash: z.string().optional(),
  templateVersion: z.string().optional()
});

export type BiometricAuth = z.infer<typeof BiometricAuthSchema>;

// Time Entry with Enhanced Security
export const SecureTimeEntrySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  engineerId: z.string(),
  
  // Basic time data
  clockInTime: z.number(),
  clockOutTime: z.number().optional(),
  totalHours: z.number().optional(),
  breakTime: z.number().default(0),
  overtimeHours: z.number().default(0),
  
  // Project and location
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  workSiteId: z.string().optional(),
  workSiteName: z.string().optional(),
  
  // Security verification
  biometricAuth: BiometricAuthSchema,
  geolocation: GeolocationVerificationSchema,
  deviceInfo: DeviceInfoSchema,
  
  // Trust score (0-100)
  trustScore: z.number().min(0).max(100),
  verificationLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'MAXIMUM']),
  
  // Fraud detection
  anomalyFlags: z.array(z.string()).default([]),
  riskScore: z.number().min(0).max(100).default(0),
  
  // Status and approval
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW']),
  approvedBy: z.string().optional(),
  approvedAt: z.number().optional(),
  rejectionReason: z.string().optional(),
  
  // Audit trail
  ipAddress: z.string(),
  userAgent: z.string(),
  sessionId: z.string(),
  
  // Timestamps
  createdAt: z.number(),
  updatedAt: z.number()
});

export type SecureTimeEntry = z.infer<typeof SecureTimeEntrySchema>;

// Work Site Configuration
export const WorkSiteSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  
  // Location boundaries
  centerLatitude: z.number(),
  centerLongitude: z.number(),
  radiusMeters: z.number(),
  
  // Geofencing
  allowedArea: z.object({
    type: z.enum(['CIRCLE', 'POLYGON']),
    coordinates: z.array(z.object({
      latitude: z.number(),
      longitude: z.number()
    }))
  }),
  
  // Security requirements
  requiresBiometric: z.boolean().default(true),
  requiredTrustLevel: DeviceTrustLevel,
  allowedDeviceTypes: z.array(z.enum(['MOBILE', 'TABLET', 'DESKTOP', 'WEARABLE'])),
  
  // Time tracking rules
  allowFlexibleHours: z.boolean().default(false),
  maxDailyHours: z.number().default(12),
  requireBreakTracking: z.boolean().default(true),
  
  // Compliance
  timezone: z.string(),
  laborLaws: z.array(z.string()).default([]),
  
  // Metadata
  address: z.string().optional(),
  contactInfo: z.string().optional(),
  isActive: z.boolean().default(true),
  
  // Timestamps
  createdAt: z.number(),
  updatedAt: z.number()
});

export type WorkSite = z.infer<typeof WorkSiteSchema>;

// Biometric Enrollment
export const BiometricEnrollmentSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  engineerId: z.string(),
  
  // Biometric data
  biometricType: BiometricType,
  templateHash: z.string(),
  templateVersion: z.string(),
  qualityScore: z.number().min(0).max(100),
  
  // WebAuthn credentials
  credentialId: z.string().optional(),
  publicKey: z.string().optional(),
  
  // Device binding
  deviceId: z.string(),
  deviceInfo: DeviceInfoSchema,
  
  // Enrollment metadata
  enrolledBy: z.string(),
  enrollmentLocation: GeolocationVerificationSchema.optional(),
  
  // Status
  isActive: z.boolean().default(true),
  expiresAt: z.number().optional(),
  lastUsed: z.number().optional(),
  usageCount: z.number().default(0),
  
  // Timestamps
  createdAt: z.number(),
  updatedAt: z.number()
});

export type BiometricEnrollment = z.infer<typeof BiometricEnrollmentSchema>;

// Time Tracking Session
export const TimeTrackingSessionSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  engineerId: z.string(),
  
  // Session data
  startTime: z.number(),
  endTime: z.number().optional(),
  isActive: z.boolean().default(true),
  
  // Security verification
  initialBiometric: BiometricAuthSchema,
  initialGeolocation: GeolocationVerificationSchema,
  initialDevice: DeviceInfoSchema,
  
  // Periodic verification (every 30 minutes)
  periodicVerifications: z.array(z.object({
    timestamp: z.number(),
    biometric: BiometricAuthSchema.optional(),
    geolocation: GeolocationVerificationSchema,
    deviceCheck: z.boolean(),
    trustScore: z.number()
  })).default([]),
  
  // Final verification (clock out)
  finalBiometric: BiometricAuthSchema.optional(),
  finalGeolocation: GeolocationVerificationSchema.optional(),
  
  // Session integrity
  overallTrustScore: z.number().min(0).max(100),
  anomaliesDetected: z.array(z.string()).default([]),
  
  // Work tracking
  projectId: z.string().optional(),
  workSiteId: z.string().optional(),
  breaks: z.array(z.object({
    startTime: z.number(),
    endTime: z.number().optional(),
    type: z.enum(['LUNCH', 'SHORT', 'EMERGENCY', 'PERSONAL'])
  })).default([]),
  
  // Timestamps
  createdAt: z.number(),
  updatedAt: z.number()
});

export type TimeTrackingSession = z.infer<typeof TimeTrackingSessionSchema>;

// Clock In/Out Request
export const ClockActionSchema = z.object({
  action: z.enum(['CLOCK_IN', 'CLOCK_OUT', 'START_BREAK', 'END_BREAK']),
  tenantId: z.string(),
  engineerId: z.string(),
  
  // Security verification
  biometric: BiometricAuthSchema,
  geolocation: GeolocationVerificationSchema,
  deviceInfo: DeviceInfoSchema,
  
  // Context
  projectId: z.string().optional(),
  workSiteId: z.string().optional(),
  notes: z.string().optional(),
  
  // Client-side verification
  clientTimestamp: z.number(),
  clientTimezone: z.string(),
  
  // Session management
  sessionId: z.string().optional(),
  
  // Emergency override (requires manager approval)
  isEmergencyOverride: z.boolean().default(false),
  overrideReason: z.string().optional(),
  managerApproval: z.string().optional()
});

export type ClockActionInput = z.infer<typeof ClockActionSchema>;
