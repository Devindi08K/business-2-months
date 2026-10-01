/**
 * Optional Turnstile / reCAPTCHA verification.
 * If env keys are not set, verification is skipped (honeypot still applies).
 */
export async function verifyCaptcha(token) {
  const secret = process.env.TURNSTILE_SECRET_KEY || process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  const isTurnstile = Boolean(process.env.TURNSTILE_SECRET_KEY);
  const url = isTurnstile
    ? "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    : "https://www.google.com/recaptcha/api/siteverify";

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  const res = await fetch(url, { method: "POST", body });
  const data = await res.json();
  return Boolean(data.success);
}
