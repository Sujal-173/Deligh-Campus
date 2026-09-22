export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  mobile?: string | null;
  emailVerified: boolean;
  active: boolean;
  locked: boolean;
  roles: string[];
  roleTitle?: string | null;
  createdAt: string;
}

export interface AdminBatch {
  id: string;
  name: string;
  course_title?: string | null;
  trainer_name?: string | null;
  student_count: number;
  status: string;
  start_date?: string | null;
  end_date?: string | null;
}

export type ApiRecord = Readonly<Record<string, unknown>>;
export type Identifier = string;
export type PageRequest = Readonly<
  Record<string, string | number | boolean | undefined>
>;
export interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}
export interface StatusUpdate {
  status: "active" | "inactive";
  reason?: string;
}
export interface DecisionPayload {
  decision: "approve" | "reject";
  reason?: string;
}
export interface PermissionAssignment {
  permissionIds: Identifier[];
}
export interface RoleAssignment {
  roleIds: Identifier[];
}
export interface ExportRequest {
  format: "csv" | "xlsx" | "pdf";
  filters?: Record<string, unknown>;
}
