import { z } from 'zod';
const ApiErrorSchema = z.object({
    success: z.literal(false),
    error: z.string(),
    details: z.array(z.object({
        field: z.string(),
        message: z.string()
    })).optional()
});
const RecruitmentDataSchema = z.object({
    success: z.literal(true),
    data: z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        phone: z.string(),
        currentLocation: z.string(),
        desiredSalary: z.number(),
        availableStartDate: z.string(),
        totalExperience: z.number(),
        recruitmentDate: z.string(),
        skills: z.array(z.string()),
        visaStatus: z.string().optional(),
        previousEmployment: z.array(z.object({
            company: z.string(),
            role: z.string(),
            duration: z.string()
        })).optional()
    })
});
const OnboardingSubmissionResponseSchema = z.object({
    success: z.literal(true),
    data: z.object({
        onboardingId: z.string(),
        status: z.string(),
        phase: z.number(),
        nextSteps: z.array(z.string()),
        estimatedProcessingTime: z.string()
    })
});
export class ApiValidationError extends Error {
    constructor(details) {
        super('Validation failed');
        this.details = details;
        this.name = 'ApiValidationError';
    }
}
export class ApiNetworkError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'ApiNetworkError';
    }
}
export class ApiServerError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'ApiServerError';
    }
}
const defaultRetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
};
async function withRetry(operation, config = defaultRetryConfig) {
    let lastError;
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (error instanceof ApiValidationError ||
                (error instanceof ApiServerError && error.status >= 400 && error.status < 500)) {
                throw error;
            }
            if (attempt === config.maxAttempts) {
                throw error;
            }
            const delay = Math.min(config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1), config.maxDelay);
            console.warn(`API attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}
async function apiRequest(url, options = {}, schema) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        const data = await response.json();
        if (!response.ok) {
            const errorResult = ApiErrorSchema.safeParse(data);
            if (errorResult.success) {
                if (errorResult.data.details) {
                    throw new ApiValidationError(errorResult.data.details);
                }
                throw new ApiServerError(errorResult.data.error, response.status);
            }
            throw new ApiNetworkError(`HTTP ${response.status}: ${response.statusText}`, response.status);
        }
        const result = schema.safeParse(data);
        if (!result.success) {
            console.error('Invalid API response schema:', result.error);
            throw new ApiServerError('Invalid response format from server', 500);
        }
        return result.data;
    }
    catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new ApiNetworkError('Network connection failed');
        }
        throw error;
    }
}
export const onboardingApi = {
    async fetchRecruitmentData(recruitId, tenantId) {
        return withRetry(async () => {
            const response = await apiRequest('/api/onboarding/recruitment-data', {
                method: 'POST',
                body: JSON.stringify({ recruitId, tenantId })
            }, RecruitmentDataSchema);
            return response.data;
        });
    },
    async submitOnboarding(data) {
        return withRetry(async () => {
            const response = await apiRequest('/api/onboarding/submit', {
                method: 'POST',
                body: JSON.stringify(data)
            }, OnboardingSubmissionResponseSchema);
            return response.data;
        }, {
            ...defaultRetryConfig,
            maxAttempts: 2
        });
    },
    async getOnboardingStatus(onboardingId) {
        return withRetry(async () => {
            const response = await apiRequest(`/api/onboarding/submit?onboardingId=${onboardingId}`, { method: 'GET' }, z.object({
                success: z.literal(true),
                data: z.object({
                    onboardingId: z.string(),
                    status: z.string(),
                    phase: z.number(),
                    completedSteps: z.array(z.string()),
                    pendingSteps: z.array(z.string()),
                    lastUpdated: z.string()
                })
            }));
            return response.data;
        });
    }
};
export function getErrorMessage(error) {
    if (error instanceof ApiValidationError) {
        return error.details.length > 0
            ? error.details.map(d => d.message).join(', ')
            : 'Please check your input and try again';
    }
    if (error instanceof ApiNetworkError) {
        return 'Network connection failed. Please check your internet connection and try again.';
    }
    if (error instanceof ApiServerError) {
        return error.message || 'Server error occurred. Please try again later.';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
}
export function getFieldErrors(error) {
    if (error instanceof ApiValidationError) {
        return error.details.reduce((acc, detail) => {
            acc[detail.field] = detail.message;
            return acc;
        }, {});
    }
    return {};
}
//# sourceMappingURL=onboarding.js.map