"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCog } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useUserStore } from "@/store/userStore";
import { getRoleHome } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthHeader from "@/components/auth/AuthHeader";

export default function CompleteProfilePage() {
  const router = useRouter();
  const setProfile = useUserStore((s) => s.setProfile);
  const [organization, setOrganization] = useState("");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const user = await authService.completeProfile({ organization, bio });
      setProfile({ ...user, profileComplete: true, mobile: undefined });
      router.push(getRoleHome(user.role));
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : "Your profile could not be saved. Please sign in again and retry.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <AuthHeader
        title="Complete Your Profile"
        subtitle="A few more details to help us personalize your experience."
      />

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="organization">College / Organization</Label>
          <Input
            id="organization"
            placeholder="Where do you study or work?"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="bio">Short Bio</Label>
          <textarea
            id="bio"
            rows={4}
            placeholder="Tell recruiters and trainers a bit about yourself"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-lg border border-grey-20 px-3 py-2.5 text-sm text-primary placeholder:text-grey-40 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-10"
          />
        </div>

        {submitError && (
          <p
            role="alert"
            className="rounded-lg bg-error-10 px-3 py-2 text-sm text-error"
          >
            {submitError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          <UserCog className="h-4 w-4" />
          {isSubmitting ? "Saving\u2026" : "Save & Continue"}
        </Button>
      </form>
    </>
  );
}
