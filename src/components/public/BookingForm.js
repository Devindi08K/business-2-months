"use client";

import { useState } from "react";

export default function BookingForm({ dict }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    partySize: 2,
    service: "",
    notes: "",
    honeypot: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStatus({ type: "success", message: dict.common.success });
      setForm({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        partySize: 2,
        service: "",
        notes: "",
        honeypot: "",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || dict.common.error,
      });
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "w-full rounded-md border border-[var(--color-foreground)]/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input
          tabIndex={-1}
          autoComplete="off"
          value={form.honeypot}
          onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5 text-sm">
          <span>{dict.contact.name}</span>
          <input
            required
            className={fieldClass}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span>{dict.contact.email}</span>
          <input
            type="email"
            required
            className={fieldClass}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span>{dict.contact.phone}</span>
          <input
            required
            className={fieldClass}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span>{dict.booking.partySize}</span>
          <input
            type="number"
            min="1"
            max="50"
            required
            className={fieldClass}
            value={form.partySize}
            onChange={(e) => setForm({ ...form, partySize: e.target.value })}
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span>{dict.booking.date}</span>
          <input
            type="date"
            required
            className={fieldClass}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span>{dict.booking.time}</span>
          <input
            type="time"
            required
            className={fieldClass}
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </label>
      </div>
      <label className="block space-y-1.5 text-sm">
        <span>{dict.booking.service}</span>
        <input
          className={fieldClass}
          value={form.service}
          onChange={(e) => setForm({ ...form, service: e.target.value })}
        />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span>{dict.booking.notes}</span>
        <textarea
          rows={3}
          className={fieldClass}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </label>
      {status.message ? (
        <p
          role="status"
          className={`text-sm ${
            status.type === "success" ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {status.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
      >
        {loading ? dict.common.loading : dict.common.bookNow}
      </button>
    </form>
  );
}
