import connectDB from "./db";
import RateLimit from "@/models/RateLimit";

/**
 * MongoDB-backed sliding/fixed window rate limiter for serverless.
 * @returns {{ allowed: boolean, remaining: number, retryAfter?: number }}
 */
export async function rateLimit({
  key,
  limit = 10,
  windowMs = 60_000,
}) {
  await connectDB();
  const now = Date.now();
  const windowStart = now - windowMs;

  let doc = await RateLimit.findOne({ key });

  if (!doc || doc.windowStart.getTime() < windowStart) {
    doc = await RateLimit.findOneAndUpdate(
      { key },
      { key, count: 1, windowStart: new Date(now) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return { allowed: true, remaining: limit - 1 };
  }

  if (doc.count >= limit) {
    const retryAfter = Math.ceil(
      (doc.windowStart.getTime() + windowMs - now) / 1000
    );
    return { allowed: false, remaining: 0, retryAfter: Math.max(retryAfter, 1) };
  }

  doc.count += 1;
  await doc.save();
  return { allowed: true, remaining: limit - doc.count };
}

export function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
