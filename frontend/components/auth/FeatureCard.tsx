import type { Feature } from "@/data/features";

export default function FeatureCard({
  icon: Icon,
  title,
  description,
}: Feature) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/25">
        <Icon className="h-4.5 w-4.5 text-secondary-20" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="block text-xs text-white/60">{description}</span>
      </span>
    </li>
  );
}
