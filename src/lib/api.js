import { NextResponse } from "next/server";

export function jsonOk(data, init = {}) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function jsonCreated(data) {
  return NextResponse.json(data, { status: 201 });
}

export function jsonError(message, status = 400, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/**
 * Generic client errors; log details server-side only.
 */
export function handleApiError(err, context = "api") {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) {
    console.error(`[${context}]`, err);
  } else {
    console.warn(`[${context}]`, err.message);
  }

  const clientMessage =
    status === 401
      ? "Unauthorized"
      : status === 403
        ? "Forbidden"
        : status === 404
          ? "Not found"
          : status === 429
            ? err.message || "Too many requests"
            : status < 500
              ? err.message || "Bad request"
              : "Something went wrong";

  return jsonError(clientMessage, status);
}

export async function parseJsonBody(request) {
  try {
    return await request.json();
  } catch {
    const err = new Error("Invalid JSON body");
    err.status = 400;
    throw err;
  }
}
