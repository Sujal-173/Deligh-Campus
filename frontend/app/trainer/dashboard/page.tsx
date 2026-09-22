import { trainerService } from "@/services/trainer/trainer.service";
import { TrainerDashboardView } from "@/components/dashboard/trainer/TrainerViews";
export default async function Page() {
  return <TrainerDashboardView data={await trainerService.getDashboard()} />;
}
