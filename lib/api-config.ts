import { type ReadableStream } from 'stream/web';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined');
}

// API Response Types
export interface ApiResponse<T> {
    data: T;
    message?: string;
}

// Document Types
export interface Document {
    id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
}

// User Types
export interface User {
    username: string;
    uuid: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    username: string;
    uuid: string;
}

export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
}

export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
}

// Chat Types
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatRequest {
    message: string;
    document_ids?: string[];
}

// API Endpoints
export const API_ENDPOINTS = {
    // Document endpoints
    DOCUMENTS: {
        UPLOAD: `${API_BASE_URL}/documents/upload`,
        DELETE: (documentId: string) => `${API_BASE_URL}/documents/${documentId}`,
    },

    // User endpoints
    USERS: {
        CREATE: `${API_BASE_URL}/users`,
        LOGIN: `${API_BASE_URL}/users/login`,
        CHANGE_PASSWORD: `${API_BASE_URL}/users/change-password`,
    },

    // Chat endpoints
    CHAT: {
        MESSAGES: `${API_BASE_URL}/chat/messages`,
    },
} as const;

// API Client Configuration
export const API_CONFIG = {
    headers: {
        'Content-Type': 'application/json',
    },
    getAuthHeaders: (token: string) => ({
        'Authorization': `Bearer ${token}`,
    }),
} as const;