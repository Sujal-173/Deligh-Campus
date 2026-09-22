import type { LucideIcon } from "lucide-react";
import {
  Home,
  LayoutGrid,
  BookOpen,
  ClipboardList,
  Briefcase,
  Building2,
  ShieldCheck,
  UserCog,
  CreditCard,
  ChartNoAxesCombined,
  Settings2,
  ScrollText,
  SlidersHorizontal,
  Users,
  Layers3,
  BadgeCheck,
  FileCheck2,
  Scale,
  WalletCards,
  LibraryBig,
  Settings,
  CalendarDays,
  UsersRound,
  ClipboardCheck,
  Presentation,
} from "lucide-react";
import type { SystemRole } from "@/types/auth";

export type DashboardRole = Exclude<SystemRole, "user">;
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
}
export interface DashboardDefinition {
  label: string;
  eyebrow: string;
  nav: readonly NavItem[];
  profileHref: string;
  notificationsHref: string;
}

/**
 * Navigation follows the Vision Handbook stakeholder model:
 * Admin = operational governance; Super Admin = platform-wide governance.
 * Permission strings are UI metadata only; Spring Security must enforce them.
 */
export const DASHBOARD_CONFIG: Readonly<
  Record<DashboardRole, DashboardDefinition>
> = Object.freeze({
  super_admin: {
    label: "Super Admin",
    eyebrow: "Platform control",
    profileHref: "/super-admin/profile",
    notificationsHref: "/super-admin/notifications",
    nav: [
      {
        label: "Overview",
        href: "/super-admin",
        icon: LayoutGrid,
        permission: "platform:read",
      },
      {
        label: "Organizations",
        href: "/super-admin/organizations",
        icon: Building2,
        permission: "organization:manage",
      },
      {
        label: "Roles & permissions",
        href: "/super-admin/roles",
        icon: ShieldCheck,
        permission: "role:manage",
      },
      {
        label: "Manage admins",
        href: "/super-admin/admins",
        icon: UserCog,
        permission: "admin:manage",
      },
      {
        label: "Subscriptions",
        href: "/super-admin/subscriptions",
        icon: CreditCard,
        permission: "subscription:manage",
      },
      {
        label: "Platform analytics",
        href: "/super-admin/analytics",
        icon: ChartNoAxesCombined,
        permission: "analytics:read",
      },
      {
        label: "System configuration",
        href: "/super-admin/system",
        icon: Settings2,
        permission: "system:manage",
      },
      {
        label: "Audit logs",
        href: "/super-admin/audit-logs",
        icon: ScrollText,
        permission: "audit:read",
      },
      {
        label: "Platform configuration",
        href: "/super-admin/platform",
        icon: SlidersHorizontal,
        permission: "platform:manage",
      },
    ],
  },
  admin: {
    label: "Admin",
    eyebrow: "Learning operations",
    profileHref: "/admin/profile",
    notificationsHref: "/admin/notifications",
    nav: [
      {
        label: "Overview",
        href: "/admin",
        icon: LayoutGrid,
        permission: "dashboard:read",
      },
      {
        label: "User management",
        href: "/admin/users",
        icon: Users,
        permission: "user:manage",
      },
      {
        label: "Course management",
        href: "/admin/courses",
        icon: BookOpen,
        permission: "course:manage",
      },
      {
        label: "Batch monitoring",
        href: "/admin/batches",
        icon: Layers3,
        permission: "batch:read",
      },
      {
        label: "Course approval",
        href: "/admin/course-approvals",
        icon: BadgeCheck,
        permission: "course:approve",
      },
      {
        label: "Assessment monitoring",
        href: "/admin/assessments",
        icon: FileCheck2,
        permission: "assessment:read",
      },
      {
        label: "Appeal review",
        href: "/admin/appeals",
        icon: Scale,
        permission: "appeal:review",
      },
      {
        label: "Reports & analytics",
        href: "/admin/reports",
        icon: ChartNoAxesCombined,
        permission: "report:read",
      },
      {
        label: "Finance management",
        href: "/admin/finance",
        icon: WalletCards,
        permission: "finance:manage",
      },
      {
        label: "Content management",
        href: "/admin/content",
        icon: LibraryBig,
        permission: "content:manage",
      },
      {
        label: "System settings",
        href: "/admin/settings",
        icon: Settings,
        permission: "settings:manage",
      },
    ],
  },
  student: {
    label: "Student",
    eyebrow: "Learning workspace",
    profileHref: "/student/profile",
    notificationsHref: "/student/notifications",
    nav: [
      { label: "Home", href: "/student", icon: Home },
      { label: "Dashboard", href: "/student/dashboard", icon: LayoutGrid },
      { label: "Learning", href: "/student/learning", icon: BookOpen },
      { label: "Assessment", href: "/student/assessment", icon: ClipboardList },
      { label: "Career", href: "/student/career", icon: Briefcase },
    ],
  },
  trainer: {
    label: "Trainer",
    eyebrow: "Trainer workspace",
    profileHref: "/trainer/profile",
    notificationsHref: "/trainer/notifications",
    nav: [
      {
        label: "Dashboard",
        href: "/trainer/dashboard",
        icon: LayoutGrid,
        permission: "trainer:dashboard:read",
      },
      {
        label: "My Batches",
        href: "/trainer/batches",
        icon: UsersRound,
        permission: "trainer:batch:manage",
      },
      {
        label: "Courses",
        href: "/trainer/courses",
        icon: BookOpen,
        permission: "trainer:course:manage",
      },
      {
        label: "Live Classes",
        href: "/trainer/live-classes",
        icon: CalendarDays,
        permission: "trainer:session:manage",
      },
      {
        label: "Student",
        href: "/trainer/students",
        icon: UsersRound,
        permission: "trainer:learner:read",
      },
      {
        label: "Assessment",
        href: "/trainer/assessments",
        icon: ClipboardCheck,
        permission: "trainer:assessment:manage",
      },
      {
        label: "Reports",
        href: "/trainer/reports",
        icon: ChartNoAxesCombined,
        permission: "trainer:report:read",
      },
    ],
  },
  institution: {
    label: "Institution",
    eyebrow: "Institution workspace",
    profileHref: "/institution/profile",
    notificationsHref: "/institution/notifications",
    nav: [
      { label: "Dashboard", href: "/institution/dashboard", icon: LayoutGrid },
      { label: "Programs", href: "/institution/programs", icon: BookOpen },
      { label: "Students", href: "/institution/students", icon: Users },
      { label: "Batches", href: "/institution/batches", icon: Layers3 },
      { label: "Trainers", href: "/institution/trainers", icon: Presentation },
      { label: "Reports", href: "/institution/reports", icon: ChartNoAxesCombined },
      { label: "Placements", href: "/institution/placements", icon: Briefcase },
    ],
  },
  recruiter: {
    label: "Recruiter",
    eyebrow: "Talent workspace",
    profileHref: "/recruiter/profile",
    notificationsHref: "/recruiter/notifications",
    nav: [
      { label: "Dashboard", href: "/recruiter/dashboard", icon: LayoutGrid },
      { label: "Discover Talent", href: "/recruiter/talent", icon: Users },
      { label: "Shortlists", href: "/recruiter/shortlists", icon: BadgeCheck },
      { label: "Jobs", href: "/recruiter/jobs", icon: Briefcase },
      { label: "Hiring Pipeline", href: "/recruiter/pipeline", icon: ClipboardCheck },
      { label: "Reports", href: "/recruiter/reports", icon: ChartNoAxesCombined },
    ],
  },
});

export const DASHBOARD_NAV = Object.fromEntries(
  Object.entries(DASHBOARD_CONFIG).map(([role, value]) => [role, value.nav]),
) as Record<DashboardRole, readonly NavItem[]>;
export const ROLE_LABEL = Object.fromEntries(
  Object.entries(DASHBOARD_CONFIG).map(([role, value]) => [role, value.label]),
) as Record<DashboardRole, string>;
