interface CustomerOnboardingProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (customerData: CustomerData) => void;
}
interface CustomerData {
    companyName: string;
    industry: string;
    companySize: string;
    website: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    contactTitle: string;
    billingAddress: string;
    billingContact: string;
    billingEmail: string;
    taxId: string;
    engineerTypes: string[];
    projectDuration: string;
    startDate: string;
    budget: string;
    location: string;
    communicationPreference: string;
    reportingFrequency: string;
    paymentTerms: string;
    specialRequirements: string;
}
export default function CustomerOnboardingFlow({ isOpen, onClose, onComplete }: CustomerOnboardingProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=CustomerOnboardingFlow.d.ts.map