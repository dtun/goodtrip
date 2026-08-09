import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ItineraryTicket, PrintableItinerary } from "./itinerary";
import { AppMockup } from "./app-mockup";
import { WaitlistForm } from "./waitlist-form";
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

/* The other half of the same concern: not what the page reveals about a real
   trip, but what it promises a stranger about their own address. Nothing in
   this repo can send mail, so every claim the form makes has to be one a plain
   Supabase table can keep on its own. */

describe("the waitlist form promises only what it can deliver", () => {
  it("never offers an unsubscribe, because there is no list to leave", () => {
    let { container } = render(<WaitlistForm source="test" />);
    expect(container.textContent).not.toMatch(/unsubscribe|opt[\s-]?out/i);
  });

  it("says how much mail to expect", () => {
    render(<WaitlistForm source="test" />);
    expect(screen.getByText(/one email when goodtrip opens/i)).toBeInTheDocument();
  });

  it("names what is stored and where it stays", () => {
    render(<WaitlistForm source="test" />);
    let note = screen.getByText(/never sold, never shared/i);
    expect(note).toHaveTextContent(/your address/i);
    expect(note).toHaveTextContent(/which form/i);
  });

  it("keeps the privacy note up while the promise shows a validation error", async () => {
    render(<WaitlistForm source="test" />);
    await userEvent.type(screen.getByLabelText(/email address/i), "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: /join the waitlist/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/valid email address/i);
    expect(screen.getByText(/never sold, never shared/i)).toBeInTheDocument();
  });
});
