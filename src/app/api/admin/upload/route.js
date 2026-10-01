export const dynamic = "force-dynamic";

import { requireAuth } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { uploadImageBuffer, ALLOWED_MIME, MAX_BYTES } from "@/lib/cloudinary";
import { writeAudit } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";

export async function POST(request) {
  try {
    const session = await requireAuth();
    const csrfHeader = request.headers.get("x-csrf-token");
    await validateCsrf(request, { csrfToken: csrfHeader });

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return jsonError("Image uploads are not configured", 503);
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return jsonError("No file uploaded", 400);
    }

    const mimeType = file.type;
    if (!ALLOWED_MIME.has(mimeType)) {
      return jsonError("Invalid file type. Use JPEG, PNG, WebP, or GIF.", 400);
    }
    if (file.size > MAX_BYTES) {
      return jsonError("File too large (max 5MB)", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImageBuffer(buffer, {
      filename: file.name,
      mimeType,
      folder: process.env.CLOUDINARY_FOLDER || "business-site",
    });

    await writeAudit({
      userId: session.sub,
      action: "upload",
      resource: "image",
      details: { publicId: result.publicId },
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return jsonOk({ image: result });
  } catch (err) {
    return handleApiError(err, "admin/upload");
  }
}
