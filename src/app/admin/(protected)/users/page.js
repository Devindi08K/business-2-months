"use client";

import { useEffect, useState } from "react";
import { api } from "@/components/admin/api";
import { useToast } from "@/components/ui/Toast";
import {
  Card,
  Field,
  Input,
  Select,
  Button,
  Empty,
} from "@/components/admin/Form";

export default function UsersAdminPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "editor",
  });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [forbidden, setForbidden] = useState(false);

  async function load() {
    try {
      const data = await api("/api/admin/users");
      setUsers(data.users);
      setForbidden(false);
    } catch (e) {
      if (e.status === 403) setForbidden(true);
      else toast.error(e.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createUser(e) {
    e.preventDefault();
    try {
      await api("/api/admin/users", { method: "POST", body: form });
      toast.success("User created");
      setForm({ name: "", email: "", password: "", role: "editor" });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    try {
      await api("/api/admin/users", {
        method: "POST",
        body: { action: "changePassword", ...pw },
      });
      toast.success("Password updated");
      setPw({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function remove(id) {
    if (!confirm("Remove this admin user?")) return;
    try {
      await api(`/api/admin/users/${id}`, { method: "DELETE", body: {} });
      toast.success("User removed");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-slate-600">
          Change your password. Owners can add or remove admins.
        </p>
      </div>

      <Card title="Change my password">
        <form onSubmit={changePassword} className="grid gap-4 sm:grid-cols-2 max-w-2xl">
          <Field label="Current password">
            <Input
              type="password"
              required
              value={pw.currentPassword}
              onChange={(e) =>
                setPw({ ...pw, currentPassword: e.target.value })
              }
            />
          </Field>
          <Field label="New password">
            <Input
              type="password"
              required
              value={pw.newPassword}
              onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
            />
          </Field>
          <p className="sm:col-span-2 text-xs text-slate-500">
            Min 10 characters with upper, lower, number, and special character.
          </p>
          <Button type="submit">Update password</Button>
        </form>
      </Card>

      {forbidden ? (
        <Card title="Admin users">
          <Empty>Only owners can manage other admin users.</Empty>
        </Card>
      ) : (
        <>
          <Card title="Add admin">
            <form onSubmit={createUser} className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <Field label="Password">
                <Input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </Field>
              <Field label="Role">
                <Select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="editor">Editor</option>
                  <option value="owner">Owner</option>
                </Select>
              </Field>
              <Button type="submit">Create user</Button>
            </form>
          </Card>

          <Card title="All admins">
            {users.length === 0 ? (
              <Empty>No users.</Empty>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {users.map((u) => (
                  <li
                    key={u._id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="font-medium">
                        {u.name} · {u.role}
                      </p>
                      <p className="text-slate-500">{u.email}</p>
                    </div>
                    <button
                      type="button"
                      className="text-red-700 underline"
                      onClick={() => remove(u._id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
