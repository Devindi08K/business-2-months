export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { requireAuth } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { sanitizeInput, pick } from "@/lib/sanitize";
import { testimonialSchema, parseOrError } from "@/lib/validation";
import { writeAudit } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";
import {
  jsonOk,
  jsonError,
  handleApiError,
  parseJsonBody,
} from "@/lib/api";

const FIELDS = [
  "name",
  "title",
  "content",
  "rating",
  "image",
  "order",
  "isActive",
];

export async function PUT(request, { params }) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request);
    await validateCsrf(request, raw);
    const cleaned = sanitizeInput(raw);
    const parsed = parseOrError(testimonialSchema.partial(), cleaned);
    if (!parsed.success) return jsonError(parsed.error, 400);
    await connectDB();
    const testimonial = await Testimonial.findByIdAndUpdate(
      params.id,
      pick(parsed.data, FIELDS),
      { new: true }
    );
    if (!testimonial) return jsonError("Not found", 404);
    await writeAudit({
      userId: session.sub,
      action: "update",
      resource: "testimonial",
      resourceId: testimonial._id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    return jsonOk({ testimonial });
  } catch (err) {
    return handleApiError(err, "admin/testimonials/[id]");
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request).catch(() => ({}));
    await validateCsrf(request, raw);
    await connectDB();
    const testimonial = await Testimonial.findByIdAndDelete(params.id);
    if (!testimonial) return jsonError("Not found", 404);
    await writeAudit({
      userId: session.sub,
      action: "delete",
      resource: "testimonial",
      resourceId: params.id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err, "admin/testimonials/[id]");
  }
}
