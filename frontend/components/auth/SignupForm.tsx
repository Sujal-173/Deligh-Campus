"use client";
import { useState } from "react";
import Link from "next/link";
import { User, Mail, Phone, UserPlus } from "lucide-react";
import {
  EMAIL_REGEX,
  MOBILE_REGEX,
  NAME_REGEX,
  isPasswordValid,
} from "@/lib/validators";
import { useSignup } from "@/hooks/useSignup";
import type { SignupRole } from "@/types/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/common/ErrorMessage";
import PasswordInput from "./PasswordInput";
import PasswordStrength from "./PasswordStrength";
import RoleSelector from "./RoleSelector";
import TermsCheckbox from "./TermsCheckbox";
import AuthHeader from "./AuthHeader";
import AuthFooter from "./AuthFooter";

type Fields = {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  role: SignupRole | null;
  agreeToTerms: boolean;
};
type FieldErrors = Partial<Record<keyof Fields, string>>;
const INITIAL: Fields = {
  fullName: "",
  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",
  role: null,
  agreeToTerms: false,
};
function validate(values: Fields): FieldErrors {
  const errors: FieldErrors = {};
  const name = values.fullName.trim();
  const email = values.email.trim();
  if (name.length < 2) errors.fullName = "Name must be at least 2 characters.";
  else if (!NAME_REGEX.test(name)) errors.fullName = "Enter a valid full name.";
  if (!EMAIL_REGEX.test(email)) errors.email = "Enter a valid email address.";
  if (!MOBILE_REGEX.test(values.mobile))
    errors.mobile = "Enter a valid 10-digit mobile number.";
  if (!isPasswordValid(values.password))
    errors.password = "Password must meet every requirement below.";
  if (!values.confirmPassword)
    errors.confirmPassword = "Please confirm your password.";
  else if (values.password !== values.confirmPassword)
    errors.confirmPassword = "Passwords do not match.";
  if (!values.role) errors.role = "Please select a role.";
  if (!values.agreeToTerms)
    errors.agreeToTerms =
      "You must agree to the Terms of Use and Privacy Policy.";
  return errors;
}
export default function SignupForm() {
  const { signup, isSubmitting } = useSignup();
  const [fields, setFields] = useState<Fields>(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((current) => {
      const next = { ...current, [key]: value };
      setErrors((currentErrors) => ({
        ...currentErrors,
        [key]: validate(next)[key],
        ...(key === "password"
          ? { confirmPassword: validate(next).confirmPassword }
          : {}),
      }));
      return next;
    });
    setSubmitError(null);
  }
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(fields);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!fields.role) return;
    try {
      await signup({
        fullName: fields.fullName.trim(),
        email: fields.email.trim().toLowerCase(),
        mobile: fields.mobile,
        password: fields.password,
        role: fields.role,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We couldn't create your account. Please try again.",
      );
    }
  }
  return (
    <>
      <AuthHeader
        title="Create Your Account"
        subtitle="Start your verified learning journey."
      />
      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-40" />
            <Input
              id="fullName"
              name="fullName"
              value={fields.fullName}
              onChange={(e) => update("fullName", e.currentTarget.value)}
              autoComplete="name"
              placeholder="Enter your full name"
              invalid={Boolean(errors.fullName)}
              className="pl-9"
            />
          </div>
          <ErrorMessage message={errors.fullName} />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-40" />
            <Input
              id="email"
              name="email"
              value={fields.email}
              onChange={(e) => update("email", e.currentTarget.value)}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Enter your email"
              invalid={Boolean(errors.email)}
              className="pl-9"
            />
          </div>
          <ErrorMessage message={errors.email} />
        </div>
        <div>
          <Label htmlFor="mobile">Mobile Number</Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-40" />
            <Input
              id="mobile"
              name="mobile"
              value={fields.mobile}
              onChange={(e) =>
                update(
                  "mobile",
                  e.currentTarget.value.replace(/\D/g, "").slice(0, 10),
                )
              }
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              placeholder="Enter 10 digit mobile number"
              invalid={Boolean(errors.mobile)}
              className="pl-9"
            />
          </div>
          <ErrorMessage message={errors.mobile} />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <PasswordInput
            id="password"
            name="password"
            value={fields.password}
            onChange={(e) => update("password", e.currentTarget.value)}
            label="Password"
            autoComplete="new-password"
            placeholder="Create a password"
            error={errors.password}
          />
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            value={fields.confirmPassword}
            onChange={(e) => update("confirmPassword", e.currentTarget.value)}
            label="Confirm Password"
            autoComplete="new-password"
            placeholder="Confirm password"
            error={errors.confirmPassword}
          />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-grey-60">
            Password requirements
          </p>
          <PasswordStrength password={fields.password} />
        </div>
        <RoleSelector
          value={fields.role}
          onChange={(role) => update("role", role)}
          error={errors.role}
        />
        <TermsCheckbox
          checked={fields.agreeToTerms}
          onCheckedChange={(checked) => update("agreeToTerms", checked)}
          error={errors.agreeToTerms}
        />
        <ErrorMessage message={submitError ?? undefined} />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          <UserPlus className="h-4 w-4" />
          {isSubmitting ? "Creating account…" : "Create Account"}
        </Button>
        <AuthFooter>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-secondary hover:underline"
          >
            Login
          </Link>
        </AuthFooter>
      </form>
    </>
  );
}
