import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppMockup } from "./app-mockup";
import {
  EXAMPLE_AI_CONVO,
  EXAMPLE_AI_SUGGESTIONS,
  EXAMPLE_FEED,
  EXAMPLE_GLOBAL_CHECKLIST,
  FEATURED_EXAMPLE_TRIP as TRIP,
} from "@/lib/example-trip";

/* The phone mockup is the landing page's interactive demo. These cover the
   navigation a visitor actually performs — switch tabs, open a day, come
   back — so the demo can't quietly become a dead-end. */

function openTab(name: RegExp) {
  return userEvent.click(screen.getByRole("button", { name }));
}

describe("AppMockup", () => {
  it("opens on the itinerary, listing every day", async () => {
    render(<AppMockup />);
    expect(screen.getByText(TRIP.destination)).toBeInTheDocument();
    for (let day of TRIP.days) {
      expect(screen.getByText(day.title)).toBeInTheDocument();
    }
  });

  it("drills into a day and back out again", async () => {
    render(<AppMockup />);
    let day = TRIP.days[1];

    await userEvent.click(screen.getByText(day.title));
    expect(screen.getByText(`Day ${day.n} · ${day.dow} ${day.date}`)).toBeInTheDocument();
    for (let activity of day.activities) {
      expect(screen.getByText(activity.title)).toBeInTheDocument();
    }

    await userEvent.click(screen.getByRole("button", { name: /back to itinerary/i }));
    expect(screen.getByText(TRIP.days[0].title)).toBeInTheDocument();
    expect(screen.queryByText(`Day ${day.n} · ${day.dow} ${day.date}`)).not.toBeInTheDocument();
  });

  it("counts the packing list against the real checklist data", async () => {
    render(<AppMockup />);
    await openTab(/checklists/i);

    let all = EXAMPLE_GLOBAL_CHECKLIST.flatMap((g) => g.items);
    let done = all.filter((i) => i.done).length;
    expect(screen.getByText(`${done} of ${all.length}`)).toBeInTheDocument();

    for (let group of EXAMPLE_GLOBAL_CHECKLIST) {
      expect(screen.getByText(group.category)).toBeInTheDocument();
    }
  });

  it("shows the assistant conversation and its suggestions", async () => {
    render(<AppMockup />);
    await openTab(/^ask$/i);

    for (let message of EXAMPLE_AI_CONVO) {
      expect(screen.getByText(message.content)).toBeInTheDocument();
    }
    for (let suggestion of EXAMPLE_AI_SUGGESTIONS) {
      expect(screen.getByText(suggestion)).toBeInTheDocument();
    }
  });

  it("lists the whole party and the activity feed", async () => {
    render(<AppMockup />);
    await openTab(/^trip$/i);

    expect(screen.getByText(`Travelers · ${TRIP.members.length}`)).toBeInTheDocument();
    // Names recur in the feed below the roster, so presence is the assertion.
    for (let member of TRIP.members) {
      expect(screen.getAllByText(member.name).length).toBeGreaterThan(0);
    }
    for (let entry of EXAMPLE_FEED) {
      expect(screen.getByText(entry.target)).toBeInTheDocument();
    }
  });

  it("badges a suggested activity inside its day", async () => {
    render(<AppMockup />);
    let day = TRIP.days.find((d) => d.activities.some((a) => a.suggested))!;
    await userEvent.click(screen.getByText(day.title));

    let expected = day.activities.filter((a) => a.suggested).length;
    expect(screen.getAllByText("Suggested").length).toBe(expected);
  });

  it("marks the open tab for assistive tech", async () => {
    render(<AppMockup />);
    await openTab(/checklists/i);
    let checklists = screen.getByRole("button", { name: /checklists/i });
    expect(checklists).toHaveAttribute("aria-current", "page");
  });

  it("returns to the day list when the tab changes", async () => {
    render(<AppMockup />);
    await userEvent.click(screen.getByText(TRIP.days[0].title));
    await openTab(/^trip$/i);
    await openTab(/itinerary/i);

    for (let day of TRIP.days) {
      expect(within(screen.getByText(day.title)).queryByText(day.title)).toBeDefined();
    }
    expect(screen.queryByRole("button", { name: /back to itinerary/i })).not.toBeInTheDocument();
  });
});
