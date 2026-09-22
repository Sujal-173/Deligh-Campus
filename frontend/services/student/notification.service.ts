import { get, patch, del } from "../api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { AppNotification } from "@/types/student";

export const studentNotificationService = {
  /** Spring Boot: GET /api/student/notifications */
  getAll: async (): Promise<AppNotification[]> => {
    return get<AppNotification[]>(API_ENDPOINTS.studentNotifications);
  },

  /** Spring Boot: PATCH /api/student/notifications/{id}/read */
  markRead: async (id: string): Promise<void> => {
    await patch(API_ENDPOINTS.studentNotificationRead(id));
  },

  /** Spring Boot: DELETE /api/student/notifications/{id} */
  remove: async (id: string): Promise<void> => {
    await del(API_ENDPOINTS.studentNotificationDelete(id));
  },
};
