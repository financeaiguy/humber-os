import { z } from 'zod';

// User Roles for targeted guidance
export const UserRoleSchema = z.enum([
  'ADMIN',           // System administrator
  'MANAGER',         // Operations manager
  'ENGINEER',        // Field engineer
  'RECRUITER',       // HR/Recruiting staff
  'ACCOUNTANT',      // Finance/Accounting
  'CLIENT',          // External client
  'VIEWER',          // Read-only access
  'NEW_USER'         // First-time user
]);

export type UserRole = z.infer<typeof UserRoleSchema>;

// Workflow Types for contextual guidance
export const WorkflowTypeSchema = z.enum([
  'ONBOARDING',      // New user setup
  'TIMESHEET',       // Time tracking workflow
  'RECRUITING',      // Hiring process
  'DEPLOYMENT',      // Engineer deployment
  'REPORTING',       // Report generation
  'COMPLIANCE',      // Audit and compliance
  'BILLING',         // Financial operations
  'DOCUMENT_UPLOAD', // Knowledge base management
  'CHAT_ASSISTANCE', // AI chat usage
  'DASHBOARD_TOUR'   // Dashboard navigation
]);

export type WorkflowType = z.infer<typeof WorkflowTypeSchema>;

// Tooltip Types
export const TooltipTypeSchema = z.enum([
  'HELP',           // General help information
  'WARNING',        // Important warnings
  'TIP',           // Helpful tips
  'FEATURE',       // Feature explanations
  'PROCESS',       // Process guidance
  'SHORTCUT',      // Keyboard shortcuts
  'INTEGRATION',   // System integration info
  'COMPLIANCE'     // Compliance requirements
]);

export type TooltipType = z.infer<typeof TooltipTypeSchema>;

// Tooltip Placement
export const TooltipPlacementSchema = z.enum([
  'TOP',
  'BOTTOM',
  'LEFT',
  'RIGHT',
  'TOP_LEFT',
  'TOP_RIGHT',
  'BOTTOM_LEFT',
  'BOTTOM_RIGHT',
  'AUTO'
]);

export type TooltipPlacement = z.infer<typeof TooltipPlacementSchema>;

// Tooltip Schema
export const TooltipSchema = z.object({
  id: z.string(),
  targetElement: z.string(), // CSS selector or element ID
  type: TooltipTypeSchema,
  placement: TooltipPlacementSchema,
  
  // Content
  title: z.string(),
  content: z.string(),
  htmlContent: z.string().optional(),
  
  // Targeting
  roles: z.array(UserRoleSchema).optional(),
  workflows: z.array(WorkflowTypeSchema).optional(),
  pages: z.array(z.string()).optional(), // Page paths
  
  // Behavior
  trigger: z.enum(['HOVER', 'CLICK', 'FOCUS', 'AUTO']).default('HOVER'),
  delay: z.number().default(500), // ms
  duration: z.number().optional(), // auto-hide after ms
  
  // Styling
  theme: z.enum(['DARK', 'LIGHT', 'AUTO']).default('DARK'),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']).default('MEDIUM'),
  
  // Interactive elements
  hasAction: z.boolean().default(false),
  actionText: z.string().optional(),
  actionUrl: z.string().optional(),
  
  // Conditions
  showOnce: z.boolean().default(false),
  priority: z.number().default(1), // Higher = more important
  isActive: z.boolean().default(true),
  
  // Metadata
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Tooltip = z.infer<typeof TooltipSchema>;

// Walkthrough Step Schema
export const WalkthroughStepSchema = z.object({
  id: z.string(),
  order: z.number(),
  
  // Target
  targetElement: z.string(),
  placement: TooltipPlacementSchema,
  
  // Content
  title: z.string(),
  content: z.string(),
  htmlContent: z.string().optional(),
  
  // Media
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  
  // Interaction
  action: z.enum(['CLICK', 'TYPE', 'SCROLL', 'WAIT', 'NAVIGATE']).optional(),
  actionTarget: z.string().optional(),
  actionValue: z.string().optional(),
  
  // Validation
  validationSelector: z.string().optional(),
  validationText: z.string().optional(),
  
  // Navigation
  nextStepId: z.string().optional(),
  previousStepId: z.string().optional(),
  canSkip: z.boolean().default(true),
  
  // Timing
  autoAdvance: z.boolean().default(false),
  autoAdvanceDelay: z.number().default(3000)
});

export type WalkthroughStep = z.infer<typeof WalkthroughStepSchema>;

// Walkthrough Schema
export const WalkthroughSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  
  // Targeting
  workflowType: WorkflowTypeSchema,
  targetRoles: z.array(UserRoleSchema),
  targetPages: z.array(z.string()).optional(),
  
  // Content
  steps: z.array(WalkthroughStepSchema),
  estimatedDuration: z.number(), // minutes
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  
  // Behavior
  isRequired: z.boolean().default(false),
  canRestart: z.boolean().default(true),
  saveProgress: z.boolean().default(true),
  
  // Metadata
  version: z.string().default('1.0'),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Walkthrough = z.infer<typeof WalkthroughSchema>;

// User Progress Schema
export const UserProgressSchema = z.object({
  userId: z.string(),
  walkthroughId: z.string(),
  
  // Progress
  currentStepId: z.string(),
  completedSteps: z.array(z.string()),
  isCompleted: z.boolean().default(false),
  
  // Timing
  startedAt: z.date(),
  lastActiveAt: z.date(),
  completedAt: z.date().optional(),
  
  // Metadata
  userRole: UserRoleSchema,
  tenantId: z.string()
});

export type UserProgress = z.infer<typeof UserProgressSchema>;

// Tooltip Configuration Schema
export const TooltipConfigSchema = z.object({
  userId: z.string(),
  tenantId: z.string(),
  
  // Global settings
  enabled: z.boolean().default(true),
  showAdvanced: z.boolean().default(false),
  animationsEnabled: z.boolean().default(true),
  
  // Display preferences
  defaultTheme: z.enum(['DARK', 'LIGHT', 'AUTO']).default('AUTO'),
  defaultSize: z.enum(['SMALL', 'MEDIUM', 'LARGE']).default('MEDIUM'),
  defaultDelay: z.number().default(500),
  
  // Behavior
  dismissOnClick: z.boolean().default(true),
  showOnlyOnce: z.boolean().default(false),
  autoStartWalkthroughs: z.boolean().default(true),
  
  // Completed items
  completedTooltips: z.array(z.string()).default([]),
  completedWalkthroughs: z.array(z.string()).default([]),
  
  // Metadata
  createdAt: z.date(),
  updatedAt: z.date()
});

export type TooltipConfig = z.infer<typeof TooltipConfigSchema>;

// Help Content Schema
export const HelpContentSchema = z.object({
  id: z.string(),
  category: z.string(),
  
  // Content
  title: z.string(),
  content: z.string(),
  htmlContent: z.string().optional(),
  
  // Media
  screenshots: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  
  // Targeting
  roles: z.array(UserRoleSchema).optional(),
  workflows: z.array(WorkflowTypeSchema).optional(),
  tags: z.array(z.string()).optional(),
  
  // Search
  keywords: z.array(z.string()),
  searchableContent: z.string(),
  
  // Metadata
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  estimatedReadTime: z.number(), // minutes
  lastUpdated: z.date(),
  version: z.string()
});

export type HelpContent = z.infer<typeof HelpContentSchema>;
