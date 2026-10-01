export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import {
  clearAuthCookies,
  getSession,
  getRefreshTokenFromCookies,
} from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { writeAudit } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";
import { jsonOk, handleApiError, parseJsonBody } from "@/lib/api";

export async function POST(request) {
  try {
    let body = {};
    try {
      body = await parseJsonBody(request);
    } catch {
      body = {};
    }
    await validateCsrf(request, body);

    const session = await getSession();
    const cookieStore = await cookies();
    clearAuthCookies(cookieStore);

    if (session?.sub) {
      await writeAudit({
        userId: session.sub,
        action: "logout",
        resource: "auth",
        ip: clientIp(request),
        userAgent: request.headers.get("user-agent"),
      });
    }

    // Also clear refresh if present (already cleared by clearAuthCookies)
    getRefreshTokenFromCookies(cookieStore);

    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err, "auth/logout");
  }
}
