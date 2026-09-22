import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import BrandLogo from "@/components/auth/BrandLogo";
import { ROLES } from "@/data/roles";
import { FEATURES } from "@/data/features";
import { TESTIMONIALS } from "@/data/testimonials";
import {
  ArrowRight,
  ArrowUpRight,
  Mic2,
  Compass,
  Users2,
  Puzzle,
  Wind,
  HeartHandshake,
  Quote,
} from "lucide-react";

const SKILL_AXES = [
  {
    label: "Communication",
    value: 90,
    icon: Mic2,
    top: "3%",
    left: "50%",
    align: "top" as const,
  },
  {
    label: "Leadership",
    value: 78,
    icon: Compass,
    top: "26.5%",
    left: "82.4%",
    align: "left" as const,
  },
  {
    label: "Teamwork",
    value: 95,
    icon: Users2,
    top: "73.5%",
    left: "82.4%",
    align: "left" as const,
  },
  {
    label: "Problem Solving",
    value: 85,
    icon: Puzzle,
    top: "97%",
    left: "50%",
    align: "top" as const,
  },
  {
    label: "Adaptability",
    value: 72,
    icon: Wind,
    top: "73.5%",
    left: "17.6%",
    align: "right" as const,
  },
  {
    label: "Emotional Intelligence",
    value: 88,
    icon: HeartHandshake,
    top: "26.5%",
    left: "17.6%",
    align: "right" as const,
  },
];

const STATS = [
  { value: "10K+", label: "learners assessed" },
  { value: "6", label: "core soft skills tracked" },
  { value: "500+", label: "hiring partners" },
  { value: "98%", label: "would recommend" },
];

export default function HomePage() {
  return (
    <main className="bg-white text-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-grey-20/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <BrandLogo variant="full" theme="light" size={40} href="/" />
          <nav className="hidden items-center gap-8 text-sm font-medium text-grey-60 md:flex">
            <a href="#skills" className="transition hover:text-primary">
              Skills
            </a>
            <a href="#journey" className="transition hover:text-primary">
              How it works
            </a>
            <a href="#roles" className="transition hover:text-primary">
              Who it&apos;s for
            </a>
            <a href="#stories" className="transition hover:text-primary">
              Stories
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-secondary-20/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-warning-10 blur-3xl" />

        <div className="mx-auto grid max-w-7xl gap-16 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-28 lg:pt-24">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary-20 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-secondary-90 shadow-sm">
              Soft skills, hard proof
            </span>

            <h1 className="mt-7 text-5xl font-black leading-[1.05] tracking-tight text-primary lg:text-6xl">
              The skills that get you hired
              <br className="hidden lg:block" />
              aren&apos;t on your transcript.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-grey-60">
              Communication, leadership, teamwork, judgment. Deligh Campus turns
              the soft skills employers actually screen for into practiced,
              assessed, and verifiable strengths &mdash; so what&apos;s on your
              profile is proof, not just a promise.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/signup">
                <Button size="lg">
                  Start Building Skills
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  I already have an account
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-primary">{s.value}</p>
                  <p className="text-xs text-grey-50">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Signature element: live skill radar */}
          <div id="skills" className="relative z-10 mx-auto w-full max-w-md">
            <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-grey-20 sm:p-8">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-primary">
                    Your Skill Radar
                  </p>
                  <p className="text-xs text-grey-50">
                    Live assessment snapshot
                  </p>
                </div>
                <span className="rounded-full bg-success-10 px-3 py-1 text-xs font-semibold text-success-80">
                  Verified
                </span>
              </div>

              <div className="relative mx-auto mt-4 aspect-square w-full max-w-[380px]">
                <svg viewBox="0 0 400 400" className="h-full w-full">
                  <polygon
                    points="200,50 329.9,125 329.9,275 200,350 70.1,275 70.1,125"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  <polygon
                    points="200,87.5 297.4,143.8 297.4,256.2 200,312.5 102.6,256.2 102.6,143.8"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  <polygon
                    points="200,125 265,162.5 265,237.5 200,275 135,237.5 135,162.5"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  <polygon
                    points="200,162.5 232.5,181.2 232.5,218.8 200,237.5 167.5,218.8 167.5,181.2"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />

                  <line
                    x1="200"
                    y1="200"
                    x2="200"
                    y2="50"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  <line
                    x1="200"
                    y1="200"
                    x2="329.9"
                    y2="125"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  <line
                    x1="200"
                    y1="200"
                    x2="329.9"
                    y2="275"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  <line
                    x1="200"
                    y1="200"
                    x2="200"
                    y2="350"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  <line
                    x1="200"
                    y1="200"
                    x2="70.1"
                    y2="275"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  <line
                    x1="200"
                    y1="200"
                    x2="70.1"
                    y2="125"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />

                  <defs>
                    <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#7881F3"
                        stopOpacity="0.55"
                      />
                      <stop
                        offset="100%"
                        stopColor="#4325D9"
                        stopOpacity="0.25"
                      />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="200,65 301.3,141.5 323.4,271.2 200,327.5 106.5,254 85.7,134"
                    fill="url(#radarFill)"
                    stroke="#4325D9"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  {[
                    [200, 65],
                    [301.3, 141.5],
                    [323.4, 271.2],
                    [200, 327.5],
                    [106.5, 254],
                    [85.7, 134],
                  ].map(([x, y], i) => (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="4.5"
                      fill="#000052"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                  ))}

                  <circle
                    cx="200"
                    cy="200"
                    r="34"
                    fill="white"
                    stroke="#C3CBF6"
                    strokeWidth="6"
                  />
                  <text
                    x="200"
                    y="196"
                    textAnchor="middle"
                    fontSize="22"
                    fontWeight="800"
                    fill="#000052"
                  >
                    87
                  </text>
                  <text
                    x="200"
                    y="212"
                    textAnchor="middle"
                    fontSize="9"
                    fill="#4325D9"
                    letterSpacing="0.5"
                  >
                    SCORE
                  </text>
                </svg>

                {SKILL_AXES.map((axis) => {
                  const Icon = axis.icon;
                  const justify =
                    axis.align === "top"
                      ? "items-center text-center"
                      : axis.align === "left"
                        ? "items-start text-left"
                        : "items-end text-right";
                  return (
                    <div
                      key={axis.label}
                      className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col ${justify}`}
                      style={{ top: axis.top, left: axis.left }}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-10 text-secondary-90 ring-4 ring-white">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="mt-1 w-20 text-[10px] font-semibold leading-tight text-grey-50">
                        {axis.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="border-t border-grey-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
              Who it&apos;s for
            </p>
            <h2 className="mt-3 text-3xl font-bold text-primary lg:text-4xl">
              Built for everyone in the room
            </h2>
            <p className="mt-4 text-grey-60">
              Soft skills aren&apos;t built in isolation. Deligh Campus gives
              every part of the journey &mdash; learning, teaching, hiring, and
              certifying &mdash; its own workspace.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ROLE_COPY.map(({ role, blurb }) => {
              const Icon =
                ROLES.find((r) => r.id === role.id)?.icon ?? ROLES[0].icon;
              return (
                <div
                  key={role.id}
                  className="group rounded-2xl border border-grey-20 p-6 transition hover:-translate-y-1 hover:border-secondary-30 hover:shadow-lg"
                >
                  <span className="inline-flex rounded-xl bg-secondary-10 p-3 text-secondary-90 transition group-hover:bg-secondary group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-primary">
                    {role.label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-grey-50">
                    {blurb}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section id="journey" className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
            The journey
          </p>
          <h2 className="mt-3 text-3xl font-bold text-primary lg:text-4xl">
            From practice to proof, in five steps
          </h2>
        </div>

        <ol className="mt-14 grid gap-8 md:grid-cols-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <li key={f.title} className="relative">
                <div className="flex items-center gap-3 md:block">
                  <span className="text-4xl font-black text-secondary-10 md:text-5xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="inline-flex rounded-xl bg-secondary p-2.5 text-white md:mt-3">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-primary">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-grey-50">
                  {f.description}
                </p>
                {i < FEATURES.length - 1 && (
                  <div className="mt-6 hidden h-px w-full bg-gradient-to-r from-secondary-20 to-transparent md:block" />
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {/* Testimonials */}
      <section id="stories" className="border-t border-grey-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
            Real outcomes
          </p>
          <h2 className="mt-3 text-3xl font-bold text-primary lg:text-4xl">
            What proof of skill actually changes
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-3xl bg-white p-8 ring-1 ring-grey-20"
              >
                <Quote className="h-6 w-6 text-secondary-30" />
                <p className="mt-4 text-lg leading-relaxed text-primary">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      {t.name}
                    </p>
                    <p className="text-xs text-grey-50">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-80 to-secondary-90 py-24">
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-primary-10/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-bold text-white lg:text-5xl">
            Your soft skills are already there.
            <br />
            Let&apos;s make them visible.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-white/70">
            Create a profile, take your first assessment, and start turning
            practice into a credential employers trust.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="mt-10 bg-white px-10 text-primary hover:bg-white/90"
            >
              Get Started Free
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-grey-20 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-grey-50 sm:flex-row">
          <BrandLogo variant="full" theme="light" size={30} href="/" />
          <p>
            &copy; {new Date().getFullYear()} Deligh Campus. All rights
            reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

const ROLE_COPY = [
  {
    role: ROLES[0],
    blurb:
      "Practice real scenarios, get assessed, and turn communication and teamwork into a verified profile employers trust.",
  },
  {
    role: ROLES[1],
    blurb:
      "Design skill-building sessions, track learner progress, and see the impact of your coaching in outcomes, not attendance.",
  },
  {
    role: ROLES[2],
    blurb:
      "Filter for verified soft skills instead of guessing from a resume, and cut first-round interviews significantly.",
  },
  {
    role: ROLES[3],
    blurb:
      "Give every student a structured path from classroom learning to a portfolio of certified, job-ready skills.",
  },
];
