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
  jsonCreated,
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
    const posts = await BlogPost.find().sort({ createdAt: -1 }).lean();
    return jsonOk({ posts });
  } catch (err) {
    return handleApiError(err, "admin/blog");
  }
}

export async function POST(request) {
  try {
    const session = await requireAuth();
    const raw = await parseJsonBody(request);
    await validateCsrf(request, raw);
    const cleaned = sanitizeInput(raw);
    const parsed = parseOrError(blogSchema, cleaned);
    if (!parsed.success) return jsonError(parsed.error, 400);
    await connectDB();
    const data = pick(parsed.data, FIELDS);
    if (!data.slug) data.slug = slugify(data.title);
    data.content = sanitizeHtml(data.content);
    data.author = session.sub;
    if (data.published && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    const post = await BlogPost.create(data);
    await writeAudit({
      userId: session.sub,
      action: "create",
      resource: "blog",
      resourceId: post._id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    return jsonCreated({ post });
  } catch (err) {
    return handleApiError(err, "admin/blog");
  }
}
