import { UserRole, WorkflowType, Tooltip, Walkthrough } from '@humber/types';
export declare const ROLE_BASED_TOOLTIPS: Record<UserRole, Tooltip[]>;
export declare const WORKFLOW_WALKTHROUGHS: Record<WorkflowType, Walkthrough>;
export declare const SIMPLE_EXPLANATIONS: {
    'biometric-authentication': {
        title: string;
        simple: string;
        detailed: string;
        analogy: string;
    };
    'geolocation-verification': {
        title: string;
        simple: string;
        detailed: string;
        analogy: string;
    };
    'rag-knowledge-base': {
        title: string;
        simple: string;
        detailed: string;
        analogy: string;
    };
    'multi-tenant-architecture': {
        title: string;
        simple: string;
        detailed: string;
        analogy: string;
    };
    'time-reconciliation': {
        title: string;
        simple: string;
        detailed: string;
        analogy: string;
    };
};
export declare const CONTEXTUAL_HELP: {
    '/': {
        NEW_USER: string;
        ENGINEER: string;
        MANAGER: string;
        ACCOUNTANT: string;
    };
    '/bull-pen': {
        NEW_USER: string;
        MANAGER: string;
        RECRUITER: string;
    };
    '/knowledge': {
        NEW_USER: string;
        MANAGER: string;
        ADMIN: string;
    };
    '/projects': {
        NEW_USER: string;
        ENGINEER: string;
        MANAGER: string;
    };
};
export declare const FEATURE_COMPLEXITY: {
    BEGINNER: {
        features: string[];
        description: string;
        timeToLearn: string;
    };
    INTERMEDIATE: {
        features: string[];
        description: string;
        timeToLearn: string;
    };
    ADVANCED: {
        features: string[];
        description: string;
        timeToLearn: string;
    };
};
//# sourceMappingURL=tooltip-system.d.ts.map