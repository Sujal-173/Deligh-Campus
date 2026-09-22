import { trainerService } from "@/services/trainer/trainer.service";
import { TrainerAssessmentsView } from "@/components/dashboard/trainer/TrainerViews";
export default async function Page() {
  return (
    <TrainerAssessmentsView data={await trainerService.getAssessments()} />
  );
}
