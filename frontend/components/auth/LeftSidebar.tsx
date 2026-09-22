import BrandLogo from "./BrandLogo";
import FeatureTimeline from "./FeatureTimeline";
import LoginIllustration from "./LoginIllustration";

export type SidebarVariant = "login" | "signup" | "generic";

const COPY: Record<SidebarVariant, { heading: React.ReactNode; body: string }> =
  {
    login: {
      heading: (
        <>
          Welcome back to
          <br />
          <span className="text-secondary-10">Deligh Campus</span>
        </>
      ),
      body: "Pick up where you left off — courses, assessments, and your career progress are all in one place.",
    },
    signup: {
      heading: (
        <>
          Built for <span className="text-secondary-10">Smarter</span>
          <br />
          Education
        </>
      ),
      body: "Create your account and get a structured path from learning to a job-ready, verified profile.",
    },
    generic: {
      heading: (
        <>
          Learning, assessment
          <br />
          and career growth —{" "}
          <span className="text-secondary-10">together</span>
        </>
      ),
      body: "Deligh Campus connects courses, skill assessments, and career readiness in one trusted platform.",
    },
  };

export default function LeftSidebar({
  variant = "generic",
}: {
  variant?: SidebarVariant;
}) {
  const copy = COPY[variant];

  return (
    <div className="relative hidden w-full max-w-md flex-col justify-between overflow-hidden rounded-3xl bg-deligh-gradient p-8 text-white lg:flex">
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 top-1/3 h-48 w-48 rounded-full bg-secondary-20/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-72 rounded-full bg-primary-10/10 blur-3xl" />

      <div className="relative z-10">
        <BrandLogo variant="full" theme="dark" size={38} href="/" />

        <div className="mt-10">
          <h1 className="text-3xl font-bold leading-tight text-white">
            {copy.heading}
          </h1>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            {copy.body}
          </p>
        </div>

        <FeatureTimeline />
      </div>

      <div className="relative z-10 mt-10 flex justify-center">
        <LoginIllustration />
      </div>
    </div>
  );
}
