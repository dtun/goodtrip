import { describe, it, expect } from "vitest";
import {
  EXAMPLE_AI_CONVO,
  EXAMPLE_DAYS,
  EXAMPLE_DAY_CHECKLIST,
  EXAMPLE_FEED,
  EXAMPLE_GLOBAL_CHECKLIST,
  EXAMPLE_MEMBERS,
  EXAMPLE_TRIP,
} from "./example-trip";

/* The example trip is hand-written sample data, so nothing but a test keeps it
   coherent. These pin the invariants the landing page renders against —
   contiguous days, labels that agree with their dates, costs from a fixed
   vocabulary, attributions that name a real traveler — so the content can be
   rewritten freely without the itinerary quietly going crooked. */

let COSTS = ["Free", "$", "$$", "$$$"];
let MEMBER_NAMES = EXAMPLE_MEMBERS.map((m) => m.name);
let ACTIVITIES = EXAMPLE_DAYS.flatMap((d) => d.activities);

/** Midnight local, so a YYYY-MM-DD never slips a day through UTC. */
function atMidnight(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

describe("EXAMPLE_DAYS", () => {
  it("numbers the days 1..n with no gaps", () => {
    expect(EXAMPLE_DAYS.map((d) => d.n)).toEqual(EXAMPLE_DAYS.map((_, i) => i + 1));
  });

  it("runs on consecutive calendar dates", () => {
    let dayMs = 86_400_000;
    let gaps = EXAMPLE_DAYS.slice(1).map(
      (d, i) => (atMidnight(d.iso).getTime() - atMidnight(EXAMPLE_DAYS[i].iso).getTime()) / dayMs,
    );
    expect(gaps.every((g) => g === 1)).toBe(true);
  });

  it("labels each day with the weekday and date its iso actually falls on", () => {
    for (let d of EXAMPLE_DAYS) {
      let when = atMidnight(d.iso);
      expect(d.dow).toBe(when.toLocaleDateString("en-US", { weekday: "short" }));
      expect(d.date).toBe(when.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    }
  });

  it("keeps checklist progress a percentage", () => {
    for (let d of EXAMPLE_DAYS) {
      expect(Number.isInteger(d.progress)).toBe(true);
      expect(d.progress).toBeGreaterThanOrEqual(0);
      expect(d.progress).toBeLessThanOrEqual(100);
    }
  });

  it("gives every day a title and at least one activity", () => {
    for (let d of EXAMPLE_DAYS) {
      expect(d.title.trim()).not.toBe("");
      expect(d.activities.length).toBeGreaterThan(0);
    }
  });

  it("draws every cost from the price vocabulary the UI styles", () => {
    let costs = [...EXAMPLE_DAYS.map((d) => d.cost), ...ACTIVITIES.map((a) => a.cost)];
    for (let cost of costs) {
      if (cost === undefined) continue;
      expect(COSTS).toContain(cost);
    }
  });
});

describe("example activities", () => {
  it("gives every activity a title", () => {
    for (let a of ACTIVITIES) expect(a.title.trim()).not.toBe("");
  });

  it("links out over https only", () => {
    for (let a of ACTIVITIES) {
      if (!a.url) continue;
      expect(a.url.startsWith("https://")).toBe(true);
    }
  });

  it("labels every outbound link with a call to action", () => {
    // ActivityRow falls back to "Book", which is wrong for an info link.
    for (let a of ACTIVITIES) {
      if (!a.url) continue;
      expect(a.cta, `${a.title} links out without a cta`).toBeTruthy();
    }
  });

  it("shows the day-list confirmed counter something to count", () => {
    expect(ACTIVITIES.some((a) => a.confirmed)).toBe(true);
  });
});

describe("EXAMPLE_TRIP", () => {
  it("opens on the first day and carries its year", () => {
    expect(EXAMPLE_TRIP.dates.startsWith(EXAMPLE_DAYS[0].date)).toBe(true);
    expect(EXAMPLE_TRIP.dates).toContain(EXAMPLE_DAYS[0].iso.slice(0, 4));
  });

  it("names a destination and a place to stay", () => {
    expect(EXAMPLE_TRIP.destination.trim()).not.toBe("");
    expect(EXAMPLE_TRIP.name.trim()).not.toBe("");
    expect(EXAMPLE_TRIP.hotel.trim()).not.toBe("");
  });
});

describe("EXAMPLE_MEMBERS", () => {
  it("has no duplicate names or initials", () => {
    expect(new Set(MEMBER_NAMES).size).toBe(EXAMPLE_MEMBERS.length);
    expect(new Set(EXAMPLE_MEMBERS.map((m) => m.initials)).size).toBe(EXAMPLE_MEMBERS.length);
  });

  it("gives every avatar a hex color", () => {
    for (let m of EXAMPLE_MEMBERS) expect(m.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("has someone online for the header avatar stack", () => {
    expect(EXAMPLE_MEMBERS.filter((m) => m.online).length).toBeGreaterThanOrEqual(3);
  });
});

describe("example checklists", () => {
  let items = [...EXAMPLE_DAY_CHECKLIST, ...EXAMPLE_GLOBAL_CHECKLIST.flatMap((g) => g.items)];

  it("attributes checked items to a traveler on the trip", () => {
    for (let item of items) {
      if (!item.by) continue;
      expect(MEMBER_NAMES).toContain(item.by);
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
    for (let entry of EXAMPLE_FEED) {
      expect([...MEMBER_NAMES, "GOODTrip"]).toContain(entry.who);
    }
  });
});
