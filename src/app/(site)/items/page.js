import Image from "next/image";
import connectDB from "@/lib/db";
import Item from "@/models/Item";
import Category from "@/models/Category";
import { getSiteSettings, formatPrice } from "@/lib/settings";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return {
    title: settings.itemLabels?.plural || "Items",
  };
}

export default async function ItemsPage() {
  const settings = await getSiteSettings();
  await connectDB();
  const [categories, items] = await Promise.all([
    Category.find({ isActive: true }).sort({ order: 1 }).lean(),
    Item.find({ isAvailable: true })
      .populate("category", "name slug")
      .sort({ order: 1 })
      .lean(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-32 md:px-6">
      <h1 className="font-heading text-4xl font-semibold md:text-5xl">
        {settings.itemLabels?.plural || "Menu"}
      </h1>
      <p className="mt-3 max-w-xl text-[var(--color-muted)]">
        Browse our {settings.itemLabels?.plural?.toLowerCase() || "offerings"} by{" "}
        {(settings.itemLabels?.category || "category").toLowerCase()}.
      </p>

      <div className="mt-12 space-y-14">
        {categories.map((cat) => {
          const catItems = items.filter(
            (i) => String(i.category?._id || i.category) === String(cat._id)
          );
          if (!catItems.length) return null;
          return (
            <section key={String(cat._id)} id={cat.slug}>
              <h2 className="font-heading text-2xl font-semibold">{cat.name}</h2>
              <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {catItems.map((item) => (
                  <article key={String(item._id)}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[var(--color-accent)]">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
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
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
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
    </main>
  );
}
