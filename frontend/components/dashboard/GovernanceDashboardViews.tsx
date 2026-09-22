"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, BarChart3, BookOpen, Building2, ClipboardCheck, CreditCard, FileWarning, Layers3, ShieldCheck, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminService } from "@/services/admin/admin.service";
import { superAdminService } from "@/services/super-admin/super-admin.service";
import { DASHBOARD_CONFIG } from "@/data/dashboardNav";
import { useCallback, useEffect, useState, type ReactNode } from "react";

const asNumber = (value: unknown) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};

function LoadingState() {
  return <div className="rounded-2xl border border-grey-20 bg-white p-8 text-sm text-grey-50">Loading control-center data…</div>;
}

function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return (
    <Card className="border-error/20 p-7">
      <p className="font-semibold text-error-80">The control center could not be loaded.</p>
      <p className="mt-2 text-sm text-grey-60">{message}</p>
      <Button className="mt-4" variant="outline" onClick={retry}>Try again</Button>
    </Card>
  );
}

function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">{eyebrow}</p>
      <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-grey-60">{description}</p>
    </div>
  );
}

function MetricGrid({ items }: { items: { label: string; value: unknown; icon: ReactNode; helper: string }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-grey-50">{item.label}</p>
              <p className="mt-2 font-display text-3xl font-bold text-primary">{asNumber(item.value).toLocaleString()}</p>
            </div>
            <span className="rounded-xl bg-secondary-10 p-2 text-secondary">{item.icon}</span>
          </div>
          <p className="mt-3 text-xs text-grey-50">{item.helper}</p>
        </Card>
      ))}
    </div>
  );
}

function LinkCard({ href, label, description, icon }: { href: string; label: string; description: string; icon: ReactNode }) {
  return (
    <Link href={href} className="group">
      <Card className="h-full p-5 transition group-hover:-translate-y-0.5 group-hover:border-secondary-30 group-hover:shadow-card-hover">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-xl bg-secondary-10 p-2 text-secondary">{icon}</span>
          <ArrowRight className="h-4 w-4 text-grey-40 transition group-hover:translate-x-0.5 group-hover:text-secondary" />
        </div>
        <p className="mt-5 font-semibold text-primary">{label}</p>
        <p className="mt-1 text-sm leading-5 text-grey-60">{description}</p>
      </Card>
    </Link>
  );
}

function useLoader<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setData(await loader()); }
    catch (err) { setError(err instanceof Error ? err.message : "Request failed"); }
    finally { setLoading(false); }
  }, [loader]);
  useEffect(() => { void load(); }, [load]);
  return { data, loading, error, reload: load };
}

const ADMIN_LINK_COPY: Record<string, string> = {
  "/admin/users": "Review access, identity status and account health.",
  "/admin/courses": "Manage the platform learning catalog and delivery state.",
  "/admin/batches": "Monitor active cohorts and learning operations.",
  "/admin/course-approvals": "Review learning programs awaiting governance decisions.",
  "/admin/assessments": "Monitor assessment delivery and learner completion.",
  "/admin/appeals": "Handle assessment and learner appeals transparently.",
  "/admin/reports": "Inspect operational, learning and outcome reporting.",
  "/admin/finance": "Track platform transactions and financial operations.",
};

const ADMIN_ICONS: Record<string, ReactNode> = {
  "/admin/users": <Users className="h-5 w-5" />,
  "/admin/courses": <BookOpen className="h-5 w-5" />,
  "/admin/batches": <Layers3 className="h-5 w-5" />,
  "/admin/course-approvals": <BadgeCheck className="h-5 w-5" />,
  "/admin/assessments": <ClipboardCheck className="h-5 w-5" />,
  "/admin/appeals": <FileWarning className="h-5 w-5" />,
  "/admin/reports": <BarChart3 className="h-5 w-5" />,
  "/admin/finance": <CreditCard className="h-5 w-5" />,
};

const SUPER_ADMIN_LINK_COPY: Record<string, string> = {
  "/super-admin/organizations": "Govern institutional accounts and their platform state.",
  "/super-admin/roles": "Control reusable roles and permission mappings.",
  "/super-admin/admins": "Provision and manage platform administrators.",
  "/super-admin/subscriptions": "Manage organization subscription lifecycle.",
  "/super-admin/analytics": "View adoption, learning and platform-wide trends.",
  "/super-admin/system": "Manage non-secret operational configuration.",
  "/super-admin/audit-logs": "Inspect governance actions recorded by the platform.",
  "/super-admin/platform": "Control platform-wide configuration and behavior.",
};

const SUPER_ADMIN_ICONS: Record<string, ReactNode> = {
  "/super-admin/organizations": <Building2 className="h-5 w-5" />,
  "/super-admin/roles": <ShieldCheck className="h-5 w-5" />,
  "/super-admin/admins": <Users className="h-5 w-5" />,
  "/super-admin/subscriptions": <CreditCard className="h-5 w-5" />,
  "/super-admin/analytics": <BarChart3 className="h-5 w-5" />,
  "/super-admin/audit-logs": <FileWarning className="h-5 w-5" />,
};

export function AdminGovernanceDashboard() {
  const loader = useCallback(() => adminService.getDashboard(), []);
  const q = useLoader(loader);
  if (q.loading) return <LoadingState />;
  if (q.error) return <ErrorState message={q.error} retry={q.reload} />;
  const d = q.data ?? {};
  const cards = [
    { label: "Users", value: d.users, helper: "Total platform accounts", icon: <Users className="h-5 w-5" /> },
    { label: "Active users", value: d.activeUsers, helper: "Accounts currently enabled", icon: <ShieldCheck className="h-5 w-5" /> },
    { label: "Courses", value: d.courses, helper: "Learning programs in the catalog", icon: <BookOpen className="h-5 w-5" /> },
    { label: "Pending approvals", value: d.pendingApprovals, helper: "Programs awaiting a governance decision", icon: <BadgeCheck className="h-5 w-5" /> },
    { label: "Active batches", value: d.activeBatches, helper: "Cohorts currently running", icon: <Layers3 className="h-5 w-5" /> },
    { label: "Assessments", value: d.assessments, helper: "Configured assessment records", icon: <ClipboardCheck className="h-5 w-5" /> },
    { label: "Transactions", value: d.transactions, helper: "Recorded financial transactions", icon: <CreditCard className="h-5 w-5" /> },
    { label: "Published courses", value: d.publishedCourses, helper: "Catalog items available for delivery", icon: <BookOpen className="h-5 w-5" /> },
  ];
  const links = DASHBOARD_CONFIG.admin.nav.filter((item) => item.href !== "/admin").slice(0, 8).map((item) => ({ ...item, description: ADMIN_LINK_COPY[item.href] ?? "Open this operational module.", icon: ADMIN_ICONS[item.href] ?? <ArrowRight className="h-5 w-5" /> }));

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Learning operations" title="Admin control center" description="Run the day-to-day learning, quality, assessment and platform operations from one governed workspace." />
      <Card className="overflow-hidden bg-primary p-6 text-white shadow-card sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_.5fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Operational focus</p>
            <h2 className="mt-2 max-w-2xl font-display text-2xl font-bold sm:text-3xl">Keep learning quality, trust and platform operations visible.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">Use the control center to review activity, resolve exceptions and keep the learning ecosystem reliable. All operational counts come from the authenticated Spring Boot API.</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/8 p-5">
            <p className="text-sm font-semibold">Priority queue</p>
            <p className="mt-1 font-display text-4xl font-bold">{asNumber(d.pendingApprovals).toLocaleString()}</p>
            <p className="text-xs text-white/60">items waiting for course approval</p>
            <Link href="/admin/course-approvals" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white hover:underline">Review queue <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </Card>
      <MetricGrid items={cards} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-primary">Operational modules</h2>
              <p className="mt-1 text-sm text-grey-60">Navigate directly to the workflows used most often.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {links.map((link) => <LinkCard key={link.href} href={link.href} label={link.label} description={link.description} icon={link.icon} />)}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-xl font-bold text-primary">Operational lens</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-xl bg-grey-5 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-grey-50">Learner accounts</p><p className="mt-1 font-display text-2xl font-bold text-primary">{asNumber(d.students).toLocaleString()}</p><p className="mt-1 text-xs text-grey-50">Students currently registered on the platform.</p></div>
            <div className="rounded-xl bg-grey-5 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-grey-50">Trainer network</p><p className="mt-1 font-display text-2xl font-bold text-primary">{asNumber(d.trainers).toLocaleString()}</p><p className="mt-1 text-xs text-grey-50">Trainer accounts contributing to learning delivery.</p></div>
            <div className="rounded-xl bg-grey-5 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-grey-50">Assessment attempts</p><p className="mt-1 font-display text-2xl font-bold text-primary">{asNumber(d.assessmentAttempts).toLocaleString()}</p><p className="mt-1 text-xs text-grey-50">Recorded attempts across the assessment system.</p></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function SuperAdminGovernanceDashboard() {
  const loader = useCallback(() => superAdminService.getDashboard(), []);
  const q = useLoader(loader);
  if (q.loading) return <LoadingState />;
  if (q.error) return <ErrorState message={q.error} retry={q.reload} />;
  const d = q.data ?? {};
  const cards = [
    { label: "Organizations", value: d.organizations, helper: "Institutions and organization accounts", icon: <Building2 className="h-5 w-5" /> },
    { label: "Admins", value: d.admins, helper: "Platform administrators", icon: <ShieldCheck className="h-5 w-5" /> },
    { label: "Students", value: d.students, helper: "Learners across the platform", icon: <Users className="h-5 w-5" /> },
    { label: "Trainers", value: d.trainers, helper: "Trainer accounts across workspaces", icon: <Users className="h-5 w-5" /> },
    { label: "Subscriptions", value: d.subscriptions, helper: "Organization subscription records", icon: <CreditCard className="h-5 w-5" /> },
    { label: "Audit events", value: d.auditEvents, helper: "Governance events recorded by the API", icon: <FileWarning className="h-5 w-5" /> },
  ];
  const links = DASHBOARD_CONFIG.super_admin.nav.filter((item) => item.href !== "/super-admin").slice(0, 8).map((item) => ({ ...item, description: SUPER_ADMIN_LINK_COPY[item.href] ?? "Open this governance module.", icon: SUPER_ADMIN_ICONS[item.href] ?? <ArrowRight className="h-5 w-5" /> }));

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Platform governance" title="Super Admin control center" description="Govern organizations, access, subscriptions, analytics and auditability from the platform-level workspace." />
      <Card className="overflow-hidden bg-primary p-6 text-white shadow-card sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_.5fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Governance focus</p>
            <h2 className="mt-2 max-w-2xl font-display text-2xl font-bold sm:text-3xl">Protect platform trust while enabling every stakeholder workspace.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">Use the platform-level workspace to manage institutional tenants, role boundaries, administrators, subscriptions and audit trails. Authorization remains enforced on the Spring Boot API.</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/8 p-5">
            <p className="text-sm font-semibold">Platform organizations</p>
            <p className="mt-1 font-display text-4xl font-bold">{asNumber(d.organizations).toLocaleString()}</p>
            <p className="text-xs text-white/60">organization records currently visible to the governance layer</p>
            <Link href="/super-admin/organizations" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white hover:underline">Open organizations <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </Card>
      <MetricGrid items={cards} />
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-primary">Governance modules</h2>
            <p className="mt-1 text-sm text-grey-60">Platform-level controls aligned to the administrator vision.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {links.map((link) => <LinkCard key={link.href} href={link.href} label={link.label} description={link.description} icon={link.icon} />)}
        </div>
      </Card>
    </div>
  );
}
