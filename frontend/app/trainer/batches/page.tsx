import Link from "next/link";
import { trainerService } from "@/services/trainer/trainer.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export default async function Page() {
  const data = await trainerService.listBatches();
  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">My Batches</h1>
          <p className="mt-1 text-sm text-grey-60">
            Manage assigned cohorts and learner delivery.
          </p>
        </div>
        <Button asChild><Link href="/trainer/batches/new">Create Batch</Link></Button>
      </div>
      {data.items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.items.map((batch) => (
            <Link
              key={batch.id}
              href={`/trainer/batches/${encodeURIComponent(batch.id)}`}
            >
              <Card className="h-full p-5 transition hover:border-secondary-30 hover:shadow-card-hover">
                <p className="text-xs font-semibold uppercase text-secondary">
                  {batch.status}
                </p>
                <h2 className="mt-2 text-lg font-bold">{batch.name}</h2>
                <p className="mt-1 text-sm text-grey-60">{batch.courseTitle}</p>
                <p className="mt-5 text-sm font-medium">
                  {batch.studentCount} students
                </p>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-grey-20 p-8 text-center text-sm text-grey-50">
          No assigned batches.
        </div>
      )}
    </div>
  );
}
