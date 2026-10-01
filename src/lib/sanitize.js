import DOMPurify from "isomorphic-dompurify";

/**
 * Strip MongoDB operator characters from strings to prevent NoSQL injection.
 */
export function stripOperators(value) {
  if (typeof value === "string") {
    return value.replace(/[$]/g, "");
  }
  if (Array.isArray(value)) {
    return value.map(stripOperators);
  }
  if (value && typeof value === "object") {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      clean[key] = stripOperators(val);
    }
    return clean;
  }
  return value;
}

/**
 * Deep-clean request body: strip operators and trim strings.
 */
export function sanitizeInput(data) {
  return stripOperators(data);
}

/**
 * Sanitize rich text HTML (admin blog content etc.).
 */
export function sanitizeHtml(dirty) {
  if (!dirty || typeof dirty !== "string") return "";
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "h1",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "a",
      "blockquote",
      "img",
      "span",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "target", "rel"],
  });
}

/**
 * Escape plain text for safe display (no HTML).
 */
export function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Pick only allowed fields from an object (mass-assignment protection).
 */
export function pick(obj, allowed) {
  const result = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}
