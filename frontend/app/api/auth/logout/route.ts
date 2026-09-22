import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/config/shared";
import { SERVER_CONFIG } from "@/lib/config/server";
import { isTrustedMutationOrigin } from "@/lib/security/request";

/** Clears local credentials and asks Spring Boot to revoke the refresh token. */
export async function POST(request: NextRequest) {
  if (!isTrustedMutationOrigin(request))
    return NextResponse.json(
      { success: false, message: "Cross-site request rejected." },
      { status: 403 },
    );
  const refreshToken = request.cookies.get(
    SERVER_CONFIG.refreshCookieName,
  )?.value;
  if (refreshToken) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      SERVER_CONFIG.requestTimeoutMs,
    );
    try {
      await fetch(
        `${SERVER_CONFIG.backendApiUrl}${API_ENDPOINTS.revokeSession}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ refreshToken }),
          signal: controller.signal,
          cache: "no-store",
        },
      );
    } catch {
      /* Local logout still succeeds when revocation service is unavailable. */
    } finally {
      clearTimeout(timeout);
    }
  }
  const response = NextResponse.json({ success: true });
  const expired = {
    httpOnly: true,
    secure: SERVER_CONFIG.cookieSecure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
  response.cookies.set(SERVER_CONFIG.sessionCookieName, "", expired);
  response.cookies.set(SERVER_CONFIG.refreshCookieName, "", expired);
  response.cookies.set(SERVER_CONFIG.roleCookieName, "", expired);
  return response;
}
