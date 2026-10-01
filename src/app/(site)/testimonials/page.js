import connectDB from "@/lib/db";
import Testimonial from "@/models/Testimonial";

export const metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  await connectDB();
  const testimonials = await Testimonial.find({ isActive: true })
    .sort({ order: 1 })
    .lean();

  return (
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-32 md:px-6">
      <h1 className="font-heading text-4xl font-semibold md:text-5xl">
        Testimonials
      </h1>
      <div className="mt-12 space-y-10">
        {testimonials.map((t) => (
          <blockquote
            key={String(t._id)}
            className="border-l-2 border-[var(--color-secondary)] pl-5"
          >
            <p className="text-lg leading-relaxed">“{t.content}”</p>
            <footer className="mt-3 text-sm font-medium">
              {t.name}
              {t.title ? (
                <span className="text-[var(--color-muted)]"> · {t.title}</span>
              ) : null}
              <span className="ml-2 text-[var(--color-secondary)]" aria-label={`${t.rating} stars`}>
                {"★".repeat(t.rating || 5)}
              </span>
            </footer>
          </blockquote>
        ))}
      </div>
    </main>
  );
}
