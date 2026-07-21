import { describe, it, expect } from "vitest";
import type { Activity, Day, Profile } from "@goodtrip/shared";
import { applyAction, describeAction, undoChange, type AppliedChange } from "./ai";
import type { GoodtripClient } from "./supabase";
import { groupChecklists } from "./checklists";
import type { TripItinerary } from "./goodtrip";

let TRIP = "11111111-1111-4111-8111-111111111111";

function day(id: string, day_number: number): Day {
  return {
    id,
    trip_id: TRIP,
    day_number,
    date: `2026-07-2${day_number}`,
    title: `Day ${day_number}`,
    created_at: "2026-07-20T00:00:00Z",
    updated_at: "2026-07-20T00:00:00Z",
  };
}

function activity(id: string, day_id: string, title: string): Activity {
  return {
    id,
    trip_id: TRIP,
    day_id,
    position: 0,
    time_label: null,
    title,
    location: null,
    cost: null,
    confirmed: false,
    confirmed_note: null,
    booking_url: null,
    booking_code: null,
    booking_cta: null,
    tags: [],
    created_by: null,
    created_at: "2026-07-20T00:00:00Z",
    updated_at: "2026-07-20T00:00:00Z",
  };
}

let itinerary: TripItinerary = {
  trip: {
    id: TRIP,
    name: "Trip",
    destination: "DC",
    start_date: "2026-07-21",
    end_date: "2026-07-29",
    lodging: null,
    created_by: null,
    created_at: "2026-07-20T00:00:00Z",
    updated_at: "2026-07-20T00:00:00Z",
  },
  days: [{ day: day("d4", 4), activities: [activity("a1", "d4", "Dead Sea Scrolls")] }],
};

let checklists = groupChecklists(
  [
    {
      id: "c1",
      trip_id: TRIP,
      day_id: null,
      title: "Essentials",
      position: 0,
      created_at: "2026-07-20T00:00:00Z",
      updated_at: "2026-07-20T00:00:00Z",
    },
  ],
  [
    {
      id: "i1",
      trip_id: TRIP,
      checklist_id: "c1",
      label: "Sunscreen SPF 50+",
      position: 0,
      done: false,
      done_by: null,
      done_at: null,
      created_at: "2026-07-20T00:00:00Z",
      updated_at: "2026-07-20T00:00:00Z",
    },
  ],
);

let me: Profile = {
  id: "99999999-9999-4999-8999-999999999999",
  display_name: "Danny",
  avatar_color: "#c9a84c",
  created_at: "2026-07-20T00:00:00Z",
  updated_at: "2026-07-20T00:00:00Z",
};

/** One recorded query: table, verb, values, and filter columns. */
type Op = {
  table: string;
  verb: "insert" | "update" | "delete";
  values?: Record<string, unknown>;
  eq?: Record<string, unknown>;
};

/* A chainable stand-in for the Supabase client that records every write and
   returns canned rows, so the apply/undo reverse logic can be tested without a
   live database. `.single()` resolves a promise; a chain awaited at `.eq()`
   (undo's update/delete) resolves via the thenable. */
function fakeSupabase(rows: Record<string, Record<string, unknown>> = {}) {
  let ops: Op[] = [];
  function builder(table: string) {
    let op: Op = { table, verb: "insert" };
    let result = () => ({ data: rows[table] ?? null, error: null });
    let b = {
      insert(values: Record<string, unknown>) {
        op = { table, verb: "insert", values };
        return b;
      },
      update(values: Record<string, unknown>) {
        op = { table, verb: "update", values };
        return b;
      },
      delete() {
        op = { table, verb: "delete" };
        return b;
      },
      eq(col: string, val: unknown) {
        op.eq = { ...op.eq, [col]: val };
        return b;
      },
      select() {
        return b;
      },
      single() {
        ops.push(op);
        return Promise.resolve(result());
      },
      then(onOk: (v: { data: unknown; error: null }) => unknown, onErr?: (e: unknown) => unknown) {
        ops.push(op);
        return Promise.resolve(result()).then(onOk, onErr);
      },
    };
    return b;
  }
  return { client: { from: builder } as unknown as GoodtripClient, ops };
}

describe("applyAction / undoChange", () => {
  it("adds an activity and undoes by deleting the new row", async () => {
    let { client, ops } = fakeSupabase({ activities: { id: "new-1" } });
    let change = await applyAction(
      client,
      TRIP,
      me,
      { type: "add_activity", day_number: 4, title: "Wharf dinner" },
      itinerary,
      checklists,
    );
    expect(change).toEqual({
      kind: "added_activity",
      activityId: "new-1",
      title: "Wharf dinner",
      dayNumber: 4,
    });

    await undoChange(client, TRIP, me, change);
    let del = ops.find((o) => o.table === "activities" && o.verb === "delete");
    expect(del?.eq).toEqual({ id: "new-1" });
  });

  it("snapshots pre-edit values so an update can be reverted", async () => {
    let { client } = fakeSupabase({ activities: { title: "Dead Sea Scrolls" } });
    let change = (await applyAction(
      client,
      TRIP,
      me,
      { type: "update_activity", activity_id: "a1", changes: { time_label: "2:00 PM" } },
      itinerary,
      checklists,
    )) as Extract<AppliedChange, { kind: "updated_activity" }>;
    // a1 had a null time_label in the itinerary fixture — Undo restores that.
    expect(change.previous).toEqual({ time_label: null });

    let { client: c2, ops } = fakeSupabase({ activities: { title: "Dead Sea Scrolls" } });
    await undoChange(c2, TRIP, me, change);
    let upd = ops.find((o) => o.table === "activities" && o.verb === "update");
    expect(upd?.values).toEqual({ time_label: null });
    expect(upd?.eq).toEqual({ id: "a1" });
  });

  it("reverses a check by flipping done back off", async () => {
    let { client, ops } = fakeSupabase({ checklist_items: { label: "Sunscreen SPF 50+" } });
    let change = await applyAction(
      client,
      TRIP,
      me,
      { type: "check_item", item_id: "i1", done: true },
      itinerary,
      checklists,
    );
    expect(change).toMatchObject({ kind: "checked_item", itemId: "i1", done: true });

    await undoChange(client, TRIP, me, change);
    let undoUpd = ops.filter((o) => o.table === "checklist_items" && o.verb === "update").at(-1);
    expect(undoUpd?.values).toMatchObject({ done: false, done_by: null });
    expect(undoUpd?.eq).toEqual({ id: "i1" });
  });

  it("adds a checklist item and undoes by deleting the new row", async () => {
    let { client, ops } = fakeSupabase({ checklist_items: { id: "item-new" } });
    let change = await applyAction(
      client,
      TRIP,
      me,
      { type: "add_item", checklist_id: "c1", label: "Passport" },
      itinerary,
      checklists,
    );
    expect(change).toEqual({
      kind: "added_item",
      itemId: "item-new",
      label: "Passport",
      checklistTitle: "Essentials",
    });
    // The insert lands at the end of the list (i1 is position 0 → next is 1).
    let ins = ops.find((o) => o.table === "checklist_items" && o.verb === "insert");
    expect(ins?.values).toMatchObject({ checklist_id: "c1", label: "Passport", position: 1 });

    await undoChange(client, TRIP, me, change);
    let del = ops.find((o) => o.table === "checklist_items" && o.verb === "delete");
    expect(del?.eq).toEqual({ id: "item-new" });
  });

  it("renames a checklist item and undoes by restoring the old label", async () => {
    let { client, ops } = fakeSupabase({ checklist_items: { label: "Sunscreen SPF 100+" } });
    let change = (await applyAction(
      client,
      TRIP,
      me,
      { type: "edit_item", item_id: "i1", label: "Sunscreen SPF 100+" },
      itinerary,
      checklists,
    )) as Extract<AppliedChange, { kind: "edited_item" }>;
    expect(change.previousLabel).toBe("Sunscreen SPF 50+");

    await undoChange(client, TRIP, me, change);
    let upd = ops.filter((o) => o.table === "checklist_items" && o.verb === "update").at(-1);
    expect(upd?.values).toEqual({ label: "Sunscreen SPF 50+" });
    expect(upd?.eq).toEqual({ id: "i1" });
  });

  it("removes a checklist item and undoes by re-creating the exact row", async () => {
    let { client, ops } = fakeSupabase();
    let change = await applyAction(
      client,
      TRIP,
      me,
      { type: "remove_item", item_id: "i1" },
      itinerary,
      checklists,
    );
    expect(change).toMatchObject({ kind: "removed_item" });
    let del = ops.find((o) => o.table === "checklist_items" && o.verb === "delete");
    expect(del?.eq).toEqual({ id: "i1" });

    await undoChange(client, TRIP, me, change);
    let ins = ops.find((o) => o.table === "checklist_items" && o.verb === "insert");
    // Same id and label restored, so lingering references survive the round-trip.
    expect(ins?.values).toMatchObject({ id: "i1", label: "Sunscreen SPF 50+", checklist_id: "c1" });
  });
});

describe("describeAction", () => {
  it("describes add_activity with day and time", () => {
    let text = describeAction(
      { type: "add_activity", day_number: 4, title: "Wharf dinner", time_label: "7:00 PM" },
      itinerary,
      checklists,
    );
    expect(text).toBe("Add “Wharf dinner” to Day 4 · 7:00 PM");
  });

  it("describes update_activity with the real activity title", () => {
    let text = describeAction(
      { type: "update_activity", activity_id: "a1", changes: { time_label: "2:00 PM" } },
      itinerary,
      checklists,
    );
    expect(text).toBe("Update “Dead Sea Scrolls” (time_label)");
  });

  it("describes check_item with the real label", () => {
    let text = describeAction(
      { type: "check_item", item_id: "i1", done: true },
      itinerary,
      checklists,
    );
    expect(text).toBe("Check off “Sunscreen SPF 50+”");
  });

  it("describes add_item with the target checklist title", () => {
    let text = describeAction(
      { type: "add_item", checklist_id: "c1", label: "Passport" },
      itinerary,
      checklists,
    );
    expect(text).toBe("Add “Passport” to Essentials");
  });

  it("describes edit_item as a rename of the real label", () => {
    let text = describeAction(
      { type: "edit_item", item_id: "i1", label: "Sunscreen SPF 100+" },
      itinerary,
      checklists,
    );
    expect(text).toBe("Rename “Sunscreen SPF 50+” to “Sunscreen SPF 100+”");
  });

  it("describes remove_item with the real label", () => {
    let text = describeAction({ type: "remove_item", item_id: "i1" }, itinerary, checklists);
    expect(text).toBe("Remove “Sunscreen SPF 50+”");
  });

  it("degrades gracefully for unknown ids", () => {
    let text = describeAction(
      { type: "check_item", item_id: "nope", done: false },
      itinerary,
      checklists,
    );
    expect(text).toBe("Uncheck “a checklist item”");
  });
});
