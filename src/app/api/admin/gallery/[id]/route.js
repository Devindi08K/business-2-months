import connectDB from "@/lib/db";
import GalleryImage from "@/models/GalleryImage";
import { requireAuth } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { sanitizeInput, pick } from "@/lib/sanitize";
import { gallerySchema, parseOrError } from "@/lib/validation";
import { writeAudit } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";
import { deleteImage } from "@/lib/cloudinary";
import {
  jsonOk,
  jsonError,
  handleApiError,
  parseJsonBody,
} from "@/lib/api";

const FIELDS = ["url", "publicId", "caption", "alt", "order", "isActive"];

export async function PUT(request, { params }) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request);
    await validateCsrf(request, raw);
    const cleaned = sanitizeInput(raw);
    const parsed = parseOrError(gallerySchema.partial(), cleaned);
    if (!parsed.success) return jsonError(parsed.error, 400);
    await connectDB();
    const image = await GalleryImage.findByIdAndUpdate(
      params.id,
      pick(parsed.data, FIELDS),
      { new: true }
    );
    if (!image) return jsonError("Not found", 404);
    await writeAudit({
      userId: session.sub,
      action: "update",
      resource: "gallery",
      resourceId: image._id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    return jsonOk({ image });
  } catch (err) {
    return handleApiError(err, "admin/gallery/[id]");
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request).catch(() => ({}));
    await validateCsrf(request, raw);
    await connectDB();
    const image = await GalleryImage.findByIdAndDelete(params.id);
    if (!image) return jsonError("Not found", 404);
    if (image.publicId) {
      try {
        await deleteImage(image.publicId);
      } catch (e) {
        console.error("[gallery] cloudinary delete", e);
      }
    }
    await writeAudit({
      userId: session.sub,
      action: "delete",
      resource: "gallery",
      resourceId: params.id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err, "admin/gallery/[id]");
  }
}
