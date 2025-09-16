interface Engineer {
    id: string;
    name: string;
    category: string;
    hourlyRate: number;
    experience: number;
    skills: string[];
    rating: number;
    availability: string;
    visaStatus: string;
    location: string;
    avatar: string;
    workAuthorization: {
        type: string;
        expiryDate: string;
        canTravel: boolean;
        restrictions: string[];
    };
    currentAssignments: Array<{
        projectId: string;
        startDate: string;
        endDate: string;
        location: string;
    }>;
}
interface Project {
    id: string;
    name: string;
    client: string;
    location: string;
    budget: number;
    requiredSkills: string[];
    startDate: string;
    endDate: string;
    visaRequirements: string[];
    securityClearance?: string;
    travelRequired: boolean;
}
interface EnhancedEngineerAllocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableEngineers: Engineer[];
    activeProjects: Project[];
    onAssign: (assignment: any) => void;
}
export default function EnhancedEngineerAllocationModal({ isOpen, onClose, availableEngineers, activeProjects, onAssign }: EnhancedEngineerAllocationModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=EnhancedEngineerAllocationModal.d.ts.map