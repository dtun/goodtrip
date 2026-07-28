// Waitlist sign-up helpers, shared by the client form and the API route so the
// same normalization and validation run on both sides.

/** Trim + lowercase an email so "  Danny@Example.COM " and "danny@example.com"
 *  collapse to one waitlist row. */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

// Deliberately forgiving: one @, a dotted domain, no spaces. The real gate is
// the confirmation email at launch, not a perfect RFC 5322 regex.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Whether `raw` looks like an email worth storing (checked after normalizing). */
export function isValidEmail(raw: string): boolean {
  const email = normalizeEmail(raw);
  return email.length <= 254 && EMAIL_RE.test(email);
}
