import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { SystemRole } from "@/types/auth";
import { SERVER_CONFIG } from "@/lib/config/server";

const VALID_ROLES: readonly SystemRole[] = [
  "super_admin",
  "admin",
  "student",
  "trainer",
  "recruiter",
  "institution",
  "user",
];

export function normalizeRole(role: string): SystemRole {
  const normalized = role.trim().toLowerCase() as SystemRole;
  return VALID_ROLES.includes(normalized) ? normalized : "user";
}

export function primaryRole(roles: readonly string[]): SystemRole {
  const normalized = roles.map(normalizeRole);
  return normalized.includes("super_admin")
    ? "super_admin"
    : normalized.includes("admin")
      ? "admin"
      : (normalized[0] ?? "user");
}

export function signRole(role: SystemRole): string {
  const signature = createHmac("sha256", SERVER_CONFIG.roleCookieSecret)
    .update(role)
    .digest("base64url");
  return `${role}.${signature}`;
}

export function verifySignedRole(value?: string): SystemRole | null {
  if (!value) return null;
  const separator = value.lastIndexOf(".");
  if (separator < 1) return null;
  const role = value.slice(0, separator) as SystemRole;
  const supplied = Buffer.from(value.slice(separator + 1));
  const expected = Buffer.from(
    createHmac("sha256", SERVER_CONFIG.roleCookieSecret)
      .update(role)
      .digest("base64url"),
  );
  return VALID_ROLES.includes(role) &&
    supplied.length === expected.length &&
    timingSafeEqual(supplied, expected)
    ? role
    : null;
}
