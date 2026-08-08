import { expect } from "vitest";

/* Shape rules for detail that only ever comes from a real booking.
 *
 * The landing page is public and permanently indexed, so whatever the example
 * trip holds is published to strangers. These describe the *categories* to
 * keep out — record locators, flight designators, street addresses, named
 * individuals, contact details — rather than a list of specific things not to
 * say, so a fresh leak is caught as readily as the one that prompted them.
 *
 * Used by the data guard (lib/example-trip.privacy.test.ts) and by the
 * rendered-output guard (components/marketing-privacy.test.tsx).
 */

export type RedactionRule = { detail: string; pattern: RegExp };

export let REDACTION_RULES: RedactionRule[] = [
  {
    detail: "a booking record locator",
    pattern: /\bconfs?\b|\bconfirmation\s*(?:#|number|code)|\bconf(?:irmation)?\s+in\s+email\b/i,
  },
  {
    detail: "a flight or reservation number",
    pattern: /#\s?\d{2,5}\b/,
  },
  {
    detail: "a street address",
    pattern:
      /\b\d{1,5}\s+(?:[A-Z0-9][\w'’.-]*\s+){1,3}(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Pl|Place|Dr|Drive|Way|Ln|Lane)\b\.?/,
  },
  {
    detail: "a named individual",
    pattern: /\b(?:Sen|Sens|Rep|Reps|Gov|Dr|Mr|Mrs|Ms)\.\s+[A-Z]/,
  },
  {
    detail: "an email address",
    pattern: /[\w.+-]+@[\w-]+\.[\w.]+/,
  },
  {
    detail: "a phone number",
    pattern: /\b(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/,
  },
];

/** The street-address rule on its own, for checking a single field. */
export let STREET_ADDRESS = REDACTION_RULES[2].pattern;

/** Every string reachable from `value`, tagged with where it lives. */
export function deepStrings(value: unknown, path: string): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => deepStrings(v, `${path}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => deepStrings(v, `${path}.${k}`));
  }
  return [];
}

/** Fail if `text` matches any redaction rule, naming the detail it leaked. */
export function assertRedacted(where: string, text: string) {
  for (let { detail, pattern } of REDACTION_RULES) {
    let hit = text.match(pattern);
    expect(hit?.[0], `${where} carries ${detail}`).toBeUndefined();
  }
}
