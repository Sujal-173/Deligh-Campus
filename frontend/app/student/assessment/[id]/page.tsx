import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import ProgressRing from "@/components/dashboard/ProgressRing";
import ProgressBar from "@/components/dashboard/ProgressBar";
import AssessmentRunner from "@/components/dashboard/student/AssessmentRunner";
import { studentAssessmentService } from "@/services/student/assessment.service";
import { Lightbulb, PencilLine, ShieldCheck, ListChecks } from "lucide-react";

const TIP_ICONS = [Lightbulb, PencilLine, ShieldCheck, ListChecks];

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessment = await studentAssessmentService.getAssessmentDetail(id);
  if (!assessment) notFound();

  const overallPercent = Math.round(
    assessment.questionsTotal > 0
      ? (assessment.questionsAttempted / assessment.questionsTotal) * 100
      : 0,
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-primary">
        {assessment.title}
      </h1>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold text-primary">Assessment Overview</h2>
            <p className="mt-1 text-sm text-grey-60">
              Four short sections covering the soft skills employers screen for
              most.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {assessment.sections.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-grey-20 p-4"
                >
                  <p className="font-semibold text-primary">{s.label}</p>
                  <p className="mt-1 text-xs text-grey-60">{s.description}</p>
                  <p className="mt-2 text-xs font-medium text-secondary">
                    {s.questionCount} Questions
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-primary">Assessment Tips</h2>
            <div className="mt-4 space-y-3">
              {assessment.tips.map((tip, i) => {
                const Icon = TIP_ICONS[i % TIP_ICONS.length];
                return (
                  <div key={tip.title} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-10 text-secondary-90">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-primary">
                        {tip.title}
                      </p>
                      <p className="text-xs text-grey-60">{tip.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="flex flex-col items-center p-5">
            <p className="text-sm font-medium text-grey-60">
              This week&apos;s progress
            </p>
            <ProgressRing percent={overallPercent} />
            <p className="mt-1 text-xs text-grey-50">
              {assessment.questionsAttempted} of {assessment.questionsTotal}{" "}
              Questions
            </p>
            <div className="mt-4 grid w-full grid-cols-2 gap-3 text-center text-xs">
              <div className="rounded-lg bg-grey-10 py-2">
                <p className="font-semibold text-primary">
                  {assessment.timeRemainingMinutes} min
                </p>
                <p className="text-grey-50">Time Remaining</p>
              </div>
              <div className="rounded-lg bg-grey-10 py-2">
                <p className="font-semibold text-primary">
                  {assessment.questionsAttempted}/{assessment.questionsTotal}
                </p>
                <p className="text-grey-50">Questions Attempted</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <p className="mb-3 font-semibold text-primary">Skill Coverage</p>
            <div className="space-y-4">
              {assessment.skillCoverage.map((s) => (
                <ProgressBar
                  key={s.label}
                  label={s.label}
                  percent={s.percent}
                  color="bg-success"
                />
              ))}
            </div>
          </Card>

          <AssessmentRunner assessment={assessment} />
        </div>
      </div>
    </div>
  );
}
