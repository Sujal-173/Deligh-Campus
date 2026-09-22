import Link from "next/link";
import { Check } from "lucide-react";
import ErrorMessage from "@/components/common/ErrorMessage";
export default function TermsCheckbox({
  checked,
  onCheckedChange,
  error,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
}) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <label className="relative mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center">
          <input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheckedChange(event.currentTarget.checked)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "terms-error" : undefined}
            className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-grey-30 bg-white checked:border-secondary checked:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
          />
          <Check
            className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100"
            aria-hidden="true"
          />
        </label>
        <p className="text-sm leading-5 text-grey-60">
          <label htmlFor="agreeToTerms" className="cursor-pointer">
            I agree to the{" "}
          </label>
          <Link
            href="/terms"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-secondary hover:underline"
          >
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-secondary hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
      <div id="terms-error">
        <ErrorMessage message={error} />
      </div>
    </div>
  );
}
