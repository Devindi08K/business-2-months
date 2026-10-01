import Link from "next/link";
import Image from "next/image";
import connectDB from "@/lib/db";
import Item from "@/models/Item";
import Testimonial from "@/models/Testimonial";
import { getSiteSettings, formatPrice } from "@/lib/settings";
import { getDictionary } from "@/lib/i18n";
import siteConfig from "../../../site.config";

export default async function HomePage() {
  let settings;
  try {
    settings = await getSiteSettings();
  } catch {
    settings = {
      businessName: siteConfig.businessName,
      hero: {
        ...siteConfig.hero,
        image:
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80",
      },
      about: siteConfig.about,
      currency: siteConfig.currency,
    };
  }

  const dict = getDictionary("en");
  let featured = [];
  let testimonials = [];

  try {
    await connectDB();
    [featured, testimonials] = await Promise.all([
      Item.find({ isAvailable: true, featured: true })
        .populate("category", "name")
        .sort({ order: 1 })
        .limit(3)
        .lean(),
      Testimonial.find({ isActive: true }).sort({ order: 1 }).limit(3).lean(),
    ]);
  } catch (err) {
    console.error("[home] content load failed", err.message);
  }

  const hero = settings.hero || {};

  return (
    <>
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0 animate-hero-image">
          {hero.image ? (
            <Image
              src={hero.image}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div className="h-full w-full bg-[var(--color-primary-dark)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/20" />
        </div>

        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-20 pt-32 md:px-6 md:pb-28">
          <p className="animate-fade-up font-heading text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-secondary)]">
            {settings.businessName}
          </p>
          <h1 className="animate-fade-up mt-3 max-w-3xl font-heading text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
            {hero.headline}
          </h1>
          <p className="animate-fade-up-delay mt-4 max-w-xl text-base text-white/85 sm:text-lg">
            {hero.subheadline}
          </p>
          <div className="animate-fade-up-delay mt-8 flex flex-wrap gap-3">
            {hero.ctaPrimary ? (
              <Link
                href={hero.ctaPrimary.href}
                className="rounded-md bg-[var(--color-secondary)] px-5 py-3 text-sm font-semibold text-[var(--color-primary-dark)] transition hover:brightness-105"
              >
                {hero.ctaPrimary.label}
              </Link>
            ) : null}
            {hero.ctaSecondary ? (
              <Link
                href={hero.ctaSecondary.href}
                className="rounded-md border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {hero.ctaSecondary.label}
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-semibold md:text-4xl">
            {settings.about?.title}
          </h2>
          <p className="mt-4 text-[var(--color-muted)] leading-relaxed">
            {settings.about?.body}
          </p>
          <Link
            href="/about"
            className="mt-6 inline-block text-sm font-semibold text-[var(--color-primary)] underline-offset-4 hover:underline"
          >
            {dict.common.learnMore}
          </Link>
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="bg-[var(--color-accent)]/50 py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-heading text-3xl font-semibold">
                {dict.home.featured}
              </h2>
              <Link
                href="/items"
                className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
              >
                {dict.common.viewAll}
              </Link>
            </div>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((item) => (
                <article key={String(item._id)} className="group">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[var(--color-primary)]/10">
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
                  <h3 className="mt-4 font-heading text-xl font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-muted)] line-clamp-2">
                    {item.description}
                  </p>
                  {item.price != null ? (
                    <p className="mt-2 text-sm font-semibold text-[var(--color-primary)]">
                      {formatPrice(item.price, settings.currency)}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {testimonials.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
          <h2 className="font-heading text-3xl font-semibold">
            {dict.home.whatPeopleSay}
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote
                key={String(t._id)}
                className="border-l-2 border-[var(--color-secondary)] pl-4"
              >
                <p className="text-[var(--color-foreground)]/90 leading-relaxed">
                  “{t.content}”
                </p>
                <footer className="mt-4 text-sm font-medium">
                  {t.name}
                  {t.title ? (
                    <span className="text-[var(--color-muted)]"> · {t.title}</span>
                  ) : null}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
