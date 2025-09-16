interface Engineer {
    id: string;
    name: string;
    role: string;
    category: string;
    avatar: string;
    location: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    hourlyRate: number;
    experience: number;
    skills: string[];
    rating: number;
    availability: string;
    visaStatus: string;
    lastProject: string;
    preferredProjects: string[];
    certifications: string[];
    languages: string[];
    travelPreferences?: {
        maxTravelDistance: number;
        willingToRelocate: boolean;
        hasValidPassport: boolean;
        preferredProjects: string[];
        maxTravelDuration: number;
    };
    workAuthorization?: {
        countries: string[];
        restrictions: string[];
        expirationDate: string;
    };
}
interface EngineerProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    engineer: Engineer | null;
    onAssignToProject?: (engineer: Engineer) => void;
    onMessage?: (engineer: Engineer) => void;
    onVideoCall?: (engineer: Engineer) => void;
}
export default function EngineerProfileModal({ isOpen, onClose, engineer, onAssignToProject, onMessage, onVideoCall }: EngineerProfileModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=EngineerProfileModal.d.ts.map