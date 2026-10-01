export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import User from "@/models/User";
import {
  verifyPassword,
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
  createCsrfToken,
  setCsrfCookie,
} from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";
import { loginSchema, parseOrError } from "@/lib/validation";
import { writeAudit } from "@/lib/audit";
import { jsonOk, handleApiError, parseJsonBody } from "@/lib/api";
import { cookies } from "next/headers";

const MAX_FAILED = 5;
const LOCK_MS = 15 * 60 * 1000;

export async function POST(request) {
  try {
    const ip = clientIp(request);
    const limit = await rateLimit({
      key: `login:${ip}`,
      limit: 20,
      windowMs: 15 * 60 * 1000,
    });
    if (!limit.allowed) {
      const err = new Error("Too many login attempts. Try again later.");
      err.status = 429;
      throw err;
    }

    const raw = await parseJsonBody(request);
    await validateCsrf(request, raw);
    const cleaned = sanitizeInput(raw);
    const parsed = parseOrError(loginSchema, cleaned);
    if (!parsed.success) {
      const err = new Error("Invalid credentials");
      err.status = 401;
      throw err;
    }

    await connectDB();
    const user = await User.findOne({ email: parsed.data.email });
    if (!user) {
      const err = new Error("Invalid credentials");
      err.status = 401;
      throw err;
    }

    if (user.isLocked()) {
      const err = new Error("Account temporarily locked. Try again later.");
      err.status = 423;
      throw err;
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_FAILED) {
        user.lockUntil = new Date(Date.now() + LOCK_MS);
        user.failedLoginAttempts = 0;
      }
      await user.save();
      await writeAudit({
        userId: user._id,
        action: "login_failed",
        resource: "auth",
        ip,
        userAgent: request.headers.get("user-agent"),
      });
      const err = new Error("Invalid credentials");
      err.status = 401;
      throw err;
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();
    await user.save();

    const tokenPayload = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
      name: user.name,
      rv: user.refreshTokenVersion,
    };

    const accessToken = await createAccessToken(tokenPayload);
    const refreshToken = await createRefreshToken(tokenPayload);
    const cookieStore = await cookies();
    setAuthCookies(cookieStore, accessToken, refreshToken);
    const csrf = createCsrfToken();
    setCsrfCookie(cookieStore, csrf);

    await writeAudit({
      userId: user._id,
      action: "login",
      resource: "auth",
      ip,
      userAgent: request.headers.get("user-agent"),
    });

    return jsonOk({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      csrfToken: csrf,
    });
  } catch (err) {
    return handleApiError(err, "auth/login");
  }
}
