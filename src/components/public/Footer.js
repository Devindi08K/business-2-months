import Link from "next/link";

export default function Footer({ settings, dict }) {
  const year = new Date().getFullYear();
  const social = settings.social || {};
  const socialLinks = Object.entries(social).filter(([, v]) => v);

  return (
    <footer className="border-t border-[var(--color-foreground)]/10 bg-[var(--color-primary-dark)] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-heading text-2xl font-semibold">
            {settings.businessName}
          </p>
          <p className="mt-2 text-sm text-white/70">{settings.tagline}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white/60">
            Contact
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/85">
            <li>{settings.address}</li>
            <li>
              <a href={`tel:${settings.phoneRaw}`} className="hover:underline">
                {settings.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className="hover:underline">
                {settings.email}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white/60">
            {dict.common.openHours}
          </p>
          <ul className="mt-3 space-y-1 text-sm text-white/85">
            {(settings.hours || []).slice(0, 7).map((h) => (
              <li key={h.day} className="flex justify-between gap-4">
                <span>{h.day}</span>
                <span>
                  {h.closed
                    ? dict.common.closed
                    : `${h.open} – ${h.close}`}
                </span>
              </li>
            ))}
          </ul>
          {socialLinks.length ? (
            <ul className="mt-4 flex flex-wrap gap-3 text-sm">
              {socialLinks.map(([name, url]) => (
                <li key={name}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="capitalize underline-offset-2 hover:underline"
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/50">
        © {year} {settings.businessName}. {dict.footer.rights}{" "}
        <Link href="/admin" className="sr-only">
          Admin
        </Link>
      </div>
    </footer>
  );
}
