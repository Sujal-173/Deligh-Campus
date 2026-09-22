import { Cable, LockKeyhole } from "lucide-react";
import { Card } from "@/components/ui/card";
export default function ModulePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
          API-ready module
        </p>
        <h1 className="mt-2 text-3xl font-bold">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-grey-60">
          {description}
        </p>
      </div>
      <Card className="mt-8 overflow-hidden">
        <div className="grid min-h-72 place-items-center bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_45%)] p-8 text-center">
          <div className="max-w-md">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-10 text-secondary">
              <Cable className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-lg font-semibold">
              Waiting for an authorized API response
            </h2>
            <p className="mt-2 text-sm leading-6 text-grey-60">
              This screen intentionally contains no fabricated records or
              hardcoded metrics. Connect the matching Spring Boot endpoint to
              populate it.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-grey-20 bg-white px-3 py-2 text-xs text-grey-60">
              <LockKeyhole className="h-3.5 w-3.5 text-success-70" />
              Backend must enforce permissions
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
