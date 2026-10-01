import { ensureCsrfToken } from "@/lib/csrf";
import { getSession } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const csrfToken = await ensureCsrfToken();
    const session = await getSession();
    return jsonOk({
      csrfToken,
      user: session
        ? {
            id: session.sub,
            email: session.email,
            role: session.role,
            name: session.name,
          }
        : null,
    });
  } catch (err) {
    return handleApiError(err, "auth/csrf");
  }
}
