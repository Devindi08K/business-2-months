"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

export default function Header({ settings, dict, locale = "en" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const f = settings.features || {};

  const links = [
    { href: "/", label: dict.nav.home },
    { href: "/about", label: dict.nav.about },
    f.items !== false && {
      href: "/items",
      label: settings.itemLabels?.plural || dict.nav.items,
    },
    f.gallery !== false && { href: "/gallery", label: dict.nav.gallery },
    f.testimonials !== false && {
      href: "/testimonials",
      label: dict.nav.testimonials,
    },
    f.blog && { href: "/blog", label: dict.nav.blog },
    { href: "/contact", label: dict.nav.contact },
    f.bookings && { href: "/booking", label: dict.nav.booking },
  ].filter(Boolean);

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 md:px-6">
        <Link
          href="/"
          className="font-heading text-xl font-semibold tracking-tight text-[var(--color-foreground)] md:text-2xl"
        >
          {settings.businessName}
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "text-sm font-medium transition-colors",
                pathname === l.href
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-foreground)]/80 hover:text-[var(--color-primary)]"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {settings.features?.multiLanguage ? (
            <div className="hidden sm:flex gap-1 text-xs font-medium">
              <Link
                href={pathname}
                className={locale === "en" ? "underline" : "opacity-60"}
              >
                EN
              </Link>
              <span aria-hidden>/</span>
              <Link
                href={`${pathname}?lang=si`}
                className={locale === "si" ? "underline" : "opacity-60"}
              >
                සිං
              </Link>
            </div>
          ) : null}
          <button
            type="button"
            className="rounded-md border border-[var(--color-foreground)]/20 px-3 py-1.5 text-sm lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            Menu
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-[var(--color-foreground)]/10 bg-[var(--color-background)]/95 px-4 py-4 backdrop-blur lg:hidden"
        >
          <ul className="space-y-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block py-2 text-sm font-medium"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
