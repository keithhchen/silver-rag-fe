import axios, { AxiosError } from 'axios';
import { toast } from '@/components/ui/use-toast';

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
                // Show toast notification
                toast({
                    variant: "destructive",
                    title: "Session Expired",
                    description: "Please login again."
                });
                // Redirect to login page
                window.location.href = '/login';
                return Promise.reject(error)
            }

            // Handle 400-level errors (client-side business logic errors)
            if (status >= 400 && status < 500) {
                toast({
                    title: "错误 " + status,
                    description: JSON.stringify(data)
                });
                return Promise.reject(error)
            }

            // Handle 500-level errors (server-side internal errors)
            if (status >= 500) {
                alert("toasting error")
                toast({
                    variant: "destructive",
                    title: "服务器错误 500",
                    description: JSON.stringify(data)
                });
                return Promise.reject(error)
            }
        }

        // Handle network errors or other issues
        toast({
            title: "网络错误",
            description: "请检查网络连接"
        });
        return Promise.reject(error)
    }
);

export default api;