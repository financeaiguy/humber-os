import React from 'react';
import { UserRole, TooltipType, TooltipPlacement } from '@humber/types';
interface SmartTooltipProps {
    id: string;
    title: string;
    content: string;
    type?: TooltipType;
    placement?: TooltipPlacement;
    userRole?: UserRole;
    trigger?: 'hover' | 'click' | 'focus' | 'auto';
    delay?: number;
    hasAction?: boolean;
    actionText?: string;
    onAction?: () => void;
    children: React.ReactNode;
    className?: string;
}
export declare function SmartTooltip({ id, title, content, type, placement, userRole, trigger, delay, hasAction, actionText, onAction, children, className }: SmartTooltipProps): import("react/jsx-runtime").JSX.Element;
interface WalkthroughOverlayProps {
    isActive: boolean;
    currentStep: any;
    onNext: () => void;
    onPrevious: () => void;
    onSkip: () => void;
    onComplete: () => void;
    totalSteps: number;
    currentStepIndex: number;
}
export declare function WalkthroughOverlay({ isActive, currentStep, onNext, onPrevious, onSkip, onComplete, totalSteps, currentStepIndex }: WalkthroughOverlayProps): import("react/jsx-runtime").JSX.Element | null;
interface HelpButtonProps {
    content: string;
    title?: string;
    placement?: TooltipPlacement;
    className?: string;
}
export declare function HelpButton({ content, title, placement, className }: HelpButtonProps): import("react/jsx-runtime").JSX.Element;
interface FeatureIntroProps {
    title: string;
    description: string;
    benefits: string[];
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    estimatedTime: string;
    onStartTour: () => void;
    onDismiss: () => void;
}
export declare function FeatureIntro({ title, description, benefits, difficulty, estimatedTime, onStartTour, onDismiss }: FeatureIntroProps): import("react/jsx-runtime").JSX.Element;
interface ProgressIndicatorProps {
    currentStep: number;
    totalSteps: number;
    stepNames: string[];
    onStepClick?: (step: number) => void;
}
export declare function ProgressIndicator({ currentStep, totalSteps, stepNames, onStepClick }: ProgressIndicatorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=smart-tooltip.d.ts.map