export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { sanitizeInput } from "@/lib/sanitize";
import { contactSchema, parseOrError } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { verifyCaptcha } from "@/lib/captcha";
import { sendEmail, contactNotificationHtml } from "@/lib/email";
import { getSiteSettings } from "@/lib/settings";
import { jsonCreated, handleApiError, parseJsonBody } from "@/lib/api";

export async function POST(request) {
  try {
    const ip = clientIp(request);
    const limit = await rateLimit({
      key: `contact:${ip}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (!limit.allowed) {
      const err = new Error("Too many messages. Please try again later.");
      err.status = 429;
      throw err;
    }

    const raw = await parseJsonBody(request);
    const cleaned = sanitizeInput(raw);

    if (cleaned.honeypot) {
      return jsonCreated({ ok: true });
    }

    const parsed = parseOrError(contactSchema, cleaned);
    if (!parsed.success) {
      const err = new Error(parsed.error);
      err.status = 400;
      throw err;
    }

    const captchaOk = await verifyCaptcha(parsed.data.turnstileToken);
    if (!captchaOk) {
      const err = new Error("Captcha verification failed");
      err.status = 400;
      throw err;
    }

    await connectDB();
    const msg = await Message.create({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || "",
      subject: parsed.data.subject,
      message: parsed.data.message,
    });

    const settings = await getSiteSettings();
    try {
      await sendEmail({
        to: settings.email,
        subject: `[Contact] ${parsed.data.subject}`,
        html: contactNotificationHtml(parsed.data),
        text: parsed.data.message,
      });
    } catch (emailErr) {
      console.error("[contact] notify failed", emailErr);
    }

    return jsonCreated({ ok: true, id: msg._id });
  } catch (err) {
    return handleApiError(err, "contact");
  }
}
