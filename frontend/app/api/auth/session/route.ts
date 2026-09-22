import { NextRequest, NextResponse } from "next/server";
import { SERVER_CONFIG } from "@/lib/config/server";
import { API_ENDPOINTS } from "@/lib/config/shared";
import { primaryRole, signRole } from "@/lib/security/session";
import { isTrustedMutationOrigin } from "@/lib/security/request";
import type { ApiResponse } from "@/types/api";
import type { AuthResponse, BackendLoginData } from "@/types/auth";

export const runtime = "nodejs";

async function backendFetch(path: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    SERVER_CONFIG.requestTimeoutMs,
  );
  try {
    return await fetch(`${SERVER_CONFIG.backendApiUrl}${path}`, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  if (!isTrustedMutationOrigin(request)) {
    return NextResponse.json(
      { success: false, message: "Cross-site request rejected." },
      { status: 403 },
    );
  }
  const payload = await request.json().catch(() => null);
  if (
    !payload ||
    typeof payload.email !== "string" ||
    typeof payload.password !== "string"
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid login request." },
      { status: 400 },
    );
  }
  const email = payload.email.trim().toLowerCase();
  if (
    !email ||
    email.length > 254 ||
    payload.password.length < 8 ||
    payload.password.length > 1024
  )
    return NextResponse.json(
      { success: false, message: "Invalid login request." },
      { status: 400 },
    );
  let upstream: Response;
  try {
    upstream = await backendFetch(API_ENDPOINTS.login, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password: payload.password }),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      {
        success: false,
        message: timedOut
          ? "Authentication service timed out."
          : "Authentication service is unavailable.",
      },
      { status: timedOut ? 504 : 502 },
    );
  }
  const body = (await upstream
    .json()
    .catch(() => null)) as ApiResponse<BackendLoginData> | null;
  if (!upstream.ok || !body?.data?.accessToken) {
    return NextResponse.json(
      { success: false, message: body?.message ?? "Authentication failed." },
      { status: upstream.status || 401 },
    );
  }
  const role = primaryRole(body.data.roles ?? []);
  const session: AuthResponse = {
    user: {
      id: body.data.userId,
      fullName: body.data.fullName,
      email: body.data.email,
      role,
      roles: (body.data.roles ?? []).map((item) =>
        item.trim().toLowerCase(),
      ) as AuthResponse["user"]["roles"],
      emailVerified: body.data.emailVerified ?? true,
    },
  };
  const response = NextResponse.json({ success: true, data: session });
  const cookie = {
    httpOnly: true,
    secure: SERVER_CONFIG.cookieSecure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: payload.rememberMe
      ? SERVER_CONFIG.sessionRememberMaxAgeSeconds
      : undefined,
  };
  response.cookies.set(
    SERVER_CONFIG.sessionCookieName,
    body.data.accessToken,
    cookie,
  );
  if (body.data.refreshToken) {
    response.cookies.set(
      SERVER_CONFIG.refreshCookieName,
      body.data.refreshToken,
      cookie,
    );
  }
  response.cookies.set(SERVER_CONFIG.roleCookieName, signRole(role), cookie);
  return response;
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SERVER_CONFIG.sessionCookieName)?.value;
  if (!token)
    return NextResponse.json(
      { success: false, message: "Unauthenticated." },
      { status: 401 },
    );
  try {
    const upstream = await backendFetch(API_ENDPOINTS.currentUser, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const body = await upstream.json().catch(() => null);
    return NextResponse.json(body, { status: upstream.status });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      {
        success: false,
        message: timedOut ? "Session check timed out." : "Session service unavailable.",
      },
      { status: timedOut ? 504 : 502 },
    );
  }
}
