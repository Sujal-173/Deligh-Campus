import { get } from "../api";
import { API_ENDPOINTS } from "@/lib/constants";
import type {
  StudentDashboardData,
  StudentScheduleItem,
} from "@/types/student";

export const studentDashboardService = {
  /**
   * Spring Boot: GET /api/student/dashboard
   * Suggested controller: StudentDashboardController#getDashboard()
   * Auth: requires a valid student JWT (read the student id off the token,
   * don't trust an id from the client).
   */
  getDashboard: (): Promise<StudentDashboardData> =>
    get<StudentDashboardData>(API_ENDPOINTS.studentDashboard),
  /** Spring Boot: GET /student/schedule; student identity comes from the JWT. */
  getSchedule: (): Promise<StudentScheduleItem[]> =>
    get<StudentScheduleItem[]>(API_ENDPOINTS.studentSchedule),
};
