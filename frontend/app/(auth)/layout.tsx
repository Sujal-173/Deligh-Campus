"use client";

import { usePathname } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import type { SidebarVariant } from "@/components/auth/LeftSidebar";

function getVariant(pathname: string): SidebarVariant {
  if (pathname.startsWith("/login")) return "login";
  if (pathname.startsWith("/signup")) return "signup";
  return "generic";
}

export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return <AuthLayout variant={getVariant(pathname)}>{children}</AuthLayout>;
}
