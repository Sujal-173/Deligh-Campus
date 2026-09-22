export type TrainerStatus =
  "active" | "inactive" | "scheduled" | "live" | "completed" | "grading";
export interface TrainerMetric {
  id: string;
  label: string;
  value: string | number;
  trend?: number;
  helperText?: string;
}
export interface TrainerScheduleItem {
  id: string;
  title: string;
  batchName: string;
  startsAt: string;
  status: TrainerStatus;
}
export interface TrainerActivity {
  id: string;
  actorName: string;
  description: string;
  occurredAt: string;
  avatarUrl?: string;
}
export interface TrainerDashboardData {
  welcomeName: string;
  todaySchedule: TrainerScheduleItem[];
  upcomingClasses: TrainerScheduleItem[];
  studentMetrics: TrainerMetric[];
  assessmentMetrics: TrainerMetric[];
  recentActivities: TrainerActivity[];
}
export interface TrainerBatch {
  id: string;
  name: string;
  courseTitle: string;
  studentCount: number;
  startDate: string;
  endDate?: string;
  status: TrainerStatus;
}
export interface TrainerBatchStudent {
  id: string;
  name: string;
  enrollmentDate: string;
  attendanceRate: number;
}
export interface TrainerBatchDetail {
  id: string;
  name: string;
  description?: string;
  students: TrainerBatchStudent[];
  totalStudents: number;
  averageAttendance: number;
  averageScore: number;
  scheduleDays: string[];
  scheduleStartTime: string;
  scheduleEndTime: string;
}
export interface TrainerCourse {
  id: string;
  title: string;
  studentCount: number;
  batchCount: number;
  status: TrainerStatus;
}
export interface TrainerRecording {
  id: string;
  title: string;
  recordedAt: string;
  durationMinutes: number;
  playbackUrl?: string;
}
export interface TrainerLiveClassData {
  currentClass?: TrainerScheduleItem & {
    joinedStudentCount: number;
    roomUrl?: string;
  };
  upcomingSchedule: TrainerScheduleItem[];
  recordings: TrainerRecording[];
  reportMetrics: TrainerMetric[];
}
export interface TrainerStudent {
  id: string;
  name: string;
  batchName: string;
  profileUrl?: string;
}
export interface TrainerStudentsData {
  students: TrainerStudent[];
  batches: { id: string; name: string }[];
  metrics: TrainerMetric[];
}
export interface TrainerAssessment {
  id: string;
  title: string;
  type: string;
  batchName: string;
  dueAt: string;
  status: TrainerStatus;
  durationMinutes?: number;
}
export interface TrainerAssessmentsData {
  metrics: TrainerMetric[];
  assessments: TrainerAssessment[];
  types: string[];
}
export interface TrainerReport {
  id: string;
  title: string;
  description?: string;
  type: string;
}
export interface TrainerReportsData {
  reports: TrainerReport[];
  batches: { id: string; name: string }[];
}
