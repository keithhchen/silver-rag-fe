"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/lib/api-config";
import { apiRequest } from "@/lib/api-middleware";

interface UserState {
  accessToken: string | null;
  username: string | null;
  uuid: string | null;
  role: string | null;
}

interface UserContextType extends UserState {
  login: (
    accessToken: string,
    username: string,
    uuid: string,
    role: string
  ) => void;
  logout: () => void;
}

const initialState: UserState = {
  accessToken: null,
  username: null,
  uuid: null,
  role: null,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<UserState>(() => {
    if (typeof window === "undefined") return initialState;

    try {
      const storedState = localStorage.getItem("userState");
      return storedState ? JSON.parse(storedState) : initialState;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialState;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userState", JSON.stringify(state));
    }
  }, [state]);

  useEffect(() => {
    const validateToken = async () => {
      if (!state.accessToken) return;

      try {
        const data = await apiRequest<{
          username: string;
          uuid: string;
          role: string;
        }>(API_ENDPOINTS.USERS.PROFILE, {
          requiresAuth: true,
        });

        setState({
          accessToken: state.accessToken,
          username: data.username,
          uuid: data.uuid,
          role: data.role,
        });
      } catch (error) {
        console.error("Error validating token:", error);
        logout();
        router.push("/login");
      }
    };

    validateToken();
  }, [state.accessToken, router]);

  const login = (
    accessToken: string,
    username: string,
    uuid: string,
    role: string
  ) => {
    setState({
      accessToken,
      username,
      uuid,
      role,
    });
  };

  const logout = () => {
    setState(initialState);
    localStorage.removeItem("userState");
  };

  const value = {
    ...state,
    login,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
