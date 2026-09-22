import { del, get, patch, post, put } from "@/services/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type {
  ApiRecord,
  Identifier,
  PageRequest,
  PageResult,
  PermissionAssignment,
  StatusUpdate,
} from "@/types/administration";

/**
 * Super Admin endpoint contract for platform governance described in the Vision Handbook.
 * All mutations require backend audit events; secrets must never be returned to the browser.
 */
export const superAdminService = {
  getDashboard: () => get<ApiRecord>(API_ENDPOINTS.superAdminDashboard),
  listOrganizations: (query?: PageRequest) =>
    get<PageResult<ApiRecord>>(API_ENDPOINTS.organizations, query),
  createOrganization: (payload: ApiRecord) =>
    post<ApiRecord>(API_ENDPOINTS.organizations, payload),
  getOrganization: (organizationId: Identifier) =>
    get<ApiRecord>(API_ENDPOINTS.organization(organizationId)),
  updateOrganization: (organizationId: Identifier, payload: ApiRecord) =>
    put<ApiRecord>(API_ENDPOINTS.organization(organizationId), payload),
  updateOrganizationStatus: (
    organizationId: Identifier,
    payload: StatusUpdate,
  ) =>
    patch<ApiRecord>(API_ENDPOINTS.organizationStatus(organizationId), payload),
  listRoles: () => get<ApiRecord[]>(API_ENDPOINTS.roles),
  createRole: (payload: ApiRecord) =>
    post<ApiRecord>(API_ENDPOINTS.roles, payload),
  updateRole: (roleId: Identifier, payload: ApiRecord) =>
    put<ApiRecord>(API_ENDPOINTS.role(roleId), payload),
  deleteRole: (roleId: Identifier) => del<void>(API_ENDPOINTS.role(roleId)),
  listPermissions: () => get<ApiRecord[]>(API_ENDPOINTS.permissions),
  assignRolePermissions: (roleId: Identifier, payload: PermissionAssignment) =>
    put<ApiRecord>(API_ENDPOINTS.rolePermissions(roleId), payload),
  listAdmins: (query?: PageRequest) =>
    get<PageResult<ApiRecord>>(API_ENDPOINTS.platformAdmins, query),
  createAdmin: (payload: ApiRecord) =>
    post<ApiRecord>(API_ENDPOINTS.platformAdmins, payload),
  updateAdmin: (adminId: Identifier, payload: ApiRecord) =>
    put<ApiRecord>(API_ENDPOINTS.platformAdmin(adminId), payload),
  updateAdminStatus: (adminId: Identifier, payload: StatusUpdate) =>
    patch<ApiRecord>(API_ENDPOINTS.platformAdminStatus(adminId), payload),
  listSubscriptions: (query?: PageRequest) =>
    get<PageResult<ApiRecord>>(API_ENDPOINTS.subscriptions, query),
  updateSubscription: (subscriptionId: Identifier, payload: ApiRecord) =>
    put<ApiRecord>(API_ENDPOINTS.subscription(subscriptionId), payload),
  getAnalytics: (query?: PageRequest) =>
    get<ApiRecord>(API_ENDPOINTS.platformAnalytics, query),
  getSystemConfiguration: () =>
    get<ApiRecord>(API_ENDPOINTS.systemConfiguration),
  updateSystemConfiguration: (payload: ApiRecord) =>
    put<ApiRecord>(API_ENDPOINTS.systemConfiguration, payload),
  listAuditLogs: (query?: PageRequest) =>
    get<PageResult<ApiRecord>>(API_ENDPOINTS.auditLogs, query),
  getPlatformConfiguration: () =>
    get<ApiRecord>(API_ENDPOINTS.platformConfiguration),
  updatePlatformConfiguration: (payload: ApiRecord) =>
    put<ApiRecord>(API_ENDPOINTS.platformConfiguration, payload),
  getNotifications: () => get<ApiRecord[]>(API_ENDPOINTS.superAdminNotifications),
};
