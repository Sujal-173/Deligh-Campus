import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProgressRing from "@/components/dashboard/ProgressRing";
import ScheduleDialog from "@/components/dashboard/student/ScheduleDialog";
import { studentDashboardService } from "@/services/student/dashboard.service";
import {
  BookOpen,
  CalendarClock,
  Clock,
  Activity,
  Trophy,
  Star,
  ArrowRight,
} from "lucide-react";

const ICONS = {
  learning: BookOpen,
  classes: CalendarClock,
  assessment: Clock,
  activity: Activity,
  achievements: Trophy,
  recommended: Star,
} as const;

const ICON_BG = {
  learning: "bg-success-10 text-success-80",
  classes: "bg-secondary-10 text-secondary-90",
  assessment: "bg-warning-10 text-warning-80",
  activity: "bg-secondary-20 text-secondary-90",
  achievements: "bg-error-10 text-error-70",
  recommended: "bg-primary-10/15 text-primary",
} as const;

export default async function StudentDashboardPage() {
  const [data, sessions] = await Promise.all([
    studentDashboardService.getDashboard(),
    studentDashboardService.getSchedule(),
  ]);

  const medalColors = ["#F59E0B", "#9E9E9E", "#B07004"]; // gold, silver, bronze-ish per brand warning scale

  const nextSessions = sessions.slice(0, 3);
  const nextSession = nextSessions[0];

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Welcome banner */}
        <Card className="overflow-hidden border-0 bg-primary p-0 text-white shadow-card">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Student workspace
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold">
                Welcome back, {data.welcomeName}!
              </h1>
              <p className="mt-2 max-w-xl text-sm text-white/70">
                Your next best action is ready. Keep your momentum and make
                today&apos;s learning count.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/student/learning">
                  <Button className="bg-white text-primary hover:bg-white/90">
                    Continue Learning
                  </Button>
                </Link>
                <ScheduleDialog sessions={sessions} />
              </div>
            </div>
            <div className="flex min-w-44 flex-col items-center gap-1 rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
              <p className="text-xs font-medium text-white/70">
                Course completion
              </p>
              <ProgressRing
                percent={data.weekProgressPercent}
                color="#B8F36B"
              />
              <p className="text-xs font-medium text-white/70">
                Across your enrolled courses
              </p>
            </div>
          </div>
        </Card>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.summaryCards.map((card) => {
            const Icon = ICONS[card.icon] ?? Activity;
            return (
              <Link key={card.id} href={card.href}>
                <Card className="group flex h-full items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-card-hover">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ICON_BG[card.icon]}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-primary">{card.title}</p>
                    <p className="mt-1 text-sm text-grey-60">
                      {card.description}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                Your agenda
              </p>
              <h2 className="mt-1 font-display text-xl font-bold text-primary">
                Upcoming sessions
              </h2>
            </div>
            <ScheduleDialog sessions={sessions} />
          </div>
          {nextSessions.length ? (
            <div className="mt-5 divide-y divide-grey-20">
              {nextSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-primary">
                      {session.title}
                    </p>
                    <p className="mt-1 text-sm text-grey-60">
                      {session.trainerName}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-sm">
                    <p className="font-semibold text-primary">
                      {new Date(session.startsAt).toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-grey-50">
                      {new Date(session.startsAt).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-grey-20 bg-grey-5 p-6 text-center text-sm text-grey-60">
              No upcoming sessions. Explore your learning plan to keep moving.
            </div>
          )}
          {nextSession && (
            <p className="mt-5 text-xs text-grey-50">
              Next up: {nextSession.title}
            </p>
          )}
        </Card>

        {/* Right rail: top performers + rank list */}
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-display text-base font-bold text-primary">
              Top Performers
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {data.topPerformers.length === 0 && (
                <p className="col-span-3 py-5 text-center text-sm text-grey-60">
                  Leaderboards appear after completed assessments.
                </p>
              )}
              {data.topPerformers.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col items-center text-center"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: medalColors[p.rank - 1] }}
                  >
                    {p.name.slice(0, 1)}
                  </div>
                  <p className="mt-2 text-xs font-semibold text-primary">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-grey-50">{p.track}</p>
                  <span className="mt-1 text-[10px] font-semibold text-grey-60">
                    {p.rank === 1 ? "First" : p.rank === 2 ? "Second" : "Third"}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-primary">
                Rank List
              </h2>
              <Link
                href="/student/career"
                className="flex items-center gap-1 text-xs font-medium text-secondary hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {data.rankList.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-grey-20 text-left text-xs font-medium text-grey-50">
                    <th className="pb-2 pr-2">Rank</th>
                    <th className="pb-2 pr-2">Name</th>
                    <th className="pb-2">Course</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rankList.map((row) => (
                    <tr
                      key={row.rank}
                      className="border-b border-grey-20/60 last:border-0"
                    >
                      <td className="py-2 pr-2 font-semibold text-primary">
                        {row.rank}
                      </td>
                      <td className="py-2 pr-2 text-grey-70">{row.name}</td>
                      <td className="py-2 text-grey-60">{row.course}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="py-5 text-sm text-grey-60">
                Complete an assessment to appear in the rank list.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
