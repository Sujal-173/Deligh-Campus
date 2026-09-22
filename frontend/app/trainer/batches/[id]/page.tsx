import { trainerService } from "@/services/trainer/trainer.service";
import { TrainerBatchDetailView } from "@/components/dashboard/trainer/TrainerViews";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TrainerBatchDetailView data={await trainerService.getBatch(id)} />;
}
