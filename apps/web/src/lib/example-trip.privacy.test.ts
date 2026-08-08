import { describe, it, expect } from "vitest";
import * as exampleTrip from "./example-trip";
import { REDACTION_RULES, STREET_ADDRESS, deepStrings } from "@/test/redaction";

/* The landing page is public and permanently indexed. Whatever sits in
   example-trip.ts is published to strangers, so it has to be sample data all
   the way down — a trip that looks real without being anyone's.

   The rules live in test/redaction.ts and match categories of detail rather
   than specific strings; components/marketing-privacy.test.tsx runs the same
   rules over the rendered page, where a hardcoded roster or print header can
   reintroduce something the data no longer holds. */

let ALL_STRINGS = deepStrings(exampleTrip, "example-trip");

describe("the example trip carries no personal detail", () => {
  for (let { detail, pattern } of REDACTION_RULES) {
    it(`never shows ${detail}`, () => {
      let leaks = ALL_STRINGS.filter(([, text]) => pattern.test(text)).map(
        ([path, text]) => `${path}: ${text}`,
      );
      expect(leaks).toEqual([]);
    });
  }

  it("advertises no booking or discount codes", () => {
    // A code on a public page is either somebody's real record locator or a
    // fabricated offer against a real vendor. The example trip has neither.
    let coded = exampleTrip.EXAMPLE_DAYS.flatMap((d) => d.activities).filter((a) => a.code);
    expect(coded.map((a) => a.title)).toEqual([]);
  });

  it("describes lodging without pinning it to a real address", () => {
    expect(exampleTrip.EXAMPLE_TRIP.hotel).not.toMatch(STREET_ADDRESS);
  });

  it("names travelers only by a first name or nickname", () => {
    for (let member of exampleTrip.EXAMPLE_MEMBERS) {
      expect(member.name.trim().split(/\s+/).length, `${member.name} reads as a full name`).toBe(1);
    }
  });
});
