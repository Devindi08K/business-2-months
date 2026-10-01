import connectDB from "./db";
import AuditLog from "@/models/AuditLog";

export async function writeAudit({
  userId,
  action,
  resource,
  resourceId,
  details,
  ip,
  userAgent,
}) {
  try {
    await connectDB();
    await AuditLog.create({
      userId: userId || null,
      action,
      resource,
      resourceId: resourceId ? String(resourceId) : undefined,
      details: details || {},
      ip,
      userAgent,
    });
  } catch (err) {
    console.error("[audit] failed to write", err);
  }
}
