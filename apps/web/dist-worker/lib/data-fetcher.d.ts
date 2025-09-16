export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';
export interface FetchResult<T> {
    data: T | null;
    error: Error | null;
    status: FetchStatus;
    retry: () => Promise<void>;
}
interface FetchOptions extends RequestInit {
    retries?: number;
    retryDelay?: number;
    timeout?: number;
    onRetry?: (attempt: number, error: Error) => void;
}
export declare function fetchWithRetry(url: string, options?: FetchOptions): Promise<Response>;
export declare const cachedFetch: (url: string, options?: FetchOptions) => Promise<Response>;
export declare function createDataFetcher<T>(fetcher: () => Promise<T>, options?: {
    revalidate?: number;
    fallback?: T;
}): {
    read(): T & ({} | null);
    refresh: () => Promise<void>;
    preload(): void;
};
export declare class ApiClient {
    private baseUrl;
    private defaultOptions;
    constructor(baseUrl?: string, defaultOptions?: FetchOptions);
    private request;
    get<T>(endpoint: string, options?: FetchOptions): Promise<T>;
    post<T>(endpoint: string, body?: any, options?: FetchOptions): Promise<T>;
    put<T>(endpoint: string, body?: any, options?: FetchOptions): Promise<T>;
    delete<T>(endpoint: string, options?: FetchOptions): Promise<T>;
    patch<T>(endpoint: string, body?: any, options?: FetchOptions): Promise<T>;
}
export declare const apiClient: ApiClient;
export {};
//# sourceMappingURL=data-fetcher.d.ts.map