import type { LucideIcon } from "lucide-react";
import { GraduationCap, Presentation, Briefcase, Landmark, Shield, ShieldAlert } from "lucide-react";
import type { Role } from "@/types/auth";

export interface RoleOption {
  id: Role;
  label: string;
  icon: LucideIcon;
}

// Roles available for public signup
export const SIGNUP_ROLES: RoleOption[] = [
  { id: "student", label: "Student", icon: GraduationCap },
  { id: "trainer", label: "Trainer", icon: Presentation },
  { id: "recruiter", label: "Recruiter", icon: Briefcase },
  { id: "institution", label: "Institution", icon: Landmark },
];

// All roles including admin roles (for display purposes)
export const ROLES: RoleOption[] = [
  ...SIGNUP_ROLES,
  { id: "admin", label: "Admin", icon: Shield },
  { id: "super_admin", label: "Super Admin", icon: ShieldAlert },
];
