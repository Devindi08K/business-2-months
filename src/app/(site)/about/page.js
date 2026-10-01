import { getSiteSettings } from "@/lib/settings";
import connectDB from "@/lib/db";
import PageContent from "@/models/PageContent";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const settings = await getSiteSettings();
  await connectDB();
  const page = await PageContent.findOne({ key: "about", locale: "en" }).lean();
  const title = page?.sections?.title || settings.about?.title || "About";
  const body = page?.sections?.body || settings.about?.body || "";

  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-32 md:px-6">
      <h1 className="font-heading text-4xl font-semibold md:text-5xl">{title}</h1>
      <div className="mt-8 space-y-4 text-[var(--color-muted)] leading-relaxed whitespace-pre-wrap">
        {body}
      </div>
      <div className="mt-12 rounded-xl bg-[var(--color-accent)] p-6">
        <h2 className="font-heading text-xl font-semibold">Visit us</h2>
        <p className="mt-2 text-sm">{settings.address}</p>
        <p className="mt-1 text-sm">
          <a href={`tel:${settings.phoneRaw}`} className="underline">
            {settings.phone}
          </a>
        </p>
      </div>
    </main>
  );
}
