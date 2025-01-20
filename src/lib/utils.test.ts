import { describe, it, expect } from "vitest";
import { randomBoolean } from "./utils";

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
