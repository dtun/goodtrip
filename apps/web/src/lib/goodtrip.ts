import type { Trip } from "@goodtrip/shared";
import type { GoodtripClient } from "@/lib/supabase";
import { groupActivitiesByDay, type DayWithActivities } from "@/lib/itinerary";
import { UNCLAIMED_NAME } from "@/lib/identity";

// The family palette from the seed; new guests get a random one.
let AVATAR_COLORS = [
  "#3C3B6E",
  "#B22234",
  "#2D6A4F",
  "#C9A84C",
  "#4C5BC9",
  "#B7791F",
  "#6E3C5A",
  "#3C6E5A",
];

/**
 * Zero-friction entry (spec section 4, adapted for web): sign in anonymously
 * when there is no session, create the profile on first sign-in, and
 * self-join the hardcoded beta trip so RLS-gated reads succeed.
 */
export async function ensureTripSession(supabase: GoodtripClient, tripId: string): Promise<void> {
  let {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    let { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    session = data.session;
  }
  if (!session) throw new Error("Anonymous sign-in returned no session");

  // The realtime socket doesn't reliably pick up the JWT on its own, and our
  // policies are scoped `to authenticated` — without this, subscriptions
  // connect fine but RLS silently filters out every event.
  await supabase.realtime.setAuth(session.access_token);

  let userId = session.user.id;
  let color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  let { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      { id: userId, display_name: UNCLAIMED_NAME, avatar_color: color },
      { onConflict: "id", ignoreDuplicates: true },
    );
  if (profileError) throw profileError;

  let { error: memberError } = await supabase
    .from("trip_members")
    .upsert(
      { trip_id: tripId, user_id: userId },
      { onConflict: "trip_id,user_id", ignoreDuplicates: true },
    );
  if (memberError) throw memberError;
}

export type TripItinerary = {
  trip: Trip;
  days: DayWithActivities[];
};

/** RLS-gated read of the trip with its days and activities. */
export async function fetchTripItinerary(
  supabase: GoodtripClient,
  tripId: string,
): Promise<TripItinerary> {
  let [tripResult, daysResult, activitiesResult] = await Promise.all([
    supabase.from("trips").select("*").eq("id", tripId).single(),
    supabase.from("days").select("*").eq("trip_id", tripId).order("day_number"),
    supabase.from("activities").select("*").eq("trip_id", tripId).order("position"),
  ]);

  if (tripResult.error) throw tripResult.error;
  if (daysResult.error) throw daysResult.error;
  if (activitiesResult.error) throw activitiesResult.error;

  return {
    trip: tripResult.data,
    days: groupActivitiesByDay(daysResult.data, activitiesResult.data),
  };
}
