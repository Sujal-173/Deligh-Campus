"use client";
import Link from "next/link";
import { Bell, Menu, User } from "lucide-react";
import BrandLogo from "@/components/auth/BrandLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import LogoutButton from "@/components/dashboard/LogoutButton";
export default function DashboardTopbar({
  onMenuClick,
  profileHref,
  notificationsHref,
  unreadCount = 0,
}: {
  onMenuClick: () => void;
  profileHref: string;
  notificationsHref: string;
  unreadCount?: number;
}) {
  return (
    <header className="sticky top-0 z-50 flex min-h-16 items-center gap-3 border-b border-grey-20 bg-white/95 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-primary hover:bg-grey-10 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <BrandLogo variant="full" theme="light" size={38} href="/" className="shrink-0" />
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Link
          href={notificationsHref}
          aria-label="Notifications"
          className="relative grid h-11 w-11 place-items-center rounded-lg text-primary hover:bg-grey-10"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-error ring-2 ring-white" />
          )}
        </Link>
        <Link href={profileHref} aria-label="Profile" className="rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
}
