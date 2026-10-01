import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { sanitizeInput } from "@/lib/sanitize";
import { bookingStatusSchema, parseOrError } from "@/lib/validation";
import { writeAudit } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";
import { sendEmail, bookingStatusHtml } from "@/lib/email";
import { getSiteSettings } from "@/lib/settings";
import {
  jsonOk,
  jsonError,
  handleApiError,
  parseJsonBody,
} from "@/lib/api";

export async function PATCH(request, { params }) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request);
    await validateCsrf(request, raw);
    const cleaned = sanitizeInput(raw);
    const parsed = parseOrError(bookingStatusSchema, cleaned);
    if (!parsed.success) return jsonError(parsed.error, 400);

    await connectDB();
    const booking = await Booking.findByIdAndUpdate(
      params.id,
      { status: parsed.data.status },
      { new: true }
    );
    if (!booking) return jsonError("Not found", 404);

    const settings = await getSiteSettings();
    try {
      await sendEmail({
        to: booking.email,
        subject: `Booking ${parsed.data.status} — ${settings.businessName}`,
        html: bookingStatusHtml({
          name: booking.name,
          status: parsed.data.status,
          date: booking.date,
          time: booking.time,
          businessName: settings.businessName,
        }),
        text: `Your booking has been ${parsed.data.status}.`,
      });
    } catch (emailErr) {
      console.error("[booking status] email failed", emailErr);
    }

    await writeAudit({
      userId: session.sub,
      action: `status_${parsed.data.status}`,
      resource: "booking",
      resourceId: booking._id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return jsonOk({ booking });
  } catch (err) {
    return handleApiError(err, "admin/bookings/[id]");
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request).catch(() => ({}));
    await validateCsrf(request, raw);
    await connectDB();
    const booking = await Booking.findByIdAndDelete(params.id);
    if (!booking) return jsonError("Not found", 404);
    await writeAudit({
      userId: session.sub,
      action: "delete",
      resource: "booking",
      resourceId: params.id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err, "admin/bookings/[id]");
  }
}
