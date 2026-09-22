import { del, get, post, postBlob, put } from "@/services/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiRecord, Identifier, PageRequest, PageResult } from "@/types/administration";
import type {
  InstitutionDashboardData,
  InstitutionPlacementsData,
  InstitutionReportsData,
  InstitutionStudentsData,
  InstitutionTrainersData,
} from "@/types/stakeholder";

export const institutionService = {
  getDashboard: () => get<InstitutionDashboardData>(API_ENDPOINTS.institutionDashboard),
  listPrograms: (query?: PageRequest) => get<PageResult<ApiRecord>>(API_ENDPOINTS.institutionPrograms, query),
  createProgram: (payload: ApiRecord) => post<ApiRecord>(API_ENDPOINTS.institutionPrograms, payload),
  getProgram: (id: Identifier) => get<ApiRecord>(API_ENDPOINTS.institutionProgram(id)),
  updateProgram: (id: Identifier, payload: ApiRecord) => put<ApiRecord>(API_ENDPOINTS.institutionProgram(id), payload),
  listStudents: (query?: PageRequest) => get<InstitutionStudentsData>(API_ENDPOINTS.institutionStudents, query),
  listTrainers: (query?: PageRequest) => get<InstitutionTrainersData>(API_ENDPOINTS.institutionTrainers, query),
  listBatches: (query?: PageRequest) => get<PageResult<ApiRecord>>(API_ENDPOINTS.institutionBatches, query),
  getReports: () => get<InstitutionReportsData>(API_ENDPOINTS.institutionReports),
  exportReports: (payload: ApiRecord = {}) => postBlob(API_ENDPOINTS.institutionReportExport, payload),
  listPlacements: (query?: PageRequest) => get<InstitutionPlacementsData>(API_ENDPOINTS.institutionPlacements, query),
  getNotifications: () => get<ApiRecord[]>(API_ENDPOINTS.institutionNotifications),
  removeProgram: (id: Identifier) => del<void>(API_ENDPOINTS.institutionProgram(id)),
};
