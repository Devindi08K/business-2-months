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
  jsonCreated,
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

export async function GET(request) {
  try {
    await requireAuth();
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const filter = category ? { category } : {};
    const items = await Item.find(filter)
      .populate("category", "name slug")
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return jsonOk({ items });
  } catch (err) {
    return handleApiError(err, "admin/items");
  }
}

export async function POST(request) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request);
    await validateCsrf(request, raw);
    const cleaned = sanitizeInput(raw);
    const parsed = parseOrError(itemSchema, cleaned);
    if (!parsed.success) {
      return jsonError(parsed.error, 400);
    }
    await connectDB();
    const data = pick(parsed.data, FIELDS);
    const item = await Item.create(data);
    await writeAudit({
      userId: session.sub,
      action: "create",
      resource: "item",
      resourceId: item._id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    return jsonCreated({ item });
  } catch (err) {
    return handleApiError(err, "admin/items");
  }
}
