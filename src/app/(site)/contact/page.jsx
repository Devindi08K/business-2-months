import ContactForm from "@/components/public/ContactForm";
import { getSiteSettings } from "@/lib/settings";
import { getDictionary } from "@/lib/i18n";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const dict = getDictionary("en");

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-32 md:px-6">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            {dict.contact.title}
          </h1>
          <p className="mt-3 text-[var(--color-muted)]">{dict.contact.subtitle}</p>
          <ul className="mt-8 space-y-3 text-sm">
            <li>{settings.address}</li>
            <li>
              <a href={`tel:${settings.phoneRaw}`} className="underline">
                {settings.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className="underline">
                {settings.email}
              </a>
            </li>
          </ul>
          {settings.mapEmbedUrl ? (
            <div className="mt-8 overflow-hidden rounded-xl">
              <iframe
                title="Map"
                src={settings.mapEmbedUrl}
                className="h-64 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          ) : null}
        </div>
        <div className="rounded-xl border border-[var(--color-foreground)]/10 bg-white/70 p-6 shadow-sm backdrop-blur">
          <ContactForm dict={dict} />
        </div>
      </div>
    </main>
  );
}
