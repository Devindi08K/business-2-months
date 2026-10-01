import Link from "next/link";
import connectDB from "@/lib/db";
import Testimonial from "@/models/Testimonial";

export const metadata = { title: "Guest Testimonials" };

export default async function TestimonialsPage() {
  let testimonials = [];
  try {
    await connectDB();
    testimonials = await Testimonial.find({ isActive: true })
      .sort({ order: 1 })
      .lean();
  } catch (err) {
    console.warn("[testimonials] DB load error:", err?.message);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-32 md:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            Guest Testimonials
          </h1>
          <p className="mt-3 max-w-xl text-[var(--color-muted)]">
            Read what our patrons and guests have to say about their dining experience with us.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-3">
          <span className="text-xl font-bold text-[var(--color-primary)]">5.0</span>
          <div>
            <div className="text-amber-500 text-sm">★★★★★</div>
            <p className="text-xs text-[var(--color-muted)]">Verified guest ratings</p>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <article
            key={String(t._id)}
            className="flex flex-col justify-between rounded-xl border border-[var(--color-foreground)]/10 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:shadow-md"
          >
            <div>
              <div className="mb-3 text-amber-500" aria-label={`${t.rating || 5} stars`}>
                {"★".repeat(t.rating || 5)}
              </div>
              <p className="text-[var(--color-foreground)]/90 leading-relaxed italic">
                “{t.content}”
              </p>
            </div>
            <footer className="mt-6 border-t border-black/5 pt-4 text-sm font-medium">
              <span className="text-[var(--color-foreground)] font-semibold">{t.name}</span>
              {t.title ? (
                <span className="block text-xs text-[var(--color-muted)] mt-0.5">{t.title}</span>
              ) : null}
            </footer>
          </article>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] p-8 text-white md:p-12 text-center">
        <h2 className="font-heading text-2xl md:text-3xl font-semibold">Join Us for Your Next Memory</h2>
        <p className="mt-2 text-white/80 max-w-xl mx-auto text-sm md:text-base">
          Reserve your table today and experience our culinary hospitality firsthand.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/booking"
            className="rounded-md bg-[var(--color-secondary)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-dark)] transition hover:brightness-105"
          >
            Book a Reservation
          </Link>
          <Link
            href="/contact"
            className="rounded-md border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}

