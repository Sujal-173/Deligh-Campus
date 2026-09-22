"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { ROUTES } from "@/lib/constants";
import type { SignupPayload } from "@/types/auth";
export function useSignup() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function signup(payload: SignupPayload) {
    setIsSubmitting(true);
    try {
      await authService.signup(payload);
      toast.success("Account created! Please verify your email.");
      router.push(
        `${ROUTES.verifyEmail}?email=${encodeURIComponent(payload.email)}`,
      );
    } catch (error) {
      toast.error(
        "We couldn't create your account. Please check your details and try again.",
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }
  return { signup, isSubmitting };
}
