import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExamplePicker, ExampleTripProvider, SelectedPrintableItinerary } from "./example-showcase";
import { EXAMPLE_TRIPS, FEATURED_EXAMPLE_TRIP } from "@/lib/example-trip";

/* The picker is the one interactive thing in the example section. These cover
   what a visitor does with it — read the default, switch trips, print what
   they are looking at. */

let OTHER = EXAMPLE_TRIPS.find((t) => t.id !== FEATURED_EXAMPLE_TRIP.id)!;

function renderShowcase() {
  return render(
    <ExampleTripProvider>
      <ExamplePicker />
      <SelectedPrintableItinerary />
    </ExampleTripProvider>,
  );
}

describe("ExamplePicker", () => {
  it("offers every example trip as a pill", () => {
    renderShowcase();
    for (let trip of EXAMPLE_TRIPS) {
      expect(screen.getByRole("button", { name: trip.pill })).toBeInTheDocument();
    }
  });

  it("opens on the featured trip", () => {
    renderShowcase();
    expect(screen.getByRole("button", { name: FEATURED_EXAMPLE_TRIP.pill })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("heading", { name: FEATURED_EXAMPLE_TRIP.destination, level: 2 }),
    ).toBeInTheDocument();
  });

  it("swaps the whole itinerary when another trip is picked", async () => {
    renderShowcase();
    await userEvent.click(screen.getByRole("button", { name: OTHER.pill }));

    expect(screen.getByRole("heading", { name: OTHER.destination, level: 2 })).toBeInTheDocument();
    for (let day of OTHER.days) {
      expect(screen.getByRole("heading", { name: day.title, level: 3 })).toBeInTheDocument();
    }
    expect(
      screen.queryByRole("heading", { name: FEATURED_EXAMPLE_TRIP.destination, level: 2 }),
    ).not.toBeInTheDocument();
  });

  it("moves the pressed state with the selection", async () => {
    renderShowcase();
    await userEvent.click(screen.getByRole("button", { name: OTHER.pill }));

    expect(screen.getByRole("button", { name: OTHER.pill })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: FEATURED_EXAMPLE_TRIP.pill })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("hands each trip its own forecast", async () => {
    render(
      <ExampleTripProvider>
        <ExamplePicker
          weather={{
            [OTHER.id]: {
              [OTHER.days[0].iso]: { sky: "rain", summary: "Showers", hi: 61, lo: 48 },
            },
          }}
        />
      </ExampleTripProvider>,
    );

    // The featured trip has no entry in that map, so it shows no weather.
    expect(screen.queryByTitle(/°/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: OTHER.pill }));
    expect(screen.getByTitle("61° / 48° · Showers")).toBeInTheDocument();
  });
});

describe("SelectedPrintableItinerary", () => {
  it("prints the trip on screen, not the one the page opened with", async () => {
    let { container } = renderShowcase();
    await userEvent.click(screen.getByRole("button", { name: OTHER.pill }));

    let sheet = container.querySelector(".print\\:block")!;
    expect(sheet).toHaveTextContent(OTHER.destination);
    expect(sheet).toHaveTextContent(OTHER.name);
    for (let day of OTHER.days) {
      expect(sheet.textContent).toContain(day.title);
    }
    expect(sheet.textContent).not.toContain(FEATURED_EXAMPLE_TRIP.name);
  });
});
