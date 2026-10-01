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
  jsonCreated,
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

export async function GET() {
  try {
    await requireAuth();
    await connectDB();
    const testimonials = await Testimonial.find().sort({ order: 1 }).lean();
    return jsonOk({ testimonials });
  } catch (err) {
    return handleApiError(err, "admin/testimonials");
  }
}

export async function POST(request) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request);
    await validateCsrf(request, raw);
    const cleaned = sanitizeInput(raw);
    const parsed = parseOrError(testimonialSchema, cleaned);
    if (!parsed.success) return jsonError(parsed.error, 400);
    await connectDB();
    const testimonial = await Testimonial.create(pick(parsed.data, FIELDS));
    await writeAudit({
      userId: session.sub,
      action: "create",
      resource: "testimonial",
      resourceId: testimonial._id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    return jsonCreated({ testimonial });
  } catch (err) {
    return handleApiError(err, "admin/testimonials");
  }
}
