import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Deligh Campus wordmark.
 * - "mark": just the rounded square C/cap icon (tight spaces — sidebars, favicons)
 * - "full": icon + stacked "Deligh / Campus" text (top nav bars, matches the
 *   student dashboard reference screenshots)
 * - "lockup": the official horizontal lockup image incl. tagline (marketing
 *   pages, auth screens, anywhere there's room to breathe)
 *
 * Pass `href` to make it clickable (wraps in a Next.js Link) — every usage
 * in the app does this. Omit it only if the logo sits somewhere navigation
 * would be confusing (e.g. inside a disabled/loading state).
 */
export default function BrandLogo({
  variant = "full",
  size = 40,
  theme = "light",
  className,
  href,
}: {
  variant?: "mark" | "full" | "lockup";
  size?: number;
  theme?: "light" | "dark";
  className?: string;
  href?: string;
}) {
  let content: React.ReactNode;

  if (variant === "lockup") {
    content = (
      <div
        className={cn("relative", className)}
        style={{ height: size, width: size * 3.9 }}
      >
        <Image
          src="/logo/logo-horizontal.png"
          alt="Deligh Campus"
          fill
          className="object-contain object-left"
          priority
        />
      </div>
    );
  } else if (variant === "mark") {
    content = (
      <div
        className={cn("relative shrink-0", className)}
        style={{ height: size, width: size }}
      >
        <Image
          src="/logo/logo-icon.png"
          alt="Deligh Campus"
          fill
          className="object-contain"
          sizes={`${size}px`}
          priority
        />
      </div>
    );
  } else {
    content = (
      <div className={cn("flex items-center gap-2", className)}>
        <div
          className="relative shrink-0"
          style={{ height: size, width: size }}
        >
          <Image
            src="/logo/logo-icon.png"
            alt=""
            fill
            className="object-contain"
            sizes={`${size}px`}
            priority
          />
        </div>
        <div className="leading-none">
          <p
            className="font-display font-bold tracking-tight"
            style={{
              fontSize: size * 0.42,
              color: theme === "dark" ? "#FFFFFF" : "#000052",
            }}
          >
            Deligh
          </p>
          <p
            className="font-display font-bold tracking-tight -mt-0.5"
            style={{
              fontSize: size * 0.42,
              color: theme === "dark" ? "#AFB9F6" : "#6366F1",
            }}
          >
            Campus
          </p>
        </div>
      </div>
    );
  }

  if (!href) return content;

  return (
    <Link
      href={href}
      aria-label="Deligh Campus — go to home"
      className="inline-flex rounded-lg transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
    >
      {content}
    </Link>
  );
}
