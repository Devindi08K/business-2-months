"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { api, clearCsrfCache } from "./api";
import { useToast } from "@/components/ui/Toast";
import clsx from "clsx";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/items", label: "Items" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminShell({ children, user }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);

  async function logout() {
    try {
      await api("/api/auth/logout", { method: "POST", body: {} });
      clearCsrfCache();
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast.error("Logout failed");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              Menu
            </button>
            <Link href="/admin" className="font-semibold tracking-tight">
              Admin
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-slate-600">
              {user?.name} · {user?.role}
            </span>
            <Link href="/" className="text-slate-600 hover:text-slate-900">
              View site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-700"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside
          className={clsx(
            "w-56 shrink-0 space-y-1 lg:block",
            open ? "block" : "hidden"
          )}
        >
          <nav aria-label="Admin">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    "block rounded-md px-3 py-2 text-sm",
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-200"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
