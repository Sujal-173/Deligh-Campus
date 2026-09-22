"use client";

import { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";
import type { NavItem } from "@/data/dashboardNav";

export default function DashboardShell({
  navItems,
  workspaceLabel,
  workspaceEyebrow,
  profileHref,
  notificationsHref,
  unreadCount,
  children,
}: {
  navItems: readonly NavItem[];
  workspaceLabel?: string;
  workspaceEyebrow?: string;
  profileHref: string;
  notificationsHref: string;
  unreadCount?: number;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-grey-5">
      <DashboardTopbar
        onMenuClick={() => setSidebarOpen(true)}
        profileHref={profileHref}
        notificationsHref={notificationsHref}
        unreadCount={unreadCount}
      />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <DashboardSidebar
          items={navItems}
          label={workspaceLabel}
          eyebrow={workspaceEyebrow}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
