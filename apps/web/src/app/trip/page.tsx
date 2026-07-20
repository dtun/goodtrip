"use client";

/* The GOODTrip web app shell: welcome (returning email or fresh anonymous
   sign-in, spec §4) → claim-a-name (#34) → RLS-gated reads of the seeded
   trip → itinerary + live checklists (#35–38). Grown from the Phase 1
   walking skeleton (#33). */

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Check, MapPin, Plane, Sparkles, SquareCheckBig } from "lucide-react";
import type { ChecklistItem, Profile } from "@goodtrip/shared";
import { getSupabase, getTripId, type GoodtripClient } from "@/lib/supabase";
import { ensureTripSession, fetchTripItinerary, type TripItinerary } from "@/lib/goodtrip";
import {
  claimIdentity,
  familyRoster,
  fetchLinkedEmail,
  fetchOwnProfile,
  fetchProfiles,
  hasClaimedName,
  linkEmail,
  sendSignInLink,
  type LinkedEmail,
} from "@/lib/identity";
import {
  fetchTripChecklists,
  persistToggle,
  replaceItem,
  type GroupedChecklists,
} from "@/lib/checklists";
import { errorMessage } from "@/lib/utils";
import { Avatar } from "@/components/trip/avatar";
import { SaveSpotBanner, WelcomeScreen } from "@/components/trip/account";
import { ChecklistSection } from "@/components/trip/checklist-section";
import { AskPanel } from "@/components/trip/ask-panel";
import { CompassRose } from "@/components/compass-rose";

/* Tab metadata: icon + label per view, so the nav reads as a proper
   segmented control instead of three bare text pills. */
const VIEW_META: Record<View, { label: string; icon: typeof Check }> = {
  itinerary: { label: "Itinerary", icon: CalendarDays },
  checklists: { label: "Checklists", icon: SquareCheckBig },
  ask: { label: "Ask", icon: Sparkles },
};

type BootData = {
  itinerary: TripItinerary;
  profile: Profile;
  profiles: Profile[];
  checklists: GroupedChecklists;
  linkedEmail: LinkedEmail;
};

type View = "itinerary" | "checklists" | "ask";

type PageState =
  | { status: "loading" }
  | { status: "welcome" }
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
      let [itinerary, profile, profiles, checklists, linkedEmail] = await Promise.all([
        fetchTripItinerary(supabase, tripId),
        fetchOwnProfile(supabase),
        fetchProfiles(supabase),
        fetchTripChecklists(supabase, tripId),
        fetchLinkedEmail(supabase),
      ]);
      return { itinerary, profile, profiles, checklists, linkedEmail };
    } catch (error) {
      boot = null; // let a reload retry
      throw error;
    }
  })();
  return boot;
}

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/* A live status line for the header eyebrow — turns two dates into something
   that feels alive: a countdown before the trip, a day-counter during it. */
function tripCountdown(startIso: string, endIso: string): string {
  let dayMs = 86_400_000;
  let midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  let now = midnight(new Date());
  let start = midnight(new Date(`${startIso}T00:00:00`));
  let end = midnight(new Date(`${endIso}T00:00:00`));

  if (now < start) {
    let days = Math.round((start - now) / dayMs);
    if (days === 1) return "Starts tomorrow";
    return `Starts in ${days} days`;
  }
  if (now <= end) {
    let total = Math.round((end - start) / dayMs) + 1;
    let current = Math.round((now - start) / dayMs) + 1;
    return `Day ${current} of ${total}`;
  }
  return "Trip complete";
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
  let channelRef = useRef<ReturnType<GoodtripClient["channel"]> | null>(null);

  /** Boot into the trip (signing in anonymously if needed) and go live. */
  async function enterTrip(isCancelled: () => boolean = () => false) {
    let data = await bootOnce();
    if (isCancelled()) return;
    setState(
      hasClaimedName(data.profile)
        ? { status: "ready", data, view: "itinerary" }
        : { status: "claim", data, claiming: null },
    );

    // Realtime (#38): remote checklist toggles land without a refresh.
    if (!channelRef.current) {
      channelRef.current = getSupabase()
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
    }
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Peek before booting: a fresh browser gets the welcome screen instead
        // of a silently minted anonymous profile it may immediately abandon.
        let {
          data: { session },
        } = await getSupabase().auth.getSession();
        if (cancelled) return;
        if (!session) {
          setState({ status: "welcome" });
          return;
        }
        await enterTrip(() => cancelled);
      } catch (error) {
        console.error("GOODTrip /trip failed:", error);
        if (!cancelled) setState({ status: "error", message: errorMessage(error) });
      }
    })();

    return () => {
      cancelled = true;
      if (channelRef.current) {
        getSupabase().removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Where magic links land — must be in the Supabase redirect allow-list. */
  function tripRedirectUrl(): string {
    return `${window.location.origin}/trip`;
  }

  async function handleContinueAsNew() {
    setState({ status: "loading" });
    try {
      await enterTrip();
    } catch (error) {
      console.error("GOODTrip anonymous entry failed:", error);
      setState({ status: "error", message: errorMessage(error) });
    }
  }

  async function handleLinkEmail(email: string) {
    let linked = await linkEmail(getSupabase(), email, tripRedirectUrl());
    setState((prev) =>
      prev.status === "ready" ? { ...prev, data: { ...prev.data, linkedEmail: linked } } : prev,
    );
  }

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

  /** Re-read itinerary + checklists after an AI op writes (#41). */
  async function refreshTripData() {
    let supabase = getSupabase();
    let tripId = getTripId();
    let [itinerary, checklists] = await Promise.all([
      fetchTripItinerary(supabase, tripId),
      fetchTripChecklists(supabase, tripId),
    ]);
    setState((prev) =>
      prev.status === "ready" ? { ...prev, data: { ...prev.data, itinerary, checklists } } : prev,
    );
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
    <main className="min-h-screen bg-ink px-5 pb-16 pt-6 text-cream sm:px-8 sm:py-12">
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

        {state.status === "welcome" && (
          <WelcomeScreen
            onSendLink={(email) => sendSignInLink(getSupabase(), email, tripRedirectUrl())}
            onContinueAsNew={handleContinueAsNew}
          />
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
            <header className="relative -mx-5 -mt-6 overflow-hidden border-b border-gold/20 px-5 pb-5 pt-8 sm:mx-0 sm:mt-0 sm:px-0 sm:pb-4 sm:pt-0">
              {/* Poster atmosphere: a gold horizon glow bleeding from the top,
                  strong on mobile where the header is the hero, faint on desktop. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-24 h-56 sm:h-40 sm:opacity-60"
                style={{
                  backgroundImage:
                    "radial-gradient(120% 90% at 50% 0%, rgba(201,168,76,0.20), transparent 62%)",
                }}
              />
              <CompassRose className="pointer-events-none absolute -right-14 -top-10 h-44 w-44 text-gold opacity-[0.07] sm:h-32 sm:w-32 sm:opacity-[0.05]" />

              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-gold-bright">
                    <Plane className="h-3 w-3" aria-hidden />
                    {tripCountdown(
                      state.data.itinerary.trip.start_date,
                      state.data.itinerary.trip.end_date,
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setState({ status: "claim", data: state.data, claiming: null })}
                    title="Switch who you are"
                    className="flex shrink-0 items-center gap-2 rounded-full p-1 ring-1 ring-cream/15 transition-colors hover:ring-gold/50 sm:pr-3"
                  >
                    <Avatar profile={state.data.profile} size="h-8 w-8" />
                    <span className="hidden font-mono text-[11px] uppercase tracking-wide text-cream-muted sm:inline">
                      {state.data.profile.display_name}
                    </span>
                  </button>
                </div>

                <h1 className="mt-4 text-balance font-display text-3xl leading-[1.05] text-shadow-gold sm:mt-3 sm:text-2xl">
                  {state.data.itinerary.trip.name}
                </h1>

                <p className="mt-2.5 flex items-center gap-1.5 text-sm text-cream-muted sm:mt-1.5 sm:text-xs">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-gold/70" aria-hidden />
                  <span className="truncate">{state.data.itinerary.trip.destination}</span>
                  <span className="text-gold/40">·</span>
                  <span className="whitespace-nowrap">
                    {formatDate(state.data.itinerary.trip.start_date)} –{" "}
                    {formatDate(state.data.itinerary.trip.end_date)}
                  </span>
                </p>

                <nav
                  aria-label="Trip views"
                  className="mt-5 grid grid-cols-3 gap-1 rounded-2xl border border-cream/10 bg-ink-800/70 p-1 sm:mt-4 sm:inline-grid sm:gap-1.5"
                >
                  {(["itinerary", "checklists", "ask"] as const).map((view) => {
                    let active = state.view === view;
                    let Icon = VIEW_META[view].icon;
                    return (
                      <button
                        key={view}
                        type="button"
                        aria-current={active}
                        onClick={() => setState({ ...state, view })}
                        className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors sm:px-4 sm:py-1.5 ${
                          active
                            ? "bg-gold text-ink shadow-[0_1px_8px_rgba(201,168,76,0.35)]"
                            : "text-cream-muted hover:text-cream"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {VIEW_META[view].label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </header>

            <SaveSpotBanner
              linked={state.data.linkedEmail}
              onLink={handleLinkEmail}
              onSendSignInLink={(email) => sendSignInLink(getSupabase(), email, tripRedirectUrl())}
            />

            {state.view === "ask" && (
              <AskPanel
                tripId={getTripId()}
                profile={state.data.profile}
                itinerary={state.data.itinerary}
                checklists={state.data.checklists}
                onApplied={refreshTripData}
              />
            )}

            {state.view === "checklists" && (
              <div className="mt-6 space-y-5">
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
              <div className="mt-6 space-y-10">
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
