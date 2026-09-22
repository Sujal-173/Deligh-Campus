"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { studentAssessmentService } from "@/services/student/assessment.service";
import type { AssessmentDetail } from "@/types/student";
import { CheckCircle2 } from "lucide-react";

// One representative question per section, generated from the assessment's
// own section list so this works for any assessment without a separate
// question bank. Swap for real questions once GET
// /api/student/assessments/{id}/questions exists on the backend.
function buildQuestions(assessment: AssessmentDetail) {
  return assessment.sections.map((section) => ({
    section: section.label,
    prompt: `${section.label}: ${section.description}`,
    options: [
      "Strongly disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly agree",
    ],
  }));
}

export default function AssessmentRunner({
  assessment,
}: {
  assessment: AssessmentDetail;
}) {
  const [open, setOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const questions = buildQuestions(assessment);
  const isLast = step === questions.length - 1;
  const current = questions[step];

  async function handleStart() {
    setStarting(true);
    try {
      // Spring Boot: POST /api/student/assessments/{id}/start — already
      // wired in services/student/assessment.service.ts, just wasn't being
      // called from the UI. Returns an attemptId to tag answer submissions.
      const started = await studentAssessmentService.start(assessment.id);
      setAttemptId(started.attemptId);
      setStep(0);
      setAnswers({});
      setOpen(true);
    } catch {
      toast.error("Couldn't start the assessment — try again.");
    } finally {
      setStarting(false);
    }
  }

  async function handleFinish() {
    if (!attemptId) return toast.error("Assessment session is missing. Restart the assessment.");
    if (Object.keys(answers).length < questions.length) {
      return toast.error("Answer every question before finishing.");
    }
    setSubmitting(true);
    try {
      await studentAssessmentService.submitAttempt(assessment.id, attemptId, answers);
      setOpen(false);
      toast.success(`Assessment submitted. You answered ${questions.length} of ${questions.length}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't submit the assessment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button
        size="lg"
        className="w-full"
        onClick={handleStart}
        disabled={starting}
      >
        {starting
          ? "Starting…"
          : assessment.status === "in_progress"
            ? "Resume Assessment"
            : "Start Assessment"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>{assessment.title}</DialogTitle>
          <DialogDescription>
            Question {step + 1} of {questions.length} — {current.section}
          </DialogDescription>

          <div className="mt-5">
            <p className="text-sm font-medium text-primary">{current.prompt}</p>
            <div className="mt-4 space-y-2">
              {current.options.map((option) => {
                const selected = answers[step] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [step]: option }))
                    }
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                      selected
                        ? "border-secondary bg-secondary-10 text-secondary-100"
                        : "border-grey-20 text-grey-70 hover:border-secondary-30"
                    }`}
                  >
                    {option}
                    {selected && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              Previous
            </Button>
            {isLast ? (
              <Button onClick={handleFinish} disabled={submitting}>{submitting ? "Submitting…" : "Finish"}</Button>
            ) : (
              <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
