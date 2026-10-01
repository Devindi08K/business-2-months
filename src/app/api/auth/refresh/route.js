import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import User from "@/models/User";
import {
  getRefreshTokenFromCookies,
  verifyRefreshToken,
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refresh = getRefreshTokenFromCookies(cookieStore);
    if (!refresh) {
      return jsonError("Unauthorized", 401);
    }

    let payload;
    try {
      payload = await verifyRefreshToken(refresh);
    } catch {
      clearAuthCookies(cookieStore);
      return jsonError("Unauthorized", 401);
    }

    await connectDB();
    const user = await User.findById(payload.sub);
    if (!user || user.refreshTokenVersion !== (payload.rv ?? 0)) {
      clearAuthCookies(cookieStore);
      return jsonError("Unauthorized", 401);
    }

    const tokenPayload = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
      name: user.name,
      rv: user.refreshTokenVersion,
    };

    const accessToken = await createAccessToken(tokenPayload);
    const refreshToken = await createRefreshToken(tokenPayload);
    setAuthCookies(cookieStore, accessToken, refreshToken);

    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err, "auth/refresh");
  }
}
