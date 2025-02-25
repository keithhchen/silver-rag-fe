import axios, { AxiosError } from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;

            // Handle 401 unauthorized error (invalid token)
            if (status === 401) {
                // Clear the invalid token
                localStorage.removeItem('token');
                // Redirect to login page
                window.location.href = '/login';
                return Promise.reject({
                    message: 'Session expired. Please login again.',
                    status,
                });
            }

            // Handle 400-level errors (client-side business logic errors)
            if (status >= 400 && status < 500) {
                return Promise.reject({
                    message: data,
                    status,
                });
            }

            // Handle 500-level errors (server-side internal errors)
            if (status >= 500) {
                return Promise.reject({
                    message: data,
                    status,
                });
            }
        }

        // Handle network errors or other issues
        return Promise.reject({
            message: 'Network error. Please check your connection and try again.',
            status: 0,
        });
    }
);

export default api;