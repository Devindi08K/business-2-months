"use client";

import { useEffect, useState } from "react";
import { api } from "@/components/admin/api";
import { useToast } from "@/components/ui/Toast";
import { Card, Field, Input, Button, Empty } from "@/components/admin/Form";
import ImageUpload from "@/components/admin/ImageUpload";

export default function GalleryAdminPage() {
  const toast = useToast();
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    url: "",
    publicId: "",
    caption: "",
    alt: "",
    order: 0,
  });

  async function load() {
    try {
      const data = await api("/api/admin/gallery");
      setImages(data.images);
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
      await api("/api/admin/gallery", {
        method: "POST",
        body: { ...form, order: Number(form.order) || 0 },
      });
      toast.success("Image added");
      setForm({ url: "", publicId: "", caption: "", alt: "", order: 0 });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this image?")) return;
    try {
      await api(`/api/admin/gallery/${id}`, { method: "DELETE", body: {} });
      toast.success("Deleted");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Gallery</h1>
        <p className="text-sm text-slate-600">Upload and arrange gallery images.</p>
      </div>

      <Card title="Add image">
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ImageUpload
              value={form.url}
              onChange={({ url, publicId }) =>
                setForm({ ...form, url, publicId })
              }
            />
          </div>
          <Field label="Caption">
            <Input
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
            />
          </Field>
          <Field label="Alt text">
            <Input
              value={form.alt}
              onChange={(e) => setForm({ ...form, alt: e.target.value })}
            />
          </Field>
          <Field label="Order">
            <Input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />
          </Field>
          <div className="flex items-end">
            <Button type="submit" disabled={!form.url}>
              Add to gallery
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Gallery images">
        {images.length === 0 ? (
          <Empty>No images yet.</Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img) => (
              <figure key={img._id} className="overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt || ""} className="h-40 w-full object-cover" />
                <figcaption className="flex items-center justify-between gap-2 p-2 text-sm">
                  <span className="truncate">{img.caption || "Untitled"}</span>
                  <button
                    type="button"
                    className="text-red-700"
                    onClick={() => remove(img._id)}
                  >
                    Delete
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
