import { UserRole, WorkflowType, WalkthroughStep } from '@humber/types';
export declare class WalkthroughManager {
    private currentWalkthrough;
    private currentStepIndex;
    private userRole;
    private userId;
    private onStepChange?;
    private onComplete?;
    constructor(userId?: string, userRole?: UserRole);
    startWalkthrough(workflowType: WorkflowType, callbacks?: {
        onStepChange?: (step: WalkthroughStep, index: number) => void;
        onComplete?: (walkthroughId: string) => void;
    }): boolean;
    private executeCurrentStep;
    private highlightElement;
    nextStep(): void;
    previousStep(): void;
    skipWalkthrough(): void;
    completeWalkthrough(): void;
    getCurrentStep(): WalkthroughStep | null;
    getCurrentStepIndex(): number;
    getTotalSteps(): number;
    isActive(): boolean;
    private saveProgress;
    private loadProgress;
    private cleanup;
    getRecommendedWalkthroughs(): WorkflowType[];
    getContextualHelp(pathname: string): string;
    getRoleTooltips(): any[];
}
declare class GlobalWalkthroughState {
    private static instance;
    private manager;
    private isInitialized;
    static getInstance(): GlobalWalkthroughState;
    initialize(userId: string, userRole: UserRole): void;
    getManager(): WalkthroughManager | null;
    startOnboarding(): void;
    isReady(): boolean;
}
export declare const globalWalkthrough: GlobalWalkthroughState;
export declare function useWalkthrough(): {
    startWalkthrough: (workflowType: WorkflowType) => boolean | undefined;
    getRecommendations: () => WorkflowType[];
    getContextualHelp: (pathname: string) => string;
    getRoleTooltips: () => any[];
    isReady: () => boolean;
};
export {};
//# sourceMappingURL=walkthrough-manager.d.ts.map