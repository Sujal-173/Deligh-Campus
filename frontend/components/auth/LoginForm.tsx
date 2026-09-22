"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, LogIn } from "lucide-react";
import { toast } from "sonner";

import { loginSchema, type LoginSchema } from "@/schemas/loginSchema";

import { useLogin } from "@/hooks/useLogin";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import ErrorMessage from "@/components/common/ErrorMessage";

import PasswordInput from "./PasswordInput";
import RememberMe from "./RememberMe";
import Divider from "./Divider";
import SocialLogin from "./SocialLogin";
import AuthHeader from "./AuthHeader";
import AuthFooter from "./AuthFooter";

export default function LoginForm() {
  const { login, isSubmitting } = useLogin();

  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const rememberMe = watch("rememberMe");

  async function onSubmit(values: LoginSchema) {
    setSubmitError(null);

    try {
      await login(values);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to log in. Please try again.";

      setSubmitError(message);
    }
  }

  return (
    <>
      <AuthHeader
        title="Welcome Back"
        subtitle="Continue your professional learning journey."
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-8 space-y-5"
      >
        <div>
          <Label htmlFor="email">Email Address</Label>

          <div className="relative">
            <Mail
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-grey-40
              "
            />

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

        <div>
          <div
            className="
              mb-1.5
              flex
              items-center
              justify-between
            "
          >
            <Label htmlFor="password" className="mb-0">
              Password
            </Label>

            <Link
              href="/forgot-password"
              className="
                text-xs
                font-medium
                text-secondary
                hover:underline
              "
            >
              Forgot Password?
            </Link>
          </div>

          <PasswordInput
            id="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <RememberMe
          checked={!!rememberMe}
          onCheckedChange={(value) => setValue("rememberMe", value)}
        />

        <ErrorMessage message={submitError ?? undefined} />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          <LogIn className="h-4 w-4" />

          {isSubmitting ? "Logging in..." : "Login"}
        </Button>

        <Divider />

        <SocialLogin
          onGoogleClick={() =>
            toast.info(
              "Google sign-in will be available once OAuth is configured on the backend.",
            )
          }
        />

        <AuthFooter>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="
              font-medium
              text-secondary
              hover:underline
            "
          >
            Create Account
          </Link>
        </AuthFooter>
      </form>
    </>
  );
}
