"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Download,
  GraduationCap,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { institutionService } from "@/services/institution/institution.service";
import { recruiterService } from "@/services/recruiter/recruiter.service";
import { userService } from "@/services/user.service";
import type { ApiRecord, PageResult } from "@/types/administration";
import type {
  InstitutionDashboardData,
  InstitutionReportsData,
  RecruiterDashboardData,
  RecruiterReportsData,
  StakeholderMetric,
} from "@/types/stakeholder";

const str = (value: unknown, fallback = "—") =>
  value === null || value === undefined || value === "" ? fallback : String(value);

const num = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const date = (value: unknown, withTime = false) => {
  if (!value) return "—";
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleString(undefined, withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" });
};

const downloadBlob = (blob: Blob, filename: string) => {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const statusTone = (status: unknown) => {
  const normalized = str(status, "").toLowerCase();
  if (["active", "published", "hired", "verified", "completed", "live"].includes(normalized)) return "bg-success-10 text-success-80";
  if (["pending", "screening", "interview", "draft"].includes(normalized)) return "bg-warning-10 text-warning-80";
  if (["inactive", "rejected", "suspended", "closed"].includes(normalized)) return "bg-error-10 text-error-80";
  return "bg-grey-5 text-grey-70";
};

function LoadingState() {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-2xl border border-grey-20 bg-white p-8 text-sm text-grey-50">
      <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading workspace data…
    </div>
  );
}

function ErrorState({ error, retry }: { error: string; retry: () => void }) {
  return (
    <Card className="border-error/20 p-8">
      <p className="font-semibold text-error-80">We couldn&apos;t load this workspace.</p>
      <p className="mt-2 text-sm text-grey-60">{error}</p>
      <Button className="mt-4" variant="outline" onClick={retry}>
        <RefreshCw className="h-4 w-4" /> Try again
      </Button>
    </Card>
  );
}

function EmptyState({ title, description, href, action }: { title: string; description: string; href?: string; action?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-grey-20 bg-grey-5 p-8 text-center">
      <p className="font-semibold text-primary">{title}</p>
      <p className="mx-auto mt-2 max-w-lg text-sm text-grey-60">{description}</p>
      {href && action ? (
        <Link href={href} className="mt-4 inline-flex">
          <Button>{action}</Button>
        </Link>
      ) : null}
    </div>
  );
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">{eyebrow}</p> : null}
        <h1 className="mt-1 font-display text-3xl font-bold text-primary sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-grey-60">{description}</p>
      </div>
      {action}
    </div>
  );
}

function MetricGrid({ metrics }: { metrics: StakeholderMetric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.id} className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-grey-50">{metric.label}</p>
              <p className="mt-2 font-display text-3xl font-bold text-primary">{metric.value === null ? "—" : metric.value.toLocaleString()}</p>
            </div>
            <span className="rounded-xl bg-secondary-10 p-2 text-secondary"><ShieldCheck className="h-4 w-4" /></span>
          </div>
          {metric.helperText ? <p className="mt-2 text-xs text-grey-50">{metric.helperText}</p> : null}
          {metric.trendPercent !== undefined && metric.trendPercent !== null ? <p className="mt-2 text-xs font-semibold text-secondary">{metric.trendPercent > 0 ? "+" : ""}{metric.trendPercent}%</p> : null}
        </Card>
      ))}
    </div>
  );
}

function DataTable({ headers, rows, minWidth = "min-w-[860px]" }: { headers: string[]; rows: ReactNode[][]; minWidth?: string }) {
  if (!rows.length) return <EmptyState title="No records yet" description="The backend returned no records for this view. Once the relevant workflow is used, data will appear here automatically." />;
  return (
    <Card className="overflow-x-auto">
      <table className={`w-full ${minWidth} border-collapse text-sm`}>
        <thead>
          <tr className="border-b border-grey-20 bg-grey-5 text-left text-xs font-semibold uppercase tracking-wide text-grey-50">
            {headers.map((header) => <th key={header} className="px-4 py-3">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-grey-20 last:border-0 hover:bg-grey-5/70">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-4 align-top">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function SectionTitle({ title, href, actionLabel = "View all" }: { title: string; href?: string; actionLabel?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="font-display text-xl font-bold text-primary">{title}</h2>
      {href ? <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline">{actionLabel}<ArrowRight className="h-4 w-4" /></Link> : null}
    </div>
  );
}

function HorizontalBars({ rows, labelKey = "label", valueKey = "value" }: { rows: ApiRecord[]; labelKey?: string; valueKey?: string }) {
  const max = Math.max(...rows.map((row) => num(row[valueKey]) ?? 0), 1);
  if (!rows.length) return <EmptyState title="No analytics yet" description="Analytics will populate after enough platform activity has been recorded." />;
  return (
    <div className="space-y-4">
      {rows.map((row, index) => {
        const value = num(row[valueKey]) ?? 0;
        const width = Math.max(0, Math.min(100, (value / max) * 100));
        return (
          <div key={`${str(row[labelKey])}-${index}`}>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-semibold text-primary">{str(row[labelKey])}</span>
              <span className="text-grey-60">{Number.isInteger(value) ? value : value.toFixed(1)}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-grey-20">
              <div className="h-2 rounded-full bg-secondary transition-[width] duration-300" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WorkspaceLinkGrid({ links }: { links: { label: string; href: string; icon: ReactNode; description: string }[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="group">
          <Card className="h-full p-5 transition group-hover:-translate-y-0.5 group-hover:border-secondary-30 group-hover:shadow-card-hover">
            <div className="flex items-start justify-between gap-4">
              <span className="rounded-xl bg-secondary-10 p-2 text-secondary">{link.icon}</span>
              <ArrowRight className="h-4 w-4 text-grey-40 transition group-hover:translate-x-0.5 group-hover:text-secondary" />
            </div>
            <p className="mt-5 font-semibold text-primary">{link.label}</p>
            <p className="mt-1 text-sm text-grey-60">{link.description}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function useAsync<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await loader());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, deps);
  useEffect(() => { void reload(); }, [reload]);
  return { data, loading, error, reload };
}

function organizationNeedsSetup(data: InstitutionDashboardData) {
  return !data.configured || !data.organization;
}

export function InstitutionDashboardView() {
  const query = useAsync(() => institutionService.getDashboard(), []);
  if (query.loading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} retry={query.reload} />;
  const data = query.data as InstitutionDashboardData;

  if (organizationNeedsSetup(data)) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Institution workspace" title="Institution dashboard" description="Manage structured employability programs, learner outcomes and placement readiness from one operational workspace." />
        <Card className="border-secondary-20 bg-secondary-10/30 p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white p-3 text-secondary shadow-card"><Building2 className="h-6 w-6" /></div>
            <div>
              <h2 className="font-display text-xl font-bold">Organization setup required</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-grey-60">Your authenticated institution account is not currently linked to an organization. Ask a platform administrator to assign the organization before student, trainer and batch data can be shown.</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Institution workspace" title={data.organization?.name ?? "Institution dashboard"} description="Track employability delivery, learner participation, trainer coverage and placement outcomes using live platform data." action={<span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(data.organization?.status)}`}>{str(data.organization?.status)}</span>} />
      <MetricGrid metrics={data.metrics} />
      <WorkspaceLinkGrid links={[
        { label: "Programs", href: "/institution/programs", icon: <GraduationCap className="h-5 w-5" />, description: "Manage institution-linked employability programs." },
        { label: "Learners", href: "/institution/students", icon: <Users className="h-5 w-5" />, description: "Review learner participation and progress." },
        { label: "Trainers", href: "/institution/trainers", icon: <UserRound className="h-5 w-5" />, description: "See trainer coverage across programs." },
        { label: "Placements", href: "/institution/placements", icon: <Briefcase className="h-5 w-5" />, description: "Track verified talent outcomes." },
      ]} />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6"><SectionTitle title="Learner progress by program" href="/institution/reports" /><div className="mt-5"><HorizontalBars rows={data.courseProgress} labelKey="courseTitle" valueKey="progressPercent" /></div></Card>
        <Card className="p-6"><SectionTitle title="Recent enrollment activity" href="/institution/students" /><div className="mt-5 space-y-3">{data.recentEnrollments.length ? data.recentEnrollments.map((row, index) => <div key={String(row.id ?? index)} className="rounded-xl border border-grey-20 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-primary">{str(row.studentName)}</p><p className="mt-1 text-sm text-grey-60">{str(row.courseTitle)}</p></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone(row.status)}`}>{str(row.status)}</span></div><p className="mt-2 text-xs text-grey-50">{date(row.enrolledAt)}</p></div>) : <EmptyState title="No recent enrollments" description="New learner enrollments will appear here." />}</div></Card>
      </div>
      <Card className="p-6"><SectionTitle title="Recent batches" href="/institution/batches" /><div className="mt-5"><DataTable headers={["Batch","Program","Trainer","Learners","Status","Schedule"]} rows={data.recentBatches.map((row, index) => [<span key={index} className="font-semibold">{str(row.name)}</span>, str(row.courseTitle), str(row.trainerName), str(row.studentCount), <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone(row.status)}`}>{str(row.status)}</span>, `${date(row.startDate)}${row.endDate ? ` → ${date(row.endDate)}` : ""}`])} /></div></Card>
    </div>
  );
}

export function InstitutionProgramsView() {
  const query = useAsync(() => institutionService.listPrograms(), []);
  const [form, setForm] = useState({ title: "", category: "", level: "", description: "" });
  const [saving, setSaving] = useState(false);
  if (query.loading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} retry={query.reload} />;
  const data = query.data as PageResult<ApiRecord>;
  const rows = data.items.map((row) => [<span key={str(row.id)} className="font-semibold">{str(row.title)}</span>, str(row.category), str(row.trainerName), str(row.batchCount), <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone(row.status)}`}>{str(row.status)}</span>, date(row.updatedAt)]);
  const create = async () => {
    if (!form.title.trim()) return toast.error("Program title is required.");
    setSaving(true);
    try { await institutionService.createProgram(form); toast.success("Program created."); setForm({ title: "", category: "", level: "", description: "" }); await query.reload(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to create program."); }
    finally { setSaving(false); }
  };
  return <div className="space-y-6"><PageHeader title="Programs" description="Create and manage employability programs linked to your institution. Trainer assignment and student delivery remain API-controlled." action={<Button onClick={create} disabled={saving}><Save className="h-4 w-4" />{saving ? "Saving…" : "Create program"}</Button>} /><Card className="p-6"><div className="grid gap-3 md:grid-cols-2"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Program title" /><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" /><Input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="Level" /><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-28 rounded-lg border border-grey-20 p-3 text-sm md:col-span-2" placeholder="Program description" /></div></Card><DataTable headers={["Program","Category","Trainer","Batches","Status","Updated"]} rows={rows} /></div>;
}

export function InstitutionStudentsView() {
  const [search, setSearch] = useState("");
  const query = useAsync(() => institutionService.listStudents({ search: search || undefined }), [search]);
  if (query.loading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} retry={query.reload} />;
  const data = query.data as PageResult<ApiRecord>;
  return <div className="space-y-6"><PageHeader title="Students" description="Monitor student participation, attendance, progress and assessment readiness across institution-linked cohorts." /><div className="flex max-w-xl gap-2"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by student name or email" /><Button variant="outline" onClick={query.reload}><Search className="h-4 w-4" />Search</Button></div><DataTable headers={["Student","Email","Program","Batch","Progress","Assessment","Status"]} rows={data.items.map((row) => [<span className="font-semibold" key={str(row.id)}>{str(row.fullName)}</span>, str(row.email), str(row.courseTitle), str(row.batchName), `${str(row.progressPercent, "0")}%`, str(row.assessmentScore), <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone(row.status)}`}>{str(row.status)}</span>])} /></div>;
}

export function InstitutionTrainersView() {
  const query = useAsync(() => institutionService.listTrainers(), []);
  if (query.loading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} retry={query.reload} />;
  const data = query.data as PageResult<ApiRecord>;
  return <div className="space-y-6"><PageHeader title="Trainers" description="Review trainer coverage, assigned programs and learner load across the institution." /><DataTable headers={["Trainer","Email","Programs","Batches","Active learners","Status"]} rows={data.items.map((row) => [<span className="font-semibold" key={str(row.id)}>{str(row.fullName)}</span>, str(row.email), str(row.programCount), str(row.batchCount), str(row.studentCount), <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone(row.status)}`}>{str(row.status)}</span>])} /></div>;
}

export function InstitutionBatchesView() {
  const query = useAsync(() => institutionService.listBatches(), []);
  if (query.loading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} retry={query.reload} />;
  const data = query.data as PageResult<ApiRecord>;
  return <div className="space-y-6"><PageHeader title="Batches" description="See institution-linked cohorts, trainer assignment, learner counts and delivery status." /><DataTable headers={["Batch","Program","Trainer","Students","Start","End","Status"]} rows={data.items.map((row) => [<span key={str(row.id)} className="font-semibold">{str(row.name)}</span>, str(row.courseTitle), str(row.trainerName), str(row.studentCount), date(row.startDate), date(row.endDate), <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone(row.status)}`}>{str(row.status)}</span>])} /></div>;
}

export function InstitutionReportsView() {
  const query = useAsync(() => institutionService.getReports(), []);
  const [exporting, setExporting] = useState(false);
  if (query.loading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} retry={query.reload} />;
  const data = query.data as InstitutionReportsData;
  const exportReport = async () => {
    setExporting(true);
    try {
      const blob = await institutionService.exportReports({ format: "csv" });
      downloadBlob(blob, "institution-report.csv");
      toast.success("Report exported");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };
  return <div className="space-y-6"><PageHeader title="Reports & outcomes" description="Understand learner progress and institutional employability delivery using aggregated backend metrics." action={<Button variant="outline" disabled={exporting} onClick={exportReport}><Download className="h-4 w-4" />{exporting ? "Exporting…" : "Export report"}</Button>} /><MetricGrid metrics={data.summary} /><div className="grid gap-6 xl:grid-cols-2"><Card className="p-6"><SectionTitle title="Program performance" /><div className="mt-5"><HorizontalBars rows={data.coursePerformance} labelKey="courseTitle" valueKey="averageProgress" /></div></Card><Card className="p-6"><SectionTitle title="Monthly enrollment" /><div className="mt-5"><HorizontalBars rows={data.monthlyEnrollment} labelKey="month" valueKey="enrollments" /></div></Card></div></div>;
}

export function InstitutionPlacementsView() {
  const query = useAsync(() => institutionService.listPlacements(), []);
  if (query.loading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} retry={query.reload} />;
  const data = query.data as PageResult<ApiRecord>;
  return <div className="space-y-6"><PageHeader title="Placements" description="Track verified employment outcomes for learners connected to recruiter workflows." /><DataTable headers={["Student","Role","Recruiter","Status","Applied","Updated"]} rows={data.items.map((row) => [<span key={str(row.id)} className="font-semibold">{str(row.studentName)}</span>, str(row.jobTitle), str(row.recruiterName), <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone(row.status)}`}>{str(row.status)}</span>, date(row.appliedAt), date(row.updatedAt)])} /></div>;
}

export function RecruiterDashboardView() {
  const query = useAsync(() => recruiterService.getDashboard(), []);
  if (query.loading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} retry={query.reload} />;
  const data = query.data as RecruiterDashboardData;
  return <div className="space-y-7"><PageHeader eyebrow="Talent workspace" title="Recruiter dashboard" description="Discover verified talent, manage open roles and move candidates through a transparent hiring workflow." /><MetricGrid metrics={data.metrics} /><WorkspaceLinkGrid links={[{label:"Discover Talent",href:"/recruiter/talent",icon:<Users className="h-5 w-5"/>,description:"Search candidates backed by measurable competencies."},{label:"Shortlists",href:"/recruiter/shortlists",icon:<CheckCircle2 className="h-5 w-5"/>,description:"Keep a focused set of candidates for active hiring."},{label:"Jobs",href:"/recruiter/jobs",icon:<Briefcase className="h-5 w-5"/>,description:"Create and manage hiring opportunities."},{label:"Hiring Pipeline",href:"/recruiter/pipeline",icon:<ClipboardCheck className="h-5 w-5"/>,description:"Track candidate movement from screening to hire."}]} /><div className="grid gap-6 xl:grid-cols-[1fr_1fr]"><Card className="p-6"><SectionTitle title="Verified candidate matches" href="/recruiter/talent" /><div className="mt-5"><DataTable headers={["Candidate","Institution","Readiness","Progress","Verified"]} rows={data.recentCandidates.map((row,index)=>[<span key={index} className="font-semibold">{str(row.fullName)}</span>,str(row.organizationName),str(row.readinessScore),`${str(row.progressPercent,"0")}%`,<span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone(row.verifiedStatus)}`}>{str(row.verifiedStatus)} </span>])} minWidth="min-w-[640px]" /></div></Card><Card className="p-6"><SectionTitle title="Hiring pipeline" href="/recruiter/pipeline" /><div className="mt-5 space-y-3">{data.pipeline.length ? data.pipeline.map((row,index)=><div key={String(row.stage ?? index)} className="flex items-center justify-between rounded-xl border border-grey-20 p-4"><div><p className="font-semibold">{str(row.stage)}</p><p className="mt-1 text-sm text-grey-60">{str(row.count)} candidates</p></div><ArrowRight className="h-4 w-4 text-grey-40" /></div>) : <EmptyState title="Pipeline is empty" description="Applications will be visible once candidates begin entering your hiring workflows." />}</div></Card></div><Card className="p-6"><SectionTitle title="Recent jobs" href="/recruiter/jobs" /><div className="mt-5"><DataTable headers={["Role","Openings","Applications","Status","Created"]} rows={data.recentJobs.map((row,index)=>[<span key={index} className="font-semibold">{str(row.title)}</span>,str(row.openings),str(row.applicationCount),<span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone(row.status)}`}>{str(row.status)}</span>,date(row.createdAt)])} /></div></Card></div>;
}

export function RecruiterTalentView() {
  const [search, setSearch] = useState("");
  const query = useAsync(() => recruiterService.searchTalent({ search: search || undefined }), [search]);
  const [busy, setBusy] = useState("");
  if (query.loading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} retry={query.reload} />;
  const data = query.data;
  const shortlist = async (studentId: string) => { setBusy(studentId); try { await recruiterService.addShortlist({ studentId }); toast.success("Candidate added to shortlist."); await query.reload(); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to shortlist candidate."); } finally { setBusy(""); } };
  return <div className="space-y-6"><PageHeader title="Discover Talent" description="Search across verified learner profiles using measured readiness, assessment performance and learning progress." /><div className="flex max-w-xl gap-2"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidates, skills or institutions" /><Button variant="outline" onClick={query.reload}><Search className="h-4 w-4" />Search</Button></div><DataTable headers={["Candidate","Institution","Readiness","Progress","Assessment","Verification","Action"]} rows={(data?.items ?? []).map((row) => [<span key={str(row.id)} className="font-semibold">{str(row.fullName)}</span>, str(row.organizationName), str(row.readinessScore), `${str(row.progressPercent,"0")}%`, str(row.assessmentScore), <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone(row.verifiedStatus)}`}>{str(row.verifiedStatus)}</span>, <Button size="sm" disabled={busy === str(row.id)} onClick={() => shortlist(str(row.id))}>{busy === str(row.id) ? "Adding…" : "Shortlist"}</Button>])} /></div>;
}

export function RecruiterShortlistsView() {
  const query = useAsync(() => recruiterService.listShortlists(), []);
  if (query.loading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} retry={query.reload} />;
  const data = query.data;
  return <div className="space-y-6"><PageHeader title="Shortlists" description="Review candidates you have saved for future or active hiring opportunities." /><DataTable headers={["Candidate","Institution","Readiness","Note","Added","Action"]} rows={(data?.items ?? []).map((row) => [<span key={str(row.studentId)} className="font-semibold">{str(row.fullName)}</span>, str(row.organizationName), str(row.readinessScore), str(row.notes), date(row.createdAt), <Button size="sm" variant="outline" onClick={async () => { try { await recruiterService.removeShortlist(str(row.studentId)); toast.success("Candidate removed."); await query.reload(); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to remove candidate."); } }}>Remove</Button>])} /></div>;
}

export function RecruiterJobsView() {
  const query = useAsync(() => recruiterService.listJobs(), []);
  const [form, setForm] = useState({ title: "", description: "", location: "", openings: "", status: "open" });
  const [saving, setSaving] = useState(false);
  if (query.loading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} retry={query.reload} />;
  const data = query.data;
  const create = async () => { if (!form.title.trim()) return toast.error("Job title is required."); setSaving(true); try { await recruiterService.createJob({ ...form, openings: form.openings ? Number(form.openings) : null }); toast.success("Job created."); setForm({ title: "", description: "", location: "", openings: "", status: "open" }); await query.reload(); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to create job."); } finally { setSaving(false); } };
  return <div className="space-y-6"><PageHeader title="Jobs" description="Create role openings and keep their lifecycle connected to your hiring pipeline." action={<Button onClick={create} disabled={saving}><Save className="h-4 w-4" />{saving ? "Saving…" : "Create job"}</Button>} /><Card className="p-6"><div className="grid gap-3 md:grid-cols-2"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Job title" /><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" /><Input value={form.openings} onChange={(e) => setForm({ ...form, openings: e.target.value })} type="number" min="1" placeholder="Openings" /><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border border-grey-20 bg-white px-3 py-2.5 text-sm"><option value="open">Open</option><option value="paused">Paused</option><option value="closed">Closed</option></select><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-28 rounded-lg border border-grey-20 p-3 text-sm md:col-span-2" placeholder="Role description" /></div></Card><DataTable headers={["Role","Location","Openings","Applications","Status","Updated"]} rows={(data?.items ?? []).map((row) => [<span key={str(row.id)} className="font-semibold">{str(row.title)}</span>, str(row.location), str(row.openings), str(row.applicationCount), <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone(row.status)}`}>{str(row.status)}</span>, date(row.updatedAt)])} /></div>;
}

export function RecruiterPipelineView() {
  const query = useAsync(() => recruiterService.listPipeline(), []);
  if (query.loading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} retry={query.reload} />;
  const data = query.data;
  const stages = ["applied", "screening", "interview", "offered", "hired", "rejected"];
  return <div className="space-y-6"><PageHeader title="Hiring Pipeline" description="Move candidates through a transparent sequence from application to verified employment outcome." /><DataTable headers={["Candidate","Role","Institution","Stage","Applied","Updated","Action"]} rows={(data?.items ?? []).map((row) => [<span key={str(row.id)} className="font-semibold">{str(row.studentName)}</span>, str(row.jobTitle), str(row.organizationName), <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone(row.status)}`}>{str(row.status)}</span>, date(row.appliedAt), date(row.updatedAt), <select value={str(row.status, "applied")} onChange={async (e) => { try { await recruiterService.updatePipelineStatus(str(row.id), { status: e.target.value }); toast.success("Pipeline stage updated."); await query.reload(); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update stage."); } }} className="rounded-lg border border-grey-20 bg-white px-2.5 py-2 text-xs"><option value="">Select stage</option>{stages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}</select>])} /></div>;
}

export function RecruiterReportsView() {
  const query = useAsync(() => recruiterService.getReports(), []);
  const [exporting, setExporting] = useState(false);
  if (query.loading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} retry={query.reload} />;
  const data = query.data as RecruiterReportsData;
  const exportReport = async () => {
    setExporting(true);
    try {
      const blob = await recruiterService.exportReports({ format: "csv" });
      downloadBlob(blob, "recruitment-report.csv");
      toast.success("Report exported");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };
  return <div className="space-y-6"><PageHeader title="Recruiter reports" description="Review candidate movement, hiring outcomes and recent application trends without synthetic dashboard data." action={<Button variant="outline" disabled={exporting} onClick={exportReport}><Download className="h-4 w-4" />{exporting ? "Exporting…" : "Export report"}</Button>} /><MetricGrid metrics={data.summary} /><div className="grid gap-6 xl:grid-cols-2"><Card className="p-6"><SectionTitle title="Pipeline by stage" /><div className="mt-5"><HorizontalBars rows={data.pipelineByStage} labelKey="stage" valueKey="count" /></div></Card><Card className="p-6"><SectionTitle title="Applications by month" /><div className="mt-5"><HorizontalBars rows={data.applicationsByMonth} labelKey="month" valueKey="applications" /></div></Card></div></div>;
}

export function WorkspaceProfileView({ workspace }: { workspace: "Institution" | "Recruiter" }) {
  const query = useAsync(() => userService.getCurrentUser(), []);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (query.data) setForm({ fullName: str(query.data.fullName, ""), mobile: str(query.data.mobile, ""), roleTitle: str(query.data.roleTitle, ""), about: str(query.data.about, "") }); }, [query.data]);
  if (query.loading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} retry={query.reload} />;
  const save = async () => { setSaving(true); try { await userService.updateProfile(form); toast.success("Profile updated."); await query.reload(); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update profile."); } finally { setSaving(false); } };
  return <div className="space-y-6"><PageHeader title={`${workspace} profile`} description="Keep the authenticated account and professional context current. The server remains the source of truth for identity and access." /><Card className="p-6"><div className="flex items-center gap-4 border-b border-grey-20 pb-5"><div className="grid h-14 w-14 place-items-center rounded-full bg-secondary-10 text-secondary"><UserRound className="h-6 w-6" /></div><div><p className="font-semibold text-primary">{str(query.data?.fullName)}</p><p className="text-sm text-grey-50">{str(query.data?.email)}</p></div></div><div className="mt-6 grid gap-4 md:grid-cols-2"><Input value={form.fullName ?? ""} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full name" /><Input value={form.mobile ?? ""} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="Mobile" /><Input value={form.roleTitle ?? ""} onChange={(e) => setForm({ ...form, roleTitle: e.target.value })} placeholder="Role title" /><Input value={query.data?.email ?? ""} disabled placeholder="Email" /><textarea value={form.about ?? ""} onChange={(e) => setForm({ ...form, about: e.target.value })} className="min-h-32 rounded-lg border border-grey-20 p-3 text-sm md:col-span-2" placeholder="About you or your role" /></div><Button className="mt-5" disabled={saving} onClick={save}><Save className="h-4 w-4" />{saving ? "Saving…" : "Save profile"}</Button></Card></div>;
}

export function WorkspaceNotificationsView({ workspace, loader }: { workspace: string; loader: () => Promise<ApiRecord[]> }) {
  const query = useAsync(loader, [loader]);
  if (query.loading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} retry={query.reload} />;
  const items = query.data ?? [];
  return <div className="space-y-6"><PageHeader title={`${workspace} notifications`} description="Operational alerts and workflow updates for your workspace." />{items.length ? <div className="space-y-3">{items.map((item, index) => <Card key={str(item.id, String(index))} className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-primary">{str(item.title, "Notification")}</p><p className="mt-1 text-sm leading-6 text-grey-60">{str(item.body, "")}</p></div><span className="rounded-full bg-secondary-10 px-2.5 py-1 text-[11px] font-semibold text-secondary">{item.read ? "Read" : "New"}</span></div><p className="mt-3 text-xs text-grey-50">{date(item.createdAt ?? item.created_at, true)}</p></Card>)}</div> : <EmptyState title="No notifications" description="New workspace notifications will appear here." />}</div>;
}
