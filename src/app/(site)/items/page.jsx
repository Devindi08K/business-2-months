import Image from "next/image";
import Link from "next/link";
import connectDB from "@/lib/db";
import Item from "@/models/Item";
import Category from "@/models/Category";
import { getSiteSettings, formatPrice } from "@/lib/settings";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return {
    title: settings.itemLabels?.plural || "Menu",
  };
}

export default async function ItemsPage() {
  const settings = await getSiteSettings();
  let categories = [];
  let items = [];
  try {
    await connectDB();
    [categories, items] = await Promise.all([
      Category.find({ isActive: true }).sort({ order: 1 }).lean(),
      Item.find({ isAvailable: true })
        .populate("category", "name slug")
        .sort({ order: 1 })
        .lean(),
    ]);
  } catch (err) {
    console.warn("[items] DB load error:", err?.message);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-32 md:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            {settings.itemLabels?.plural || "Menu"}
          </h1>
          <p className="mt-3 max-w-xl text-[var(--color-muted)]">
            Browse our {settings.itemLabels?.plural?.toLowerCase() || "offerings"} crafted with fresh, seasonal ingredients.
          </p>
        </div>
        <Link
          href="/booking"
          className="inline-flex w-fit rounded-md bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Book a Table
        </Link>
      </div>

      {categories.length > 1 ? (
        <div className="mt-8 flex flex-wrap gap-2 border-b border-[var(--color-foreground)]/10 pb-4">
          {categories.map((cat) => (
            <a
              key={String(cat._id)}
              href={`#${cat.slug}`}
              className="rounded-full bg-[var(--color-accent)] px-4 py-1.5 text-xs font-semibold text-[var(--color-foreground)] transition hover:bg-[var(--color-primary)] hover:text-white"
            >
              {cat.name}
            </a>
          ))}
        </div>
      ) : null}

      <div className="mt-12 space-y-14">
        {categories.map((cat) => {
          const catItems = items.filter(
            (i) => String(i.category?._id || i.category) === String(cat._id)
          );
          if (!catItems.length) return null;
          return (
            <section key={String(cat._id)} id={cat.slug} className="scroll-mt-28">
              <h2 className="font-heading text-2xl font-semibold border-b border-[var(--color-foreground)]/10 pb-2">
                {cat.name}
              </h2>
              <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {catItems.map((item) => (
                  <article key={String(item._id)} className="group rounded-xl border border-transparent p-2 transition hover:border-[var(--color-foreground)]/10 hover:bg-white/40">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[var(--color-accent)]">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="(max-width:768px) 100vw, 33vw"
                        />
                      ) : null}
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-3">
                      <h3 className="font-heading text-lg font-semibold">
                        {item.title}
                      </h3>
                      {item.price != null ? (
                        <span className="shrink-0 text-sm font-semibold text-[var(--color-primary)]">
                          {formatPrice(item.price, settings.currency)}
                        </span>
                      ) : null}
                    </div>
                    {item.description ? (
                      <p className="mt-1 text-sm text-[var(--color-muted)] leading-relaxed">
                        {item.description}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-16 rounded-xl border border-[var(--color-foreground)]/10 bg-white/60 p-6 text-center">
        <h3 className="font-heading text-lg font-semibold">Dietary & Allergen Information</h3>
        <p className="mt-2 text-sm text-[var(--color-muted)] max-w-2xl mx-auto">
          Please inform our staff of any allergies or dietary restrictions when ordering or booking. Vegetarian, vegan, and gluten-free adaptations are available upon request.
        </p>
      </div>
    </main>
  );
}

