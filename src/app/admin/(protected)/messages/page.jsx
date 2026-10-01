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

export default function MessagesAdminPage() {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState({ subject: "", body: "" });

  async function load() {
    try {
      const data = await api("/api/admin/messages");
      setMessages(data.messages);
    } catch (e) {
      toast.error(e.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openMessage(id) {
    try {
      const data = await api(`/api/admin/messages/${id}`);
      setSelected(data.message);
      setReply({
        subject: `Re: ${data.message.subject}`,
        body: "",
      });
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function sendReply(e) {
    e.preventDefault();
    try {
      await api(`/api/admin/messages/${selected._id}`, {
        method: "PATCH",
        body: { action: "reply", ...reply },
      });
      toast.success("Reply sent");
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this message?")) return;
    try {
      await api(`/api/admin/messages/${id}`, { method: "DELETE", body: {} });
      toast.success("Deleted");
      if (selected?._id === id) setSelected(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Inbox</h1>
        <p className="text-sm text-slate-600">Contact form messages.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Messages">
          {messages.length === 0 ? (
            <Empty>No messages.</Empty>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {messages.map((m) => (
                <li key={m._id} className="py-3">
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => openMessage(m._id)}
                  >
                    <p className={`font-medium ${!m.isRead ? "" : "text-slate-600"}`}>
                      {!m.isRead ? "● " : ""}
                      {m.subject}
                    </p>
                    <p className="text-slate-500">
                      {m.name} · {new Date(m.createdAt).toLocaleString()}
                    </p>
                  </button>
                  <button
                    type="button"
                    className="mt-1 text-xs text-red-700"
                    onClick={() => remove(m._id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Message detail">
          {!selected ? (
            <Empty>Select a message to read and reply.</Empty>
          ) : (
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">{selected.subject}</p>
                <p className="text-slate-500">
                  From {selected.name} &lt;{selected.email}&gt;
                  {selected.phone ? ` · ${selected.phone}` : ""}
                </p>
                <p className="mt-3 whitespace-pre-wrap">{selected.message}</p>
              </div>
              <form onSubmit={sendReply} className="space-y-3 border-t pt-4">
                <Field label="Reply subject">
                  <Input
                    required
                    value={reply.subject}
                    onChange={(e) =>
                      setReply({ ...reply, subject: e.target.value })
                    }
                  />
                </Field>
                <Field label="Reply body">
                  <Textarea
                    required
                    rows={5}
                    value={reply.body}
                    onChange={(e) =>
                      setReply({ ...reply, body: e.target.value })
                    }
                  />
                </Field>
                <Button type="submit">Send reply email</Button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
