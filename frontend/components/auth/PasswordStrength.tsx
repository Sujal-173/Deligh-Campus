"use client";
import { Check, X } from "lucide-react";
import { usePasswordStrength } from "@/hooks/usePasswordStrength";
const REQUIREMENTS = [
  { key: "minLength", label: "At least 8 characters" },
  { key: "hasUppercase", label: "One uppercase letter" },
  { key: "hasLowercase", label: "One lowercase letter" },
  { key: "hasNumber", label: "One number" },
  { key: "hasSpecialChar", label: "One special character" },
] as const;
export default function PasswordStrength({ password }: { password: string }) {
  const { checks, score } = usePasswordStrength(password);
  const percentage = (score / REQUIREMENTS.length) * 100;
  return (
    <div aria-live="polite">
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-grey-20">
        <div
          className="h-full rounded-full bg-secondary transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {REQUIREMENTS.map((requirement) => {
          const met = checks[requirement.key];
          return (
            <div
              key={requirement.key}
              className="flex items-center gap-1.5 text-xs"
            >
              {met ? (
                <Check
                  className="h-3.5 w-3.5 shrink-0 text-success"
                  aria-hidden="true"
                />
              ) : (
                <X
                  className="h-3.5 w-3.5 shrink-0 text-grey-30"
                  aria-hidden="true"
                />
              )}
              <span
                className={met ? "font-medium text-success-80" : "text-grey-50"}
              >
                {requirement.label}
              </span>
            </div>
          );
        })}
      </div>
      <span className="sr-only">
        Password meets {score} of {REQUIREMENTS.length} requirements.
      </span>
    </div>
  );
}
