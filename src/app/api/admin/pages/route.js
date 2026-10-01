import connectDB from "@/lib/db";
import PageContent from "@/models/PageContent";
import { requireAuth } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { sanitizeInput, pick } from "@/lib/sanitize";
import { pageContentSchema, parseOrError } from "@/lib/validation";
import { writeAudit } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";
import {
  jsonOk,
  jsonCreated,
  jsonError,
  handleApiError,
  parseJsonBody,
} from "@/lib/api";

export async function GET(request) {
  try {
    await requireAuth();
    await connectDB();
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const filter = key ? { key } : {};
    const pages = await PageContent.find(filter).lean();
    return jsonOk({ pages });
  } catch (err) {
    return handleApiError(err, "admin/pages");
  }
}

export async function PUT(request) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request);
    await validateCsrf(request, raw);
    const cleaned = sanitizeInput(raw);
    const parsed = parseOrError(pageContentSchema, cleaned);
    if (!parsed.success) return jsonError(parsed.error, 400);

    await connectDB();
    const data = pick(parsed.data, ["key", "locale", "sections"]);
    const locale = data.locale || "en";
    const page = await PageContent.findOneAndUpdate(
      { key: data.key, locale },
      { $set: { sections: data.sections, key: data.key, locale } },
      { upsert: true, new: true }
    );

    await writeAudit({
      userId: session.sub,
      action: "update",
      resource: "page",
      resourceId: page._id,
      details: { key: data.key, locale },
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return jsonOk({ page });
  } catch (err) {
    return handleApiError(err, "admin/pages");
  }
}

export async function POST(request) {
  return PUT(request);
}
