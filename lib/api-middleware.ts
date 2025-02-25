import { API_CONFIG } from './api-config';

interface RequestConfig extends RequestInit {
    requiresAuth?: boolean;
}

export async function apiRequest<T>(
    url: string,
    config: RequestConfig = {}
): Promise<T> {
    try {
        // Get the stored access token
        const userState = localStorage.getItem('userState');
        const { accessToken } = userState ? JSON.parse(userState) : { accessToken: null };

        // Prepare headers
        const headers = config.requiresAuth && accessToken
            ? API_CONFIG.getAuthHeaders(accessToken)
            : API_CONFIG.headers;

        // Make the request
        const response = await fetch(url, {
            ...config,
            credentials: 'include',
            headers: {
                ...headers,
                ...(config.headers || {}),
                'Origin': typeof window !== 'undefined' ? window.location.origin : '',
            },
        });


        // Handle 401 Unauthorized or 400 Bad Request
        if (response.status === 400) {
            // Store the current path for redirect after login
            const currentPath = typeof window !== 'undefined'
                ? window.location.pathname + window.location.search
                : '/';
            const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;

            // Clear user state
            localStorage.removeItem('userState');

            // Redirect to login
            if (typeof window !== 'undefined') {
                window.location.href = loginUrl;
            }
            throw new Error('Unauthorized');
        }

        // Parse and return the response
        const data = await response.json();
        return data as T;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}