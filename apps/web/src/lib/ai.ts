import type {
  Activity,
  AIAction,
  AIChatResponse,
  ChatTurn,
  ChecklistItem,
  ISODate,
  Profile,
  ReviseDayAction,
  UpdateActivityAction,
  UUID,
} from "@goodtrip/shared";
import type { GoodtripClient } from "@/lib/supabase";
import type { TripItinerary } from "@/lib/goodtrip";
import { nextItemPosition, type GroupedChecklists } from "@/lib/checklists";
import { localTimeZone, localToday } from "@/lib/utils";

/**
 * The reverse of a confirmed action, captured at apply-time so the card can
 * offer an Undo. add_activity/add_item record the new row to delete;
 * update_activity/edit_item snapshot the pre-edit values; check_item flips
 * `done` back; remove_item keeps the whole deleted row so Undo can re-create it.
 */
export type AppliedChange =
  | { kind: "added_activity"; activityId: UUID; title: string; dayNumber: number }
  | {
      kind: "updated_activity";
      activityId: UUID;
      title: string;
      previous: UpdateActivityAction["changes"];
    }
  | { kind: "checked_item"; itemId: UUID; label: string; done: boolean }
  | { kind: "added_item"; itemId: UUID; label: string; checklistTitle: string }
  | { kind: "edited_item"; itemId: UUID; label: string; previousLabel: string }
  | { kind: "removed_item"; item: ChecklistItem }
  | {
      kind: "revised_day";
      dayId: UUID;
      dayNumber: number;
      label: string;
      /** Pre-revision day fields that changed, so Undo can restore them. */
      previousDay: { title?: string; date?: ISODate };
      /** One reversal record per op, captured at apply-time. */
      steps: RevisedDayStep[];
    };

/**
 * The reverse of one op inside a confirmed day revision: an add records the new
 * row to delete, an update snapshots the pre-edit fields, and a remove keeps the
 * whole deleted activity so Undo can re-create it intact.
 */
export type RevisedDayStep =
  | { op: "added"; activityId: UUID }
  | { op: "updated"; activityId: UUID; previous: UpdateActivityAction["changes"] }
  | { op: "removed"; activity: Activity };

/** Ask the ai-chat edge function; the caller's JWT rides along automatically. */
export async function sendChat(
  supabase: GoodtripClient,
  tripId: UUID,
  messages: ChatTurn[],
): Promise<AIChatResponse> {
  // Send the caller's local date + timezone so the assistant reasons about
  // "today" from the user's perspective, not the server's UTC clock.
  let { data, error } = await supabase.functions.invoke("ai-chat", {
    body: { tripId, messages, today: localToday(), timeZone: localTimeZone() },
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

function findChecklist(checklists: GroupedChecklists, id: UUID) {
  let all = [...checklists.global];
  checklists.byDay.forEach((lists) => all.push(...lists));
  return all.find((entry) => entry.checklist.id === id) ?? null;
}

/** A resolved, human-readable view of one op inside a day revision. */
export type DayRevisionOpView =
  | { kind: "add"; title: string; meta: string | null }
  | { kind: "update"; name: string; changes: string[] }
  | { kind: "remove"; name: string; meta: string | null };

/**
 * A whole-day revision resolved against the current itinerary: the day's
 * before/after title and date plus every activity change spelled out, ready for
 * the confirmation card to render without re-deriving anything.
 */
export type DayRevisionView = {
  dayNumber: number;
  summary: string | null;
  titleChange: { from: string; to: string } | null;
  dateChange: { from: string; to: string } | null;
  ops: DayRevisionOpView[];
};

/** Spell out an activity update field by field, as "from → to" where useful. */
function describeChanges(changes: UpdateActivityAction["changes"], previous?: Activity): string[] {
  let out: string[] = [];
  for (let key of Object.keys(changes) as (keyof UpdateActivityAction["changes"])[]) {
    let to = changes[key];
    if (key === "confirmed") {
      out.push(to ? "mark confirmed" : "mark unconfirmed");
    } else if (key === "time_label") {
      let from = previous?.time_label;
      out.push(from ? `${from} → ${to}` : `time ${to}`);
    } else if (key === "title") {
      out.push(`rename to “${to}”`);
    } else if (key === "location") {
      out.push(`location: ${to}`);
    } else if (key === "cost") {
      out.push(`cost: ${to}`);
    } else if (key === "confirmed_note") {
      out.push(`note: ${to}`);
    }
  }
  return out;
}

/** Resolve a revise_day proposal into a card-ready before/after view. */
export function summarizeDayRevision(
  action: ReviseDayAction,
  itinerary: TripItinerary,
): DayRevisionView {
  let day = itinerary.days.find((d) => d.day.day_number === action.day_number)?.day ?? null;

  let titleChange =
    action.title !== undefined && action.title !== (day?.title ?? "")
      ? { from: day?.title ?? "", to: action.title }
      : null;
  let dateChange =
    action.date !== undefined && day && action.date !== day.date
      ? { from: day.date, to: action.date }
      : null;

  let ops: DayRevisionOpView[] = action.ops.map((op) => {
    if (op.op === "add") {
      let meta = [op.time_label, op.location, op.cost].filter(Boolean).join(" · ") || null;
      return { kind: "add", title: op.title, meta };
    }
    let found = findActivity(itinerary, op.activity_id);
    let name = found ? found.activity.title : "an activity";
    if (op.op === "update") {
      return { kind: "update", name, changes: describeChanges(op.changes, found?.activity) };
    }
    return { kind: "remove", name, meta: found?.activity.time_label ?? null };
  });

  return {
    dayNumber: action.day_number,
    summary: action.summary?.trim() || null,
    titleChange,
    dateChange,
    ops,
  };
}

/** One human-readable line for a confirmation card. */
export function describeAction(
  action: AIAction,
  itinerary: TripItinerary,
  checklists: GroupedChecklists,
): string {
  if (action.type === "revise_day") {
    let n = action.ops.length;
    let count = `${n} ${n === 1 ? "change" : "changes"}`;
    return `Revise Day ${action.day_number} — ${count}`;
  }
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
  if (action.type === "add_item") {
    let found = findChecklist(checklists, action.checklist_id);
    let where = found ? ` to ${found.checklist.title}` : "";
    return `Add “${action.label}”${where}`;
  }
  if (action.type === "edit_item") {
    let found = findItem(checklists, action.item_id);
    let name = found ? found.item.label : "a checklist item";
    return `Rename “${name}” to “${action.label}”`;
  }
  if (action.type === "remove_item") {
    let found = findItem(checklists, action.item_id);
    let name = found ? found.item.label : "a checklist item";
    return `Remove “${name}”`;
  }
  let found = findItem(checklists, action.item_id);
  let label = found ? found.item.label : "a checklist item";
  return action.done ? `Check off “${label}”` : `Uncheck “${label}”`;
}

/** Append one line to the trip's activity feed (#41). */
async function feed(
  supabase: GoodtripClient,
  tripId: UUID,
  actorId: UUID,
  verb: string,
  target: string,
): Promise<void> {
  let { error } = await supabase
    .from("activity_feed")
    .insert({ trip_id: tripId, actor_id: actorId, verb, target });
  if (error) throw error;
}

/**
 * Execute a confirmed action through RLS as the signed-in member, record it on
 * the activity feed (#41), and return the change needed to reverse it (Undo).
 */
export async function applyAction(
  supabase: GoodtripClient,
  tripId: UUID,
  me: Profile,
  action: AIAction,
  itinerary: TripItinerary,
  checklists: GroupedChecklists,
): Promise<AppliedChange> {
  if (action.type === "add_activity") {
    let dayEntry = itinerary.days.find((d) => d.day.day_number === action.day_number);
    if (!dayEntry) throw new Error(`Day ${action.day_number} is not on this trip`);
    let position = dayEntry.activities.length
      ? Math.max(...dayEntry.activities.map((a) => a.position)) + 1
      : 0;
    let { data, error } = await supabase
      .from("activities")
      .insert({
        trip_id: tripId,
        day_id: dayEntry.day.id,
        position,
        title: action.title,
        time_label: action.time_label ?? null,
        location: action.location ?? null,
        cost: action.cost ?? null,
        created_by: me.id,
      })
      .select("id")
      .single();
    if (error) throw error;
    if (!data) throw new Error("Activity was not created");
    await feed(supabase, tripId, me.id, "added", `${action.title} to Day ${action.day_number}`);
    return {
      kind: "added_activity",
      activityId: data.id,
      title: action.title,
      dayNumber: action.day_number,
    };
  }

  if (action.type === "update_activity") {
    let found = findActivity(itinerary, action.activity_id);
    // Snapshot the pre-edit value of every field this change touches, so Undo
    // can restore exactly what was there before.
    let previous: UpdateActivityAction["changes"] = {};
    if (found) {
      for (let key of Object.keys(action.changes) as (keyof UpdateActivityAction["changes"])[]) {
        (previous as Record<string, unknown>)[key] = found.activity[key];
      }
    }
    let { data, error } = await supabase
      .from("activities")
      .update(action.changes)
      .eq("id", action.activity_id)
      .select()
      .single();
    if (error) throw error;
    await feed(supabase, tripId, me.id, "updated", data?.title ?? "an activity");
    return {
      kind: "updated_activity",
      activityId: action.activity_id,
      title: data?.title ?? found?.activity.title ?? "an activity",
      previous,
    };
  }

  if (action.type === "add_item") {
    let list = findChecklist(checklists, action.checklist_id);
    let position = nextItemPosition(list?.items ?? []);
    let { data, error } = await supabase
      .from("checklist_items")
      .insert({
        trip_id: tripId,
        checklist_id: action.checklist_id,
        label: action.label,
        position,
      })
      .select("id")
      .single();
    if (error) throw error;
    if (!data) throw new Error("Checklist item was not created");
    let title = list?.checklist.title ?? "a checklist";
    await feed(supabase, tripId, me.id, "added", `${action.label} to ${title}`);
    return { kind: "added_item", itemId: data.id, label: action.label, checklistTitle: title };
  }

  if (action.type === "edit_item") {
    let found = findItem(checklists, action.item_id);
    let previousLabel = found?.item.label ?? "";
    let { data, error } = await supabase
      .from("checklist_items")
      .update({ label: action.label })
      .eq("id", action.item_id)
      .select()
      .single();
    if (error) throw error;
    await feed(supabase, tripId, me.id, "renamed", data?.label ?? action.label);
    return { kind: "edited_item", itemId: action.item_id, label: action.label, previousLabel };
  }

  if (action.type === "remove_item") {
    let found = findItem(checklists, action.item_id);
    if (!found) throw new Error("That checklist item is no longer here");
    let { error } = await supabase.from("checklist_items").delete().eq("id", action.item_id);
    if (error) throw error;
    await feed(supabase, tripId, me.id, "removed", found.item.label);
    return { kind: "removed_item", item: found.item };
  }

  if (action.type === "revise_day") {
    let dayEntry = itinerary.days.find((d) => d.day.day_number === action.day_number);
    if (!dayEntry) throw new Error(`Day ${action.day_number} is not on this trip`);

    // Day-level re-title / re-date: snapshot only the fields that actually
    // change, so Undo restores exactly what was there before.
    let dayChanges: { title?: string; date?: ISODate } = {};
    let previousDay: { title?: string; date?: ISODate } = {};
    if (action.title !== undefined && action.title !== dayEntry.day.title) {
      dayChanges.title = action.title;
      previousDay.title = dayEntry.day.title;
    }
    if (action.date !== undefined && action.date !== dayEntry.day.date) {
      dayChanges.date = action.date;
      previousDay.date = dayEntry.day.date;
    }
    if (Object.keys(dayChanges).length > 0) {
      let { error } = await supabase.from("days").update(dayChanges).eq("id", dayEntry.day.id);
      if (error) throw error;
    }

    // Each op runs in turn, recording its reversal so the whole revision undoes
    // as one unit. New activities append past the current tail.
    let position = dayEntry.activities.length
      ? Math.max(...dayEntry.activities.map((a) => a.position)) + 1
      : 0;
    let steps: RevisedDayStep[] = [];
    for (let op of action.ops) {
      if (op.op === "add") {
        let { data, error } = await supabase
          .from("activities")
          .insert({
            trip_id: tripId,
            day_id: dayEntry.day.id,
            position: position++,
            title: op.title,
            time_label: op.time_label ?? null,
            location: op.location ?? null,
            cost: op.cost ?? null,
            created_by: me.id,
          })
          .select("id")
          .single();
        if (error) throw error;
        if (!data) throw new Error("Activity was not created");
        steps.push({ op: "added", activityId: data.id });
      } else if (op.op === "update") {
        let found = findActivity(itinerary, op.activity_id);
        let previous: UpdateActivityAction["changes"] = {};
        if (found) {
          for (let key of Object.keys(op.changes) as (keyof UpdateActivityAction["changes"])[]) {
            (previous as Record<string, unknown>)[key] = found.activity[key];
          }
        }
        let { error } = await supabase
          .from("activities")
          .update(op.changes)
          .eq("id", op.activity_id);
        if (error) throw error;
        steps.push({ op: "updated", activityId: op.activity_id, previous });
      } else {
        let found = findActivity(itinerary, op.activity_id);
        if (!found) throw new Error("That activity is no longer on this day");
        let { error } = await supabase.from("activities").delete().eq("id", op.activity_id);
        if (error) throw error;
        steps.push({ op: "removed", activity: found.activity });
      }
    }

    let label = `Day ${action.day_number}${action.title ? ` — ${action.title}` : ""}`;
    await feed(supabase, tripId, me.id, "revised", label);
    return {
      kind: "revised_day",
      dayId: dayEntry.day.id,
      dayNumber: action.day_number,
      label,
      previousDay,
      steps,
    };
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
  await feed(
    supabase,
    tripId,
    me.id,
    action.done ? "checked off" : "unchecked",
    data?.label ?? "an item",
  );
  return {
    kind: "checked_item",
    itemId: action.item_id,
    label: data?.label ?? "an item",
    done: action.done,
  };
}

/** Reverse a previously-applied change and note the reversal on the feed. */
export async function undoChange(
  supabase: GoodtripClient,
  tripId: UUID,
  me: Profile,
  change: AppliedChange,
): Promise<void> {
  if (change.kind === "added_activity") {
    let { error } = await supabase.from("activities").delete().eq("id", change.activityId);
    if (error) throw error;
    await feed(supabase, tripId, me.id, "removed", `${change.title} from Day ${change.dayNumber}`);
    return;
  }

  if (change.kind === "updated_activity") {
    let { error } = await supabase
      .from("activities")
      .update(change.previous)
      .eq("id", change.activityId);
    if (error) throw error;
    await feed(supabase, tripId, me.id, "reverted", change.title);
    return;
  }

  if (change.kind === "added_item") {
    let { error } = await supabase.from("checklist_items").delete().eq("id", change.itemId);
    if (error) throw error;
    await feed(supabase, tripId, me.id, "removed", `${change.label} from ${change.checklistTitle}`);
    return;
  }

  if (change.kind === "edited_item") {
    let { error } = await supabase
      .from("checklist_items")
      .update({ label: change.previousLabel })
      .eq("id", change.itemId);
    if (error) throw error;
    await feed(supabase, tripId, me.id, "renamed", change.previousLabel);
    return;
  }

  if (change.kind === "removed_item") {
    // Re-create the deleted row exactly — same id, so any lingering reference
    // (and its checked-off state) comes back intact.
    let { id, trip_id, checklist_id, label, position, done, done_by, done_at } = change.item;
    let { error } = await supabase
      .from("checklist_items")
      .insert({ id, trip_id, checklist_id, label, position, done, done_by, done_at });
    if (error) throw error;
    await feed(supabase, tripId, me.id, "added", label);
    return;
  }

  if (change.kind === "revised_day") {
    // Reverse each op: delete added rows, restore updated fields, and re-create
    // removed activities exactly (same id, so any reference survives).
    for (let step of change.steps) {
      if (step.op === "added") {
        let { error } = await supabase.from("activities").delete().eq("id", step.activityId);
        if (error) throw error;
      } else if (step.op === "updated") {
        let { error } = await supabase
          .from("activities")
          .update(step.previous)
          .eq("id", step.activityId);
        if (error) throw error;
      } else {
        let { error } = await supabase.from("activities").insert(step.activity);
        if (error) throw error;
      }
    }
    if (Object.keys(change.previousDay).length > 0) {
      let { error } = await supabase.from("days").update(change.previousDay).eq("id", change.dayId);
      if (error) throw error;
    }
    await feed(supabase, tripId, me.id, "reverted", change.label);
    return;
  }

  // Reverse a check by flipping `done` back; clear the doer when un-checking.
  let restored = change.done
    ? { done: false, done_by: null, done_at: null }
    : { done: true, done_by: me.id, done_at: new Date().toISOString() };
  let { error } = await supabase.from("checklist_items").update(restored).eq("id", change.itemId);
  if (error) throw error;
  await feed(supabase, tripId, me.id, change.done ? "unchecked" : "checked off", change.label);
}
