import type { Metadata } from "next";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Create Account — Deligh Campus" };

export default function SignupPage() {
  return <SignupForm />;
}
