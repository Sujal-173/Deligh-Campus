import { get, patch, post, postBlob, put } from "@/services/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type {
  ApiRecord,
  Identifier,
  PageRequest,
  PageResult,
} from "@/types/administration";
import type {
  TrainerAssessment,
  TrainerAssessmentsData,
  TrainerBatch,
  TrainerBatchDetail,
  TrainerCourse,
  TrainerDashboardData,
  TrainerLiveClassData,
  TrainerReportsData,
  TrainerStudentsData,
} from "@/types/trainer";
/** Trainer identity and organization are always derived by Spring Security from the JWT. */
export const trainerService = {
  getDashboard: () => get<TrainerDashboardData>(API_ENDPOINTS.trainerDashboard),
  listBatches: (query?: PageRequest) =>
    get<PageResult<TrainerBatch>>(API_ENDPOINTS.trainerBatches, query),
  getBatch: (batchId: Identifier) =>
    get<TrainerBatchDetail>(API_ENDPOINTS.trainerBatch(batchId)),
  createBatch: (payload: ApiRecord) =>
    post<TrainerBatch>(API_ENDPOINTS.trainerBatches, payload),
  updateBatch: (batchId: Identifier, payload: ApiRecord) =>
    put<TrainerBatch>(API_ENDPOINTS.trainerBatch(batchId), payload),
  listCourses: (query?: PageRequest) =>
    get<PageResult<TrainerCourse>>(API_ENDPOINTS.trainerCourses, query),
  createCourse: (payload: ApiRecord) =>
    post<TrainerCourse>(API_ENDPOINTS.trainerCourses, payload),
  getCourse: (courseId: Identifier) => get<ApiRecord>(API_ENDPOINTS.trainerCourse(courseId)),
  updateCourse: (courseId: Identifier, payload: ApiRecord) =>
    put<TrainerCourse>(API_ENDPOINTS.trainerCourse(courseId), payload),
  getLiveClasses: () =>
    get<TrainerLiveClassData>(API_ENDPOINTS.trainerLiveClasses),
  listStudents: (query?: PageRequest) =>
    get<TrainerStudentsData>(API_ENDPOINTS.trainerStudents, query),
  getStudent: (studentId: Identifier) =>
    get<ApiRecord>(API_ENDPOINTS.trainerStudent(studentId)),
  getAssessments: (query?: PageRequest) =>
    get<TrainerAssessmentsData>(API_ENDPOINTS.trainerAssessments, query),
  getAssessment: (assessmentId: Identifier) =>
    get<ApiRecord>(API_ENDPOINTS.trainerAssessment(assessmentId)),
  createAssessment: (payload: ApiRecord) =>
    post<TrainerAssessment>(API_ENDPOINTS.trainerAssessments, payload),
  updateAssessment: (assessmentId: Identifier, payload: ApiRecord) =>
    put<TrainerAssessment>(
      API_ENDPOINTS.trainerAssessment(assessmentId),
      payload,
    ),
  gradeAttempt: (assessmentId: Identifier, attemptId: Identifier, payload: ApiRecord) =>
    patch<ApiRecord>(`/trainer/assessments/${encodeURIComponent(assessmentId)}/attempts/${encodeURIComponent(attemptId)}`, payload),
  getReports: (query?: PageRequest) =>
    get<TrainerReportsData>(API_ENDPOINTS.trainerReports, query),
  getReport: (reportId: Identifier, query?: Record<string, unknown>) =>
    get<ApiRecord>(API_ENDPOINTS.trainerReport(reportId), query),
  exportReport: (payload: ApiRecord) =>
    postBlob(API_ENDPOINTS.trainerReportExport, payload),
  createAnnouncement: (payload: ApiRecord) =>
    post<ApiRecord>(API_ENDPOINTS.trainerAnnouncements, payload),
  markAttendance: (payload: ApiRecord) =>
    post<ApiRecord>(API_ENDPOINTS.trainerAttendance, payload),
  listSessions: (query?: PageRequest) =>
    get<PageResult<ApiRecord>>(API_ENDPOINTS.trainerSessions, query),
  createSession: (payload: ApiRecord) =>
    post<ApiRecord>(API_ENDPOINTS.trainerSessions, payload),
  updateSession: (sessionId: Identifier, payload: ApiRecord) =>
    put<ApiRecord>(API_ENDPOINTS.trainerSession(sessionId), payload),
  listFeedback: () =>
    get<ApiRecord[]>(API_ENDPOINTS.trainerFeedback),
  submitFeedback: (payload: ApiRecord) =>
    post<ApiRecord>(API_ENDPOINTS.trainerFeedback, payload),
  updateFeedback: (feedbackId: Identifier, payload: ApiRecord) =>
    patch<ApiRecord>(API_ENDPOINTS.trainerFeedbackItem(feedbackId), payload),
  getProfile: () => get<ApiRecord>(API_ENDPOINTS.trainerProfile),
  updateProfile: (payload: ApiRecord) =>
    put<ApiRecord>(API_ENDPOINTS.trainerProfile, payload),
  getNotifications: () => get<ApiRecord[]>(API_ENDPOINTS.trainerNotifications),
};
