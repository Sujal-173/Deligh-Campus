import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={invalid}
        className={cn(
          "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-primary placeholder:text-grey-40 focus:outline-none focus:ring-2",
          invalid
            ? "border-red-400 focus:ring-red-100"
            : "border-grey-20 focus:border-secondary focus:ring-secondary-10",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
