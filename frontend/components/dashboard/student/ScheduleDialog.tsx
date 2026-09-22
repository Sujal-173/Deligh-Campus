"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CalendarClock } from "lucide-react";
import type { StudentScheduleItem } from "@/types/student";
export default function ScheduleDialog({
  sessions,
}: {
  sessions: StudentScheduleItem[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Schedule
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Upcoming Classes</DialogTitle>
          <DialogDescription>Your scheduled live sessions.</DialogDescription>
          <div className="mt-5 space-y-3">
            {sessions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-grey-20 p-6 text-center text-sm text-grey-50">
                No upcoming sessions.
              </p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-start gap-3 rounded-xl border border-grey-20 p-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-10 text-secondary-90">
                    <CalendarClock className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      {session.title}
                    </p>
                    <p className="text-xs text-grey-60">
                      with {session.trainerName}
                    </p>
                    <p className="mt-0.5 text-xs text-grey-50">
                      {new Date(session.startsAt).toLocaleString(undefined, {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      · {session.durationMinutes} min
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
