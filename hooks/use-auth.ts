"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AuthState } from "@/types/tmdb";
import { mockUser } from "@/lib/mock-data";

interface AuthStore extends AuthState {
  login: (email: string, password: string) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,

      login: (email: string, password: string) => {
        // Mock login - in production, this would call a real API
        set({
          isLoggedIn: true,
          user: { ...mockUser, email },
        });
      },

      register: (name: string, email: string, password: string) => {
        // Mock registration - in production, this would call a real API
        set({
          isLoggedIn: true,
          user: { ...mockUser, name, email },
        });
      },

      logout: () => {
        set({
          isLoggedIn: false,
          user: null,
        });
      },
    }),
    {
      name: "fooflix-auth",
    },
  ),
);
