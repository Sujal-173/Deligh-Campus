"use client";
import { create } from "zustand";
import { authService } from "@/services/auth.service";
import type { AuthResponse, AuthUser } from "@/types/auth";
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (session: AuthResponse) => void;
  setUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setSession: ({ user }) => set({ user, isAuthenticated: true }),
  setUser: (user) => set({ user }),
  logout: async () => {
    await authService.logout().catch(() => undefined);
    set({ user: null, isAuthenticated: false });
  },
}));
