"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface UserState {
  accessToken: string | null;
  username: string | null;
  uuid: string | null;
}

interface UserContextType extends UserState {
  login: (accessToken: string, username: string, uuid: string) => void;
  logout: () => void;
}

const initialState: UserState = {
  accessToken: null,
  username: null,
  uuid: null,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
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

  const login = (accessToken: string, username: string, uuid: string) => {
    setState({
      accessToken,
      username,
      uuid,
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
