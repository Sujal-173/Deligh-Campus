import type { LucideIcon } from "lucide-react";
import {
  GraduationCap,
  ClipboardCheck,
  Award,
  UserCheck,
  Briefcase,
} from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    icon: GraduationCap,
    title: "Learning",
    description: "Build practical soft skills",
  },
  {
    icon: ClipboardCheck,
    title: "Assessment",
    description: "Evaluate and measure growth",
  },
  {
    icon: Award,
    title: "Certificate",
    description: "Earn verified credentials",
  },
  {
    icon: UserCheck,
    title: "Verified Talent",
    description: "Showcase your capabilities",
  },
  {
    icon: Briefcase,
    title: "Recruitment",
    description: "Get discovered by top recruiters",
  },
];
