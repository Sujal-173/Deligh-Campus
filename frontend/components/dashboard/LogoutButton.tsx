"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/lib/constants";
export default function LogoutButton() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  return (
    <button
      type="button"
      aria-label="Log out"
      onClick={async () => {
        await logout();
        router.replace(ROUTES.login);
        router.refresh();
      }}
      className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-grey-60 hover:bg-grey-10 hover:text-primary"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden lg:inline">Log out</span>
    </button>
  );
}
