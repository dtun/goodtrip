import { describe, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ItineraryTicket, PrintableItinerary } from "./itinerary";
import { AppMockup } from "./app-mockup";
import { EXAMPLE_TRIPS, FEATURED_EXAMPLE_TRIP as TRIP } from "@/lib/example-trip";
import { assertRedacted } from "@/test/redaction";

/* The data guard in lib/example-trip.privacy.test.ts only sees the data
   module. These run the same rules over what the marketing components put on
   the page, which is where a hardcoded roster or a print-sheet header can
   reintroduce a real detail the data no longer holds. */

describe("the public marketing surfaces carry no personal detail", () => {
  // Every trip the picker can reach, not just the featured one.
  it.each(EXAMPLE_TRIPS.map((t) => [t.id, t] as const))(
    "keeps the %s itinerary ticket clean",
    (id, trip) => {
      let { container } = render(<ItineraryTicket trip={trip} />);
      assertRedacted(`the ${id} itinerary ticket`, container.textContent ?? "");
    },
  );

  it.each(EXAMPLE_TRIPS.map((t) => [t.id, t] as const))(
    "keeps the %s print sheet clean",
    (id, trip) => {
      let { container } = render(<PrintableItinerary trip={trip} />);
      assertRedacted(`the ${id} print sheet`, container.textContent ?? "");
    },
  );

  it("keeps every screen of the app mockup clean", async () => {
    let { container } = render(<AppMockup />);

    // Locations only surface once a day is open, and the roster only on the
    // Trip tab — a guard that reads the landing screen alone proves nothing.
    for (let day of TRIP.days) {
      await userEvent.click(screen.getByText(day.title));
      assertRedacted(`app mockup, day ${day.n}`, container.textContent ?? "");
      await userEvent.click(screen.getByRole("button", { name: /back to itinerary/i }));
    }

    for (let tab of [/checklists/i, /^ask$/i, /^trip$/i]) {
      await userEvent.click(screen.getByRole("button", { name: tab }));
      assertRedacted(`app mockup, ${tab.source} tab`, container.textContent ?? "");
    }
  });
});
