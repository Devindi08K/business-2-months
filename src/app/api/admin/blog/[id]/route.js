import connectDB from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { requireAuth } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { sanitizeInput, sanitizeHtml, pick } from "@/lib/sanitize";
import { blogSchema, parseOrError } from "@/lib/validation";
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
  "slug",
  "excerpt",
  "content",
  "coverImage",
  "published",
  "publishedAt",
];

export async function GET(_request, { params }) {
  try {
    await requireAuth();
    await connectDB();
    const post = await BlogPost.findById(params.id).lean();
    if (!post) return jsonError("Not found", 404);
    return jsonOk({ post });
  } catch (err) {
    return handleApiError(err, "admin/blog/[id]");
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request);
    await validateCsrf(request, raw);
    const cleaned = sanitizeInput(raw);
    const parsed = parseOrError(blogSchema.partial(), cleaned);
    if (!parsed.success) return jsonError(parsed.error, 400);
    await connectDB();
    const data = pick(parsed.data, FIELDS);
    if (data.content) data.content = sanitizeHtml(data.content);
    if (data.published === true && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    const post = await BlogPost.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!post) return jsonError("Not found", 404);
    await writeAudit({
      userId: session.sub,
      action: "update",
      resource: "blog",
      resourceId: post._id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    return jsonOk({ post });
  } catch (err) {
    return handleApiError(err, "admin/blog/[id]");
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request).catch(() => ({}));
    await validateCsrf(request, raw);
    await connectDB();
    const post = await BlogPost.findByIdAndDelete(params.id);
    if (!post) return jsonError("Not found", 404);
    await writeAudit({
      userId: session.sub,
      action: "delete",
      resource: "blog",
      resourceId: params.id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err, "admin/blog/[id]");
  }
}
