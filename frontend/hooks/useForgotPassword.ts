"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import type { ForgotPasswordPayload } from "@/types/auth";

export function useForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function requestReset(payload: ForgotPasswordPayload) {
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(payload);
      setSent(true);
      toast.success("If that email exists, a reset link is on its way.");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { requestReset, isSubmitting, sent };
}
