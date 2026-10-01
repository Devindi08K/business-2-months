"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, clearCsrfCache, getCsrfToken } from "@/components/admin/api";
import { useToast } from "@/components/ui/Toast";
import { Field, Input, Button } from "@/components/admin/Form";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await getCsrfToken(true);
      await api("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      clearCsrfCache();
      await getCsrfToken(true);
      toast.success("Welcome back");
      const next = searchParams.get("next") || "/admin";
      router.push(next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Admin login</h1>
          <p className="mt-1 text-sm text-slate-600">
            Sign in to manage your website content.
          </p>
        </div>
        <Field label="Email">
          <Input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
