'use client';
import { WORKFLOW_WALKTHROUGHS, ROLE_BASED_TOOLTIPS, CONTEXTUAL_HELP } from './tooltip-system';
export class WalkthroughManager {
    constructor(userId = 'demo-user', userRole = 'NEW_USER') {
        this.currentWalkthrough = null;
        this.currentStepIndex = 0;
        this.userRole = 'NEW_USER';
        this.userId = 'demo-user';
        this.userId = userId;
        this.userRole = userRole;
    }
    startWalkthrough(workflowType, callbacks) {
        const walkthrough = WORKFLOW_WALKTHROUGHS[workflowType];
        if (!walkthrough) {
            console.error(`Walkthrough not found for workflow: ${workflowType}`);
            return false;
        }
        if (!walkthrough.targetRoles.includes(this.userRole)) {
            console.warn(`Walkthrough ${workflowType} not available for role: ${this.userRole}`);
            return false;
        }
        this.currentWalkthrough = walkthrough;
        this.currentStepIndex = 0;
        this.onStepChange = callbacks?.onStepChange;
        this.onComplete = callbacks?.onComplete;
        this.loadProgress();
        this.executeCurrentStep();
        return true;
    }
    executeCurrentStep() {
        if (!this.currentWalkthrough || !this.getCurrentStep())
            return;
        const step = this.getCurrentStep();
        this.highlightElement(step.targetElement);
        this.onStepChange?.(step, this.currentStepIndex);
        if (step.autoAdvance) {
            setTimeout(() => {
                this.nextStep();
            }, step.autoAdvanceDelay || 3000);
        }
    }
    highlightElement(selector) {
        document.querySelectorAll('.walkthrough-highlight').forEach(el => {
            el.classList.remove('walkthrough-highlight');
        });
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add('walkthrough-highlight');
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
        }
    }
    nextStep() {
        if (!this.currentWalkthrough)
            return;
        if (this.currentStepIndex < this.currentWalkthrough.steps.length - 1) {
            this.currentStepIndex++;
            this.saveProgress();
            this.executeCurrentStep();
        }
        else {
            this.completeWalkthrough();
        }
    }
    previousStep() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.saveProgress();
            this.executeCurrentStep();
        }
    }
    skipWalkthrough() {
        this.cleanup();
        this.saveProgress(true);
    }
    completeWalkthrough() {
        if (!this.currentWalkthrough)
            return;
        this.cleanup();
        this.saveProgress(true);
        this.onComplete?.(this.currentWalkthrough.id);
        const completed = JSON.parse(localStorage.getItem('completedWalkthroughs') || '[]');
        if (!completed.includes(this.currentWalkthrough.id)) {
            completed.push(this.currentWalkthrough.id);
            localStorage.setItem('completedWalkthroughs', JSON.stringify(completed));
        }
    }
    getCurrentStep() {
        if (!this.currentWalkthrough)
            return null;
        return this.currentWalkthrough.steps[this.currentStepIndex] || null;
    }
    getCurrentStepIndex() {
        return this.currentStepIndex;
    }
    getTotalSteps() {
        return this.currentWalkthrough?.steps.length || 0;
    }
    isActive() {
        return this.currentWalkthrough !== null;
    }
    saveProgress(completed = false) {
        if (!this.currentWalkthrough)
            return;
        const progress = {
            userId: this.userId,
            walkthroughId: this.currentWalkthrough.id,
            currentStepIndex: this.currentStepIndex,
            isCompleted: completed,
            lastActiveAt: new Date().toISOString()
        };
        localStorage.setItem(`walkthrough_${this.currentWalkthrough.id}`, JSON.stringify(progress));
    }
    loadProgress() {
        if (!this.currentWalkthrough)
            return;
        const saved = localStorage.getItem(`walkthrough_${this.currentWalkthrough.id}`);
        if (saved) {
            const progress = JSON.parse(saved);
            this.currentStepIndex = progress.currentStepIndex || 0;
        }
    }
    cleanup() {
        document.querySelectorAll('.walkthrough-highlight').forEach(el => {
            el.classList.remove('walkthrough-highlight');
        });
        this.currentWalkthrough = null;
        this.currentStepIndex = 0;
    }
    getRecommendedWalkthroughs() {
        const completed = JSON.parse(localStorage.getItem('completedWalkthroughs') || '[]');
        const recommendations = [];
        if (this.userRole === 'NEW_USER' && !completed.includes('onboarding-tour')) {
            recommendations.push('ONBOARDING');
        }
        switch (this.userRole) {
            case 'ENGINEER':
                if (!completed.includes('timesheet-walkthrough'))
                    recommendations.push('TIMESHEET');
                if (!completed.includes('chat-assistance-tour'))
                    recommendations.push('CHAT_ASSISTANCE');
                break;
            case 'MANAGER':
                if (!completed.includes('dashboard-walkthrough'))
                    recommendations.push('DASHBOARD_TOUR');
                if (!completed.includes('recruiting-walkthrough'))
                    recommendations.push('RECRUITING');
                if (!completed.includes('reporting-walkthrough'))
                    recommendations.push('REPORTING');
                break;
            case 'RECRUITER':
                if (!completed.includes('recruiting-walkthrough'))
                    recommendations.push('RECRUITING');
                break;
            case 'ACCOUNTANT':
                if (!completed.includes('reporting-walkthrough'))
                    recommendations.push('REPORTING');
                if (!completed.includes('billing-walkthrough'))
                    recommendations.push('BILLING');
                break;
            case 'ADMIN':
                if (!completed.includes('compliance-walkthrough'))
                    recommendations.push('COMPLIANCE');
                break;
        }
        return recommendations;
    }
    getContextualHelp(pathname) {
        const pageHelp = CONTEXTUAL_HELP[pathname];
        if (pageHelp && pageHelp[this.userRole]) {
            return pageHelp[this.userRole];
        }
        return 'This page contains tools and information relevant to your role. Explore the different sections and use the help buttons for guidance.';
    }
    getRoleTooltips() {
        return ROLE_BASED_TOOLTIPS[this.userRole] || [];
    }
}
class GlobalWalkthroughState {
    constructor() {
        this.manager = null;
        this.isInitialized = false;
    }
    static getInstance() {
        if (!GlobalWalkthroughState.instance) {
            GlobalWalkthroughState.instance = new GlobalWalkthroughState();
        }
        return GlobalWalkthroughState.instance;
    }
    initialize(userId, userRole) {
        this.manager = new WalkthroughManager(userId, userRole);
        this.isInitialized = true;
        if (userRole === 'NEW_USER') {
            setTimeout(() => {
                this.startOnboarding();
            }, 2000);
        }
    }
    getManager() {
        return this.manager;
    }
    startOnboarding() {
        if (!this.manager)
            return;
        const completed = JSON.parse(localStorage.getItem('completedWalkthroughs') || '[]');
        if (!completed.includes('onboarding-tour')) {
            this.manager.startWalkthrough('ONBOARDING');
        }
    }
    isReady() {
        return this.isInitialized && this.manager !== null;
    }
}
export const globalWalkthrough = GlobalWalkthroughState.getInstance();
export function useWalkthrough() {
    const manager = globalWalkthrough.getManager();
    return {
        startWalkthrough: (workflowType) => manager?.startWalkthrough(workflowType),
        getRecommendations: () => manager?.getRecommendedWalkthroughs() || [],
        getContextualHelp: (pathname) => manager?.getContextualHelp(pathname) || '',
        getRoleTooltips: () => manager?.getRoleTooltips() || [],
        isReady: () => globalWalkthrough.isReady()
    };
}
//# sourceMappingURL=walkthrough-manager.js.map