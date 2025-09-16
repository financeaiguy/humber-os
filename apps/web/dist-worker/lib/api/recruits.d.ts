export interface RecruitData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    currentLocation: string;
    jobTitle: string;
    yearsExperience: number;
    currentCompany?: string;
    desiredSalary?: string;
    skills: string[];
    education?: string;
    certifications: string[];
    availableStartDate: string;
    workAuthorization: string;
    willingToRelocate: boolean;
    travelWillingness: string;
    source: string;
    recruiterName?: string;
    recruiterAgency?: string;
    notes?: string;
}
export interface Recruit extends RecruitData {
    id: string;
    status: 'sourced' | 'screened' | 'interviewed' | 'offer_extended' | 'accepted' | 'rejected';
    createdAt: string;
    updatedAt: string;
}
export declare class ApiValidationError extends Error {
    details: Array<{
        field: string;
        message: string;
    }>;
    constructor(message: string, details: Array<{
        field: string;
        message: string;
    }>);
}
export declare class ApiError extends Error {
    status: number;
    constructor(message: string, status: number);
}
export declare const recruitsApi: {
    submitRecruit(recruitData: RecruitData): Promise<{
        message: string;
        status: string;
        recruitId: string;
    }>;
    getRecruits(params?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
    }): Promise<{
        recruits: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    moveToOnboarding(recruitId: string): Promise<{
        message: string;
        onboardingId: string;
    }>;
    updateRecruitStatus(recruitId: string, status: Recruit["status"]): Promise<{
        message: string;
        status: string;
        recruitId: string;
    }>;
};
export declare function getFieldErrors(error: ApiValidationError): Record<string, string>;
export declare function getErrorMessage(error: unknown): string;
//# sourceMappingURL=recruits.d.ts.map