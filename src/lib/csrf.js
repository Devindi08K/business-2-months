import { cookies } from "next/headers";
import {
  createCsrfToken,
  getCsrfFromCookies,
  setCsrfCookie,
} from "./auth";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Ensure CSRF cookie exists; return the token for clients.
 */
export async function ensureCsrfToken() {
  const cookieStore = await cookies();
  let token = getCsrfFromCookies(cookieStore);
  if (!token) {
    token = createCsrfToken();
    setCsrfCookie(cookieStore, token);
  }
  return token;
}

/**
 * Validate CSRF for state-changing requests.
 * Accepts token from header x-csrf-token or body.csrfToken.
 */
export async function validateCsrf(request, body = {}) {
  if (SAFE_METHODS.has(request.method)) return true;

  const cookieStore = await cookies();
  const cookieToken = getCsrfFromCookies(cookieStore);
  const headerToken = request.headers.get("x-csrf-token");
  const bodyToken = body?.csrfToken;
  const submitted = headerToken || bodyToken;

  if (!cookieToken || !submitted || cookieToken !== submitted) {
    const err = new Error("Invalid CSRF token");
    err.status = 403;
    throw err;
  }
  return true;
}
