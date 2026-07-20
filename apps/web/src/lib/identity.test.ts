import { describe, it, expect } from "vitest";
import type { Profile } from "@goodtrip/shared";
import { SEED_FAMILY_PROFILE_ID_PREFIX } from "@goodtrip/shared";
import { familyRoster, hasClaimedName } from "./identity";

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
