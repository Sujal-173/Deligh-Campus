import Spinner from "./Spinner";

export default function Loading({
  label = "Loading\u2026",
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-grey-50">
      <Spinner className="h-6 w-6" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
