export default function TrainerLoading() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Loading trainer data"
    >
      <div className="h-24 animate-pulse rounded-2xl bg-grey-20/60" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl bg-grey-20/60"
          />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl bg-grey-20/60" />
        <div className="h-72 animate-pulse rounded-2xl bg-grey-20/60" />
      </div>
    </div>
  );
}
