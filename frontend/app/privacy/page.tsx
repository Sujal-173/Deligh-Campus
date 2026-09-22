import Link from "next/link";
export default function Page() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <Link
        href="/signup"
        className="text-sm font-medium text-secondary hover:underline"
      >
        ← Back to signup
      </Link>
      <h1 className="mt-8 font-display text-4xl font-bold text-primary">
        Privacy Policy
      </h1>
      <p className="mt-5 rounded-2xl border border-warning-30 bg-warning-10 p-5 text-sm leading-6 text-grey-70">
        The approved Privacy Policy will be published here before production
        launch.
      </p>
    </main>
  );
}
