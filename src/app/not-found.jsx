import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-start justify-center px-4 pt-28 md:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-secondary)]">
        404
      </p>
      <h1 className="mt-2 font-heading text-4xl font-semibold">
        This page wandered off
      </h1>
      <p className="mt-3 text-[var(--color-muted)]">
        The link may be broken or the page may have been removed.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white"
      >
        Back home
      </Link>
    </main>
  );
}
