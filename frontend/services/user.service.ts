import { get, put } from "./api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { User } from "@/types/user";

export const userService = {
  getCurrentUser: () => get<User>(API_ENDPOINTS.currentUser),
  updateProfile: (payload: Partial<User>) =>
    put<User>(API_ENDPOINTS.currentUser, payload),
};
