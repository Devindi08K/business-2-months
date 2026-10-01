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
  jsonCreated,
  jsonError,
  handleApiError,
  parseJsonBody,
} from "@/lib/api";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  try {
    await requireAuth();
    await connectDB();
    const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
    return jsonOk({ categories });
  } catch (err) {
    return handleApiError(err, "admin/categories");
  }
}

export async function POST(request) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request);
    await validateCsrf(request, raw);
    const cleaned = sanitizeInput(raw);
    const parsed = parseOrError(categorySchema, cleaned);
    if (!parsed.success) return jsonError(parsed.error, 400);
    await connectDB();
    const data = pick(parsed.data, ["name", "slug", "order", "isActive"]);
    if (!data.slug) data.slug = slugify(data.name);
    const category = await Category.create(data);
    await writeAudit({
      userId: session.sub,
      action: "create",
      resource: "category",
      resourceId: category._id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    return jsonCreated({ category });
  } catch (err) {
    return handleApiError(err, "admin/categories");
  }
}
