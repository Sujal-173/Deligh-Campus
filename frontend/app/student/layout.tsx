"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DASHBOARD_NAV } from "@/data/dashboardNav";
import { studentNotificationService } from "@/services/student/notification.service";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;
    studentNotificationService
      .getAll()
      .then((list) => {
        if (active) setUnreadCount(list.filter((n) => !n.read).length);
      })
      // Notification failure must not make the learning workspace unusable.
      .catch(() => {
        if (active) setUnreadCount(0);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardShell
      navItems={DASHBOARD_NAV.student}
      profileHref="/student/profile"
      notificationsHref="/student/notifications"
      unreadCount={unreadCount}
    >
      {children}
    </DashboardShell>
  );
}
