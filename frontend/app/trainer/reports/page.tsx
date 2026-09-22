import { trainerService } from "@/services/trainer/trainer.service";
import { TrainerReportsView } from "@/components/dashboard/trainer/TrainerViews";
export default async function Page() {
  return <TrainerReportsView data={await trainerService.getReports()} />;
}
