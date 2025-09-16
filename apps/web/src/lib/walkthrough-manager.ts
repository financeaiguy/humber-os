'use client'

import { UserRole, WorkflowType, Walkthrough, WalkthroughStep, UserProgress } from '@humber/types'
import { WORKFLOW_WALKTHROUGHS, ROLE_BASED_TOOLTIPS, CONTEXTUAL_HELP } from './tooltip-system'

export class WalkthroughManager {
  private currentWalkthrough: Walkthrough | null = null
  private currentStepIndex: number = 0
  private userRole: UserRole = 'NEW_USER'
  private userId: string = 'demo-user'
  private onStepChange?: (step: WalkthroughStep, index: number) => void
  private onComplete?: (walkthroughId: string) => void

  constructor(userId: string = 'demo-user', userRole: UserRole = 'NEW_USER') {
    this.userId = userId
    this.userRole = userRole
  }

  // Start a specific walkthrough
  startWalkthrough(workflowType: WorkflowType, callbacks?: {
    onStepChange?: (step: WalkthroughStep, index: number) => void
    onComplete?: (walkthroughId: string) => void
  }) {
    const walkthrough = WORKFLOW_WALKTHROUGHS[workflowType]
    if (!walkthrough) {
      console.error(`Walkthrough not found for workflow: ${workflowType}`)
      return false
    }

    // Check if user role is eligible
    if (!walkthrough.targetRoles.includes(this.userRole)) {
      console.warn(`Walkthrough ${workflowType} not available for role: ${this.userRole}`)
      return false
    }

    this.currentWalkthrough = walkthrough
    this.currentStepIndex = 0
    this.onStepChange = callbacks?.onStepChange
    this.onComplete = callbacks?.onComplete

    // Load saved progress
    this.loadProgress()

    // Start first step
    this.executeCurrentStep()
    return true
  }

  // Execute current step
  private executeCurrentStep() {
    if (!this.currentWalkthrough || !this.getCurrentStep()) return

    const step = this.getCurrentStep()!
    
    // Highlight target element
    this.highlightElement(step.targetElement)
    
    // Trigger step change callback
    this.onStepChange?.(step, this.currentStepIndex)
    
    // Auto-advance if configured
    if (step.autoAdvance) {
      setTimeout(() => {
        this.nextStep()
      }, step.autoAdvanceDelay || 3000)
    }
  }

  // Highlight target element
  private highlightElement(selector: string) {
    // Remove previous highlights
    document.querySelectorAll('.walkthrough-highlight').forEach(el => {
      el.classList.remove('walkthrough-highlight')
    })

    // Add highlight to current element
    const element = document.querySelector(selector)
    if (element) {
      element.classList.add('walkthrough-highlight')
      
      // Scroll into view
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      })
    }
  }

  // Navigation methods
  nextStep() {
    if (!this.currentWalkthrough) return

    if (this.currentStepIndex < this.currentWalkthrough.steps.length - 1) {
      this.currentStepIndex++
      this.saveProgress()
      this.executeCurrentStep()
    } else {
      this.completeWalkthrough()
    }
  }

  previousStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--
      this.saveProgress()
      this.executeCurrentStep()
    }
  }

  skipWalkthrough() {
    this.cleanup()
    this.saveProgress(true) // Mark as skipped
  }

  completeWalkthrough() {
    if (!this.currentWalkthrough) return

    this.cleanup()
    this.saveProgress(true) // Mark as completed
    this.onComplete?.(this.currentWalkthrough.id)
    
    // Mark as completed in localStorage
    const completed = JSON.parse(localStorage.getItem('completedWalkthroughs') || '[]')
    if (!completed.includes(this.currentWalkthrough.id)) {
      completed.push(this.currentWalkthrough.id)
      localStorage.setItem('completedWalkthroughs', JSON.stringify(completed))
    }
  }

  // Utility methods
  getCurrentStep(): WalkthroughStep | null {
    if (!this.currentWalkthrough) return null
    return this.currentWalkthrough.steps[this.currentStepIndex] || null
  }

  getCurrentStepIndex(): number {
    return this.currentStepIndex
  }

  getTotalSteps(): number {
    return this.currentWalkthrough?.steps.length || 0
  }

  isActive(): boolean {
    return this.currentWalkthrough !== null
  }

  // Save/load progress
  private saveProgress(completed: boolean = false) {
    if (!this.currentWalkthrough) return

    const progress = {
      userId: this.userId,
      walkthroughId: this.currentWalkthrough.id,
      currentStepIndex: this.currentStepIndex,
      isCompleted: completed,
      lastActiveAt: new Date().toISOString()
    }

    localStorage.setItem(`walkthrough_${this.currentWalkthrough.id}`, JSON.stringify(progress))
  }

  private loadProgress() {
    if (!this.currentWalkthrough) return

    const saved = localStorage.getItem(`walkthrough_${this.currentWalkthrough.id}`)
    if (saved) {
      const progress = JSON.parse(saved)
      this.currentStepIndex = progress.currentStepIndex || 0
    }
  }

  // Cleanup
  private cleanup() {
    // Remove highlights
    document.querySelectorAll('.walkthrough-highlight').forEach(el => {
      el.classList.remove('walkthrough-highlight')
    })
    
    this.currentWalkthrough = null
    this.currentStepIndex = 0
  }

  // Get recommended walkthroughs for user
  getRecommendedWalkthroughs(): WorkflowType[] {
    const completed = JSON.parse(localStorage.getItem('completedWalkthroughs') || '[]')
    
    const recommendations: WorkflowType[] = []
    
    // Always recommend onboarding for new users
    if (this.userRole === 'NEW_USER' && !completed.includes('onboarding-tour')) {
      recommendations.push('ONBOARDING')
    }
    
    // Role-specific recommendations
    switch (this.userRole) {
      case 'ENGINEER':
        if (!completed.includes('timesheet-walkthrough')) recommendations.push('TIMESHEET')
        if (!completed.includes('chat-assistance-tour')) recommendations.push('CHAT_ASSISTANCE')
        break
        
      case 'MANAGER':
        if (!completed.includes('dashboard-walkthrough')) recommendations.push('DASHBOARD_TOUR')
        if (!completed.includes('recruiting-walkthrough')) recommendations.push('RECRUITING')
        if (!completed.includes('reporting-walkthrough')) recommendations.push('REPORTING')
        break
        
      case 'RECRUITER':
        if (!completed.includes('recruiting-walkthrough')) recommendations.push('RECRUITING')
        break
        
      case 'ACCOUNTANT':
        if (!completed.includes('reporting-walkthrough')) recommendations.push('REPORTING')
        if (!completed.includes('billing-walkthrough')) recommendations.push('BILLING')
        break
        
      case 'ADMIN':
        if (!completed.includes('compliance-walkthrough')) recommendations.push('COMPLIANCE')
        break
    }
    
    return recommendations
  }

  // Get contextual help for current page
  getContextualHelp(pathname: string): string {
    const pageHelp = CONTEXTUAL_HELP[pathname as keyof typeof CONTEXTUAL_HELP]
    if (pageHelp && pageHelp[this.userRole]) {
      return pageHelp[this.userRole]
    }
    
    // Default help
    return 'This page contains tools and information relevant to your role. Explore the different sections and use the help buttons for guidance.'
  }

  // Get tooltips for current user role
  getRoleTooltips(): any[] {
    return ROLE_BASED_TOOLTIPS[this.userRole] || []
  }
}

// Global walkthrough state management
class GlobalWalkthroughState {
  private static instance: GlobalWalkthroughState
  private manager: WalkthroughManager | null = null
  private isInitialized: boolean = false

  static getInstance(): GlobalWalkthroughState {
    if (!GlobalWalkthroughState.instance) {
      GlobalWalkthroughState.instance = new GlobalWalkthroughState()
    }
    return GlobalWalkthroughState.instance
  }

  initialize(userId: string, userRole: UserRole) {
    this.manager = new WalkthroughManager(userId, userRole)
    this.isInitialized = true
    
    // Auto-start onboarding for new users
    if (userRole === 'NEW_USER') {
      setTimeout(() => {
        this.startOnboarding()
      }, 2000)
    }
  }

  getManager(): WalkthroughManager | null {
    return this.manager
  }

  startOnboarding() {
    if (!this.manager) return
    
    const completed = JSON.parse(localStorage.getItem('completedWalkthroughs') || '[]')
    if (!completed.includes('onboarding-tour')) {
      this.manager.startWalkthrough('ONBOARDING')
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.manager !== null
  }
}

export const globalWalkthrough = GlobalWalkthroughState.getInstance()

// Hook for using walkthrough in components
export function useWalkthrough() {
  const manager = globalWalkthrough.getManager()
  
  return {
    startWalkthrough: (workflowType: WorkflowType) => manager?.startWalkthrough(workflowType),
    getRecommendations: () => manager?.getRecommendedWalkthroughs() || [],
    getContextualHelp: (pathname: string) => manager?.getContextualHelp(pathname) || '',
    getRoleTooltips: () => manager?.getRoleTooltips() || [],
    isReady: () => globalWalkthrough.isReady()
  }
}
