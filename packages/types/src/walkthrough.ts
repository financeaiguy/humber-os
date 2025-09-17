// Walkthrough and Tutorial System Types

export type WorkflowType = 
  | 'NEW_USER_ONBOARDING'
  | 'ENGINEER_ONBOARDING'
  | 'MANAGER_TRAINING'
  | 'RECRUITER_TRAINING'
  | 'ACCOUNTANT_TRAINING'
  | 'ADMIN_TRAINING'

export type WalkthroughStepType = 
  | 'intro'
  | 'action'
  | 'highlight'
  | 'modal'
  | 'form'
  | 'completion'

export interface WalkthroughStep {
  id: string
  type: WalkthroughStepType
  title: string
  content: string
  target?: string // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right'
  actionText?: string
  nextText?: string
  prevText?: string
  skipText?: string
  allowSkip?: boolean
  required?: boolean
  validationFn?: () => boolean | Promise<boolean>
  onComplete?: () => void | Promise<void>
}

export interface Walkthrough {
  id: string
  workflowType: WorkflowType
  title: string
  description: string
  version: string
  steps: WalkthroughStep[]
  estimatedDuration: number // in minutes
  requiredRole?: string[]
  prerequisites?: string[]
  completionBadge?: string
}

export interface UserProgress {
  userId: string
  walkthroughId: string
  currentStepIndex: number
  completedSteps: string[]
  startedAt: string
  lastAccessedAt: string
  completedAt?: string
  skippedSteps: string[]
  timeSpent: number // in seconds
  score?: number
  feedback?: string
}

export interface WalkthroughSession {
  id: string
  userId: string
  walkthroughId: string
  progress: UserProgress
  isActive: boolean
  pausedAt?: string
  resumedAt?: string
  metadata?: Record<string, any>
}

// Event types for walkthrough system
export type WalkthroughEvent = 
  | { type: 'step_started'; stepId: string; timestamp: string }
  | { type: 'step_completed'; stepId: string; timestamp: string; duration: number }
  | { type: 'step_skipped'; stepId: string; timestamp: string; reason?: string }
  | { type: 'walkthrough_paused'; timestamp: string }
  | { type: 'walkthrough_resumed'; timestamp: string }
  | { type: 'walkthrough_completed'; timestamp: string; totalDuration: number }
  | { type: 'walkthrough_abandoned'; timestamp: string; lastStepId: string }

export interface WalkthroughEventLog {
  id: string
  userId: string
  walkthroughId: string
  event: WalkthroughEvent
  sessionId: string
  userAgent?: string
  metadata?: Record<string, any>
}