import { NextRequest, NextResponse } from "next/server";
import { SERVER_CONFIG } from "@/lib/config/server";
import { API_ENDPOINTS, PUBLIC_SIGNUP_ROLES } from "@/lib/config/shared";
import { isTrustedMutationOrigin } from "@/lib/security/request";

export const runtime = "nodejs";
const allowedSignupRoles = new Set<string>(PUBLIC_SIGNUP_ROLES);

/** Public registration gateway. Admin roles are deliberately rejected here. */
export async function POST(request: NextRequest) {
  if (!isTrustedMutationOrigin(request)) {
    return NextResponse.json(
      { success: false, message: "Cross-site request rejected." },
      { status: 403 },
    );
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (!Number.isFinite(contentLength) || contentLength > 16 * 1024)
    return NextResponse.json(
      { success: false, message: "Registration request is too large." },
      { status: 413 },
    );
  const payload = await request.json().catch(() => null);
  if (
    !payload ||
    typeof payload.fullName !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.mobile !== "string" ||
    typeof payload.password !== "string" ||
    typeof payload.role !== "string" ||
    !allowedSignupRoles.has(payload.role)
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid registration request." },
      { status: 400 },
    );
  }
  if (
    payload.fullName.trim().length < 2 ||
    payload.fullName.length > 120 ||
    payload.email.trim().length > 254 ||
    payload.mobile.trim().length > 32 ||
    payload.password.length < 8 ||
    payload.password.length > 1024
  )
    return NextResponse.json(
      { success: false, message: "Invalid registration request." },
      { status: 400 },
    );
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    SERVER_CONFIG.requestTimeoutMs,
  );
  try {
    const upstream = await fetch(
      `${SERVER_CONFIG.backendApiUrl}${API_ENDPOINTS.signup}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          fullName: payload.fullName.trim(),
          email: payload.email.trim().toLowerCase(),
          mobile: payload.mobile.trim(),
          password: payload.password,
          role: payload.role,
        }),
        signal: controller.signal,
        cache: "no-store",
      },
    );
    const body = await upstream.json().catch(() => ({
      success: false,
      message: "Registration service returned an invalid response.",
    }));
    return NextResponse.json(body, { status: upstream.status });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      {
        success: false,
        message: timedOut
          ? "Registration timed out."
          : "Registration service is unavailable.",
      },
      { status: timedOut ? 504 : 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
