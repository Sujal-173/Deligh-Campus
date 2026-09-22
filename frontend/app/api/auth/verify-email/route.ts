import { NextRequest, NextResponse } from "next/server";
import { SERVER_CONFIG } from "@/lib/config/server";
import { API_ENDPOINTS } from "@/lib/config/shared";
import { isTrustedMutationOrigin } from "@/lib/security/request";
import { normalizeRole, primaryRole, signRole } from "@/lib/security/session";
import type { ApiResponse } from "@/types/api";
import type { BackendLoginData } from "@/types/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isTrustedMutationOrigin(request)) {
    return NextResponse.json({ success: false, message: "Cross-site request rejected." }, { status: 403 });
  }
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload.token !== "string" || !payload.token.trim()) {
    return NextResponse.json({ success: false, message: "Verification token is required." }, { status: 400 });
  }

  const upstream = await fetch(`${SERVER_CONFIG.backendApiUrl}${API_ENDPOINTS.verifyEmail}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ token: payload.token.trim() }),
    cache: "no-store",
  });
  const body = (await upstream.json().catch(() => null)) as ApiResponse<BackendLoginData> | null;
  if (!upstream.ok || !body?.data?.accessToken) {
    return NextResponse.json(body ?? { success: false, message: "Email verification failed." }, { status: upstream.status });
  }

  const role = primaryRole(body.data.roles ?? []);
  const response = NextResponse.json({
    success: true,
    data: {
      user: {
        id: body.data.userId,
        fullName: body.data.fullName,
        email: body.data.email,
        role,
        roles: (body.data.roles ?? []).map(normalizeRole),
        emailVerified: true,
      },
    },
  });
  const cookie = {
    httpOnly: true,
    secure: SERVER_CONFIG.cookieSecure,
    sameSite: "lax" as const,
    path: "/",
  };
  response.cookies.set(SERVER_CONFIG.sessionCookieName, body.data.accessToken, cookie);
  response.cookies.set(SERVER_CONFIG.roleCookieName, signRole(role), cookie);
  return response;
}
