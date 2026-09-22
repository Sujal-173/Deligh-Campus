"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import ErrorMessage from "@/components/common/ErrorMessage";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ id, label, error, className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div>
        {label && <Label htmlFor={id}>{label}</Label>}
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors focus-within:ring-2",
            error
              ? "border-red-400 focus-within:ring-red-100"
              : "border-grey-20 focus-within:border-secondary focus-within:ring-secondary-10",
          )}
        >
          <Lock className="h-4 w-4 shrink-0 text-grey-40" aria-hidden="true" />
          <input
            ref={ref}
            id={id}
            type={visible ? "text" : "password"}
            aria-invalid={!!error}
            className={cn(
              "w-full bg-transparent text-sm text-primary placeholder:text-grey-40 focus:outline-none",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="shrink-0 text-grey-40 hover:text-grey-60"
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <ErrorMessage message={error} />
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
