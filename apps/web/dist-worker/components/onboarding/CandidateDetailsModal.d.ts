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
interface CandidateDetailsModalProps {
    candidate: OnboardingCandidate | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (candidateId: string, updates: Partial<OnboardingCandidate>) => Promise<void>;
}
export declare function CandidateDetailsModal({ candidate, isOpen, onClose, onUpdate }: CandidateDetailsModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=CandidateDetailsModal.d.ts.map