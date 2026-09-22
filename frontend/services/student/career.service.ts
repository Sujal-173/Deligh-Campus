import { get } from "../api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { CareerProgress } from "@/types/student";

export const studentCareerService = {
  /** Spring Boot: GET /api/student/career */
  getCareerProgress: async (): Promise<CareerProgress> => {
    return get<CareerProgress>(API_ENDPOINTS.studentCareer);
  },
};
