import Link from "next/link";
import { ArrowUpRight, DatabaseZap, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DashboardDefinition } from "@/data/dashboardNav";

export default function AdminOverview({
  config,
}: {
  config: DashboardDefinition;
}) {
  const sections = config.nav.slice(1);
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-deligh-gradient px-6 py-8 text-white sm:px-9 sm:py-10">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/15" />
        <div className="absolute -right-4 -top-10 h-40 w-40 rounded-full border border-white/10" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure workspace
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold text-white sm:text-4xl">
            {config.label} control center
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/72">
            Your operational modules are ready for Spring Boot integration. Live
            figures will appear only when authorized API responses are
            available.
          </p>
        </div>
      </section>
      <section aria-labelledby="workspace-modules">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
              Configured access
            </p>
            <h2 id="workspace-modules" className="mt-2 text-2xl font-bold">
              Workspace modules
            </h2>
          </div>
          <span className="hidden items-center gap-2 text-xs text-grey-60 sm:flex">
            <DatabaseZap className="h-4 w-4 text-secondary" />
            No placeholder business data
          </span>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl focus-visible:outline-none"
              >
                <Card className="flex h-full min-h-36 flex-col justify-between p-5 transition group-hover:-translate-y-0.5 group-hover:border-secondary-30 group-hover:shadow-card-hover">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-10 text-secondary-90">
                      <Icon className="h-5 w-5" />
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-grey-40 transition group-hover:text-secondary" />
                  </div>
                  <div className="mt-5">
                    <h3 className="font-semibold text-primary">{item.label}</h3>
                    <p className="mt-1 text-xs text-grey-50">
                      Permission: {item.permission ?? "authenticated"}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
