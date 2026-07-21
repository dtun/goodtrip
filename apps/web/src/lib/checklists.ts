import type { Checklist, ChecklistItem, ChecklistItemInsert, UUID } from "@goodtrip/shared";
import type { GoodtripClient } from "@/lib/supabase";

export type ChecklistWithItems = {
  checklist: Checklist;
  items: ChecklistItem[];
};

export type GroupedChecklists = {
  /** Trip-level lists (day_id null), in position order. */
  global: ChecklistWithItems[];
  /** Per-day lists keyed by day_id, each in position order. */
  byDay: Map<UUID, ChecklistWithItems[]>;
};

let byPosition = <T extends { position: number; id: string }>(a: T, b: T) =>
  a.position - b.position || a.id.localeCompare(b.id);

export function groupChecklists(
  checklists: Checklist[],
  items: ChecklistItem[],
): GroupedChecklists {
  let itemsByChecklist = new Map<UUID, ChecklistItem[]>();
  for (let item of items) {
    let list = itemsByChecklist.get(item.checklist_id);
    if (!list) {
      list = [];
      itemsByChecklist.set(item.checklist_id, list);
    }
    list.push(item);
  }

  let withItems = (checklist: Checklist): ChecklistWithItems => ({
    checklist,
    items: (itemsByChecklist.get(checklist.id) ?? []).slice().sort(byPosition),
  });

  let global: ChecklistWithItems[] = [];
  let byDay = new Map<UUID, ChecklistWithItems[]>();
  for (let checklist of [...checklists].sort(byPosition)) {
    if (checklist.day_id === null) {
      global.push(withItems(checklist));
    } else {
      let list = byDay.get(checklist.day_id);
      if (!list) {
        list = [];
        byDay.set(checklist.day_id, list);
      }
      list.push(withItems(checklist));
    }
  }
  return { global, byDay };
}

/** Replace an item wherever it lives; used by optimistic and realtime updates. */
export function replaceItem(grouped: GroupedChecklists, updated: ChecklistItem): GroupedChecklists {
  let swap = (lists: ChecklistWithItems[]) =>
    lists.map((entry) =>
      entry.checklist.id === updated.checklist_id
        ? {
            ...entry,
            items: entry.items.map((item) => (item.id === updated.id ? updated : item)),
          }
        : entry,
    );

  let byDay = new Map<UUID, ChecklistWithItems[]>();
  grouped.byDay.forEach((lists, dayId) => byDay.set(dayId, swap(lists)));
  return { global: swap(grouped.global), byDay };
}

/**
 * Insert an item into its checklist, kept in position order. Idempotent by id:
 * an item already present is replaced, so a client's own optimistic insert and
 * the realtime INSERT that echoes it don't double up.
 */
export function insertItem(grouped: GroupedChecklists, added: ChecklistItem): GroupedChecklists {
  let add = (lists: ChecklistWithItems[]) =>
    lists.map((entry) => {
      if (entry.checklist.id !== added.checklist_id) return entry;
      let items = entry.items.some((item) => item.id === added.id)
        ? entry.items.map((item) => (item.id === added.id ? added : item))
        : [...entry.items, added];
      return { ...entry, items: items.slice().sort(byPosition) };
    });

  let byDay = new Map<UUID, ChecklistWithItems[]>();
  grouped.byDay.forEach((lists, dayId) => byDay.set(dayId, add(lists)));
  return { global: add(grouped.global), byDay };
}

/** Drop an item by id wherever it lives; used by optimistic and realtime deletes. */
export function removeItemFrom(grouped: GroupedChecklists, itemId: UUID): GroupedChecklists {
  let drop = (lists: ChecklistWithItems[]) =>
    lists.map((entry) => ({
      ...entry,
      items: entry.items.filter((item) => item.id !== itemId),
    }));

  let byDay = new Map<UUID, ChecklistWithItems[]>();
  grouped.byDay.forEach((lists, dayId) => byDay.set(dayId, drop(lists)));
  return { global: drop(grouped.global), byDay };
}

/** The position a new item should take at the end of a list. */
export function nextItemPosition(items: ChecklistItem[]): number {
  return items.length ? Math.max(...items.map((item) => item.position)) + 1 : 0;
}

export function doneCount(entry: ChecklistWithItems): { done: number; total: number } {
  return {
    done: entry.items.filter((item) => item.done).length,
    total: entry.items.length,
  };
}

export async function fetchTripChecklists(
  supabase: GoodtripClient,
  tripId: string,
): Promise<GroupedChecklists> {
  let [checklistsResult, itemsResult] = await Promise.all([
    supabase.from("checklists").select("*").eq("trip_id", tripId),
    supabase.from("checklist_items").select("*").eq("trip_id", tripId),
  ]);
  if (checklistsResult.error) throw checklistsResult.error;
  if (itemsResult.error) throw itemsResult.error;
  return groupChecklists(checklistsResult.data ?? [], itemsResult.data ?? []);
}

/**
 * Persist a toggle: checking records who and when; unchecking clears both.
 * Returns the updated row so callers can reconcile optimistic state.
 */
export async function persistToggle(
  supabase: GoodtripClient,
  item: ChecklistItem,
  userId: UUID,
): Promise<ChecklistItem> {
  let next = item.done
    ? { done: false, done_by: null, done_at: null }
    : { done: true, done_by: userId, done_at: new Date().toISOString() };

  let { data, error } = await supabase
    .from("checklist_items")
    .update(next)
    .eq("id", item.id)
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error("Checklist item not found");
  return data;
}

/**
 * Add a new (unchecked) item to a checklist and return the inserted row.
 * An optional `id` lets the caller mint the UUID up front so an optimistic row
 * and its realtime echo share one id (both dedupe through insertItem).
 */
export async function addItem(
  supabase: GoodtripClient,
  tripId: UUID,
  checklistId: UUID,
  label: string,
  position: number,
  id?: UUID,
): Promise<ChecklistItem> {
  let row: ChecklistItemInsert = { trip_id: tripId, checklist_id: checklistId, label, position };
  if (id) row.id = id;
  let { data, error } = await supabase.from("checklist_items").insert(row).select().single();
  if (error) throw error;
  if (!data) throw new Error("Checklist item was not created");
  return data;
}

/** Rename an item and return the updated row. */
export async function editItemLabel(
  supabase: GoodtripClient,
  itemId: UUID,
  label: string,
): Promise<ChecklistItem> {
  let { data, error } = await supabase
    .from("checklist_items")
    .update({ label })
    .eq("id", itemId)
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error("Checklist item not found");
  return data;
}

/** Delete an item from a checklist. */
export async function removeItem(supabase: GoodtripClient, itemId: UUID): Promise<void> {
  let { error } = await supabase.from("checklist_items").delete().eq("id", itemId);
  if (error) throw error;
}
