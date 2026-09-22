"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Send, ArrowLeft } from "lucide-react";
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from "@/schemas/forgotPasswordSchema";
import { useForgotPassword } from "@/hooks/useForgotPassword";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/common/ErrorMessage";
import AuthHeader from "./AuthHeader";
import AuthFooter from "./AuthFooter";

export default function ForgotPasswordForm() {
  const { requestReset, isSubmitting, sent } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordSchema) {
    await requestReset(values).catch(() => undefined);
  }

  return (
    <>
      <AuthHeader
        title="Forgot Password?"
        subtitle="Enter the email linked to your account and we'll send you a reset link."
      />

      {sent ? (
        <div className="mt-8 rounded-lg bg-success-10 p-4 text-sm text-success-80">
          Check your inbox for a link to reset your password.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-8 space-y-5"
        >
          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-40" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                invalid={!!errors.email}
                className="pl-9"
                {...register("email")}
              />
            </div>
            <ErrorMessage message={errors.email?.message} />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            <Send className="h-4 w-4" />
            {isSubmitting ? "Sending link\u2026" : "Send Reset Link"}
          </Button>
        </form>
      )}

      <AuthFooter>
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-medium text-secondary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Login
        </Link>
      </AuthFooter>
    </>
  );
}
