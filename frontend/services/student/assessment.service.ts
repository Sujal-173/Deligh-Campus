import { get, post } from "../api";
import { API_ENDPOINTS } from "@/lib/constants";
import type {
  Assessment,
  AssessmentDetail,
  AssessmentStatus,
} from "@/types/student";

export const studentAssessmentService = {
  /** Spring Boot derives the student from the JWT; the browser never supplies a student id. */
  getAssessments: (status?: AssessmentStatus | "all") =>
    get<Assessment[]>(API_ENDPOINTS.studentAssessments, { status }),
  getAssessmentDetail: (assessmentId: string) =>
    get<AssessmentDetail>(API_ENDPOINTS.studentAssessmentDetail(assessmentId)),
  start: (assessmentId: string) =>
    post<{ attemptId: string }>(
      API_ENDPOINTS.studentAssessmentStart(assessmentId),
    ),
  submitAttempt: async (assessmentId: string, attemptId: string, answers: Record<number, string>): Promise<{ submitted: boolean; attemptId: string }> => {
    return post<{ submitted: boolean; attemptId: string }>(API_ENDPOINTS.studentAssessmentSubmit(assessmentId), { attemptId, answers });
  },
  submitWork: async (
    assessmentId: string,
    file: File,
    comments?: string,
  ): Promise<{ submitted: boolean }> => {
    const formData = new FormData();
    formData.append("file", file);
    if (comments) formData.append("comments", comments);
    const { api } = await import("@/lib/axios");
    const { data } = await api.post(
      API_ENDPOINTS.studentAssessmentSubmit(assessmentId),
      formData,
    );
    return data.data;
  },
};
