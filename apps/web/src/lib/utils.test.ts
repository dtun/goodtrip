import { describe, it, expect } from "vitest";
import { errorMessage, mapsUrl, randomBoolean } from "./utils";

describe("mapsUrl", () => {
  it("builds a maps.apple.com search link that opens the native Maps app", () => {
    expect(mapsUrl("Museum of the Bible, 400 4th St SW, Washington, DC")).toBe(
      "https://maps.apple.com/?q=Museum%20of%20the%20Bible%2C%20400%204th%20St%20SW%2C%20Washington%2C%20DC",
    );
  });

  it("encodes ampersands and other reserved characters in the query", () => {
    expect(mapsUrl("4th St SW & Independence Ave SW")).toBe(
      "https://maps.apple.com/?q=4th%20St%20SW%20%26%20Independence%20Ave%20SW",
    );
  });
});

describe("errorMessage", () => {
  it("uses Error messages directly", () => {
    expect(errorMessage(new Error("boom"))).toBe("boom");
  });

  it("assembles Supabase-style plain-object errors", () => {
    expect(errorMessage({ message: "nope", code: "42501", details: "RLS" })).toBe(
      "nope (42501) RLS",
    );
  });

  it("never renders [object Object]", () => {
    expect(errorMessage({ weird: true })).toBe('{"weird":true}');
  });
});

describe("randomBoolean", () => {
  it("should return boolean values", () => {
    let result = randomBoolean();
    expect(typeof result).toBe("boolean");
  });

  it("should respect the default threshold of 0.5", () => {
    let iterations = 10000;
    let trueCount = 0;

    for (let i = 0; i < iterations; i++) {
      if (randomBoolean()) trueCount++;
    }

    let ratio = trueCount / iterations;
    // Allow for some statistical variance (within 5%)
    expect(ratio).toBeGreaterThan(0.45);
    expect(ratio).toBeLessThan(0.55);
  });

  it("should respect custom thresholds", () => {
    let iterations = 10000;
    let threshold = 0.7;
    let trueCount = 0;

    for (let i = 0; i < iterations; i++) {
      if (randomBoolean(threshold)) trueCount++;
    }

    let ratio = trueCount / iterations;
    // Allow for some statistical variance (within 5%)
    expect(ratio).toBeGreaterThan(threshold - 0.05);
    expect(ratio).toBeLessThan(threshold + 0.05);
  });
});
