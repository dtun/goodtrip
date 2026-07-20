import type { AIAction, AIChatResponse, ChatTurn, Profile, UUID } from "@goodtrip/shared";
import type { GoodtripClient } from "@/lib/supabase";
import type { TripItinerary } from "@/lib/goodtrip";
import type { GroupedChecklists } from "@/lib/checklists";

/** Ask the ai-chat edge function; the caller's JWT rides along automatically. */
export async function sendChat(
  supabase: GoodtripClient,
  tripId: UUID,
  messages: ChatTurn[],
): Promise<AIChatResponse> {
  let { data, error } = await supabase.functions.invoke("ai-chat", {
    body: { tripId, messages },
  });
  if (error) {
    let detail = "";
    try {
      let body = await (error as { context?: Response }).context?.json();
      detail = body?.error ?? "";
    } catch {
      // response body wasn't JSON; fall through to the generic message
    }
    throw new Error(detail || error.message || "ai-chat failed");
  }
  return data as AIChatResponse;
}

function findActivity(itinerary: TripItinerary, id: UUID) {
  for (let { day, activities } of itinerary.days) {
    let activity = activities.find((a) => a.id === id);
    if (activity) return { day, activity };
  }
  return null;
}

function findItem(checklists: GroupedChecklists, id: UUID) {
  let all = [...checklists.global];
  checklists.byDay.forEach((lists) => all.push(...lists));
  for (let entry of all) {
    let item = entry.items.find((i) => i.id === id);
    if (item) return { checklist: entry.checklist, item };
  }
  return null;
}

/** One human-readable line for a confirmation card. */
export function describeAction(
  action: AIAction,
  itinerary: TripItinerary,
  checklists: GroupedChecklists,
): string {
  if (action.type === "add_activity") {
    let when = action.time_label ? ` · ${action.time_label}` : "";
    return `Add “${action.title}” to Day ${action.day_number}${when}`;
  }
  if (action.type === "update_activity") {
    let found = findActivity(itinerary, action.activity_id);
    let name = found ? found.activity.title : "an activity";
    let fields = Object.keys(action.changes).join(", ");
    return `Update “${name}” (${fields})`;
  }
  let found = findItem(checklists, action.item_id);
  let label = found ? found.item.label : "a checklist item";
  return action.done ? `Check off “${label}”` : `Uncheck “${label}”`;
}

/**
 * Execute a confirmed action through RLS as the signed-in member and record
 * it on the activity feed (#41).
 */
export async function applyAction(
  supabase: GoodtripClient,
  tripId: UUID,
  me: Profile,
  action: AIAction,
  itinerary: TripItinerary,
): Promise<void> {
  let feed = async (verb: string, target: string) => {
    let { error } = await supabase
      .from("activity_feed")
      .insert({ trip_id: tripId, actor_id: me.id, verb, target });
    if (error) throw error;
  };

  if (action.type === "add_activity") {
    let dayEntry = itinerary.days.find((d) => d.day.day_number === action.day_number);
    if (!dayEntry) throw new Error(`Day ${action.day_number} is not on this trip`);
    let position = dayEntry.activities.length
      ? Math.max(...dayEntry.activities.map((a) => a.position)) + 1
      : 0;
    let { error } = await supabase.from("activities").insert({
      trip_id: tripId,
      day_id: dayEntry.day.id,
      position,
      title: action.title,
      time_label: action.time_label ?? null,
      location: action.location ?? null,
      cost: action.cost ?? null,
      created_by: me.id,
    });
    if (error) throw error;
    await feed("added", `${action.title} to Day ${action.day_number}`);
    return;
  }

  if (action.type === "update_activity") {
    let { data, error } = await supabase
      .from("activities")
      .update(action.changes)
      .eq("id", action.activity_id)
      .select()
      .single();
    if (error) throw error;
    await feed("updated", data?.title ?? "an activity");
    return;
  }

  let next = action.done
    ? { done: true, done_by: me.id, done_at: new Date().toISOString() }
    : { done: false, done_by: null, done_at: null };
  let { data, error } = await supabase
    .from("checklist_items")
    .update(next)
    .eq("id", action.item_id)
    .select()
    .single();
  if (error) throw error;
  await feed(action.done ? "checked off" : "unchecked", data?.label ?? "an item");
}
