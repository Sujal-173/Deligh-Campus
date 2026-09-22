import CourseBrowser from "@/components/dashboard/student/CourseBrowser";
import { studentLearningService } from "@/services/student/learning.service";

export default async function StudentLearningPage() {
  const courses = await studentLearningService.getCourses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">
          My Learning
        </h1>
      </div>

      <CourseBrowser initialCourses={courses} />
    </div>
  );
}
