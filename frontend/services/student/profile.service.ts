import { get, put } from "../api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { StudentProfile } from "@/types/student";

export const studentProfileService = {
  /** Spring Boot: GET /api/student/profile */
  getProfile: async (): Promise<StudentProfile> => {
    return get<StudentProfile>(API_ENDPOINTS.studentProfile);
  },

  /** Spring Boot: PUT /api/student/profile */
  updateProfile: async (
    payload: Partial<StudentProfile>,
  ): Promise<StudentProfile> => {
    return put<StudentProfile>(API_ENDPOINTS.studentProfile, payload);
  },
};
