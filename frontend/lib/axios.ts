import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";

const timeout = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? "15000");

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number.isFinite(timeout) ? timeout : 15000,
  withCredentials: true,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      }).catch(() => undefined);
      if (!window.location.pathname.startsWith("/login"))
        window.location.assign("/login?reason=session-expired");
    }
    return Promise.reject(error);
  },
);
