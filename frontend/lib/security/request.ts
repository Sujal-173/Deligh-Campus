import type { NextRequest } from "next/server";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Reject cross-site browser mutations before they reach the authenticated BFF. */
export function isTrustedMutationOrigin(request: NextRequest): boolean {
  if (SAFE_METHODS.has(request.method)) return true;
  const origin = request.headers.get("origin");
  if (origin) return origin === request.nextUrl.origin;
  const referer = request.headers.get("referer");
  // Browsers send Origin for unsafe requests. Reject an absent origin/referrer
  // instead of treating it as trusted: the BFF is cookie-authenticated.
  if (!referer) return false;
  try {
    return new URL(referer).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}
