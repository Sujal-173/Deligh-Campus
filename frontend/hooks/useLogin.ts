"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { getRoleHome } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import type { LoginPayload, AuthResponse } from "@/types/auth";

function safeRedirect(value: string | null, fallback: string): string {
  return value?.startsWith("/") && !value.startsWith("//") ? value : fallback;
}
function messageFrom(error: unknown): string {
  if (axiosLike(error)?.message) return axiosLike(error)!.message!;
  return error instanceof Error
    ? error.message
    : "Unable to log in. Please try again.";
}
function axiosLike(error: unknown): { message?: string } | undefined {
  if (typeof error !== "object" || error === null || !("response" in error))
    return;
  return (error as { response?: { data?: { message?: string } } }).response
    ?.data;
}

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function login(payload: LoginPayload): Promise<AuthResponse> {
    setIsSubmitting(true);
    try {
      const session = await authService.login(payload);
      if (!session?.user)
        throw new Error(
          "Login succeeded but user information was not received.",
        );
      setSession(session);
      toast.success("Welcome back!");
      router.replace(
        safeRedirect(
          searchParams.get("redirect"),
          getRoleHome(session.user.role),
        ),
      );
      return session;
    } catch (error) {
      const message = messageFrom(error);
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  }
  return { login, isSubmitting };
}
