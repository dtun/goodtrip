import { describe, it, expect } from "vitest";
import type { Profile } from "@goodtrip/shared";
import { SEED_FAMILY_PROFILE_ID_PREFIX } from "@goodtrip/shared";
import {
  familyRoster,
  hasClaimedName,
  isEmailTakenError,
  isUnknownEmailError,
  linkedEmailFromUser,
  normalizeEmail,
} from "./identity";

function profile(id: string, display_name: string): Profile {
  return {
    id,
    display_name,
    avatar_color: "#C9A84C",
    created_at: "2026-07-20T00:00:00Z",
    updated_at: "2026-07-20T00:00:00Z",
  };
}

describe("familyRoster", () => {
  it("keeps only seeded family profiles, in seed order", () => {
    let danny = profile(`${SEED_FAMILY_PROFILE_ID_PREFIX}01`, "Danny");
    let papa = profile(`${SEED_FAMILY_PROFILE_ID_PREFIX}08`, "Papa");
    let guest = profile("dff3b116-01aa-47b2-86ae-80957ff0018e", "Traveler");

    let roster = familyRoster([guest, papa, danny]);
    expect(roster.map((p) => p.display_name)).toEqual(["Danny", "Papa"]);
  });

  it("returns empty for guests only", () => {
    let guest = profile("dff3b116-01aa-47b2-86ae-80957ff0018e", "Traveler");
    expect(familyRoster([guest])).toEqual([]);
  });
});

describe("hasClaimedName", () => {
  it("treats the default anonymous name as unclaimed", () => {
    expect(hasClaimedName({ display_name: "Traveler" })).toBe(false);
    expect(hasClaimedName({ display_name: "Eva" })).toBe(true);
  });
});

describe("linkedEmailFromUser", () => {
  it("is none for a pure anonymous user", () => {
    expect(linkedEmailFromUser({})).toEqual({ status: "none" });
  });

  it("is pending while the change waits in new_email", () => {
    expect(linkedEmailFromUser({ new_email: "papa@example.com" })).toEqual({
      status: "pending",
      email: "papa@example.com",
    });
  });

  it("is pending when email is set but never confirmed", () => {
    expect(linkedEmailFromUser({ email: "papa@example.com" })).toEqual({
      status: "pending",
      email: "papa@example.com",
    });
  });

  it("is confirmed once email_confirmed_at lands", () => {
    expect(
      linkedEmailFromUser({
        email: "papa@example.com",
        email_confirmed_at: "2026-07-20T00:00:00Z",
      }),
    ).toEqual({ status: "confirmed", email: "papa@example.com" });
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Papa@Example.COM ")).toBe("papa@example.com");
  });
});

describe("auth error classifiers", () => {
  it("recognizes an already-registered email by code or message", () => {
    expect(isEmailTakenError({ code: "email_exists", message: "" })).toBe(true);
    expect(
      isEmailTakenError({ message: "A user with this email address has already been registered" }),
    ).toBe(true);
    expect(isEmailTakenError({ code: "otp_disabled" })).toBe(false);
    expect(isEmailTakenError(null)).toBe(false);
  });

  it("recognizes a sign-in link refused for an unknown email", () => {
    expect(isUnknownEmailError({ code: "otp_disabled" })).toBe(true);
    expect(isUnknownEmailError({ message: "Signups not allowed for otp" })).toBe(true);
    expect(isUnknownEmailError({ code: "email_exists" })).toBe(false);
  });
});
