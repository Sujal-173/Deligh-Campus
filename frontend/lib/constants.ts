export {
  APP_CONFIG,
  API_ENDPOINTS,
  ROLE_HOME,
  ROUTES,
  getRoleHome,
} from "@/lib/config/shared";
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_PROXY_PATH ?? "/api/backend";
