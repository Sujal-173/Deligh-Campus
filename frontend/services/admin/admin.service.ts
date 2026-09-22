import { del, get, patch, post, postBlob, put } from "@/services/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type {
  ApiRecord,
  DecisionPayload,
  ExportRequest,
  Identifier,
  PageRequest,
  PageResult,
  RoleAssignment,
  StatusUpdate,
} from "@/types/administration";

/**
 * Admin endpoint contract required by the Vision Handbook's administrator vision.
 * Components must consume these functions instead of embedding operational values.
 * Spring Security remains responsible for authorization and tenant isolation.
 */
export const adminService = {
  getDashboard: () => get<ApiRecord>(API_ENDPOINTS.adminDashboard),
  listUsers: (query?: PageRequest) =>
    get<PageResult<ApiRecord>>(API_ENDPOINTS.adminUsers, query),
  getUser: (userId: Identifier) =>
    get<ApiRecord>(API_ENDPOINTS.adminUser(userId)),
  updateUser: (userId: Identifier, payload: ApiRecord) =>
    put<ApiRecord>(API_ENDPOINTS.adminUser(userId), payload),
  updateUserStatus: (userId: Identifier, payload: StatusUpdate) =>
    patch<ApiRecord>(API_ENDPOINTS.adminUserStatus(userId), payload),
  assignUserRoles: (userId: Identifier, payload: RoleAssignment) =>
    put<ApiRecord>(API_ENDPOINTS.adminUserRoles(userId), payload),
  listCourses: (query?: PageRequest) =>
    get<PageResult<ApiRecord>>(API_ENDPOINTS.adminCourses, query),
  createCourse: (payload: ApiRecord) =>
    post<ApiRecord>(API_ENDPOINTS.adminCourses, payload),
  updateCourse: (courseId: Identifier, payload: ApiRecord) =>
    put<ApiRecord>(API_ENDPOINTS.adminCourse(courseId), payload),
  deleteCourse: (courseId: Identifier) =>
    del<void>(API_ENDPOINTS.adminCourse(courseId)),
  listBatches: (query?: PageRequest) =>
    get<PageResult<ApiRecord>>(API_ENDPOINTS.adminBatches, query),
  getBatch: (batchId: Identifier) =>
    get<ApiRecord>(API_ENDPOINTS.adminBatch(batchId)),
  listCourseApprovals: (query?: PageRequest) =>
    get<PageResult<ApiRecord>>(API_ENDPOINTS.adminCourseApprovals, query),
  decideCourseApproval: (courseId: Identifier, payload: DecisionPayload) =>
    post<ApiRecord>(
      API_ENDPOINTS.adminCourseApprovalDecision(courseId),
      payload,
    ),
  listAssessments: (query?: PageRequest) =>
    get<PageResult<ApiRecord>>(API_ENDPOINTS.adminAssessments, query),
  getAssessment: (assessmentId: Identifier) =>
    get<ApiRecord>(API_ENDPOINTS.adminAssessment(assessmentId)),
  listAppeals: (query?: PageRequest) =>
    get<PageResult<ApiRecord>>(API_ENDPOINTS.adminAppeals, query),
  decideAppeal: (appealId: Identifier, payload: DecisionPayload) =>
    post<ApiRecord>(API_ENDPOINTS.adminAppealDecision(appealId), payload),
  getReports: (query?: PageRequest) =>
    get<ApiRecord>(API_ENDPOINTS.adminReports, query),
  exportReport: (payload: ExportRequest) =>
    postBlob(API_ENDPOINTS.adminReportExport, payload),
  getFinanceSummary: () => get<ApiRecord>(API_ENDPOINTS.adminFinance),
  listTransactions: (query?: PageRequest) =>
    get<PageResult<ApiRecord>>(API_ENDPOINTS.adminTransactions, query),
  listContent: (query?: PageRequest) =>
    get<PageResult<ApiRecord>>(API_ENDPOINTS.adminContent, query),
  createContent: (payload: ApiRecord) =>
    post<ApiRecord>(API_ENDPOINTS.adminContent, payload),
  updateContent: (contentId: Identifier, payload: ApiRecord) =>
    put<ApiRecord>(API_ENDPOINTS.adminContentItem(contentId), payload),
  deleteContent: (contentId: Identifier) =>
    del<void>(API_ENDPOINTS.adminContentItem(contentId)),
  getSettings: () => get<ApiRecord>(API_ENDPOINTS.adminSettings),
  updateSettings: (payload: ApiRecord) =>
    put<ApiRecord>(API_ENDPOINTS.adminSettings, payload),
  getNotifications: () => get<ApiRecord[]>(API_ENDPOINTS.adminNotifications),
};
