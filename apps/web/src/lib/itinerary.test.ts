import { describe, it, expect } from "vitest";
import type { Activity, Day } from "@goodtrip/shared";
import { groupActivitiesByDay, timeLabelToMinutes } from "./itinerary";

let TRIP_ID = "11111111-1111-4111-8111-111111111111";

function day(id: string, day_number: number): Day {
  return {
    id,
    trip_id: TRIP_ID,
    day_number,
    date: `2026-07-2${day_number}`,
    title: `Day ${day_number}`,
    created_at: "2026-07-20T00:00:00Z",
    updated_at: "2026-07-20T00:00:00Z",
  };
}

function activity(
  day_id: string,
  position: number,
  title: string,
  time_label: string | null = null,
): Activity {
  return {
    id: `${day_id}-${position}-${title}`,
    trip_id: TRIP_ID,
    day_id,
    position,
    time_label,
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

describe("groupActivitiesByDay", () => {
  it("orders days by day_number regardless of input order", () => {
    let days = [day("d2", 2), day("d1", 1), day("d3", 3)];
    let grouped = groupActivitiesByDay(days, []);
    expect(grouped.map((g) => g.day.day_number)).toEqual([1, 2, 3]);
  });

  it("attaches activities to their day ordered by position", () => {
    let days = [day("d1", 1), day("d2", 2)];
    let activities = [
      activity("d2", 1, "Lunch"),
      activity("d1", 0, "Flight"),
      activity("d2", 0, "Museum"),
    ];
    let grouped = groupActivitiesByDay(days, activities);
    expect(grouped[0].activities.map((a) => a.title)).toEqual(["Flight"]);
    expect(grouped[1].activities.map((a) => a.title)).toEqual(["Museum", "Lunch"]);
  });

  it("breaks position ties by title so ordering is stable", () => {
    let activities = [activity("d1", 0, "Zoo"), activity("d1", 0, "Arrival")];
    let grouped = groupActivitiesByDay([day("d1", 1)], activities);
    expect(grouped[0].activities.map((a) => a.title)).toEqual(["Arrival", "Zoo"]);
  });

  it("returns a day with no activities as an empty list", () => {
    let grouped = groupActivitiesByDay([day("d1", 1)], []);
    expect(grouped).toHaveLength(1);
    expect(grouped[0].activities).toEqual([]);
  });

  it("orders activities chronologically by time_label, not insertion order", () => {
    // A 9 AM stop added last (highest position) still leads the day.
    let activities = [
      activity("d1", 0, "Capitol Tour", "10:30 AM"),
      activity("d1", 1, "Ford’s Theatre", "1:30 PM"),
      activity("d1", 2, "Return to hotel", "3:00 PM"),
      activity("d1", 3, "Swings Coffee", "9:00 AM"),
    ];
    let grouped = groupActivitiesByDay([day("d1", 1)], activities);
    expect(grouped[0].activities.map((a) => a.title)).toEqual([
      "Swings Coffee",
      "Capitol Tour",
      "Ford’s Theatre",
      "Return to hotel",
    ]);
  });

  it("keeps same-time activities in position order", () => {
    let activities = [
      activity("d1", 1, "Second", "9:00 AM"),
      activity("d1", 0, "First", "9:00 AM"),
    ];
    let grouped = groupActivitiesByDay([day("d1", 1)], activities);
    expect(grouped[0].activities.map((a) => a.title)).toEqual(["First", "Second"]);
  });

  it("sorts untimed / anytime stops after timed ones, by position", () => {
    let activities = [
      activity("d1", 0, "Anytime thing", "Anytime"),
      activity("d1", 1, "Untimed thing", null),
      activity("d1", 2, "Noon thing", "12:00 PM"),
    ];
    let grouped = groupActivitiesByDay([day("d1", 1)], activities);
    expect(grouped[0].activities.map((a) => a.title)).toEqual([
      "Noon thing",
      "Anytime thing",
      "Untimed thing",
    ]);
  });

  it("does not mutate its inputs", () => {
    let days = [day("d2", 2), day("d1", 1)];
    let activities = [activity("d1", 1, "B"), activity("d1", 0, "A")];
    groupActivitiesByDay(days, activities);
    expect(days.map((d) => d.id)).toEqual(["d2", "d1"]);
    expect(activities.map((a) => a.position)).toEqual([1, 0]);
  });
});

describe("timeLabelToMinutes", () => {
  it("reads 12-hour clock times", () => {
    expect(timeLabelToMinutes("9:00 AM")).toBe(9 * 60);
    expect(timeLabelToMinutes("10:30 AM")).toBe(10 * 60 + 30);
    expect(timeLabelToMinutes("1:30 PM")).toBe(13 * 60 + 30);
    expect(timeLabelToMinutes("12:00 PM")).toBe(12 * 60);
    expect(timeLabelToMinutes("12:00 AM")).toBe(0);
    expect(timeLabelToMinutes("9 AM")).toBe(9 * 60);
  });

  it("reads loose time-of-day words", () => {
    expect(timeLabelToMinutes("Morning")).toBeLessThan(timeLabelToMinutes("10:00 AM"));
    expect(timeLabelToMinutes("Evening")).toBeGreaterThan(timeLabelToMinutes("5:45 PM"));
    expect(timeLabelToMinutes("Noon")).toBe(12 * 60);
  });

  it("sends unreadable labels to the end of the day", () => {
    expect(timeLabelToMinutes(null)).toBe(Number.MAX_SAFE_INTEGER);
    expect(timeLabelToMinutes("Anytime")).toBe(Number.MAX_SAFE_INTEGER);
    expect(timeLabelToMinutes("whenever")).toBe(Number.MAX_SAFE_INTEGER);
  });
});
