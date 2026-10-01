import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { sanitizeInput } from "@/lib/sanitize";
import { bookingSchema, parseOrError } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { verifyCaptcha } from "@/lib/captcha";
import { sendEmail, bookingNotificationHtml } from "@/lib/email";
import { getSiteSettings } from "@/lib/settings";
import { jsonCreated, handleApiError, parseJsonBody } from "@/lib/api";

export async function POST(request) {
  try {
    const settings = await getSiteSettings();
    if (!settings.features?.bookings) {
      const err = new Error("Bookings are disabled");
      err.status = 403;
      throw err;
    }

    const ip = clientIp(request);
    const limit = await rateLimit({
      key: `booking:${ip}`,
      limit: 8,
      windowMs: 60 * 60 * 1000,
    });
    if (!limit.allowed) {
      const err = new Error("Too many booking requests. Please try again later.");
      err.status = 429;
      throw err;
    }

    const raw = await parseJsonBody(request);
    const cleaned = sanitizeInput(raw);

    if (cleaned.honeypot) {
      return jsonCreated({ ok: true });
    }

    const parsed = parseOrError(bookingSchema, cleaned);
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

    const bookingDate = new Date(`${parsed.data.date}T${parsed.data.time}:00`);
    if (Number.isNaN(bookingDate.getTime()) || bookingDate < new Date()) {
      const err = new Error("Please choose a future date and time");
      err.status = 400;
      throw err;
    }

    await connectDB();
    const booking = await Booking.create({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      date: parsed.data.date,
      time: parsed.data.time,
      partySize: parsed.data.partySize,
      service: parsed.data.service || "",
      notes: parsed.data.notes || "",
      status: "pending",
    });

    try {
      await sendEmail({
        to: settings.email,
        subject: `[Booking] ${parsed.data.name} — ${parsed.data.date} ${parsed.data.time}`,
        html: bookingNotificationHtml(parsed.data),
        text: `New booking from ${parsed.data.name}`,
      });
    } catch (emailErr) {
      console.error("[booking] notify failed", emailErr);
    }

    return jsonCreated({ ok: true, id: booking._id });
  } catch (err) {
    return handleApiError(err, "bookings");
  }
}
