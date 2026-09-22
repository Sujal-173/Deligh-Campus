import { trainerService } from "@/services/trainer/trainer.service";
import { TrainerStudentsView } from "@/components/dashboard/trainer/TrainerViews";
export default async function Page() {
  return <TrainerStudentsView data={await trainerService.listStudents()} />;
}
