"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "@/schemas/resetPasswordSchema";
import { authService } from "@/services/auth.service";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/common/ErrorMessage";
import PasswordInput from "./PasswordInput";
import PasswordStrength from "./PasswordStrength";
import AuthHeader from "./AuthHeader";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = watch("password") || "";

  async function onSubmit(values: ResetPasswordSchema) {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await authService.resetPassword({ token, password: values.password });
      toast.success("Password updated. Please log in.");
      router.push(ROUTES.login);
    } catch {
      setSubmitError(
        "This reset link is invalid or has expired. Please request a new one.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <AuthHeader
        title="Reset Password"
        subtitle="Choose a new password for your account."
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-8 space-y-5"
      >
        <PasswordInput
          id="password"
          label="New Password"
          placeholder="Create a new password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordInput
          id="confirmPassword"
          label="Confirm New Password"
          placeholder="Confirm new password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div>
          <p className="mb-2 text-xs font-medium text-grey-50">
            Password must contain:
          </p>
          <PasswordStrength password={password} />
        </div>

        <ErrorMessage message={submitError ?? undefined} />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          <KeyRound className="h-4 w-4" />
          {isSubmitting ? "Updating\u2026" : "Update Password"}
        </Button>
      </form>
    </>
  );
}
