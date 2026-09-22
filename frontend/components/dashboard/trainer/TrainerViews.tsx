"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Download,
  Radio,
  Video,
  MessageSquare,
  Megaphone,
  UserPlus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trainerService } from "@/services/trainer/trainer.service";
import type {
  TrainerAssessment,
  TrainerAssessmentsData,
  TrainerBatchDetail,
  TrainerCourse,
  TrainerDashboardData,
  TrainerLiveClassData,
  TrainerMetric,
  TrainerReportsData,
  TrainerStudentsData,
} from "@/types/trainer";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
const formatTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-grey-20 bg-grey-5 p-8 text-center text-sm text-grey-50">
      {label}
    </div>
  );
}
function PageHead({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
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
function MetricCards({ items }: { items: TrainerMetric[] }) {
  if (!items.length) return <Empty label="No summary metrics available." />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.id} className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-grey-50">
            {item.label}
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-primary">
            {item.value}
          </p>
          {item.helperText && (
            <p className="mt-1 text-xs text-grey-50">{item.helperText}</p>
          )}
          {item.trend !== undefined && (
            <p
              className={`mt-2 text-xs font-semibold ${item.trend >= 0 ? "text-success-70" : "text-error"}`}
            >
              {item.trend > 0 ? "+" : ""}
              {item.trend}%
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
const quickActions = [
  {
    label: "Create Classes",
    href: "/trainer/live-classes",
    icon: CalendarDays,
  },
  { label: "Start Live Class", href: "/trainer/live-classes", icon: Radio },
  {
    label: "Create Assessment",
    href: "/trainer/assessments",
    icon: ClipboardCheck,
  },
  { label: "View Reports", href: "/trainer/reports", icon: BarChart3 },
] as const;
export function TrainerDashboardView({ data }: { data: TrainerDashboardData }) {
  return (
    <div className="space-y-7">
      <PageHead
        title="Dashboard"
        description={`Welcome back, ${data.welcomeName}. Here is your training summary.`}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map(({ label, href, icon: Icon }) => (
          <Link key={label} href={href}>
            <Card className="flex h-full min-h-32 flex-col items-center justify-center gap-3 p-5 transition hover:border-secondary-30 hover:shadow-card-hover">
              <span className="rounded-lg bg-secondary-10 p-3 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">{label}</span>
            </Card>
          </Link>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Schedule title="Today’s Schedule" items={data.todaySchedule} />
        <Schedule title="Upcoming Classes" items={data.upcomingClasses} />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="font-semibold">Students Summary</h2>
          <div className="mt-4">
            <MetricCards items={data.studentMetrics} />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Assessment Overview</h2>
          <div className="mt-4">
            <MetricCards items={data.assessmentMetrics} />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Recent Activities</h2>
          <div className="mt-4 space-y-3">
            {data.recentActivities.length ? (
              data.recentActivities.map((a) => (
                <div
                  key={a.id}
                  className="border-b border-grey-20 pb-3 last:border-0"
                >
                  <p className="text-sm">
                    <b>{a.actorName}</b> {a.description}
                  </p>
                  <p className="mt-1 text-xs text-grey-50">
                    {formatDate(a.occurredAt)} · {formatTime(a.occurredAt)}
                  </p>
                </div>
              ))
            ) : (
              <Empty label="No recent activity." />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
function Schedule({
  title,
  items,
}: {
  title: string;
  items: TrainerDashboardData["todaySchedule"];
}) {
  return (
    <Card className="p-5">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border-b border-grey-20 pb-3 last:border-0"
            >
              <span className="text-xs font-semibold text-primary">
                {formatTime(item.startsAt)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-grey-50">
                  {item.batchName} · {formatDate(item.startsAt)}
                </p>
              </div>
              <span className="rounded-full bg-secondary-10 px-2 py-1 text-[10px] font-semibold text-secondary-90">
                {item.status}
              </span>
            </div>
          ))
        ) : (
          <Empty label="No classes scheduled." />
        )}
      </div>
    </Card>
  );
}
export function TrainerCoursesView({ items }: { items: TrainerCourse[] }) {
  return (
    <div className="space-y-7">
      <PageHead
        title="My Courses"
        description="Manage and organize your training programs."
        action={<Button asChild><Link href="/trainer/courses/new">Create New Course</Link></Button>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Study Materials", icon: BookOpen },
          { label: "Record Sessions", icon: Video },
          { label: "Course Discussions", icon: MessageSquare },
        ].map(({ label, icon: Icon }) => (
          <Card key={label} className="bg-secondary-10 p-5">
            <Icon className="h-9 w-9 rounded-lg bg-primary p-2 text-white" />
            <p className="mt-4 font-semibold">{label}</p>
          </Card>
        ))}
      </div>
      {items.length ? (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-grey-20">
                <th className="p-4">Course</th>
                <th>Students</th>
                <th>Batches</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-grey-20 last:border-0"
                >
                  <td className="p-4 font-medium">{c.title}</td>
                  <td>{c.studentCount}</td>
                  <td>{c.batchCount}</td>
                  <td>{c.status}</td>
                  <td><Button size="sm" variant="outline" asChild><Link href={`/trainer/courses/${encodeURIComponent(c.id)}`}>Open</Link></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <Empty label="No courses available." />
      )}
    </div>
  );
}
export function TrainerLiveClassesView({
  data,
}: {
  data: TrainerLiveClassData;
}) {
  return (
    <div className="space-y-7">
      <PageHead
        title="Live Classes"
        description="Manage and monitor ongoing and upcoming live sessions."
        action={<Button asChild><Link href="/trainer/live-classes/new">Create Live Class</Link></Button>}
      />
      {data.currentClass ? (
        <Card className="border-l-4 border-l-secondary p-6">
          <p className="text-xs font-semibold text-error">Currently live</p>
          <h2 className="mt-2 text-xl font-bold">{data.currentClass.title}</h2>
          <p className="text-sm text-grey-50">
            {data.currentClass.batchName} ·{" "}
            {formatTime(data.currentClass.startsAt)}
          </p>
          <p className="mt-4 text-sm font-semibold">
            {data.currentClass.joinedStudentCount} students joined
          </p>
          {data.currentClass.roomUrl && (
            <Button className="mt-4" asChild>
              <Link href={data.currentClass.roomUrl}>Enter Live Room</Link>
            </Button>
          )}
        </Card>
      ) : (
        <Empty label="No class is live right now." />
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        <Schedule title="Upcoming Schedule" items={data.upcomingSchedule} />
        <Card className="p-5">
          <h2 className="font-semibold">Recordings</h2>
          <div className="mt-4 space-y-3">
            {data.recordings.length ? (
              data.recordings.map((r) => (
                <div key={r.id} className="rounded-xl bg-secondary-10 p-3">
                  <p className="text-sm font-semibold">{r.title}</p>
                  <p className="text-xs text-grey-50">
                    {formatDate(r.recordedAt)} · {r.durationMinutes} min
                  </p>
                </div>
              ))
            ) : (
              <Empty label="No recordings available." />
            )}
          </div>
        </Card>
      </div>
      <MetricCards items={data.reportMetrics} />
    </div>
  );
}
export function TrainerStudentsView({ data }: { data: TrainerStudentsData }) {
  return (
    <div className="space-y-7">
      <PageHead
        title="Student Management"
        description="Track student progress, performance, and engagement."
        action={
          <Button>
            <UserPlus className="h-4 w-4" />
            Add Student
          </Button>
        }
      />
      <MetricCards items={data.metrics} />
      {data.students.length ? (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-grey-20">
                <th className="p-4">Student Name</th>
                <th>Batch</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-grey-20 last:border-0"
                >
                  <td className="p-4 font-medium">{student.name}</td>
                  <td>{student.batchName}</td>
                  <td>
                    <Link
                      className="text-secondary hover:underline"
                      href={
                        student.profileUrl ??
                        `/trainer/students/${encodeURIComponent(student.id)}`
                      }
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <Empty label="No assigned students." />
      )}
    </div>
  );
}
export function TrainerAssessmentsView({
  data,
}: {
  data: TrainerAssessmentsData;
}) {
  return (
    <div className="space-y-7">
      <PageHead
        title="Assessments"
        description="Control center for evaluations, grading, and student feedback."
        action={<Button asChild><Link href="/trainer/assessments/new">Create Assessment</Link></Button>}
      />
      <MetricCards items={data.metrics} />
      {data.assessments.length ? (
        <AssessmentTable items={data.assessments} />
      ) : (
        <Empty label="No assessments available." />
      )}
    </div>
  );
}
function AssessmentTable({ items }: { items: TrainerAssessment[] }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead>
          <tr className="border-b border-grey-20">
            <th className="p-4">Assessment</th>
            <th>Type</th>
            <th>Batch</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id} className="border-b border-grey-20 last:border-0">
              <td className="p-4 font-medium">{a.title}</td>
              <td>{a.type}</td>
              <td>{a.batchName}</td>
              <td>{formatDate(a.dueAt)}</td>
              <td>{a.status}</td>
              <td><Link href={`/trainer/assessments/${encodeURIComponent(a.id)}`} className="text-secondary">Open</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
export function TrainerReportsView({ data }: { data: TrainerReportsData }) {
  const [exporting, setExporting] = useState(false);
  return (
    <div className="space-y-7">
      <PageHead
        title="Reports"
        description="Class performance, attendance, and engagement at a glance."
        action={
          <Button disabled={exporting} onClick={async()=>{setExporting(true);try{const blob=await trainerService.exportReport({});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="trainer-report.csv";a.click();URL.revokeObjectURL(url);toast.success("Report exported")}catch(e){toast.error(e instanceof Error?e.message:"Export failed")}finally{setExporting(false)}}}>
            <Download className="h-4 w-4" />
            {exporting?"Exporting…":"Export Data"}
          </Button>
        }
      />
      {data.reports.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {data.reports.map((report) => (
            <Card key={report.id} className="bg-secondary-10 p-5">
              <BarChart3 className="h-9 w-9 rounded-lg bg-primary p-2 text-white" />
              <h2 className="mt-5 font-semibold">{report.title}</h2>
              {report.description && (
                <p className="mt-1 text-sm text-grey-60">
                  {report.description}
                </p>
              )}
              <Link
                href={`/trainer/reports/${encodeURIComponent(report.id)}`}
                className="mt-5 flex items-center justify-between border-t border-grey-20 pt-3 text-sm font-semibold text-secondary"
              >
                View Report <ChevronRight className="h-4 w-4" />
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Empty label="No reports available." />
      )}
    </div>
  );
}
export function TrainerBatchDetailView({ data }: { data: TrainerBatchDetail }) {
  return (
    <div className="space-y-7">
      <PageHead
        title={data.name}
        description={
          data.description ??
          "Manage enrollments, attendance, and performance for this batch."
        }
        action={<Button>Add Student</Button>}
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-grey-20">
                <th className="p-4">Student Name</th>
                <th>Enrollment Date</th>
                <th>Attendance Rate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-grey-20 last:border-0"
                >
                  <td className="p-4 font-medium">{student.name}</td>
                  <td>{formatDate(student.enrollmentDate)}</td>
                  <td>{student.attendanceRate}%</td>
                  <td>
                    <Link
                      href={`/trainer/students/${encodeURIComponent(student.id)}`}
                      className="text-secondary"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.students.length && (
            <div className="p-5">
              <Empty label="No students enrolled." />
            </div>
          )}
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold">Quick Actions</h2>
            <div className="mt-4 space-y-2">
              {[
                { label: "New Announcement", href: "/trainer/announcements/new", icon: Megaphone },
                { label: "Schedule Classes", href: "/trainer/live-classes/new", icon: CalendarDays },
                { label: "Mark Attendance", href: "/trainer/attendance", icon: ClipboardCheck },
              ].map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex w-full items-center gap-2 rounded-lg bg-secondary-10 p-3 text-left text-sm font-medium"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Link>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold">Batch Overview</h2>
            <div className="mt-4">
              <p className="text-3xl font-bold">{data.totalStudents}</p>
              <p className="text-xs text-grey-50">Total students</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-grey-20 pt-4">
              <div>
                <b>{data.averageAttendance}%</b>
                <p className="text-xs text-grey-50">Avg attendance</p>
              </div>
              <div>
                <b>{data.averageScore}%</b>
                <p className="text-xs text-grey-50">Avg score</p>
              </div>
            </div>
            <p className="mt-5 text-sm">
              <b>Schedule:</b> {data.scheduleDays.join(", ")}
            </p>
            <p className="text-xs text-grey-50">
              {data.scheduleStartTime} – {data.scheduleEndTime}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
