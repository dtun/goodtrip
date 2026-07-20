"use client";

/* The GOODTrip web app shell: anonymous sign-in → claim-a-name (#34) →
   RLS-gated read of the seeded trip → read-only itinerary. Grown from the
   Phase 1 walking skeleton (#33); Phase 2 screens replace pieces of this. */

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { Profile } from "@goodtrip/shared";
import { getSupabase, getTripId } from "@/lib/supabase";
import { ensureTripSession, fetchTripItinerary, type TripItinerary } from "@/lib/goodtrip";
import { claimIdentity, fetchOwnProfile, fetchRoster, hasClaimedName } from "@/lib/identity";

type BootData = {
  itinerary: TripItinerary;
  profile: Profile;
  roster: Profile[];
};

type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "claim"; data: BootData; claiming: string | null }
  | { status: "ready"; data: BootData };

/* Single-flight boot: React StrictMode double-invokes effects in dev, and two
   concurrent anonymous sign-ins race each other into RLS failures. Both
   invocations must share one flow. */
let boot: Promise<BootData> | null = null;

function bootOnce(): Promise<BootData> {
  boot ??= (async () => {
    try {
      let supabase = getSupabase();
      let tripId = getTripId();
      await ensureTripSession(supabase, tripId);
      let [itinerary, profile, roster] = await Promise.all([
        fetchTripItinerary(supabase, tripId),
        fetchOwnProfile(supabase),
        fetchRoster(supabase),
      ]);
      return { itinerary, profile, roster };
    } catch (error) {
      boot = null; // let a reload retry
      throw error;
    }
  })();
  return boot;
}

/* Supabase errors (PostgrestError, AuthError) are often plain objects, so a
   bare String() renders "[object Object]". */
function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    let { message, code, details } = error as {
      message?: string;
      code?: string;
      details?: string;
    };
    let parts = [message, code && `(${code})`, details].filter(Boolean);
    if (parts.length) return parts.join(" ");
    return JSON.stringify(error);
  }
  return String(error);
}

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function Avatar({ profile, size = "h-8 w-8" }: { profile: Profile; size?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex ${size} shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold text-cream`}
      style={{ backgroundColor: profile.avatar_color }}
    >
      {profile.display_name.charAt(0).toUpperCase()}
    </span>
  );
}

function ClaimScreen({
  roster,
  claiming,
  onClaim,
  onGuest,
}: {
  roster: Profile[];
  claiming: string | null;
  onClaim: (member: Profile) => void;
  onGuest: () => void;
}) {
  return (
    <div className="mx-auto max-w-md pt-6 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-gold/70">GOODTrip</p>
      <h1 className="mt-3 font-display text-4xl leading-tight">Who are you?</h1>
      <p className="mt-3 text-sm text-cream-muted">
        Claim your name so the family knows who checked what.
      </p>

      <ul className="mt-8 grid grid-cols-2 gap-3">
        {roster.map((member) => (
          <li key={member.id}>
            <button
              type="button"
              disabled={claiming !== null}
              onClick={() => onClaim(member)}
              className="flex w-full items-center gap-3 rounded-xl border border-cream/15 bg-ink-800/60 px-4 py-3 text-left transition-colors hover:border-gold/50 disabled:opacity-50"
            >
              <Avatar profile={member} />
              <span className="text-sm font-medium">
                {claiming === member.id ? "Claiming…" : member.display_name}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={claiming !== null}
        onClick={onGuest}
        className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-cream-muted underline decoration-cream/30 underline-offset-4 transition-colors hover:text-cream disabled:opacity-50"
      >
        Continue as guest
      </button>
    </div>
  );
}

export default function TripPage() {
  let [state, setState] = useState<PageState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let data = await bootOnce();
        if (cancelled) return;
        setState(
          hasClaimedName(data.profile)
            ? { status: "ready", data }
            : { status: "claim", data, claiming: null },
        );
      } catch (error) {
        console.error("GOODTrip /trip failed:", error);
        if (!cancelled) setState({ status: "error", message: errorMessage(error) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleClaim(member: Profile) {
    if (state.status !== "claim") return;
    setState({ ...state, claiming: member.id });
    try {
      let profile = await claimIdentity(getSupabase(), member);
      setState({ status: "ready", data: { ...state.data, profile } });
    } catch (error) {
      console.error("GOODTrip claim failed:", error);
      setState({ status: "error", message: errorMessage(error) });
    }
  }

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

        {state.status === "claim" && (
          <ClaimScreen
            roster={state.data.roster}
            claiming={state.claiming}
            onClaim={handleClaim}
            onGuest={() => setState({ status: "ready", data: state.data })}
          />
        )}

        {state.status === "ready" && (
          <>
            <header className="border-b border-gold/20 pb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-gold/70">
                    GOODTrip
                  </p>
                  <h1 className="mt-3 font-display text-4xl leading-tight">
                    {state.data.itinerary.trip.name}
                  </h1>
                  <p className="mt-2 text-sm text-cream-muted">
                    {state.data.itinerary.trip.destination} ·{" "}
                    {formatDate(state.data.itinerary.trip.start_date)} –{" "}
                    {formatDate(state.data.itinerary.trip.end_date)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setState({ status: "claim", data: state.data, claiming: null })}
                  title="Switch who you are"
                  className="flex shrink-0 items-center gap-2 rounded-full border border-cream/15 py-1 pl-1 pr-3 transition-colors hover:border-gold/50"
                >
                  <Avatar profile={state.data.profile} size="h-7 w-7" />
                  <span className="font-mono text-[11px] uppercase tracking-wide text-cream-muted">
                    {state.data.profile.display_name}
                  </span>
                </button>
              </div>
            </header>

            <div className="mt-8 space-y-10">
              {state.data.itinerary.days.map(({ day, activities }) => (
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
