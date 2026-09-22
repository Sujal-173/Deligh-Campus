import type { ApiRecord, PageResult } from "./administration";

export interface StakeholderMetric {
  id: string;
  label: string;
  value: number | null;
  helperText?: string;
  trendPercent?: number | null;
  tone?: "primary" | "secondary" | "success" | "warning" | "error";
}

export interface InstitutionDashboardData {
  configured: boolean;
  organization: { id: string; name: string; code: string; status: string } | null;
  metrics: StakeholderMetric[];
  recentBatches: ApiRecord[];
  courseProgress: ApiRecord[];
  recentEnrollments: ApiRecord[];
}

export interface InstitutionProgramsData extends PageResult<ApiRecord> {}
export interface InstitutionStudentsData extends PageResult<ApiRecord> {}
export interface InstitutionTrainersData extends PageResult<ApiRecord> {}
export interface InstitutionBatchesData extends PageResult<ApiRecord> {}
export interface InstitutionPlacementsData extends PageResult<ApiRecord> {}

export interface InstitutionReportsData {
  summary: StakeholderMetric[];
  coursePerformance: ApiRecord[];
  monthlyEnrollment: ApiRecord[];
}

export interface RecruiterDashboardData {
  metrics: StakeholderMetric[];
  recentCandidates: ApiRecord[];
  pipeline: ApiRecord[];
  recentJobs: ApiRecord[];
}

export interface RecruiterTalentData extends PageResult<ApiRecord> {}
export interface RecruiterJobsData extends PageResult<ApiRecord> {}
export interface RecruiterShortlistsData extends PageResult<ApiRecord> {}
export interface RecruiterPipelineData extends PageResult<ApiRecord> {}

export interface RecruiterReportsData {
  summary: StakeholderMetric[];
  pipelineByStage: ApiRecord[];
  applicationsByMonth: ApiRecord[];
}
