import { describe, expect, it } from "vitest";
import { isValidEmail, normalizeEmail } from "./waitlist";

describe("normalizeEmail", () => {
  it("trims surrounding whitespace and lowercases", () => {
    expect(normalizeEmail("  Danny@Example.COM ")).toBe("danny@example.com");
  });

  it("leaves an already-normal address unchanged", () => {
    expect(normalizeEmail("danny@example.com")).toBe("danny@example.com");
  });
});

describe("isValidEmail", () => {
  it("accepts ordinary addresses", () => {
    expect(isValidEmail("danny@tunney.dev")).toBe(true);
    expect(isValidEmail("a.b+tag@sub.example.co.uk")).toBe(true);
  });

  it("accepts addresses that only differ by case or padding", () => {
    expect(isValidEmail("  Danny@Example.COM ")).toBe(true);
  });

  it("rejects addresses without a dotted domain", () => {
    expect(isValidEmail("danny@localhost")).toBe(false);
  });

  it("rejects addresses missing the local part or @", () => {
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("danny.example.com")).toBe(false);
  });

  it("rejects blanks, spaces, and double @", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("   ")).toBe(false);
    expect(isValidEmail("da nny@example.com")).toBe(false);
    expect(isValidEmail("danny@@example.com")).toBe(false);
  });

  it("rejects an overlong address", () => {
    expect(isValidEmail(`${"a".repeat(250)}@example.com`)).toBe(false);
  });
});
