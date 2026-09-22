import { trainerService } from "@/services/trainer/trainer.service";
import { TrainerLiveClassesView } from "@/components/dashboard/trainer/TrainerViews";
export default async function Page() {
  return (
    <TrainerLiveClassesView data={await trainerService.getLiveClasses()} />
  );
}
