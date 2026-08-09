import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";
import { EXAMPLE_TRIPS } from "@/lib/example-trip";
import { assertRedacted } from "@/test/redaction";

// The landing page fetches a live forecast at build time; the page's job here
// is its markup, not Open-Meteo's availability.
vi.mock("@/lib/weather", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/weather")>()),
  fetchTripWeather: vi.fn(async () => ({})),
}));

async function renderHome() {
  return render(await Home());
}

describe("the landing page", () => {
  it("never links a visitor into the private trip app", async () => {
    let { container } = await renderHome();
    let internal = [...container.querySelectorAll("a[href]")]
      .map((a) => a.getAttribute("href")!)
      .filter((href) => href.startsWith("/trip"));
    expect(internal).toEqual([]);
  });

  it("sends the example call to action to the example on the page", async () => {
    await renderHome();
    let cta = screen.getByRole("link", { name: /example trip/i });
    expect(cta).toHaveAttribute("href", "#example");
  });

  it("carries no personal detail anywhere on the page", async () => {
    let { container } = await renderHome();
    assertRedacted("the landing page", container.textContent ?? "");
  });

  it("leads with the collaboration story, not a feature list", async () => {
    await renderHome();
    for (let promise of [/chat with your itinerary/i, /suggestions/i, /multiplayer/i]) {
      expect(screen.getByRole("heading", { name: promise })).toBeInTheDocument();
    }
  });

  it("offers every example trip in the picker", async () => {
    await renderHome();
    for (let trip of EXAMPLE_TRIPS) {
      expect(screen.getByRole("button", { name: trip.pill })).toBeInTheDocument();
    }
  });

  it("offers the waitlist as the primary action", async () => {
    await renderHome();
    expect(screen.getAllByRole("button", { name: /join the waitlist/i }).length).toBeGreaterThan(0);
  });

  it("never promises an unsubscribe it has no way to honor", async () => {
    let { container } = await renderHome();
    expect(container.textContent).not.toMatch(/unsubscribe/i);
  });

  // The hero and the closing CTA are separate entry points; a visitor can sign
  // up from either without ever scrolling past the other, so the note travels
  // with the form rather than sitting once on the page.
  it("puts the privacy note beside every sign-up form", async () => {
    await renderHome();
    let forms = screen.getAllByRole("button", { name: /join the waitlist/i });
    expect(screen.getAllByText(/never sold, never shared/i)).toHaveLength(forms.length);
  });
});
