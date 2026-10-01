"use client";

import { useRef, useState } from "react";
import { api } from "./api";
import { useToast } from "@/components/ui/Toast";

export default function ImageUpload({ value, onChange, label = "Image" }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const data = await api("/api/admin/upload", {
        method: "POST",
        body: form,
        headers: {},
      });
      onChange?.({
        url: data.image.url,
        publicId: data.image.publicId,
      });
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="h-32 w-32 rounded-md object-cover border border-slate-200"
        />
      ) : null}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={onFile}
          disabled={loading}
          className="block w-full text-sm"
        />
        {value ? (
          <button
            type="button"
            className="text-sm text-red-700"
            onClick={() => onChange?.({ url: "", publicId: "" })}
          >
            Remove
          </button>
        ) : null}
      </div>
      {loading ? <p className="text-sm text-slate-500">Uploading…</p> : null}
    </div>
  );
}
