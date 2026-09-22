// Small, framework-agnostic validation helpers shared by the zod schemas
// (schemas/*.ts) and any UI that needs live feedback (e.g. PasswordStrength).

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MOBILE_REGEX = /^[6-9]\d{9}$/; // 10-digit mobile, first digit 6-9 (India)
export const NAME_REGEX = /^[A-Za-z\s.'-]+$/;

export interface PasswordChecks {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  return Object.values(getPasswordChecks(password)).every(Boolean);
}

export function passwordStrengthScore(password: string): number {
  return Object.values(getPasswordChecks(password)).filter(Boolean).length;
}
