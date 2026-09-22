import { get, post } from "../api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { Course } from "@/types/student";

export const studentLearningService = {
  /** Spring Boot: GET /api/student/courses?category=&search= */
  getCourses: async (params?: {
    category?: string;
    search?: string;
  }): Promise<Course[]> => {
    return get<Course[]>(API_ENDPOINTS.studentCourses, params);
  },

  /** Spring Boot: GET /api/student/courses/{courseId} */
  getCourseDetail: async (courseId: string): Promise<Course | undefined> => {
    return get<Course>(API_ENDPOINTS.studentCourseDetail(courseId));
  },

  /** Spring Boot: POST /api/student/courses/{courseId}/enroll */
  enroll: async (courseId: string): Promise<{ enrolled: boolean }> => {
    return post<{ enrolled: boolean }>(
      API_ENDPOINTS.studentCourseEnroll(courseId),
    );
  },
};
