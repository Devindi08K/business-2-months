export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Item from "@/models/Item";
import { requireAuth } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { sanitizeInput, pick } from "@/lib/sanitize";
import { itemSchema, parseOrError } from "@/lib/validation";
import { writeAudit } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";
import {
  jsonOk,
  jsonError,
  handleApiError,
  parseJsonBody,
} from "@/lib/api";

const FIELDS = [
  "title",
  "description",
  "category",
  "price",
  "image",
  "imagePublicId",
  "isAvailable",
  "featured",
  "order",
];

export async function GET(_request, { params }) {
  try {
    await requireAuth();
    await connectDB();
    const item = await Item.findById(params.id).populate("category").lean();
    if (!item) return jsonError("Not found", 404);
    return jsonOk({ item });
  } catch (err) {
    return handleApiError(err, "admin/items/[id]");
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request);
    await validateCsrf(request, raw);
    const cleaned = sanitizeInput(raw);
    const parsed = parseOrError(itemSchema.partial(), cleaned);
    if (!parsed.success) return jsonError(parsed.error, 400);
    await connectDB();
    const item = await Item.findByIdAndUpdate(
      params.id,
      pick(parsed.data, FIELDS),
      { new: true, runValidators: true }
    );
    if (!item) return jsonError("Not found", 404);
    await writeAudit({
      userId: session.sub,
      action: "update",
      resource: "item",
      resourceId: item._id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    return jsonOk({ item });
  } catch (err) {
    return handleApiError(err, "admin/items/[id]");
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request).catch(() => ({}));
    await validateCsrf(request, raw);
    await connectDB();
    const item = await Item.findByIdAndDelete(params.id);
    if (!item) return jsonError("Not found", 404);
    await writeAudit({
      userId: session.sub,
      action: "delete",
      resource: "item",
      resourceId: params.id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err, "admin/items/[id]");
  }
}
