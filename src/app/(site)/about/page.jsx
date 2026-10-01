import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import connectDB from "@/lib/db";
import PageContent from "@/models/PageContent";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const settings = await getSiteSettings();
  let page = null;
  try {
    await connectDB();
    page = await PageContent.findOne({ key: "about", locale: "en" }).lean();
  } catch (err) {
    console.warn("[about] Fallback:", err?.message);
  }
  const title = page?.sections?.title || settings.about?.title || "About Us";
  const body = page?.sections?.body || settings.about?.body || "Welcome to our space. We believe in crafting memorable experiences through fresh local ingredients, thoughtful preparation, and warm hospitality.";

  const pillars = [
    {
      title: "Fresh & Local",
      desc: "We source ingredients from trusted regional producers, ensuring peak flavor and quality in every dish.",
    },
    {
      title: "Craft & Care",
      desc: "Every recipe is thoughtfully crafted with time-honored techniques and modern culinary touches.",
    },
    {
      title: "Warm Hospitality",
      desc: "Whether a quiet dinner or celebratory gathering, our space is made for lingering and enjoying.",
    },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-32 md:px-6">
      <h1 className="font-heading text-4xl font-semibold md:text-5xl">{title}</h1>
      <div className="mt-8 space-y-4 text-[var(--color-muted)] text-lg leading-relaxed whitespace-pre-wrap">
        {body}
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {pillars.map((pillar) => (
          <div
            key={pillar.title}
            className="rounded-xl border border-[var(--color-foreground)]/10 bg-white/50 p-6 backdrop-blur-sm"
          >
            <h3 className="font-heading text-lg font-semibold">{pillar.title}</h3>
            <p className="mt-2 text-sm text-[var(--color-muted)] leading-relaxed">
              {pillar.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-[var(--color-accent)] p-6">
          <h2 className="font-heading text-xl font-semibold">Visit Us</h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{settings.address}</p>
          <div className="mt-4 space-y-1 text-sm">
            <p>
              <span className="font-medium">Phone: </span>
              <a href={`tel:${settings.phoneRaw}`} className="underline">
                {settings.phone}
              </a>
            </p>
            <p>
              <span className="font-medium">Email: </span>
              <a href={`mailto:${settings.email}`} className="underline">
                {settings.email}
              </a>
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/items"
              className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
            >
              Explore Menu
            </Link>
            <Link
              href="/booking"
              className="rounded-md border border-[var(--color-foreground)]/20 px-4 py-2 text-xs font-semibold hover:bg-black/5"
            >
              Reserve a Table
            </Link>
          </div>
        </div>

        {Array.isArray(settings.hours) && settings.hours.length > 0 ? (
          <div className="rounded-xl border border-[var(--color-foreground)]/10 bg-white/70 p-6 shadow-sm">
            <h2 className="font-heading text-xl font-semibold">Opening Hours</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
              {settings.hours.map((h, i) => (
                <li key={i} className="flex justify-between border-b border-black/5 pb-1 last:border-0">
                  <span className="font-medium text-[var(--color-foreground)]">{h.day || h.days}</span>
                  <span>{h.time || h.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </main>
  );
}

