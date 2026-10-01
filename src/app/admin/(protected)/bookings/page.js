"use client";

import { useEffect, useState } from "react";
import { api } from "@/components/admin/api";
import { useToast } from "@/components/ui/Toast";
import { Card, Button, Empty, Select } from "@/components/admin/Form";

export default function BookingsAdminPage() {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("");

  async function load(filter = status) {
    try {
      const q = filter ? `?status=${filter}` : "";
      const data = await api(`/api/admin/bookings${q}`);
      setBookings(data.bookings);
    } catch (e) {
      toast.error(e.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setBookingStatus(id, next) {
    try {
      await api(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        body: { status: next },
      });
      toast.success(`Marked ${next}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this booking?")) return;
    try {
      await api(`/api/admin/bookings/${id}`, { method: "DELETE", body: {} });
      toast.success("Deleted");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Bookings</h1>
          <p className="text-sm text-slate-600">
            Confirm or cancel reservations. Customers get an email.
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-40"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Button variant="secondary" onClick={() => load(status)}>
            Filter
          </Button>
        </div>
      </div>

      <Card title="Bookings list">
        {bookings.length === 0 ? (
          <Empty>No bookings found.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">When</th>
                  <th className="py-2 pr-3">Guest</th>
                  <th className="py-2 pr-3">Party</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-b border-slate-100 align-top">
                    <td className="py-3 pr-3">
                      {b.date} {b.time}
                      {b.service ? (
                        <p className="text-slate-500">{b.service}</p>
                      ) : null}
                    </td>
                    <td className="py-3 pr-3">
                      <p className="font-medium">{b.name}</p>
                      <p className="text-slate-500">{b.email}</p>
                      <p className="text-slate-500">{b.phone}</p>
                    </td>
                    <td className="py-3 pr-3">{b.partySize}</td>
                    <td className="py-3 pr-3 capitalize">{b.status}</td>
                    <td className="py-3 space-x-2 whitespace-nowrap">
                      {b.status !== "confirmed" ? (
                        <button
                          type="button"
                          className="text-emerald-700 underline"
                          onClick={() => setBookingStatus(b._id, "confirmed")}
                        >
                          Confirm
                        </button>
                      ) : null}
                      {b.status !== "cancelled" ? (
                        <button
                          type="button"
                          className="text-amber-700 underline"
                          onClick={() => setBookingStatus(b._id, "cancelled")}
                        >
                          Cancel
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="text-red-700 underline"
                        onClick={() => remove(b._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
