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
} from "@/components/admin/Form";

export default function PagesAdminPage() {
  const toast = useToast();
  const [key, setKey] = useState("about");
  const [locale, setLocale] = useState("en");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    api(`/api/admin/pages?key=${key}`)
      .then((data) => {
        const page = data.pages.find((p) => p.locale === locale) || data.pages[0];
        if (page?.sections) {
          setTitle(page.sections.title || "");
          setBody(page.sections.body || "");
        } else {
          setTitle("");
          setBody("");
        }
      })
      .catch((e) => toast.error(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, locale]);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await api("/api/admin/pages", {
        method: "PUT",
        body: {
          key,
          locale,
          sections: { title, body },
        },
      });
      toast.success("Page content saved");
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Page content</h1>
        <p className="text-sm text-slate-600">
          Extra page copy by locale. Hero and about also live in Settings.
        </p>
      </div>

      <Card title="Edit page">
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Page">
              <Select value={key} onChange={(e) => setKey(e.target.value)}>
                <option value="about">About</option>
                <option value="home">Home extra</option>
                <option value="contact">Contact</option>
              </Select>
            </Field>
            <Field label="Locale">
              <Select value={locale} onChange={(e) => setLocale(e.target.value)}>
                <option value="en">English</option>
                <option value="si">Sinhala</option>
              </Select>
            </Field>
          </div>
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Body">
            <Textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </Field>
          <Button type="submit">Save page</Button>
        </form>
      </Card>
    </div>
  );
}
