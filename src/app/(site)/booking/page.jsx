import BookingForm from "@/components/public/BookingForm";
import { getSiteSettings } from "@/lib/settings";
import { getDictionary } from "@/lib/i18n";
import { notFound } from "next/navigation";

export const metadata = { title: "Reservations & Booking" };

export default async function BookingPage() {
  const settings = await getSiteSettings();
  if (!settings.features?.bookings) notFound();
  const dict = getDictionary("en");

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-32 md:px-6">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            {dict.booking.title}
          </h1>
          <p className="mt-3 text-[var(--color-muted)]">{dict.booking.subtitle}</p>
          <div className="mt-8 rounded-xl border border-[var(--color-foreground)]/10 bg-white/70 p-6 shadow-sm backdrop-blur">
            <BookingForm dict={dict} />
          </div>
        </div>

        <div className="space-y-6 lg:col-span-5 lg:pt-14">
          <div className="rounded-xl border border-[var(--color-foreground)]/10 bg-white/50 p-6 backdrop-blur">
            <h2 className="font-heading text-xl font-semibold">Reservation Information</h2>
            <ul className="mt-4 space-y-3 text-sm text-[var(--color-muted)]">
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-primary)] font-bold">✓</span>
                <span>Instant request submission with direct confirmation email.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-primary)] font-bold">✓</span>
                <span>For parties larger than 8 guests, please reach out directly.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-primary)] font-bold">✓</span>
                <span>We hold reserved tables for 15 minutes past booking time.</span>
              </li>
            </ul>
          </div>

          {Array.isArray(settings.hours) && settings.hours.length > 0 ? (
            <div className="rounded-xl bg-[var(--color-accent)] p-6">
              <h2 className="font-heading text-lg font-semibold">Service Hours</h2>
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

          <div className="rounded-xl border border-[var(--color-foreground)]/10 bg-white/50 p-6">
            <h2 className="font-heading text-lg font-semibold">Need Assistance?</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              For special dietary requirements or urgent booking changes:
            </p>
            <p className="mt-3 text-sm font-semibold">
              <a href={`tel:${settings.phoneRaw}`} className="text-[var(--color-primary)] underline">
                {settings.phone}
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

