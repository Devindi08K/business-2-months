export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);
    return jsonOk({
      user: {
        id: session.sub,
        email: session.email,
        role: session.role,
        name: session.name,
      },
    });
  } catch (err) {
    return handleApiError(err, "auth/me");
  }
}
