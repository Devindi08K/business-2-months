import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";
const CSRF_COOKIE = "csrf_token";

const ACCESS_TTL = "15m";
const ACCESS_MAX_AGE = 15 * 60;
const REFRESH_TTL = "7d";
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

function getSecret(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return new TextEncoder().encode(value);
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "strict",
    path: "/",
    maxAge,
  };
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function createAccessToken(payload) {
  return new SignJWT({ ...payload, typ: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .setJti(nanoid())
    .sign(getSecret("JWT_ACCESS_SECRET"));
}

export async function createRefreshToken(payload) {
  return new SignJWT({ ...payload, typ: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .setJti(nanoid())
    .sign(getSecret("JWT_REFRESH_SECRET"));
}

export async function verifyAccessToken(token) {
  const { payload } = await jwtVerify(token, getSecret("JWT_ACCESS_SECRET"));
  if (payload.typ !== "access") throw new Error("Invalid token type");
  return payload;
}

export async function verifyRefreshToken(token) {
  const { payload } = await jwtVerify(token, getSecret("JWT_REFRESH_SECRET"));
  if (payload.typ !== "refresh") throw new Error("Invalid token type");
  return payload;
}

export function setAuthCookies(cookieStore, accessToken, refreshToken) {
  cookieStore.set(ACCESS_COOKIE, accessToken, cookieOptions(ACCESS_MAX_AGE));
  cookieStore.set(REFRESH_COOKIE, refreshToken, cookieOptions(REFRESH_MAX_AGE));
}

export function clearAuthCookies(cookieStore) {
  cookieStore.set(ACCESS_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
  cookieStore.set(REFRESH_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
}

export function getAccessTokenFromCookies(cookieStore) {
  return cookieStore.get(ACCESS_COOKIE)?.value || null;
}

export function getRefreshTokenFromCookies(cookieStore) {
  return cookieStore.get(REFRESH_COOKIE)?.value || null;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = getAccessTokenFromCookies(cookieStore);
  if (!token) return null;
  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}

/**
 * Require authenticated admin. Optionally require owner role.
 */
export async function requireAuth(options = {}) {
  const session = await getSession();
  if (!session?.sub) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
  if (options.roles && !options.roles.includes(session.role)) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
  return session;
}

export function createCsrfToken() {
  return nanoid(32);
}

export function setCsrfCookie(cookieStore, token) {
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: isProduction(),
    sameSite: "strict",
    path: "/",
    maxAge: REFRESH_MAX_AGE,
  });
}

export function getCsrfFromCookies(cookieStore) {
  return cookieStore.get(CSRF_COOKIE)?.value || null;
}

export { ACCESS_COOKIE, REFRESH_COOKIE, CSRF_COOKIE, ACCESS_MAX_AGE, REFRESH_MAX_AGE };
