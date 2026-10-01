"use client";

import { useEffect, useState } from "react";
import { api } from "@/components/admin/api";
import { useToast } from "@/components/ui/Toast";
import {
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Button,
  Empty,
} from "@/components/admin/Form";
import ImageUpload from "@/components/admin/ImageUpload";

const emptyItem = {
  title: "",
  description: "",
  category: "",
  price: "",
  image: "",
  imagePublicId: "",
  isAvailable: true,
  featured: false,
  order: 0,
};

export default function ItemsAdminPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyItem);
  const [editingId, setEditingId] = useState(null);
  const [catName, setCatName] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [i, c] = await Promise.all([
        api("/api/admin/items"),
        api("/api/admin/categories"),
      ]);
      setItems(i.items);
      setCategories(c.categories);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveItem(e) {
    e.preventDefault();
    try {
      const body = {
        ...form,
        price: form.price === "" ? null : Number(form.price),
        order: Number(form.order) || 0,
      };
      if (editingId) {
        await api(`/api/admin/items/${editingId}`, { method: "PUT", body });
        toast.success("Item updated");
      } else {
        await api("/api/admin/items", { method: "POST", body });
        toast.success("Item created");
      }
      setForm(emptyItem);
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function removeItem(id) {
    if (!confirm("Delete this item?")) return;
    try {
      await api(`/api/admin/items/${id}`, { method: "DELETE", body: {} });
      toast.success("Deleted");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function addCategory(e) {
    e.preventDefault();
    try {
      await api("/api/admin/categories", {
        method: "POST",
        body: { name: catName },
      });
      setCatName("");
      toast.success("Category added");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function startEdit(item) {
    setEditingId(item._id);
    setForm({
      title: item.title,
      description: item.description || "",
      category: item.category?._id || item.category,
      price: item.price ?? "",
      image: item.image || "",
      imagePublicId: item.imagePublicId || "",
      isAvailable: item.isAvailable,
      featured: item.featured,
      order: item.order || 0,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Items</h1>
        <p className="text-sm text-slate-600">
          Manage menu, services, or products and their categories.
        </p>
      </div>

      <Card title="Categories">
        <form onSubmit={addCategory} className="flex flex-wrap gap-2">
          <Input
            placeholder="New category name"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            required
            className="max-w-xs"
          />
          <Button type="submit">Add category</Button>
        </form>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {categories.map((c) => (
            <li
              key={c._id}
              className="rounded-full border border-slate-200 px-3 py-1"
            >
              {c.name}
            </li>
          ))}
        </ul>
      </Card>

      <Card title={editingId ? "Edit item" : "Add item"}>
        <form onSubmit={saveItem} className="grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <Input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label="Category">
            <Select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Price">
            <Input
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
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
            <Field label="Description">
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <ImageUpload
              value={form.image}
              onChange={({ url, publicId }) =>
                setForm({ ...form, image: url, imagePublicId: publicId })
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) =>
                setForm({ ...form, isAvailable: e.target.checked })
              }
            />
            Available
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Featured
          </label>
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit">{editingId ? "Update" : "Create"}</Button>
            {editingId ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyItem);
                }}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card title="All items">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : items.length === 0 ? (
          <Empty>No items yet.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Price</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b border-slate-100">
                    <td className="py-2 pr-3 font-medium">{item.title}</td>
                    <td className="py-2 pr-3">
                      {item.category?.name || "—"}
                    </td>
                    <td className="py-2 pr-3">{item.price ?? "—"}</td>
                    <td className="py-2 space-x-2">
                      <button
                        type="button"
                        className="text-slate-700 underline"
                        onClick={() => startEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-red-700 underline"
                        onClick={() => removeItem(item._id)}
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
