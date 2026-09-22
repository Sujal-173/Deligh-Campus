import AssessmentList from "@/components/dashboard/student/AssessmentList";
import UploadWorkPanel from "@/components/dashboard/student/UploadWorkPanel";
import { studentAssessmentService } from "@/services/student/assessment.service";

export default async function StudentAssessmentPage() {
  const assessments = await studentAssessmentService.getAssessments();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-primary">
        Assessment
      </h1>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <AssessmentList assessments={assessments} />
        <UploadWorkPanel assessmentId={assessments[0]?.id ?? ""} />
      </div>
    </div>
  );
}
