import { z } from 'zod';
declare const RecruitmentDataSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
        phone: z.ZodString;
        currentLocation: z.ZodString;
        desiredSalary: z.ZodNumber;
        availableStartDate: z.ZodString;
        totalExperience: z.ZodNumber;
        recruitmentDate: z.ZodString;
        skills: z.ZodArray<z.ZodString, "many">;
        visaStatus: z.ZodOptional<z.ZodString>;
        previousEmployment: z.ZodOptional<z.ZodArray<z.ZodObject<{
            company: z.ZodString;
            role: z.ZodString;
            duration: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            duration: string;
            company: string;
            role: string;
        }, {
            duration: string;
            company: string;
            role: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        skills: string[];
        currentLocation: string;
        desiredSalary: number;
        availableStartDate: string;
        totalExperience: number;
        recruitmentDate: string;
        visaStatus?: string | undefined;
        previousEmployment?: {
            duration: string;
            company: string;
            role: string;
        }[] | undefined;
    }, {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        skills: string[];
        currentLocation: string;
        desiredSalary: number;
        availableStartDate: string;
        totalExperience: number;
        recruitmentDate: string;
        visaStatus?: string | undefined;
        previousEmployment?: {
            duration: string;
            company: string;
            role: string;
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    data: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        skills: string[];
        currentLocation: string;
        desiredSalary: number;
        availableStartDate: string;
        totalExperience: number;
        recruitmentDate: string;
        visaStatus?: string | undefined;
        previousEmployment?: {
            duration: string;
            company: string;
            role: string;
        }[] | undefined;
    };
    success: true;
}, {
    data: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        skills: string[];
        currentLocation: string;
        desiredSalary: number;
        availableStartDate: string;
        totalExperience: number;
        recruitmentDate: string;
        visaStatus?: string | undefined;
        previousEmployment?: {
            duration: string;
            company: string;
            role: string;
        }[] | undefined;
    };
    success: true;
}>;
declare const OnboardingSubmissionResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        onboardingId: z.ZodString;
        status: z.ZodString;
        phase: z.ZodNumber;
        nextSteps: z.ZodArray<z.ZodString, "many">;
        estimatedProcessingTime: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: string;
        onboardingId: string;
        phase: number;
        nextSteps: string[];
        estimatedProcessingTime: string;
    }, {
        status: string;
        onboardingId: string;
        phase: number;
        nextSteps: string[];
        estimatedProcessingTime: string;
    }>;
}, "strip", z.ZodTypeAny, {
    data: {
        status: string;
        onboardingId: string;
        phase: number;
        nextSteps: string[];
        estimatedProcessingTime: string;
    };
    success: true;
}, {
    data: {
        status: string;
        onboardingId: string;
        phase: number;
        nextSteps: string[];
        estimatedProcessingTime: string;
    };
    success: true;
}>;
type RecruitmentData = z.infer<typeof RecruitmentDataSchema>;
type OnboardingSubmissionResponse = z.infer<typeof OnboardingSubmissionResponseSchema>;
export declare class ApiValidationError extends Error {
    details: Array<{
        field: string;
        message: string;
    }>;
    constructor(details: Array<{
        field: string;
        message: string;
    }>);
}
export declare class ApiNetworkError extends Error {
    status?: number | undefined;
    constructor(message: string, status?: number | undefined);
}
export declare class ApiServerError extends Error {
    status: number;
    constructor(message: string, status: number);
}
export declare const onboardingApi: {
    fetchRecruitmentData(recruitId: string, tenantId?: string): Promise<RecruitmentData["data"]>;
    submitOnboarding(data: any): Promise<OnboardingSubmissionResponse["data"]>;
    getOnboardingStatus(onboardingId: string): Promise<any>;
};
export declare function getErrorMessage(error: unknown): string;
export declare function getFieldErrors(error: unknown): Record<string, string>;
export {};
//# sourceMappingURL=onboarding.d.ts.map