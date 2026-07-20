"use client";

/* Walking skeleton (#33, web-adapted): boot → anonymous sign-in → RLS-gated
   read of the seeded trip → minimal read-only render. Proves every layer of
   the stack; the real Phase 2 screens replace this page. */

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { getSupabase, getTripId } from "@/lib/supabase";
import { ensureTripSession, fetchTripItinerary, type TripItinerary } from "@/lib/goodtrip";

type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; itinerary: TripItinerary };

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function TripPage() {
  let [state, setState] = useState<PageState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let supabase = getSupabase();
        let tripId = getTripId();
        await ensureTripSession(supabase, tripId);
        let itinerary = await fetchTripItinerary(supabase, tripId);
        if (!cancelled) setState({ status: "ready", itinerary });
      } catch (error) {
        let message = error instanceof Error ? error.message : String(error);
        if (!cancelled) setState({ status: "error", message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-ink px-5 py-12 text-cream sm:px-8">
      <div className="mx-auto max-w-2xl">
        {state.status === "loading" && (
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-cream-muted">
            Loading the trip…
          </p>
        )}

        {state.status === "error" && (
          <div role="alert">
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-flag">
              Couldn’t load the trip
            </p>
            <p className="mt-3 text-sm text-cream-muted">{state.message}</p>
          </div>
        )}

        {state.status === "ready" && (
          <>
            <header className="border-b border-gold/20 pb-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-gold/70">
                GOODTrip
              </p>
              <h1 className="mt-3 font-display text-4xl leading-tight">
                {state.itinerary.trip.name}
              </h1>
              <p className="mt-2 text-sm text-cream-muted">
                {state.itinerary.trip.destination} · {formatDate(state.itinerary.trip.start_date)} –{" "}
                {formatDate(state.itinerary.trip.end_date)}
              </p>
            </header>

            <div className="mt-8 space-y-10">
              {state.itinerary.days.map(({ day, activities }) => (
                <section key={day.id}>
                  <h2 className="flex items-baseline gap-3 border-b border-gold/15 pb-2">
                    <span className="font-display text-2xl text-gold">
                      {String(day.day_number).padStart(2, "0")}
                    </span>
                    <span className="text-lg font-medium">{day.title}</span>
                    <span className="ml-auto font-mono text-[11px] uppercase tracking-wide text-cream-muted">
                      {formatDate(day.date)}
                    </span>
                  </h2>
                  <ul className="divide-y divide-cream/10">
                    {activities.map((activity) => (
                      <li key={activity.id} className="flex gap-4 py-3">
                        <span className="w-16 shrink-0 pt-0.5 font-mono text-[11px] uppercase leading-tight text-gold/70">
                          {activity.time_label}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-snug">
                            {activity.title}
                            {activity.confirmed && (
                              <Check
                                aria-label="Confirmed"
                                className="ml-2 inline h-3.5 w-3.5 text-gold"
                              />
                            )}
                          </p>
                          {activity.location && (
                            <p className="mt-1 text-xs text-cream-muted">{activity.location}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
