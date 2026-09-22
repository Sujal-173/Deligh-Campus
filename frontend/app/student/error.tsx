"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-error-10 text-error">
        <AlertCircle className="h-5 w-5" />
      </span>
      <h1 className="mt-4 font-display text-xl font-bold text-primary">
        We couldn&apos;t load your learning data
      </h1>
      <p className="mt-2 max-w-md text-sm text-grey-60">
        Your dashboard only displays verified information from your account.
        Check the API connection and try again.
      </p>
      <Button className="mt-5" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
