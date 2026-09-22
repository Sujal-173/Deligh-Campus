export default function Divider({ label = "OR" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-xs text-grey-40">
      <div className="h-px flex-1 bg-grey-20" />
      {label}
      <div className="h-px flex-1 bg-grey-20" />
    </div>
  );
}
