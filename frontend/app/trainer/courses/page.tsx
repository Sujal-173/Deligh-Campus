import { trainerService } from "@/services/trainer/trainer.service";
import { TrainerCoursesView } from "@/components/dashboard/trainer/TrainerViews";
export default async function Page() {
  const data = await trainerService.listCourses();
  return <TrainerCoursesView items={data.items} />;
}
