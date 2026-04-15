"use client";

import { FlixUser } from "@/types/flix";
import { createContext, useContext } from "react";

interface AuthProviderProps {
  initialUser: FlixUser | null;
  children: React.ReactNode;
}

export interface AuthContext {
  user: FlixUser | null;
  isLoggedIn: boolean;
}

const authContext = createContext<AuthContext>({
  user: null,
  isLoggedIn: false,
});

export function useAuthContext() {
  return useContext(authContext);
}

export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const value: AuthContext = {
    user: initialUser,
    isLoggedIn: !!initialUser,
  };

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
}