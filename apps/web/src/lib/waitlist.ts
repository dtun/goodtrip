// Waitlist sign-up helpers, shared by the client form and the API route so the
// same normalization and validation run on both sides.

/** Trim + lowercase an email so "  Danny@Example.COM " and "danny@example.com"
 *  collapse to one waitlist row. */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

// Deliberately forgiving: one @, a dotted domain, no spaces. Nothing here sends
// mail, so there is no confirmation step to lean on — but a typo costs one dead
// row at launch, while a strict RFC 5322 regex turns away real addresses today.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Whether `raw` looks like an email worth storing (checked after normalizing). */
export function isValidEmail(raw: string): boolean {
  const email = normalizeEmail(raw);
  return email.length <= 254 && EMAIL_RE.test(email);
}
