"use client";

/* The GOODTrip web app shell: anonymous sign-in → claim-a-name (#34) →
   RLS-gated reads of the seeded trip → itinerary + live checklists (#35–38).
   Grown from the Phase 1 walking skeleton (#33). */

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { ChecklistItem, Profile } from "@goodtrip/shared";
import { getSupabase, getTripId } from "@/lib/supabase";
import { ensureTripSession, fetchTripItinerary, type TripItinerary } from "@/lib/goodtrip";
import {
  claimIdentity,
  familyRoster,
  fetchOwnProfile,
  fetchProfiles,
  hasClaimedName,
} from "@/lib/identity";
import {
  fetchTripChecklists,
  persistToggle,
  replaceItem,
  type GroupedChecklists,
} from "@/lib/checklists";
import { Avatar } from "@/components/trip/avatar";
import { ChecklistSection } from "@/components/trip/checklist-section";

type BootData = {
  itinerary: TripItinerary;
  profile: Profile;
  profiles: Profile[];
  checklists: GroupedChecklists;
};

type View = "itinerary" | "checklists";

type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "claim"; data: BootData; claiming: string | null }
  | { status: "ready"; data: BootData; view: View };

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
      let [itinerary, profile, profiles, checklists] = await Promise.all([
        fetchTripItinerary(supabase, tripId),
        fetchOwnProfile(supabase),
        fetchProfiles(supabase),
        fetchTripChecklists(supabase, tripId),
      ]);
      return { itinerary, profile, profiles, checklists };
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

/** Update the checklist item in whatever state currently holds BootData. */
function patchItem(prev: PageState, item: ChecklistItem): PageState {
  if (prev.status !== "ready" && prev.status !== "claim") return prev;
  return {
    ...prev,
    data: { ...prev.data, checklists: replaceItem(prev.data.checklists, item) },
  };
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
    let channel: ReturnType<ReturnType<typeof getSupabase>["channel"]> | null = null;

    (async () => {
      try {
        let data = await bootOnce();
        if (cancelled) return;
        setState(
          hasClaimedName(data.profile)
            ? { status: "ready", data, view: "itinerary" }
            : { status: "claim", data, claiming: null },
        );

        // Realtime (#38): remote checklist toggles land without a refresh.
        let supabase = getSupabase();
        channel = supabase
          .channel(`checklist-items-${getTripId()}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "checklist_items",
              filter: `trip_id=eq.${getTripId()}`,
            },
            (payload) => {
              setState((prev) => patchItem(prev, payload.new as ChecklistItem));
            },
          )
          .subscribe();
      } catch (error) {
        console.error("GOODTrip /trip failed:", error);
        if (!cancelled) setState({ status: "error", message: errorMessage(error) });
      }
    })();

    return () => {
      cancelled = true;
      if (channel) getSupabase().removeChannel(channel);
    };
  }, []);

  async function handleClaim(member: Profile) {
    if (state.status !== "claim") return;
    setState({ ...state, claiming: member.id });
    try {
      let profile = await claimIdentity(getSupabase(), member);
      setState({ status: "ready", data: { ...state.data, profile }, view: "itinerary" });
    } catch (error) {
      console.error("GOODTrip claim failed:", error);
      setState({ status: "error", message: errorMessage(error) });
    }
  }

  async function handleToggle(item: ChecklistItem) {
    if (state.status !== "ready") return;
    let me = state.data.profile;
    let optimistic: ChecklistItem = item.done
      ? { ...item, done: false, done_by: null, done_at: null }
      : { ...item, done: true, done_by: me.id, done_at: new Date().toISOString() };

    setState((prev) => patchItem(prev, optimistic));
    try {
      let saved = await persistToggle(getSupabase(), item, me.id);
      setState((prev) => patchItem(prev, saved));
    } catch (error) {
      console.error("GOODTrip toggle failed:", error);
      setState((prev) => patchItem(prev, item)); // roll back
    }
  }

  let profilesById =
    state.status === "ready" || state.status === "claim"
      ? new Map(state.data.profiles.map((p) => [p.id, p]))
      : new Map<string, Profile>();

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
            roster={familyRoster(state.data.profiles)}
            claiming={state.claiming}
            onClaim={handleClaim}
            onGuest={() => setState({ status: "ready", data: state.data, view: "itinerary" })}
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

              <nav className="mt-6 flex gap-2" aria-label="Trip views">
                {(["itinerary", "checklists"] as const).map((view) => (
                  <button
                    key={view}
                    type="button"
                    aria-current={state.view === view}
                    onClick={() => setState({ ...state, view })}
                    className={`rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
                      state.view === view
                        ? "bg-gold text-ink"
                        : "border border-cream/15 text-cream-muted hover:border-gold/50"
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </nav>
            </header>

            {state.view === "checklists" && (
              <div className="mt-8 space-y-5">
                {state.data.checklists.global.map((entry) => (
                  <ChecklistSection
                    key={entry.checklist.id}
                    entry={entry}
                    profilesById={profilesById}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            )}

            {state.view === "itinerary" && (
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

                    {(state.data.checklists.byDay.get(day.id) ?? []).length > 0 && (
                      <div className="mt-3 space-y-2">
                        {state.data.checklists.byDay.get(day.id)!.map((entry) => (
                          <ChecklistSection
                            key={entry.checklist.id}
                            entry={entry}
                            profilesById={profilesById}
                            onToggle={handleToggle}
                            heading="summary"
                          />
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
