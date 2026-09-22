import { Check } from "lucide-react";
import { SIGNUP_ROLES } from "@/data/roles";
import type { SignupRole } from "@/types/auth";
import ErrorMessage from "@/components/common/ErrorMessage";

export default function RoleSelector({
  value,
  onChange,
  error,
}: {
  value: SignupRole | null;
  onChange: (role: SignupRole) => void;
  error?: string;
}) {
  return (
    <fieldset aria-describedby={error ? "role-error" : undefined}>
      <legend className="mb-2 text-sm font-medium text-grey-70">
        Select Your Role
      </legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SIGNUP_ROLES.map(({ id, label, icon: Icon }) => {
          const role = id as SignupRole;
          return (
            <label key={id} className="relative cursor-pointer">
              <input
                type="radio"
                name="signupRole"
                value={role}
                checked={value === role}
                onChange={() => onChange(role)}
                className="peer sr-only"
              />
              <span className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-grey-20 bg-white p-3 text-xs font-medium text-grey-60 transition-colors hover:border-secondary-30 hover:bg-grey-5 peer-checked:border-secondary peer-checked:bg-secondary-10 peer-checked:text-secondary-90 peer-focus-visible:ring-2 peer-focus-visible:ring-secondary peer-focus-visible:ring-offset-2">
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </span>
              <span className="pointer-events-none absolute right-2 top-2 hidden h-4 w-4 items-center justify-center rounded-full bg-secondary text-white peer-checked:flex">
                <Check className="h-3 w-3" aria-hidden="true" />
              </span>
            </label>
          );
        })}
      </div>
      <div id="role-error">
        <ErrorMessage message={error} />
      </div>
    </fieldset>
  );
}
