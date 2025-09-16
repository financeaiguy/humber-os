export declare const WORKERS_AI_MODELS: {
    chat: {
        primary: string;
        fallback: string;
        settings: {
            temperature: number;
            max_tokens: number;
            top_p: number;
            frequency_penalty: number;
            presence_penalty: number;
        };
    };
    analysis: {
        primary: string;
        fallback: string;
        settings: {
            temperature: number;
            max_tokens: number;
            top_p: number;
            frequency_penalty: number;
            presence_penalty: number;
        };
    };
    code: {
        primary: string;
        fallback: string;
        settings: {
            temperature: number;
            max_tokens: number;
            top_p: number;
        };
    };
    embeddings: {
        primary: string;
        fallback: string;
        dimensions: number;
    };
    document: {
        primary: string;
        settings: {
            temperature: number;
            max_tokens: number;
        };
    };
    summarization: {
        primary: string;
        settings: {
            max_length: number;
            min_length: number;
        };
    };
    translation: {
        primary: string;
        settings: {
            max_length: number;
        };
    };
};
export interface WorkersAIRequest {
    model: string;
    messages?: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
    }>;
    prompt?: string;
    stream?: boolean;
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
}
export interface WorkersAIResponse {
    response?: string;
    messages?: Array<{
        role: string;
        content: string;
    }>;
    created: number;
    model: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
export declare class WorkersAIClient {
    private accountId;
    private apiToken;
    private baseUrl;
    constructor(accountId: string, apiToken: string);
    chat(messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
    }>, options?: Partial<typeof WORKERS_AI_MODELS.chat.settings>): Promise<WorkersAIResponse>;
    analyze(prompt: string, context?: string, options?: Partial<typeof WORKERS_AI_MODELS.analysis.settings>): Promise<WorkersAIResponse>;
    generateCode(prompt: string, language?: string, options?: Partial<typeof WORKERS_AI_MODELS.code.settings>): Promise<WorkersAIResponse>;
    generateEmbeddings(text: string | string[]): Promise<number[][]>;
    summarize(text: string, options?: Partial<typeof WORKERS_AI_MODELS.summarization.settings>): Promise<string>;
    private runModel;
}
export declare function getWorkersAIClient(): WorkersAIClient;
export declare function selectModelForTask(taskType: 'chat' | 'analysis' | 'code' | 'document' | 'summary'): string;
export declare const MODEL_CAPABILITIES: {
    'llama-4-scout': {
        maxTokens: number;
        contextWindow: number;
        strengths: string[];
        languages: string[];
    };
    'llama-3-70b': {
        maxTokens: number;
        contextWindow: number;
        strengths: string[];
        languages: string[];
    };
    'code-llama-34b': {
        maxTokens: number;
        contextWindow: number;
        strengths: string[];
        languages: string[];
    };
    'mixtral-8x7b': {
        maxTokens: number;
        contextWindow: number;
        strengths: string[];
        languages: string[];
    };
};
export default WorkersAIClient;
//# sourceMappingURL=workers-ai-config.d.ts.map