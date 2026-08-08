import { describe, it, expect } from "vitest";
import {
  EXAMPLE_AI_CONVO,
  EXAMPLE_DAY_CHECKLIST,
  EXAMPLE_FEED,
  EXAMPLE_GLOBAL_CHECKLIST,
  EXAMPLE_TRIPS,
  FEATURED_EXAMPLE_TRIP,
  type ExampleTrip,
} from "./example-trip";

/* The example trips are hand-written sample data, so nothing but a test keeps
   them coherent. These pin the invariants the landing page renders against —
   contiguous days, labels that agree with their dates, costs from a fixed
   vocabulary, attributions that name a real traveler — so a trip can be
   rewritten, or a new one added to the picker, without the itinerary quietly
   going crooked. */

let COSTS = ["Free", "$", "$$", "$$$"];

/** Midnight local, so a YYYY-MM-DD never slips a day through UTC. */
function atMidnight(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

function activitiesOf(trip: ExampleTrip) {
  return trip.days.flatMap((d) => d.activities);
}

describe("EXAMPLE_TRIPS", () => {
  it("gives every trip a unique id and picker label", () => {
    expect(new Set(EXAMPLE_TRIPS.map((t) => t.id)).size).toBe(EXAMPLE_TRIPS.length);
    expect(new Set(EXAMPLE_TRIPS.map((t) => t.pill)).size).toBe(EXAMPLE_TRIPS.length);
  });

  it("includes the trip the phone mockup demonstrates", () => {
    expect(EXAMPLE_TRIPS).toContain(FEATURED_EXAMPLE_TRIP);
  });
});

describe.each(EXAMPLE_TRIPS.map((t) => [t.id, t] as const))(
  "the %s example trip",
  (_id: string, trip: ExampleTrip) => {
    let activities = activitiesOf(trip);
    let memberNames = trip.members.map((m) => m.name);

    it("numbers the days 1..n with no gaps", () => {
      expect(trip.days.map((d) => d.n)).toEqual(trip.days.map((_, i) => i + 1));
    });

    it("runs on consecutive calendar dates", () => {
      let dayMs = 86_400_000;
      let gaps = trip.days
        .slice(1)
        .map(
          (d, i) => (atMidnight(d.iso).getTime() - atMidnight(trip.days[i].iso).getTime()) / dayMs,
        );
      expect(gaps.every((g) => g === 1)).toBe(true);
    });

    it("labels each day with the weekday and date its iso actually falls on", () => {
      for (let d of trip.days) {
        let when = atMidnight(d.iso);
        expect(d.dow).toBe(when.toLocaleDateString("en-US", { weekday: "short" }));
        expect(d.date).toBe(when.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
      }
    });

    it("keeps checklist progress a percentage", () => {
      for (let d of trip.days) {
        expect(Number.isInteger(d.progress)).toBe(true);
        expect(d.progress).toBeGreaterThanOrEqual(0);
        expect(d.progress).toBeLessThanOrEqual(100);
      }
    });

    it("gives every day a title and at least one activity", () => {
      for (let d of trip.days) {
        expect(d.title.trim()).not.toBe("");
        expect(d.activities.length).toBeGreaterThan(0);
      }
    });

    it("draws every cost from the price vocabulary the UI styles", () => {
      for (let cost of [...trip.days.map((d) => d.cost), ...activities.map((a) => a.cost)]) {
        if (cost === undefined) continue;
        expect(COSTS).toContain(cost);
      }
    });

    it("gives every activity a title", () => {
      for (let a of activities) expect(a.title.trim()).not.toBe("");
    });

    it("links out over https, always with a call to action", () => {
      // ActivityRow falls back to "Book", which is wrong for an info link.
      for (let a of activities) {
        if (!a.url) continue;
        expect(a.url.startsWith("https://")).toBe(true);
        expect(a.cta, `${a.title} links out without a cta`).toBeTruthy();
      }
    });

    it("says what a confirmed activity is confirmed by", () => {
      for (let a of activities) {
        if (a.confirmed) expect(a.confirmedNote, `${a.title} is confirmed silently`).toBeTruthy();
      }
    });

    it("never presents an unaccepted suggestion as already booked", () => {
      for (let a of activities) {
        if (a.suggested) {
          expect(a.confirmed, `${a.title} is both suggested and confirmed`).toBeFalsy();
        }
      }
    });

    it("shows off both confirmations and suggestions", () => {
      expect(activities.some((a) => a.confirmed)).toBe(true);
      expect(activities.some((a) => a.suggested)).toBe(true);
    });

    it("opens on the first day and carries its year", () => {
      expect(trip.dates.startsWith(trip.days[0].date)).toBe(true);
      expect(trip.dates).toContain(trip.days[0].iso.slice(0, 4));
      expect(trip.datesLong).toContain(trip.days[0].iso.slice(0, 4));
    });

    it("names a destination, a billing, and a place to stay", () => {
      expect(trip.destination.trim()).not.toBe("");
      expect(trip.name.trim()).not.toBe("");
      expect(trip.hotel.trim()).not.toBe("");
      expect(trip.lodging.trim()).not.toBe("");
      expect(trip.transit.trim()).not.toBe("");
    });

    it("points the forecast at real coordinates", () => {
      expect(Math.abs(trip.coords.latitude)).toBeLessThanOrEqual(90);
      expect(Math.abs(trip.coords.longitude)).toBeLessThanOrEqual(180);
    });

    it("has no duplicate traveler names or initials", () => {
      expect(new Set(memberNames).size).toBe(trip.members.length);
      expect(new Set(trip.members.map((m) => m.initials)).size).toBe(trip.members.length);
    });

    it("gives every avatar a hex color", () => {
      for (let m of trip.members) expect(m.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it("has enough travelers online to fill the header avatar stack", () => {
      expect(trip.members.filter((m) => m.online).length).toBeGreaterThanOrEqual(3);
    });
  },
);

describe("the featured trip's checklists", () => {
  let items = [...EXAMPLE_DAY_CHECKLIST, ...EXAMPLE_GLOBAL_CHECKLIST.flatMap((g) => g.items)];
  let memberNames = FEATURED_EXAMPLE_TRIP.members.map((m) => m.name);

  it("attributes checked items to a traveler on the trip", () => {
    for (let item of items) {
      if (!item.by) continue;
      expect(memberNames).toContain(item.by);
    }
  });

  it("only attributes items that are actually done", () => {
    for (let item of items) {
      if (item.by) expect(item.done, `"${item.text}" is credited but unchecked`).toBe(true);
    }
  });

  it("leaves the packing progress bar partway along", () => {
    let all = EXAMPLE_GLOBAL_CHECKLIST.flatMap((g) => g.items);
    let done = all.filter((i) => i.done).length;
    expect(done).toBeGreaterThan(0);
    expect(done).toBeLessThan(all.length);
  });

  it("gives every checklist group a category and items", () => {
    for (let group of EXAMPLE_GLOBAL_CHECKLIST) {
      expect(group.category.trim()).not.toBe("");
      expect(group.items.length).toBeGreaterThan(0);
    }
  });
});

describe("EXAMPLE_AI_CONVO", () => {
  it("opens with the traveler and alternates turns", () => {
    expect(EXAMPLE_AI_CONVO[0].role).toBe("user");
    let roles = EXAMPLE_AI_CONVO.map((m) => m.role);
    expect(roles.slice(1).every((r, i) => r !== roles[i])).toBe(true);
  });

  it("ends on an answer", () => {
    expect(EXAMPLE_AI_CONVO[EXAMPLE_AI_CONVO.length - 1].role).toBe("assistant");
  });
});

describe("EXAMPLE_FEED", () => {
  it("credits each entry to a traveler or to GOODTrip itself", () => {
    let names = [...FEATURED_EXAMPLE_TRIP.members.map((m) => m.name), "GOODTrip"];
    for (let entry of EXAMPLE_FEED) expect(names).toContain(entry.who);
  });
});
