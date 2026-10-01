import BookingForm from "@/components/public/BookingForm";
import { getSiteSettings } from "@/lib/settings";
import { getDictionary } from "@/lib/i18n";
import { notFound } from "next/navigation";

export const metadata = { title: "Book" };

export default async function BookingPage() {
  const settings = await getSiteSettings();
  if (!settings.features?.bookings) notFound();
  const dict = getDictionary("en");

  return (
    <main className="mx-auto max-w-2xl px-4 pb-20 pt-32 md:px-6">
      <h1 className="font-heading text-4xl font-semibold md:text-5xl">
        {dict.booking.title}
      </h1>
      <p className="mt-3 text-[var(--color-muted)]">{dict.booking.subtitle}</p>
      <div className="mt-10 rounded-xl border border-[var(--color-foreground)]/10 bg-white/70 p-6 shadow-sm">
        <BookingForm dict={dict} />
      </div>
    </main>
  );
}
