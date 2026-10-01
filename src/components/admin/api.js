"use client";

let csrfTokenCache = null;

export async function getCsrfToken(force = false) {
  if (csrfTokenCache && !force) return csrfTokenCache;
  const res = await fetch("/api/auth/csrf", { credentials: "include" });
  const data = await res.json();
  csrfTokenCache = data.csrfToken;
  return csrfTokenCache;
}

export function clearCsrfCache() {
  csrfTokenCache = null;
}

export async function api(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = { ...(options.headers || {}) };

  if (!options.skipCsrf && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    const token = await getCsrfToken();
    headers["x-csrf-token"] = token;
  }

  let body = options.body;
  if (body && !(body instanceof FormData) && typeof body === "object") {
    headers["Content-Type"] = "application/json";
    if (!options.skipCsrf) {
      const token = headers["x-csrf-token"] || (await getCsrfToken());
      body = { ...body, csrfToken: token };
    }
    body = JSON.stringify(body);
  }

  let res = await fetch(path, {
    ...options,
    method,
    headers,
    body,
    credentials: "include",
  });

  if (res.status === 401 && !options.skipRefresh) {
    const refreshed = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    if (refreshed.ok) {
      return api(path, { ...options, skipRefresh: true });
    }
  }

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : null;

  if (!res.ok) {
    const err = new Error(data?.error || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
