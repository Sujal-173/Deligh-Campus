import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/config/shared";
import { SERVER_CONFIG } from "@/lib/config/server";
import { isTrustedMutationOrigin } from "@/lib/security/request";
import type { ApiResponse } from "@/types/api";

export const runtime = "nodejs";
const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);
const MAX_REQUEST_BODY_BYTES = 50 * 1024 * 1024;
type RefreshData = { accessToken: string; refreshToken?: string };

async function timedFetch(input: string | URL, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    SERVER_CONFIG.requestTimeoutMs,
  );
  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  if (!ALLOWED_METHODS.has(request.method))
    return NextResponse.json(
      { success: false, message: "Method not allowed." },
      { status: 405 },
    );
  if (!isTrustedMutationOrigin(request))
    return NextResponse.json(
      { success: false, message: "Cross-site request rejected." },
      { status: 403 },
    );
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (
    !Number.isFinite(contentLength) ||
    contentLength < 0 ||
    contentLength > MAX_REQUEST_BODY_BYTES
  )
    return NextResponse.json(
      { success: false, message: "Request body is too large." },
      { status: 413 },
    );

  const { path } = await context.params;
  const accessToken = request.cookies.get(
    SERVER_CONFIG.sessionCookieName,
  )?.value;
  const refreshToken = request.cookies.get(
    SERVER_CONFIG.refreshCookieName,
  )?.value;
  const destination = new URL(
    `${SERVER_CONFIG.backendApiUrl}/${path.map(encodeURIComponent).join("/")}`,
  );
  request.nextUrl.searchParams.forEach((value, key) =>
    destination.searchParams.append(key, value),
  );
  let requestBody: ArrayBuffer | undefined;
  try {
    requestBody = ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.arrayBuffer();
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to read request body." },
      { status: 400 },
    );
  }
  if (requestBody && requestBody.byteLength > MAX_REQUEST_BODY_BYTES)
    return NextResponse.json(
      { success: false, message: "Request body is too large." },
      { status: 413 },
    );
  const contentType = request.headers.get("content-type");

  const send = (token?: string) => {
    const headers = new Headers({ Accept: "application/json" });
    if (contentType) headers.set("Content-Type", contentType);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return timedFetch(destination, {
      method: request.method,
      headers,
      body: requestBody,
    });
  };

  try {
    let upstream = await send(accessToken);
    let rotated: RefreshData | undefined;

    // Spring Boot API required: POST /auth/refresh { refreshToken }.
    // It must rotate/revoke refresh tokens and return a new access token.
    if (upstream.status === 401 && refreshToken) {
      const refreshResponse = await timedFetch(
        `${SERVER_CONFIG.backendApiUrl}${API_ENDPOINTS.refreshSession}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        },
      );
      const refreshBody = (await refreshResponse
        .json()
        .catch(() => null)) as ApiResponse<RefreshData> | null;
      if (refreshResponse.ok && refreshBody?.data?.accessToken) {
        rotated = refreshBody.data;
        upstream = await send(rotated.accessToken);
      }
    }

    const responseHeaders = new Headers();
    for (const name of [
      "content-type",
      "content-disposition",
      "cache-control",
    ]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    const response = new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
    if (rotated) {
      const cookie = {
        httpOnly: true,
        secure: SERVER_CONFIG.cookieSecure,
        sameSite: "lax" as const,
        path: "/",
      };
      response.cookies.set(
        SERVER_CONFIG.sessionCookieName,
        rotated.accessToken,
        cookie,
      );
      if (rotated.refreshToken)
        response.cookies.set(
          SERVER_CONFIG.refreshCookieName,
          rotated.refreshToken,
          cookie,
        );
    }
    return response;
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      {
        success: false,
        message: timedOut
          ? "The service timed out."
          : "The service is temporarily unavailable.",
      },
      { status: timedOut ? 504 : 502 },
    );
  }
}
export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
