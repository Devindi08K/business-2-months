import connectDB from "@/lib/db";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { writeAudit } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";
import {
  jsonOk,
  jsonError,
  handleApiError,
  parseJsonBody,
} from "@/lib/api";

export async function DELETE(request, { params }) {
  try {
    const session = await requireAuth({ roles: ["owner"] });
    const raw = await parseJsonBody(request).catch(() => ({}));
    await validateCsrf(request, raw);

    if (String(session.sub) === String(params.id)) {
      return jsonError("You cannot delete your own account", 400);
    }

    await connectDB();
    const user = await User.findById(params.id);
    if (!user) return jsonError("Not found", 404);

    if (user.role === "owner") {
      const ownerCount = await User.countDocuments({ role: "owner" });
      if (ownerCount <= 1) {
        return jsonError("Cannot remove the last owner", 400);
      }
    }

    await User.findByIdAndDelete(params.id);
    await writeAudit({
      userId: session.sub,
      action: "delete",
      resource: "user",
      resourceId: params.id,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err, "admin/users/[id]");
  }
}
