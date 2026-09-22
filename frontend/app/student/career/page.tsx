import { Card } from "@/components/ui/card";
import ProgressRing from "@/components/dashboard/ProgressRing";
import ProgressBar from "@/components/dashboard/ProgressBar";
import { studentCareerService } from "@/services/student/career.service";
import { studentDashboardService } from "@/services/student/dashboard.service";
import { Compass, Award, ShieldCheck, TrendingUp } from "lucide-react";

const SECTIONS = [
  {
    title: "Career Dashboard",
    description: "See a full snapshot of your career readiness in one view.",
    icon: Compass,
  },
  {
    title: "My Certificates",
    description: "Every credential you've earned so far, in one place.",
    icon: Award,
  },
  {
    title: "Skill Assessment",
    description: "Retake or review any of your completed skill assessments.",
    icon: ShieldCheck,
  },
  {
    title: "Career Growth",
    description: "Suggested next steps based on where you're strongest.",
    icon: TrendingUp,
  },
];

export default async function StudentCareerPage() {
  const [career, dashboard] = await Promise.all([
    studentCareerService.getCareerProgress(),
    studentDashboardService.getDashboard(),
  ]);

  const pct = (v: { done: number; total: number }) =>
    v.total > 0 ? Math.round((v.done / v.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Career</h1>
        <p className="mt-1 text-sm text-grey-60">
          Hi {dashboard.welcomeName}, here&apos;s how job-ready your profile is
          right now.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.title} className="flex items-start gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-10 text-secondary-90">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-primary">{s.title}</p>
                  <p className="mt-1 text-sm text-grey-60">{s.description}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-5">
          <p className="font-semibold text-primary">Career Progress</p>
          <p className="mb-4 text-xs text-grey-50">
            Your overall career readiness
          </p>
          <div className="flex justify-center">
            <ProgressRing
              percent={career.readinessPercent}
              size={140}
              strokeWidth={12}
            />
          </div>
          <div className="mt-6 space-y-4">
            <ProgressBar
              label="Skill"
              sublabel={`${career.skill.done} / ${career.skill.total} Completed`}
              percent={pct(career.skill)}
              color="bg-success"
            />
            <ProgressBar
              label="Experience"
              sublabel={`${career.experience.done} / ${career.experience.total} Completed`}
              percent={pct(career.experience)}
              color="bg-warning"
            />
            <ProgressBar
              label="Certificates"
              sublabel={`${career.certificates.done} / ${career.certificates.total} Completed`}
              percent={pct(career.certificates)}
              color="bg-error"
            />
            <ProgressBar
              label="Goal Progress"
              sublabel={`${career.goals.done} / ${career.goals.total} Completed`}
              percent={pct(career.goals)}
              color="bg-success-60"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
