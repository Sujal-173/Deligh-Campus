"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/data/dashboardNav";

export default function DashboardSidebar({
  items,
  label,
  eyebrow,
  open,
  onClose,
}: {
  items: readonly NavItem[];
  label?: string;
  eyebrow?: string;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-primary/45 backdrop-blur-sm lg:hidden"
        />
      ) : null}
      <aside
        aria-label={`${label ?? "Dashboard"} navigation`}
        className={cn(
          "fixed inset-y-16 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-primary-80 bg-primary px-3 py-5 transition-transform lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-2 pb-4 lg:hidden">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">{eyebrow ?? "Workspace"}</p>
            <p className="mt-0.5 font-display text-sm font-semibold text-white">{label ?? "Deligh Campus"}</p>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="hidden border-b border-white/10 px-2 pb-4 lg:block">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">{eyebrow ?? "Workspace"}</p>
          <p className="mt-0.5 font-display text-sm font-semibold text-white">{label ?? "Deligh Campus"}</p>
        </div>

        <nav className="scrollbar-thin mt-5 flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-white shadow-sm"
                    : "text-white/75 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <p className="px-3 pt-4 text-[10px] leading-relaxed text-white/40">
          Access is permission-aware. The API remains the authorization authority.
        </p>
      </aside>
    </>
  );
}
