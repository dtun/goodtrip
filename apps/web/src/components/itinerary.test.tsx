import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ItineraryTicket, PrintableItinerary } from "./itinerary";
import { FEATURED_EXAMPLE_TRIP as TRIP } from "@/lib/example-trip";
import type { WeatherByDate } from "@/lib/weather";

/* The ticket and the print sheet are the two places the example itinerary
   reaches the public. These assert against the data rather than against
   literal copy, so rewriting the example can't quietly drop a day. */

let ACTIVITIES = TRIP.days.flatMap((d) => d.activities);

function forecast(): WeatherByDate {
  return { [TRIP.days[0].iso]: { sky: "rain", summary: "Showers", hi: 61, lo: 48 } };
}

describe("ItineraryTicket", () => {
  it("heads the ticket with the trip", () => {
    render(<ItineraryTicket trip={TRIP} />);
    expect(screen.getByRole("heading", { name: TRIP.destination })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(TRIP.name))).toBeInTheDocument();
  });

  it("renders every day, headed by its title", () => {
    render(<ItineraryTicket trip={TRIP} />);
    for (let day of TRIP.days) {
      expect(screen.getByRole("heading", { name: day.title, level: 3 })).toBeInTheDocument();
    }
  });

  it("renders every activity", () => {
    render(<ItineraryTicket trip={TRIP} />);
    for (let activity of ACTIVITIES) {
      expect(screen.getAllByText(activity.title).length).toBeGreaterThan(0);
    }
  });

  it("opens booking links in a new tab without leaking the referrer", () => {
    render(<ItineraryTicket trip={TRIP} />);
    let linked = ACTIVITIES.filter((a) => a.url);
    expect(linked.length).toBeGreaterThan(0);
    for (let activity of linked) {
      let link = screen.getByRole("link", {
        name: `${activity.cta ?? "Book"}: ${activity.title} (opens in a new tab)`,
      });
      expect(link).toHaveAttribute("href", activity.url);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link.getAttribute("rel")).toContain("noreferrer");
    }
  });

  it("shows a forecast only for the days that have one", () => {
    render(<ItineraryTicket trip={TRIP} weather={forecast()} />);
    expect(screen.getByTitle("61° / 48° · Showers")).toBeInTheDocument();
    expect(screen.getAllByTitle(/·/).length).toBe(1);
  });

  it("omits weather entirely when the forecast is unavailable", () => {
    render(<ItineraryTicket trip={TRIP} />);
    expect(screen.queryByTitle(/°/)).not.toBeInTheDocument();
  });

  it("marks the assistant's proposals as suggestions", () => {
    render(<ItineraryTicket trip={TRIP} />);
    let suggested = ACTIVITIES.filter((a) => a.suggested);
    expect(suggested.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/GOODTrip suggests/i).length).toBe(suggested.length);
  });

  it("offers a print action", () => {
    render(<ItineraryTicket trip={TRIP} />);
    expect(screen.getByRole("button", { name: /print/i })).toBeInTheDocument();
  });
});

describe("PrintableItinerary", () => {
  it("titles the sheet with the destination and trip", () => {
    render(<PrintableItinerary trip={TRIP} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(TRIP.destination);
  });

  it("prints every day with its number and every activity", () => {
    let { container } = render(<PrintableItinerary trip={TRIP} />);
    for (let day of TRIP.days) {
      let heading = screen.getByRole("heading", { level: 2, name: new RegExp(`Day ${day.n}\\b`) });
      expect(heading).toHaveTextContent(day.title);
    }
    for (let activity of ACTIVITIES) {
      expect(container.textContent).toContain(activity.title);
    }
  });

  it("says which items GOODTrip proposed", () => {
    let { container } = render(<PrintableItinerary trip={TRIP} />);
    let suggested = ACTIVITIES.filter((a) => a.suggested);
    let marks = container.textContent!.match(/suggested by GOODTrip/g) ?? [];
    expect(marks.length).toBe(suggested.length);
  });

  it("spells booking links out as bare urls, since paper has no hyperlinks", () => {
    let { container } = render(<PrintableItinerary trip={TRIP} />);
    let linked = ACTIVITIES.find((a) => a.url)!;
    let bare = linked
      .url!.replace(/^https:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "");
    expect(container.textContent).toContain(bare);
    expect(within(container).queryByRole("link")).not.toBeInTheDocument();
  });
});
