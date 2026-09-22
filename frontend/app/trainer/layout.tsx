"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { DASHBOARD_CONFIG } from "@/data/dashboardNav";
export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = DASHBOARD_CONFIG.trainer;
  return (
    <DashboardShell
      navItems={config.nav}
      workspaceLabel={config.label}
      workspaceEyebrow={config.eyebrow}
      profileHref={config.profileHref}
      notificationsHref={config.notificationsHref}
    >
      {children}
    </DashboardShell>
  );
}
