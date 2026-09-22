"use client";

import { create } from "zustand";
import type { User } from "@/types/user";

interface UserState {
  profile: User | null;
  setProfile: (profile: User) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),
}));
