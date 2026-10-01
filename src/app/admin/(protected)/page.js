"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/components/admin/api";
import { Card, Empty } from "@/components/admin/Form";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/admin/dashboard")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }
  if (!data) {
    return <p className="text-sm text-slate-500">Loading dashboard…</p>;
  }

  const cards = [
    {
      label: "Unread messages",
      value: data.counts.unreadMessages,
      href: "/admin/messages",
    },
    {
      label: "Pending bookings",
      value: data.counts.pendingBookings,
      href: "/admin/bookings",
    },
    {
      label: "Items",
      value: data.counts.totalItems,
      href: "/admin/items",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-600">Overview of recent activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-400"
          >
            <p className="text-sm text-slate-600">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Recent messages">
          {data.recentMessages.length === 0 ? (
            <Empty>No messages yet.</Empty>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentMessages.map((m) => (
                <li key={m._id} className="py-2 text-sm">
                  <Link href="/admin/messages" className="font-medium hover:underline">
                    {m.subject}
                  </Link>
                  <p className="text-slate-500">
                    {m.name} · {new Date(m.createdAt).toLocaleString()}
                    {!m.isRead ? " · unread" : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Recent bookings">
          {data.recentBookings.length === 0 ? (
            <Empty>No bookings yet.</Empty>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentBookings.map((b) => (
                <li key={b._id} className="py-2 text-sm">
                  <Link href="/admin/bookings" className="font-medium hover:underline">
                    {b.name} — {b.date} {b.time}
                  </Link>
                  <p className="text-slate-500 capitalize">{b.status}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Recent admin activity">
        {data.recentAudit.length === 0 ? (
          <Empty>No activity logged yet.</Empty>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {data.recentAudit.map((a) => (
              <li key={a._id} className="flex justify-between gap-3 py-2">
                <span>
                  <span className="font-medium">{a.action}</span> on {a.resource}
                </span>
                <span className="text-slate-500">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
