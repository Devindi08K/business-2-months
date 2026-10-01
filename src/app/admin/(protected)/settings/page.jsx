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
} from "@/components/admin/Form";
import ImageUpload from "@/components/admin/ImageUpload";

export default function SettingsAdminPage() {
  const toast = useToast();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/api/admin/settings")
      .then((d) => setSettings(d.settings))
      .catch((e) => toast.error(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await api("/api/admin/settings", {
        method: "PUT",
        body: settings,
      });
      setSettings(data.settings);
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return <p className="text-sm text-slate-500">Loading settings…</p>;
  }

  function set(path, value) {
    setSettings((prev) => {
      const next = structuredClone(prev);
      const parts = path.split(".");
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Site settings</h1>
        <p className="text-sm text-slate-600">
          Business info, hours, theme, SEO, and feature toggles.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card title="Business info">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business name">
              <Input
                value={settings.businessName || ""}
                onChange={(e) => set("businessName", e.target.value)}
              />
            </Field>
            <Field label="Tagline">
              <Input
                value={settings.tagline || ""}
                onChange={(e) => set("tagline", e.target.value)}
              />
            </Field>
            <Field label="Phone">
              <Input
                value={settings.phone || ""}
                onChange={(e) => set("phone", e.target.value)}
              />
            </Field>
            <Field label="Phone (digits for tel/WhatsApp)">
              <Input
                value={settings.phoneRaw || ""}
                onChange={(e) => set("phoneRaw", e.target.value)}
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={settings.email || ""}
                onChange={(e) => set("email", e.target.value)}
              />
            </Field>
            <Field label="WhatsApp number">
              <Input
                value={settings.whatsapp || ""}
                onChange={(e) => set("whatsapp", e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address">
                <Input
                  value={settings.address || ""}
                  onChange={(e) => set("address", e.target.value)}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Google Maps embed URL">
                <Input
                  value={settings.mapEmbedUrl || ""}
                  onChange={(e) => set("mapEmbedUrl", e.target.value)}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <ImageUpload
                label="Logo URL"
                value={settings.logo || ""}
                onChange={({ url }) => set("logo", url)}
              />
            </div>
          </div>
        </Card>

        <Card title="Hero">
          <div className="grid gap-4">
            <Field label="Headline">
              <Input
                value={settings.hero?.headline || ""}
                onChange={(e) => set("hero.headline", e.target.value)}
              />
            </Field>
            <Field label="Subheadline">
              <Textarea
                rows={2}
                value={settings.hero?.subheadline || ""}
                onChange={(e) => set("hero.subheadline", e.target.value)}
              />
            </Field>
            <ImageUpload
              label="Hero image"
              value={settings.hero?.image || ""}
              onChange={({ url }) => set("hero.image", url)}
            />
          </div>
        </Card>

        <Card title="About">
          <div className="grid gap-4">
            <Field label="Title">
              <Input
                value={settings.about?.title || ""}
                onChange={(e) => set("about.title", e.target.value)}
              />
            </Field>
            <Field label="Body">
              <Textarea
                rows={5}
                value={settings.about?.body || ""}
                onChange={(e) => set("about.body", e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card title="Theme colours">
          <div className="grid gap-4 sm:grid-cols-3">
            {["primary", "primaryDark", "secondary", "accent", "background", "foreground", "muted"].map(
              (key) => (
                <Field key={key} label={key}>
                  <Input
                    type="color"
                    value={settings.colors?.[key] || "#000000"}
                    onChange={(e) => set(`colors.${key}`, e.target.value)}
                  />
                </Field>
              )
            )}
          </div>
        </Card>

        <Card title="Opening hours">
          <div className="space-y-2">
            {(settings.hours || []).map((h, i) => (
              <div key={h.day} className="grid grid-cols-2 gap-2 sm:grid-cols-5 items-center text-sm">
                <span className="font-medium">{h.day}</span>
                <Input
                  value={h.open}
                  onChange={(e) => {
                    const hours = [...settings.hours];
                    hours[i] = { ...hours[i], open: e.target.value };
                    setSettings({ ...settings, hours });
                  }}
                />
                <Input
                  value={h.close}
                  onChange={(e) => {
                    const hours = [...settings.hours];
                    hours[i] = { ...hours[i], close: e.target.value };
                    setSettings({ ...settings, hours });
                  }}
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={h.closed}
                    onChange={(e) => {
                      const hours = [...settings.hours];
                      hours[i] = { ...hours[i], closed: e.target.checked };
                      setSettings({ ...settings, hours });
                    }}
                  />
                  Closed
                </label>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Social links">
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.keys(settings.social || {}).map((key) => (
              <Field key={key} label={key}>
                <Input
                  value={settings.social[key] || ""}
                  onChange={(e) => set(`social.${key}`, e.target.value)}
                />
              </Field>
            ))}
          </div>
        </Card>

        <Card title="SEO">
          <div className="grid gap-4">
            <Field label="Default title">
              <Input
                value={settings.seo?.defaultTitle || ""}
                onChange={(e) => set("seo.defaultTitle", e.target.value)}
              />
            </Field>
            <Field label="Description">
              <Textarea
                rows={3}
                value={settings.seo?.description || ""}
                onChange={(e) => set("seo.description", e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card title="Features">
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.keys(settings.features || {}).map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(settings.features[key])}
                  onChange={(e) => set(`features.${key}`, e.target.checked)}
                />
                {key}
              </label>
            ))}
          </div>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </form>
    </div>
  );
}
