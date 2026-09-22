// Shapes returned by the Spring Boot backend for the Student area.
// Keep these in sync with the corresponding @RestController DTOs.

export interface TopPerformer {
  id: string;
  name: string;
  track: string; // e.g. "UI/UX Design"
  rank: 1 | 2 | 3;
  avatarUrl?: string;
}

export interface RankListEntry {
  rank: number;
  name: string;
  course: string;
}

export interface DashboardSummaryCard {
  id: string;
  title: string;
  description: string;
  href: string;
  icon:
    | "learning"
    | "classes"
    | "assessment"
    | "activity"
    | "achievements"
    | "recommended";
}

export interface StudentScheduleItem {
  id: string;
  title: string;
  trainerName: string;
  startsAt: string;
  durationMinutes: number;
}

export interface StudentDashboardData {
  welcomeName: string;
  weekProgressPercent: number;
  summaryCards: DashboardSummaryCard[];
  topPerformers: TopPerformer[];
  rankList: RankListEntry[];
}

export interface Course {
  id: string;
  title: string;
  category?: string;
  level: string; // "Beginner to Advanced"
  rating: number;
  reviewCount: number;
  description: string;
  imageUrl?: string;
  learningOutcomes: string[];
  chapterCount: number;
  duration: string; // "3 months"
  certificateEta: string; // "3 months"
  enrolled: boolean;
}

export type AssessmentStatus = "upcoming" | "in_progress" | "completed";

export interface Assessment {
  id: string;
  title: string;
  status: AssessmentStatus;
  questionCount: number;
  durationMinutes: number;
  dueAt: string; // ISO date string
  imageUrl?: string;
}

export interface SkillCoverage {
  label: string;
  percent: number;
}

export interface AssessmentDetail extends Assessment {
  sections: { label: string; description: string; questionCount: number }[];
  tips: { title: string; description: string }[];
  timeRemainingMinutes: number;
  questionsAttempted: number;
  questionsTotal: number;
  skillCoverage: SkillCoverage[];
}

export interface CareerProgress {
  readinessPercent: number;
  skill: { done: number; total: number };
  experience: { done: number; total: number };
  certificates: { done: number; total: number };
  goals: { done: number; total: number };
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
}

export interface StudentProfile {
  fullName: string;
  roleTitle: string;
  about: string;
  phone: string;
  email: string;
  gender?: string;
  avatarUrl?: string;
}
