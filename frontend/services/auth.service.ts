import axios from "axios";
import { post } from "./api";
import { API_ENDPOINTS } from "@/lib/constants";
import { FRONTEND_API_ENDPOINTS } from "@/lib/config/shared";
import type {
  LoginPayload,
  SignupPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  AuthResponse,
} from "@/types/auth";
import type { ApiResponse } from "@/types/api";

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await axios.post<ApiResponse<AuthResponse>>(
      FRONTEND_API_ENDPOINTS.session,
      payload,
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!data.success || !data.data)
      throw new Error(data.message ?? "Unable to log in.");
    return data.data;
  },
  async signup(payload: SignupPayload): Promise<{ message?: string }> {
    const { data } = await axios.post<ApiResponse<{ message?: string }>>(
      FRONTEND_API_ENDPOINTS.register,
      payload,
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!data.success)
      throw new Error(data.message ?? "Unable to create account.");
    return data.data ?? { message: data.message };
  },
  forgotPassword: (payload: ForgotPasswordPayload) =>
    post<{ message: string }>(API_ENDPOINTS.forgotPassword, payload),
  resetPassword: (payload: ResetPasswordPayload) =>
    post<{ message: string }>(API_ENDPOINTS.resetPassword, payload),
  verifyEmail: (token: string) =>
    axios.post<ApiResponse<AuthResponse>>("/api/auth/verify-email", { token }, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    }).then(({ data }) => {
      if (!data.success || !data.data) throw new Error(data.message ?? "Unable to verify email.");
      return data.data;
    }),
  resendVerification: (email: string) =>
    post<{ message: string }>(API_ENDPOINTS.resendVerification, { email }),
  completeProfile: (payload: Record<string, unknown>) =>
    post<AuthResponse["user"]>(API_ENDPOINTS.completeProfile, payload),
  async logout(): Promise<void> {
    await axios.post(FRONTEND_API_ENDPOINTS.logout, undefined, {
      withCredentials: true,
    });
  },
};
