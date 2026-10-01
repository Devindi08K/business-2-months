import connectDB from "@/lib/db";
import GalleryImage from "@/models/GalleryImage";
import { requireAuth } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { sanitizeInput, pick } from "@/lib/sanitize";
import { gallerySchema, parseOrError } from "@/lib/validation";
import { writeAudit } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";
import {
  jsonOk,
  jsonCreated,
  jsonError,
  handleApiError,
  parseJsonBody,
} from "@/lib/api";

const FIELDS = ["url", "publicId", "caption", "alt", "order", "isActive"];

export async function GET() {
  try {
    await requireAuth();
    await connectDB();
    const images = await GalleryImage.find().sort({ order: 1 }).lean();
    return jsonOk({ images });
  } catch (err) {
    return handleApiError(err, "admin/gallery");
  }
}

export async function POST(request) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request);
    await validateCsrf(request, raw);
    const cleaned = sanitizeInput(raw);
    const parsed = parseOrError(gallerySchema, cleaned);
    if (!parsed.success) return jsonError(parsed.error, 400);
    await connectDB();
    const image = await GalleryImage.create(pick(parsed.data, FIELDS));
    await writeAudit({
      userId: session.sub,
      action: "create",
      resource: "gallery",
      resourceId: image._id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    return jsonCreated({ image });
  } catch (err) {
    return handleApiError(err, "admin/gallery");
  }
}
