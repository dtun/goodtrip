import { describe, it, expect } from "vitest";
import type { Activity, Day } from "@goodtrip/shared";
import { describeAction } from "./ai";
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

  it("degrades gracefully for unknown ids", () => {
    let text = describeAction(
      { type: "check_item", item_id: "nope", done: false },
      itinerary,
      checklists,
    );
    expect(text).toBe("Uncheck “a checklist item”");
  });
});
