"use client";

import { useMemo } from "react";
import { getPasswordChecks, passwordStrengthScore } from "@/lib/validators";

export function usePasswordStrength(password: string) {
  return useMemo(
    () => ({
      checks: getPasswordChecks(password),
      score: passwordStrengthScore(password),
    }),
    [password],
  );
}
