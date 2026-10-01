export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import { requireAuth } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { sanitizeInput, pick } from "@/lib/sanitize";
import { settingsSchema, parseOrError } from "@/lib/validation";
import { writeAudit } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";
import { getSiteSettings } from "@/lib/settings";
import {
  jsonOk,
  jsonError,
  handleApiError,
  parseJsonBody,
} from "@/lib/api";

const FIELDS = [
  "businessName",
  "tagline",
  "logo",
  "phone",
  "phoneRaw",
  "email",
  "whatsapp",
  "address",
  "mapEmbedUrl",
  "mapLink",
  "social",
  "hours",
  "colors",
  "hero",
  "about",
  "seo",
  "features",
  "currency",
  "itemLabels",
];

export async function GET() {
  try {
    await requireAuth();
    const settings = await getSiteSettings();
    return jsonOk({ settings });
  } catch (err) {
    return handleApiError(err, "admin/settings");
  }
}

export async function PUT(request) {
  try {
    const session = await requireAuth({ roles: ["owner", "editor"] });
    const raw = await parseJsonBody(request);
    await validateCsrf(request, raw);
    const cleaned = sanitizeInput(raw);
    const parsed = parseOrError(settingsSchema, cleaned);
    if (!parsed.success) return jsonError(parsed.error, 400);

    await connectDB();
    const data = pick(parsed.data, FIELDS);
    const settings = await SiteSettings.findOneAndUpdate(
      { key: "main" },
      { $set: { ...data, key: "main" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await writeAudit({
      userId: session.sub,
      action: "update",
      resource: "settings",
      resourceId: settings._id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    const merged = await getSiteSettings();
    return jsonOk({ settings: merged });
  } catch (err) {
    return handleApiError(err, "admin/settings");
  }
}
