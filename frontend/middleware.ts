import { NextRequest, NextResponse } from "next/server";
import {
  PROTECTED_ROLE_PREFIXES,
  ROUTES,
  getRoleHome,
} from "@/lib/config/shared";
import type { SystemRole } from "@/types/auth";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "deligh_session";
const ROLE_COOKIE = process.env.ROLE_COOKIE_NAME ?? "deligh_role";
const ROLE_SECRET = process.env.ROLE_COOKIE_SECRET ?? "";
const AUTH_ROUTES = [
  ROUTES.login,
  ROUTES.signup,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
];

const encode = (bytes: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
const equalInConstantTime = (left: string, right: string) => {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1)
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
};
async function verifiedRole(value?: string): Promise<SystemRole | null> {
  if (!value || !ROLE_SECRET) return null;
  const split = value.lastIndexOf(".");
  if (split < 1) return null;
  const role = value.slice(0, split) as SystemRole;
  const signature = value.slice(split + 1);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(ROLE_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = encode(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(role)),
  );
  return equalInConstantTime(signature, expected) ? role : null;
}
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const protectedEntry = Object.entries(PROTECTED_ROLE_PREFIXES).find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (protectedEntry) {
    if (!token) {
      const url = new URL(ROUTES.login, request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    const role = await verifiedRole(request.cookies.get(ROLE_COOKIE)?.value);
    if (!role || !protectedEntry[1].includes(role)) {
      return NextResponse.redirect(
        new URL(role ? getRoleHome(role) : ROUTES.login, request.url),
      );
    }
  }
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route)) && token) {
    const role = await verifiedRole(request.cookies.get(ROLE_COOKIE)?.value);
    return NextResponse.redirect(
      new URL(getRoleHome(role ?? undefined), request.url),
    );
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    "/admin/:path*",
    "/super-admin/:path*",
    "/student/:path*",
    "/trainer/:path*",
    "/institution/:path*",
    "/recruiter/:path*",
    "/complete-profile/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
