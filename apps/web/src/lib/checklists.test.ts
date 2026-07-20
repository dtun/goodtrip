import { describe, it, expect } from "vitest";
import type { Checklist, ChecklistItem } from "@goodtrip/shared";
import { doneCount, groupChecklists, replaceItem } from "./checklists";

let TRIP = "11111111-1111-4111-8111-111111111111";

function checklist(id: string, day_id: string | null, position: number): Checklist {
  return {
    id,
    trip_id: TRIP,
    day_id,
    title: id,
    position,
    created_at: "2026-07-20T00:00:00Z",
    updated_at: "2026-07-20T00:00:00Z",
  };
}

function item(id: string, checklist_id: string, position: number, done = false): ChecklistItem {
  return {
    id,
    trip_id: TRIP,
    checklist_id,
    label: id,
    position,
    done,
    done_by: null,
    done_at: null,
    created_at: "2026-07-20T00:00:00Z",
    updated_at: "2026-07-20T00:00:00Z",
  };
}

describe("groupChecklists", () => {
  it("splits global from per-day and orders both by position", () => {
    let lists = [
      checklist("essentials", null, 1),
      checklist("clothing", null, 0),
      checklist("d1-evening", "d1", 1),
      checklist("d1-morning", "d1", 0),
    ];
    let grouped = groupChecklists(lists, []);
    expect(grouped.global.map((e) => e.checklist.id)).toEqual(["clothing", "essentials"]);
    expect(grouped.byDay.get("d1")?.map((e) => e.checklist.id)).toEqual([
      "d1-morning",
      "d1-evening",
    ]);
  });

  it("attaches items in position order", () => {
    let grouped = groupChecklists(
      [checklist("clothing", null, 0)],
      [item("b", "clothing", 1), item("a", "clothing", 0)],
    );
    expect(grouped.global[0].items.map((i) => i.id)).toEqual(["a", "b"]);
  });
});

describe("replaceItem", () => {
  it("swaps the matching item in global and per-day lists alike", () => {
    let grouped = groupChecklists(
      [checklist("clothing", null, 0), checklist("d1-morning", "d1", 0)],
      [item("shoes", "clothing", 0), item("sunscreen", "d1-morning", 0)],
    );
    let updated = { ...item("sunscreen", "d1-morning", 0, true), done_by: "eva" };
    let next = replaceItem(grouped, updated);
    expect(next.byDay.get("d1")?.[0].items[0].done).toBe(true);
    expect(next.byDay.get("d1")?.[0].items[0].done_by).toBe("eva");
    // untouched lists keep their state
    expect(next.global[0].items[0].done).toBe(false);
  });
});

describe("doneCount", () => {
  it("counts done vs total", () => {
    let grouped = groupChecklists(
      [checklist("clothing", null, 0)],
      [item("a", "clothing", 0, true), item("b", "clothing", 1)],
    );
    expect(doneCount(grouped.global[0])).toEqual({ done: 1, total: 2 });
  });
});
