"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { MailCheck, Loader2, XCircle } from "lucide-react";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import AuthHeader from "@/components/auth/AuthHeader";

type Status = "pending" | "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

function ResendButton({ email }: { email: string | null }) {
  const [sending, setSending] = useState(false);

  async function handleResend() {
    if (!email) {
      toast.error(
        "We don't have your email on this screen — please sign up again.",
      );
      return;
    }
    setSending(true);
    try {
      await authService.resendVerification(email);
      toast.success(`Verification email resent to ${email}.`);
    } catch {
      toast.error("Couldn't resend right now — try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleResend}
      disabled={sending}
    >
      {sending ? "Sending…" : "Resend Verification Email"}
    </Button>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [status, setStatus] = useState<Status>(token ? "verifying" : "pending");

  useEffect(() => {
    if (!token) return;
    authService
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  if (status === "pending") {
    return (
      <>
        <AuthHeader
          title="Verify Your Email"
          subtitle={
            email
              ? `We've sent a verification link to ${email}.`
              : "We've sent a verification link to your email address."
          }
        />
        <div className="mt-8 flex flex-col items-center gap-4 rounded-lg bg-secondary-10 p-6 text-center">
          <MailCheck className="h-8 w-8 text-secondary" />
          <p className="text-sm text-grey-60">
            Click the link in that email to activate your account. Didn&apos;t
            get it? Check your spam folder or request a new one below.
          </p>
          <ResendButton email={email} />
        </div>
      </>
    );
  }

  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        <p className="text-sm text-grey-50">Verifying your email…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <XCircle className="h-8 w-8 text-error" />
        <p className="text-sm text-grey-60">
          That verification link is invalid or has expired.
        </p>
        <ResendButton email={email} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <MailCheck className="h-8 w-8 text-success" />
      <p className="text-sm font-medium text-primary">
        Your email is verified!
      </p>
      <Button asChild className="mt-2 w-full">
        <Link href="/complete-profile">Continue</Link>
      </Button>
    </div>
  );
}
