"use client";

import { useRef, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import type { ChecklistItem, Profile, UUID } from "@goodtrip/shared";
import { doneCount, type ChecklistWithItems } from "@/lib/checklists";
import { Avatar } from "@/components/trip/avatar";

/* The controls a checklist exposes to a human editing it directly. Every one of
   these is also reachable through Ask (#40/#41) — the panel confirms an AI
   proposal, this UI is the hands-on equivalent. All are optional so a caller can
   render a read-only list by omitting them. */
export type ChecklistControls = {
  onAddItem?: (checklist: ChecklistWithItems, label: string) => void;
  onEditItem?: (item: ChecklistItem, label: string) => void;
  onRemoveItem?: (item: ChecklistItem) => void;
};

function ItemRow({
  item,
  doneBy,
  onToggle,
  onEditItem,
  onRemoveItem,
}: {
  item: ChecklistItem;
  doneBy: Profile | undefined;
  onToggle: (item: ChecklistItem) => void;
} & Pick<ChecklistControls, "onEditItem" | "onRemoveItem">) {
  let [editing, setEditing] = useState(false);
  let [draft, setDraft] = useState(item.label);
  let editable = Boolean(onEditItem || onRemoveItem);
  // Enter submits the form *and* blurs the field, and Escape's setDraft is async
  // — both would fire the handler twice. This latch makes each edit session
  // commit or cancel exactly once (no duplicate writes or feed entries).
  let settled = useRef(false);

  function beginEdit() {
    settled.current = false;
    setDraft(item.label);
    setEditing(true);
  }

  function commitEdit() {
    if (settled.current) return;
    settled.current = true;
    setEditing(false);
    let next = draft.trim();
    if (next && next !== item.label) onEditItem?.(item, next);
    else setDraft(item.label);
  }

  function cancelEdit() {
    if (settled.current) return;
    settled.current = true;
    setEditing(false);
    setDraft(item.label);
  }

  if (editing) {
    return (
      <li>
        <form
          className="flex items-center gap-2 py-2"
          onSubmit={(event) => {
            event.preventDefault();
            commitEdit();
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitEdit}
            onKeyDown={(event) => {
              if (event.key === "Escape") cancelEdit();
            }}
            aria-label={`Rename “${item.label}”`}
            className="min-w-0 flex-1 rounded-md border border-gold/40 bg-ink-800/60 px-2.5 py-1.5 text-sm outline-none focus:border-gold"
          />
          <button
            type="submit"
            aria-label="Save"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gold text-ink transition-colors hover:bg-gold-bright"
          >
            <Check className="h-3.5 w-3.5" aria-hidden />
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="group flex items-start gap-1">
      <button
        type="button"
        role="checkbox"
        aria-checked={item.done}
        onClick={() => onToggle(item)}
        className="flex min-w-0 flex-1 items-start gap-3 py-2.5 text-left"
      >
        <span
          aria-hidden
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
            item.done ? "border-gold bg-gold text-ink" : "border-cream/30"
          }`}
        >
          {item.done && <Check className="h-3.5 w-3.5" />}
        </span>
        <span
          className={`min-w-0 flex-1 text-sm leading-snug ${
            item.done ? "text-cream-muted line-through decoration-cream/30" : ""
          }`}
        >
          {item.label}
        </span>
        {item.done && doneBy && (
          <span className="flex shrink-0 items-center gap-1.5 pt-0.5">
            <Avatar profile={doneBy} size="h-4 w-4 text-[8px]" />
            <span className="font-mono text-[10px] uppercase tracking-wide text-cream-muted">
              {doneBy.display_name}
            </span>
          </span>
        )}
      </button>

      {editable && (
        <span className="flex shrink-0 items-center gap-0.5 pt-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          {onEditItem && (
            <button
              type="button"
              onClick={beginEdit}
              aria-label={`Rename “${item.label}”`}
              className="flex h-6 w-6 items-center justify-center rounded-md text-cream-muted transition-colors hover:bg-cream/10 hover:text-cream"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
          {onRemoveItem && (
            <button
              type="button"
              onClick={() => onRemoveItem(item)}
              aria-label={`Remove “${item.label}”`}
              className="flex h-6 w-6 items-center justify-center rounded-md text-cream-muted transition-colors hover:bg-flag/15 hover:text-flag"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </span>
      )}
    </li>
  );
}

function AddItemRow({
  entry,
  onAddItem,
}: {
  entry: ChecklistWithItems;
  onAddItem: NonNullable<ChecklistControls["onAddItem"]>;
}) {
  let [label, setLabel] = useState("");

  function submit() {
    let next = label.trim();
    if (!next) return;
    setLabel("");
    onAddItem(entry, next);
  }

  return (
    <form
      className="flex items-center gap-2 pt-2"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <span
        aria-hidden
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-dashed border-cream/25 text-cream-muted"
      >
        <Plus className="h-3 w-3" />
      </span>
      <input
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder="Add an item…"
        aria-label={`Add an item to ${entry.checklist.title}`}
        className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-cream-muted/50"
      />
      {label.trim() && (
        <button
          type="submit"
          aria-label="Add item"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gold text-ink transition-colors hover:bg-gold-bright"
        >
          <Check className="h-3.5 w-3.5" aria-hidden />
        </button>
      )}
    </form>
  );
}

export function ChecklistSection({
  entry,
  profilesById,
  onToggle,
  heading = "h3",
  controls,
}: {
  entry: ChecklistWithItems;
  profilesById: Map<UUID, Profile>;
  onToggle: (item: ChecklistItem) => void;
  heading?: "h3" | "summary";
  controls?: ChecklistControls;
}) {
  let { done, total } = doneCount(entry);
  let title = (
    <>
      <span className="text-sm font-medium">{entry.checklist.title}</span>
      <span className="ml-auto font-mono text-[11px] text-cream-muted">
        {done}/{total}
      </span>
    </>
  );

  let body = (
    <>
      <ul className="divide-y divide-cream/[0.06]">
        {entry.items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            doneBy={item.done_by ? profilesById.get(item.done_by) : undefined}
            onToggle={onToggle}
            onEditItem={controls?.onEditItem}
            onRemoveItem={controls?.onRemoveItem}
          />
        ))}
      </ul>
      {controls?.onAddItem && <AddItemRow entry={entry} onAddItem={controls.onAddItem} />}
    </>
  );

  if (heading === "summary") {
    return (
      <details className="group rounded-lg border border-cream/10 px-4 py-2">
        <summary className="flex cursor-pointer list-none items-baseline gap-3 py-1 [&::-webkit-details-marker]:hidden">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70 transition-transform group-open:rotate-90">
            ›
          </span>
          {title}
        </summary>
        {body}
      </details>
    );
  }

  return (
    <section className="rounded-xl border border-cream/10 bg-ink-800/40 px-5 py-4">
      <h3 className="flex items-baseline gap-3 border-b border-gold/15 pb-2">{title}</h3>
      {body}
    </section>
  );
}
