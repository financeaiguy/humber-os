import { cache } from 'react';
class FetchError extends Error {
    constructor(message, status, statusText) {
        super(message);
        this.status = status;
        this.statusText = statusText;
        this.name = 'FetchError';
    }
}
async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export async function fetchWithRetry(url, options = {}) {
    const { retries = 3, retryDelay = 1000, timeout = 30000, onRetry, ...fetchOptions } = options;
    let lastError = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new FetchError(`HTTP error! status: ${response.status}`, response.status, response.statusText);
            }
            return response;
        }
        catch (error) {
            lastError = error;
            if (error instanceof Error && error.name === 'AbortError') {
                lastError = new FetchError('Request timeout', 408, 'Request Timeout');
            }
            if (attempt < retries) {
                const delay = retryDelay * Math.pow(2, attempt);
                onRetry?.(attempt + 1, lastError);
                await wait(delay);
            }
        }
    }
    throw lastError || new FetchError('Failed to fetch after retries');
}
export const cachedFetch = cache(async (url, options) => {
    return fetchWithRetry(url, options);
});
export function createDataFetcher(fetcher, options) {
    let data = options?.fallback;
    let error = null;
    let promise = null;
    const refresh = async () => {
        try {
            data = await fetcher();
            error = null;
        }
        catch (e) {
            error = e;
            throw e;
        }
    };
    promise = refresh();
    return {
        read() {
            if (error)
                throw error;
            if (data !== undefined)
                return data;
            throw promise;
        },
        refresh,
        preload() {
            refresh();
        }
    };
}
export class ApiClient {
    constructor(baseUrl = '', defaultOptions = {}) {
        this.baseUrl = baseUrl;
        this.defaultOptions = defaultOptions;
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetchWithRetry(url, {
            ...this.defaultOptions,
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...this.defaultOptions.headers,
                ...options.headers
            }
        });
        const data = await response.json();
        return data;
    }
    async get(endpoint, options) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }
    async post(endpoint, body, options) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body)
        });
    }
    async put(endpoint, body, options) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }
    async delete(endpoint, options) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
    async patch(endpoint, body, options) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    }
}
export const apiClient = new ApiClient('/api', {
    retries: 3,
    retryDelay: 1000,
    timeout: 30000
});
//# sourceMappingURL=data-fetcher.js.map