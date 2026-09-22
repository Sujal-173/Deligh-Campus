import { cn } from "@/lib/utils";

export default function ProgressBar({
  label,
  percent,
  sublabel,
  color = "bg-secondary",
  className,
}: {
  label: string;
  percent: number;
  sublabel?: string;
  color?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-primary">{label}</span>
        <span className="text-xs text-grey-60">
          {sublabel ?? `${clamped}%`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-grey-20">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
