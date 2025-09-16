import { z } from 'zod';
const ApiSuccessResponse = z.object({
    success: z.literal(true),
    data: z.any()
});
const ApiErrorResponse = z.object({
    success: z.literal(false),
    error: z.string(),
    message: z.string().optional(),
    details: z.array(z.object({
        field: z.string(),
        message: z.string()
    })).optional()
});
const ApiResponse = z.union([ApiSuccessResponse, ApiErrorResponse]);
export class ApiValidationError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'ApiValidationError';
    }
}
export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}
async function apiRequest(url, options = {}, schema) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer dev-token-123',
                ...options.headers,
            },
            ...options,
        });
        const data = await response.json();
        const validatedResponse = ApiResponse.parse(data);
        if (!validatedResponse.success) {
            if (validatedResponse.details) {
                throw new ApiValidationError(validatedResponse.error, validatedResponse.details);
            }
            else {
                throw new ApiError(validatedResponse.message || validatedResponse.error, response.status);
            }
        }
        return schema.parse(validatedResponse.data);
    }
    catch (error) {
        if (error instanceof ApiValidationError || error instanceof ApiError) {
            throw error;
        }
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new ApiError('Network error. Please check your connection.', 0);
        }
        throw new ApiError('An unexpected error occurred.', 500);
    }
}
export const recruitsApi = {
    async submitRecruit(recruitData) {
        const schema = z.object({
            recruitId: z.string(),
            status: z.string(),
            message: z.string()
        });
        return apiRequest('/api/recruits', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer dev-token-123',
            },
            body: JSON.stringify(recruitData),
        }, schema);
    },
    async getRecruits(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.page)
            queryParams.append('page', params.page.toString());
        if (params.limit)
            queryParams.append('limit', params.limit.toString());
        if (params.status)
            queryParams.append('status', params.status);
        if (params.search)
            queryParams.append('search', params.search);
        const schema = z.object({
            recruits: z.array(z.any()),
            pagination: z.object({
                page: z.number(),
                limit: z.number(),
                total: z.number(),
                totalPages: z.number()
            })
        });
        return apiRequest(`/api/recruits?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer dev-token-123',
            }
        }, schema);
    },
    async moveToOnboarding(recruitId) {
        const schema = z.object({
            onboardingId: z.string(),
            message: z.string()
        });
        return apiRequest(`/api/recruits/${recruitId}/onboard`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer dev-token-123',
            },
        }, schema);
    },
    async updateRecruitStatus(recruitId, status) {
        const schema = z.object({
            recruitId: z.string(),
            status: z.string(),
            message: z.string()
        });
        return apiRequest(`/api/recruits/${recruitId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer dev-token-123',
            },
            body: JSON.stringify({ status }),
        }, schema);
    }
};
export function getFieldErrors(error) {
    const fieldErrors = {};
    error.details.forEach(detail => {
        fieldErrors[detail.field] = detail.message;
    });
    return fieldErrors;
}
export function getErrorMessage(error) {
    if (error instanceof ApiValidationError) {
        return error.message;
    }
    if (error instanceof ApiError) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
}
//# sourceMappingURL=recruits.js.map