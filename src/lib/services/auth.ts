import api from "../api";
import { User } from "../types/user";

interface ProfileResponse {
    uuid: string;
    username: string;
    role: string;
    created_at: string;
}

interface LoginResponse {
    uuid: string;
    username: string;
    role: string;
    created_at: string;
    token: string;
}

interface LoginCredentials {
    username: string;
    password: string;
}

export const login = async (credentials: LoginCredentials, onError?: (error: any) => void): Promise<User> => {
    try {
        const response = await api.post<LoginResponse>("/users/login", credentials);

        // Store the token in localStorage
        localStorage.setItem("token", response.data.token);

        // Return the user data
        return response.data
    } catch (error: any) {
        if (onError) {
            onError(error);
        }
        throw error;
    }
};

export const getProfile = async (): Promise<User> => {
    try {
        const response = await api.get<ProfileResponse>('/users/profile');
        return response.data
    } catch (error: any) {
        throw error;
    }
};