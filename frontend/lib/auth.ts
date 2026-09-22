"use client";

/** Session credentials are stored only in Secure, HttpOnly cookies by the Next.js BFF. */
export async function clearSession(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
  });
}
