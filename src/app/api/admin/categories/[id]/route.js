import connectDB from "@/lib/db";
import Category from "@/models/Category";
import { requireAuth } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { sanitizeInput, pick } from "@/lib/sanitize";
import { categorySchema, parseOrError } from "@/lib/validation";
import { writeAudit } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";
import {
  jsonOk,
  jsonError,
  handleApiError,
  parseJsonBody,
} from "@/lib/api";

export async function PUT(request, { params }) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request);
    await validateCsrf(request, raw);
    const cleaned = sanitizeInput(raw);
    const parsed = parseOrError(categorySchema.partial(), cleaned);
    if (!parsed.success) return jsonError(parsed.error, 400);
    await connectDB();
    const category = await Category.findByIdAndUpdate(
      params.id,
      pick(parsed.data, ["name", "slug", "order", "isActive"]),
      { new: true, runValidators: true }
    );
    if (!category) return jsonError("Not found", 404);
    await writeAudit({
      userId: session.sub,
      action: "update",
      resource: "category",
      resourceId: category._id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    return jsonOk({ category });
  } catch (err) {
    return handleApiError(err, "admin/categories/[id]");
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request).catch(() => ({}));
    await validateCsrf(request, raw);
    await connectDB();
    const category = await Category.findByIdAndDelete(params.id);
    if (!category) return jsonError("Not found", 404);
    await writeAudit({
      userId: session.sub,
      action: "delete",
      resource: "category",
      resourceId: params.id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err, "admin/categories/[id]");
  }
}
