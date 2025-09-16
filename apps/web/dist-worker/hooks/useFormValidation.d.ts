type ValidationErrors = Record<string, string>;
interface UseFormValidationReturn {
    errors: ValidationErrors;
    isValid: boolean;
    validateField: (field: string, value: any, data?: any) => string | null;
    validateForm: (data: any) => boolean;
    clearErrors: () => void;
    clearFieldError: (field: string) => void;
    setFieldError: (field: string, error: string) => void;
}
export declare function useFormValidation(): UseFormValidationReturn;
export declare function getFieldDisplayName(field: string): string;
export declare function formatLegalIdentifier(type: string, value: string): string;
export {};
//# sourceMappingURL=useFormValidation.d.ts.map