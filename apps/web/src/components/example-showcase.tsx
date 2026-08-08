"use client";

import { createContext, useContext, useState } from "react";
import { EXAMPLE_TRIPS, FEATURED_EXAMPLE_TRIP, type ExampleTrip } from "@/lib/example-trip";
import { ItineraryTicket, PrintableItinerary } from "@/components/itinerary";
import type { WeatherByDate } from "@/lib/weather";

/** Forecasts for every example trip, keyed by trip id. */
export type WeatherByTrip = Record<string, WeatherByDate>;

/* The picker and the print sheet sit on opposite sides of the page's
   print:hidden boundary — the sheet has to be a sibling of the whole visible
   page or printing hides it — so the selection can't just be local state in
   the picker. It lives in a context both ends read, which is what makes Print
   give you the itinerary you are actually looking at. */
const SelectedTrip = createContext<{
  trip: ExampleTrip;
  select: (trip: ExampleTrip) => void;
} | null>(null);

function useSelectedTrip() {
  let selected = useContext(SelectedTrip);
  if (!selected) throw new Error("Example trip components must sit inside ExampleTripProvider");
  return selected;
}

export function ExampleTripProvider({ children }: { children: React.ReactNode }) {
  let [trip, select] = useState<ExampleTrip>(FEATURED_EXAMPLE_TRIP);
  return <SelectedTrip.Provider value={{ trip, select }}>{children}</SelectedTrip.Provider>;
}

/**
 * The trip-kind pills and the itinerary they switch between. Plain toggle
 * buttons rather than an ARIA tablist: a tablist promises arrow-key
 * navigation, and pills that only respond to Tab and Enter should not claim
 * to be one.
 */
export function ExamplePicker({ weather = {} }: { weather?: WeatherByTrip }) {
  let { trip, select } = useSelectedTrip();

  return (
    <>
      <div className="mx-auto mt-9 flex max-w-3xl flex-wrap justify-center gap-2">
        {EXAMPLE_TRIPS.map((candidate) => {
          let active = candidate.id === trip.id;
          return (
            <button
              key={candidate.id}
              type="button"
              aria-pressed={active}
              onClick={() => select(candidate)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-coral/40 bg-coral-soft text-coral-700"
                  : "border-sand-300 bg-sand-100 text-espresso-muted hover:border-coral/40 hover:text-espresso"
              }`}
            >
              {candidate.pill}
            </button>
          );
        })}
      </div>

      <div className="mt-12">
        <ItineraryTicket trip={trip} weather={weather[trip.id]} />
      </div>
    </>
  );
}

/** The print sheet, following whichever trip the picker has selected. */
export function SelectedPrintableItinerary({ weather = {} }: { weather?: WeatherByTrip }) {
  let { trip } = useSelectedTrip();
  return <PrintableItinerary trip={trip} weather={weather[trip.id]} />;
}
