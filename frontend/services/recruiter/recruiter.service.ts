import { del, get, patch, post, postBlob, put } from "@/services/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiRecord, Identifier, PageRequest, PageResult } from "@/types/administration";
import type {
  RecruiterDashboardData,
  RecruiterJobsData,
  RecruiterPipelineData,
  RecruiterReportsData,
  RecruiterShortlistsData,
  RecruiterTalentData,
} from "@/types/stakeholder";

export const recruiterService = {
  getDashboard: () => get<RecruiterDashboardData>(API_ENDPOINTS.recruiterDashboard),
  searchTalent: (query?: PageRequest) => get<RecruiterTalentData>(API_ENDPOINTS.recruiterTalent, query),
  addShortlist: (payload: ApiRecord) => post<ApiRecord>(API_ENDPOINTS.recruiterShortlists, payload),
  listShortlists: (query?: PageRequest) => get<RecruiterShortlistsData>(API_ENDPOINTS.recruiterShortlists, query),
  removeShortlist: (studentId: Identifier) => del<void>(API_ENDPOINTS.recruiterShortlist(studentId)),
  listJobs: (query?: PageRequest) => get<RecruiterJobsData>(API_ENDPOINTS.recruiterJobs, query),
  createJob: (payload: ApiRecord) => post<ApiRecord>(API_ENDPOINTS.recruiterJobs, payload),
  updateJob: (jobId: Identifier, payload: ApiRecord) => put<ApiRecord>(API_ENDPOINTS.recruiterJob(jobId), payload),
  listPipeline: (query?: PageRequest) => get<RecruiterPipelineData>(API_ENDPOINTS.recruiterPipeline, query),
  updatePipelineStatus: (applicationId: Identifier, payload: ApiRecord) => patch<ApiRecord>(API_ENDPOINTS.recruiterPipelineItem(applicationId), payload),
  getReports: () => get<RecruiterReportsData>(API_ENDPOINTS.recruiterReports),
  exportReports: (payload: ApiRecord = {}) => postBlob(API_ENDPOINTS.recruiterReportExport, payload),
  getNotifications: () => get<ApiRecord[]>(API_ENDPOINTS.recruiterNotifications),
};
