"use client";

import { useEffect, useState } from "react";
import { api } from "@/components/admin/api";
import { useToast } from "@/components/ui/Toast";
import {
  Card,
  Field,
  Input,
  Textarea,
  Button,
  Empty,
} from "@/components/admin/Form";

const empty = {
  name: "",
  title: "",
  content: "",
  rating: 5,
  order: 0,
  isActive: true,
};

export default function TestimonialsAdminPage() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  async function load() {
    try {
      const data = await api("/api/admin/testimonials");
      setList(data.testimonials);
    } catch (e) {
      toast.error(e.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const body = {
        ...form,
        rating: Number(form.rating),
        order: Number(form.order) || 0,
      };
      if (editingId) {
        await api(`/api/admin/testimonials/${editingId}`, {
          method: "PUT",
          body,
        });
        toast.success("Updated");
      } else {
        await api("/api/admin/testimonials", { method: "POST", body });
        toast.success("Created");
      }
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await api(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
        body: {},
      });
      toast.success("Deleted");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Testimonials</h1>
        <p className="text-sm text-slate-600">Customer reviews shown on the site.</p>
      </div>

      <Card title={editingId ? "Edit testimonial" : "Add testimonial"}>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Title / role">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label="Rating (1–5)">
            <Input
              type="number"
              min="1"
              max="5"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            />
          </Field>
          <Field label="Order">
            <Input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Content">
              <Textarea
                required
                rows={4}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </Field>
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit">{editingId ? "Update" : "Create"}</Button>
            {editingId ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm(empty);
                }}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card title="All testimonials">
        {list.length === 0 ? (
          <Empty>No testimonials yet.</Empty>
        ) : (
          <ul className="space-y-3">
            {list.map((t) => (
              <li
                key={t._id}
                className="rounded-lg border border-slate-100 p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {t.name}
                      {t.title ? ` · ${t.title}` : ""}
                    </p>
                    <p className="mt-1 text-slate-600">{t.content}</p>
                    <p className="mt-1 text-slate-400">Rating: {t.rating}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      className="underline"
                      onClick={() => {
                        setEditingId(t._id);
                        setForm({
                          name: t.name,
                          title: t.title || "",
                          content: t.content,
                          rating: t.rating,
                          order: t.order || 0,
                          isActive: t.isActive,
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-red-700 underline"
                      onClick={() => remove(t._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
