import type { Role } from "./auth";

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile?: string;
  role: Role;
  emailVerified: boolean;
  profileComplete: boolean;
  avatarUrl?: string;
  roleTitle?: string;
  about?: string;
  gender?: string;
  organizationId?: string;
}
