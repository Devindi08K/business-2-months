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
import ImageUpload from "@/components/admin/ImageUpload";

const empty = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  published: false,
};

export default function BlogAdminPage() {
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  async function load() {
    try {
      const data = await api("/api/admin/blog");
      setPosts(data.posts);
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
      if (editingId) {
        await api(`/api/admin/blog/${editingId}`, { method: "PUT", body: form });
        toast.success("Post updated");
      } else {
        await api("/api/admin/blog", { method: "POST", body: form });
        toast.success("Post created");
      }
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this post?")) return;
    try {
      await api(`/api/admin/blog/${id}`, { method: "DELETE", body: {} });
      toast.success("Deleted");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Blog / News</h1>
        <p className="text-sm text-slate-600">
          Write posts in plain text or simple HTML. Content is sanitized.
        </p>
      </div>

      <Card title={editingId ? "Edit post" : "New post"}>
        <form onSubmit={onSubmit} className="grid gap-4">
          <Field label="Title">
            <Input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label="Slug (optional)">
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="auto-generated-from-title"
            />
          </Field>
          <Field label="Excerpt">
            <Textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </Field>
          <Field label="Content">
            <Textarea
              required
              rows={8}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </Field>
          <ImageUpload
            label="Cover image"
            value={form.coverImage}
            onChange={({ url }) => setForm({ ...form, coverImage: url })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                setForm({ ...form, published: e.target.checked })
              }
            />
            Published
          </label>
          <div className="flex gap-2">
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

      <Card title="All posts">
        {posts.length === 0 ? (
          <Empty>No posts yet.</Empty>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {posts.map((p) => (
              <li key={p._id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-slate-500">
                    {p.published ? "Published" : "Draft"} · /{p.slug}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="underline"
                    onClick={() => {
                      setEditingId(p._id);
                      setForm({
                        title: p.title,
                        slug: p.slug,
                        excerpt: p.excerpt || "",
                        content: p.content,
                        coverImage: p.coverImage || "",
                        published: p.published,
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-red-700 underline"
                    onClick={() => remove(p._id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
