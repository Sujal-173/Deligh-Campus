export type Role =
  | "super_admin"
  | "admin"
  | "student"
  | "trainer"
  | "recruiter"
  | "institution"
  | "user";
export type SystemRole = Role;
export type SignupRole = "student" | "trainer" | "recruiter" | "institution";
export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}
export interface SignupPayload {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  role: SignupRole;
}
export interface ForgotPasswordPayload {
  email: string;
}
export interface ResetPasswordPayload {
  token: string;
  password: string;
}
export interface BackendLoginData {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  userId: string;
  fullName: string;
  email: string;
  roles: string[];
  emailVerified?: boolean;
}
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: SystemRole;
  roles: SystemRole[];
  emailVerified: boolean;
}
/** Tokens intentionally never enter client state. */
export interface AuthResponse {
  user: AuthUser;
}
