"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ArrowLeft, Plus, RefreshCw, Save, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminBatch, AdminUser, ApiRecord, PageResult } from "@/types/administration";
import { adminService } from "@/services/admin/admin.service";
import { superAdminService } from "@/services/super-admin/super-admin.service";

const str = (v: unknown, fallback = "—") =>
  v === null || v === undefined || v === "" ? fallback : String(v);
const num = (v: unknown) => Number(v ?? 0);
const bool = (v: unknown) => v === true || v === "true" || v === 1 || v === "1";
const date = (v: unknown) => {
  if (!v) return "—";
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
};

function Head({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">
          {title}
        </h1>
        <p className="mt-1 text-sm text-grey-60">{description}</p>
      </div>
      {action}
    </div>
  );
}
function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-grey-20 bg-grey-5 p-8 text-center text-sm text-grey-50">
      {label}
    </div>
  );
}
function Loading() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-grey-20 bg-white p-6 text-sm text-grey-50">
      <RefreshCw className="h-4 w-4 animate-spin" />
      Loading…
    </div>
  );
}
function ErrorBox({ error, retry }: { error: string; retry?: () => void }) {
  return (
    <div className="rounded-xl border border-error/20 bg-error/5 p-6 text-sm text-error">
      {error}
      {retry && (
        <button className="ml-3 underline" onClick={retry}>
          Retry
        </button>
      )}
    </div>
  );
}
function StatGrid({
  entries,
}: {
  entries: { label: string; value: unknown }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {entries.map((e) => (
        <Card key={e.label} className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-grey-50">
            {e.label}
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-primary">
            {str(e.value, "0")}
          </p>
        </Card>
      ))}
    </div>
  );
}
function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return rows.length ? (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-grey-20">
            {headers.map((h) => (
              <th key={h} className="p-4 font-semibold text-primary">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-grey-20 last:border-0">
              {r.map((c, j) => (
                <td key={j} className="p-4 align-top">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  ) : (
    <Empty label="No records found." />
  );
}
function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search",
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}) {
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <Button variant="outline" type="submit">
        <Search className="h-4 w-4" />
        Search
      </Button>
    </form>
  );
}
function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between rounded-xl border border-grey-20 bg-white px-4 py-3 text-sm">
      <span className="text-grey-50">Page {page + 1} of {totalPages}</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onChange(page - 1)}>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
function ActionButton({
  label,
  onClick,
  destructive = false,
}: {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <Button
      variant={destructive ? "destructive" : "outline"}
      size="sm"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const run = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await loader());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, deps);
  useEffect(() => {
    void run();
  }, [run]);
  return { data, loading, error, reload: run };
}

export function AdminControlDashboard() {
  const q = useAsync(() => adminService.getDashboard(), []);
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={q.reload} />;
  const d = q.data ?? {};
  const cards = [
    { label: "Users", value: d.users },
    { label: "Active users", value: d.activeUsers },
    { label: "Courses", value: d.courses },
    { label: "Published courses", value: d.publishedCourses },
    { label: "Batches", value: d.batches },
    { label: "Assessments", value: d.assessments },
    { label: "Pending approvals", value: d.pendingApprovals },
    { label: "Transactions", value: d.transactions },
  ];
  return (
    <div className="space-y-7">
      <Head
        title="Admin control center"
        description="Operational control for users, learning, assessments, finance and content."
      />
      <StatGrid entries={cards} />
      <Card className="p-6">
        <h2 className="font-semibold">Operational flow</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Users", h: "/admin/users" },
            { t: "Courses", h: "/admin/courses" },
            { t: "Approvals", h: "/admin/course-approvals" },
            { t: "Assessments", h: "/admin/assessments" },
            { t: "Batches", h: "/admin/batches" },
            { t: "Appeals", h: "/admin/appeals" },
            { t: "Reports", h: "/admin/reports" },
            { t: "Settings", h: "/admin/settings" },
          ].map((x) => (
            <Link
              key={x.h}
              href={x.h}
              className="rounded-xl border border-grey-20 p-4 text-sm font-semibold hover:border-secondary-30 hover:bg-secondary-10"
            >
              {x.t}
              <span className="ml-2 text-secondary">→</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function SuperAdminControlDashboard() {
  const q = useAsync(() => superAdminService.getDashboard(), []);
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={q.reload} />;
  const d = q.data ?? {};
  return (
    <div className="space-y-7">
      <Head
        title="Super Admin control center"
        description="Platform-wide governance for organizations, access, subscriptions, analytics and audit."
      />
      <StatGrid
        entries={[
          { label: "Organizations", value: d.organizations },
          { label: "Admins", value: d.admins },
          { label: "Students", value: d.students },
          { label: "Trainers", value: d.trainers },
          { label: "Subscriptions", value: d.subscriptions },
          { label: "Audit events", value: d.auditEvents },
        ]}
      />
      <Card className="p-6">
        <h2 className="font-semibold">Governance flow</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Organizations", h: "/super-admin/organizations" },
            { t: "Roles & permissions", h: "/super-admin/roles" },
            { t: "Admins", h: "/super-admin/admins" },
            { t: "Subscriptions", h: "/super-admin/subscriptions" },
            { t: "Analytics", h: "/super-admin/analytics" },
            { t: "System", h: "/super-admin/system" },
            { t: "Audit logs", h: "/super-admin/audit-logs" },
            { t: "Platform", h: "/super-admin/platform" },
          ].map((x) => (
            <Link
              key={x.h}
              href={x.h}
              className="rounded-xl border border-grey-20 p-4 text-sm font-semibold hover:border-secondary-30 hover:bg-secondary-10"
            >
              {x.t}
              <span className="ml-2 text-secondary">→</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function AdminUsersView() {
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(0);
  const q = useAsync(
    () => adminService.listUsers({ page, size: 20, search: appliedSearch || undefined }),
    [page, appliedSearch],
  );
  const [busy, setBusy] = useState("");
  const toggle = async (id: string, active: boolean) => {
    const action = active ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    setBusy(id);
    try {
      await adminService.updateUserStatus(id, {
        status: active ? "inactive" : "active",
      });
      toast.success("User status updated");
      await q.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy("");
    }
  };
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={q.reload} />;
  const d = q.data as PageResult<AdminUser> | null;
  const rows = (d?.items ?? []).map((u) => [
    <span className="font-semibold">{str(u.fullName)}</span>,
    str(u.email),
    u.roles?.length ? u.roles.join(", ") : str(u.roleTitle),
    <div className="flex flex-wrap gap-1">
      <span className={u.active ? "rounded-full bg-success-10 px-2 py-1 text-xs font-semibold text-success-80" : "rounded-full bg-error/10 px-2 py-1 text-xs font-semibold text-error"}>
        {u.active ? "Active" : "Inactive"}
      </span>
      <span className={u.emailVerified ? "rounded-full bg-success-10 px-2 py-1 text-xs font-semibold text-success-80" : "rounded-full bg-warning/10 px-2 py-1 text-xs font-semibold text-warning-80"}>
        {u.emailVerified ? "Verified" : "Unverified"}
      </span>
    </div>,
    date(u.createdAt),
    <ActionButton
      label={
        busy === u.id
          ? "Saving…"
          : u.active
            ? "Deactivate"
            : "Activate"
      }
      onClick={() => toggle(u.id, u.active)}
    />,
  ]);
  return (
    <div className="space-y-6">
      <Head
        title="User management"
        description="Search users, inspect identity state and control access status."
      />
      <SearchBar
        value={search}
        onChange={setSearch}
        onSubmit={() => {
          setPage(0);
          setAppliedSearch(search.trim());
        }}
        placeholder="Search by name or email"
      />
      <Table
        headers={["User", "Email", "Roles", "Access / email", "Created", "Action"]}
        rows={rows}
      />
      <Pagination page={d?.page ?? 0} totalPages={d?.totalPages ?? 0} onChange={setPage} />
    </div>
  );
}

export function AdminCoursesView() {
  const q = useAsync(() => adminService.listCourses(), []);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "",
    level: "Beginner to Advanced",
    description: "",
    status: "draft",
  });
  const [busy, setBusy] = useState(false);
  const create = async () => {
    if (!form.title.trim()) return toast.error("Course title is required");
    setBusy(true);
    try {
      await adminService.createCourse(form);
      toast.success("Course created");
      setForm({
        title: "",
        category: "",
        level: "Beginner to Advanced",
        description: "",
        status: "draft",
      });
      setOpen(false);
      await q.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  };
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={q.reload} />;
  const rows = ((q.data as PageResult<ApiRecord> | null)?.items ?? []).map(
    (c) => [
      <span className="font-semibold">{str(c.title)}</span>,
      str(c.category),
      str(c.trainer_name),
      str(c.approval_status),
      str(c.status),
      <div className="flex gap-2">
        <ActionButton
          label="Publish"
          onClick={async () => {
            try {
              await adminService.updateCourse(str(c.id), {
                status: "published",
              });
              toast.success("Course published");
              await q.reload();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Update failed");
            }
          }}
        />
        <ActionButton
          label="Delete"
          destructive
          onClick={async () => {
            try {
              await adminService.deleteCourse(str(c.id));
              toast.success("Course deleted");
              await q.reload();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Delete failed");
            }
          }}
        />
      </div>,
    ],
  );
  return (
    <div className="space-y-6">
      <Head
        title="Course management"
        description="Create, publish and retire the platform course catalog."
        action={
          <Button onClick={() => setOpen((v) => !v)}>
            <Plus className="h-4 w-4" />
            New course
          </Button>
        }
      />
      {open && (
        <Card className="p-6">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <Input
              placeholder="Level"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
            />
            <Input
              placeholder="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            />
            <textarea
              className="min-h-28 rounded-lg border border-grey-20 p-3 text-sm md:col-span-2"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={create} disabled={busy}>
              {busy ? "Creating…" : "Create course"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}
      <Table
        headers={[
          "Course",
          "Category",
          "Trainer",
          "Approval",
          "Status",
          "Actions",
        ]}
        rows={rows}
      />
    </div>
  );
}

export function AdminBatchesView() {
  const [page, setPage] = useState(0);
  const q = useAsync(() => adminService.listBatches({ page, size: 20 }), [page]);
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={q.reload} />;
  const d = q.data as PageResult<AdminBatch> | null;
  const rows = (d?.items ?? []).map(
    (b) => [
      <span className="font-semibold">{str(b.name)}</span>,
      str(b.course_title),
      str(b.trainer_name),
      str(b.student_count),
      str(b.status),
      date(b.start_date),
    ],
  );
  return (
    <div className="space-y-6">
      <Head
        title="Batch monitoring"
        description="Monitor cohorts, trainer ownership and learner counts."
        action={<Button variant="outline" onClick={() => q.reload()}><RefreshCw className="h-4 w-4" />Refresh</Button>}
      />
      <Table
        headers={["Batch", "Course", "Trainer", "Students", "Status", "Start"]}
        rows={rows}
      />
      <Pagination page={d?.page ?? 0} totalPages={d?.totalPages ?? 0} onChange={setPage} />
    </div>
  );
}

export function AdminCourseApprovalsView() {
  const q = useAsync(() => adminService.listCourseApprovals(), []);
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={q.reload} />;
  const rows = ((q.data as PageResult<ApiRecord> | null)?.items ?? []).map(
    (c) => [
      <span className="font-semibold">{str(c.title)}</span>,
      str(c.trainer_name),
      str(c.approval_status),
      date(c.created_at),
      <div className="flex gap-2">
        <ActionButton
          label="Approve"
          onClick={async () => {
            try {
              await adminService.decideCourseApproval(str(c.id), {
                decision: "approve",
              });
              toast.success("Course approved");
              await q.reload();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Approval failed");
            }
          }}
        />
        <ActionButton
          label="Reject"
          destructive
          onClick={async () => {
            try {
              await adminService.decideCourseApproval(str(c.id), {
                decision: "reject",
                reason: "Rejected during admin review",
              });
              toast.success("Course rejected");
              await q.reload();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Rejection failed");
            }
          }}
        />
      </div>,
    ],
  );
  return (
    <div className="space-y-6">
      <Head
        title="Course approval"
        description="Review trainer-submitted courses and record the decision."
      />
      <Table
        headers={["Course", "Trainer", "Approval", "Submitted", "Decision"]}
        rows={rows}
      />
    </div>
  );
}

export function AdminAssessmentsView() {
  const q = useAsync(() => adminService.listAssessments(), []);
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={q.reload} />;
  const rows = ((q.data as PageResult<ApiRecord> | null)?.items ?? []).map(
    (a) => [
      <span className="font-semibold">{str(a.title)}</span>,
      str(a.type),
      str(a.trainer_name),
      str(a.batch_name),
      str(a.status),
      date(a.due_at),
      str(a.attempts),
    ],
  );
  return (
    <div className="space-y-6">
      <Head
        title="Assessment monitoring"
        description="Review assessment state, due dates and attempt activity."
      />
      <Table
        headers={[
          "Assessment",
          "Type",
          "Trainer",
          "Batch",
          "Status",
          "Due",
          "Attempts",
        ]}
        rows={rows}
      />
    </div>
  );
}

export function AdminAppealsView() {
  const q = useAsync(() => adminService.listAppeals(), []);
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={q.reload} />;
  const rows = ((q.data as PageResult<ApiRecord> | null)?.items ?? []).map(
    (a) => [
      <span className="font-semibold">{str(a.title)}</span>,
      str(a.student_name),
      str(a.status),
      str(a.reason),
      <div className="flex gap-2">
        <ActionButton
          label="Approve"
          onClick={async () => {
            try {
              await adminService.decideAppeal(str(a.id), {
                decision: "approve",
              });
              toast.success("Appeal approved");
              await q.reload();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Decision failed");
            }
          }}
        />
        <ActionButton
          label="Reject"
          destructive
          onClick={async () => {
            try {
              await adminService.decideAppeal(str(a.id), {
                decision: "reject",
                reason: "Decision recorded by admin",
              });
              toast.success("Appeal rejected");
              await q.reload();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Decision failed");
            }
          }}
        />
      </div>,
    ],
  );
  return (
    <div className="space-y-6">
      <Head
        title="Appeal review"
        description="Review learner appeals and store auditable decisions."
      />
      <Table
        headers={["Appeal", "Student", "Status", "Reason", "Decision"]}
        rows={rows}
      />
    </div>
  );
}

export function AdminReportsView() {
  const q = useAsync(() => adminService.getReports(), []);
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={q.reload} />;
  const d = q.data ?? {};
  return (
    <div className="space-y-6">
      <Head
        title="Reports & analytics"
        description="Operational indicators computed from the platform database."
      />
      <StatGrid
        entries={[
          { label: "Users", value: d.users },
          { label: "Active users", value: d.activeUsers },
          { label: "Courses", value: d.courses },
          { label: "Published", value: d.publishedCourses },
          { label: "Batches", value: d.batches },
          { label: "Enrollments", value: d.enrollments },
          { label: "Assessments", value: d.assessments },
          { label: "Completed attempts", value: d.completedAssessments },
        ]}
      />
      <Card className="p-6">
        <h2 className="font-semibold">Flow</h2>
        <p className="mt-2 text-sm text-grey-60">
          Use this report to monitor adoption, learning delivery and assessment
          completion. Values are live database aggregates.
        </p>
      </Card>
    </div>
  );
}

export function AdminFinanceView() {
  const q = useAsync(
    async () => ({
      summary: await adminService.getFinanceSummary(),
      tx: await adminService.listTransactions(),
    }),
    [],
  );
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={q.reload} />;
  const tx = (q.data?.tx as PageResult<ApiRecord> | null)?.items ?? [];
  return (
    <div className="space-y-6">
      <Head
        title="Finance management"
        description="Monitor transaction counts, volume and status."
      />
      <StatGrid
        entries={[
          { label: "Transactions", value: q.data?.summary.transactionCount },
          { label: "Completed", value: q.data?.summary.completed },
          { label: "Pending", value: q.data?.summary.pending },
          { label: "Revenue", value: q.data?.summary.totalRevenue },
        ]}
      />
      <Table
        headers={["Reference", "Type", "Amount", "Status", "Created"]}
        rows={tx.map((t) => [
          str(t.reference),
          str(t.type),
          str(t.amount),
          str(t.status),
          date(t.created_at),
        ])}
      />
    </div>
  );
}

export function AdminContentView() {
  const q = useAsync(() => adminService.listContent(), []);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    status: "draft",
    body: "",
  });
  const [busy, setBusy] = useState(false);
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={q.reload} />;
  const items = (q.data as PageResult<ApiRecord> | null)?.items ?? [];
  const create = async () => {
    if (!form.title.trim() || !form.slug.trim())
      return toast.error("Title and slug are required");
    setBusy(true);
    try {
      await adminService.createContent(form);
      setForm({ title: "", slug: "", status: "draft", body: "" });
      toast.success("Content created");
      await q.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-6">
      <Head
        title="Content management"
        description="Create and publish platform content."
      />
      <Card className="p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            placeholder="Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <Input
            placeholder="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />
          <textarea
            className="min-h-32 rounded-lg border border-grey-20 p-3 text-sm md:col-span-3"
            placeholder="Body"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
        </div>
        <Button className="mt-4" onClick={create} disabled={busy}>
          {busy ? "Saving…" : "Add content"}
        </Button>
      </Card>
      <Table
        headers={["Title", "Slug", "Status", "Created", "Actions"]}
        rows={items.map((c) => [
          <span className="font-semibold">{str(c.title)}</span>,
          str(c.slug),
          str(c.status),
          date(c.created_at),
          <ActionButton
            label="Delete"
            destructive
            onClick={async () => {
              try {
                await adminService.deleteContent(str(c.id));
                toast.success("Content deleted");
                await q.reload();
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Delete failed");
              }
            }}
          />,
        ])}
      />
    </div>
  );
}

export function AdminSettingsView() {
  const q = useAsync(() => adminService.getSettings(), []);
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    if (q.data)
      setValues(
        Object.fromEntries(
          Object.entries(q.data).map(([k, v]) => [k, str(v, "")]),
        ),
      );
  }, [q.data]);
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={q.reload} />;
  return (
    <div className="space-y-6">
      <Head
        title="System settings"
        description="Edit organization-level runtime settings. Secrets should remain in server environment configuration."
      />
      <Card className="p-6 space-y-3">
        {Object.keys(values).length ? (
          Object.entries(values).map(([k, v]) => (
            <div key={k} className="grid gap-2 md:grid-cols-[220px_1fr]">
              <label className="self-center text-sm font-semibold">{k}</label>
              <Input
                value={v}
                onChange={(e) => setValues({ ...values, [k]: e.target.value })}
              />
            </div>
          ))
        ) : (
          <Empty label="No settings configured yet." />
        )}
        <Button
          onClick={async () => {
            try {
              await adminService.updateSettings(values);
              toast.success("Settings saved");
              await q.reload();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Save failed");
            }
          }}
        >
          <Save className="h-4 w-4" />
          Save settings
        </Button>
      </Card>
    </div>
  );
}

export function SuperOrganizationsView() {
  const q = useAsync(() => superAdminService.listOrganizations(), []);
  const [form, setForm] = useState({ name: "", code: "" });
  const [busy, setBusy] = useState(false);
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={q.reload} />;
  const rows = ((q.data as PageResult<ApiRecord> | null)?.items ?? []).map(
    (o) => [
      <span className="font-semibold">{str(o.name)}</span>,
      str(o.code),
      str(o.status),
      date(o.created_at),
      <div className="flex gap-2">
        <ActionButton
          label="Disable"
          onClick={async () => {
            try {
              await superAdminService.updateOrganizationStatus(str(o.id), {
                status: "inactive",
              });
              toast.success("Organization disabled");
              await q.reload();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Update failed");
            }
          }}
        />
        <ActionButton
          label="Enable"
          onClick={async () => {
            try {
              await superAdminService.updateOrganizationStatus(str(o.id), {
                status: "active",
              });
              toast.success("Organization enabled");
              await q.reload();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Update failed");
            }
          }}
        />
      </div>,
    ],
  );
  return (
    <div className="space-y-6">
      <Head
        title="Organizations"
        description="Create, monitor and govern tenant organizations."
      />
      <Card className="p-5">
        <div className="flex gap-2">
          <Input
            placeholder="Organization name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            placeholder="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await superAdminService.createOrganization(form);
                setForm({ name: "", code: "" });
                toast.success("Organization created");
                await q.reload();
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Create failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </div>
      </Card>
      <Table
        headers={["Organization", "Code", "Status", "Created", "Actions"]}
        rows={rows}
      />
    </div>
  );
}

export function SuperRolesView() {
  const q = useAsync(
    () =>
      Promise.all([
        superAdminService.listRoles(),
        superAdminService.listPermissions(),
      ]),
    [],
  );
  const [form, setForm] = useState({ code: "", name: "", description: "" });
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={q.reload} />;
  const [roles, permissions] = q.data ?? [[], []];
  return (
    <div className="space-y-6">
      <Head
        title="Roles & permissions"
        description="Manage custom roles and permission mappings while Spring Security remains authoritative."
      />
      <Card className="p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Role code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <Input
            placeholder="Role name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <Button
          className="mt-4"
          onClick={async () => {
            try {
              await superAdminService.createRole(form);
              toast.success("Role created");
              setForm({ code: "", name: "", description: "" });
              await q.reload();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Create failed");
            }
          }}
        >
          Create role
        </Button>
      </Card>
      <Table
        headers={["Code", "Name", "System", "Description", "Action"]}
        rows={(roles ?? []).map((r) => [
          str(r.code),
          str(r.name),
          bool(r.is_system_role) ? "Yes" : "No",
          str(r.description),
          !bool(r.is_system_role) ? (
            <ActionButton
              label="Delete"
              destructive
              onClick={async () => {
                try {
                  await superAdminService.deleteRole(str(r.id));
                  toast.success("Role deleted");
                  await q.reload();
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Delete failed");
                }
              }}
            />
          ) : (
            "—"
          ),
        ])}
      />
      <Card className="p-6">
        <h2 className="font-semibold">Available permissions</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(permissions ?? []).map((p) => (
            <div
              key={str(p.id)}
              className="rounded-lg border border-grey-20 p-3"
            >
              <p className="text-sm font-semibold">{str(p.name)}</p>
              <p className="text-xs text-grey-50">{str(p.code)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function SuperAdminsView() {
  const q = useAsync(() => superAdminService.listAdmins(), []);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={q.reload} />;
  const rows = ((q.data as PageResult<ApiRecord> | null)?.items ?? []).map(
    (a) => [
      <span className="font-semibold">{str(a.full_name)}</span>,
      str(a.email),
      bool(a.is_active) ? "Active" : "Inactive",
      date(a.created_at),
      <div className="flex gap-2">
        <ActionButton
          label={bool(a.is_active) ? "Disable" : "Enable"}
          onClick={async () => {
            try {
              await superAdminService.updateAdminStatus(str(a.id), {
                status: bool(a.is_active) ? "inactive" : "active",
              });
              toast.success("Admin status updated");
              await q.reload();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Update failed");
            }
          }}
        />
        <ActionButton
          label="Reset profile"
          onClick={async () => {
            try {
              await superAdminService.updateAdmin(str(a.id), {
                fullName: a.full_name,
                mobile: a.mobile,
              });
              toast.success("Admin saved");
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Save failed");
            }
          }}
        />
      </div>,
    ],
  );
  return (
    <div className="space-y-6">
      <Head
        title="Manage admins"
        description="Provision and manage platform administrators."
      />
      <Card className="p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            placeholder="Temporary password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <Button
          className="mt-4"
          onClick={async () => {
            try {
              await superAdminService.createAdmin(form);
              toast.success("Admin created");
              setForm({ fullName: "", email: "", password: "" });
              await q.reload();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Create failed");
            }
          }}
        >
          Create admin
        </Button>
      </Card>
      <Table
        headers={["Name", "Email", "Status", "Created", "Actions"]}
        rows={rows}
      />
    </div>
  );
}

export function SuperSubscriptionsView() {
  const q = useAsync(() => superAdminService.listSubscriptions(), []);
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={q.reload} />;
  const rows = ((q.data as PageResult<ApiRecord> | null)?.items ?? []).map(
    (s) => [
      str(s.organization_name, s.organization_id as string),
      str(s.plan),
      str(s.status),
      date(s.started_at),
      date(s.ends_at),
      <ActionButton
        label={str(s.status) === "active" ? "Suspend" : "Activate"}
        onClick={async () => {
          try {
            await superAdminService.updateSubscription(str(s.id), {
              status: str(s.status) === "active" ? "suspended" : "active",
            });
            toast.success("Subscription updated");
            await q.reload();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Update failed");
          }
        }}
      />,
    ],
  );
  return (
    <div className="space-y-6">
      <Head
        title="Subscriptions"
        description="Manage organization plan and lifecycle state."
      />
      <Table
        headers={[
          "Organization",
          "Plan",
          "Status",
          "Started",
          "Ends",
          "Action",
        ]}
        rows={rows}
      />
    </div>
  );
}

export function SuperAnalyticsView() {
  const q = useAsync(() => superAdminService.getAnalytics(), []);
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={q.reload} />;
  const d = q.data ?? {};
  return (
    <div className="space-y-6">
      <Head
        title="Platform analytics"
        description="Platform-wide adoption and learning-delivery aggregates."
      />
      <StatGrid
        entries={[
          { label: "Organizations", value: d.organizations },
          { label: "Courses", value: d.courses },
          { label: "Active enrollments", value: d.activeEnrollments },
          { label: "Completed enrollments", value: d.completedEnrollments },
        ]}
      />
      <Card className="p-6">
        <h2 className="font-semibold">Monthly user growth</h2>
        <pre className="mt-3 overflow-auto rounded-lg bg-grey-5 p-4 text-xs">
          {JSON.stringify(d.usersByMonth ?? [], null, 2)}
        </pre>
      </Card>
    </div>
  );
}

function ConfigurationView({ scope }: { scope: "system" | "platform" }) {
  const q = useAsync(
    () =>
      scope === "system"
        ? superAdminService.getSystemConfiguration()
        : superAdminService.getPlatformConfiguration(),
    [scope],
  );
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    if (q.data)
      setValues(
        Object.fromEntries(
          Object.entries(q.data).map(([k, v]) => [k, str(v, "")]),
        ),
      );
  }, [q.data]);
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={q.reload} />;
  const save = async () => {
    try {
      if (scope === "system")
        await superAdminService.updateSystemConfiguration(values);
      else await superAdminService.updatePlatformConfiguration(values);
      toast.success("Configuration saved");
      await q.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };
  return (
    <div className="space-y-6">
      <Head
        title={
          scope === "system" ? "System configuration" : "Platform configuration"
        }
        description="Edit non-secret configuration exposed by the server."
      />
      <Card className="p-6 space-y-3">
        {Object.entries(values).length ? (
          Object.entries(values).map(([k, v]) => (
            <div key={k} className="grid gap-2 md:grid-cols-[240px_1fr]">
              <label className="self-center text-sm font-semibold">{k}</label>
              <Input
                value={v}
                onChange={(e) => setValues({ ...values, [k]: e.target.value })}
              />
            </div>
          ))
        ) : (
          <Empty label="No configuration values saved yet." />
        )}
        <Button onClick={save}>
          <Save className="h-4 w-4" />
          Save
        </Button>
      </Card>
    </div>
  );
}
export function SuperConfigurationView({
  scope,
}: {
  scope: "system" | "platform";
}) {
  return <ConfigurationView scope={scope} />;
}

export function AuditLogsView() {
  const q = useAsync(() => superAdminService.listAuditLogs(), []);
  if (q.loading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={q.reload} />;
  const rows = ((q.data as PageResult<ApiRecord> | null)?.items ?? []).map(
    (a) => [
      date(a.created_at),
      str(a.actor_name),
      str(a.action),
      str(a.resource_type),
      str(a.resource_id),
      str(a.details),
    ],
  );
  return (
    <div className="space-y-6">
      <Head
        title="Audit logs"
        description="Inspect platform governance events recorded on the server."
      />
      <Table
        headers={["Time", "Actor", "Action", "Resource", "ID", "Details"]}
        rows={rows}
      />
    </div>
  );
}

export function ManagementBackLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-semibold text-secondary"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Link>
  );
}

export function ManagementProfileView({ mode }: { mode: "admin" | "super" }) {
  const [data, setData] = useState<ApiRecord | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    import("@/services/user.service")
      .then(({ userService }) => userService.getCurrentUser())
      .then(setData as (v: unknown) => void)
      .catch((e) =>
        toast.error(e instanceof Error ? e.message : "Unable to load profile"),
      )
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <Loading />;
  if (!data) return <ErrorBox error="Profile unavailable." />;
  return (
    <div className="space-y-6">
      <Head
        title={mode === "super" ? "Super Admin Profile" : "Admin Profile"}
        description="Identity information is read from the authenticated backend session."
      />
      <Card className="p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs text-grey-50">Full name</p>
            <p className="mt-1 font-semibold">{str(data.fullName)}</p>
          </div>
          <div>
            <p className="text-xs text-grey-50">Email</p>
            <p className="mt-1 font-semibold">{str(data.email)}</p>
          </div>
          <div>
            <p className="text-xs text-grey-50">Role</p>
            <p className="mt-1 font-semibold">{str(data.role)}</p>
          </div>
          <div>
            <p className="text-xs text-grey-50">Profile complete</p>
            <p className="mt-1 font-semibold">
              {bool(data.profileComplete) ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
export function ManagementNotificationsView({
  mode,
}: {
  mode: "admin" | "super";
}) {
  const [items, setItems] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = () =>
      mode === "admin"
        ? adminService.getNotifications()
        : superAdminService.getNotifications();
    load()
      .then(setItems)
      .catch((e) =>
        toast.error(
          e instanceof Error ? e.message : "Unable to load notifications",
        ),
      )
      .finally(() => setLoading(false));
  }, [mode]);
  if (loading) return <Loading />;
  return (
    <div className="space-y-6">
      <Head
        title="Notifications"
        description="Account and platform alerts for your administrative workspace."
      />
      {items.length ? (
        <div className="space-y-3">
          {items.map((n) => (
            <Card key={str(n.id)} className="p-5">
              <p className="font-semibold">{str(n.title, "Notification")}</p>
              <p className="mt-1 text-sm text-grey-60">{str(n.body, "")}</p>
              <p className="mt-2 text-xs text-grey-50">{date(n.created_at)}</p>
            </Card>
          ))}
        </div>
      ) : (
        <Empty label="No administrative notifications yet." />
      )}
    </div>
  );
}
