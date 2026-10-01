export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { requireAuth } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { sanitizeInput } from "@/lib/sanitize";
import { messageReplySchema, parseOrError } from "@/lib/validation";
import { writeAudit } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";
import { sendEmail, messageReplyHtml } from "@/lib/email";
import { getSiteSettings } from "@/lib/settings";
import {
  jsonOk,
  jsonError,
  handleApiError,
  parseJsonBody,
} from "@/lib/api";

export async function GET(_request, { params }) {
  try {
    await requireAuth();
    await connectDB();
    const message = await Message.findByIdAndUpdate(
      params.id,
      { isRead: true },
      { new: true }
    ).lean();
    if (!message) return jsonError("Not found", 404);
    return jsonOk({ message });
  } catch (err) {
    return handleApiError(err, "admin/messages/[id]");
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request);
    await validateCsrf(request, raw);
    const cleaned = sanitizeInput(raw);
    await connectDB();

    if (cleaned.action === "read") {
      const message = await Message.findByIdAndUpdate(
        params.id,
        { isRead: true },
        { new: true }
      );
      if (!message) return jsonError("Not found", 404);
      return jsonOk({ message });
    }

    if (cleaned.action === "unread") {
      const message = await Message.findByIdAndUpdate(
        params.id,
        { isRead: false },
        { new: true }
      );
      if (!message) return jsonError("Not found", 404);
      return jsonOk({ message });
    }

    if (cleaned.action === "reply") {
      const parsed = parseOrError(messageReplySchema, cleaned);
      if (!parsed.success) return jsonError(parsed.error, 400);
      const message = await Message.findById(params.id);
      if (!message) return jsonError("Not found", 404);
      const settings = await getSiteSettings();
      await sendEmail({
        to: message.email,
        subject: parsed.data.subject,
        html: messageReplyHtml({
          body: parsed.data.body,
          businessName: settings.businessName,
        }),
        text: parsed.data.body,
      });
      message.repliedAt = new Date();
      message.isRead = true;
      await message.save();
      await writeAudit({
        userId: session.sub,
        action: "reply",
        resource: "message",
        resourceId: message._id,
        ip: clientIp(request),
        userAgent: request.headers.get("user-agent"),
      });
      return jsonOk({ message });
    }

    return jsonError("Unknown action", 400);
  } catch (err) {
    return handleApiError(err, "admin/messages/[id]");
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request).catch(() => ({}));
    await validateCsrf(request, raw);
    await connectDB();
    const message = await Message.findByIdAndDelete(params.id);
    if (!message) return jsonError("Not found", 404);
    await writeAudit({
      userId: session.sub,
      action: "delete",
      resource: "message",
      resourceId: params.id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err, "admin/messages/[id]");
  }
}
