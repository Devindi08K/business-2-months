import connectDB from "@/lib/db";
import User from "@/models/User";
import { requireAuth, hashPassword, verifyPassword } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { sanitizeInput, pick } from "@/lib/sanitize";
import {
  userCreateSchema,
  passwordChangeSchema,
  parseOrError,
} from "@/lib/validation";
import { writeAudit } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";
import {
  jsonOk,
  jsonCreated,
  jsonError,
  handleApiError,
  parseJsonBody,
} from "@/lib/api";

export async function GET() {
  try {
    await requireAuth({ roles: ["owner"] });
    await connectDB();
    const users = await User.find()
      .select("-passwordHash")
      .sort({ createdAt: 1 })
      .lean();
    return jsonOk({ users });
  } catch (err) {
    return handleApiError(err, "admin/users");
  }
}

export async function POST(request) {
  try {
    const raw = await parseJsonBody(request);
    await validateCsrf(request, raw);
    const cleaned = sanitizeInput(raw);

    if (cleaned.action === "changePassword") {
      const session = await requireAuth();
      const parsed = parseOrError(passwordChangeSchema, cleaned);
      if (!parsed.success) return jsonError(parsed.error, 400);
      await connectDB();
      const user = await User.findById(session.sub);
      if (!user) return jsonError("Not found", 404);
      const ok = await verifyPassword(
        parsed.data.currentPassword,
        user.passwordHash
      );
      if (!ok) return jsonError("Current password is incorrect", 400);
      user.passwordHash = await hashPassword(parsed.data.newPassword);
      user.refreshTokenVersion += 1;
      await user.save();
      await writeAudit({
        userId: session.sub,
        action: "change_password",
        resource: "user",
        resourceId: user._id,
        ip: clientIp(request),
        userAgent: request.headers.get("user-agent"),
      });
      return jsonOk({ ok: true });
    }

    const session = await requireAuth({ roles: ["owner"] });
    const parsed = parseOrError(userCreateSchema, cleaned);
    if (!parsed.success) return jsonError(parsed.error, 400);
    await connectDB();
    const exists = await User.findOne({ email: parsed.data.email });
    if (exists) return jsonError("Email already in use", 400);

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await User.create({
      ...pick(parsed.data, ["name", "email", "role"]),
      passwordHash,
    });

    await writeAudit({
      userId: session.sub,
      action: "create",
      resource: "user",
      resourceId: user._id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return jsonCreated({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return handleApiError(err, "admin/users");
  }
}
