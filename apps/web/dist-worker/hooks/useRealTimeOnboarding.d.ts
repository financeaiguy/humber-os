interface OnboardingCandidate {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'vetting' | 'offer_letter' | 'legal' | 'immigration' | 'final_review' | 'completed';
    phase: number;
    progress: number;
    startDate: string;
    lastUpdate: string;
    assignedTo?: string;
    location?: string;
    documents?: {
        resume?: boolean;
        offer?: boolean;
        background?: boolean;
        i9?: boolean;
        visa?: boolean;
    };
    recruiter?: string;
    priority?: 'high' | 'medium' | 'normal';
    estimatedCompletion?: string;
    notes?: string;
}
interface UseRealTimeOnboardingOptions {
    refreshInterval?: number;
    enableNotifications?: boolean;
    statusFilter?: string;
    searchTerm?: string;
}
interface OnboardingUpdate {
    type: 'candidate_updated' | 'status_changed' | 'document_uploaded' | 'progress_updated';
    candidateId: string;
    data: Partial<OnboardingCandidate>;
    timestamp: string;
    message?: string;
}
export declare function useRealTimeOnboarding(options?: UseRealTimeOnboardingOptions): {
    candidates: never[];
    loading: boolean;
    error: null;
    lastUpdate: null;
    recentUpdates: never[];
    statusCounts: {};
    updateCandidate: () => Promise<void>;
    addCandidate: () => Promise<OnboardingCandidate>;
    refresh: () => void;
    isRealTime: boolean;
} | {
    candidates: OnboardingCandidate[];
    loading: boolean;
    error: string | null;
    lastUpdate: Date | null;
    recentUpdates: OnboardingUpdate[];
    statusCounts: Record<string, number>;
    updateCandidate: (candidateId: string, updates: Partial<OnboardingCandidate>) => Promise<void>;
    addCandidate: (candidateData: Partial<OnboardingCandidate>) => Promise<any>;
    refresh: () => Promise<void>;
    isRealTime: boolean;
};
export {};
//# sourceMappingURL=useRealTimeOnboarding.d.ts.map