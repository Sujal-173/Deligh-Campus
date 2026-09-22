"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HelpCircle, Clock } from "lucide-react";
import type { Assessment, AssessmentStatus } from "@/types/student";

const TABS: { key: AssessmentStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

const STATUS_BADGE: Record<
  AssessmentStatus,
  { label: string; variant: "default" | "success" | "warning" }
> = {
  upcoming: { label: "Upcoming", variant: "warning" },
  in_progress: { label: "In Progress", variant: "default" },
  completed: { label: "Completed", variant: "success" },
};

export default function AssessmentList({
  assessments,
}: {
  assessments: Assessment[];
}) {
  const [tab, setTab] = useState<AssessmentStatus | "all">("all");
  const visible =
    tab === "all" ? assessments : assessments.filter((a) => a.status === tab);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-primary text-white"
                : "border border-grey-20 text-grey-70 hover:bg-grey-10",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {visible.length === 0 && (
          <p className="py-8 text-center text-sm text-grey-50">
            No assessments in this category yet.
          </p>
        )}
        {visible.map((a) => {
          const badge = STATUS_BADGE[a.status];
          return (
            <div
              key={a.id}
              className="flex flex-col gap-3 rounded-xl border border-grey-20 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 shrink-0 rounded-lg bg-deligh-gradient" />
                <div>
                  <p className="font-semibold text-primary">{a.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-grey-60">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="h-3.5 w-3.5" /> {a.questionCount}{" "}
                      Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {a.durationMinutes} mins
                    </span>
                    <span>
                      Due:{" "}
                      {new Date(a.dueAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                <Badge variant={badge.variant}>{badge.label}</Badge>
                <Link href={`/student/assessment/${a.id}`}>
                  <Button size="sm">Continue</Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
