export default function StudentLoading() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Loading your learning data"
    >
      <div className="h-44 animate-pulse rounded-3xl bg-grey-20/60" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-2xl bg-grey-20/60"
          />
        ))}
      </div>
    </div>
  );
}
